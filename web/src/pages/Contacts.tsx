import { useState, useMemo } from "react";
import { Search, Add, EditOutlined, DeleteOutlined } from "@mui/icons-material";
import { Tooltip, Zoom, Select, MenuItem } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useContacts, type Contact } from "../hooks/useContacts";
import { useConnections } from "../hooks/useConnections";
import { ContactModal } from "../components/ContactModal";
import toast from "react-hot-toast";

export default function Contacts() {
  const { user } = useAuth();
  const { contacts, loading: contactsLoading, addContact, updateContact, deleteContact } = useContacts(user?.uid);
  const { connections } = useConnections(user?.uid);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterConnectionId, setFilterConnectionId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
      const matchConn = filterConnectionId ? c.connectionId === filterConnectionId : true;
      return matchSearch && matchConn;
    });
  }, [contacts, searchQuery, filterConnectionId]);

  const handleOpenCreate = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este contato?")) {
      try {
        await deleteContact(id);
        toast.success("Contato excluído.");
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir contato.");
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
        toast.success("Contato adicionado com sucesso!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar contato.");
      throw error;
    }
  };

  if (contactsLoading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Carregando contatos...</div>;
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-1 tracking-tight">Contatos</h1>
          <p className="text-gray-500 text-sm">
            Gerencie todos os seus contatos de todas as conexões em um só lugar.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#185FA5] hover:bg-[#144d87] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap"
        >
          <Add fontSize="small" />
          Novo contato
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search fontSize="small" />
          </div>
          <input
            type="text"
            placeholder="Buscar contato por nome ou telefone..."
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
            sx={{
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
            <MenuItem value="" sx={{ fontSize: '0.875rem' }}>Todas as conexões</MenuItem>
            {connections.map(c => (
              <MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.875rem' }}>{c.name}</MenuItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="bg-white border-[0.5px] border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b-[0.5px] border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Telefone</th>
                <th className="px-6 py-3">Conexão</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                  const conn = connections.find(c => c.id === contact.connectionId);
                  return (
                    <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{contact.name}</td>
                      <td className="px-6 py-4 text-gray-600">{contact.phone}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {conn ? conn.name : "Conexão desconhecida"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip title="Editar Contato" placement="top" arrow slots={{
                            transition: Zoom,
                          }}>
                            <button
                              onClick={() => handleOpenEdit(contact)}
                              className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <EditOutlined fontSize="small" />
                            </button>
                          </Tooltip>
                          <Tooltip title="Excluir Contato" placement="top" arrow slots={{
                            transition: Zoom,
                          }}>
                            <button
                              onClick={() => handleDelete(contact.id)}
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
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                    Nenhum contato encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        editingContact={editingContact}
        connections={connections}
      />
    </>
  );
}
