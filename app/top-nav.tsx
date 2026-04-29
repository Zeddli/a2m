"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Renders global sticky navigation and a contextual back action.
export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {!isHomePage && (
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-blue-100 bg-white/80 px-2 py-1 text-sm text-zinc-700 hover:bg-white"
              aria-label="Go back"
            >
              ← Back
            </button>
          )}
          <Link href="/" className="font-semibold text-zinc-900">
            A2M Marketplace
          </Link>
        </div>

        <nav className="flex items-center gap-3 text-sm text-zinc-700">
          <Link href="/" className="hover:text-zinc-900">
            Home
          </Link>
          <Link href="/listings" className="hover:text-zinc-900">
            Listings
          </Link>
          <Link href="/docs/agent-quickstart" className="hover:text-zinc-900">
            Docs
          </Link>
        </nav>
      </div>
    </header>
  );
}
