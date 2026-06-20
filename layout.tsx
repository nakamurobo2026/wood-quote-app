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
          <aside className="border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:border-b-0 lg:border-r">
            <div className="flex h-16 items-center border-b border-gray-200 px-5">
              <Link href="/" className="text-xl font-bold tracking-normal text-ink">
                Wood Quote
              </Link>
            </div>
            <nav className="flex gap-1 overflow-x-auto p-3 lg:block">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
