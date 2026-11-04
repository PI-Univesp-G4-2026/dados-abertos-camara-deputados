package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.Votacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VotacaoRepository extends JpaRepository<Votacao, String> {

    Page<Votacao> findByDataBetween(LocalDate inicio, LocalDate fim, Pageable pageable);

    Page<Votacao> findBySiglaOrgao(String siglaOrgao, Pageable pageable);

    Page<Votacao> findAllByOrderByDataHoraRegistroDesc(Pageable pageable);

    List<Votacao> findByVotosCarregadosFalseOrderByDataDesc(Pageable pageable);

    Optional<Votacao> findTopByOrderByDataHoraRegistroDesc();

    List<Votacao> findByProposicaoIdOrderByDataHoraRegistroDesc(Long proposicaoId);

    @Query("SELECT DISTINCT v.proposicaoId FROM Votacao v WHERE v.proposicaoId IS NOT NULL")
    List<Long> findProposicaoIdsDistintos();

    @Query(value = "SELECT v FROM Votacao v JOIN ProposicaoTema pt ON pt.proposicaoId = v.proposicaoId " +
                    "WHERE pt.temaCod = :cod",
            countQuery = "SELECT COUNT(v) FROM Votacao v JOIN ProposicaoTema pt ON pt.proposicaoId = v.proposicaoId "+
                    "WHERE pt.temaCod = :cod")
    Page<Votacao> findByTema(@Param("cod") Integer cod, Pageable pageable);

    @Modifying
    @Query("UPDATE Votacao v SET v.votosCarregados = true WHERE v.id = :id")
    void marcarVotosCarregados(@Param("id") String id);
}
