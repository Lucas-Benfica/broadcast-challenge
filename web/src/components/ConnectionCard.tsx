import type { Connection } from "../hooks/useConnections";
import {
  EditOutlined,
  DeleteOutlined,
  PeopleAltOutlined,
  SendOutlined,
  PersonAddOutlined,
  MailOutlined
} from "@mui/icons-material";
import { Tooltip, Zoom } from "@mui/material";

interface ConnectionCardProps {
  connection: Connection;
  index: number;
  onEdit: (conn: Connection) => void;
  onDelete: (id: string) => void;
  onAddContact?: (connId: string) => void;
  onAddMessage?: (connId: string) => void;
}

const avatarThemes = [
  "bg-blue-100 text-blue-800",
  "bg-teal-100 text-teal-800",
  "bg-orange-100 text-orange-800",
  "bg-purple-100 text-purple-800",
  "bg-amber-100 text-amber-800"
];

export const ConnectionCard = ({ connection, index, onEdit, onDelete, onAddContact, onAddMessage }: ConnectionCardProps) => {
  const themeClass = avatarThemes[index % avatarThemes.length];
  const initials = connection.name.substring(0, 2).toUpperCase();

  return (
    <div className="bg-white border-[0.5px] border-gray-200 rounded-xl p-4 transition-colors duration-200 hover:border-gray-400 flex flex-col h-full">

      {/* Topo: Avatar e Nome */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-[38px] h-[38px] flex-shrink-0 rounded-full flex items-center justify-center font-medium text-sm ${themeClass}`}>
          {initials}
        </div>
        <h3 className="font-medium text-gray-900 text-sm truncate" title={connection.name}>
          {connection.name}
        </h3>
      </div>

      {/* Estatísticas */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 flex-1">
        <div className="flex items-center gap-1">
          <PeopleAltOutlined fontSize="inherit" />
          <span>{connection.contactsCount} contatos</span>
        </div>
        <div className="flex items-center gap-1">
          <SendOutlined fontSize="inherit" />
          <span>{connection.messagesCount} msgs</span>
        </div>
      </div>

      {/* Rodapé: Ações */}
      <div className="pt-3 border-t-[0.5px] border-gray-100 flex justify-between items-center gap-1">
        <div className="flex gap-1">
          {onAddContact && (
            <Tooltip title="Adicionar Contato" placement="top" arrow slots={{
              transition: Zoom,
            }}>
              <button
                onClick={() => onAddContact(connection.id)}
                className="p-1.5 rounded text-gray-400 hover:text-[#185FA5] hover:bg-blue-50 transition-colors"
              >
                <PersonAddOutlined fontSize="small" />
              </button>
            </Tooltip>
          )}
          {onAddMessage && (
            <Tooltip title="Nova Mensagem" placement="top" arrow slots={{
              transition: Zoom,
            }}>
              <button
                onClick={() => onAddMessage(connection.id)}
                className="p-1.5 rounded text-gray-400 hover:text-[#185FA5] hover:bg-blue-50 transition-colors"
              >
                <MailOutlined fontSize="small" />
              </button>
            </Tooltip>
          )}
        </div>
        <div className="flex gap-1">
          <Tooltip title="Editar Conexão" placement="top" arrow slots={{
            transition: Zoom,
          }}>
            <button
              onClick={() => onEdit(connection)}
              className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <EditOutlined fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Excluir Conexão" placement="top" arrow slots={{
            transition: Zoom,
          }}>
            <button
              onClick={() => onDelete(connection.id)}
              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <DeleteOutlined fontSize="small" />
            </button>
          </Tooltip>
        </div>
      </div>

    </div>
  );
};
