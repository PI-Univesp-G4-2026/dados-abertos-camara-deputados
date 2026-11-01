
// OrientacaoBancada.java
package br.com.univesp.camara.model;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "orientacoes_bancadas")
public class OrientacaoBancada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "votacao_id", nullable = false)
    private Votacao votacao;
    private String siglaPartidoBloco;
    private String orientacaoVoto;
}