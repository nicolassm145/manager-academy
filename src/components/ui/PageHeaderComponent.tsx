import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButton?: {
    label: string;
    to: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
}

export function PageHeader({
  title,
  description,
  actionButton,
}: PageHeaderProps) {
  const Icon = actionButton?.icon || PlusIcon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1">
            {description}
          </p>
        )}
      </div>
      {actionButton && (
        <Link
          to={actionButton.to}
          className="flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Icon className="w-5 h-5" />
          {actionButton.label}
        </Link>
      )}
    </div>
  );
}
