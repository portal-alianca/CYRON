-- Quanto cada recurso pago por quantidade foi usado no mes.
--
-- Comeca pela leitura de imagem (Azure, 5 mil por mes no plano gratis), que
-- nao era contada em lugar nenhum: o bot so' descobria o fim da cota quando a
-- Azure recusava. Uma linha por recurso, servidor e mes; servidor vazio
-- quando o uso nao veio de um servidor.
--
-- Sem policy de proposito: so' o bot (service role) le e escreve.

create table if not exists cyron_uso_recurso (
  recurso      text    not null,
  servidor_id  text    not null default '',
  mes          date    not null,             -- o dia 1 do mes
  quantidade   bigint  not null default 0,
  primary key (recurso, servidor_id, mes)
);

alter table cyron_uso_recurso enable row level security;

create or replace function cyron_somar_recurso(p_recurso text, p_servidor text, p_mes date, p_quantidade bigint)
returns bigint
language sql
as $$
  insert into cyron_uso_recurso (recurso, servidor_id, mes, quantidade)
  values (p_recurso, coalesce(p_servidor, ''), p_mes, greatest(p_quantidade, 0))
  on conflict (recurso, servidor_id, mes) do update
    set quantidade = cyron_uso_recurso.quantidade + excluded.quantidade
  returning quantidade;
$$;

revoke execute on function cyron_somar_recurso(text, text, date, bigint) from public, anon, authenticated;
grant execute on function cyron_somar_recurso(text, text, date, bigint) to service_role;
