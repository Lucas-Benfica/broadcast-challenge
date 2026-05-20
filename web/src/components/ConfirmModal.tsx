import { WarningAmberRounded } from "@mui/icons-material";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "Excluir", 
  cancelText = "Cancelar" 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-4 backdrop-blur-none" onClick={onClose}>
      <div className="bg-white rounded-xl border-[0.5px] border-gray-200 p-6 w-full max-w-[400px]" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <WarningAmberRounded fontSize="medium" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="flex gap-3 w-full">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-[0.5px] border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
