import { Layout } from "../../components/LayoutComponent";

const DashboardPage = () => {
  // Dados mockados (depois vem da API)
  const stats = [
    { title: "Total de Membros", value: "42", color: "bg-blue-500" },
    { title: "Saldo da Equipe", value: "R$ 8.450,00", color: "bg-green-500" },
    { title: "Itens no Estoque", value: "87", color: "bg-purple-500" },
    { title: "Baixo Estoque", value: "3", color: "bg-red-500" },
  ];

  const recentTransactions = [
    { id: 1, desc: "Compra de Material", value: -450, date: "01/11/2025" },
    { id: 2, desc: "Patrocínio Empresa X", value: 2000, date: "28/10/2025" },
    { id: 3, desc: "Compra de Ferramentas", value: -320, date: "25/10/2025" },
  ];

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Bem-vindo ao Manager Academy
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg opacity-10`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Últimas Transações */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Últimas Transações
          </h2>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {transaction.desc}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {transaction.date}
                  </p>
                </div>
                <p
                  className={`font-bold text-sm sm:text-base flex-shrink-0 ${
                    transaction.value > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.value > 0 ? "+" : ""}
                  R$ {Math.abs(transaction.value).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <button className="p-3 sm:p-4 border-2 border-blue-500 text-blue-600 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-50 transition-colors">
              + Cadastrar Membro
            </button>
            <button className="p-3 sm:p-4 border-2 border-purple-500 text-purple-600 rounded-lg text-sm sm:text-base font-semibold hover:bg-purple-50 transition-colors">
              + Adicionar Item
            </button>
            <button className="p-3 sm:p-4 border-2 border-green-500 text-green-600 rounded-lg text-sm sm:text-base font-semibold hover:bg-green-50 transition-colors sm:col-span-2 lg:col-span-1">
              + Nova Transação
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
