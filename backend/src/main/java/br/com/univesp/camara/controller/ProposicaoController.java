package br.com.univesp.camara.controller;

import br.com.univesp.camara.dto.ProposicaoDetalheDto;
import br.com.univesp.camara.dto.ProposicaoDto;
import br.com.univesp.camara.model.Proposicao;
import br.com.univesp.camara.repository.ProposicaoAutorRepository;
import br.com.univesp.camara.repository.ProposicaoRepository;
import br.com.univesp.camara.repository.VotacaoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/api/proposicoes")
@CrossOrigin(origins = "*")
public class ProposicaoController {

    private final ProposicaoRepository proposicaoRepo;
    private final ProposicaoAutorRepository proposicaoAutorRepo;
    private final VotacaoRepository votacaoRepo;

    public ProposicaoController(ProposicaoRepository proposicaoRepo, ProposicaoAutorRepository proposicaoAutorRepo, VotacaoRepository votacaoRepo) {
        this.proposicaoRepo = proposicaoRepo;
        this.proposicaoAutorRepo = proposicaoAutorRepo;
        this.votacaoRepo = votacaoRepo;
    }

    @GetMapping
    public Page<ProposicaoDto> listar(@RequestParam(required = false) Integer ano,
                                      @RequestParam(required = false) String tipo,
                                      @RequestParam(required = false) String termo, // <-- ADICIONADO AQUI
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(Math.min(size, 100), 1), Sort.by("id").descending());
        String sigla = (tipo != null && !tipo.isBlank()) ? tipo.trim().toUpperCase(Locale.ROOT) : null;
        String busca = (termo != null && !termo.isBlank()) ? termo.trim() : null;

        // Log para você conseguir ver no Render que o dado chegou
        System.out.println(">>> FILTRO RECEBIDO: ano=" + ano + ", tipo=" + sigla + ", termo=" + busca);

        // Agora ele usa o método único que criamos
        return proposicaoRepo.buscarComFiltros(ano, sigla, busca, pageable).map(ProposicaoDto::from);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProposicaoDetalheDto> detalhar(@PathVariable Long id) {
        return proposicaoRepo.findById(id)
                .map(p -> ResponseEntity.ok(ProposicaoDetalheDto.from(
                        p,
                        proposicaoAutorRepo.findByProposicaoIdOrderByOrdemAssinaturaAsc(id),
                        votacaoRepo.findByProposicaoIdOrderByDataHoraRegistroDesc(id))))
                .orElse(ResponseEntity.notFound().build());
    }
}