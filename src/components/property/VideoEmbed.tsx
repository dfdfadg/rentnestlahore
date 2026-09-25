export function videoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const src = videoEmbedUrl(url);
  if (!src || !/^[\w:/.?=-]+$/.test(src)) return null;
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink-900">
      <iframe src={src} title={`Video tour — ${title}`} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
    </div>
  );
}
