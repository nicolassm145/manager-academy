# 📋 API Endpoints - League Manager

## Base URL
```
http://127.0.0.1:8000
```

---

## 🔐 Autenticação

### Login
**POST** `/api/v1/auth/login`

Fazer login e receber token JWT.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "nomeCompleto": "João Silva",
    "email": "usuario@example.com",
    "tipoAcesso": "Administrador",
    "equipeId": null,
    "ativo": true
  }
}
```

---

## 👥 Usuários

### Criar Usuário
**POST** `/api/v1/users/criar` 🔒 *Admin, Líder*

Criar um novo usuário no sistema.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nomeCompleto": "Maria Santos",
  "email": "maria@example.com",
  "password": "senha123",
  "tipoAcesso": "Membro",
  "equipeId": 1
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "nomeCompleto": "Maria Santos",
  "email": "maria@example.com",
  "tipoAcesso": "Membro",
  "equipeId": 1,
  "ativo": true
}
```

---

### Listar Todos os Usuários
**GET** `/api/v1/users/listarTudo?skip=0&limit=50` 🔒 *Admin*

Listar todos os usuários (paginado).

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `skip` (opcional): número de registros para pular (default: 0)
- `limit` (opcional): número máximo de registros (default: 50)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nomeCompleto": "João Silva",
    "email": "joao@example.com",
    "tipoAcesso": "Administrador",
    "equipeId": null,
    "ativo": true
  },
  {
    "id": 2,
    "nomeCompleto": "Maria Santos",
    "email": "maria@example.com",
    "tipoAcesso": "Membro",
    "equipeId": 1,
    "ativo": true
  }
]
```

---

### Obter Usuário por ID
**GET** `/api/v1/users/listar/{user_id}` 🔒 *Autenticado*

Obter dados de um usuário específico.

**Regras de acesso:**
- Admin: pode ver qualquer usuário
- Líder: pode ver usuários da sua equipe
- Membro: pode ver apenas seus próprios dados

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": 2,
  "nomeCompleto": "Maria Santos",
  "email": "maria@example.com",
  "tipoAcesso": "Membro",
  "equipeId": 1,
  "ativo": true
}
```

---

### Atualizar Usuário
**PUT** `/api/v1/users/atualizar/{user_id}` 🔒 *Depende do role*

Atualizar dados de um usuário.

**Regras de permissão:**
- **Administrador**: pode alterar qualquer campo de qualquer usuário
- **Líder**: pode alterar qualquer campo de usuários da sua equipe
- **Membro**: pode alterar apenas seu próprio email e senha

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nomeCompleto": "Maria Santos Silva",
  "email": "maria.nova@example.com",
  "password": "novaSenha123",
  "tipoAcesso": "Líder",
  "equipeId": 2
}
```
*Nota: Envie apenas os campos que deseja atualizar.*

**Response:** `200 OK`
```json
{
  "id": 2,
  "nomeCompleto": "Maria Santos Silva",
  "email": "maria.nova@example.com",
  "tipoAcesso": "Líder",
  "equipeId": 2,
  "ativo": true
}
```

---

### Desativar Usuário
**DELETE** `/api/v1/users/deletar/{user_id}` 🔒 *Admin, Líder*

Desativar um usuário (soft delete).

**Regras:**
- Admin: pode desativar qualquer usuário
- Líder: pode desativar apenas membros da sua equipe

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "detail": "Usuário Maria Santos desativado com sucesso."
}
```

---

## 🏆 Equipes

### Criar Equipe
**POST** `/api/v1/equipes/criar` 🔒 *Admin*

Criar uma nova equipe.

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nome": "Equipe Alpha",
  "descricao": "Equipe de desenvolvimento frontend"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "nome": "Equipe Alpha",
  "descricao": "Equipe de desenvolvimento frontend",
  "membros": []
}
```

---

### Listar Todas as Equipes
**GET** `/api/v1/equipes/listAll` 🔒 *Admin, Líder*

Listar todas as equipes do sistema.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nome": "Equipe Alpha",
    "descricao": "Equipe de desenvolvimento frontend",
    "membros": [...]
  },
  {
    "id": 2,
    "nome": "Equipe Beta",
    "descricao": "Equipe de desenvolvimento backend",
    "membros": [...]
  }
]
```

---

### Obter Equipe por ID
**GET** `/api/v1/equipes/listar/{equipe_id}` 🔒 *Autenticado*

Obter dados de uma equipe específica.

**Regras de acesso:**
- Admin: pode ver qualquer equipe
- Líder/Membro: pode ver apenas sua própria equipe

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "nome": "Equipe Alpha",
  "descricao": "Equipe de desenvolvimento frontend",
  "membros": [
    {
      "id": 2,
      "nomeCompleto": "Maria Santos",
      "email": "maria@example.com",
      "tipoAcesso": "Líder",
      "equipeId": 1,
      "ativo": true
    }
  ]
}
```

---

### Atualizar Equipe
**PUT** `/api/v1/equipes/atualizar/{equipe_id}` 🔒 *Admin, Líder*

Atualizar dados de uma equipe.

**Regras:**
- Admin: pode atualizar qualquer equipe
- Líder: pode atualizar apenas sua própria equipe

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nome": "Equipe Alpha Pro",
  "descricao": "Equipe de desenvolvimento frontend avançado"
}
```
*Nota: Envie apenas os campos que deseja atualizar.*

**Response:** `200 OK`
```json
{
  "id": 1,
  "nome": "Equipe Alpha Pro",
  "descricao": "Equipe de desenvolvimento frontend avançado",
  "membros": [...]
}
```

---

### Deletar Equipe
**DELETE** `/api/v1/equipes/deletar/{equipe_id}` 🔒 *Admin*

Deletar uma equipe do sistema.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "detail": "Equipe deletada com sucesso"
}
```

---

### Listar Membros da Equipe
**GET** `/api/v1/equipes/{equipe_id}/membros` 🔒 *Autenticado*

Listar todos os membros de uma equipe.

**Regras de acesso:**
- Admin: pode ver membros de qualquer equipe
- Líder/Membro: pode ver membros apenas da sua equipe

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "nomeCompleto": "Maria Santos",
    "email": "maria@example.com",
    "tipoAcesso": "Líder",
    "equipeId": 1,
    "ativo": true
  },
  {
    "id": 3,
    "nomeCompleto": "Pedro Oliveira",
    "email": "pedro@example.com",
    "tipoAcesso": "Membro",
    "equipeId": 1,
    "ativo": true
  }
]
```

---

## 🏥 Health Check

### Root
**GET** `/`

Mensagem de boas-vindas da API.

**Response:** `200 OK`
```json
{
  "message": "🚀 League Manager API rodando com sucesso!"
}
```

---

### Database Health Check
**GET** `/health/db`

Verificar conexão com o banco de dados.

**Response:** `200 OK`
```json
{
  "status": "Banco conectado com sucesso!"
}
```

---

## 📝 Legendas

- 🔒 = Requer autenticação (Bearer Token no header)
- **Admin** = Apenas usuários com tipoAcesso "Administrador"
- **Líder** = Usuários com tipoAcesso "Administrador" ou "Líder"
- **Membro** = Usuários com tipoAcesso "Membro"
- **Autenticado** = Qualquer usuário autenticado

---

## 🔑 Como usar o Token

Após fazer login, você receberá um `access_token`. Use-o em todas as requisições protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚠️ Códigos de Erro Comuns

- `400 Bad Request` - Dados inválidos ou email já cadastrado
- `401 Unauthorized` - Token inválido ou credenciais incorretas
- `403 Forbidden` - Sem permissão para acessar o recurso
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

---

## 🛠️ Tecnologias

- **FastAPI** - Framework web
- **SQLAlchemy** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
