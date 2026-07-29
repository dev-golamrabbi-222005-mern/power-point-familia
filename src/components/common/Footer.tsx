import React from "react";
import Link from "next/link";
import { Logo } from "../Logo";

export function Footer() {
  return (
    <footer className="bg-[#070707] border-t border-zinc-800/80 py-8 mt-16 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center gap-6 text-xs font-medium text-zinc-400">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            Home
          </Link>
          <Link
            href="/about"
            className="hover:text-emerald-400 transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hover:text-emerald-400 transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-emerald-400 transition-colors"
          >
            Dashboard
          </Link>
        </div>
        <p className="text-xs text-zinc-500 font-mono">
          © {new Date().getFullYear()} Power Point Familia | All rights reserved
          |Developed by{" "}
          <a
            href="https://dev-golamrabbi-portfolio.web.app/"
            className="text-emerald-400 hover:text-emerald-500 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Md. Golam Rabbi
          </a>
        </p>
      </div>
    </footer>
  );
}
