import { useEffect, useState } from 'react'
import { obterRaioXVotacao } from '../services/api' // Adicione essa chamada no api.js

export default function RaioXVotacao({ votacaoId, deputadoId }) {
    const [dados, setDados] = useState(null)

    useEffect(() => {
        // Supondo que você criou a função no api.js:
        // api.get(`/votacoes/${votacaoId}/raio-x?deputadoId=${deputadoId}`).then(r => r.data)
        obterRaioXVotacao(votacaoId, deputadoId).then(setDados).catch(console.error)
    }, [votacaoId, deputadoId])

    if (!dados) return <p>Carregando detalhes...</p>

    return (
        <div style={{ padding: '1rem', background: '#f8fafc', borderLeft: '4px solid #2563eb', margin: '1rem 0' }}>
            <h4>O que estava sendo votado?</h4>
            <p><strong>{dados.proposicao?.siglaTipo} {dados.proposicao?.numero}/{dados.proposicao?.ano}</strong></p>
            <p>{dados.proposicao?.ementa}</p>
            <a href={dados.proposicao?.urlInteiroTeor} target="_blank" rel="noreferrer">Ler o texto completo</a>

            <h4 style={{ marginTop: '1rem' }}>Alinhamento Partidário</h4>
            <div style={{ display: 'flex', gap: '2rem' }}>
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

            <h4 style={{ marginTop: '1rem' }}>Como os outros partidos orientaram?</h4>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
                {dados.todasOrientacoes?.map(o => (
                    <li key={o.siglaPartidoBloco} style={{ background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                        {o.siglaPartidoBloco}: {o.orientacaoVoto || 'Liberado'}
                    </li>
                ))}
            </ul>
        </div>
    )
}