"use client";

import Link from "next/link";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="GPSpark Logo" className="w-6 h-6" />
            <div>
              <span className="text-sm font-bold text-slate-900">GPSpark</span>
              <span className="text-slate-500 text-xs ml-2">FCAI-CU {currentYear}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
            <Link href="/about" className="hover:text-slate-900">About</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms and Conditions</Link>
            <Link href="/support" className="hover:text-slate-900">Contact Support</Link>
          </div>
          
          <div className="text-center md:text-right">
            <span className="text-xs text-slate-500">© {currentYear} GPSpark FCAI-CU. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
