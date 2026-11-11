"use client";
import { Printer } from "lucide-react";
export function PrintButton() {
  return <button onClick={() => window.print()} className="flex h-11 items-center gap-2 rounded-full bg-[#16110f] px-5 text-sm font-semibold text-white"><Printer size={16} /> Print / Save PDF</button>;
}
