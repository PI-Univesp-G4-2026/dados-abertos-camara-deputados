# 🏛️ Transparência Legislativa - Atuação Parlamentar

![Badge Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-green)
![Badge Java](https://img.shields.io/badge/Java-21-orange)
![Badge Spring](https://img.shields.io/badge/Spring_Boot-3.3.5-brightgreen)
![Badge React](https://img.shields.io/badge/React-19-blue)
![Badge PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Badge Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

Plataforma web desenvolvida para monitorar, de forma centralizada e acessível, a atuação parlamentar dos deputados federais, consumindo dados abertos diretamente da **API da Câmara dos Deputados**.

Este projeto foi desenvolvido como parte do **Projeto Integrador II** da UNIVESP, pelo **Grupo 20** — 2026/2.

## 🌐 Acesso em Produção
- **Frontend (Vercel):** [https://dados-abertos-camara-deputados.vercel.app)
- **API (Render):** [https://camara-api.onrender.com/api/deputados](https://camara-api.onrender.com/api/deputados)
---

## 🎯 Objetivo

Desenvolver um software web *Full Stack* que promova o controle social e a transparência pública, superando a fragmentação e complexidade dos dados brutos oficiais. O sistema armazena informações localmente para garantir performance, apresenta os dados de forma visual e acessível, e conta com cobertura de testes e integração contínua.

## 🚀 Funcionalidades (MVP)

- **Sincronização de Dados:** Consumo em *background* da [API de Dados Abertos da Câmara](https://dadosabertos.camara.leg.br/) para alimentar o banco de dados interno.
- **Listagem de Deputados:** Busca e filtro por nome, com paginação.
- **Ficha do Parlamentar:** Visualização detalhada com foto, partido, UF e e-mail.
- **Análise de Despesas:** Gráficos interativos de gastos da Cota Parlamentar (CEAP) por tipo de despesa e evolução mensal.
- **ETL Automatizado:** Sincronização periódica (diária às 3h) e manual via endpoint administrativo.
- **Cache Local:** Redução do número de requisições à API pública, melhorando a velocidade da aplicação e evitando *rate limits*.
- **Acessibilidade:** Estrutura semântica HTML, atributos ARIA, skip-link e navegação por teclado.

## 🛠️ Tecnologias Utilizadas

### Back-end
- **Java 21** (LTS)
- **Spring Boot 3.3.5** (Web, Data JPA, Validation, Actuator)
- **Spring Data JPA + Hibernate** para mapeamento objeto-relacional
- **Flyway** para versionamento de schema
- **Maven** para gerenciamento de dependências
- **Lombok** para redução de boilerplate
- **JUnit 5 & Mockito** para testes (a implementar)

### Banco de Dados
- **PostgreSQL 16** via **Docker Compose**
- Modelagem relacional: `deputados`, `despesas`

### Front-end
- **React 19** com **Vite**
- **React Router** para roteamento
- **Axios** para consumo da API interna
- **Recharts** para a plotagem dos gráficos
- **ESLint + eslint-plugin-jsx-a11y** para acessibilidade

### Infraestrutura & DevOps
- **Git & GitHub** para controle de versão
- **Docker & Docker Compose** para ambiente local
- **Nuvem:** preparado para *deploy* em **Vercel** (frontend) e **Digital Ocean / AWS / GCP** (backend + banco)

---

## ⚙️ Arquitetura do Sistema

1. O **Back-end (Spring Boot)** realiza *requests* programados à API da Câmara (ETL) e persiste os dados no **PostgreSQL** via Spring Data JPA.
2. O Back-end expõe uma **REST API própria**, com paginação e endpoints agregados para o front-end.
3. O **Front-end (React)** consome esta API interna e renderiza a interface para o usuário final.
4. Gráficos interativos são gerados com **Recharts** a partir dos dados agregados.


---

## 📦 Como rodar o projeto localmente

### Pré-requisitos

- [JDK 21](https://adoptium.net/)
- [Node.js 20+](https://nodejs.org/) e npm
- [Docker](https://docs.docker.com/engine/install/) e [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### 1. Clonar o repositório

```bash
git clone https://github.com/cayopereira/dados-abertos-camara-deputados.git
cd dados-abertos-camara-deputados
```

### 2. Subir o banco de dados (PostgreSQL)

```bash
docker compose up -d
```

Verifique se o container está rodando:

```bash
docker ps
# Deve mostrar o container "camara-db" na porta 5432
```

### 3. Subir o back-end

```bash
cd backend
./mvnw spring-boot:run
```

Na primeira execução, o Flyway roda as migrations e o CommandLineRunner sincroniza automaticamente os ~648 deputados da legislatura atual.

A API estará disponível em http://localhost:8080

### 4. Subir o front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173

## 🗂️ Estrutura do Projeto

```text
dados-abertos-camara-deputados/
├── backend/                          # Spring Boot
│   ├── src/main/java/br/com/univesp/camara/
│   │   ├── CamaraApplication.java
│   │   ├── client/                   # Consumo da API da Câmara
│   │   ├── controller/               # Endpoints REST
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── etl/                      # Pipeline ETL
│   │   ├── model/                    # Entidades JPA
│   │   └── repository/               # Spring Data JPA
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/             # Flyway (V1, V2, V3)
│   └── pom.xml
├── frontend/                         # React + Vite
│   ├── src/
│   │   ├── pages/                    # ListaDeputados, FichaDeputado
│   │   ├── services/                 # api.js (Axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── docker-compose.yml                # PostgreSQL 16
├── .gitignore
└── README.md
```

## 🔄 ETL (Extract, Transform, Load)

O projeto possui um pipeline de ETL que sincroniza os dados da API da Câmara para o banco local.

- Extract: requisições paginadas à API (/deputados e /deputados/{id}/despesas)

- Transform: mapeamento JSON → entidades JPA, deduplicação

- Load: persistência no PostgreSQL

Agendamento: `@Scheduled(cron = "0 0 3 * * *")` — todos os dias às 3h da manhã.

Sincronização manual: via endpoints `/api/admin/etl/*`.

## 👥 Integrantes do Grupo 20

    Carolina Felix Costrino

    Caue Guedes Duarte

    Cayo Pereira Fernandes

    Celestino de Jesus Xavier

    Cesar Florencio Costa

    Marcos Vinicius Salles Luiz

    Mateus Leandro Silva

    Mauricio Ricardo

Orientador: Maycol Clister Fernández Chillcce

Disciplina: Projeto Integrador II — Engenharia da Computação

Instituição: Universidade Virtual do Estado de São Paulo (UNIVESP)

## 🔗 Links Úteis

- API externa: [Dados Abertos da Câmara](https://dadosabertos.camara.leg.br/)

- Documentação oficial: [Swagger da Câmara](https://dadosabertos.camara.leg.br/swagger/api.html)