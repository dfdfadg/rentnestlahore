import { requireAdmin } from "@/lib/auth";
import { CsvImportForm } from "@/components/admin/CsvImportForm";
import { CSV_TEMPLATE_HEADER } from "@/lib/csv-import";

export default async function AdminImport() {
  await requireAdmin();
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-extrabold">CSV import</h1>
      <p className="mt-2 text-sm text-ink-600">
        Import authorised rental listings in bulk. Only import listings you own, are authorised to publish, or have licensed.
        Never import data scraped from other property portals.
      </p>
      <div className="mt-4 rounded-xl bg-ink-50 p-4 text-xs text-ink-700">
        <p className="font-semibold">Columns</p>
        <code className="mt-1 block break-all font-mono">{CSV_TEMPLATE_HEADER}</code>
        <p className="mt-2">Optional: <code className="font-mono">furnished, condition, amenities, security_deposit</code>. Separate multiple images/amenities with <code>|</code>. Locations and property types can be names or slugs.</p>
        <a href="/templates/rentnest-import-template.csv" download className="mt-2 inline-block font-semibold text-brick-700 underline">Download full template</a>
      </div>
      <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
        <p className="font-semibold">Simple template for agents (Excel / Google Sheets)</p>
        <p className="mt-1">Only 12 columns: type, area, block, rent, size, unit, beds, baths, details, name, phone, photo links. Agents fill it in Excel or Google Sheets → <em>File → Download → CSV</em> → upload here. Details can be left empty. A description is created from the row&apos;s facts.</p>
        <p className="mt-1">Agent ko bolein: &ldquo;Is sheet mein har property ki ek line bhar dein&rdquo;: type (house/flat/upper portion/office…), area (Johar Town, DHA Phase 6…), kiraya, size.</p>
        <a href="/templates/rentnest-simple-template.csv" download className="mt-2 inline-block font-semibold text-emerald-800 underline">Download simple template</a>
      </div>
      <div className="mt-6"><CsvImportForm /></div>
    </div>
  );
}
