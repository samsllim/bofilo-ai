import Script from "next/script";
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
        <Script strategy="afterInteractive" id="lhc-script">
            {`
              var LHC_API = LHC_API||{};
              LHC_API.args = {
                mode:'widget',
                lhc_base_url:'//lhc.bofilo.com/index.php/',
                wheight:450,
                wwidth:350,
                pheight:520,
                pwidth:500,
                leaveamessage:true,
                check_messages:false
              };
              (function() {
                var po = document.createElement('script');
                po.type = 'text/javascript';
                po.setAttribute('crossorigin','anonymous');
                po.async = true;
                var date = new Date();
                po.src = '//lhc.bofilo.com/design/defaulttheme/js/widgetv2/index.js?'+(""+date.getFullYear() + date.getMonth() + date.getDate());
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(po, s);
              })();
            `}
          </Script>
      </body>
    </html>
    </ClerkProvider>
  );
}
