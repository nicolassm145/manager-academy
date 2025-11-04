import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../../components/LayoutComponent";
import { getUserById, updateUser } from "../../../services/userService";

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(undefined);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    role: "" as "admin" | "lider" | "professor" | "diretor" | "membro" | "",
    equipe: "",
    status: "" as "ativo" | "inativo" | "",
  });

  useEffect(() => {
    if (id) {
      const foundUser = getUserById(id);
      setUser(foundUser);

      if (foundUser) {
        setFormData({
          nome: foundUser.nome,
          email: foundUser.email,
          role: foundUser.role,
          equipe: foundUser.equipe || "",
          status: foundUser.status,
        });
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      const userData = {
        ...formData,
        role: formData.role as
          | "admin"
          | "lider"
          | "professor"
          | "diretor"
          | "membro",
        status: formData.status as "ativo" | "inativo",
      };
      updateUser(id, userData);
      alert("Usuário atualizado com sucesso!");
      navigate(`/admin/users/${id}`);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const needsTeam = formData.role === "lider" || formData.role === "membro";

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="opacity-60">Usuário não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Editar Usuário</h1>
          <p className="opacity-60 mt-1">{user.email}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-8 border space-y-6"
        >
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium mb-2"
            >
              Nome Completo *
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              required
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium mb-2"
              >
                Perfil de Acesso *
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="admin">Administrador</option>
                <option value="lider">Líder de Equipe</option>
                <option value="professor">Professor Orientador</option>
                <option value="diretor">Diretor Financeiro</option>
                <option value="membro">Membro</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium mb-2"
              >
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          {needsTeam && (
            <div className="bg-blue-50 border rounded-lg p-4">
              <label
                htmlFor="equipe"
                className="block text-sm font-medium mb-2"
              >
                Equipe *
              </label>
              <select
                id="equipe"
                name="equipe"
                required
                value={formData.equipe}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione uma equipe</option>
                <option value="DevU">DevU</option>
                <option value="Byron">Byron</option>
                <option value="Exmachima">Exmachima</option>
                <option value="Asimov">Asimov</option>
                <option value="BlackBee">BlackBee</option>
              </select>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/users/${id}`)}
              className="btn btn-ghost"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditUserPage;
