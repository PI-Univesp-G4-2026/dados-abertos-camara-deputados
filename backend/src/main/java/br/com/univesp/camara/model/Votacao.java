package br.com.univesp.camara.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "votacoes")
public class Votacao {

    @Id
    private String id;

    @Column(name = "data")
    private LocalDate data;

    @Column(name = "data_hora_registro")
    private LocalDateTime dataHoraRegistro;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "aprovacao")
    private Boolean aprovacao;

    @Column(name = "sigla_orgao", length = 20)
    private String siglaOrgao;

    @Column(name = "uri")
    private String uri;

    @Column(name = "uri_evento")
    private String uriEvento;

    @Column(name = "uri_orgao")
    private String uriOrgao;

    @Column(name = "uri_proposicao_objeto")
    private String uriProposicaoObjeto;

    @Column(name = "proposicao_objeto", columnDefinition = "TEXT")
    private String proposicaoObjeto;

    @Column(name = "votos_carregados", nullable = false)
    private boolean votosCarregados;

    @Column(name = "proposicao_id")
    private Long proposicaoId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposicao_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Proposicao proposicao;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalDateTime getDataHoraRegistro() {
        return dataHoraRegistro;
    }

    public void setDataHoraRegistro(LocalDateTime dataHoraRegistro) {
        this.dataHoraRegistro = dataHoraRegistro;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Boolean getAprovacao() {
        return aprovacao;
    }

    public void setAprovacao(Boolean aprovacao) {
        this.aprovacao = aprovacao;
    }

    public String getSiglaOrgao() {
        return siglaOrgao;
    }

    public void setSiglaOrgao(String siglaOrgao) {
        this.siglaOrgao = siglaOrgao;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getUriEvento() {
        return uriEvento;
    }

    public void setUriEvento(String uriEvento) {
        this.uriEvento = uriEvento;
    }

    public String getUriOrgao() {
        return uriOrgao;
    }

    public void setUriOrgao(String uriOrgao) {
        this.uriOrgao = uriOrgao;
    }

    public String getUriProposicaoObjeto() {
        return uriProposicaoObjeto;
    }

    public void setUriProposicaoObjeto(String uriProposicaoObjeto) {
        this.uriProposicaoObjeto = uriProposicaoObjeto;
    }

    public String getProposicaoObjeto() {
        return proposicaoObjeto;
    }

    public void setProposicaoObjeto(String proposicaoObjeto) {
        this.proposicaoObjeto = proposicaoObjeto;
    }

    public boolean isVotosCarregados() {
        return votosCarregados;
    }

    public void setVotosCarregados(boolean votosCarregados) {
        this.votosCarregados = votosCarregados;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


}
