package br.com.univesp.camara.dto;

import br.com.univesp.camara.model.OrientacaoBancada;
import br.com.univesp.camara.model.Proposicao;
import br.com.univesp.camara.model.Votacao;
import br.com.univesp.camara.model.Voto;
import lombok.Data;
import java.util.List;

@Data
public class RaioXVotacaoDto {
    private VotacaoDto votacao;
    private Proposicao proposicao;
    private VotoDeputadoDto votoDeputado; // O voto da Erika
    private String orientacaoPartidoDeputado; // O que o PSOL orientou
    private List<OrientacaoBancada> todasOrientacoes;
}