package br.com.univesp.camara.controller;


import br.com.univesp.camara.dto.ResumoVotosDto;
import br.com.univesp.camara.dto.VotoDeputadoDto;
import br.com.univesp.camara.repository.VotoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/deputados/{deputadoId}/votos")
@CrossOrigin(origins = "*")
public class VotoController {

    private final VotoRepository votoRepo;

    public VotoController(VotoRepository votoRepo) {
        this.votoRepo = votoRepo;
    }

    @GetMapping
    public Page<VotoDeputadoDto> listar(@PathVariable Long deputadoId,
                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
                                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
                                        @RequestParam(required = false) String descricao,
                                        @RequestParam(required = false) String tipo,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(Math.min(size, 100), 1),
                Sort.by("votacao.dataHoraRegistro").descending());

        // Mudou de buscarComFiltrosPecPl para buscarTodosOsVotos
        return votoRepo.buscarTodosOsVotos(deputadoId, dataInicio, dataFim, descricao, tipo, pageable)
                .map(VotoDeputadoDto::from);
    }

    @GetMapping("/resumo")
    public ResumoVotosDto resumo(@PathVariable Long deputadoId) {
       List<Object[]> linhas = votoRepo.placarPorDeputado(deputadoId);
       return ResumoVotosDto.from(linhas);
    }
}
