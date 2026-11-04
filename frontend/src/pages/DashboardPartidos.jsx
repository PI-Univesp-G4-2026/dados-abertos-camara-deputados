import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts'
import { obterEstatisticasPartidos } from '../services/api'

export default function DashboardPartidos() {
    const [estatisticas, setEstatisticas] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        obterEstatisticasPartidos()
            .then(data => {
                setEstatisticas(data)
                setLoading(false)
            })
            .catch(() => {
                setErro('Não foi possível carregar as estatísticas dos partidos.')
                setLoading(false)
            })
    }, [])

    return (
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: '#2563eb', textDecoration: 'none' }}>
                ← Voltar para Deputados
            </Link>

            <h1 style={{ margin: '0 0 1rem 0' }}>Painel de Partidos</h1>
            <p style={{ color: '#475569', marginBottom: '2rem' }}>
                Distribuição de deputados em <strong>Exercício</strong> por partido político na legislatura atual.
            </p>

            {loading && <p aria-live="polite">Carregando dados dos partidos...</p>}
            {erro && <p role="alert" style={{ color: '#dc2626', padding: '1rem', background: '#fee2e2', borderRadius: '4px' }}>{erro}</p>}

            {!loading && !erro && estatisticas.length === 0 && (
                <p>Nenhum dado de partido encontrado. Aguarde a sincronização do banco de dados.</p>
            )}

            {!loading && !erro && estatisticas.length > 0 && (
                <>
                    {/* Gráfico de Ranking (Acessibilidade: aria-label explicativo) */}
                    <section aria-labelledby="titulo-grafico" style={{ marginBottom: '3rem' }}>
                        <h2 id="titulo-grafico" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Ranking de Bancadas</h2>
                        <div style={{ width: '100%', height: 500, backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={estatisticas}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="sigla" type="category" width={60} tick={{ fontWeight: 'bold' }} />
                                    <Tooltip
                                        formatter={(value) => [`${value} deputado(s)`, 'Total']}
                                        labelStyle={{ fontWeight: 'bold' }}
                                        cursor={{ fill: '#f1f5f9' }}
                                    />
                                    <Bar dataKey="totalDeputados" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Tabela de Apoio (Garante acessibilidade para leitores de tela) */}
                    <section aria-labelledby="titulo-tabela">
                        <h2 id="titulo-tabela" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Tabela Detalhada</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                <thead>
                                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                    <th style={{ padding: '12px' }}>Posição</th>
                                    <th style={{ padding: '12px' }}>Partido</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Deputados em Exercício</th>
                                </tr>
                                </thead>
                                <tbody>
                                {estatisticas.map((partido, index) => (
                                    <tr key={partido.sigla} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '12px', color: '#64748b' }}>{index + 1}º</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{partido.sigla}</td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>{partido.totalDeputados}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </main>
    )
}