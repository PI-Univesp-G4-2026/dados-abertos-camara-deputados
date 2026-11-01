package br.com.univesp.camara.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "partidos")
public class Partido {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "sigla", length = 30)
    private String sigla;

    @Column(name = "nome")
    private String nome;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public  void prePersist(){
        this.createdAt = LocalDateTime.now();
    }
}
