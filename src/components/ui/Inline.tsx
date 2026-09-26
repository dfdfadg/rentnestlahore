import Link from "next/link";

/** Renders [text](/path/) links and **bold** from trusted, in-repo editorial content. */
export function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) {
      const href = m[2];
      parts.push(
        href.startsWith("/") ? (
          <Link key={k++} href={href}>{m[1]}</Link>
        ) : (
          <a key={k++} href={href} rel="noopener noreferrer">{m[1]}</a>
        ),
      );
    } else if (m[3]) parts.push(<strong key={k++}>{m[3]}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Plain text version (for JSON-LD / meta), stripping link and bold markup. */
export function plainText(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}
