import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { obterEstatisticasPartidos } from '../services/api'

// Mapeamento de cores para os principais partidos brasileiros
const CORES_PARTIDOS = {
    'PL': '#1d4ed8',       // Azul Escuro
    'PT': '#dc2626',       // Vermelho
    'UNIÃO': '#f59e0b',    // Laranja
    'PP': '#3b82f6',       // Azul Claro
    'MDB': '#10b981',      // Verde
    'PSD': '#8b5cf6',      // Roxo
    'REPUBLICANOS': '#ec4899', // Rosa
    'PDT': '#ef4444',      // Vermelho Escuro
    'PSDB': '#0ea5e9',     // Azul Ciano
    'PSOL': '#eab308',     // Amarelo
    'NOVO': '#f97316',     // Laranja Escuro
    'PODE': '#14b8a6',     // Verde Água
    'AVANTE': '#84cc16',   // Verde Limão
    'SOLIDARIEDADE': '#facc15', // Amarelo Ouro
    'CIDADANIA': '#06b6d4', // Ciano
    'PCdoB': '#b91c1c',    // Vinho
    'PV': '#22c55e',       // Verde Claro
    'REDE': '#15803d',     // Verde Escuro
    'PSB': '#fbbf24',      // Amarelo
    'PROS': '#f43f5e'      // Rosa Escuro
}

const getCorPartido = (sigla) => CORES_PARTIDOS[sigla] || '#64748b' // Cinza como fallback

export default function DashboardPartidos() {
    const [estatisticas, setEstatisticas] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        obterEstatisticasPartidos()
            .then(data => {
                // Ordena do maior para o menor
                const sortedData = data.sort((a, b) => b.totalDeputados - a.totalDeputados)
                setEstatisticas(sortedData)
                setLoading(false)
            })
            .catch(() => {
                setErro('Não foi possível carregar as estatísticas dos partidos.')
                setLoading(false)
            })
    }, [])

    // Processa os dados para calcular o total e as porcentagens
    const { totalDeputados, dadosProcessados, arrayBolinhas } = useMemo(() => {
        if (!estatisticas.length) return { totalDeputados: 0, dadosProcessados: [], arrayBolinhas: [] }

        const total = estatisticas.reduce((acc, curr) => acc + curr.totalDeputados, 0)

        const processados = estatisticas.map(item => ({
            ...item,
            percentual: ((item.totalDeputados / total) * 100).toFixed(1),
            cor: getCorPartido(item.sigla)
        }))

        // Cria um array com a cor de cada deputado para renderizar a grade de bolinhas
        const bolinhas = []
        processados.forEach(item => {
            for (let i = 0; i < item.totalDeputados; i++) {
                bolinhas.push(item.cor)
            }
        })

        return { totalDeputados: total, dadosProcessados: processados, arrayBolinhas: bolinhas }
    }, [estatisticas])

    if (loading) return <p aria-live="polite" style={{ padding: '2rem' }}>Carregando dados dos partidos...</p>
    if (erro) return <p role="alert" style={{ padding: '2rem', color: '#dc2626' }}>{erro}</p>

    return (
        <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: '#2563eb', textDecoration: 'none' }}>
                ← Voltar para Deputados
            </Link>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#1e293b', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                    Como é formado o atual Parlamento
                </h1>
                <p style={{ fontSize: '1.1rem', color: '#475569', margin: 0 }}>nº de deputados por partido</p>
            </div>

            {totalDeputados === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b' }}>Nenhum dado encontrado. Sincronize o banco de dados.</p>
            ) : (
                <>
                    {/* GRADE DE BOLINHAS (Representação visual) */}
                    <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(10px, 1fr))',
                            gap: '4px',
                            maxWidth: '600px',
                            backgroundColor: '#f8fafc',
                            padding: '2rem',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            justifyItems: 'center'
                        }}>
                            {arrayBolinhas.map((cor, index) => (
                                <div
                                    key={index}
                                    title="Deputado"
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: cor
                                    }}
                                />
                            ))}
                        </div>

                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' }}>TOTAL</p>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.5rem', color: '#dc2626' }}>
                                {totalDeputados} deputados
                            </p>
                        </div>
                    </section>

                    {/* TABELA DETALHADA */}
                    <section aria-labelledby="titulo-tabela">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                            <thead>
                            <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                                <th style={{ padding: '12px 8px', color: '#1e293b' }}>Partido</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center', color: '#1e293b' }}>nº de<br/>deputados</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#1e293b' }}>% do total</th>
                            </tr>
                            </thead>
                            <tbody>
                            {dadosProcessados.map((item) => (
                                <tr key={item.sigla} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: item.cor }} />
                                        <strong style={{ fontSize: '1rem', color: '#1e293b' }}>{item.sigla}</strong>
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>
                                        {item.totalDeputados}
                                    </td>
                                    <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#1e293b', width: '45px', textAlign: 'right' }}>
                                                {item.percentual}%
                                            </span>
                                        {/* Barrinha de Progresso */}
                                        <div style={{ width: '80px', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ width: `${item.percentual}%`, height: '100%', backgroundColor: '#dc2626' }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </section>
                </>
            )}
        </main>
    )
}