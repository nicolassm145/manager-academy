import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface BackButtonProps {
  to?: string;
  label?: string;
}

export function BackButtonComponent({ to, label = "Voltar" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
    >
      <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
