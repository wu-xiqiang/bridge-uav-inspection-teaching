import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "基于低空无人机的桥梁智能巡检教学系统",
  description: "面向高等职业教育的桥梁三维巡检教学平台",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
