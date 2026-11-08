package br.com.univesp.camara.controller;

import br.com.univesp.camara.dto.PartidoDto;
import br.com.univesp.camara.dto.PartidoEstatisticaDto;
import br.com.univesp.camara.dto.ProposicaoDto;
import br.com.univesp.camara.repository.DeputadoRepository;
import br.com.univesp.camara.repository.PartidoRepository;
import br.com.univesp.camara.repository.ProposicaoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/partidos")
@CrossOrigin(origins = "*")
public class PartidoController {

    private final PartidoRepository partidoRepo;
    private final DeputadoRepository deputadoRepo;
    private final ProposicaoRepository proposicaoRepo;

    public PartidoController(PartidoRepository partidoRepo, DeputadoRepository deputadoRepo, ProposicaoRepository proposicaoRepo) {
        this.partidoRepo = partidoRepo;
        this.deputadoRepo = deputadoRepo;
        this.proposicaoRepo = proposicaoRepo;
    }

    @GetMapping
    public Page<ProposicaoDto> listar(@RequestParam(required = false) Integer ano,
                                      @RequestParam(required = false) String tipo,
                                      @RequestParam(required = false) String termo, // <-- NOVO PARAMETRO
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(Math.min(size, 100), 1), Sort.by("id").descending());
        String sigla = (tipo != null && !tipo.isBlank()) ? tipo.trim().toUpperCase(Locale.ROOT) : null;
        String busca = (termo != null && !termo.isBlank()) ? termo.trim() : null;

        return proposicaoRepo.buscarComFiltros(ano, sigla, busca, pageable).map(ProposicaoDto::from);
    }

    @GetMapping("/estatisticas")
    public List<PartidoEstatisticaDto> estatisticas() {
        int LEGISLATURA_ATUAL = 57;
        List<Object[]> resultados = deputadoRepo.contarDeputadosPorPartido(LEGISLATURA_ATUAL);
        return resultados.stream()
                .map(r -> new PartidoEstatisticaDto((String) r[0], ((Number) r[1]).longValue()))
                .toList();
    }
}
