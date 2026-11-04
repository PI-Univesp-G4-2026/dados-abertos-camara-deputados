package br.com.univesp.camara.controller;

import br.com.univesp.camara.dto.ProposicaoDto;
import br.com.univesp.camara.repository.ProposicaoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proposicoes")
@CrossOrigin(origins = "*")
public class ProposicaoController {

    private final ProposicaoRepository proposicaoRepo;

    public ProposicaoController(ProposicaoRepository proposicaoRepo) {
        this.proposicaoRepo = proposicaoRepo;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProposicaoDto> detalhar(@PathVariable Long id) {
        return proposicaoRepo.findById(id)
                .map(p -> ResponseEntity.ok(ProposicaoDto.from(p)))
                .orElse(ResponseEntity.notFound().build());
    }
}