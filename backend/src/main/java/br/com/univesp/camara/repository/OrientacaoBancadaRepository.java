package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.OrientacaoBancada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrientacaoBancadaRepository extends JpaRepository<OrientacaoBancada, Long> {
    // Método para buscar todas as orientações de uma votação específica
    List<OrientacaoBancada> findByVotacaoId(String votacaoId);
}