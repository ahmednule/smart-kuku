import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../providers";
import { Toaster } from "react-hot-toast";
import { auth } from "@/auth";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import "@fortawesome/fontawesome-svg-core/styles.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import Footer from "@/components/page/home-page/Footer";
import Header from "@/components/ui/header/Header";
import ChatUI from "@/components/page/home-page/ChatUI";

config.autoAddCss = false;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartKuku",
  description:
    "SmartKuku is an autonomous poultry farm decision agent that continuously monitors flock health, feed, water, egg output, and environment to trigger timely, explainable actions for smallholder farmers.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Toaster />
          <Header />
          {children}
          {isLoggedIn && <ChatUI />}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
