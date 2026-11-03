CREATE TABLE proposicao_autores(
    id BIGSERIAL PRIMARY KEY,
    proposicao_id BIGINT NOT NULL REFERENCES proposicoes(id),
    nome VARCHAR(255),
    uri VARCHAR(255),
    cod_tipo INTEGER,
    tipo VARCHAR(30),
    ordem_assinatura INTEGER,
    proponente INTEGER,
    deputado_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_autores_proposicao_id ON proposicao_autores (proposicao_id);
CREATE INDEX idx_autores_deputado_id ON proposicao_autores (deputado_id);