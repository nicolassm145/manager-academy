import React, { useState, useEffect, useMemo } from "react";
import { Layout } from "../../components/LayoutComponent";
import { useAuth } from "../../context/AuthContext";

import {
  listDriveFiles,
  uploadFile,
  downloadFile,
  getAuthorizationUrl,
  deleteDriveFile,
  type DriveFile,
} from "../../services/googleDriveService";
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
  FilterSelect,
  SearchBar,
} from "../../components/ui";
import {
  CloudArrowUpIcon,
  CloudIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { Feedback } from "../../components/ui/FeedbackComponent";

const FileListPage = () => {
  const { user } = useAuth();

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const [filterType, setFilterType] = useState("");
  const [filterSubtype, setFilterSubtype] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await listDriveFiles();
      setFiles(data);
    } catch (error) {
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
          message: "ID da equipe não encontrado.",
        });
        return;
      }

      const equipeIdNumber = Number(user.equipe);
      if (!equipeIdNumber || isNaN(equipeIdNumber)) {
        setFeedback({
          type: "error",
          message: "ID da equipe inválido.",
        });
        return;
      }

      const authUrl = await getAuthorizationUrl(equipeIdNumber);
      window.location.href = authUrl;
    } catch (error: any) {
      setFeedback({
        type: "error",
        message: error?.message || "Erro ao conectar ao Google Drive",
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setFeedback(null);
      if (!user?.equipe) {
        setFeedback({
          type: "error",
          message: "ID da equipe não encontrado.",
        });
        setUploading(false);
        return;
      }
      const equipeIdNumber = Number(user.equipe);
      if (!equipeIdNumber || isNaN(equipeIdNumber)) {
        setFeedback({
          type: "error",
          message: "ID da equipe inválido.",
        });
        setUploading(false);
        return;
      }
      await uploadFile(file, equipeIdNumber);
      setFeedback({
        type: "success",
        message: "Arquivo enviado com sucesso!",
      });
      await loadFiles();
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Erro ao enviar arquivo",
      });
    } finally {
      setUploading(false);
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
      setFeedback({
        type: "error",
        message: "Erro ao baixar arquivo",
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este arquivo?")) return;
    setDeletingId(fileId);
    try {
      await deleteDriveFile(fileId);
      setFeedback({
        type: "success",
        message: "Arquivo excluído com sucesso!",
      });
      await loadFiles();
    } catch (error) {
      setFeedback({ type: "error", message: "Erro ao excluir arquivo" });
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes?: number | string) => {
    if (!bytes) return "N/A";
    const num = typeof bytes === "string" ? Number(bytes) : bytes;
    if (!num || isNaN(num)) return "N/A";
    const kb = num / 1024;
    const mb = kb / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
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

  const allTypes = useMemo(
    () =>
      Array.from(
        new Set(
          files.map((f) => {
            const t = (f.mimeType || "").split("/")[0] || "-";
            return t;
          })
        )
      ).filter(Boolean),
    [files]
  );

  const allSubtypes = useMemo(
    () =>
      Array.from(
        new Set(
          files.map((f) => {
            const s = (f.mimeType || "").split("/")[1] || "-";
            return s;
          })
        )
      ).filter(Boolean),
    [files]
  );

  const filteredFiles = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    return files.filter((file) => {
      const [type = "-", subtype = "-"] = (file.mimeType || "-").split("/");

      const matchType = !filterType || type === filterType;
      const matchSubtype = !filterSubtype || subtype === filterSubtype;

      const inName = file.name?.toLowerCase().includes(q);
      const inType = type.toLowerCase().includes(q);
      const inSubtype = subtype.toLowerCase().includes(q);

      const matchSearch = !q || inName || inType || inSubtype;

      return matchType && matchSubtype && matchSearch;
    });
  }, [files, filterType, filterSubtype, searchTerm]);

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

  if (files.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <PageHeader
            title="Gerenciamento de Arquivos"
            description="Integração com Google Drive da equipe"
          ></PageHeader>

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

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {feedback && (
          <Feedback type={feedback.type} message={feedback.message} />
        )}

        <PageHeader
          title="Gerenciamento de Arquivos"
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

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center">
            <div>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nome, tipo ou subtipo..."
              />
            </div>

            <FilterSelect
              value={filterType}
              onChange={setFilterType}
              options={allTypes.map((type) => ({ value: type, label: type }))}
              placeholder="Todos os Tipos"
            />

            <FilterSelect
              value={filterSubtype}
              onChange={setFilterSubtype}
              options={allSubtypes.map((subtype) => ({
                value: subtype,
                label: subtype,
              }))}
              placeholder="Todos os Subtipos"
            />
          </div>
        </Card>

        {/* MOBILE */}
        <div className="block lg:hidden space-y-3">
          {filteredFiles.map((file) => (
            <MobileCard key={file.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs opacity-60">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MobileCardItem
                  label="Modificado"
                  value={formatDate(file.modifiedTime)}
                />
                <MobileCardItem
                  label="Tipo"
                  value={(file.mimeType || "-").split("/")[0]}
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

        {/* DESKTOP */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableHeadCell>Nome</TableHeadCell>
              <TableHeadCell>Tipo</TableHeadCell>
              <TableHeadCell>Subtipo</TableHeadCell>
              <TableHeadCell>Tamanho</TableHeadCell>
              <TableHeadCell>Modificado</TableHeadCell>
              <TableHeadCell className="text-center">Ações</TableHeadCell>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => {
                const [type = "-", subtype = "-"] = (
                  file.mimeType || "-"
                ).split("/");
                const prettySubtype = subtype.split('.').pop();
                return (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="font-medium truncate max-w-xs">
                        {file.name}
                      </div>
                    </TableCell>
                    <TableCell>{type}</TableCell>
                    <TableCell>{prettySubtype}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>{formatDate(file.modifiedTime)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(file.id, file.name)}
                          className="btn btn-primary btn-xs"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="btn btn-error btn-xs flex items-center gap-1"
                          disabled={deletingId === file.id}
                        >
                          <TrashIcon className="w-4 h-4" />
                          {deletingId === file.id ? "Excluindo..." : "Excluir"}
                        </button>

                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-accent btn-xs"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default FileListPage;
