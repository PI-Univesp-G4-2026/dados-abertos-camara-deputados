# 🏛️ Transparência Legislativa - Atuação Parlamentar

![Badge Status](https://img.shields.io/badge/Status-Concluído-green)
![Badge Java](https://img.shields.io/badge/Java-21-orange)
![Badge Spring](https://img.shields.io/badge/Spring_Boot-3.3.5-brightgreen)
![Badge React](https://img.shields.io/badge/React-19-blue)
![Badge PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Badge Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

Plataforma web desenvolvida para monitorar, de forma centralizada, acessível e interativa, a atuação parlamentar dos deputados federais, consumindo dados abertos diretamente da **API da Câmara dos Deputados**.

Este projeto foi desenvolvido como parte do **Projeto Integrador II** da UNIVESP, pelo **Grupo 20** — 2026/2.

## 🌐 Acesso em Produção
- **Frontend (Vercel):** [https://dados-abertos-camara-deputados.vercel.app](https://dados-abertos-camara-deputados.vercel.app)
- **API (Render):** [https://camara-api.onrender.com/api/deputados](https://camara-api.onrender.com/api/deputados)

---

## 🎯 Objetivo

Desenvolver um software web *Full Stack* que promova o controle social e a transparência pública, superando a fragmentação e complexidade dos dados brutos oficiais. O sistema armazena informações localmente para garantir performance, apresenta os dados de forma visual e acessível, e conta com testes automatizados e deploy contínuo.

## 🚀 Funcionalidades Principais

- **Listagem de Deputados:** Busca por nome, paginação infinita e filtros (Ativos, Inativos, Todos).
- **Ficha do Parlamentar:** Dados básicos, gráficos de despesas (por categoria e evolução mensal), gráfico de pizza de votos e histórico completo de votos com filtros por data, tipo e texto.
- **Raio-X da Votação (Diferencial):** Exibe a Ementa, autores e o alinhamento partidário (voto do deputado vs. orientação do partido) de forma integrada.
- **Painel de Votações:** Lista as principais proposições votadas em plenário (PL, PEC, PLP, PDC), com filtros, busca textual e placar geral (Sim, Não, Abstenções).
- **Painel de Proposições:** Busca textual na ementa, filtros por ano e tipo (PL, PEC, PLP, PDC) com links diretos para a Câmara.
- **Painel de Temas:** Agrupamento de votações e proposições por áreas temáticas (Economia, Saúde, Meio Ambiente, etc).
- **Painel de Partidos:** Infográfico interativo mostrando a distribuição de deputados em exercício por partido político.
- **ETL Resiliente:** Pipeline de sincronização mês a mês (com *retry* e tratamento de votações simbólicas) que evita sobrecarga da API pública.
- **Acessibilidade:** Estrutura semântica HTML, atributos ARIA, skip-link, navegação por teclado e alto contraste.

## 🛠️ Tecnologias Utilizadas

### Back-end
- **Java 21** (LTS)
- **Spring Boot 3.3.5** (Web, Data JPA, Validation)
- **Spring Data JPA + Hibernate** para mapeamento objeto-relacional
- **Flyway** para versionamento de schema
- **Maven** para gerenciamento de dependências
- **Lombok** para redução de boilerplate

### Banco de Dados
- **PostgreSQL 16** (Hospedado no Render)
- Modelagem relacional completa: `deputados`, `despesas`, `votacoes`, `votos`, `proposicoes`, `temas`, `partidos`, `legislaturas`, entre outras.

### Front-end
- **React 19** com **Vite**
- **React Router** para roteamento
- **Axios** para consumo da API interna
- **Recharts** para a plotagem dos gráficos interativos
- **ESLint + eslint-plugin-jsx-a11y** para garantir acessibilidade

### Infraestrutura & DevOps
- **Git & GitHub** para controle de versão
- **Docker & Docker Compose** para ambiente local (PostgreSQL)
- **Deploy:** Vercel (Frontend) e Render (Backend + Banco de Dados)

---

## 🔄 Pipeline de ETL (Extract, Transform, Load)

O projeto possui rotinas de ETL que sincronizam os dados da API da Câmara para o banco local, minimizando a dependência de rede em tempo real.

- **Extract:** Requisições paginadas à API (`/deputados`, `/despesas`, `/votacoes`, `/votos`, `/proposicoes`, `/partidos`, `/legislaturas`).
- **Transform:** Mapeamento JSON → Entidades JPA, deduplicação, tratamento de datas nulas e votações simbólicas.
- **Load:** Persistência no PostgreSQL (`saveAll` / *Upsert*).

**Resiliência:** O ETL processa dados em janelas (ex: mês a mês) para evitar *timeouts* (erro 504) e possui *retry* automático.
**Agendamento:** `@Scheduled` (diário) e endpoints manuais via `/api/admin/etl/*`.

---

## 📦 Como rodar o projeto localmente

### Pré-requisitos
- [JDK 21](https://adoptium.net/)
- [Node.js 20+](https://nodejs.org/) e npm
- [Docker](https://docs.docker.com/engine/install/) e [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### 1. Clonar o repositório
```bash
git clone https://github.com/PI-Univesp-G4-2026/dados-abertos-camara-deputados.git
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

A API estará disponível em http://localhost:8080. O Flyway rodará as migrations e o ETL inicial será disparado.

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
├── backend/                          # Spring Boot API
│   ├── src/main/java/br/com/univesp/camara/
│   │   ├── client/                   # Consumo da API externa (CamaraClient)
│   │   ├── controller/               # Endpoints REST (Deputados, Votações, Temas...)
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── etl/                      # Serviços de Extração e Carga
│   │   ├── model/                    # Entidades JPA
│   │   └── repository/               # Interfaces Spring Data JPA
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/             # Scripts Flyway (V1 até V21)
│   └── pom.xml
├── frontend/                         # React + Vite
│   ├── src/
│   │   ├── pages/                    # ListaDeputados, FichaDeputado, Votacoes, Temas...
│   │   ├── services/                 # api.js (Axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── docker-compose.yml                # PostgreSQL local
├── .gitignore
└── README.md
```

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