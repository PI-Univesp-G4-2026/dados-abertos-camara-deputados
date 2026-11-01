package br.com.univesp.camara.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "legislaturas")
public class Legislatura {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public  void prePersist(){
        this.createdAt = LocalDateTime.now();
    }
}
