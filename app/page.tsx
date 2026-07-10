import type { Metadata } from "next";
import { BridgeInspectionApp } from "@/components/BridgeInspectionApp";

export const metadata: Metadata = {
  title: "基于低空无人机的桥梁智能巡检教学系统",
  description: "桥梁三维认知、无人机航线规划与AI裂缝检测一体化教学平台",
};

export default function Home() {
  return <BridgeInspectionApp />;
}
