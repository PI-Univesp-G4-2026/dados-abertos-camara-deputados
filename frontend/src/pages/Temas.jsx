import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarTemas, listarVotacoesPorTema } from '../services/api'

export default function Temas() {
    const [temas, setTemas] = useState([])
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState(null)

    // Estado para controlar qual tema foi clicado
    const [temaSelecionado, setTemaSelecionado] = useState(null)
    const [votacoesTema, setVotacoesTema] = useState([])
    const [loadingVotacoes, setLoadingVotacoes] = useState(false)

    useEffect(() => {
        listarTemas()
            .then(data => setTemas(data))
            .catch(() => setErro('Não foi possível carregar os temas.'))
    }, [])

    const handleTemaClick = async (tema) => {
        if (temaSelecionado?.cod === tema.cod) {
            setTemaSelecionado(null) // Fecha se clicar no mesmo
            return
        }

        setTemaSelecionado(tema)
        setLoadingVotacoes(true)
        try {
            const data = await listarVotacoesPorTema(tema.cod, { size: 20 })
            setVotacoesTema(data.content || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingVotacoes(false)
        }
    }

    return (
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: '#2563eb', textDecoration: 'none' }}>
                ← Voltar para Deputados
            </Link>

            <h1 style={{ margin: '0 0 1rem 0' }}>Painel de Temas</h1>
            <p style={{ color: '#475569', marginBottom: '2rem' }}>
                Explore as proposições e votações agrupadas por área temática (Saúde, Educação, Meio Ambiente, etc).
            </p>

            {erro && <p style={{ color: '#dc2626' }}>{erro}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {temas.map(tema => (
                    <div
                        key={tema.cod}
                        onClick={() => handleTemaClick(tema)}
                        style={{
                            padding: '1rem',
                            backgroundColor: temaSelecionado?.cod === tema.cod ? '#eff6ff' : '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#1e293b' }}>{tema.nome}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                            <strong>{tema.totalVotacoes}</strong> votações relacionadas
                        </p>
                    </div>
                ))}
            </div>

            {/* PAINEL DE VOTAÇÕES DO TEMA SELECIONADO */}
            {temaSelecionado && (
                <section style={{ borderTop: '2px solid #e2e8f0', paddingTop: '2rem' }}>
                    <h2 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>
                        Votações sobre: {temaSelecionado.nome}
                    </h2>

                    {loadingVotacoes && <p>Carregando votações...</p>}

                    {!loadingVotacoes && votacoesTema.length === 0 && (
                        <p>Nenhuma votação registrada para este tema.</p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {votacoesTema.map(v => (
                            <div key={v.id} style={{ padding: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>{v.data} — {v.siglaOrgao}</div>
                                <div style={{ fontSize: '0.95rem', color: '#1e293b' }}>{v.descricao}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    )
}