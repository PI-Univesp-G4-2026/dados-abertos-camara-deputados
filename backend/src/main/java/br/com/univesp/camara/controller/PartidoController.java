package br.com.univesp.camara.controller;

import br.com.univesp.camara.dto.PartidoDto;
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

    public PartidoController(PartidoRepository partidoRepo) {
        this.partidoRepo = partidoRepo;
    }

    @GetMapping
    public List<PartidoDto> listar(){
        return partidoRepo.findAll(Sort.by("sigla"))
                .stream().map(PartidoDto::from).toList();
    }
}
