import React, { useState, useEffect, useMemo } from "react";
import { Layout } from "../../components/layout/LayoutComponent";
import { useAuth } from "../../context/AuthContext";

import {
  listDriveFiles,
  uploadFile,
  downloadFile,
  getAuthorizationUrl,
  deleteDriveFile,
  createDriveFolder,
  renameDriveFile,
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
  FilterSelect,
  SearchBar,
} from "../../components/ui";
import {
  CloudArrowUpIcon,
  CloudIcon,
  ArrowDownTrayIcon,
  PresentationChartLineIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  FolderIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  TableCellsIcon,
  DocumentTextIcon,
  DocumentIcon,
  LinkIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TrashIcon,
  // EyeIcon removed (unused)
} from "@heroicons/react/24/outline";

import { Feedback } from "../../components/ui/FeedbackComponent";

const FileListPage = () => {
  const { user } = useAuth();

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderStack, setFolderStack] = useState<Array<{ id: string | undefined; name: string }>>([{ id: undefined, name: "Raiz" }]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [driveConnected, setDriveConnected] = useState(true);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const [filterType, setFilterType] = useState("");
  const [filterSubtype, setFilterSubtype] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DriveFile | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string | null; name: string }>({ id: null, name: "" });
  const [deleting, setDeleting] = useState(false);

  const handleRename = async () => {
    if (!renameTarget || !newFileName.trim() || !user?.equipe) return;
    setRenaming(true);
    try {
      const equipeIdNumber = Number(user.equipe);
      await renameDriveFile(equipeIdNumber, renameTarget.id, newFileName.trim());
      setFeedback({ type: "success", message: "Nome alterado com sucesso!" });
      setShowRenameModal(false);
      setRenameTarget(null);
      setNewFileName("");
      await loadFiles(currentFolderId);
    } catch (error: any) {
      setFeedback({ type: "error", message: error?.message || "Erro ao renomear" });
    } finally {
      setRenaming(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user?.equipe) return;
    setCreatingFolder(true);
    try {
      const equipeIdNumber = Number(user.equipe);
      await createDriveFolder(newFolderName.trim(), equipeIdNumber, currentFolderId);
      setFeedback({ type: "success", message: "Pasta criada com sucesso!" });
      setShowCreateFolder(false);
      setNewFolderName("");
      await loadFiles(currentFolderId);
    } catch (error: any) {
      setFeedback({ type: "error", message: error?.message || "Erro ao criar pasta" });
    } finally {
      setCreatingFolder(false);
    }
  };

  useEffect(() => {
    loadFiles(currentFolderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId]);

  const loadFiles = async (folderId?: string) => {
    try {
      setLoading(true);
      const data = await listDriveFiles(folderId);
      setFiles(data);
      setDriveConnected(true);
    } catch (error: any) {
      if (error?.message?.includes("Drive vinculado") || error?.message?.includes("404")) {
        setDriveConnected(false);
        setFiles([]);
      } else {
        setFeedback({
          type: "error",
          message: "Erro ao carregar arquivos do Google Drive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnterFolder = (folder: DriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderStack((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  // handleGoBack removed (unused)

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

  const handleUpload = async (fileList: FileList | null) => {
    const file = fileList?.[0];
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
      await uploadFile(file, equipeIdNumber, currentFolderId || undefined);
      setFeedback({
        type: "success",
        message: "Arquivo enviado com sucesso!",
      });
      await loadFiles(currentFolderId);
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Erro ao enviar arquivo",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (user?.role === "lider") {
      handleUpload(e.dataTransfer.files);
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
    setDeleting(true);
    try {
      await deleteDriveFile(fileId);
      setFeedback({
        type: "success",
        message: "Arquivo excluído com sucesso!",
      });
      setShowDeleteModal({ id: null, name: "" });
      await loadFiles(currentFolderId);
    } catch (error) {
      setFeedback({ type: "error", message: "Erro ao excluir arquivo" });
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  const handleCardClick = (file: DriveFile) => {
    const isFolder = file.mimeType === "application/vnd.google-apps.folder";
    if (isFolder) {
      handleEnterFolder(file);
    } else if (file.webViewLink) {
      window.open(file.webViewLink, "_blank");
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.folder") {
      return { icon: FolderIcon, color: "text-yellow-500", bg: "bg-yellow-50" };
    }

    const [type, subtype] = mimeType.split("/");

    if (type === "image") {
      return { icon: PhotoIcon, color: "text-pink-500", bg: "bg-pink-50" };
    }
    if (type === "video") {
      return {
        icon: VideoCameraIcon,
        color: "text-purple-500",
        bg: "bg-purple-50",
      };
    }
    if (type === "audio") {
      return {
        icon: MusicalNoteIcon,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
      };
    }

    if (mimeType.includes("spreadsheet")) {
      return {
        icon: TableCellsIcon,
        color: "text-green-600",
        bg: "bg-green-50",
      };
    }
    if (mimeType.includes("document")) {
      return {
        icon: DocumentTextIcon,
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    }
    if (mimeType.includes("presentation")) {
      return {
        icon: PresentationChartLineIcon,
        color: "text-orange-500",
        bg: "bg-orange-50",
      };
    }

    if (subtype?.includes("zip") || subtype?.includes("rar") || subtype?.includes("compressed")) {
      return {
        icon: ArchiveBoxIcon,
        color: "text-amber-600",
        bg: "bg-amber-50",
      };
    }

    if (type === "text" && (subtype?.includes("javascript") || subtype?.includes("python") || subtype?.includes("html"))) {
      return {
        icon: CodeBracketIcon,
        color: "text-cyan-600",
        bg: "bg-cyan-50",
      };
    }

    if (subtype === "pdf") {
      return { icon: DocumentTextIcon, color: "text-red-600", bg: "bg-red-50" };
    }

    return { icon: DocumentIcon, color: "text-gray-500", bg: "bg-gray-50" };
  };

  const formatFileSize = (bytes?: number | string) => {
    if (!bytes) return "N/A";
    const num = typeof bytes === "string" ? Number(bytes) : bytes;
    if (!num || isNaN(num)) return "N/A";
    const kb = num / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
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

  const SUBTYPE_LABELS: Record<string, string> = {
    "vnd.google-apps.folder": "folder",
    pdf: "PDF",
    markdown: "Markdown",
    "svg+xml": "SVG",
    "vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
    // Adicione outros mapeamentos conforme necessário
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
      )
        .filter(Boolean)
        .map((subtype) => ({
          value: subtype,
          label: SUBTYPE_LABELS[subtype] || subtype,
        })),
    [files]
  );

  const { folders, regularFiles } = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    const filtered = files.filter((file) => {
      const [type = "-", subtype = "-"] = (file.mimeType || "-").split("/");

      const matchType = !filterType || type === filterType;
      const matchSubtype = !filterSubtype || subtype === filterSubtype;

      const inName = file.name?.toLowerCase().includes(q);
      const inType = type.toLowerCase().includes(q);
      const inSubtype = subtype.toLowerCase().includes(q);

      const matchSearch = !q || inName || inType || inSubtype;

      return matchType && matchSubtype && matchSearch;
    });

    return {
      folders: filtered.filter((f) => f.mimeType === "application/vnd.google-apps.folder"),
      regularFiles: filtered.filter((f) => f.mimeType !== "application/vnd.google-apps.folder"),
    };
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

  if (!driveConnected) {
    return (
      <Layout>
        <div className="space-y-6">
          <PageHeader title="Gerenciamento de Arquivos" description="Integração com Google Drive da equipe" />
          <Card>
            <EmptyState
              icon={CloudIcon}
              title="Google Drive não conectado"
              description={
                user?.role === "lider"
                  ? "Conecte sua equipe ao Google Drive para compartilhar arquivos"
                  : "O líder da sua equipe ainda não conectou o Google Drive"
              }
            >
              {user?.role === "lider" && (
                <button onClick={handleConnect} className="btn btn-primary mt-4">
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
      <div className="space-y-4 sm:space-y-6" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        {feedback && <Feedback type={feedback.type} message={feedback.message} />}

        {isDragging && user?.role === "lider" && (
          <div className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-dashed border-blue-500">
              <CloudArrowUpIcon className="w-20 h-20 text-blue-500 mx-auto mb-4" />
              <p className="text-2xl font-bold text-gray-800">Solte o arquivo aqui</p>
            </div>
          </div>
        )}

        <PageHeader title="Gerenciamento de Arquivos" description={`Arquivos da pasta da equipe ${user?.equipeNome || ""}`}>
          <div className="flex items-center gap-2">
            {user?.role === "lider" && (
              <>
                <label className="flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                  <CloudArrowUpIcon className="w-5 h-5" />
                  {uploading ? "Enviando..." : "Enviar"}
                  <input type="file" onChange={handleFileInput} disabled={uploading} className="hidden" />
                </label>
                <button className="btn btn-secondary ml-2" onClick={() => setShowCreateFolder(true)} disabled={creatingFolder}>
                  <FolderIcon className="w-5 h-5 mr-1" />
                  Nova Pasta
                </button>
              </>
            )}
          </div>
        </PageHeader>
        {showCreateFolder && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
              <button className="absolute top-2 right-2 btn btn-ghost btn-sm" onClick={() => setShowCreateFolder(false)} disabled={creatingFolder}>
                ✕
              </button>
              <h2 className="text-lg font-bold mb-4">Criar nova pasta</h2>
              <input
                type="text"
                className="input input-bordered w-full mb-4"
                placeholder="Nome da pasta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                disabled={creatingFolder}
                autoFocus
              />
              <button className="btn btn-primary w-full" onClick={handleCreateFolder} disabled={creatingFolder || !newFolderName.trim()}>
                {creatingFolder ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        )}

        <Card>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center">
              <div>
                <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nome, tipo..." />
              </div>
              <div>
                <FilterSelect
                  value={filterType}
                  onChange={setFilterType}
                  options={allTypes.map((type) => ({ value: type, label: type }))}
                  placeholder="Todos os Tipos"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm text-sm"
                />
              </div>
              <div>
                <FilterSelect
                  value={filterSubtype}
                  onChange={setFilterSubtype}
                  options={[{ value: "", label: "Todos os Subtipos" }, ...allSubtypes]}
                  placeholder="Todos os Subtipos"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm text-sm"
                />
              </div>
            </div>
          </div>
        </Card>
        <div className="flex items-center gap-2 flex-wrap">
          <nav className="flex items-center gap-1 text-sm">
            {folderStack.map((folder, idx) => (
              <React.Fragment key={folder.id || `root-${idx}`}>
                {idx > 0 && <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
                <button
                  className={`px-2 py-1 rounded hover:bg-gray-100 transition-colors ${
                    idx === folderStack.length - 1 ? "font-bold text-blue-600" : "text-gray-600"
                  }`}
                  onClick={() => {
                    if (idx === folderStack.length - 1) return;
                    setCurrentFolderId(folder.id);
                    setFolderStack(folderStack.slice(0, idx + 1));
                  }}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <div className="btn-group">
              <button onClick={() => setViewMode("grid")} className={`btn btn-sm ${viewMode === "grid" ? "btn-active" : "btn-ghost"}`} title="Grid">
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode("list")} className={`btn btn-sm ${viewMode === "list" ? "btn-active" : "btn-ghost"}`} title="Lista">
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {folders.length === 0 && regularFiles.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <DocumentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhum arquivo encontrado</p>
            </div>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="space-y-6">
            {/* Pastas */}
            {folders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 px-1">Pastas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="group relative bg-white rounded-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer p-4 flex items-center gap-3"
                    >
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <FolderIcon className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => handleEnterFolder(folder)}>
                        <h3 className="font-semibold text-sm text-gray-800 truncate" title={folder.name}>
                          {folder.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">{formatDate(folder.modifiedTime)}</p>
                      </div>
                      <div className="flex gap-2">
                        {user?.role === "lider" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenameTarget(folder);
                                setNewFileName(folder.name);
                                setShowRenameModal(true);
                              }}
                              className="btn btn-info btn-sm btn-circle"
                              title="Renomear pasta"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteModal({ id: folder.id, name: folder.name });
                              }}
                              className="btn btn-error btn-sm btn-circle"
                              disabled={deletingId === folder.id}
                              title="Excluir pasta"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Arquivos */}
            {regularFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 px-1">Arquivos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {regularFiles.map((file) => {
                    const { icon: Icon, color, bg } = getFileIcon(file.mimeType || "");
                    const isImage = file.mimeType?.startsWith("image/");

                    return (
                      <div
                        key={file.id}
                        onClick={() => handleCardClick(file)}
                        className="group relative bg-white rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
                      >
                        <div className={`${bg} h-32 flex items-center justify-center relative flex-shrink-0`}>
                          {isImage && file.thumbnailLink ? (
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${file.thumbnailLink})`,
                              }}
                            />
                          ) : (
                            <Icon className={`w-16 h-16 ${color}`} />
                          )}
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-semibold text-gray-600">
                            {formatFileSize(file.size)}
                          </div>
                        </div>

                        <div className="p-3 h-16 flex flex-col justify-center">
                          <button
                            className="font-semibold text-sm text-blue-600 truncate mb-1 text-left bg-transparent border-none p-0 m-0 cursor-pointer hover:underline"
                            style={{ background: "none" }}
                            title={file.name}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (file.webViewLink) window.open(file.webViewLink, "_blank");
                            }}
                          >
                            {file.name}
                          </button>
                          <p className="text-xs text-gray-500 truncate">{formatDate(file.modifiedTime)}</p>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-3 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file.id, file.name);
                            }}
                            className="btn btn-primary btn-sm btn-circle"
                            title="Baixar"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                          {user?.role === "lider" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenameTarget(file);
                                  setNewFileName(file.name);
                                  setShowRenameModal(true);
                                }}
                                className="btn btn-info btn-sm btn-circle"
                                title="Renomear"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteModal({ id: file.id, name: file.name });
                                }}
                                className="btn btn-error btn-sm btn-circle"
                                disabled={deletingId === file.id}
                                title="Excluir"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableHeadCell>Nome</TableHeadCell>
                <TableHeadCell>Tipo</TableHeadCell>
                <TableHeadCell>Tamanho</TableHeadCell>
                <TableHeadCell>Modificado</TableHeadCell>
                <TableHeadCell className="text-center">Ações</TableHeadCell>
              </TableHeader>
              <TableBody>
                {[...folders, ...regularFiles].map((file) => {
                  const { icon: Icon, color } = getFileIcon(file.mimeType || "");
                  const [, subtype = "-"] = (file.mimeType || "-").split("/");
                  const prettySubtype = subtype.split(".").pop();
                  const isFolder = file.mimeType === "application/vnd.google-apps.folder";

                  return (
                    <TableRow key={file.id} className={isFolder ? "cursor-pointer hover:bg-gray-50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${color} flex-shrink-0`} />
                          <button
                            className={`font-medium truncate max-w-xs text-left bg-transparent border-none p-0 m-0 cursor-pointer ${
                              isFolder ? "" : "text-blue-600 hover:underline"
                            }`}
                            style={{ background: "none" }}
                            onClick={() => {
                              if (isFolder) {
                                handleEnterFolder(file);
                              } else if (file.webViewLink) {
                                window.open(file.webViewLink, "_blank");
                              }
                            }}
                          >
                            {file.name}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="badge badge-ghost">{isFolder ? "Pasta" : prettySubtype}</span>
                      </TableCell>
                      <TableCell>{isFolder ? "-" : formatFileSize(file.size)}</TableCell>
                      <TableCell>{formatDate(file.modifiedTime)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {user?.role === "lider" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenameTarget(file);
                                  setNewFileName(file.name);
                                  setShowRenameModal(true);
                                }}
                                className="btn btn-info btn-xs"
                                title={isFolder ? "Renomear pasta" : "Renomear"}
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteModal({ id: file.id, name: file.name });
                                }}
                                className="btn btn-error btn-xs"
                                disabled={deletingId === file.id}
                                title={isFolder ? "Excluir pasta" : "Excluir"}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {!isFolder && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(file.id, file.name);
                              }}
                              className="btn btn-primary btn-xs"
                              title="Baixar"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {previewImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-4xl max-h-[90vh]">
              <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 btn btn-circle btn-ghost text-white">
                ✕
              </button>
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
            </div>
          </div>
        )}

        {showRenameModal && renameTarget && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
              <button className="absolute top-2 right-2 btn btn-ghost btn-sm" onClick={() => setShowRenameModal(false)} disabled={renaming}>
                ✕
              </button>
              <h2 className="text-lg font-bold mb-4">Renomear</h2>
              <input
                type="text"
                className="input input-bordered w-full mb-4"
                placeholder="Novo nome"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                disabled={renaming}
                autoFocus
              />
              <button className="btn btn-primary w-full" onClick={handleRename} disabled={renaming || !newFileName.trim()}>
                {renaming ? "Renomeando..." : "Renomear"}
              </button>
            </div>
          </div>
        )}

        {showDeleteModal.id && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
              <button
                className="absolute top-2 right-2 btn btn-ghost btn-sm"
                onClick={() => setShowDeleteModal({ id: null, name: "" })}
                disabled={deleting}
              >
                ✕
              </button>
              <h2 className="text-lg font-bold mb-4">Confirmar exclusão</h2>
              <p className="mb-4">Tem certeza que deseja excluir "{showDeleteModal.name}"?</p>
              <button className="btn btn-error w-full" onClick={() => handleDelete(showDeleteModal.id!)} disabled={deleting}>
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FileListPage;
