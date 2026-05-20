import { useState, useMemo } from "react";
import { Search, Add } from "@mui/icons-material";
import { Select, MenuItem } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { useConnections } from "../hooks/useConnections";
import { useContacts } from "../hooks/useContacts";
import { MessageModal } from "../components/MessageModal";
import { MessagesTable } from "../components/MessagesTable";
import { ConfirmModal } from "../components/ConfirmModal";
import toast from "react-hot-toast";

export default function Messages() {
  const { user } = useAuth();
  const { messages, loading: messagesLoading, addMessage, deleteMessage } = useMessages(user?.uid);
  const { connections } = useConnections(user?.uid);
  const { contacts } = useContacts(user?.uid);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterConnectionId, setFilterConnectionId] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteState, setConfirmDeleteState] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchConn = filterConnectionId ? m.connectionId === filterConnectionId : true;
      const matchStatus = filterStatus ? m.status === filterStatus : true;
      return matchSearch && matchConn && matchStatus;
    });
  }, [messages, searchQuery, filterConnectionId, filterStatus]);

  const handleDelete = (id: string) => {
    setConfirmDeleteState({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmDeleteState.id) return;
    try {
      await deleteMessage(confirmDeleteState.id);
      toast.success("Mensagem excluída.");
      setConfirmDeleteState({ isOpen: false, id: null });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir mensagem.");
    }
  };

  const handleSaveMessage = async (data: { connectionId: string; contactIds: string[]; content: string; status: 'SENT' | 'SCHEDULED'; scheduledAt: string }) => {
    try {
      await addMessage(data);
      toast.success(data.status === 'SENT' ? "Mensagem enviada com sucesso!" : "Mensagem agendada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar mensagem.");
      throw error;
    }
  };

  if (messagesLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Carregando mensagens...</div>;
  }

  const selectSx = {
    backgroundColor: 'white',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '0.5px',
      borderColor: '#e5e7eb',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#d1d5db',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#185FA5',
      borderWidth: '1px',
    },
  };

  const menuProps = {
    PaperProps: {
      elevation: 0,
      sx: { border: '0.5px solid #e5e7eb', borderRadius: '0.5rem', mt: 0.5, boxShadow: 'none' }
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-1 tracking-tight">Mensagens</h1>
          <p className="text-gray-500 text-sm">
            Histórico completo de disparos e agendamentos.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#185FA5] hover:bg-[#144d87] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap"
        >
          <Add fontSize="small" />
          Nova mensagem
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search fontSize="small" />
          </div>
          <input
            type="text"
            placeholder="Buscar por conteúdo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-[0.5px] border-gray-200 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] focus:border-[#185FA5] transition-colors"
          />
        </div>
        
        <div className="w-full sm:w-auto min-w-[200px]">
          <Select
            value={filterConnectionId}
            onChange={(e) => setFilterConnectionId(e.target.value)}
            displayEmpty
            fullWidth
            size="small"
            sx={selectSx}
            MenuProps={menuProps}
          >
            <MenuItem value="" sx={{ fontSize: '0.875rem' }}>Todas as conexões</MenuItem>
            {connections.map(c => (
              <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.875rem' }}>{c.name}</MenuItem>
            ))}
          </Select>
        </div>

        <div className="w-full sm:w-auto min-w-[150px]">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            displayEmpty
            fullWidth
            size="small"
            sx={selectSx}
            MenuProps={menuProps}
          >
            <MenuItem value="" sx={{ fontSize: '0.875rem' }}>Todos os status</MenuItem>
            <MenuItem value="SENT" sx={{ fontSize: '0.875rem' }}>Enviadas</MenuItem>
            <MenuItem value="SCHEDULED" sx={{ fontSize: '0.875rem' }}>Agendadas</MenuItem>
          </Select>
        </div>
      </div>

      <MessagesTable 
        messages={filteredMessages} 
        connections={connections} 
        contacts={contacts} 
        onDelete={handleDelete} 
      />

      <MessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMessage}
        connections={connections}
        contacts={contacts}
      />

      <ConfirmModal
        isOpen={confirmDeleteState.isOpen}
        onClose={() => setConfirmDeleteState({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Excluir Mensagem?"
        description="Tem certeza que deseja excluir permanentemente esta mensagem? Essa ação não pode ser desfeita."
      />
    </>
  );
}
