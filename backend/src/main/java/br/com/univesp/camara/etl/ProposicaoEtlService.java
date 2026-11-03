package br.com.univesp.camara.etl;

import br.com.univesp.camara.client.CamaraClient;
import br.com.univesp.camara.model.Deputado;
import br.com.univesp.camara.model.Proposicao;
import br.com.univesp.camara.model.ProposicaoAutor;
import br.com.univesp.camara.repository.DeputadoRepository;
import br.com.univesp.camara.repository.ProposicaoAutorRepository;
import br.com.univesp.camara.repository.ProposicaoRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ProposicaoEtlService {
    private final CamaraClient client;
    private final ProposicaoRepository proposicaoRepo;
    private final ProposicaoAutorRepository proposicaoAutorRepo;
    private final DeputadoRepository deputadoRepo;
    private final TransactionTemplate tx;
    private static final int TAMANHO_LOTE = 90;

    public ProposicaoEtlService(CamaraClient client, ProposicaoRepository proposicaoRepo, ProposicaoAutorRepository proposicaoAutorRepo, DeputadoRepository deputadoRepo, TransactionTemplate tx) {
        this.client = client;
        this.proposicaoRepo = proposicaoRepo;
        this.proposicaoAutorRepo = proposicaoAutorRepo;
        this.deputadoRepo = deputadoRepo;
        this.tx = tx;
    }

    public void sincronizarDados(int limite) {
        System.out.println(">>> ETL: sincronizando proposicoes  (até " + limite + ")...");
        proposicaoRepo.registrarNovas();

        int processadas = 0;
        while (processadas < limite) {

            List<Long> ids = proposicaoRepo.findIdsPendentes(PageRequest.of(0, Math.min(TAMANHO_LOTE, limite - processadas)));
            if (ids.isEmpty()) break;

            try {
                List<CamaraClient.ProposicaoApi> apis = client.buscarProposicoes(ids);
                Map<Long, CamaraClient.ProposicaoApi> porId = apis.stream()
                        .collect(Collectors.toMap(
                                CamaraClient.ProposicaoApi::id,
                                Function.identity(),
                                (a, b) -> a
                        ));
                tx.executeWithoutResult(status -> {
                    List<Proposicao> lote = proposicaoRepo.findAllById(ids);
                    for (Proposicao p : lote) {
                        CamaraClient.ProposicaoApi api = porId.get(p.getId());
                        if (api != null) {
                            p.setSiglaTipo(api.siglaTipo());
                            p.setCodTipo(api.codTipo());
                            p.setNumero(api.numero());
                            p.setAno(api.ano());
                            p.setEmenta(api.ementa());
                            p.setDataApresentacao(api.dataApresentacao());
                        }
                        p.setDadosCarregados(true);
                    }
                    proposicaoRepo.saveAll(lote);
                });
                processadas += ids.size();
                System.out.println(" -" + processadas + " proposições processadas");
            } catch (Exception e) {
                System.err.println(" -Falha no lote: " + e.getMessage());
                break;
            }
        }
        System.out.println(">>> ETL: " + processadas + " proposições processadas");
    }

    public void sincronizarAutores(int limite) {
        System.out.println(">>> ETL: sincronizando autores de até " + limite + " proposições...");
        List<Long> ids = proposicaoRepo.findIdsSemAutores(PageRequest.of(0, limite));

        int processados = 0, autoresSalvos = 0, falhasSeguidas = 0;

        for (Long id : ids) {
            try {
                List<CamaraClient.ProposicaoAutorApi> proposicaoAutorApis = client.buscarProposicaoAutores(id);
                List<ProposicaoAutor> autores = new ArrayList<>();
                for (CamaraClient.ProposicaoAutorApi a : proposicaoAutorApis) {
                    ProposicaoAutor autor = new ProposicaoAutor();
                    autor.setProposicaoId(id);
                    autor.setNome(a.nome());
                    autor.setUri(a.uri());
                    autor.setCodTipo(a.codTipo());
                    autor.setTipo(a.tipo());
                    autor.setOrdemAssinatura(a.ordemAssinatura());
                    autor.setProponente(a.proponente());
                    autor.setDeputadoId(deputadoIdDaUri(a.uri()));
                    autores.add(autor);
                }
                tx.executeWithoutResult(status -> {
                    proposicaoAutorRepo.deleteByProposicaoId(id);
                    proposicaoAutorRepo.saveAll(autores);
                    proposicaoRepo.marcarAutoresCarregados(id);
                });
                processados++;
                autoresSalvos += autores.size();
                falhasSeguidas = 0;
                Thread.sleep(500);
            } catch (Exception e) {
                falhasSeguidas++;
                System.err.println(" - Falha na proposição " + id + ": " + e.getMessage());
                if (falhasSeguidas >= 5) {
                    System.err.println(">>> ETL: 5 falhas seguidas, interrompendo");
                    break;
                }
            }
        }
        System.out.println(">>> ETL: " + processados + " proposições, " + autoresSalvos + " autores salvos");
    }

    private Long deputadoIdDaUri(String uri) {
        if (uri == null) return null;
        Matcher m = Pattern.compile("/deputados/(\\d+)$").matcher(uri);
        return m.find() ? Long.valueOf(m.group(1)) : null;
    }
}
