import { useState, useEffect } from "react";
import { type Connection } from "../hooks/useConnections";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  editingConnection: Connection | null;
}

export const ConnectionModal = ({ isOpen, onClose, onSave, editingConnection }: ConnectionModalProps) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(editingConnection ? editingConnection.name : "");
    }
  }, [isOpen, editingConnection]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave(name.trim());
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-4 backdrop-blur-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border-[0.5px] border-gray-200 p-6 w-full max-w-[340px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {editingConnection ? "Editar conexão" : "Nova conexão"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="conn-name" className="text-sm text-gray-600">
              Nome da conexão
            </label>
            <input
              id="conn-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Loja Centro"
              className="w-full border-[0.5px] border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              autoFocus
              disabled={isSaving}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-600 border-[0.5px] border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-[#185FA5] rounded-md hover:bg-[#144d87] transition-colors disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
