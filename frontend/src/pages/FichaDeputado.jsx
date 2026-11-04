import { useEffect, useState, Fragment } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { obterDeputado, resumoDespesas, resumoVotosDeputado, listarVotosDeputado } from '../services/api'

import RaioXVotacao from "./RaioXVotacao.jsx";

const getCorVoto = (tipoVoto) => {
    if (tipoVoto === 'Sim') return '#16a34a';      // Verde
    if (tipoVoto === 'Não') return '#dc2626';      // Vermelho
    if (tipoVoto === 'Abstenção') return '#ca8a04'; // Amarelo
    return '#64748b';                              // Cinza (Outros)
}

export default function FichaDeputado() {
    const { id } = useParams()
    const [deputado, setDeputado] = useState(null)

    // Estados de Despesas
    const [resumoDesp, setResumoDesp] = useState(null)
    const [ano, setAno] = useState(new Date().getFullYear())

    // Estados de Votações
    const [resumoVotos, setResumoVotos] = useState(null)
    const [ultimosVotos, setUltimosVotos] = useState([])

    // Estado para controlar qual linha da tabela está expandida
    const [votoExpandido, setVotoExpandido] = useState(null)

    const [erro, setErro] = useState(null)

    useEffect(() => {
        obterDeputado(id)
            .then(setDeputado)
            .catch(() => setErro('Deputado não encontrado.'))
    }, [id])

    useEffect(() => {
        resumoDespesas(id, ano).then(setResumoDesp).catch(() => {})
    }, [id, ano])

    useEffect(() => {
        resumoVotosDeputado(id).then(setResumoVotos).catch(() => {})
        listarVotosDeputado(id, { size: 10 }).then(data => setUltimosVotos(data.content || [])).catch(() => {})
    }, [id])

    if (erro) return <p role="alert" style={{ padding: '2rem', color: 'red' }}>{erro}</p>
    if (!deputado) return <p aria-live="polite" style={{ padding: '2rem' }}>Carregando...</p>

    // Prepara dados para o gráfico de pizza de votos
    const dadosPizza = resumoVotos?.porTipo?.map(item => ({
        name: item.tipoVoto,
        value: item.total
    })) || []

    return (
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/">← Voltar</Link>
            <h1>{deputado.nome}</h1>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
                {deputado.urlFoto && (
                    <img src={deputado.urlFoto} alt={`Foto de ${deputado.nome}`} width={160} style={{ borderRadius: '4px' }} />
                )}
                <dl>
                    <dt><strong>Partido</strong></dt><dd>{deputado.siglaPartido}</dd>
                    <dt><strong>UF</strong></dt><dd>{deputado.siglaUf}</dd>
                    <dt><strong>E-mail</strong></dt><dd>{deputado.email}</dd>
                </dl>
            </div>

            {/* SEÇÃO DE DESPESAS */}
            <section aria-labelledby="titulo-despesas" style={{ marginBottom: '3rem', borderTop: '1px solid #ccc', paddingTop: '2rem' }}>
                <h2 id="titulo-despesas">Despesas da Cota Parlamentar</h2>
                <label htmlFor="ano-select">Ano: </label>
                <select id="ano-select" value={ano} onChange={e => setAno(Number(e.target.value))} style={{ padding: '0.25rem', marginLeft: '0.5rem', marginBottom: '1rem' }}>
                    {[2023, 2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
                </select>

                {/* Gráfico de Barras - Por Tipo */}
                {resumoDesp?.porTipo?.length > 0 ? (
                    <>
                        <h3>Gastos por Categoria</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={resumoDesp.porTipo.map(item => ({ tipo: item.chave, valor: Number(item.valor) }))} layout="vertical" margin={{ left: 180, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="tipo" type="category" width={170} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                                <Bar dataKey="valor" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </>
                ) : <p>Sem despesas registradas para este ano.</p>}

                {/* Gráfico de Linhas - Evolução Mensal (O que tínhamos perdido) */}
                {resumoDesp?.mensal?.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3>Evolução Mensal</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={resumoDesp.mensal.map(item => ({ mes: item.chave, valor: Number(item.valor) }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                                <Line type="monotone" dataKey="valor" stroke="#16a34a" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            {/* SEÇÃO DE VOTAÇÕES */}
            <section aria-labelledby="titulo-votacoes" style={{ borderTop: '1px solid #ccc', paddingTop: '2rem' }}>
                <h2 id="titulo-votacoes">Atuação em Votações</h2>

                {dadosPizza.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h3>Resumo Geral</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={dadosPizza} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {dadosPizza.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getCorVoto(entry.name)} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                <h3>Últimos Votos Registrados</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Clique em uma linha para ver o Raio-X da votação.</p>

                {ultimosVotos.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                            <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '12px 8px' }}>Data</th>
                                <th style={{ padding: '12px 8px' }}>Descrição</th>
                                <th style={{ padding: '12px 8px' }}>Voto</th>
                            </tr>
                            </thead>
                            <tbody>
                            {ultimosVotos.map(v => (
                                <Fragment key={v.votacaoId}>
                                    <tr
                                        onClick={() => setVotoExpandido(votoExpandido === v.votacaoId ? null : v.votacaoId)}
                                        style={{
                                            borderBottom: '1px solid #eee',
                                            cursor: 'pointer',
                                            backgroundColor: votoExpandido === v.votacaoId ? '#eff6ff' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{v.dataVotacao}</td>
                                        <td style={{ padding: '8px' }}>{v.descricao}</td>
                                        <td style={{ padding: '8px', fontWeight: 'bold', color: v.tipoVoto === 'Sim' ? '#16a34a' : v.tipoVoto === 'Não' ? '#dc2626' : '#ca8a04' }}>
                                            {v.tipoVoto}
                                        </td>
                                    </tr>
                                    {/* Renderiza o Raio-X se a linha estiver expandida */}
                                    {votoExpandido === v.votacaoId && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: 0 }}>
                                                <RaioXVotacao votacaoId={v.votacaoId} deputadoId={id} />
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p>Nenhuma votação registrada para este deputado.</p>}
            </section>
        </main>
    )
}