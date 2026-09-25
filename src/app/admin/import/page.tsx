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
        <a href="/templates/rentnest-import-template.csv" download className="mt-2 inline-block font-semibold text-brick-700 underline">Download template</a>
      </div>
      <div className="mt-6"><CsvImportForm /></div>
    </div>
  );
}
