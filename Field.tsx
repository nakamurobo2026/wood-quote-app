import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-gray-600">{label}</span>
      <input
        className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500"
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
      <span className="mb-1 block text-xs font-semibold text-gray-600">{label}</span>
      <textarea
        className="min-h-24 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
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
      <span className="mb-1 block text-xs font-semibold text-gray-600">{label}</span>
      <select
        className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
