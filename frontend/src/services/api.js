import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
})

export const listarDeputados = (params) =>
    api.get('/deputados', { params }).then(r => r.data)

export const obterDeputado = (id) =>
    api.get(`/deputados/${id}`).then(r => r.data)

export const listarDespesas = (id, params) =>
    api.get(`/deputados/${id}/despesas`, { params }).then(r => r.data)

export const resumoDespesas = (id, ano) =>
    api.get(`/deputados/${id}/despesas/resumo`, { params: { ano } }).then(r => r.data)

export const resumoVotosDeputado = (id) =>
    api.get(`/deputados/${id}/votos/resumo`).then(r => r.data)

export const listarVotosDeputado = (id, params) =>
    api.get(`/deputados/${id}/votos`, { params }).then(r => r.data)

export const obterRaioXVotacao = (votacaoId, deputadoId) =>
    api.get(`/votacoes/${votacaoId}/raio-x`, { params: { deputadoId } }).then(r => r.data)