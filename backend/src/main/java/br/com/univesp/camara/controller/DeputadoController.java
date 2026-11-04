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

        // Traduz o filtro simples para a lista de status da Câmara
        List<String> situacoesFiltro = null;
        if ("Ativo".equalsIgnoreCase(situacao)) {
            situacoesFiltro = List.of("Exercício", "Convocado", "Licença");
        } else if ("Inativo".equalsIgnoreCase(situacao)) {
            situacoesFiltro = List.of("Suplência", "Vacância", "Fim de Mandato", "Afastado", "Suspenso");
        }

        // Se a lista for nula ou vazia (Todos), chama a query sem filtro de situação
        if (situacoesFiltro == null || situacoesFiltro.isEmpty()) {
            return repository.buscarSemFiltroSituacao(LEGISLATURA_ATUAL, nome, partido, uf, pageable);
        } else {
            return repository.buscarComFiltroSituacao(LEGISLATURA_ATUAL, situacoesFiltro, nome, partido, uf, pageable);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deputado> detalhar(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}