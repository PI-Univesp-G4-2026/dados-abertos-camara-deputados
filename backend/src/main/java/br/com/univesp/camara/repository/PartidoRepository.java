package br.com.univesp.camara.repository;

import br.com.univesp.camara.model.Partido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartidoRepository extends JpaRepository<Partido, Integer> {
}
