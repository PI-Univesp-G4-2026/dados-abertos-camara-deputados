package br.com.univesp.camara.dto;

import br.com.univesp.camara.model.ProposicaoAutor;

public record ProposicaoAutorDto(String nome, String tipo, Integer ordemAssinatura) {
    public static ProposicaoAutorDto from(ProposicaoAutor a) {
        return new ProposicaoAutorDto(a.getNome(), a.getTipo(), a.getOrdemAssinatura());
    }
}