CREATE TABLE legislaturas(
    id INTEGER PRIMARY KEY,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);