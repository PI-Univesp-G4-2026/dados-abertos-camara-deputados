package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.ProposicaoAutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProposicaoAutorRepository extends JpaRepository<ProposicaoAutor, Long> {

    List<ProposicaoAutor> findByProposicaoIdOrderByOrdemAssinaturaAsc(Long proposicaoId);

    @Modifying
    @Query("DELETE FROM ProposicaoAutor a WHERE a.proposicaoId = :id")
    void deleteByProposicaoId(@Param("id") Long id);
}
