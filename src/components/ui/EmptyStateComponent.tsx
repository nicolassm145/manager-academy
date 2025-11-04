import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    to: string;
  };
  children?: ReactNode;
}

export function EmptyStateComponent({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="text-center py-8 sm:py-12 lg:py-16">
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto px-4">
          {description}
        </p>
      )}
      {action && (
        <Link
          to={action.to}
          className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          {action.label}
        </Link>
      )}
      {children}
    </div>
  );
}
