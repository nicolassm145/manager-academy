import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../components/LayoutComponent";
import { getMemberById, updateMember } from "../../services/memberService";

const EditMemberPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(undefined);

  const [formData, setFormData] = useState({
    email: "",
    curso: "",
    equipe: "",
    cargo: "",
  });

  useEffect(() => {
    if (id) {
      const foundMember = getMemberById(id);
      setMember(foundMember);

      if (foundMember) {
        setFormData({
          email: foundMember.email,
          curso: foundMember.curso,
          equipe: foundMember.equipe,
          cargo: foundMember.cargo,
        });
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    updateMember(id, formData);
    alert("Membro atualizado com sucesso!");
    navigate(`/members/${id}`);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!member) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Membro não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Editar Membro
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {member.nome} - {member.matricula}
          </p>
        </div>

        {/* Aviso */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Atenção:</strong> Nome e Matrícula não podem ser editados
            conforme requisito RF03.
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 border border-gray-100 space-y-4 sm:space-y-6"
        >
          {/* Campos não editáveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-6 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Nome (não editável)
              </label>
              <input
                type="text"
                disabled
                value={member.nome}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Matrícula (não editável)
              </label>
              <input
                type="text"
                disabled
                value={member.matricula}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Curso */}
          <div>
            <label
              htmlFor="curso"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Curso *
            </label>
            <select
              id="curso"
              name="curso"
              required
              value={formData.curso}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Engenharia Mecânica">Engenharia Mecânica</option>
              <option value="Engenharia Elétrica">Engenharia Elétrica</option>
              <option value="Engenharia Aeroespacial">
                Engenharia Aeroespacial
              </option>
              <option value="Engenharia de Produção">
                Engenharia de Produção
              </option>
              <option value="Engenharia Civil">Engenharia Civil</option>
            </select>
          </div>

          {/* Equipe e Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="equipe"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Equipe *
              </label>
              <select
                id="equipe"
                name="equipe"
                required
                value={formData.equipe}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Baja">Baja</option>
                <option value="Fórmula SAE">Fórmula SAE</option>
                <option value="Aerodesign">Aerodesign</option>
                <option value="Eficiência Energética">
                  Eficiência Energética
                </option>
              </select>
              {formData.equipe !== member.equipe && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ Mudança de equipe será registrada no histórico
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="cargo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cargo *
              </label>
              <select
                id="cargo"
                name="cargo"
                required
                value={formData.cargo}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Líder">Líder</option>
                <option value="Vice-Líder">Vice-Líder</option>
                <option value="Membro">Membro</option>
              </select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={() => navigate(`/members/${id}`)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditMemberPage;
