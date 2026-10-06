-- Niveis: salas sem XP e a guerra de bandeiras do /top.
--
-- niveis_sem_xp: ids de salas (ou categorias) onde nao se ganha XP.
-- cyron_xp_por_idioma: a XP do servidor somada pela lingua que cada pessoa
-- escolheu na CYRON -- o placar "🇧🇷 vs 🇷🇺" que so' a CYRON tem.

alter table cyron_servidor add column if not exists niveis_sem_xp jsonb not null default '[]'::jsonb;

create or replace function cyron_xp_por_idioma(p_guild text)
returns table (idioma text, xp bigint, pessoas integer)
language sql stable security definer set search_path = public as $$
  select coalesce(i.idioma, '?') as idioma, sum(x.xp)::bigint as xp, count(*)::int as pessoas
  from cyron_xp x
  left join discord_idioma_jogador i on i.discord_user_id = x.user_id
  where x.guild_id = p_guild
  group by 1
  order by 2 desc
  limit 20;
$$;

revoke all on function cyron_xp_por_idioma(text) from public, anon, authenticated;
