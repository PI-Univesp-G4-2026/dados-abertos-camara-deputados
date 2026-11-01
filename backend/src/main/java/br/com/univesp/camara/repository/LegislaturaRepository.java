package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.Legislatura;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LegislaturaRepository extends JpaRepository<Legislatura, Integer> {
}
