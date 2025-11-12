import type { ReactNode } from "react";

interface DetailSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function DetailSectionComponent({ title, children, className = "" }: DetailSectionProps) {
  return (
    <div className={className}>
      {title && (
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

export function DetailItem({ label, value, fullWidth = false }: DetailItemProps) {
  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
        {label}
      </dt>
      <dd className="text-sm sm:text-base lg:text-lg text-gray-900">
        {value || "-"}
      </dd>
    </div>
  );
}

interface DetailGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

export function DetailGrid({ children, columns = 2 }: DetailGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <dl className={`grid ${gridClasses[columns]} gap-4 sm:gap-6`}>
      {children}
    </dl>
  );
}
