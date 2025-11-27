# Manager Academy Frontend

![React](https://img.shields.io/badge/React-19.0%2B-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0%2B-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0%2B-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

Interface web moderna e responsiva para o sistema **League Manager**. Desenvolvida para oferecer uma experiência de usuário fluida na administração de guildas, clãs e grupos de jogos.

## 📋 Descrição

O **Manager Academy Frontend** é a camada visual do ecossistema League Manager. Construído com as tecnologias mais recentes do ecossistema React, ele consome a API RESTful para fornecer:

- **Interface Intuitiva**: Design limpo e moderno utilizando Tailwind CSS e DaisyUI.
- **Performance**: Build otimizado e rápido com Vite.
- **Tipagem Segura**: Desenvolvimento robusto com TypeScript.
- **Visualização de Dados**: Gráficos e dashboards interativos.

## ✨ Funcionalidades

- **🔐 Autenticação & Segurança**:
    - Login seguro com JWT.
    - Proteção de rotas e persistência de sessão.
    - Controle de acesso baseado em permissões (RBAC) na interface.

- **📊 Dashboard & Financeiro**:
    - Visão geral de métricas.
    - Gráficos financeiros interativos (Receitas vs Despesas) com Recharts.
    - Histórico detalhado de transações.

- **👥 Gestão de Comunidade**:
    - **Equipes**: Criação, edição e visualização de hierarquias.
    - **Membros**: Perfis detalhados, atribuição de cargos e histórico.

- **🎒 Inventário**:
    - Controle visual de itens e recursos por equipe.
    - Gestão de estoque.

- **☁️ Integrações Google**:
    - **Calendar**: Visualização de eventos e agendamentos da equipe.
    - **Files**: Navegador de arquivos integrado ao Google Drive.

## 🛠️ Requisitos

- **Node.js** 18 ou superior
- **NPM** ou **Yarn**
- **Backend API** rodando (padrão: `http://127.0.0.1:8000`)

## 🚀 Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/nicolassm145/manager-academy.git
cd manager-academy
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o ambiente**

Crie um arquivo `.env` na raiz do projeto para configurar a conexão com a API:

```bash
cp .env.example .env # se houver, ou crie manualmente
```

Conteúdo do `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## ▶️ Como Executar

### Modo de Desenvolvimento

Inicie o servidor local com Hot Module Replacement (HMR):

```bash
npm run dev
```

A aplicação estará acessível em: `http://localhost:5173`

### Build de Produção

Para gerar os arquivos estáticos otimizados para produção:

```bash
npm run build
```

Para visualizar o build localmente:

```bash
npm run preview
```

## 📂 Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis (UI Kit)
├── config/            # Configurações globais (API, etc)
├── context/           # Contextos do React (Auth, Theme)
├── data/              # Dados estáticos e mocks
├── hooks/             # Custom Hooks
├── pages/             # Páginas da aplicação (Rotas)
│   ├── Auth/          # Login e Registro
│   ├── Calendar/      # Integração Google Calendar
│   ├── Dashboard/     # Visão Geral
│   ├── Files/         # Integração Google Drive
│   ├── Finance/       # Gestão Financeira
│   ├── Inventory/     # Gestão de Inventário
│   ├── Members/       # Gestão de Membros
│   ├── Settings/      # Configurações do Sistema
│   └── Teams/         # Gestão de Equipes
├── routes/            # Configuração de rotas (Router)
├── services/          # Camada de serviço (Chamadas API)
├── types/             # Definições de tipos TypeScript
└── utils/             # Funções utilitárias
```

## 💻 Tecnologias

- **[React](https://react.dev/)**: Biblioteca para construção de interfaces.
- **[TypeScript](https://www.typescriptlang.org/)**: Superset JavaScript com tipagem estática.
- **[Vite](https://vitejs.dev/)**: Build tool de próxima geração.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS utility-first.
- **[DaisyUI](https://daisyui.com/)**: Component library para Tailwind.
- **[React Router](https://reactrouter.com/)**: Roteamento declarativo.
- **[Recharts](https://recharts.org/)**: Biblioteca de gráficos composável.
- **[Heroicons](https://heroicons.com/)**: Ícones SVG bonitos e simples.

## 🧪 Testes

O projeto inclui testes automatizados End-to-End (E2E) utilizando Selenium.

### Executando os Testes

1. Certifique-se de ter **Python 3.11+** e **Microsoft Edge** instalados.
2. Instale as dependências de teste:

```bash
cd test
pip install pytest selenium
```

3. Execute os testes:

```bash
pytest Release01.py -v -s
```

> **Nota**: Certifique-se de que o backend está rodando e o banco de dados está limpo antes de rodar os testes completos.

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`)
3. Faça o Commit de suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Faça o Push para a Branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
