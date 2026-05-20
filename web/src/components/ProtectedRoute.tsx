import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { CircularProgress, Box } from "@mui/material";

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box className="flex h-screen w-screen items-center justify-center">
                <CircularProgress />
            </Box>
        );
    }

    // Se não estiver logado, redireciona para a tela de login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se estiver logado, mostra o conteúdo normalmente
    return children;
};