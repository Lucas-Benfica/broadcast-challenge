import { useState } from "react";
import { Link } from "react-router-dom";
import { TextField, Button, Divider, Typography, CircularProgress } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { AuthLayout } from "../components/AuthLayout";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { toast } from "react-hot-toast";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/connections");

            setEmail("");
            setPassword("");
        } catch (error) {
            console.error(error);
            toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            // Abre o popup do Google para selecionar a conta
            await signInWithPopup(auth, provider);
            navigate("/connections");
        } catch (error) {
            console.error("Erro no login com Google:", error);
            toast.error("Erro ao fazer login com o Google.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Bem-vindo de volta"
            subtitle="Faça login para acessar suas conexões"
        >
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <TextField
                    label="E-mail"
                    type="email"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <TextField
                    label="Senha"
                    type="password"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    fullWidth
                    disableElevation
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                    sx={{ py: 1, mt: 1, textTransform: 'none', fontSize: '0.9rem', borderRadius: 2 }}
                >
                    {isLoading ? "Entrando..." : "Entrar"}
                </Button>
            </form>

            <div className="my-5">
                <Divider>
                    <Typography variant="body2" className="text-gray-400 uppercase tracking-wider text-xs font-semibold">
                        ou
                    </Typography>
                </Divider>
            </div>

            <Button
                variant="outlined"
                fullWidth
                size="small"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{ py: 1, mb: 4, textTransform: 'none', fontSize: '0.9rem', color: 'text.primary', borderColor: 'divider', borderRadius: 2 }}
            >
                {isLoading ? "Entrando..." : "Entrar com Google"}
            </Button>

            <Typography variant="body2" className="text-center text-gray-600">
                Não tem uma conta?{" "}
                <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                    Cadastre-se
                </Link>
            </Typography>
        </AuthLayout>
    );
}