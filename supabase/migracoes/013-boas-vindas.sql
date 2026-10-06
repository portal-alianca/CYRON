-- Boas-vindas com imagem: o canal onde o cartao de quem entra aparece.
-- Vazio e' desligado (o padrao). So' o /boas-vindas liga, escolhendo o canal.

alter table cyron_servidor add column if not exists boas_vindas_canal text
  check (boas_vindas_canal is null or boas_vindas_canal ~ '^[0-9]{5,25}$');
