import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the Provider component with SSR disabled to avoid hydration issues
const Provider = dynamic(() => import("./provider"), {
  ssr: true,
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Use 'swap' to prevent FOIT (Flash of Invisible Text)
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Grace Placement Portal",
  description: "Placement portal for Grace College of Engineering",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading application...</div>}>
          <Provider>
            {children}
          </Provider>
        </Suspense>
      </body>
    </html>
  );
}
