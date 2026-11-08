-- Correção manual: A API da Câmara retornou "CONVOCADO" e "Exercício" com o mesmo timestamp.
-- O ETL pegou o "CONVOCADO" por causa do empate. Forçamos o status correto.
UPDATE deputados
SET situacao = 'Exercício'
WHERE id = 171617;