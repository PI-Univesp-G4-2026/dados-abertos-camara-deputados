import { useEffect, useState, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { listarVotacoesPecPl, obterDetalheVotacao } from '../services/api'

export default function Votacoes() {
    const [votacoes, setVotacoes] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [totalElements, setTotalElements] = useState(0)

    // Para o painel expandido
    const [expandido, setExpandido] = useState(null)
    const [detalhe, setDetalhe] = useState(null)
    const [loadingDetalhe, setLoadingDetalhe] = useState(false)

    useEffect(() => {
        carregarVotacoes(0, false)
    }, [])

    async function carregarVotacoes(paginaAtual, acumular = false) {
        setLoading(true)
        try {
            const data = await listarVotacoesPecPl({ page: paginaAtual, size: 15 })
            if (acumular) {
                setVotacoes(prev => [...prev, ...data.content])
            } else {
                setVotacoes(data.content)
            }
            setTotalElements(data.totalElements)
            setHasMore(!data.last)
            setPage(paginaAtual)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleCarregarMais = () => {
        carregarVotacoes(page + 1, true)
    }

    const handleExpandir = async (votacaoId) => {
        if (expandido === votacaoId) {
            setExpandido(null)
            setDetalhe(null)
            return
        }

        setExpandido(votacaoId)
        setDetalhe(null)
        setLoadingDetalhe(true)

        try {
            const data = await obterDetalheVotacao(votacaoId)
            setDetalhe(data)
        } catch (e) {
            console.error("Erro ao buscar detalhe", e)
        } finally {
            setLoadingDetalhe(false)
        }
    }

    return (
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: '#2563eb', textDecoration: 'none' }}>
                ← Voltar para Deputados
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1 style={{ margin: 0 }}>Painel de Votações (PECs e PLs)</h1>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Total: <strong>{totalElements}</strong></span>
            </div>
            <p style={{ color: '#475569', marginBottom: '2rem' }}>Acompanhe as votações em plenário das Propostas de Emenda à Constituição e Projetos de Lei. Clique em uma linha para ver o placar.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {votacoes.map(v => (
                    <Fragment key={v.id}>
                        <div
                            onClick={() => handleExpandir(v.id)}
                            style={{
                                padding: '1rem',
                                background: expandido === v.id ? '#eff6ff' : '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                        {v.data} — {v.siglaOrgao}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}>
                                        {v.descricao}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    backgroundColor: v.aprovacao ? '#dcfce7' : '#fee2e2',
                                    color: v.aprovacao ? '#166534' : '#991b1b',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {v.aprovacao ? 'Aprovada' : 'Rejeitada'}
                                </div>
                            </div>
                        </div>

                        {/* PAINEL EXPANDIDO (PLACAR) */}
                        {expandido === v.id && (
                            <div style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #bfdbfe', borderTop: 'none', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', marginTop: '-0.5rem', zIndex: -1 }}>
                                {loadingDetalhe && <p style={{ color: '#2563eb' }}>Buscando placar...</p>}
                                {detalhe && (
                                    <div>
                                        <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Placar Geral</h4>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            {detalhe.placar?.map(item => (
                                                <div key={item.tipoVoto} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '120px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>{item.tipoVoto}</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: item.tipoVoto === 'Sim' ? '#16a34a' : item.tipoVoto === 'Não' ? '#dc2626' : '#ca8a04' }}>
                                                        {item.total}
                                                    </div>
                                                </div>
                                            ))}
                                            <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', minWidth: '120px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: 'bold' }}>Total Votos</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>{detalhe.totalVotos}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Fragment>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                {loading && <p style={{ color: '#2563eb' }}>Carregando votações...</p>}
                {!loading && hasMore && votacoes.length > 0 && (
                    <button onClick={handleCarregarMais} style={{ padding: '0.75rem 2rem', backgroundColor: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Carregar Mais Votações
                    </button>
                )}
                {!loading && !hasMore && votacoes.length > 0 && (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Fim da lista.</p>
                )}
            </div>
        </main>
    )
}