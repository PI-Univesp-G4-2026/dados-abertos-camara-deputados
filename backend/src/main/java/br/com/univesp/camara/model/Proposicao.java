// Proposicao.java
package br.com.univesp.camara.model;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "proposicoes")
public class Proposicao {
    @Id
    private Long id;

    @Column(name = "sigla_tipo", length = 20)
    private String siglaTipo;

    @Column(name = "numero")
    private Integer numero;

    @Column(name = "ano")
    private Integer ano;

    @Column(columnDefinition = "TEXT")
    private String ementa;

    @Column(name = "cod_tipo")
    private Integer codTipo;

    @Column(name = "url_inteiro_teor", length = 500)
    private String urlInteiroTeor;

    @Column(name = "data_apresentacao")
    private LocalDateTime dataApresentacao;

    @Column(name = "dados_carregados")
    private boolean dadosCarregados;

    @Column(name = "autores_carregados")
    private boolean autoresCarregados;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist(){this.createdAt = LocalDateTime.now();}
}
