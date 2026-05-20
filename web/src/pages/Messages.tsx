import { useState, useMemo } from "react";
import { Search, Add, DeleteOutlined } from "@mui/icons-material";
import { Tooltip, Zoom, Select, MenuItem } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { useConnections } from "../hooks/useConnections";
import { useContacts } from "../hooks/useContacts";
import { MessageModal } from "../components/MessageModal";
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

  const [viewingMessage, setViewingMessage] = useState<string | null>(null);
  const [viewingRecipients, setViewingRecipients] = useState<string[] | null>(null);

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchConn = filterConnectionId ? m.connectionId === filterConnectionId : true;
      const matchStatus = filterStatus ? m.status === filterStatus : true;
      return matchSearch && matchConn && matchStatus;
    });
  }, [messages, searchQuery, filterConnectionId, filterStatus]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta mensagem?")) {
      try {
        await deleteMessage(id);
        toast.success("Mensagem excluída.");
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir mensagem.");
      }
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

      <div className="bg-white border-[0.5px] border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b-[0.5px] border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Mensagem</th>
                <th className="px-6 py-3">Conexão</th>
                <th className="px-6 py-3">Destinatários</th>
                <th className="px-6 py-3">Data Programada</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => {
                  const conn = connections.find(c => c.id === msg.connectionId);
                  const isScheduled = msg.status === 'SCHEDULED';

                  const dateStr = new Date(isScheduled ? msg.scheduledAt : msg.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isScheduled ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}>
                          {isScheduled ? 'Agendada' : 'Enviada'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 max-w-[150px] truncate" title={msg.content}>
                            {msg.content}
                          </span>
                          <button 
                            onClick={() => setViewingMessage(msg.content)}
                            className="flex-shrink-0 text-[#185FA5] hover:text-[#144d87] text-xs font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                          >
                            Expandir
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {conn ? conn.name : "Desconhecida"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setViewingRecipients(msg.contactIds)}
                          className="text-gray-600 hover:text-[#185FA5] hover:bg-gray-50 px-2 py-1 rounded transition-colors text-sm font-medium underline decoration-dashed underline-offset-4 decoration-gray-300 hover:decoration-[#185FA5]"
                          title="Ver lista de destinatários"
                        >
                          {msg.contactIds.length} contato(s)
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip title="Excluir Mensagem" placement="top" arrow slots={{
                            transition: Zoom,
                          }}>
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <DeleteOutlined fontSize="small" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    Nenhuma mensagem encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div >

      <MessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMessage}
        connections={connections}
        contacts={contacts}
      />

      {/* Modal de Leitura de Mensagem */}
      {viewingMessage && (
        <div className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-4 backdrop-blur-none" onClick={() => setViewingMessage(null)}>
          <div className="bg-white rounded-xl border-[0.5px] border-gray-200 p-6 w-full max-w-[500px]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Conteúdo da Mensagem</h2>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(viewingMessage);
                  toast.success("Copiado para a área de transferência!");
                }}
                className="text-sm text-[#185FA5] hover:text-[#144d87] font-medium flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-md transition-colors"
              >
                Copiar Texto
              </button>
            </div>
            <div className="bg-gray-50 border-[0.5px] border-gray-200 rounded-md p-4 max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {viewingMessage}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setViewingMessage(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border-[0.5px] border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Lista de Destinatários */}
      {viewingRecipients && (
        <div className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center p-4 backdrop-blur-none" onClick={() => setViewingRecipients(null)}>
          <div className="bg-white rounded-xl border-[0.5px] border-gray-200 p-6 w-full max-w-[400px] max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Destinatários ({viewingRecipients.length})</h2>
            <div className="flex-1 overflow-y-auto min-h-0 border-[0.5px] border-gray-200 rounded-md divide-y divide-gray-100">
              {viewingRecipients.map(id => {
                const contact = contacts.find(c => c.id === id);
                return (
                  <div key={id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-900">{contact ? contact.name : 'Contato Desconhecido'}</span>
                    <span className="text-xs text-gray-500">{contact ? contact.phone : ''}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-4 pt-2">
              <button onClick={() => setViewingRecipients(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border-[0.5px] border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
