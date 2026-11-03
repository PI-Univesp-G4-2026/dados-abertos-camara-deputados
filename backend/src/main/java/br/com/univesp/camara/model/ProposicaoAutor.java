package br.com.univesp.camara.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "proposicao_autores")
public class ProposicaoAutor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JoinColumn(name = "proposicao_id", nullable = false)
    private Long proposicaoId;

    @JoinColumn(name = "deputado_id")
    private Long deputadoId;

    @Column(name = "nome")
    private String nome;

    @Column(name = "uri")
    private String uri;

    @Column(name = "cod_tipo")
    private Integer codTipo;

    @Column(name = "tipo", length = 30)
    private String tipo;

    @Column(name = "ordem_assinatura")
    private Integer ordemAssinatura;

    @Column(name = "proponente")
    private Integer proponente;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist(){this.createdAt = LocalDateTime.now();}


}
