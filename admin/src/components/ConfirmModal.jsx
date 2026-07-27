import React from "react";

const ConfirmModal = ({
  open,
  title = "Confirm Action",
  message = "Are you sure?",
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-sm p-6 animate-scaleIn">
        <h3 className="text-lg font-semibold text-center">{title}</h3>

        <p className="text-sm text-gray-600 text-center mt-2">
          {message}
        </p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded border bg-gray-100 hover:bg-gray-200"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;