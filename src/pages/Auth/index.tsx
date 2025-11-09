import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Se já estiver logado, redireciona
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Manager Academy
          </h1>
          <p className="text-sm sm:text-base opacity-60">
            Faça login para continuar
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="seu@email.com"
            />
          </div>

          {/* Senha */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Erro */}
          {error && (
            <div className="p-3 bg-red-50 border rounded-lg">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Credenciais para teste */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold mb-2">Credenciais para teste:</p>
          <div className="text-xs opacity-80 space-y-1">
            <p className="break-all">
              • <strong>Admin:</strong> admin@manager.com / 123456
            </p>
            <p className="break-all">
              • <strong>Líder:</strong> joao.silva@example.com / 123456
            </p>
            <p className="break-all">
              • <strong>Membro:</strong> ana.costa@example.com / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
