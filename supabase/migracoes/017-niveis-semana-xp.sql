-- Niveis, parte 3: ranking da semana, /xp do administrador, cargo que troca,
-- XP em dobro e a mensagem de nivel editavel.

alter table cyron_servidor add column if not exists niveis_texto       text
  check (niveis_texto is null or char_length(niveis_texto) <= 500);
alter table cyron_servidor add column if not exists niveis_trocar      boolean not null default false;
alter table cyron_servidor add column if not exists niveis_dobro_boost boolean not null default false;
alter table cyron_servidor add column if not exists niveis_dobro_cargo text
  check (niveis_dobro_cargo is null or niveis_dobro_cargo ~ '^[0-9]{5,25}$');

-- A semana: a XP desta semana e qual semana e' (ISO, em UTC, "2026-W41").
-- Virou a semana, a primeira soma recomeca do zero -- sem tarefa de limpeza.
alter table cyron_xp add column if not exists xp_semana bigint not null default 0;
alter table cyron_xp add column if not exists semana    text;
create index if not exists cyron_xp_semana on cyron_xp (guild_id, semana, xp_semana desc);

create or replace function cyron_somar_xp(p_linhas jsonb) returns void
language sql security definer set search_path = public as $$
  insert into cyron_xp (guild_id, user_id, xp, mensagens, xp_semana, semana, atualizado_em)
  select l->>'g', l->>'u', greatest(0, (l->>'xp')::bigint), greatest(0, (l->>'m')::int),
         greatest(0, (l->>'xp')::bigint), to_char(now() at time zone 'utc', 'IYYY-"W"IW'), now()
  from jsonb_array_elements(p_linhas) l
  on conflict (guild_id, user_id) do update
    set xp = cyron_xp.xp + excluded.xp,
        mensagens = cyron_xp.mensagens + excluded.mensagens,
        xp_semana = case when cyron_xp.semana = excluded.semana
                         then cyron_xp.xp_semana + excluded.xp_semana else excluded.xp_semana end,
        semana = excluded.semana,
        atualizado_em = now();
$$;

-- O /xp: soma (ou tira, sem passar de zero) ou zera. Devolve a XP nova.
create or replace function cyron_ajustar_xp(p_guild text, p_user text, p_delta bigint, p_zerar boolean)
returns bigint language plpgsql security definer set search_path = public as $$
declare novo bigint;
begin
  insert into cyron_xp (guild_id, user_id, xp, semana)
  values (p_guild, p_user, case when p_zerar then 0 else greatest(0, p_delta) end,
          to_char(now() at time zone 'utc', 'IYYY-"W"IW'))
  on conflict (guild_id, user_id) do update
    set xp = case when p_zerar then 0 else greatest(0, cyron_xp.xp + p_delta) end,
        xp_semana = case when p_zerar then 0 else cyron_xp.xp_semana end,
        atualizado_em = now()
  returning xp into novo;
  return novo;
end $$;

revoke all on function cyron_somar_xp(jsonb) from public, anon, authenticated;
revoke all on function cyron_ajustar_xp(text, text, bigint, boolean) from public, anon, authenticated;
