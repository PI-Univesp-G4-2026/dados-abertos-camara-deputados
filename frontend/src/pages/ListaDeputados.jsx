import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom' // <-- Importação do useSearchParams
import { listarDeputados } from '../services/api'

export default function ListaDeputados() {
    const [searchParams] = useSearchParams()
    const partidoFiltro = searchParams.get('partido') || '' // <-- Lê o parâmetro da URL

    const [deputados, setDeputados] = useState([])
    const [nome, setNome] = useState('')
    const [situacao, setSituacao] = useState('Ativo')
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        carregar()
    }, [situacao, partidoFiltro]) // <-- Recarrega se o filtro da URL mudar

    async function carregar() {
        setLoading(true)
        setErro(null)
        try {
            // Envia o partido para a API
            const data = await listarDeputados({ nome, situacao, partido: partidoFiltro, size: 50 })
            setDeputados(data.content || [])
        } catch (e) {
            setErro('Não foi possível carregar os deputados.')
        } finally {
            setLoading(false)
        }
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
                <Link to="/partidos" style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Ver Painel de Partidos →
                </Link>
            </div>

            {/* Aviso visual de que o filtro está ativo com opção de limpar */}
            {partidoFiltro && (
                <div style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Exibindo apenas deputados do partido <strong>{partidoFiltro}</strong>.</span>
                    <Link to="/" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Limpar Filtro ✕</Link>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <form role="search" onSubmit={(e) => { e.preventDefault(); carregar() }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
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

            {loading && <p aria-live="polite">Carregando...</p>}
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

            {!loading && deputados.length === 0 && <p>Nenhum deputado encontrado para estes filtros.</p>}
        </main>
    )
}