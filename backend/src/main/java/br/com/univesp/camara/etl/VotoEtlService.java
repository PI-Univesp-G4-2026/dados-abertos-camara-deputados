package br.com.univesp.camara.etl;

import br.com.univesp.camara.client.CamaraClient;
import br.com.univesp.camara.model.Deputado;
import br.com.univesp.camara.model.Votacao;
import br.com.univesp.camara.model.Voto;
import br.com.univesp.camara.repository.DeputadoRepository;
import br.com.univesp.camara.repository.VotacaoRepository;
import br.com.univesp.camara.repository.VotoRepository;
import org.springframework.data.domain.PageRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class VotoEtlService {
    private final CamaraClient client;
    private final VotacaoRepository votacaoRepo;
    private final VotoRepository votoRepo;
    private final DeputadoRepository deputadoRepo;
    private final TransactionTemplate tx;

    public VotoEtlService(CamaraClient client, VotacaoRepository votacaoRepo, VotoRepository votoRepo, DeputadoRepository deputadoRepo, TransactionTemplate tx) {
        this.client = client;
        this.votacaoRepo = votacaoRepo;
        this.votoRepo = votoRepo;
        this.deputadoRepo = deputadoRepo;
        this.tx = tx;
    }

    public record ResultadoVoto(int salvos, int ignorados) {

    }

    public void sincronizarVotos(int limite) {
        System.out.println(">>> ETL: sincronizando votos de até " + limite + " votações...");
        Set<Long> idsDeputados = carregarIdsDeputados();

        List<Votacao> pendentes = votacaoRepo.findByVotosCarregadosFalseOrderByDataDesc(PageRequest.of(0, limite));

        int votosSalvos = 0;
        int ignorados = 0;

        for (Votacao votacao : pendentes) {
            try {
                ResultadoVoto r = processarVotacao(votacao, idsDeputados);
                votosSalvos += r.salvos();
                ignorados += r.ignorados();
                Thread.sleep(500);
            } catch (Exception e) {
                System.err.println(" - Falha na votação " + votacao.getId() + ": " + e.getMessage());
            }
        }
        System.out.println(">>> ETL: " + votosSalvos + " votos salvos, " + ignorados + " ignorados");
    }

    @Transactional
    public ResultadoVoto sincronizarVotacao(String votacaoId) {
        Votacao votacao = votacaoRepo.findById(votacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Votação não encontrada: " + votacaoId));
        return processarVotacao(votacao, carregarIdsDeputados());
    }

    private ResultadoVoto processarVotacao(Votacao votacao, Set<Long> idsDeputados) {
        List<CamaraClient.VotoApi> votoApis = client.buscarVotos(votacao.getId());
        List<Voto> votos = new ArrayList<>();
        int ignorados = 0;

        if (votoApis == null) {
            return new ResultadoVoto(0, 0);
        }

        for (CamaraClient.VotoApi v : votoApis) {
            if (!idsDeputados.contains(v.deputadoId())) {
                ignorados++;
                continue;
            }
            Voto voto = new Voto();
            voto.setVotacao(votacao);
            voto.setDeputado(deputadoRepo.getReferenceById(v.deputadoId()));
            voto.setTipoVoto(v.tipoVoto());
            voto.setSiglaPartido(v.siglaPartido());
            voto.setDataRegistroVoto(v.dataRegistro());
            votos.add(voto);
        }

        if (!votos.isEmpty()) {
            votoRepo.deleteByVotacaoId(votacao.getId());
            votoRepo.saveAll(votos);
        } else {
            System.out.println(">>> AVISO: Votação simbólica/secreta ou sem dados (" + votacao.getId() + "). Pulando.");
        }

        votacaoRepo.marcarVotosCarregados(votacao.getId());

        return new ResultadoVoto(votos.size(), ignorados);
    }

    private Set<Long> carregarIdsDeputados() {
        return deputadoRepo.findAll().stream().map(Deputado::getId).collect(Collectors.toSet());
    }
}
