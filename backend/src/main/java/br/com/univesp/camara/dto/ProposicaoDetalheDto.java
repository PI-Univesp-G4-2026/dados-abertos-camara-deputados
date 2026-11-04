package br.com.univesp.camara.dto;

import br.com.univesp.camara.model.Proposicao;
import br.com.univesp.camara.model.ProposicaoAutor;
import br.com.univesp.camara.model.Votacao;

import java.time.LocalDateTime;
import java.util.List;

public record ProposicaoDetalheDto(Long id, String siglaTipo, Integer numero, Integer ano, String ementa,
                                   LocalDateTime dataApresentacao, boolean dadosCarregados, boolean autoresCarregados,
                                   List<AutorDto> autores, List<VotacaoDto> votacoes) {

    public record AutorDto(String nome, String tipo, Integer ordemAssinatura, Integer proponente, Long deputadoId) {

    }

    public static ProposicaoDetalheDto from(Proposicao p, List<ProposicaoAutor> autores, List<Votacao> votacoes) {
        List<AutorDto> autoresDto = autores.stream().map(a -> new AutorDto(a.getNome(), a.getTipo(), a.getOrdemAssinatura(), a.getProponente(), a.getDeputadoId())).toList();
        List<VotacaoDto> votacoesDto = votacoes.stream().map(VotacaoDto::from).toList();

        return new ProposicaoDetalheDto(p.getId(), p.getSiglaTipo(), p.getNumero(), p.getAno(), p.getEmenta(), p.getDataApresentacao(), p.isDadosCarregados(), p.isAutoresCarregados(), autoresDto, votacoesDto);
    }
}
