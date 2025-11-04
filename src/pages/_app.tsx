import { AppType } from "next/app";
import { Geist, Geist_Mono } from "next/font/google";

import { trpc } from "@/lib/trpc";

import "./globals.css";
import BaseLayout from "@/components/base-layout";
import { AuthProvider } from "@/contexts/auth-context";

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
    <AuthProvider>
      <BaseLayout>
        <Component {...pageProps} />
      </BaseLayout>
    </AuthProvider>
  );
};
export default trpc.withTRPC(MyApp);

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }
