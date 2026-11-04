import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarDeputados } from '../services/api'

export default function ListaDeputados() {
    const [deputados, setDeputados] = useState([])
    const [nome, setNome] = useState('')
    const [situacao, setSituacao] = useState('Ativo') // Filtro padrão
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        carregar()
    }, [situacao])

    async function carregar() {
        setLoading(true)
        setErro(null)
        try {
            const data = await listarDeputados({ nome, situacao, size: 50 })
            setDeputados(data.content || [])
        } catch (e) {
            setErro('Não foi possível carregar os deputados. Verifique se o backend está rodando.')
        } finally {
            setLoading(false)
        }
    }

    // Função para renderizar a etiqueta colorida com as regras definidas
    const renderBadge = (situacaoDep) => {
        if (!situacaoDep) return null;

        let corFundo = '#f1f5f9'; // Cinza (Suplência)
        let corTexto = '#475569';

        if (situacaoDep === 'Exercício' || situacaoDep === 'Convocado') {
            corFundo = '#dcfce7'; // Verde (Ativos)
            corTexto = '#166534';
        } else if (situacaoDep === 'Licença') {
            corFundo = '#fef08a'; // Amarelo (Licença temporária)
            corTexto = '#854d0e';
        } else if (['Vacância', 'Fim de Mandato', 'Afastado', 'Suspenso'].includes(situacaoDep)) {
            corFundo = '#fee2e2'; // Vermelho (Inativos/Saíram)
            corTexto = '#991b1b';
        }

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ margin: 0 }}>Deputados Federais</h1>
                <Link
                    to="/partidos"
                    style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
                >
                    Ver Painel de Partidos →
                </Link>
            </div>

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