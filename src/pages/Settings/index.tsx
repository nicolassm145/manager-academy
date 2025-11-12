import { useState } from "react";
import { Layout } from "../../components/LayoutComponent";
import { useAuth } from "../../context/AuthContext";
import { updateMember } from "../../services/memberService";
import {
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const SettingsPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setErrorMessage("Usuário não encontrado");
      return;
    }

    try {
      await updateMember(user.id, { email: formData.email });

      setSuccessMessage("Email atualizado com sucesso!");
      setErrorMessage("");

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setErrorMessage("Erro ao atualizar email");
      setSuccessMessage("");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setErrorMessage("Usuário não encontrado");
      return;
    }

    if (!formData.newPassword) {
      setErrorMessage("Digite a nova senha");
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrorMessage("A nova senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("As senhas não coincidem");
      return;
    }

    try {
      await updateMember(user.id, { password: formData.newPassword });

      setSuccessMessage("Senha atualizada com sucesso!");
      setErrorMessage("");

      setFormData({
        ...formData,
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setErrorMessage("Erro ao atualizar senha");
      setSuccessMessage("");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Configurações da Conta
          </h1>
          <p className="text-sm sm:text-base opacity-60 mt-1">
            Gerencie suas informações pessoais e segurança
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border rounded-lg p-4 flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border rounded-lg p-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border p-6">
          <h2 className="text-lg font-semibold mb-4">Informações do Perfil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium opacity-60 mb-1">
                Nome
              </label>
              <p className="text-base">{user?.nome}</p>
            </div>
            <div>
              <label className="block text-sm font-medium opacity-60 mb-1">
                Perfil
              </label>
              <p className="text-base">
                {user?.role === "admin" && "Administrador"}
                {user?.role === "lider" && "Líder de Equipe"}
                {user?.role === "professor" && "Professor Orientador"}
                {user?.role === "diretor" && "Diretor Financeiro"}
                {user?.role === "membro" && "Membro"}
              </p>
            </div>
            {user?.equipe && (
              <div>
                <label className="block text-sm font-medium opacity-60 mb-1">
                  Equipe
                </label>
                <p className="text-base">{user.equipeNome || user.equipe}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border p-6">
          <div className="flex items-center gap-3 mb-4">
            <EnvelopeIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">Alterar Email</h2>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Novo Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="seu.email@exemplo.com"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Atualizar Email
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md border p-6">
          <div className="flex items-center gap-3 mb-4">
            <LockClosedIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">Alterar Senha</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium mb-2"
              >
                Nova Senha *
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                Confirmar Nova Senha *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Digite novamente a nova senha"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Atualizar Senha
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
