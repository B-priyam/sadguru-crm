import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CRMProvider } from "@/context/CRMContext";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/queryProvider";
import { AuthProvider } from "@/context/AuthContext";
// import { MetaPixel } from "@/components/MetaPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sadguru CRM",
  description: "Sadguru CRM Progressive Web App",
  applicationName: "Sadguru CRM",

  manifest: "/manifest.webmanifest",

  appleWebApp: {
    capable: true,
    title: "Sadguru CRM",
    statusBarStyle: "default",
  },

  icons: {
    icon: "/sd-logo-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",

  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID!;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster />
        <QueryProvider>
          <AuthProvider>
            <CRMProvider>
              {children}
              {/* <MetaPixel pixelId={pixelId} /> */}
            </CRMProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
