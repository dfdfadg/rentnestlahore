"use client";

import { useState } from "react";

/** A document template readers can copy or download as a .txt file. */
export function TemplateBox({ id, title, text, lang }: { id: string; title: string; text: string; lang?: "ur" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the text can still be selected manually */
    }
  };
  const download = () => {
    // BOM so Notepad/Word open Urdu text as UTF-8
    const blob = new Blob(["﻿", text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50 px-4 py-3">
        <p className="font-semibold text-ink-900">{title}</p>
        <div className="flex gap-2">
          <button type="button" onClick={copy} className="btn-outline min-h-9 px-3 py-1">
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button type="button" onClick={download} className="btn-primary min-h-9 px-3 py-1">
            Download
          </button>
        </div>
      </div>
      <pre
        id={id}
        lang={lang}
        dir={lang === "ur" ? "rtl" : undefined}
        className={`max-h-[32rem] overflow-auto whitespace-pre-wrap break-words p-4 text-ink-700 ${
          lang === "ur" ? "text-right font-sans text-base leading-9" : "font-mono text-[13px] leading-6"
        }`}
      >
        {text}
      </pre>
    </div>
  );
}
