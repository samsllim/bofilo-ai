import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner";

import {
  ClerkProvider,
} from '@clerk/nextjs'

import Kbar from "@/app/mail/components/kbar";

export const metadata: Metadata = {
  title: "Bofilo AI",
  description: "AI powered email app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
    <html lang="en" className={`${GeistSans.variable}`}>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <TRPCReactProvider>
            <Kbar>
              {children}
            </Kbar>
          </TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
