package br.com.univesp.camara.controller;

import br.com.univesp.camara.dto.*;
import br.com.univesp.camara.model.Votacao;
import br.com.univesp.camara.model.Voto;
import br.com.univesp.camara.repository.OrientacaoBancadaRepository;
import br.com.univesp.camara.repository.ProposicaoRepository;
import br.com.univesp.camara.repository.VotacaoRepository;
import br.com.univesp.camara.repository.VotoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@RestController
@RequestMapping("/api/votacoes")
@CrossOrigin(origins = "*")
public class VotacaoController {

    private final VotacaoRepository votacaoRepo;
    private final VotoRepository votoRepo;
    private final ProposicaoRepository proposicaoRepo;
    private final OrientacaoBancadaRepository orientacaoRepo;

    // CONSTRUTOR ATUALIZADO COM AS NOVAS INJEÇÕES
    public VotacaoController(VotacaoRepository votacaoRepo,
                             VotoRepository votoRepo,
                             ProposicaoRepository proposicaoRepo,
                             OrientacaoBancadaRepository orientacaoRepo) {
        this.votacaoRepo = votacaoRepo;
        this.votoRepo = votoRepo;
        this.proposicaoRepo = proposicaoRepo;
        this.orientacaoRepo = orientacaoRepo;
    }

    @GetMapping
    public Page<VotacaoDto> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(required = false) String orgao,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, Math.min(size, 100), Sort.by("dataHoraRegistro").descending());


        if (inicio != null || fim != null) {
            LocalDate de = (inicio != null) ? inicio : LocalDate.of(2023, 2, 1);
            LocalDate ate = (fim != null) ? fim : LocalDate.now();
            return votacaoRepo.findByDataBetween(de, ate, pageable).map(VotacaoDto::from);
        }
        if (orgao != null && !orgao.isBlank()) {
            String sigla = orgao.trim().toUpperCase(Locale.ROOT);
            return votacaoRepo.findBySiglaOrgao(sigla, pageable).map(VotacaoDto::from);
        }

        return votacaoRepo.findAll(pageable).map(VotacaoDto::from);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VotacaoDetalheDto> detalhar(
            @PathVariable String id) {
        return votacaoRepo.findById(id).map(votacao -> {
                    List<Object[]> linhas = votoRepo.placarPorVotacao(id);
                    return ResponseEntity.ok(VotacaoDetalheDto.from(votacao, linhas));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{votacaoId}/raio-x")
    public ResponseEntity<RaioXVotacaoDto> raioX(
            @PathVariable String votacaoId,
            @RequestParam Long deputadoId) {
        Votacao votacao = votacaoRepo.findById(votacaoId).orElse(null);
        if (votacao == null) return ResponseEntity.notFound().build();

        ProposicaoDto proposicao = votacao.getProposicaoId() == null ? null : proposicaoRepo.findById(votacao.getProposicaoId()).map(ProposicaoDto::from).orElse(null);

        List<OrientacaoDto> orientacoes = orientacaoRepo.findByVotacaoId(votacaoId).stream()
                .map(OrientacaoDto::from).toList();

        Voto voto = votoRepo.findByVotacaoIdAndDeputadoId(votacaoId, deputadoId).stream().findFirst().orElse(null);

        RaioXVotacaoDto dto = new RaioXVotacaoDto();
        dto.setVotacao(VotacaoDto.from(votacao));
        dto.setProposicao(proposicao);
        dto.setTodasOrientacoes(orientacoes);
        if (voto != null) {
            dto.setVotoDeputado(VotoDeputadoDto.from(voto));
            dto.setOrientacaoPartidoDeputado(orientacaoPartido(orientacoes, voto.getSiglaPartido()));
        }
        return ResponseEntity.ok(dto);
    }

    private String orientacaoPartido(List<OrientacaoDto> orientacoes, String siglaPartido) {
        if (siglaPartido == null) return null;
        return orientacoes.stream()
                // Agora ele verifica se o bloco contém a sigla (ex: "Fdr PSOL-REDE" contém "PSOL")
                .filter(o -> o.siglaPartidoBloco() != null && o.siglaPartidoBloco().toUpperCase().contains(siglaPartido.toUpperCase()))
                .map(OrientacaoDto::orientacaoVoto)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("Liberado"); // Se não achar nada, assume que estava liberado
    }
}

