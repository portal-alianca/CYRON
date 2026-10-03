-- Quem escreveu cada fala espelhada.
--
-- So' a linha da ORIGINAL leva o autor (as copias sao do webhook). Serve ao
-- painel de cada servidor: "quem mais conversa entre linguas". Mora na mesma
-- tabela e some junto com ela em 14 dias -- nao vira historico de ninguem.

alter table discord_fala_espelhada add column if not exists autor_id text;

create index if not exists discord_fala_espelhada_servidor
  on discord_fala_espelhada (servidor_id, criado_em);
