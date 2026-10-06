-- Niveis e XP (/niveis, /perfil, /top).
--
-- A XP soma na memoria do bot e desce em lote a cada minuto por
-- cyron_somar_xp, que SOMA (nunca sobrescreve): um reinicio no meio, ou dois
-- processos, nao apagam a XP de ninguem. Uma linha por pessoa e servidor.
-- Sem policy de proposito: so' o bot (service role) le e escreve.

alter table cyron_servidor add column if not exists niveis_ligado boolean not null default false;
alter table cyron_servidor add column if not exists niveis_canal  text
  check (niveis_canal is null or niveis_canal ~ '^[0-9]{5,25}$');
alter table cyron_servidor add column if not exists niveis_cargos jsonb not null default '{}'::jsonb;

create table if not exists cyron_xp (
  guild_id      text        not null check (guild_id ~ '^[0-9]{5,25}$'),
  user_id       text        not null check (user_id ~ '^[0-9]{5,25}$'),
  xp            bigint      not null default 0,
  mensagens     integer     not null default 0,
  atualizado_em timestamptz not null default now(),
  primary key (guild_id, user_id)
);
alter table cyron_xp enable row level security;
create index if not exists cyron_xp_placar on cyron_xp (guild_id, xp desc);

create or replace function cyron_somar_xp(p_linhas jsonb) returns void
language sql security definer set search_path = public as $$
  insert into cyron_xp (guild_id, user_id, xp, mensagens, atualizado_em)
  select l->>'g', l->>'u', greatest(0, (l->>'xp')::bigint), greatest(0, (l->>'m')::int), now()
  from jsonb_array_elements(p_linhas) l
  on conflict (guild_id, user_id) do update
    set xp = cyron_xp.xp + excluded.xp,
        mensagens = cyron_xp.mensagens + excluded.mensagens,
        atualizado_em = now();
$$;

-- Quantos estao acima: a posicao no /perfil sem trazer a lista inteira.
create or replace function cyron_posicao_xp(p_guild text, p_xp bigint) returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::int from cyron_xp where guild_id = p_guild and xp > p_xp;
$$;

revoke all on function cyron_somar_xp(jsonb) from public, anon, authenticated;
revoke all on function cyron_posicao_xp(text, bigint) from public, anon, authenticated;
