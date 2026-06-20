import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold text-gray-600">{label}</span>
      <input
        className="h-12 w-full rounded-md border border-sky-100 bg-white px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        {...props}
      />
    </label>
  );
}

export function NumberField({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <Field
      label={label}
      type="number"
      className={className}
      inputMode="decimal"
      {...props}
    />
  );
}

export function TextArea({
  label,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold text-gray-600">{label}</span>
      <textarea
        className="min-h-24 w-full rounded-md border border-sky-100 bg-white px-3 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        {...props}
      />
    </label>
  );
}

export function SelectField({
  label,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold text-gray-600">{label}</span>
      <select
        className="h-12 w-full rounded-md border border-sky-100 bg-white px-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
