package br.com.univesp.camara.dto;

import br.com.univesp.camara.model.Partido;

public record PartidoDto(int id, String sigla, String nome) {
    public static  PartidoDto from (Partido p){
        return new PartidoDto(
                p.getId(), p.getSigla(), p.getNome()
        );
    }
}
