import type { ReactNode } from "react";

interface MobileCardProps {
  children: ReactNode;
  className?: string;
}

export function MobileCard({ children, className = "" }: MobileCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 border border-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

interface MobileCardItemProps {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

export function MobileCardItem({
  label,
  value,
  fullWidth = false,
}: MobileCardItemProps) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}

interface MobileCardActionsProps {
  children: ReactNode;
}

export function MobileCardActions({ children }: MobileCardActionsProps) {
  return (
    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
      {children}
    </div>
  );
}
