import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  trend?: {
    value: string;
    isPositive: boolean;
  };
  footer?: ReactNode;
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "blue",
  trend,
  footer,
}: StatCardProps) {
  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 sm:p-6`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium opacity-80 mb-1">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{value}</p>
        </div>
        {Icon && (
          <div className="flex-shrink-0 ml-2">
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 opacity-60" />
          </div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className={`text-xs sm:text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </span>
        </div>
      )}
      {footer && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          {footer}
        </div>
      )}
    </div>
  );
}
