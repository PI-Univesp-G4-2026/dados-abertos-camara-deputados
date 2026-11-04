import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarDeputados } from '../services/api'

export default function ListaDeputados() {
    const [deputados, setDeputados] = useState([])
    const [nome, setNome] = useState('')
    const [situacao, setSituacao] = useState('Exercício') // Filtro padrão
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        carregar()
    }, [situacao]) // Recarrega quando o filtro muda

    async function carregar() {
        setLoading(true)
        setErro(null)
        try {
            // Passa a situação como parâmetro para o backend
            const data = await listarDeputados({ nome, situacao, size: 50 })
            setDeputados(data.content || [])
        } catch (e) {
            setErro('Não foi possível carregar os deputados. Verifique se o backend está rodando.')
        } finally {
            setLoading(false)
        }
    }

    // Função para renderizar a etiqueta colorida
    const renderBadge = (situacaoDep) => {
        if (!situacaoDep) return null;

        const isExercicio = situacaoDep.toLowerCase().includes('exercício');
        const corFundo = isExercicio ? '#dcfce7' : '#f1f5f9';
        const corTexto = isExercicio ? '#166534' : '#475569';

        return (
            <span style={{
                backgroundColor: corFundo,
                color: corTexto,
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                marginLeft: '10px'
            }}>
                {situacaoDep}
            </span>
        );
    }

    return (
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Deputados Federais</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <form
                    role="search"
                    onSubmit={(e) => { e.preventDefault(); carregar() }}
                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}
                >
                    <div>
                        <label htmlFor="busca" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            Buscar por nome
                        </label>
                        <input
                            id="busca"
                            type="search"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            aria-label="Buscar deputado por nome"
                            style={{ padding: '0.5rem', width: '250px' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '0.5rem 1rem' }}>Buscar</button>
                </form>

                <div>
                    <label htmlFor="filtro-situacao" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        Filtrar por situação
                    </label>
                    <select
                        id="filtro-situacao"
                        value={situacao}
                        onChange={e => setSituacao(e.target.value)}
                        style={{ padding: '0.55rem' }}
                    >
                        <option value="Exercício">Apenas em Exercício</option>
                        <option value="">Todos os Deputados</option>
                        <option value="Suplência">Apenas Suplentes</option>
                    </select>
                </div>
            </div>

            {loading && <p aria-live="polite">Carregando...</p>}
            {erro && <p role="alert" style={{ color: 'red' }}>{erro}</p>}

            <ul aria-label="Lista de deputados" style={{ listStyle: 'none', padding: 0 }}>
                {deputados.map(dep => (
                    <li key={dep.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        {dep.urlFoto && (
                            <img src={dep.urlFoto} alt="" width={48} height={64} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                        )}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Link to={`/deputados/${dep.id}`} style={{ fontSize: '1.1rem' }}>
                                {dep.nome} — {dep.siglaPartido}/{dep.siglaUf}
                            </Link>
                            {renderBadge(dep.situacao)}
                        </div>
                    </li>
                ))}
            </ul>

            {!loading && deputados.length === 0 && (
                <p>Nenhum deputado encontrado.</p>
            )}
        </main>
    )
}