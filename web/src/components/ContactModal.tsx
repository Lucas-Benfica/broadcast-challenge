import { useState, useEffect } from "react";
import type { Contact } from "../hooks/useContacts";
import type { Connection } from "../hooks/useConnections";
import { Select, MenuItem } from "@mui/material";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; phone: string; connectionId: string }) => Promise<void>;
  editingContact: Contact | null;
  connections: Connection[];
  preselectedConnectionId?: string;
}

export const ContactModal = ({ isOpen, onClose, onSave, editingContact, connections, preselectedConnectionId }: ContactModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(editingContact ? editingContact.name : "");
      setPhone(editingContact ? editingContact.phone : "");
      setConnectionId(editingContact ? editingContact.connectionId : (preselectedConnectionId || ""));
    }
  }, [isOpen, editingContact, preselectedConnectionId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !connectionId) return;

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), phone: phone.trim(), connectionId });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-4 backdrop-blur-none" onClick={onClose}>
      <div className="bg-white rounded-xl border-[0.5px] border-gray-200 p-6 w-full max-w-[340px]" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {editingContact ? "Editar contato" : "Novo contato"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Só mostra o Select se não houver conexão pré-selecionada E não for edição */}
          {!preselectedConnectionId && !editingContact && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="conn-select" className="text-sm text-gray-600">Conexão</label>
              <Select
                id="conn-select"
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value as string)}
                displayEmpty
                fullWidth
                size="small"
                disabled={isSaving}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '0.5px',
                    borderColor: '#d1d5db',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#185FA5',
                    borderWidth: '1px',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    elevation: 0,
                    sx: {
                      border: '0.5px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      mt: 0.5,
                      boxShadow: 'none'
                    }
                  }
                }}
              >
                <MenuItem value="" disabled sx={{ fontSize: '0.875rem' }}>
                  Selecione uma conexão
                </MenuItem>
                {connections.map(c => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.875rem' }}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-name" className="text-sm text-gray-600">Nome</label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full border-[0.5px] border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5]"
              required
              disabled={isSaving}
              autoFocus={!!preselectedConnectionId}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-phone" className="text-sm text-gray-600">Telefone</label>
            <input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 11999999999"
              className="w-full border-[0.5px] border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5]"
              required
              disabled={isSaving}
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-600 border-[0.5px] border-gray-300 rounded-md hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={!name.trim() || !phone.trim() || !connectionId || isSaving} className="px-4 py-2 text-sm font-medium text-white bg-[#185FA5] rounded-md hover:bg-[#144d87] disabled:opacity-50">
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
