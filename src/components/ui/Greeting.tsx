interface GreetingProps {
  user: any;
}

export const Greeting: React.FC<GreetingProps> = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      lider:
        user?.cargo === "Professor Orientador" || user?.cargo === "Professor"
          ? "Professor Orientador"
          : "Líder de Equipe",
      membro: "Membro",
      professor: "Professor Orientador",
    };
    return roles[role] || role;
  };

  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg p-6 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold">
        {getGreeting()}, {user?.nome?.split(" ")[0]}!
      </h1>
      <p className="text-sm sm:text-base opacity-90 mt-2">
        {getRoleLabel(user?.role || "")} •{" "}
        {user?.role === "admin"
          ? "Acesso Total"
          : user?.equipeNome ||
            (user?.equipe ? `Equipe ${user.equipe}` : "Sem equipe")}
      </p>
    </div>
  );
};
