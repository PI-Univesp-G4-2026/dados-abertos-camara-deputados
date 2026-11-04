package br.com.univesp.camara.controller;

import br.com.univesp.camara.model.Deputado;
import br.com.univesp.camara.repository.DeputadoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deputados")
@CrossOrigin(origins = "*")
public class DeputadoController {

    private static final int LEGISLATURA_ATUAL = 57;

    private final DeputadoRepository repository;

    public DeputadoController(DeputadoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Page<Deputado> listar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String partido,
            @RequestParam(required = false) String uf,
            @RequestParam(required = false) String situacao,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("nome"));

        if ("Ativo".equalsIgnoreCase(situacao)) {
            return repository.buscarAtivos(LEGISLATURA_ATUAL, nome, partido, uf, pageable);
        } else if ("Inativo".equalsIgnoreCase(situacao)) {
            return repository.buscarInativos(LEGISLATURA_ATUAL, nome, partido, uf, pageable);
        } else {
            return repository.buscarTodos(LEGISLATURA_ATUAL, nome, partido, uf, pageable);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deputado> detalhar(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}