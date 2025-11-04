import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  description?: string;
}

export function FormField({
  label,
  name,
  required,
  error,
  children,
  description,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm sm:text-base font-medium text-gray-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {description && (
        <p className="text-xs sm:text-sm text-gray-500">{description}</p>
      )}
      {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}
    </div>
  );
}
