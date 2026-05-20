import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowBack, EditOutlined, DeleteOutlined, PersonAddOutlined, MailOutlined } from "@mui/icons-material";
import { Tooltip, Zoom } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useConnections } from "../hooks/useConnections";
import { useContacts, type Contact } from "../hooks/useContacts";
import { useMessages } from "../hooks/useMessages";
import { ContactsTable } from "../components/ContactsTable";
import { MessagesTable } from "../components/MessagesTable";
import { ConnectionModal } from "../components/ConnectionModal";
import { ContactModal } from "../components/ContactModal";
import { MessageModal } from "../components/MessageModal";
import toast from "react-hot-toast";

export default function ConnectionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { connections, loading: connLoading, updateConnection, deleteConnection } = useConnections(user?.uid);
  const { contacts, loading: contactsLoading, addContact, updateContact, deleteContact } = useContacts(user?.uid, id);
  const { messages, loading: messagesLoading, addMessage, deleteMessage } = useMessages(user?.uid, id);

  const [activeTab, setActiveTab] = useState<'CONTACTS' | 'MESSAGES'>('CONTACTS');

  // Modals state
  const [isConnModalOpen, setIsConnModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);

  if (connLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Carregando detalhes...</div>;
  }

  const connection = connections.find(c => c.id === id);

  if (!connection) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-lg border-[0.5px] border-gray-200 border-dashed">
        <p className="text-gray-500 mb-4">Conexão não encontrada.</p>
        <Link to="/connections" className="text-[#185FA5] hover:underline font-medium">Voltar para Dashboard</Link>
      </div>
    );
  }

  const initials = connection.name.substring(0, 2).toUpperCase();

  const handleUpdateConnection = async (name: string) => {
    try {
      await updateConnection(connection.id, name);
      toast.success("Conexão atualizada.");
    } catch (e) {
      toast.error("Erro ao atualizar.");
    }
  };

  const handleDeleteConnection = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta conexão? Contatos e mensagens ficarão orfãos ou excluídos.")) {
      try {
        await deleteConnection(connection.id);
        toast.success("Conexão excluída.");
        navigate("/connections");
      } catch (e) {
        toast.error("Erro ao excluir.");
      }
    }
  };

  const handleSaveContact = async (data: { name: string; phone: string; connectionId: string }) => {
    try {
      if (editingContact) {
        await updateContact(editingContact.id, data);
        toast.success("Contato atualizado.");
      } else {
        await addContact(data);
        toast.success("Contato adicionado.");
      }
    } catch (e) {
      toast.error("Erro ao salvar contato.");
    }
  };

  const handleSaveMessage = async (data: { connectionId: string; contactIds: string[]; content: string; status: 'SENT' | 'SCHEDULED'; scheduledAt: string }) => {
    try {
      await addMessage(data);
      toast.success(data.status === 'SENT' ? "Mensagem enviada com sucesso!" : "Mensagem agendada!");
    } catch (error) {
      toast.error("Erro ao processar mensagem.");
    }
  };

  return (
    <>
      {/* Header/Resumo */}
      <div className="bg-white border-[0.5px] border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate("/connections")} className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-md hover:bg-gray-50">
            <ArrowBack fontSize="small" />
          </button>
          <span className="text-sm font-medium text-gray-500">Voltar para conexões</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-[72px] h-[72px] rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-semibold text-2xl border-[0.5px] border-blue-200">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{connection.name}</h1>
              <div className="flex gap-4 mt-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{contacts.length}</span> <span className="text-gray-500">contatos</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{messages.length}</span> <span className="text-gray-500">mensagens</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setEditingContact(null); setIsContactModalOpen(true); }}
              className="flex items-center justify-center gap-1.5 bg-white border-[0.5px] border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md font-medium text-sm transition-colors"
            >
              <PersonAddOutlined fontSize="small" /> Contato
            </button>
            <button
              onClick={() => setIsMsgModalOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-white border-[0.5px] border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md font-medium text-sm transition-colors"
            >
              <MailOutlined fontSize="small" /> Mensagem
            </button>
            <div className="w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>
            <Tooltip title="Editar Conexão" placement="top" arrow slots={{
              transition: Zoom,
            }}>
              <button onClick={() => setIsConnModalOpen(true)} className="p-2 rounded-md bg-white border-[0.5px] border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                <EditOutlined fontSize="small" />
              </button>
            </Tooltip>
            <Tooltip title="Excluir Conexão" placement="top" arrow slots={{
              transition: Zoom,
            }}>
              <button onClick={handleDeleteConnection} className="p-2 rounded-md bg-white border-[0.5px] border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors">
                <DeleteOutlined fontSize="small" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-[0.5px] border-gray-200 mb-6 flex gap-6">
        <button
          onClick={() => setActiveTab('CONTACTS')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'CONTACTS' ? 'border-[#185FA5] text-[#185FA5]' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}
        >
          Contatos
        </button>
        <button
          onClick={() => setActiveTab('MESSAGES')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'MESSAGES' ? 'border-[#185FA5] text-[#185FA5]' : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}
        >
          Mensagens
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'CONTACTS' && (
        contactsLoading ? <div className="text-gray-400 text-sm">Carregando contatos...</div> :
          <ContactsTable
            contacts={contacts}
            connections={connections}
            onEdit={(c) => { setEditingContact(c); setIsContactModalOpen(true); }}
            onDelete={async (id) => {
              if (window.confirm("Deseja apagar o contato?")) await deleteContact(id);
            }}
            hideConnectionColumn
          />
      )}

      {activeTab === 'MESSAGES' && (
        messagesLoading ? <div className="text-gray-400 text-sm">Carregando mensagens...</div> :
          <MessagesTable
            messages={messages}
            connections={connections}
            contacts={contacts}
            onDelete={async (id) => {
              if (window.confirm("Deseja apagar a mensagem?")) await deleteMessage(id);
            }}
            hideConnectionColumn
          />
      )}

      {/* Modals */}
      <ConnectionModal
        isOpen={isConnModalOpen}
        onClose={() => setIsConnModalOpen(false)}
        onSave={handleUpdateConnection}
        editingConnection={connection}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSave={handleSaveContact}
        editingContact={editingContact}
        connections={connections}
        preselectedConnectionId={connection.id}
      />

      <MessageModal
        isOpen={isMsgModalOpen}
        onClose={() => setIsMsgModalOpen(false)}
        onSave={handleSaveMessage}
        connections={connections}
        contacts={contacts}
        preselectedConnectionId={connection.id}
      />
    </>
  );
}
