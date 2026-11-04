package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.Proposicao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ProposicaoRepository extends JpaRepository<Proposicao, Long> {
    Page<Proposicao> findByDadosCarregadosTrue(Pageable pageable);

    Page<Proposicao> findByAno(Integer ano, Pageable pageable);

    Page<Proposicao> findBySiglaTipo(String siglaTipo, Pageable pageable);

    Page<Proposicao> findByAnoAndSiglaTipo(Integer ano, String sigla, Pageable pageable);

    @Query("SELECT p.id FROM Proposicao p WHERE p.dadosCarregados = false ORDER BY p.id DESC")
    List<Long> findIdsPendentes(Pageable pageable);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO proposicoes (id) SELECT DISTINCT proposicao_id FROM votacoes "+
                    "WHERE proposicao_id IS NOT NULL ON CONFLICT (id) DO NOTHING", nativeQuery = true)
    void registrarNovas();

    @Query("SELECT p.id FROM Proposicao p WHERE p.autoresCarregados = false ORDER BY p.id DESC")
    List<Long> findIdsSemAutores(Pageable pageable);

    @Modifying
    @Query("UPDATE Proposicao p SET p.autoresCarregados = true WHERE p.id = :id")
    void marcarAutoresCarregados(@Param("id") Long id);
}