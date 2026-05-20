import { useState } from "react";
import { Link } from "react-router-dom";
import { TextField, Button, Divider, Typography, CircularProgress } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { AuthLayout } from "../components/AuthLayout";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { toast } from "react-hot-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Cria o usuário no Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Salva o registro base dele no Firestore na coleção "users"
            // setDoc para criar um documento cujo ID é igual ao UID do Auth
            await setDoc(doc(db, "users", user.uid), {
                id: user.uid,
                email: user.email,
                name: name
            });

            navigate("/connections");
        } catch (error) {
            console.error("Erro no cadastro:", error);
            toast.error("Erro ao criar conta. Talvez o e-mail já esteja em uso.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;

            // Como é Google, pode ser que a pessoa já tenha conta
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            // Só cria o documento se ele não existir
            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName || "Usuário do Google"
                });
            }

            navigate("/connections");
        } catch (error) {
            console.error("Erro no cadastro com Google:", error);
            toast.error("Erro ao fazer cadastro com o Google.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Criar Conta"
            subtitle="Junte-se a nós e comece a gerenciar suas conexões"
        >
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <TextField
                    label="Nome completo"
                    type="text"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                />
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
                <TextField
                    label="Confirme a Senha"
                    type="password"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    error={password !== "" && confirmPassword !== "" && password !== confirmPassword}
                    helperText={
                        password !== "" && confirmPassword !== "" && password !== confirmPassword
                            ? "As senhas não coincidem"
                            : ""
                    }
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
                    {isLoading ? "Criando conta..." : "Criar conta"}
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
                onClick={handleGoogleRegister}
                sx={{ py: 1, mb: 4, textTransform: 'none', fontSize: '0.9rem', color: 'text.primary', borderColor: 'divider', borderRadius: 2 }}
            >
                {isLoading ? "Cadastrando..." : "Cadastrar com Google"}
            </Button>

            <Typography variant="body2" className="text-center text-gray-600">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                    Faça login
                </Link>
            </Typography>
        </AuthLayout>
    );
}