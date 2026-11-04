package br.com.univesp.camara.controller;

import br.com.univesp.camara.dto.PartidoDto;
import br.com.univesp.camara.dto.PartidoEstatisticaDto;
import br.com.univesp.camara.repository.DeputadoRepository;
import br.com.univesp.camara.repository.PartidoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/partidos")
@CrossOrigin(origins = "*")
public class PartidoController {

    private final PartidoRepository partidoRepo;
    private final DeputadoRepository deputadoRepo;

    public PartidoController(PartidoRepository partidoRepo, DeputadoRepository deputadoRepo) {
        this.partidoRepo = partidoRepo;
        this.deputadoRepo = deputadoRepo;
    }

    @GetMapping
    public List<PartidoDto> listar(){
        return partidoRepo.findAll(Sort.by("sigla"))
                .stream().map(PartidoDto::from).toList();
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
