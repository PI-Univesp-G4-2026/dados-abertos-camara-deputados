// Proposicao.java
package br.com.univesp.camara.model;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "proposicoes")
public class Proposicao {
    @Id
    private Long id;
    private String siglaTipo;
    private Integer numero;
    private Integer ano;
    @Column(columnDefinition = "TEXT")
    private String ementa;
    private String urlInteiroTeor;
}
