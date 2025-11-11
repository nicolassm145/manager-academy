import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "small" | "medium" | "large";
}

const paddingClasses = {
  none: "",
  small: "p-4",
  medium: "p-4 sm:p-6",
  large: "p-6 sm:p-8",
};

export function CardComponent({
  children,
  className = "",
  padding = "medium",
}: CardProps) {
  return (
    <div
      className={`bg-base-100 rounded-xl shadow-md border ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
