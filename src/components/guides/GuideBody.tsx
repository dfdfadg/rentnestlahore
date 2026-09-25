import Link from "next/link";
import { Fragment } from "react";
import type { GuideBlock } from "@/content/guides";
import { rentStatsByType } from "@/lib/stats";
import { descendantIds, getLocations, getPropertyTypes } from "@/lib/taxonomy";
import { formatNumber, formatPKR } from "@/lib/format";

/** Renders [text](/path/) links and **bold** from trusted, in-repo guide content. */
function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) {
      const href = m[2];
      parts.push(href.startsWith("/") ? <Link key={k++} href={href}>{m[1]}</Link> : <a key={k++} href={href} rel="noopener noreferrer">{m[1]}</a>);
    } else if (m[3]) parts.push(<strong key={k++}>{m[3]}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

async function StatsBlock({ kind }: { kind: "lahore-types" | "house-areas" }) {
  if (kind === "lahore-types") {
    const stats = await rentStatsByType();
    if (!stats.length) return <p className="text-sm text-ink-500">No active listings to calculate from yet.</p>;
    return (
      <StatsTable
        head={["Property type", "Active listings", "Median asking rent"]}
        rows={stats.map((s) => [<Link key="l" href={`/rent/${s.pluralSlug}/`}>{s.pluralName}</Link>, formatNumber(s.count), formatPKR(s.median)])}
      />
    );
  }
  const [locations, types] = await Promise.all([getLocations(), getPropertyTypes()]);
  const house = types.find((t) => t.slug === "house");
  if (!house) return null;
  const roots = locations.filter((l) => !l.parentId);
  const rows = (
    await Promise.all(
      roots.map(async (r) => {
        const s = (await rentStatsByType(descendantIds(r.id, locations), [house.id]))[0];
        return s && s.count >= 2 ? { r, s } : null;
      }),
    )
  )
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.s.median - a.s.median);
  if (!rows.length) return <p className="text-sm text-ink-500">Not enough active house listings per area yet.</p>;
  return (
    <StatsTable
      head={["Area", "Houses listed", "Median asking rent"]}
      rows={rows.map(({ r, s }) => [<Link key="l" href={`/rent/${r.slug}/`}>{r.name}</Link>, formatNumber(s.count), formatPKR(s.median)])}
    />
  );
}

function StatsTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="not-prose my-5 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className="px-4 py-3">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GuideBody({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="prose-rn">
      {blocks.map((b, i) => (
        <Fragment key={i}>
          {"h2" in b && <h2>{b.h2}</h2>}
          {"h3" in b && <h3>{b.h3}</h3>}
          {"p" in b && <p><Inline text={b.p} /></p>}
          {"ul" in b && <ul>{b.ul.map((li, j) => <li key={j}><Inline text={li} /></li>)}</ul>}
          {"ol" in b && <ol>{b.ol.map((li, j) => <li key={j}><Inline text={li} /></li>)}</ol>}
          {"stats" in b && <StatsBlock kind={b.stats} />}
          {"note" in b && <p className="rounded-xl bg-sand-100 p-4 text-sm text-ink-600 ring-1 ring-sand-200">{b.note}</p>}
        </Fragment>
      ))}
    </div>
  );
}
