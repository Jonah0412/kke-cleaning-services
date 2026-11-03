import Script from 'next/script';

export default function KkeSitePage() {
  return (
    <>
      <div id="app">
        <div className="loading">Preparing the site…</div>
      </div>
      <Script src="/assets/app.js?v=20260825-15" type="module" strategy="afterInteractive" />
    </>
  );
}
