// Configuração da API
// URL base da API - pode ser configurada via arquivo .env
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

// Helper para criar headers com autenticação JWT
// Pega o token do localStorage e adiciona no header Authorization
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper para tratar erros da API
// Se a resposta não for OK (status 2xx), lança um erro com a mensagem do backend
export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Erro na requisição",
      message: "Erro na requisição",
    }));
    // A API retorna "detail" nas mensagens de erro
    throw new Error(error.detail || error.message || `Erro ${response.status}`);
  }
  return response;
};
