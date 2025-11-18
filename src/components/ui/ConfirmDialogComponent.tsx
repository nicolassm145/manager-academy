import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Tem certeza?",
  description = "Essa ação não poderá ser desfeita.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white border border-black border-2 rounded-xl shadow-lg p-6 w-full max-w-xs text-center animate-fade-in pointer-events-auto">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-sm opacity-80 mb-4">{description}</p>
        <div className="flex gap-3 justify-center">
          <button
            className="btn btn-error flex-1"
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
          <button className="btn btn-ghost flex-1" onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
