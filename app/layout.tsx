import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wood Quote",
  description: "木工加工業向け見積専用アプリ",
};

const navItems = [
  { href: "/", label: "見積" },
  { href: "/materials", label: "材料" },
  { href: "/conditions", label: "条件DB" },
  { href: "/settings", label: "設定" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen lg:flex">
          <aside className="border-b border-sky-100/80 bg-white/85 shadow-sm shadow-sky-100/60 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:border-b-0 lg:border-r">
            <div className="flex h-[72px] items-center border-b border-sky-100 px-5 py-4">
              <Link href="/" className="text-xl font-black tracking-normal text-ink">
                Wood Quote
              </Link>
            </div>
            <nav className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-skyline hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
