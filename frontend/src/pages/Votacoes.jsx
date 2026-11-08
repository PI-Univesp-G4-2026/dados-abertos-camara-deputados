import { useEffect, useState, Fragment, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { listarVotacoesPecPl, obterDetalheVotacao } from '../services/api'

export default function Votacoes() {
    const [votacoes, setVotacoes] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [totalElements, setTotalElements] = useState(0)

    const [ano, setAno] = useState('')
    const [tipo, setTipo] = useState('')
    const [termo, setTermo] = useState('')
    const [termoDebounced, setTermoDebounced] = useState('')

    const [expandido, setExpandido] = useState(null)
    const [detalhe, setDetalhe] = useState(null)
    const [loadingDetalhe, setLoadingDetalhe] = useState(false)

    const observerTarget = useRef(null)
    const isFetching = useRef(false) // O "Cadeado"

    // Debounce
    useEffect(() => {
        const handler = setTimeout(() => setTermoDebounced(termo), 500)
        return () => clearTimeout(handler)
    }, [termo])

    // A função agora está blindada contra loops
    const carregarVotacoes = useCallback(async (paginaAtual, acumular = false) => {
        if (isFetching.current) return;
        if (acumular && !hasMore) return;

        isFetching.current = true;
        setLoading(true);

        try {
            const data = await listarVotacoesPecPl({
                ano: ano || undefined,
                tipo: tipo || undefined,
                descricao: termoDebounced || undefined,
                page: paginaAtual,
                size: 15
            })

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
            setLoading(false);
            isFetching.current = false;
        }
    }, [ano, tipo, termoDebounced, hasMore])

    // Reseta e busca quando os filtros mudam (NÃO depende de carregarVotacoes)
    useEffect(() => {
        setPage(0)
        setHasMore(true)
        isFetching.current = false; // Destranca
        // Chamada manual da função
        const fetchInicial = async () => {
            isFetching.current = true;
            setLoading(true);
            try {
                const data = await listarVotacoesPecPl({
                    ano: ano || undefined, tipo: tipo || undefined, descricao: termoDebounced || undefined, page: 0, size: 15
                })
                setVotacoes(data.content)
                setTotalElements(data.totalElements)
                setHasMore(!data.last)
            } catch(e) { console.error(e) } finally { setLoading(false); isFetching.current = false; }
        }
        fetchInicial()
    }, [ano, tipo, termoDebounced])

    // Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isFetching.current) {
                    carregarVotacoes(page + 1, true)
                }
            },
            { threshold: 1.0 }
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => observer.disconnect()
    }, [hasMore, page, carregarVotacoes])

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
                <h1 style={{ margin: 0 }}>Painel de Votações (Principais Proposições)</h1>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Total: <strong>{totalElements}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                    <label htmlFor="filtro-tipo" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tipo</label>
                    <select id="filtro-tipo" value={tipo} onChange={e => setTipo(e.target.value)} style={{ padding: '0.55rem' }}>
                        <option value="">Todos (PL e PEC)</option>
                        <option value="PL">Projeto de Lei (PL)</option>
                        <option value="PEC">Proposta de Emenda (PEC)</option>
                        <option value="PLP">Projeto de Lei Complementar (PLP)</option>
                        <option value="PDC">Projeto de Decreto Legislativo (PDC)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="filtro-ano" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ano</label>
                    <select id="filtro-ano" value={ano} onChange={e => setAno(e.target.value)} style={{ padding: '0.55rem' }}>
                        <option value="">Todos os Anos</option>
                        {[2026, 2025, 2024, 2023].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label htmlFor="filtro-termo" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Buscar na Descrição</label>
                    <input
                        id="filtro-termo"
                        type="text"
                        placeholder="Ex: escala 6x1, urgência..."
                        value={termo}
                        onChange={e => setTermo(e.target.value)}
                        style={{ padding: '0.55rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {votacoes.map(v => (
                    <Fragment key={v.id}>
                        <div
                            onClick={() => handleExpandir(v.id)}
                            style={{ padding: '1rem', background: expandido === v.id ? '#eff6ff' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>{v.data} — {v.siglaOrgao}</div>
                                    <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}>{v.descricao}</div>
                                </div>
                                <div style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: v.aprovacao ? '#dcfce7' : '#fee2e2', color: v.aprovacao ? '#166534' : '#991b1b', whiteSpace: 'nowrap' }}>
                                    {v.aprovacao ? 'Aprovada' : 'Rejeitada'}
                                </div>
                            </div>
                        </div>

                        {expandido === v.id && (
                            <div style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #bfdbfe', borderTop: 'none', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', marginTop: '-0.5rem', zIndex: -1 }}>
                                {loadingDetalhe && <p style={{ color: '#2563eb' }}>Buscando placar...</p>}

                                {detalhe && detalhe.totalVotos === 0 && (
                                    <div style={{ padding: '1rem', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', color: '#92400e' }}>
                                        {detalhe.votosCarregados ? "Esta foi uma votação simbólica ou não possui registro nominal de votos individuais." : "Os votos desta votação ainda estão pendentes de sincronização no sistema."}
                                    </div>
                                )}

                                {detalhe && detalhe.totalVotos > 0 && (
                                    <div>
                                        <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Placar Geral</h4>
                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            {detalhe.placar?.map(item => (
                                                <div key={item.tipoVoto} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '120px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>{item.tipoVoto}</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: item.tipoVoto === 'Sim' ? '#16a34a' : item.tipoVoto === 'Não' ? '#dc2626' : '#ca8a04' }}>{item.total}</div>
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
                    <button onClick={() => carregarVotacoes(page + 1, true)} style={{ padding: '0.75rem 2rem', backgroundColor: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Carregar Mais Votações
                    </button>
                )}

                {!loading && !hasMore && votacoes.length > 0 && (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Fim da lista.</p>
                )}

                {/* MENSAGEM DE LISTA VAZIA (O que faltava no seu Print 2) */}
                {!loading && votacoes.length === 0 && (
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '2rem' }}>
                        Nenhuma votação encontrada para os filtros selecionados.
                    </p>
                )}
            </div>

            <div ref={observerTarget} style={{ height: '10px' }}></div>
        </main>
    )
}