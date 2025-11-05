import { AppType } from "next/app";
import { Geist, Geist_Mono } from "next/font/google";

import { trpc } from "@/lib/trpc";

import "./globals.css";
import BaseLayout from "@/components/layout/base-layout";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <BaseLayout>
          <Component {...pageProps} />
        </BaseLayout>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default trpc.withTRPC(MyApp);