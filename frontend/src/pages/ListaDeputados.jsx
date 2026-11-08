import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listarDeputados } from '../services/api'

export default function ListaDeputados() {
    const [searchParams] = useSearchParams()
    const partidoFiltro = searchParams.get('partido') || ''

    const [deputados, setDeputados] = useState([])
    const [nome, setNome] = useState('')
    const [situacao, setSituacao] = useState('Ativo')

    // Estados de Paginação
    const [page, setPage] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState(null)

    // Referência para o elemento sentinela no final da lista
    const observerTarget = useRef(null)

    // Função de carregar dados (agora aceita a página e se deve acumular ou substituir)
    const carregarDados = useCallback(async (paginaAtual, acumular = false) => {
        if (loading || (!hasMore && acumular)) return

        setLoading(true)
        setErro(null)
        try {
            const data = await listarDeputados({
                nome,
                situacao,
                partido: partidoFiltro,
                page: paginaAtual,
                size: 30 // Trazemos de 30 em 30 para o scroll ficar fluido
            })

            if (acumular) {
                setDeputados(prev => [...prev, ...(data.content || [])])
            } else {
                setDeputados(data.content || [])
            }

            setTotalElements(data.totalElements || 0)
            setHasMore(!data.last) // O Spring Boot envia "last: true" quando é a última página
        } catch (e) {
            setErro('Não foi possível carregar os deputados.')
        } finally {
            setLoading(false)
        }
    }, [nome, situacao, partidoFiltro, loading, hasMore])

    // Efeito 1: Sempre que os filtros mudarem, reseta a paginação e busca a página 0
    useEffect(() => {
        setPage(0)
        setHasMore(true)
        carregarDados(0, false)
    }, [situacao, partidoFiltro]) // Não colocamos 'nome' aqui para não buscar a cada letra digitada

    // Efeito 2: Configura o IntersectionObserver (Scroll Infinito)
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                // Se o sentinela apareceu na tela E temos mais dados E não estamos carregando
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(prevPage => {
                        const nextPage = prevPage + 1
                        carregarDados(nextPage, true)
                        return nextPage
                    })
                }
            },
            { threshold: 1.0 } // Só dispara quando o elemento estiver 100% visível
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => observer.disconnect()
    }, [hasMore, loading, carregarDados])

    const handleBuscarClick = (e) => {
        e.preventDefault()
        setPage(0)
        setHasMore(true)
        carregarDados(0, false)
    }

    const handleCarregarMaisClick = () => {
        const nextPage = page + 1
        setPage(nextPage)
        carregarDados(nextPage, true)
    }

    const renderBadge = (situacaoDep) => {
        if (!situacaoDep) return null;
        let corFundo = '#f1f5f9';
        let corTexto = '#475569';
        if (situacaoDep === 'Exercício' || situacaoDep === 'Convocado') {
            corFundo = '#dcfce7'; corTexto = '#166534';
        } else if (situacaoDep === 'Licença') {
            corFundo = '#fef08a'; corTexto = '#854d0e';
        } else if (['Vacância', 'Fim de Mandato', 'Afastado', 'Suspenso'].includes(situacaoDep)) {
            corFundo = '#fee2e2'; corTexto = '#991b1b';
        }
        return (
            <span style={{ backgroundColor: corFundo, color: corTexto, padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '10px' }}>
                {situacaoDep}
            </span>
        );
    }

    return (
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ margin: 0 }}>Deputados Federais {partidoFiltro && `- ${partidoFiltro}`}</h1>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to="/votacoes" style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Painel de Votações
                    </Link>
                    <Link to="/proposicoes" style={{ backgroundColor: '#059669', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Ver Proposições (PECs/PLs)
                    </Link>
                    <Link to="/partidos" style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Ver Painel de Partidos →
                    </Link>
                </div>
            </div>

            {partidoFiltro && (
                <div style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Exibindo apenas deputados do partido <strong>{partidoFiltro}</strong>.</span>
                    <Link to="/" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Limpar Filtro ✕</Link>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <form role="search" onSubmit={handleBuscarClick} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div>
                        <label htmlFor="busca" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Buscar por nome</label>
                        <input id="busca" type="search" value={nome} onChange={(e) => setNome(e.target.value)} style={{ padding: '0.5rem', width: '250px' }} />
                    </div>
                    <button type="submit" style={{ padding: '0.5rem 1rem' }}>Buscar</button>
                </form>

                <div>
                    <label htmlFor="filtro-situacao" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Filtrar por situação</label>
                    <select id="filtro-situacao" value={situacao} onChange={e => setSituacao(e.target.value)} style={{ padding: '0.55rem' }}>
                        <option value="Ativo">Apenas Ativos</option>
                        <option value="Inativo">Apenas Inativos</option>
                        <option value="">Todos os Deputados</option>
                    </select>
                </div>
            </div>

            {/* CONTADOR DE REGISTROS */}
            <div style={{ marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.95rem', color: '#475569' }} aria-live="polite">
                Exibindo <strong>{deputados.length}</strong> de <strong>{totalElements}</strong> deputados encontrados.
            </div>

            {erro && <p role="alert" style={{ color: 'red' }}>{erro}</p>}

            <ul aria-label="Lista de deputados" style={{ listStyle: 'none', padding: 0 }}>
                {deputados.map(dep => (
                    <li key={dep.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        {dep.urlFoto && <img src={dep.urlFoto} alt="" width={48} height={64} style={{ objectFit: 'cover', borderRadius: '4px' }} />}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Link to={`/deputados/${dep.id}`} style={{ fontSize: '1.1rem' }}>
                                {dep.nome} — {dep.siglaPartido}/{dep.siglaUf}
                            </Link>
                            {renderBadge(dep.situacao)}
                        </div>
                    </li>
                ))}
            </ul>

            {/* ÁREA DE CARREGAMENTO E BOTÃO "CARREGAR MAIS" */}
            <div style={{ textAlign: 'center', marginTop: '2rem', paddingBottom: '2rem' }}>
                {loading && <p aria-live="polite" style={{ color: '#2563eb', fontWeight: 'bold' }}>Carregando mais deputados...</p>}

                {!loading && hasMore && (
                    <button
                        onClick={handleCarregarMaisClick}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: '#f1f5f9',
                            color: '#1e293b',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                    >
                        Carregar mais
                    </button>
                )}

                {!loading && !hasMore && deputados.length > 0 && (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Você chegou ao fim da lista.</p>
                )}
            </div>

            {/* SENTINELA INVISÍVEL PARA O SCROLL INFINITO */}
            <div ref={observerTarget} style={{ height: '10px' }}></div>
        </main>
    )
}