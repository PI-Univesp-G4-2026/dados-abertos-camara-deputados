package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.Votacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VotacaoRepository extends JpaRepository<Votacao, String> {

    Page<Votacao> findByDataBetween(LocalDate inicio, LocalDate fim, Pageable pageable);

    Page<Votacao> findBySiglaOrgao(String siglaOrgao, Pageable pageable);

    Page<Votacao> findAllByOrderByDataHoraRegistroDesc(Pageable pageable);

    @Query("SELECT v FROM Votacao v WHERE v.votosCarregados = false " +
            "AND v.proposicaoId IN (SELECT p.id FROM Proposicao p WHERE p.codTipo IN (136, 139)) " +
            "ORDER BY v.dataHoraRegistro DESC")
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

    @Modifying
    @Transactional
    @Query(value = "UPDATE votacoes v SET proposicao_id = m.proposicao_id " +
            "FROM votacao_proposicao_manual m " +
            "WHERE v.id = m.votacao_id AND v.proposicao_id IS NULL", nativeQuery = true)
    int aplicarVinculosManuais();

    @Query("SELECT v FROM Votacao v JOIN Proposicao p ON v.proposicaoId = p.id " +
            "WHERE p.codTipo IN (136, 139) " +
            "AND (:ano IS NULL OR YEAR(v.data) = :ano) " +
            "AND (:tipo IS NULL OR :tipo = '' OR p.siglaTipo = :tipo) " +
            "AND (:descricao IS NULL OR :descricao = '' OR LOWER(v.descricao) LIKE LOWER(CONCAT('%', :descricao, '%')))")
    Page<Votacao> findPecPl(@Param("ano") Integer ano,
                            @Param("tipo") String tipo,
                            @Param("descricao") String descricao,
                            Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Votacao v SET v.votosCarregados = false WHERE v.proposicaoId IN (SELECT p.id FROM Proposicao p WHERE p.codTipo IN (136, 139))")
    void resetarVotosCarregadosPecPl();
}
