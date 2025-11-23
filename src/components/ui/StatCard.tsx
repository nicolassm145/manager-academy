import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  color: string;
  children?: ReactNode;
  className?: string;
}

export const StatCard = ({
  label,
  value,
  icon,
  color,
  children,
  className,
}: StatCardProps) => (
  <div
    className={`rounded-xl shadow-md bg-white p-4 sm:p-6 ${
      className || ""
    }`.trim()}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-60 mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
        {children}
      </div>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
    </div>
  </div>
);
