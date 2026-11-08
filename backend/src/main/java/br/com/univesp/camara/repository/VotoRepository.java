package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.Voto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface VotoRepository extends JpaRepository<Voto, Long> {

    @EntityGraph(attributePaths = "deputado")
    Page<Voto> findByVotacaoId(String votacaoId, Pageable pageable);

    @EntityGraph(attributePaths = "votacao")
    Page<Voto> findByDeputadoId(Long deputadoId, Pageable pageable);

    boolean existsByVotacaoId(String votacaoId);

    @Query("SELECT v.tipoVoto, COUNT(v) FROM Voto v " +
            "WHERE v.votacao.id = :votacaoId "+
            "GROUP BY v.tipoVoto ORDER BY COUNT(v) DESC")
    List<Object[]> placarPorVotacao (@Param("votacaoId") String votacaoId);

    @Query("SELECT v.tipoVoto, COUNT(v) FROM Voto v JOIN v.votacao vt " +
            "WHERE v.deputado.id = :deputadoId " +
            "AND vt.proposicaoId IN (SELECT p.id FROM Proposicao p WHERE p.codTipo IN (136, 139)) " +
            "GROUP BY v.tipoVoto ORDER BY COUNT(v) DESC")
    List<Object[]> placarPorDeputado (@Param("deputadoId") Long deputadoId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM Voto v WHERE v.votacao.id = :votacaoId")
    void deleteByVotacaoId(@Param("votacaoId") String votacaoId);

    List<Voto> findByVotacaoIdAndDeputadoId(String votacaoId, Long deputadoId);

    @Query("SELECT v FROM Voto v JOIN v.votacao vt " +
            "WHERE v.deputado.id = :deputadoId " +
            "AND (:dataInicio IS NULL OR vt.data >= :dataInicio) " +
            "AND (:dataFim IS NULL OR vt.data <= :dataFim) " +
            "AND (:descricao IS NULL OR :descricao = '' OR LOWER(vt.descricao) LIKE LOWER(CONCAT('%', :descricao, '%'))) " +
            "AND (:tipo IS NULL OR :tipo = '' OR vt.proposicaoId IN (SELECT p.id FROM Proposicao p WHERE p.siglaTipo = :tipo))")
    Page<Voto> buscarComFiltros(@Param("deputadoId") Long deputadoId,
                                @Param("dataInicio") LocalDate dataInicio,
                                @Param("dataFim") LocalDate dataFim,
                                @Param("descricao") String descricao,
                                @Param("tipo") String tipo,
                                Pageable pageable);

    @Query("SELECT v FROM Voto v JOIN v.votacao vt " +
            "WHERE v.deputado.id = :deputadoId " +
            "AND vt.proposicaoId IN (SELECT p.id FROM Proposicao p WHERE p.codTipo IN (135, 136, 139, 140)) " +
            "AND (:dataInicio IS NULL OR vt.data >= :dataInicio) " +
            "AND (:dataFim IS NULL OR vt.data <= :dataFim) " +
            "AND (:descricao IS NULL OR :descricao = '' OR LOWER(vt.descricao) LIKE LOWER(CONCAT('%', :descricao, '%'))) " +
            "AND (:tipo IS NULL OR :tipo = '' OR vt.proposicaoId IN (SELECT p2.id FROM Proposicao p2 WHERE p2.siglaTipo = :tipo))")
    Page<Voto> buscarComFiltrosPecPl(@Param("deputadoId") Long deputadoId,
                                     @Param("dataInicio") LocalDate dataInicio,
                                     @Param("dataFim") LocalDate dataFim,
                                     @Param("descricao") String descricao,
                                     @Param("tipo") String tipo,
                                     Pageable pageable);
}
