import type { ReactNode } from "react";
import { CellTower } from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // Pegar iniciais do usuário
  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "U";
  };

  const userName = user?.displayName || user?.email || "Usuário";
  const initials = getInitials(user?.displayName, user?.email);

  const navLinks = [
    { path: "/connections", label: "Conexões" },
    { path: "/contacts", label: "Contatos" },
    { path: "/messages", label: "Mensagens" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans">
      {/* Header Fixo */}
      <header className="sticky top-0 z-50 bg-white border-b-[0.5px] border-gray-200 px-6 py-3 flex items-center justify-between">
        {/* Esquerda: Logo e Badge */}
        <div className="flex items-center gap-3">
          <CellTower className="text-gray-800" fontSize="small" />
          <span className="font-medium text-lg tracking-tight">Broadcast</span>
          <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            SaaS
          </span>
        </div>

        {/* Centro: Navegação */}
        <nav className="hidden sm:flex items-center gap-2">
          {navLinks.map(link => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${isActive
                    ? "bg-blue-50 text-[#185FA5]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Direita: Usuário */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block">{userName}</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
            {initials}
          </div>
        </div>
      </header>

      {/* Navegação Mobile (Aparece abaixo do header em telas pequenas) */}
      <div className="sm:hidden bg-white border-b-[0.5px] border-gray-200 px-4 py-2 flex justify-center gap-2 overflow-x-auto">
        {navLinks.map(link => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-md whitespace-nowrap ${isActive
                  ? "bg-blue-50 text-[#185FA5]"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
};
