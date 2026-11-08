// TODO: REMOVER EM PRODUÇÃO

package br.com.univesp.camara.controller;

import br.com.univesp.camara.client.CamaraClient;
import br.com.univesp.camara.etl.*;
import br.com.univesp.camara.model.OrientacaoBancada;
import br.com.univesp.camara.model.Proposicao;
import br.com.univesp.camara.model.Votacao;
import br.com.univesp.camara.repository.OrientacaoBancadaRepository;
import br.com.univesp.camara.repository.ProposicaoRepository;
import br.com.univesp.camara.repository.VotacaoRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Year;
import java.util.List; // <--- IMPORT ADICIONADO AQUI
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final EtlService etlService;
    private final CamaraClient camaraClient;
    private final VotacaoEtlService votacaoEtlService;
    private final VotoEtlService votoEtlService;
    private final TemaEtlService temaEtlService;
    private final LegislaturaEtlService legislaturaEtlService;
    private final PartidoEtlService partidoEtlService;
    private final ProposicaoEtlService proposicaoEtlService;
    private final ProposicaoRepository proposicaoRepo;
    private final VotacaoRepository votacaoRepo;
    private final OrientacaoBancadaRepository orientacaoRepo;

    public AdminController(EtlService etlService,
                           CamaraClient camaraClient,
                           VotacaoEtlService votacaoEtlService,
                           VotoEtlService votoEtlService,
                           TemaEtlService temaEtlService,
                           LegislaturaEtlService legislaturaEtlService,
                           PartidoEtlService partidoEtlService, ProposicaoEtlService proposicaoEtlService,
                           ProposicaoRepository proposicaoRepo,
                           VotacaoRepository votacaoRepo,
                           OrientacaoBancadaRepository orientacaoRepo) {
        this.etlService = etlService;
        this.camaraClient = camaraClient;
        this.votacaoEtlService = votacaoEtlService;
        this.votoEtlService = votoEtlService;
        this.temaEtlService = temaEtlService;
        this.legislaturaEtlService = legislaturaEtlService;
        this.partidoEtlService = partidoEtlService;
        this.proposicaoEtlService = proposicaoEtlService;
        this.proposicaoRepo = proposicaoRepo;
        this.votacaoRepo = votacaoRepo;
        this.orientacaoRepo = orientacaoRepo;
    }

    @PostMapping("/etl/deputados")
    public ResponseEntity<Map<String, Object>> sincronizarDeputados() {
        etlService.sincronizarDeputados();
        return ResponseEntity.ok(Map.of("status", "ok", "mensagem", "Deputados sincronizados."));
    }

    @PostMapping("/etl/despesas/{deputadoId}")
    public ResponseEntity<Map<String, Object>> sincronizarDespesas(
            @PathVariable Long deputadoId,
            @RequestParam(required = false) Integer ano) {

        int anoConsulta = (ano != null) ? ano : Year.now().getValue();
        etlService.sincronizarDespesasDeputado(deputadoId, anoConsulta);

        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "deputadoId", deputadoId,
                "ano", anoConsulta,
                "mensagem", "Despesas sincronizadas."
        ));
    }

    @PostMapping("/etl/despesas")
    public ResponseEntity<Map<String, Object>> sincronizarTodasDespesas() {
        etlService.sincronizarDespesasAnoAtual();
        return ResponseEntity.ok(Map.of("status", "ok", "mensagem", "Despesas de todos os deputados sincronizadas."));
    }

    @PostMapping("/etl/votacoes")
    public ResponseEntity<Map<String, Object>> sincronizarVotacoes(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                                                   @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        LocalDate de = (inicio != null) ? inicio : votacaoEtlService.pontoDePartida();
        LocalDate ate = (fim != null) ? fim : LocalDate.now();

        if (de.isAfter(ate)) {
            return ResponseEntity.badRequest().body(Map.of("status", "erro", "mensagem", "A data inicial não pode ser posterior à final."));
        }
        votacaoEtlService.sincronizarVotacoes(de, ate);
        return ResponseEntity.ok(Map.of("status", "ok", "inicio", de.toString(), "fim", ate.toString(), "mensagem", "Votações sincronizadas."));
    }

    @PostMapping("/etl/votos")
    public ResponseEntity<Map<String, Object>> sincronizarVotos(@RequestParam(defaultValue = "5") int limite) {
        votoEtlService.sincronizarVotos(limite);
        return ResponseEntity.ok(Map.of("status", "ok", "limite", limite, "mensagem", "votos sincronizados"));
    }

    @PostMapping("/etl/votos/{votacaoId}")
    public ResponseEntity<Map<String, Object>> sincronizarVotacao(@PathVariable String votacaoId) {
        try {
            var r = votoEtlService.sincronizarVotacao(votacaoId);
            return ResponseEntity.ok(Map.of("status", "ok", "votacaoId", votacaoId, "votosSalvos", r.salvos(), "ignorados", r.ignorados()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("status", "erro", "mensagem", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("status", "erro", "mensagem", String.valueOf(e.getMessage())));
        }
    }

    @PostMapping("/etl/temas")
    public ResponseEntity<Map<String, Object>> sincronizarTemas(){
        CompletableFuture.runAsync(temaEtlService::sincronizarTemas);
        CompletableFuture.runAsync(temaEtlService::sincronizarProposicoesTemas);
        return ResponseEntity.accepted().body(Map.of(
                "status", "iniciado", "mensagem", "Sincronização de temas e proposicoes temas iniciada."));
    }

    @PostMapping("/etl/legislaturas")
    public ResponseEntity<Map<String, Object>> sincronizarLegislaturas(){
        legislaturaEtlService.sincronizarLegislaturas();
        return ResponseEntity.ok(Map.of("status", "ok", "mensagem", "Legislaturas sincronizadas"));
    }

    @PostMapping("/etl/partidos")
    public ResponseEntity<Map<String, Object>> sincronizarPartidos(){
        partidoEtlService.sincronizarPartidos();
        return ResponseEntity.ok(Map.of("status", "ok", "mensagem", "Partidos sincronizados"));
    }

    @PostMapping("/etl/proposicoes")
    public ResponseEntity<Map<String, Object>> sincronizarProposicoes(@RequestParam(defaultValue = "200") int limite){
        proposicaoEtlService.sincronizarDados(limite);
        return ResponseEntity.ok(Map.of("status", "ok", "limite", limite));
    }

    @PostMapping("/etl/proposicoes/autores")
    public ResponseEntity<Map<String, Object>> sincronizarProposicaoAutores(@RequestParam(defaultValue = "10") int limite){
        proposicaoEtlService.sincronizarAutores(limite);
        return ResponseEntity.ok(Map.of("status", "ok", "limite", limite));
    }

    @PostMapping("/etl/proposicoes/autores/tudo")
    public ResponseEntity<Map<String, Object>> sincronizarTodasProposicaoAutores(){
        CompletableFuture
                .runAsync(() -> proposicaoEtlService.sincronizarAutores(2000))
                .exceptionally(e -> {
                    System.err.println(">>> ETL proposicao autores: erro inesperado: " + e.getMessage());
                    return null;
                });
        return ResponseEntity.accepted().body(Map.of("status", "iniciado", "mensagem", "Sincronizando proposição autores."));
    }

    @PostMapping("/etl/tudo")
    public ResponseEntity<Map<String, Object>> sincronizarTudo() {
        CompletableFuture.runAsync(etlService::sincronizarTudo);
        return ResponseEntity.accepted().body(Map.of(
                "status", "iniciado",
                "mensagem", "Sincronização de deputados, votações, votos e despesas iniciada. Acompanhe pelo log."));
    }


    @PostMapping("/etl/proposicao/{id}")
    public ResponseEntity<Map<String, Object>> sincronizarProposicao(@PathVariable Long id) {
        Proposicao p = camaraClient.buscarProposicao(id);
        proposicaoRepo.save(p);
        return ResponseEntity.ok(Map.of("status", "ok", "mensagem", "Proposição salva: " + p.getEmenta()));
    }

    @PostMapping("/etl/votacao/{id}/orientacoes")
    public ResponseEntity<Map<String, Object>> sincronizarOrientacoes(@PathVariable String id) {
        Votacao v = votacaoRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Votação não encontrada: " + id));
        List<OrientacaoBancada> list = camaraClient.buscarOrientacoes(id, v);
        orientacaoRepo.saveAll(list);
        return ResponseEntity.ok(Map.of("status", "ok", "mensagem", list.size() + " orientações salvas."));
    }

    @PostMapping("/etl/proposicoes/pec-pl")
    public ResponseEntity<Map<String, Object>> sincronizarPecPl(@RequestParam(defaultValue = "2026") int ano) {
        // 135=PDC, 136=PEC, 139=PL, 140=PLP
        proposicaoEtlService.sincronizarProposicoesPorAnoETipos(ano, "135,136,139,140");
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "ano", ano,
                "mensagem", "Sincronização de PECs, PLs, PLPs e PDCs concluída."
        ));
    }

    @PostMapping("/etl/votos/reset")
    public ResponseEntity<Map<String, Object>> resetarVotos() {
        votacaoRepo.resetarVotosCarregadosPecPl();
        return ResponseEntity.ok(Map.of("status", "ok", "mensagem", "Votações de PEC/PL marcadas para reprocessamento."));
    }
}