import { useState, useMemo } from "react";
import { Search, Add, PersonAddOutlined, MailOutlined } from "@mui/icons-material";
import { Tooltip, Zoom } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useConnections, type Connection } from "../hooks/useConnections";
import { useContacts } from "../hooks/useContacts";
import { useMessages } from "../hooks/useMessages";
import { MetricCard } from "../components/MetricCard";
import { ConnectionCard } from "../components/ConnectionCard";
import { ConnectionModal } from "../components/ConnectionModal";
import { ContactModal } from "../components/ContactModal";
import { MessageModal } from "../components/MessageModal";
import { ConfirmModal } from "../components/ConfirmModal";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { connections, loading: connectionsLoading, addConnection, updateConnection, deleteConnection } = useConnections(user?.uid);
  const { contacts, addContact } = useContacts(user?.uid);
  const { messages, addMessage } = useMessages(user?.uid);

  const [searchQuery, setSearchQuery] = useState("");

  // Modal de Conexão
  const [isConnModalOpen, setIsConnModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);

  // Modal de Contato
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalPreselectedConnId, setContactModalPreselectedConnId] = useState("");

  // Modal de Mensagem
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [preselectedConnectionId, setPreselectedConnectionId] = useState<string | undefined>();
  const [confirmDeleteState, setConfirmDeleteState] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  // Derivar métricas puramente
  const totalConnections = connections.length;
  // O total de contatos vem do hook global de contatos
  const totalContacts = contacts.length;
  const totalMessages = messages.length;

  // Filtrar busca reativamente
  const filteredConnections = useMemo(() => {
    return connections.filter(conn =>
      conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [connections, searchQuery]);

  // Ações Conexão
  const handleOpenCreateConn = () => {
    setEditingConnection(null);
    setIsConnModalOpen(true);
  };

  const handleOpenEditConn = (conn: Connection) => {
    setEditingConnection(conn);
    setIsConnModalOpen(true);
  };

  const handleDeleteConnection = (id: string) => {
    setConfirmDeleteState({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmDeleteState.id) return;
    try {
      await deleteConnection(confirmDeleteState.id);
      toast.success("Conexão e dependências excluídas.");
      setConfirmDeleteState({ isOpen: false, id: null });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir conexão.");
    }
  };

  const handleSaveConnection = async (name: string) => {
    try {
      if (editingConnection) {
        await updateConnection(editingConnection.id, name);
        toast.success("Conexão atualizada.");
      } else {
        await addConnection(name);
        toast.success("Conexão criada com sucesso!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar conexão.");
      throw error;
    }
  };

  // Ações Contato
  const handleOpenCreateContactGlobal = () => {
    setContactModalPreselectedConnId("");
    setIsContactModalOpen(true);
  };

  const handleOpenCreateContactForConn = (connId: string) => {
    setContactModalPreselectedConnId(connId);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (data: { name: string; phone: string; connectionId: string }) => {
    try {
      await addContact(data);
      toast.success("Contato adicionado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar contato.");
      throw error;
    }
  };

  // Ações Mensagem
  const handleOpenCreateMsgGlobal = () => {
    setPreselectedConnectionId(undefined);
    setIsMsgModalOpen(true);
  };

  const handleOpenCreateMsgForConn = (connId: string) => {
    setPreselectedConnectionId(connId);
    setIsMsgModalOpen(true);
  };

  const handleSaveMessage = async (data: { connectionId: string; contactIds: string[]; content: string; status: 'SENT' | 'SCHEDULED'; scheduledAt: string }) => {
    try {
      await addMessage(data);
      toast.success(data.status === 'SENT' ? "Mensagem enviada com sucesso!" : "Mensagem agendada!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar mensagem.");
      throw error;
    }
  };

  if (connectionsLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Carregando conexões...</div>;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-medium text-gray-900 mb-1 tracking-tight">Conexões</h1>
        <p className="text-gray-500 text-sm">
          Gerencie suas conexões e acesse contatos e mensagens de cada uma.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Total de conexões" value={totalConnections} />
        <MetricCard label="Total de contatos" value={totalContacts} to="/contacts" />
        <MetricCard label="Mensagens enviadas" value={totalMessages} to="/messages" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search fontSize="small" />
          </div>
          <input
            type="text"
            placeholder="Buscar conexão..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-[0.5px] border-gray-200 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#185FA5] focus:border-[#185FA5] transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {/* Ações Globais */}
          <Tooltip title="Adicionar Contato" placement="top" arrow slots={{
            transition: Zoom,
          }}>
            <button
              onClick={handleOpenCreateContactGlobal}
              className="flex items-center justify-center gap-1 bg-white border-[0.5px] border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md font-medium text-sm transition-colors"
            >
              <PersonAddOutlined fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Nova Mensagem" placement="top" arrow slots={{
            transition: Zoom,
          }}>
            <button
              onClick={handleOpenCreateMsgGlobal}
              className="flex items-center justify-center gap-1 bg-white border-[0.5px] border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md font-medium text-sm transition-colors"
            >
              <MailOutlined fontSize="small" />
            </button>
          </Tooltip>
          <div className="w-[1px] bg-gray-200 mx-1"></div>
          <button
            onClick={handleOpenCreateConn}
            className="flex items-center justify-center gap-2 bg-[#185FA5] hover:bg-[#144d87] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            <Add fontSize="small" />
            Nova conexão
          </button>
        </div>
      </div>

      {filteredConnections.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {filteredConnections.map((conn, index) => {
            // Contagem real de contatos e mensagens para essa conexão no client side (flat structure)
            const connContactsCount = contacts.filter(c => c.connectionId === conn.id).length;
            const connMsgsCount = messages.filter(m => m.connectionId === conn.id).length;

            return (
              <ConnectionCard
                key={conn.id}
                connection={{ ...conn, contactsCount: connContactsCount, messagesCount: connMsgsCount }}
                index={index}
                onEdit={handleOpenEditConn}
                onDelete={handleDeleteConnection}
                onAddContact={handleOpenCreateContactForConn}
                onAddMessage={handleOpenCreateMsgForConn}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-[0.5px] border-gray-200 border-dashed">
          <p className="text-gray-500 text-sm">Nenhuma conexão encontrada.</p>
        </div>
      )}

      {/* Modais */}
      <ConnectionModal
        isOpen={isConnModalOpen}
        onClose={() => setIsConnModalOpen(false)}
        onSave={handleSaveConnection}
        editingConnection={editingConnection}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSave={handleSaveContact}
        editingContact={null}
        connections={connections}
        preselectedConnectionId={contactModalPreselectedConnId}
      />

      <MessageModal
        isOpen={isMsgModalOpen}
        onClose={() => setIsMsgModalOpen(false)}
        onSave={handleSaveMessage}
        connections={connections}
        contacts={contacts}
        preselectedConnectionId={preselectedConnectionId}
      />

      <ConfirmModal
        isOpen={confirmDeleteState.isOpen}
        onClose={() => setConfirmDeleteState({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Excluir Conexão?"
        description="Tem certeza que deseja excluir esta conexão? Isso removerá permanentemente a conexão e TODOS os contatos e mensagens associados a ela (Exclusão em cascata)."
      />
    </>
  );
}