import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Viewport meta tag - prevents zoom on input focus */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" 
        />
        
        {/* Favicon links */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon1.png" />
        <link rel="icon" type="image/svg+xml" href="/icon0.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />

        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

