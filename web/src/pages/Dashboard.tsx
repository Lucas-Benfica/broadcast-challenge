import { useState, useMemo } from "react";
import { Search, Add } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useConnections, type Connection } from "../hooks/useConnections";
import { MetricCard } from "../components/MetricCard";
import { ConnectionCard } from "../components/ConnectionCard";
import { ConnectionModal } from "../components/ConnectionModal";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { connections, loading, addConnection, updateConnection, deleteConnection } = useConnections(user?.uid);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);

  // Derivar métricas puramente
  const totalConnections = connections.length;
  const totalContacts = connections.reduce((acc, curr) => acc + curr.contactsCount, 0);
  const totalMessages = connections.reduce((acc, curr) => acc + curr.messagesCount, 0);

  // Filtrar busca reativamente
  const filteredConnections = useMemo(() => {
    return connections.filter(conn =>
      conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [connections, searchQuery]);

  const handleOpenCreate = () => {
    setEditingConnection(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (conn: Connection) => {
    setEditingConnection(conn);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta conexão?")) {
      try {
        await deleteConnection(id);
        toast.success("Conexão excluída.");
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir conexão.");
      }
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
      throw error; // Repassa o erro para que o modal não feche
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Carregando conexões...</div>;
  }

  return (
    <>
      {/* Título e Subtítulo */}
      <div className="mb-6">
        <h1 className="text-3xl font-medium text-gray-900 mb-1 tracking-tight">Conexões</h1>
        <p className="text-gray-500 text-sm">
          Gerencie suas conexões e acesse contatos e mensagens de cada uma.
        </p>
      </div>

      {/* Barra de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Total de conexões" value={totalConnections} />
        <MetricCard label="Total de contatos" value={totalContacts} />
        <MetricCard label="Mensagens enviadas" value={totalMessages} />
      </div>

      {/* Toolbar (Ações) */}
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

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-[#185FA5] hover:bg-[#144d87] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          <Add fontSize="small" />
          Nova conexão
        </button>
      </div>

      {/* Grid de Cards */}
      {filteredConnections.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {filteredConnections.map((conn, index) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              index={index}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-[0.5px] border-gray-200 border-dashed">
          <p className="text-gray-500 text-sm">Nenhuma conexão encontrada.</p>
        </div>
      )}

      {/* Modal */}
      <ConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConnection}
        editingConnection={editingConnection}
      />
    </>
  );
}