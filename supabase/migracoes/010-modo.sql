-- O jeito que cada servidor usa o CYRON.
--
--   traducao     o servidor em varias linguas: porta de idioma, anuncios,
--                agenda e (no pago) as alas por lingua.
--   ferramentas  so' as ferramentas: o bot nao cria sala nenhuma alem do
--                painel; agenda so' quando alguem usa /evento.
--   escolher     acabou de instalar e ainda nao escolheu: nada e' criado
--                alem do painel, onde fica a pergunta.
--
-- Nulo vale como 'traducao': e' o que todo servidor instalado antes desta
-- coluna ja' tem, e nada muda para eles.

alter table cyron_servidor add column if not exists modo text
  check (modo in ('traducao', 'ferramentas', 'escolher'));
