package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.Deputado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DeputadoRepository extends JpaRepository<Deputado, Long> {

    @Query("SELECT d FROM Deputado d WHERE d.legislatura = :legislatura " +
            "AND (:situacao IS NULL OR :situacao = '' OR d.situacao = :situacao) " +
            "AND (:nome IS NULL OR :nome = '' OR LOWER(d.nome) LIKE LOWER(CONCAT('%', :nome, '%'))) " +
            "AND (:partido IS NULL OR :partido = '' OR d.siglaPartido = :partido) " +
            "AND (:uf IS NULL OR :uf = '' OR d.siglaUf = :uf)")
    Page<Deputado> buscarComFiltros(@Param("legislatura") Integer legislatura,
                                    @Param("situacao") String situacao,
                                    @Param("nome") String nome,
                                    @Param("partido") String partido,
                                    @Param("uf") String uf,
                                    Pageable pageable);

    @Query("SELECT d.siglaPartido, COUNT(d) FROM Deputado d WHERE d.legislatura = :legislatura AND d.situacao = 'Exercício' GROUP BY d.siglaPartido ORDER BY COUNT(d) DESC")
    java.util.List<Object[]> contarDeputadosPorPartido(@Param("legislatura") Integer legislatura);
}