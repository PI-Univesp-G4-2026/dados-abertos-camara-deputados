package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.Proposicao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProposicaoRepository extends JpaRepository<Proposicao, Long> {
}