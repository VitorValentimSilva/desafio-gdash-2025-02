# Weather Pipeline — Full Stack (Python → RabbitMQ → Go → NestJS → Frontend)

Este projeto implementa uma pipeline completa de coleta, processamento e exposição de dados meteorológicos, composta por:

- **Python Weather Producer** → coleta dados e envia para RabbitMQ
- **Go Worker** → consome mensagens e envia para API
- **NestJS API** → processa, armazena e expõe endpoints + Swagger
- **React Frontend (Vite)** → interface final
- **Docker Compose** para orquestrar tudo

---

## 📦 Como rodar tudo com Docker Compose

### 1️⃣ Crie o arquivo `.env` usando o `.env.example`

Este projeto utiliza variáveis de ambiente carregadas automaticamente pelo Docker Compose.

Para rodar, basta executar:

```sh
cp .env.example .env
```

👉 Caso o ambiente não tenha `cp` (Windows), copie manualmente o conteúdo.

> O Docker Compose automaticamente carrega as variáveis do arquivo `.env` (na raiz do projeto).  
> Portanto **não é necessário configurar nada extra** — basta manter o arquivo `.env` na raiz.

---

### 2️⃣ Subir tudo com um único comando

```sh
docker compose up -d --build
```

O Docker irá:

- Ler o arquivo `.env`
- Subir RabbitMQ, MongoDB, Nest API, Worker Go, Producer Python, Frontend

---

## 🐍 Como rodar apenas o serviço Python (Weather Producer)

> Use isso apenas se quiser rodar standalone, fora do Docker.

Dentro de `services/python-producer/`:

```sh
pip install -r requirements.txt
python main.py
```

Certifique-se de configurar no `.env`:

```
LAT=
LON=
CITY=
INTERVAL_SECONDS=
RABBITMQ_URL=
RABBITMQ_QUEUE=
```

---

## 🦫 Como rodar o Worker Go individualmente

Dentro de `services/go-worker/`:

```sh
go mod tidy
go run main.go
```

Requer as variáveis:

```
RABBITMQ_URL=
RABBITMQ_QUEUE=
NEST_API_URL=
WORKER_MAX_RETRIES=
WORKER_HTTP_TIMEOUT_SECONDS=
```

---

## 🟦 Como rodar o NestJS API localmente

Dentro de `services/nest-api/`:

```sh
npm install
npm run start:dev
```

Requer:

```
MONGO_URI=
JWT_SECRET=
DEFAULT_ADMIN_EMAIL=
DEFAULT_ADMIN_PASS=
```

---

## 🖥️ Como rodar o Frontend React (Vite)

Dentro de `services/frontend/`:

```sh
npm install
npm run dev
```

Requer:

```
VITE_API_URL=
VITE_DEFAULT_CITY=
```

---

# 🌐 URLs Principais

| Serviço                | URL                            |
| ---------------------- | ------------------------------ |
| **Swagger (API Docs)** | http://localhost:3000/api/docs |
| **Frontend**           | http://localhost:5173/         |
| **RabbitMQ Dashboard** | http://localhost:15672/        |
| **MongoDB**            | mongodb://localhost:27017      |

---

# 👤 Usuário Padrão (Acesso Inicial)

A API cria automaticamente um administrador no primeiro boot.

```
Email: admin@example.com
Senha: 123456
```

Use esse login no frontend em `http://localhost:5173/`.

---

# 🧱 Estrutura do Projeto

```
/
├── docker-compose.yml
├── .env
├── .env.example
├── services/
│   ├── nest-api/
│   ├── go-worker/
│   ├── python-producer/
│   └── frontend/
└── README.md
```

---

# ⚙️ Como o Docker usa o `.env`

O Docker Compose carrega automaticamente o arquivo `.env` se ele estiver na raiz do projeto.

**Isso significa que você só precisa:**

```sh
cp .env.example .env
docker compose up -d --build
```

E tudo funcionará automaticamente.

---

# 🛠️ Tecnologias Usadas

- **NestJS**
- **MongoDB**
- **RabbitMQ**
- **Go**
- **Python**
- **React + Vite**
- **Docker Compose**

---
