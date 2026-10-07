-- /suporte: o ADM de um servidor libera, por um prazo, o dono da CYRON para
-- configurar o bot ali. Sem liberacao valida, o dono nao tem acesso nenhum.
-- O registro do que foi feito fica junto, para o ADM conferir.
-- Sem policy de proposito: so' o bot (service role) le e escreve.

create table if not exists cyron_suporte (
  guild_id      text        primary key check (guild_id ~ '^[0-9]{5,25}$'),
  ate           timestamptz not null,
  liberado_por  text        not null check (liberado_por ~ '^[0-9]{5,25}$'),
  canal_id      text,
  registro      jsonb       not null default '[]'::jsonb,
  criado_em     timestamptz not null default now()
);
alter table cyron_suporte enable row level security;
