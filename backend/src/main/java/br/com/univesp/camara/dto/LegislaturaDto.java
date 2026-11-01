package br.com.univesp.camara.dto;

import br.com.univesp.camara.model.Legislatura;

import java.time.LocalDate;

public record LegislaturaDto(int id, LocalDate dataInicio, LocalDate dataFim) {
    public static LegislaturaDto from(Legislatura l){
        return new LegislaturaDto(
                l.getId(), l.getDataInicio(), l.getDataFim()
        );
    }
}
