import { useEffect, useState } from 'react'
import { obterRaioXVotacao } from '../services/api'

export default function RaioXVotacao({ votacaoId, deputadoId }) {
    const [dados, setDados] = useState(null)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        obterRaioXVotacao(votacaoId, deputadoId)
            .then(setDados)
            .catch(() => setErro('Não foi possível carregar os detalhes.'))
    }, [votacaoId, deputadoId])

    if (erro) return <p style={{ padding: '1rem', color: 'red' }}>{erro}</p>
    if (!dados) return <p style={{ padding: '1rem' }}>Carregando detalhes...</p>

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderLeft: '4px solid #2563eb', margin: '1rem 0', borderRadius: '4px' }}>
            <h4 style={{ marginTop: 0 }}>O que estava sendo votado?</h4>
            <p><strong>{dados.proposicao?.siglaTipo} {dados.proposicao?.numero}/{dados.proposicao?.ano}</strong></p>
            <p>{dados.proposicao?.ementa || 'Ementa não disponível.'}</p>
            {dados.proposicao?.urlInteiroTeor && (
                <a href={dados.proposicao.urlInteiroTeor} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                    Ler o texto completo da matéria
                </a>
            )}

            <h4 style={{ marginTop: '1.5rem' }}>Alinhamento Partidário</h4>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                <div>
                    <span>Voto da Deputada: </span>
                    <strong style={{ color: dados.votoDeputado?.tipoVoto === 'Sim' ? '#16a34a' : '#dc2626' }}>
                        {dados.votoDeputado?.tipoVoto || 'Não votou'}
                    </strong>
                </div>
                <div>
                    <span>Orientação do Partido ({dados.votoDeputado?.siglaPartido}): </span>
                    <strong>{dados.orientacaoPartidoDeputado}</strong>
                </div>
            </div>

            <h4 style={{ marginTop: '1rem' }}>Como os partidos orientaram?</h4>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                {dados.todasOrientacoes?.map(o => (
                    <li key={o.siglaPartidoBloco} style={{ background: '#e2e8f0', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        <strong>{o.siglaPartidoBloco}</strong>: {o.orientacaoVoto || 'Liberado'}
                    </li>
                ))}
            </ul>
        </div>
    )
}