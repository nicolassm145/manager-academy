# Endpoints de Eventos

## Participantes

### Listar participantes de um evento
- **GET** `/api/v1/eventos/{eventoId}/participantes`
- **Descrição:** Retorna todos os participantes do evento.
- **Parâmetros:**
  - `eventoId` (int) — ID do evento
- **Resposta:** Array de participantes

---

### Participar de um evento
- **POST** `/api/v1/eventos/{eventoId}/participar`
- **Descrição:** Adiciona o usuário como participante do evento.
- **Parâmetros:**
  - `eventoId` (int) — ID do evento
- **Body:**
```json
{
  "membroId": int, // ID do membro (opcional, normalmente o próprio usuário)
  "status": "pendente" | "confirmado" | "recusado", // status da participação
  "observacao": string // observação (opcional)
}
```
- **Resposta:** Participante criado/atualizado

---

### Atualizar participante
- **PATCH** `/api/v1/eventos/participantes/{participanteId}`
- **Descrição:** Atualiza o status ou observação do participante.
- **Parâmetros:**
  - `participanteId` (int) — ID do participante
- **Body:**
```json
{
  "status": "pendente" | "confirmado" | "recusado",
  "observacao": string
}
```
- **Resposta:** Participante atualizado

---

## Tarefas

### Listar tarefas de um evento
- **GET** `/api/v1/eventos/{eventoId}/tarefas`
- **Descrição:** Retorna todas as tarefas do evento.
- **Parâmetros:**
  - `eventoId` (int) — ID do evento
- **Resposta:** Array de tarefas

---

### Adicionar tarefa ao evento
- **POST** `/api/v1/eventos/{eventoId}/tarefas`
- **Descrição:** Adiciona uma nova tarefa ao evento.
- **Parâmetros:**
  - `eventoId` (int) — ID do evento
- **Body:**
```json
{
  "membroId": int, // ID do membro responsável
  "descricao": string // descrição da tarefa
}
```
- **Resposta:** Tarefa criada

---

### Atualizar tarefa
- **PATCH** `/api/v1/eventos/tarefas/{tarefaId}`
- **Descrição:** Atualiza a descrição ou status de conclusão da tarefa.
- **Parâmetros:**
  - `tarefaId` (int) — ID da tarefa
- **Body:**
```json
{
  "descricao": string,
  "concluida": bool
}
```
- **Resposta:** Tarefa atualizada

---

## Observações Gerais
- Todos os endpoints exigem autenticação (JWT).
- O usuário autenticado é obtido via `getCurrentUser`.
- Os parâmetros de rota são obrigatórios.
- Os bodies devem ser enviados em JSON.
