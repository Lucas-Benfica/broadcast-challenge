import { useState, useEffect } from "react";
import type { Connection } from "../hooks/useConnections";
import type { Contact } from "../hooks/useContacts";
import { Select, MenuItem, Checkbox, ListItemText, Switch, FormControlLabel } from "@mui/material";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { connectionId: string; contactIds: string[]; content: string; status: 'SENT' | 'SCHEDULED'; scheduledAt: string }) => Promise<void>;
  connections: Connection[];
  contacts: Contact[]; // Todos os contatos globais (o modal filtra)
  preselectedConnectionId?: string;
}

export const MessageModal = ({ isOpen, onClose, onSave, connections, contacts, preselectedConnectionId }: MessageModalProps) => {
  const [connectionId, setConnectionId] = useState("");
  const [contactIds, setContactIds] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConnectionId(preselectedConnectionId || "");
      setContactIds([]);
      setContent("");
      setIsScheduled(false);
      setScheduledAt("");
    }
  }, [isOpen, preselectedConnectionId]);

  useEffect(() => {
    // Se a conexão mudar, limpa a seleção de contatos
    setContactIds([]);
  }, [connectionId]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(c => c.connectionId === connectionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectionId || contactIds.length === 0 || !content.trim()) return;
    if (isScheduled && !scheduledAt) return;

    setIsSaving(true);
    try {
      const status = isScheduled ? 'SCHEDULED' : 'SENT';
      const finalDate = isScheduled ? new Date(scheduledAt).toISOString() : new Date().toISOString();

      await onSave({
        connectionId,
        contactIds,
        content: content.trim(),
        status,
        scheduledAt: finalDate
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContactChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setContactIds(typeof value === 'string' ? value.split(',') : value);
  };

  // Estilização base para os Selects MUI
  const selectSx = {
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
  };

  const menuProps = {
    PaperProps: {
      elevation: 0,
      sx: {
        border: '0.5px solid #e5e7eb',
        borderRadius: '0.5rem',
        mt: 0.5,
        boxShadow: 'none',
        maxHeight: 250
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-4 backdrop-blur-none" onClick={onClose}>
      <div className="bg-white rounded-xl border-[0.5px] border-gray-200 p-6 w-full max-w-[400px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Nova mensagem</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* 1. Seleção de Conexão */}
          {!preselectedConnectionId && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-600">Conexão</label>
              <Select
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value as string)}
                displayEmpty
                fullWidth
                size="small"
                disabled={isSaving}
                sx={selectSx}
                MenuProps={menuProps}
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

          {/* 2. Seleção de Contatos (Múltipla) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Destinatários</label>
            <Select
              multiple
              value={contactIds}
              onChange={handleContactChange}
              displayEmpty
              fullWidth
              size="small"
              disabled={!connectionId || isSaving || filteredContacts.length === 0}
              sx={selectSx}
              MenuProps={menuProps}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <span className="text-gray-400">Selecione contatos...</span>;
                }
                return `${selected.length} contato(s) selecionado(s)`;
              }}
            >
              {filteredContacts.length === 0 ? (
                <MenuItem disabled sx={{ fontSize: '0.875rem' }}>Nenhum contato encontrado</MenuItem>
              ) : (
                filteredContacts.map(c => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.875rem', p: 0 }}>
                    <Checkbox checked={contactIds.indexOf(c.id) > -1} size="small" />
                    <ListItemText primary={c.name} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                  </MenuItem>
                ))
              )}
            </Select>
          </div>

          {/* 3. Corpo da Mensagem */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-600">Mensagem</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              rows={4}
              className="w-full border-[0.5px] border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] resize-none"
              required
              disabled={isSaving}
            />
          </div>

          {/* 4. Agendamento */}
          <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border-[0.5px] border-gray-200">
            <FormControlLabel
              control={
                <Switch
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  size="small"
                  color="primary"
                />
              }
              label={<span className="text-sm text-gray-700">Agendar mensagem</span>}
              disabled={isSaving}
            />
            {isScheduled && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full border-[0.5px] border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] bg-white text-gray-700"
                required
                disabled={isSaving}
              />
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-600 border-[0.5px] border-gray-300 rounded-md hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={!connectionId || contactIds.length === 0 || !content.trim() || (isScheduled && !scheduledAt) || isSaving} className="px-4 py-2 text-sm font-medium text-white bg-[#185FA5] rounded-md hover:bg-[#144d87] disabled:opacity-50">
              {isSaving ? "Salvando..." : (isScheduled ? "Agendar" : "Enviar Agora")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
