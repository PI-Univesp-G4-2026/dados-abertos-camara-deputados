package br.com.univesp.camara.dto;

import br.com.univesp.camara.model.OrientacaoBancada;

public record OrientacaoDto(String siglaPartidoBloco, String orientacaoVoto) {
    public static OrientacaoDto from (OrientacaoBancada o){
        return new OrientacaoDto(o.getSiglaPartidoBloco(), o.getOrientacaoVoto());
    }
}
