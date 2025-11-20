import { API_BASE_URL, getAuthHeaders, handleApiError } from "../config/api";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
}

export interface DriveIntegrationStatus {
  isConnected: boolean;
  folderId?: string;
  folderName?: string;
}

// REMOVIDO: checkDriveIntegration (endpoint /status não existe no backend)
//
// getAuthorizationUrl agora exige o parâmetro equipeId e envia o header Authorization.
// Lembre-se: se o backend retornar 422, lançamos um erro claro.

export const getAuthorizationUrl = async (
  equipeId: number
): Promise<string> => {
  if (!equipeId || isNaN(equipeId)) {
    throw new Error("Parâmetro 'equipeId' inválido ou ausente.");
  }

  const url = `${API_BASE_URL}/google-drive/authorize?equipeId=${encodeURIComponent(
    String(equipeId)
  )}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  // tratativa específica para 422 (parâmetro faltando/incorreto)
  if (response.status === 422) {
    const body = await response.text().catch(() => null);
    throw new Error(
      `Erro 422: parâmetro 'equipeId' inválido ou ausente na query string. ${
        body ? `(${body})` : ""
      }`
    );
  }

  await handleApiError(response);
  const data = await response.json();
  // espera que o backend retorne { authorization_url: "..." } ou similar
  return data.authorization_url || data.authorizationUrl || data.url || "";
};

export const listDriveFiles = async (): Promise<DriveFile[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/google-drive/files`, {
      headers: getAuthHeaders(),
    });
    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    throw error;
  }
};

export const uploadFile = async (
  file: File,
  equipeId: number
): Promise<DriveFile> => {
  // Debug: log do arquivo
  console.log("Arquivo para upload:", file);
  if (!file || file.size === 0) {
    throw new Error("Arquivo vazio ou inválido.");
  }
  const formData = new FormData();
  formData.append("file", file);

  // Debug: log do header de autenticação
  const authHeaders = getAuthHeaders();
  console.log("Headers de autenticação:", authHeaders);

  // Extrai Authorization corretamente (caso seja Headers ou objeto)
  let authorization = "";
  if (authHeaders instanceof Headers) {
    authorization = authHeaders.get("Authorization") || "";
  } else if (typeof authHeaders === "object" && authHeaders !== null) {
    // Pode ser Record<string, string>
    authorization =
      (authHeaders as Record<string, string>)["Authorization"] || "";
  }
  const headers: Record<string, string> = {};
  if (authorization) {
    headers["Authorization"] = authorization;
  }

  const response = await fetch(
    `${API_BASE_URL}/google-drive/upload?equipeId=${equipeId}`,
    {
      method: "POST",
      headers,
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro detalhado do backend:", errorText);
  }

  await handleApiError(response);
  return await response.json();
};

export const downloadFile = async (
  fileId: string,
  fileName: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/google-drive/download/${encodeURIComponent(fileId)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    await handleApiError(response);

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Erro ao baixar arquivo:", error);
    throw error;
  }
};

export const disconnectDrive = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/google-drive/disconnect`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  await handleApiError(response);
};
