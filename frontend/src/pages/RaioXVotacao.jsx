import { useEffect, useState } from 'react'
import { obterRaioXVotacao, obterDetalheProposicao } from '../services/api'

export default function RaioXVotacao({ votacaoId, deputadoId }) {
    const [dados, setDados] = useState(null)
    const [autores, setAutores] = useState([])
    const [erro, setErro] = useState(null)

    useEffect(() => {
        obterRaioXVotacao(votacaoId, deputadoId)
            .then(res => {
                setDados(res)
                if (res.proposicao?.id) {
                    obterDetalheProposicao(res.proposicao.id)
                        .then(detalhe => setAutores(detalhe.autores || []))
                        .catch(console.error)
                }
            })
            .catch(() => setErro('Não foi possível carregar os detalhes.'))
    }, [votacaoId, deputadoId])

    if (erro) return <p style={{ padding: '1rem', color: 'red' }}>{erro}</p>
    if (!dados) return <p style={{ padding: '1rem' }}>Carregando detalhes...</p>

    // Verifica se temos a proposição vinculada e carregada
    const temProposicao = dados.proposicao && dados.proposicao.ementa;

    return (
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderLeft: '4px solid #2563eb', margin: '1rem 0', borderRadius: '4px' }}>

            {/* SE TIVER PROPOSIÇÃO, MOSTRA A EMENTA */}
            {temProposicao ? (
                <>
                    <h4 style={{ marginTop: 0, color: '#1e293b' }}>O que estava sendo votado?</h4>
                    <p style={{ margin: '0.5rem 0' }}>
                        <strong style={{ fontSize: '1.1rem' }}>
                            {dados.proposicao.siglaTipo} {dados.proposicao.numero}/{dados.proposicao.ano}
                        </strong>
                    </p>
                    <p style={{ color: '#334155', lineHeight: '1.5' }}>
                        {dados.proposicao.ementa}
                    </p>

                    {dados.proposicao.urlInteiroTeor && (
                        <a href={dados.proposicao.urlInteiroTeor} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                            Ler o texto completo da matéria
                        </a>
                    )}

                    {autores.length > 0 && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '1rem' }}>Autores Principais:</h5>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                                {autores.slice(0, 5).map((a, i) => (
                                    <li key={i}>
                                        <strong>{a.nome}</strong> {a.tipo ? `(${a.tipo})` : ''}
                                        {a.proponente === 1 ? ' - Proponente' : ''}
                                    </li>
                                ))}
                                {autores.length > 5 && (
                                    <li style={{ fontStyle: 'italic', marginTop: '0.5rem', color: '#64748b' }}>
                                        ... e outros {autores.length - 5} autores.
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                /* SE NÃO TIVER PROPOSIÇÃO (Ex: Requerimentos), MOSTRA A DESCRIÇÃO DA VOTAÇÃO */
                <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ marginTop: 0, color: '#1e293b' }}>Sobre a votação</h4>
                    <p style={{ color: '#334155', lineHeight: '1.5', fontStyle: 'italic' }}>
                        "{dados.votacao?.descricao || 'Descrição não disponível'}"
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        * Esta foi uma votação de requerimento procedimental ou não possui proposição vinculada na API da Câmara.
                    </p>
                </div>
            )}

            {/* ALINHAMENTO PARTIDÁRIO */}
            <h4 style={{ marginTop: '1.5rem', color: '#1e293b' }}>Alinhamento Partidário</h4>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                <div>
                    <span style={{ color: '#475569' }}>Voto da Deputada: </span>
                    <strong style={{ color: dados.votoDeputado?.tipoVoto === 'Sim' ? '#16a34a' : '#dc2626', fontSize: '1.1rem' }}>
                        {dados.votoDeputado?.tipoVoto || 'Não votou'}
                    </strong>
                </div>
                <div>
                    <span style={{ color: '#475569' }}>Orientação do Partido ({dados.votoDeputado?.siglaPartido}): </span>
                    <strong style={{ fontSize: '1.1rem' }}>{dados.orientacaoPartidoDeputado || 'Não registrada'}</strong>
                </div>
            </div>

            {/* COMO OS PARTIDOS ORIENTARAM */}
            <h4 style={{ marginTop: '1.5rem', color: '#1e293b' }}>Como os partidos orientaram?</h4>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                {dados.todasOrientacoes?.map(o => (
                    <li key={o.siglaPartidoBloco} style={{ background: '#e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', color: '#334155' }}>
                        <strong>{o.siglaPartidoBloco}</strong>: {o.orientacaoVoto || 'Liberado'}
                    </li>
                ))}
            </ul>
        </div>
    )
}