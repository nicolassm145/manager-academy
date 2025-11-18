import React from "react";

interface FeedbackProps {
  type: "error" | "success";
  message: string;
  className?: string;
}

export const Feedback: React.FC<FeedbackProps> = ({
  type,
  message,
  className = "",
}) => {
  if (!message) return null;
  return (
    <div
      className={`fixed top-4 left-1/2 z-50 transform -translate-x-1/2 shadow-lg min-w-[260px] max-w-[90vw] px-4 py-3 text-sm font-medium border rounded-lg transition-all duration-300
        ${
          type === "error"
            ? "bg-red-50 border-red-300 text-red-700"
            : "bg-green-50 border-green-300 text-green-700"
        }
        ${className}`}
      role="alert"
      style={{ pointerEvents: "none" }}
    >
      {message}
    </div>
  );
};
