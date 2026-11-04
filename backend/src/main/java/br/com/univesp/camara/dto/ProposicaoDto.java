package br.com.univesp.camara.dto;

import br.com.univesp.camara.model.Proposicao;

public record ProposicaoDto(Long id, String siglaTipo, Integer numero, Integer ano, String ementa, String urlInteiroTeor) {
    public static ProposicaoDto from(Proposicao p) {
        return new ProposicaoDto(
                p.getId(), p.getSiglaTipo(), p.getNumero(), p.getAno(), p.getEmenta(), p.getUrlInteiroTeor()
        );
    }
}