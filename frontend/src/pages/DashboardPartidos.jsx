import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { obterEstatisticasPartidos } from '../services/api'

const CORES_PARTIDOS = {
    'PL': '#1d4ed8', 'PT': '#dc2626', 'UNIÃO': '#f59e0b', 'PP': '#3b82f6',
    'MDB': '#10b981', 'PSD': '#8b5cf6', 'REPUBLICANOS': '#ec4899', 'PDT': '#ef4444',
    'PSDB': '#0ea5e9', 'PSOL': '#eab308', 'NOVO': '#f97316', 'PODE': '#14b8a6',
    'AVANTE': '#84cc16', 'SOLIDARIEDADE': '#facc15', 'CIDADANIA': '#06b6d4',
    'PCdoB': '#b91c1c', 'PV': '#22c55e', 'REDE': '#15803d', 'PSB': '#fbbf24', 'PROS': '#f43f5e'
}

const getCorPartido = (sigla) => CORES_PARTIDOS[sigla] || '#64748b'

export default function DashboardPartidos() {
    const [estatisticas, setEstatisticas] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        obterEstatisticasPartidos()
            .then(data => {
                const sortedData = data.sort((a, b) => b.totalDeputados - a.totalDeputados)
                setEstatisticas(sortedData)
                setLoading(false)
            })
            .catch(() => {
                setErro('Não foi possível carregar as estatísticas dos partidos.')
                setLoading(false)
            })
    }, [])

    const { totalDeputados, dadosProcessados, arrayBolinhas } = useMemo(() => {
        if (!estatisticas.length) return { totalDeputados: 0, dadosProcessados: [], arrayBolinhas: [] }

        const total = estatisticas.reduce((acc, curr) => acc + curr.totalDeputados, 0)

        const processados = estatisticas.map(item => ({
            ...item,
            percentual: ((item.totalDeputados / total) * 100).toFixed(1),
            cor: getCorPartido(item.sigla)
        }))

        // Agora o array guarda a cor E a sigla para o tooltip
        const bolinhas = []
        processados.forEach(item => {
            for (let i = 0; i < item.totalDeputados; i++) {
                bolinhas.push({ cor: item.cor, sigla: item.sigla })
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
                    <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(12px, 1fr))',
                            gap: '5px',
                            maxWidth: '600px',
                            backgroundColor: '#f8fafc',
                            padding: '2rem',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            justifyItems: 'center'
                        }}>
                            {arrayBolinhas.map((item, index) => (
                                <div
                                    key={index}
                                    title={`Partido: ${item.sigla}`} // Tooltip nativo com a sigla
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: item.cor,
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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

                                        {/* Link que envia o filtro do partido para a tela inicial */}
                                        <Link
                                            to={`/?partido=${item.sigla}`}
                                            style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 'bold', textDecoration: 'none', borderBottom: '1px dashed #94a3b8' }}
                                            title={`Ver deputados do ${item.sigla}`}
                                        >
                                            {item.sigla}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>
                                        {item.totalDeputados}
                                    </td>
                                    <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#1e293b', width: '45px', textAlign: 'right' }}>
                                                {item.percentual}%
                                            </span>
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