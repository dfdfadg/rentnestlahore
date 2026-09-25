"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-PK">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#fcfbf8", color: "#0f1d31" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28 }}>RentNest Lahore is temporarily unavailable</h1>
          <p>We&apos;re sorry — something went wrong. Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, border: 0, background: "#b8481f", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
