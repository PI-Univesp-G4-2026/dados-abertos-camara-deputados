CREATE TABLE votacao_proposicao_manual (
    votacao_id    VARCHAR(30) PRIMARY KEY,
    proposicao_id BIGINT      NOT NULL,
    motivo        TEXT,
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

INSERT INTO votacao_proposicao_manual (votacao_id, proposicao_id, motivo)
VALUES ('2233802-438', 2233802, 'PEC 221/2019 (escala 6x1): a API não informa a proposição desta votação')
ON CONFLICT (votacao_id) DO NOTHING;