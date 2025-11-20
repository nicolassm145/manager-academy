import { useState, useEffect } from "react";
import { Layout } from "../../../components/LayoutComponent";
import { useAuth } from "../../../context/AuthContext";
import { usePermissions } from "../../../hooks/usePermissions";
import {
  listDriveFiles,
  uploadFile,
  downloadFile,
  getAuthorizationUrl,
  type DriveFile,
} from "../../../services/googleDriveService";
import {
  PageHeader,
  Card,
  EmptyState,
  Table,
  TableHeader,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  MobileCard,
  MobileCardItem,
  MobileCardActions,
} from "../../../components/ui";
import {
  CloudArrowUpIcon,
  CloudIcon,
  ArrowDownTrayIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { Feedback } from "../../../components/ui/FeedbackComponent";

const GoogleDriveListPage = () => {
  const { user } = useAuth();
  const { can } = usePermissions();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  // Carrega arquivos ao montar
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await listDriveFiles();
      setFiles(data);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
      setFeedback({
        type: "error",
        message: "Erro ao carregar arquivos do Google Drive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      if (!user?.equipe) {
        setFeedback({
          type: "error",
          message: "ID da equipe não encontrado. Verifique se você possui uma equipe atribuída.",
        });
        return;
      }

      // garante que equipeId será enviado como query string
      const equipeIdNumber = Number(user.equipe);
      if (!equipeIdNumber || isNaN(equipeIdNumber)) {
        setFeedback({
          type: "error",
          message: "ID da equipe inválido.",
        });
        return;
      }

      const url = await getAuthorizationUrl(equipeIdNumber);
      // backend deve retornar a URL de autorização (ou redirecionamento)
      window.location.href = url;
    } catch (error: any) {
      console.error("Erro ao conectar:", error);
      setFeedback({
        type: "error",
        message:
          error?.message ||
          "Erro ao iniciar conexão com Google Drive. Verifique se o parâmetro equipeId está sendo enviado.",
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setFeedback(null);
      await uploadFile(file);
      setFeedback({
        type: "success",
        message: "Arquivo enviado com sucesso!",
      });
      await loadFiles();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Erro ao enviar arquivo",
      });
    } finally {
      setUploading(false);
      // Limpa o input
      e.target.value = "";
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      setFeedback(null);
      await downloadFile(fileId, fileName);
      setFeedback({
        type: "success",
        message: "Download iniciado!",
      });
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      setFeedback({
        type: "error",
        message: "Erro ao baixar arquivo",
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return "N/A";
    if (bytes === 0) return "0 KB";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Se estiver carregando
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 opacity-60">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Se não houver arquivos, assume que não está conectado
  if (files.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <PageHeader
            title="Google Drive"
            description="Integração com Google Drive da equipe"
          />
          <Card>
            <EmptyState
              icon={CloudIcon}
              title="Google Drive não conectado ou sem arquivos"
              description={
                user?.role === "lider"
                  ? "Conecte sua equipe ao Google Drive para compartilhar arquivos"
                  : "O líder da sua equipe ainda não conectou o Google Drive"
              }
            >
              {user?.role === "lider" && (
                <button
                  onClick={handleConnect}
                  className="btn btn-primary mt-4"
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Conectar Google Drive
                </button>
              )}
            </EmptyState>
          </Card>
        </div>
      </Layout>
    );
  }

  // Se estiver conectado, mostra a listagem
  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {feedback && (
          <Feedback type={feedback.type} message={feedback.message} />
        )}

        <PageHeader
          title="Google Drive"
          description={`Arquivos da pasta da equipe ${user?.equipeNome || ""}`}
        >
          {user?.role === "lider" && (
            <label className="flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
              <CloudArrowUpIcon className="w-5 h-5" />
              {uploading ? "Enviando..." : "Enviar Arquivo"}
              <input
                type="file"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </PageHeader>

        {files.length === 0 ? (
          <Card>
            <EmptyState
              title="Nenhum arquivo encontrado"
              description="A pasta do Google Drive está vazia. Envie o primeiro arquivo!"
            />
          </Card>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block lg:hidden space-y-3">
              {files.map((file) => (
                <MobileCard key={file.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {file.name}
                      </p>
                      <p className="text-xs opacity-60">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MobileCardItem
                      label="Criado em"
                      value={formatDate(file.createdTime)}
                    />
                    <MobileCardItem
                      label="Modificado"
                      value={formatDate(file.modifiedTime)}
                    />
                  </div>
                  <MobileCardActions>
                    <button
                      onClick={() => handleDownload(file.id, file.name)}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      Baixar
                    </button>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    )}
                  </MobileCardActions>
                </MobileCard>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell>Tamanho</TableHeadCell>
                  <TableHeadCell>Criado em</TableHeadCell>
                  <TableHeadCell>Modificado</TableHeadCell>
                  <TableHeadCell className="text-center">Ações</TableHeadCell>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="font-medium truncate max-w-xs">
                          {file.name}
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{formatDate(file.createdTime)}</TableCell>
                      <TableCell>{formatDate(file.modifiedTime)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownload(file.id, file.name)}
                            className="btn btn-primary btn-xs"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                            Baixar
                          </button>
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-xs"
                              title="Abrir no Google Drive"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default GoogleDriveListPage;
