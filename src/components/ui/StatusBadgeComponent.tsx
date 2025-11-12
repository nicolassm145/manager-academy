interface StatusBadgeProps {
  status: string;
  type?: "default" | "success" | "danger" | "warning" | "info";
}

const typeClasses = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-800",
};

export function StatusBadge({ status, type = "default" }: StatusBadgeProps) {
  // Auto-detect type based on status
  let badgeType = type;
  if (type === "default") {
    if (status === "ativo" || status === "ativa") badgeType = "success";
    else if (status === "inativo" || status === "inativa") badgeType = "danger";
  }

  return (
    <span
      className={`inline-block px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${typeClasses[badgeType]}`}
    >
      {status}
    </span>
  );
}
