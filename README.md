# Manager Academy

Sistema de gerenciamento de academia com funcionalidades de administração de equipes, membros, inventário e finanças.

## Tecnologias

- **Frontend Framework**: React 19.1.1 com TypeScript
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.5
- **Styling**: Tailwind CSS 4.1.16 + DaisyUI 5.4.3
- **Icons**: Heroicons 2.2.0
- **Linting**: ESLint 9.36.0
- **Backend API**: FastAPI (Python) - http://127.0.0.1:8000/api/v1

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── config/             # Configurações da aplicação
│   └── api.ts          # Configuração da API e helpers
├── constants/          # Constantes da aplicação
│   └── courses.ts
├── context/            # Context API do React
│   └── AuthContext.tsx # Contexto de autenticação
├── data/               # Dados estáticos
│   └── teams.json
├── hooks/              # Custom React Hooks
│   └── usePermissions.ts
├── pages/              # Páginas da aplicação
├── routes/             # Configuração de rotas
│   └── Router.tsx
├── services/           # Serviços de API
│
├── types/              # Definições de tipos TypeScript
│
└── utils/              # Funções utilitárias
    └── permissions.ts
```

## Funcionalidades

### Autenticação

- Login com JWT (JSON Web Tokens)
- Proteção de rotas com ProtectedRoute
- Context API para gerenciamento de estado de autenticação
- Logout com limpeza de token

### Módulos Principais

#### Equipes (Teams)

- Listagem de equipes
- Criação de novas equipes
- Edição de equipes existentes
- Visualização detalhada
- Exclusão de equipes (com confirmação)

#### Membros (Members)

- Gerenciamento completo de membros
- CRUD completo (Create, Read, Update, Delete)
- Associação com equipes
- Controle de datas de início

## Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Backend API rodando em http://127.0.0.1:8000

### Passos

1. Clone o repositório:

```bash
git clone <repository-url>
cd manager-academy
```

2. Instale as dependências:

```bash
npm install
```

3. (Opcional) Configure a URL da API:
   Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Acesse a aplicação em: http://localhost:5173

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm run preview` - Preview da build de produção
- `npm run lint` - Executa o linter

## Testes

### Testes End-to-End (Selenium)

O projeto inclui testes automatizados usando Selenium WebDriver.

#### Pré-requisitos para Testes

- Python 3.11+
- pytest
- selenium
- Microsoft Edge instalado

#### Instalação das Dependências de Teste

```bash
cd test
pip install pytest selenium
```

#### Executando os Testes

```bash
cd test
pytest Release01.py -v -s
```

**Parâmetros:**

- `-v` - Verbose (mostra detalhes)
- `-s` - Mostra prints no console
- `--tb=line` - Mostra apenas uma linha de erro (opcional)

#### Estrutura do Teste (Release01.py)

O teste cobre o seguinte fluxo:

1. Login como administrador
2. Criação de duas equipes (BlackBee e teste)
3. Criação de um membro líder (Lider01)
4. Exclusão da equipe "teste"
5. Logout do administrador
6. Login como líder e criação de membro (membro01)
7. Logout do líder
8. Login como membro
9. Navegação e teste de configurações
10. Tentativa de alteração de email (com tratamento de erro)
11. Logout do membro
12. Validação de logins

**Importante**: Antes de executar os testes, certifique-se de que o banco de dados está limpo (sem equipes ou membros previamente criados) para evitar conflitos.

## Configuração da API

A aplicação se comunica com uma API FastAPI. A URL base pode ser configurada através da variável de ambiente `VITE_API_BASE_URL` ou usa o padrão `http://127.0.0.1:8000/api/v1`.

## Licença

Este projeto está sob a licença especificada no arquivo LICENSE.
