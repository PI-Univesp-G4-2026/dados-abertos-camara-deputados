CREATE TABLE orientacoes_bancadas (
                                      id BIGSERIAL PRIMARY KEY,
                                      votacao_id VARCHAR(50) NOT NULL REFERENCES votacoes(id) ON DELETE CASCADE,
                                      sigla_partido_bloco VARCHAR(100),
                                      orientacao_voto VARCHAR(50),
                                      UNIQUE(votacao_id, sigla_partido_bloco)
);
CREATE INDEX idx_orientacoes_votacao ON orientacoes_bancadas(votacao_id);