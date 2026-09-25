/**
 * Approximate location map (OpenStreetMap embed — no API key, no tracking scripts).
 * Coordinates are rounded (~500 m) and no pin is placed, so exact homes are never exposed.
 */
export function MapEmbed({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const rLat = Math.round(lat * 200) / 200;
  const rLng = Math.round(lng * 200) / 200;
  const d = 0.012;
  const bbox = [rLng - d, rLat - d * 0.8, rLng + d, rLat + d * 0.8].map((n) => n.toFixed(4)).join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  const link = `https://www.openstreetmap.org/?mlat=${rLat}&mlon=${rLng}#map=15/${rLat}/${rLng}`;
  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-ink-100 bg-ink-50">
        <iframe
          title={`Approximate location map — ${label}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full"
        />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brick-500 bg-brick-500/15" aria-hidden="true" />
      </div>
      <p className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-ink-500">
        <span>Approximate area only. The exact address is shared by the landlord or agent.</span>
        <a href={link} target="_blank" rel="noopener noreferrer" className="font-medium text-brick-700 hover:underline">Explore the neighbourhood ↗</a>
      </p>
    </div>
  );
}
