import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://converto.dev"),
  title: {
    default: "Free Online File Converter (50+ Formats) | Converto",
    template: "%s | Converto",
  },
  description:
    "Convert, compress, and transform files online with 50+ professional tools—CSV, Excel, PDF, JSON, images, audio, and more. Fast, secure, and no sign‑up required.",
  keywords: [
    "file converter",
    "online converter",
    "csv to json",
    "csv to excel",
    "json formatter",
    "excel to pdf",
    "word to pdf",
    "image to pdf",
  ],
  applicationName: "Converto",
  authors: [{ name: "Converto" }],
  creator: "Converto",
  publisher: "Converto",
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: "https://converto.dev/",
    siteName: "Converto",
    title: "Converto - Cloud File Converter & Generator",
    description:
      "Convert, compress, and transform files instantly. 50+ professional tools, no registration required.",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "Converto - Online File Converter",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@converto",
    creator: "@converto",
    title: "Converto - Cloud File Converter & Generator",
    description:
      "Convert, compress, and transform files instantly. 50+ professional tools, no registration required.",
    images: ["/globe.svg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  category: "utilities",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': "large",
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:updated_time" content={new Date().toISOString()} />
        <Script id="ld-org" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Converto",
            url: "https://converto.dev",
            logo: "https://converto.dev/globe.svg",
            sameAs: [
              "https://twitter.com/converto",
              "https://github.com/converto",
              "https://www.linkedin.com/company/converto"
            ]
          })}
        </Script>
        <Script id="ld-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Converto",
            url: "https://converto.dev",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://converto.dev/?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </Script>
      </head>
      <body
        className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
