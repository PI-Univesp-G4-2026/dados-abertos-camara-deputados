ALTER TABLE proposicoes
    ADD COLUMN cod_tipo INTEGER,
    ADD COLUMN data_apresentacao TIMESTAMP,
    ADD COLUMN dados_carregados BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN autores_carregados BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();

INSERT INTO proposicoes(id)
SELECT DISTINCT proposicao_id FROM votacoes WHERE proposicao_id IS NOT NULL;
