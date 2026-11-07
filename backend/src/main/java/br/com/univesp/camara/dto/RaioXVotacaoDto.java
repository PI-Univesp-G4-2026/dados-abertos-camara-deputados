package br.com.univesp.camara.dto;

import lombok.Data;
import java.util.List;

@Data
public class RaioXVotacaoDto {
    private VotacaoDto votacao;
    private ProposicaoDto proposicao;
    private VotoDeputadoDto votoDeputado; // O voto da Erika
    private String orientacaoPartidoDeputado; // O que o PSOL orientou
    private List<OrientacaoDto> todasOrientacoes;
}