export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: "Erro na requisição",
      message: "Erro na requisição",
    }));
    throw new Error(error.detail || error.message || `Erro ${response.status}`);
  }
  return response;
};
