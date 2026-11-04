import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarPartidos } from '../services/api'

export default function DashboardPartidos() {
    const [partidos, setPartidos] = useState([])
    const [erro, setErro] = useState(null)

    useEffect(() => {
        listarPartidos()
            .then(setPartidos)
            .catch(() => setErro('Não foi possível carregar os partidos.'))
    }, [])

    return (
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/">← Voltar para Deputados</Link>
            <h1 style={{ marginTop: '1rem' }}>Painel de Partidos</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Lista de partidos políticos com representação na Câmara.
            </p>

            {erro && <p role="alert" style={{ color: 'red' }}>{erro}</p>}

            {!partidos.length && !erro && <p>Carregando partidos...</p>}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem'
            }}>
                {partidos.map(partido => (
                    <div key={partido.id} style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1rem',
                        backgroundColor: '#f8fafc'
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#1e293b' }}>
                            {partido.sigla}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                            {partido.nome}
                        </p>
                    </div>
                ))}
            </div>
        </main>
    )
}