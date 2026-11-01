package br.com.univesp.camara.controller;

import br.com.univesp.camara.dto.LegislaturaDto;
import br.com.univesp.camara.repository.LegislaturaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/legislaturas")
@CrossOrigin(origins = "*")
public class LegislaturaController {

     private final LegislaturaRepository legislaturaRepo;

    public LegislaturaController(LegislaturaRepository legislaturaRepo) {
        this.legislaturaRepo = legislaturaRepo;
    }

    @GetMapping
    public List<LegislaturaDto> listar(){
        return legislaturaRepo.findAll(Sort.by("dataInicio").descending())
                .stream().map(LegislaturaDto::from).toList();
    }
}
