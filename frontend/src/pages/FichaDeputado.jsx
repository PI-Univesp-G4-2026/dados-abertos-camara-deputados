import { useEffect, useState, Fragment } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { obterDeputado, resumoDespesas, resumoVotosDeputado, listarVotosDeputado } from '../services/api'
import RaioXVotacao from "./RaioXVotacao.jsx";

const getCorVoto = (tipoVoto) => {
    if (tipoVoto === 'Sim') return '#16a34a';
    if (tipoVoto === 'Não') return '#dc2626';
    if (tipoVoto === 'Abstenção') return '#ca8a04';
    return '#64748b';
}

export default function FichaDeputado() {
    const { id } = useParams()
    const [deputado, setDeputado] = useState(null)
    const [resumoDesp, setResumoDesp] = useState(null)
    const [ano, setAno] = useState(new Date().getFullYear())
    const [resumoVotos, setResumoVotos] = useState(null)
    const [erro, setErro] = useState(null)

    // Estados da Tabela de Votos
    const [votos, setVotos] = useState([])
    const [loadingVotos, setLoadingVotos] = useState(false)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [totalElements, setTotalElements] = useState(0)
    const [votoExpandido, setVotoExpandido] = useState(null)

    // Filtros de Votos
    const [filtroDataInicio, setFiltroDataInicio] = useState('')
    const [filtroDataFim, setFiltroDataFim] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')
    const [filtroNome, setFiltroNome] = useState('')

    useEffect(() => {
        obterDeputado(id)
            .then(setDeputado)
            .catch(() => setErro('Deputado não encontrado.'))
    }, [id])

    useEffect(() => {
        resumoDespesas(id, ano).then(setResumoDesp).catch(() => {})
    }, [id, ano])

    useEffect(() => {
        resumoVotosDeputado(id).then(setResumoVotos).catch(() => {})
    }, [id])

    // Efeito para carregar os votos (toda vez que um filtro mudar ou a página mudar)
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        carregarVotos(0, false);
    }, [id, filtroDataInicio, filtroDataFim, filtroTipo, filtroNome]);

    async function carregarVotos(paginaAtual, acumular = false) {
        setLoadingVotos(true);
        try {
            const data = await listarVotosDeputado(id, {
                page: paginaAtual,
                size: 10,
                dataInicio: filtroDataInicio || undefined,
                dataFim: filtroDataFim || undefined,
                tipo: filtroTipo || undefined,
                descricao: filtroNome || undefined
            });

            if (acumular) {
                setVotos(prev => [...prev, ...(data.content || [])]);
            } else {
                setVotos(data.content || []);
            }
            setTotalElements(data.totalElements || 0);
            setHasMore(!data.last);
        } catch (e) {
            console.error("Erro ao carregar votos", e);
        } finally {
            setLoadingVotos(false);
        }
    }

    const handleCarregarMaisVotos = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        carregarVotos(nextPage, true);
    }

    const renderBadge = (situacaoDep) => {
        if (!situacaoDep) return null;
        let corFundo = '#f1f5f9'; let corTexto = '#475569';
        if (situacaoDep === 'Exercício' || situacaoDep === 'Convocado') { corFundo = '#dcfce7'; corTexto = '#166534'; }
        else if (situacaoDep === 'Licença') { corFundo = '#fef08a'; corTexto = '#854d0e'; }
        else if (['Vacância', 'Fim de Mandato', 'Afastado', 'Suspenso'].includes(situacaoDep)) { corFundo = '#fee2e2'; corTexto = '#991b1b'; }
        return (
            <span style={{ backgroundColor: corFundo, color: corTexto, padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block' }}>
                {situacaoDep}
            </span>
        );
    }

    if (erro) return <p role="alert" style={{ padding: '2rem', color: 'red' }}>{erro}</p>
    if (!deputado) return <p aria-live="polite" style={{ padding: '2rem' }}>Carregando...</p>

    const dadosPizza = resumoVotos?.porTipo?.map(item => ({ name: item.tipoVoto, value: item.total })) || []

    return (
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: '#2563eb', textDecoration: 'none' }}>← Voltar</Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>{deputado.nome}</h1>
                {renderBadge(deputado.situacao)}
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
                {deputado.urlFoto && <img src={deputado.urlFoto} alt={`Foto de ${deputado.nome}`} width={160} style={{ borderRadius: '4px' }} />}
                <dl style={{ margin: 0 }}>
                    <dt><strong>Partido</strong></dt><dd>{deputado.siglaPartido}</dd>
                    <dt><strong>UF</strong></dt><dd>{deputado.siglaUf}</dd>
                    <dt><strong>E-mail</strong></dt><dd>{deputado.email}</dd>
                </dl>
            </div>

            {/* SEÇÃO DE DESPESAS */}
            <section aria-labelledby="titulo-despesas" style={{ marginBottom: '3rem', borderTop: '1px solid #ccc', paddingTop: '2rem' }}>
                <h2 id="titulo-despesas">Despesas da Cota Parlamentar</h2>
                <label htmlFor="ano-select">Ano: </label>
                <select id="ano-select" value={ano} onChange={e => setAno(Number(e.target.value))} style={{ padding: '0.25rem', marginLeft: '0.5rem', marginBottom: '1rem' }}>
                    {[2023, 2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
                </select>

                {resumoDesp?.porTipo?.length > 0 ? (
                    <>
                        <h3>Gastos por Categoria</h3>
                        <ResponsiveContainer width="100%" height={Math.max(300, resumoDesp.porTipo.length * 45)}>
                            <BarChart data={resumoDesp.porTipo.map(item => ({ tipo: item.chave, valor: Number(item.valor) }))} layout="vertical" margin={{ left: 180, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis
                                    dataKey="tipo"
                                    type="category"
                                    width={170}
                                    tick={{ fontSize: 11 }}
                                    // Trunca textos muito longos no eixo Y para não embolar
                                    tickFormatter={(val) => val.length > 25 ? val.substring(0, 22) + '...' : val}
                                />
                                <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                                <Bar dataKey="valor" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </>
                ) : <p>Sem despesas registradas para este ano.</p>}

                {resumoDesp?.mensal?.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3>Evolução Mensal</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart
                                data={resumoDesp.mensal.map(item => {
                                    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                                    return {
                                        mes: nomesMeses[Number(item.chave) - 1] || item.chave,
                                        valor: Number(item.valor)
                                    };
                                })}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
                                <Line type="monotone" dataKey="valor" stroke="#16a34a" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            {/* SEÇÃO DE VOTAÇÕES */}
            <section aria-labelledby="titulo-votacoes" style={{ borderTop: '1px solid #ccc', paddingTop: '2rem' }}>
                <h2 id="titulo-votacoes">Atuação em Votações</h2>

                {dadosPizza.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h3>Resumo Geral</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={dadosPizza} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {dadosPizza.map((entry, index) => <Cell key={`cell-${index}`} fill={getCorVoto(entry.name)} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                <h3>Histórico de Votos</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Clique em uma linha para ver o Raio-X da votação.</p>

                {/* FILTROS DE VOTOS */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>De (Data)</label>
                        <input type="date" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} style={{ padding: '0.4rem' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Até (Data)</label>
                        <input type="date" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} style={{ padding: '0.4rem' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Tipo</label>
                        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} style={{ padding: '0.4rem' }}>
                            <option value="">Todos os Tipos</option>
                            <option value="PL">PL (Projeto de Lei)</option>
                            <option value="PEC">PEC (Emenda Constitucional)</option>
                            <option value="PLP">PLP (Lei Complementar)</option>
                            <option value="PDC">PDC (Decreto Legislativo)</option>
                            <option value="REQ">REQ (Requerimento)</option>
                            <option value="RCP">RCP (Requerimento de CPI)</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Buscar na Descrição</label>
                        <input type="text" placeholder="Ex: escala 6x1..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)} style={{ padding: '0.4rem', width: '100%' }} />
                    </div>
                </div>

                <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.5rem' }}>
                    Encontrados: <strong>{totalElements}</strong> votos.
                </div>

                {votos.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                            <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f8fafc' }}>
                                <th style={{ padding: '12px 8px' }}>Data</th>
                                <th style={{ padding: '12px 8px' }}>Descrição</th>
                                <th style={{ padding: '12px 8px' }}>Voto</th>
                            </tr>
                            </thead>
                            <tbody>
                            {votos.map(v => (
                                <Fragment key={v.votacaoId}>
                                    <tr
                                        onClick={() => setVotoExpandido(votoExpandido === v.votacaoId ? null : v.votacaoId)}
                                        style={{ borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: votoExpandido === v.votacaoId ? '#eff6ff' : 'transparent' }}
                                    >
                                        <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{v.dataVotacao}</td>
                                        <td style={{ padding: '8px' }}>{v.descricao}</td>
                                        <td style={{ padding: '8px', fontWeight: 'bold', color: getCorVoto(v.tipoVoto) }}>
                                            {v.tipoVoto}
                                        </td>
                                    </tr>
                                    {votoExpandido === v.votacaoId && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: 0 }}>
                                                <RaioXVotacao votacaoId={v.votacaoId} deputadoId={id} />
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                            </tbody>
                        </table>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            {loadingVotos && <p style={{ color: '#2563eb' }}>Carregando votos...</p>}
                            {!loadingVotos && hasMore && (
                                <button onClick={handleCarregarMaisVotos} style={{ padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
                                    Carregar Mais Votos
                                </button>
                            )}
                            {!loadingVotos && !hasMore && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Fim dos votos registrados.</p>}
                        </div>
                    </div>
                ) : (
                    <p>{loadingVotos ? 'Buscando votos...' : 'Nenhum voto encontrado para estes filtros.'}</p>
                )}
            </section>
        </main>
    )
}