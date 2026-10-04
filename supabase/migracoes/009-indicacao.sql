-- Indique e ganhe.
--
-- Um servidor informa o codigo de quem o indicou; a indicacao fica PENDENTE
-- ate o servidor indicado provar que e' de verdade (gente e uso, conferidos
-- pelo bot de hora em hora). So' entao os dois ganham dias de Pro.
--
-- Cada servidor pode ser indicado UMA vez, para sempre: a chave e' o indicado.
-- Sem policy de proposito: so' o bot (service role) le e escreve.

create table if not exists cyron_indicacao (
  indicado_id       uuid        primary key references cyron_servidor(id) on delete cascade,
  indicador_id      uuid        not null references cyron_servidor(id) on delete cascade,
  informado_por     text,                                  -- id do Discord de quem digitou o codigo
  criado_em         timestamptz not null default now(),
  status            text        not null default 'pendente'
                    check (status in ('pendente', 'valida', 'recusada')),
  motivo            text,
  validada_em       timestamptz,
  premio_indicador  boolean     not null default false,    -- falso quando o indicador ja' bateu o teto do mes
  check (indicado_id <> indicador_id)
);

alter table cyron_indicacao enable row level security;

create index if not exists cyron_indicacao_indicador on cyron_indicacao (indicador_id, validada_em);
create index if not exists cyron_indicacao_pendente on cyron_indicacao (status) where status = 'pendente';
