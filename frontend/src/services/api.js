import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
})

// --- DEPUTADOS ---
export const listarDeputados = (params) =>
    api.get('/deputados', { params }).then(r => r.data)

export const obterDeputado = (id) =>
    api.get(`/deputados/${id}`).then(r => r.data)

// --- DESPESAS ---
export const listarDespesas = (id, params) =>
    api.get(`/deputados/${id}/despesas`, { params }).then(r => r.data)

export const resumoDespesas = (id, ano) =>
    api.get(`/deputados/${id}/despesas/resumo`, { params: { ano } }).then(r => r.data)

// --- VOTAÇÕES E VOTOS ---
export const resumoVotosDeputado = (id) =>
    api.get(`/deputados/${id}/votos/resumo`).then(r => r.data)

export const listarVotosDeputado = (id, params) =>
    api.get(`/deputados/${id}/votos`, { params }).then(r => r.data)

export const obterRaioXVotacao = (votacaoId, deputadoId) =>
    api.get(`/votacoes/${votacaoId}/raio-x`, { params: { deputadoId } }).then(r => r.data)

export const listarPartidos = () =>
    api.get('/partidos').then(r => r.data)

export const obterEstatisticasPartidos = () =>
    api.get('/partidos/estatisticas').then(r => r.data)

export const obterDetalheProposicao = (proposicaoId) =>
    api.get(`/proposicoes/${proposicaoId}`).then(r => r.data)

export const listarProposicoes = (params) =>
    api.get('/proposicoes', { params }).then(r => r.data)

// --- VOTAÇÕES GERAIS ---
export const listarVotacoesPecPl = (params) =>
    api.get('/votacoes/pec-pl', { params }).then(r => r.data)

export const obterDetalheVotacao = (id) =>
    api.get(`/votacoes/${id}`).then(r => r.data)

// --- TEMAS ---
export const listarTemas = () =>
    api.get('/temas').then(r => r.data)

export const listarVotacoesPorTema = (cod, params) =>
    api.get(`/temas/${cod}/votacoes`, { params }).then(r => r.data)