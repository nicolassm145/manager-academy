const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl opacity-60 mb-8">Página não encontrada</p>
        <a href="/dashboard" className="btn btn-link">
          Voltar
        </a>
      </div>
    </div>
  );
};
export default NotFoundPage;
