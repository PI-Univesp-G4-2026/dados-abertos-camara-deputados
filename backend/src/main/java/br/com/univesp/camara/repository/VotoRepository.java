package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.Voto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("SELECT v.tipoVoto, COUNT(v) FROM Voto v " +
            "WHERE v.deputado.id = :deputadoId "+
            "GROUP BY v.tipoVoto ORDER BY COUNT(v) DESC")
    List<Object[]> placarPorDeputado (@Param("deputadoId") Long deputadoId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("DELETE FROM Voto v WHERE v.votacao.id = :votacaoId")
    void deleteByVotacaoId(@Param("votacaoId") String votacaoId);

    // Busca o voto de um deputado específico em uma votação específica
    List<Voto> findByVotacaoIdAndDeputadoId(String votacaoId, Long deputadoId);
}
