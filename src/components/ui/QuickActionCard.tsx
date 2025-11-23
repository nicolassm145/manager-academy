import { Link } from "react-router-dom";

interface QuickActionCardProps {
  to: string;
  icon: React.ReactNode;
  bgColor: string;
  title: string;
  description: string;
}

export const QuickActionCard = ({
  to,
  icon,
  bgColor,
  title,
  description,
}: QuickActionCardProps) => (
  <Link
    to={to}
    className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm opacity-60">{description}</p>
      </div>
    </div>
  </Link>
);
