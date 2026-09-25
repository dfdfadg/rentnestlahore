"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { SmartImage } from "../ui/SmartImage";

type Img = { url: string; alt: string };

export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (full && !dlg.open) dlg.showModal();
    if (!full && dlg.open) dlg.close();
  }, [full]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full, go]);

  const swipe = {
    onTouchStart: (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchX.current == null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      touchX.current = null;
    },
  };

  if (count === 0) {
    return <div className="grid aspect-[16/10] place-items-center rounded-2xl bg-ink-100 text-ink-500">Photos coming soon</div>;
  }

  const current = images[index];

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-ink-100" {...swipe}>
        <button type="button" className="relative block aspect-[16/10] w-full cursor-zoom-in" onClick={() => setFull(true)} aria-label="Open fullscreen gallery">
          <SmartImage
            key={current.url}
            src={current.url}
            alt={current.alt || `${title} — photo ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 760px, 100vw"
            className="object-cover"
          />
        </button>
        {count > 1 && (
          <>
            <NavButton side="left" onClick={() => go(-1)} />
            <NavButton side="right" onClick={() => go(1)} />
          </>
        )}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-semibold text-white">
          {index + 1} / {count}
        </div>
        <button type="button" onClick={() => setFull(true)} className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink-800 shadow">
          <Expand className="h-3.5 w-3.5" /> View all photos
        </button>
      </div>

      {count > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Photo thumbnails">
          {images.map((img, i) => (
            <li key={img.url + i} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`relative block h-16 w-24 overflow-hidden rounded-lg ring-2 transition sm:h-20 sm:w-28 ${i === index ? "ring-brick-500" : "ring-transparent opacity-80 hover:opacity-100"}`}
              >
                <SmartImage src={img.url} alt="" fill sizes="112px" className="object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setFull(false)}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink-950 p-0 text-white backdrop:bg-ink-950"
        aria-label={`${title} — photo gallery`}
      >
        {full && (
          <div className="relative flex h-full flex-col" {...swipe}>
            <div className="flex items-center justify-between px-4 py-3">
              <p className="truncate pr-4 text-sm text-ink-200">{title} · {index + 1} / {count}</p>
              <button type="button" onClick={() => setFull(false)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Close gallery">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="relative flex-1">
              <SmartImage key={`full-${current.url}`} src={current.url} alt={current.alt || `${title} — photo ${index + 1}`} fill sizes="100vw" className="object-contain" />
              {count > 1 && (
                <>
                  <NavButton side="left" onClick={() => go(-1)} dark />
                  <NavButton side="right" onClick={() => go(1)} dark />
                </>
              )}
            </div>
            <p className="px-4 py-3 text-center text-sm text-ink-300">{current.alt}</p>
          </div>
        )}
      </dialog>
    </div>
  );
}

function NavButton({ side, onClick, dark = false }: { side: "left" | "right"; onClick: () => void; dark?: boolean }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full shadow ${side === "left" ? "left-3" : "right-3"} ${
        dark ? "bg-white/15 text-white hover:bg-white/25" : "bg-white/95 text-ink-900 hover:bg-white"
      }`}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}
