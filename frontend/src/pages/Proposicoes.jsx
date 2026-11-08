import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { listarProposicoes } from '../services/api'

export default function Proposicoes() {
    const [proposicoes, setProposicoes] = useState([])
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState(null)

    const [ano, setAno] = useState('')
    const [tipo, setTipo] = useState('')
    const [termo, setTermo] = useState('')
    const [termoDebounced, setTermoDebounced] = useState('')

    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [totalElements, setTotalElements] = useState(0)

    const observerTarget = useRef(null)
    const isFetching = useRef(false) // O Cadeado

    useEffect(() => {
        const handler = setTimeout(() => setTermoDebounced(termo), 500);
        return () => clearTimeout(handler);
    }, [termo]);

    const carregar = useCallback(async (paginaAtual, acumular = false) => {
        if (isFetching.current) return;
        if (acumular && !hasMore) return;

        isFetching.current = true;
        setLoading(true)
        setErro(null)
        try {
            const data = await listarProposicoes({
                ano: ano || undefined,
                tipo: tipo || undefined,
                termo: termoDebounced || undefined,
                page: paginaAtual,
                size: 20
            })

            if (acumular) {
                setProposicoes(prev => [...prev, ...data.content])
            } else {
                setProposicoes(data.content)
            }

            setTotalElements(data.totalElements)
            setHasMore(!data.last)
            setPage(paginaAtual)
        } catch (e) {
            setErro('Não foi possível carregar as proposições.')
        } finally {
            setLoading(false)
            isFetching.current = false;
        }
    }, [ano, tipo, termoDebounced, hasMore])

    useEffect(() => {
        setPage(0)
        setHasMore(true)
        isFetching.current = false;

        const fetchInicial = async () => {
            isFetching.current = true;
            setLoading(true);
            try {
                const data = await listarProposicoes({ ano: ano || undefined, tipo: tipo || undefined, termo: termoDebounced || undefined, page: 0, size: 20 })
                setProposicoes(data.content)
                setTotalElements(data.totalElements)
                setHasMore(!data.last)
            } catch(e) { setErro('Não foi possível carregar.') } finally { setLoading(false); isFetching.current = false; }
        }
        fetchInicial()
    }, [ano, tipo, termoDebounced])

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isFetching.current) {
                    carregar(page + 1, true)
                }
            },
            { threshold: 1.0 }
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => observer.disconnect()
    }, [hasMore, page, carregar])

    const handleCarregarMais = () => {
        carregar(page + 1, true)
    }

    const truncarEmenta = (texto, limite = 150) => {
        if (!texto) return 'Sem ementa registrada.';
        if (texto.length <= limite) return texto;
        return texto.substring(0, limite) + '...';
    }

    return (
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: '#2563eb', textDecoration: 'none' }}>
                ← Voltar para Deputados
            </Link>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <h1 style={{ margin: 0 }}>Proposições (PECs e PLs)</h1>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Total encontrado: <strong>{totalElements}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                    <label htmlFor="filtro-tipo" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tipo</label>
                    <select id="filtro-tipo" value={tipo} onChange={e => setTipo(e.target.value)} style={{ padding: '0.55rem' }}>
                        <option value="">Todos (PL e PEC)</option>
                        <option value="PL">Projeto de Lei (PL)</option>
                        <option value="PEC">Proposta de Emenda (PEC)</option>
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
                    <label htmlFor="filtro-termo" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Buscar na Ementa</label>
                    <input
                        id="filtro-termo"
                        type="text"
                        placeholder="Ex: escala 6x1, animais, tributação..."
                        value={termo}
                        onChange={e => setTermo(e.target.value)}
                        style={{ padding: '0.55rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    />
                </div>
            </div>

            {erro && <p role="alert" style={{ color: '#dc2626', padding: '1rem', background: '#fee2e2', borderRadius: '4px' }}>{erro}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {proposicoes.map(prop => (
                    <div key={prop.id} style={{ padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, color: '#1e293b' }}>
                                {prop.siglaTipo} {prop.numero}/{prop.ano}
                            </h3>
                            <a href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${prop.id}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
                                Ver no site da Câmara ↗
                            </a>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569', lineHeight: '1.5' }}>
                            {truncarEmenta(prop.ementa)}
                        </p>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '2rem' }}>
                {loading && <p style={{ color: '#2563eb' }}>Buscando proposições...</p>}
                {!loading && hasMore && proposicoes.length > 0 && (
                    <button onClick={handleCarregarMais} style={{ padding: '0.75rem 2rem', backgroundColor: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Carregar Mais
                    </button>
                )}
                {!loading && !hasMore && proposicoes.length > 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Fim da lista.</p>}

                {/* MENSAGEM DE LISTA VAZIA */}
                {!loading && proposicoes.length === 0 && !erro && (
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '2rem' }}>
                        Nenhuma proposição encontrada para os filtros selecionados.
                    </p>
                )}
            </div>

            <div ref={observerTarget} style={{ height: '10px' }}></div>
        </main>
    )
}