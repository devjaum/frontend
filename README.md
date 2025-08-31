---

# Chat Online Project

Projeto completo de Chat Online com frontend e backend separados, utilizando **React**, **TailwindCSS**, **NestJS**, **PostgreSQL** e **WebSocket**.

---

## Estrutura do Projeto

```
chat-project/
├── backend/  # NestJS + PostgreSQL + WebSocket
└── frontend/ # React + TailwindCSS + Axios + WebSocket
```

---

## Backend

### Tecnologias

* NestJS
* TypeORM
* PostgreSQL
* WebSocket (Socket.IO)
* dotenv

### Instalação

```bash
git clone https://github.com/devjaum/backend.git
cd chat-project/backend
npm install
```

### Configuração (.env)

```
DB_HOST=localhost ou host do Render
DB_PORT=5432
DB_USER=usuario
DB_PASSWORD=senha
DB_NAME=nome_do_banco
PORT=3001
```

### Rodando localmente

```bash
npm run start:dev
```

O backend estará rodando em `http://localhost:3001`.

### Deploy no Render

1. Crie um Web Service no Render apontando para o backend.
2. Configure as **Environment Variables** com as mesmas do `.env`.
3. Render cuidará da porta automaticamente.

### Endpoints

* `POST /users/login` - login ou cadastro de usuário
* `GET /messages` - listar mensagens
* WebSocket: envia e recebe mensagens em tempo real

---

## Frontend

### Tecnologias

* React
* TailwindCSS
* Axios
* Socket.IO (WebSocket)

### Instalação

```bash
git clone https://github.com/devjaum/frontend.git
cd chat-project/frontend
npm install
```

### Configuração (.env)

```
REACT_APP_BACKEND_URL=https://backend-04cn.onrender.com
```

> Todas as variáveis precisam começar com `REACT_APP_` no React.

### Rodando localmente

```bash
npm start
```

Frontend disponível em `http://localhost:3000`.

### Build para produção

```bash
npm run build
```

* A pasta `build/` será gerada pronta para deploy.

### Deploy no Render

1. Crie um Web Service apontando para o frontend.
2. Configure **Environment Variable**:

```
REACT_APP_BACKEND_URL=https://backend-04cn.onrender.com
```

3. Configure os comandos:

* Build: `npm install && npm run build`
* Start: `npx serve -s build`

---

## Observações

* Certifique-se de que o backend esteja online antes de rodar o frontend.
* Para testes locais, ajuste `REACT_APP_BACKEND_URL` para `http://localhost:3001`.
* `synchronize: true` no TypeORM cria tabelas automaticamente, útil para testes.
* Para produção, é recomendado usar migrations no backend para maior segurança.
