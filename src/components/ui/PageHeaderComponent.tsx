import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";

import type { ReactNode } from "react";
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
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
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
