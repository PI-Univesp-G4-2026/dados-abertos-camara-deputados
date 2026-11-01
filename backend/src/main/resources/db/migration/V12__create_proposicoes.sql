CREATE TABLE proposicoes (
                             id BIGINT PRIMARY KEY,
                             sigla_tipo VARCHAR(20),
                             numero INTEGER,
                             ano INTEGER,
                             ementa TEXT,
                             url_inteiro_teor VARCHAR(500)
);