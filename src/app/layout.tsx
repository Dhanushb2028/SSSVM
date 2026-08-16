import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SSSVM — Sree Siva Shankar Vidya Mandir",
  description: "School management system for Sree Siva Shankar Vidya Mandir, K.R.M. Colony.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#123a8a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          // Runs before paint so the saved theme applies with no flash of the other theme.
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('sssvm-theme')==='classic'){document.documentElement.setAttribute('data-theme','classic')}}catch(e){}",
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
