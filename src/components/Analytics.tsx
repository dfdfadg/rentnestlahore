import Script from "next/script";

/** Loads GTM and/or GA4 only when configured via environment variables. */
export function Analytics() {
  const gtm = process.env.NEXT_PUBLIC_GTM_ID;
  // GA4 property for rentnestlahore.pk (public ID). Can be overridden via env.
  const ga = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-Z40RJX8Q2H";
  const safe = (v: string) => /^[A-Z0-9-]+$/i.test(v);
  return (
    <>
      {gtm && safe(gtm) && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}
      {ga && safe(ga) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
    </>
  );
}
