export interface Member {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  curso: string;
  equipe: string;
  cargo: string;
  dataInicio: string;
  status: "ativo" | "inativo";
}

// Dados movidos para src/data/members.json
// Use memberService em src/services/memberService.ts para acessar/manipular
