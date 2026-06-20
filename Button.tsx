import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const base =
  "inline-flex h-10 items-center justify-center rounded border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const variants = {
  primary: "border-ink bg-ink text-white hover:bg-gray-800",
  secondary: "border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
  danger: "border-red-200 bg-white text-red-700 hover:bg-red-50",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: keyof typeof variants;
};

export function LinkButton({
  className = "",
  variant = "primary",
  href,
  ...props
}: LinkButtonProps) {
  return <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
