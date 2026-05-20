import { EditOutlined, DeleteOutlined } from "@mui/icons-material";
import { Tooltip, Zoom } from "@mui/material";
import type { Contact } from "../hooks/useContacts";
import type { Connection } from "../hooks/useConnections";

interface ContactsTableProps {
  contacts: Contact[];
  connections: Connection[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  hideConnectionColumn?: boolean;
}

export function ContactsTable({ contacts, connections, onEdit, onDelete, hideConnectionColumn }: ContactsTableProps) {
  return (
    <div className="bg-white border-[0.5px] border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b-[0.5px] border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">Telefone</th>
              {!hideConnectionColumn && <th className="px-6 py-3">Conexão</th>}
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.length > 0 ? (
              contacts.map((contact) => {
                const conn = connections.find(c => c.id === contact.connectionId);
                return (
                  <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{contact.name}</td>
                    <td className="px-6 py-4 text-gray-600">{contact.phone}</td>
                    {!hideConnectionColumn && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {conn ? conn.name : "Conexão desconhecida"}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Tooltip title="Editar Contato" placement="top" arrow slots={{
                          transition: Zoom,
                        }}>
                          <button
                            onClick={() => onEdit(contact)}
                            className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <EditOutlined fontSize="small" />
                          </button>
                        </Tooltip>
                        <Tooltip title="Excluir Contato" placement="top" arrow slots={{
                          transition: Zoom,
                        }}>
                          <button
                            onClick={() => onDelete(contact.id)}
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
                <td colSpan={hideConnectionColumn ? 3 : 4} className="px-6 py-16 text-center text-gray-500">
                  Nenhum contato encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
