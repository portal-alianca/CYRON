-- /sorteio: o sorteio e quem entrou nele.
-- Encerrado ha' mais de 30 dias, o bot apaga (as entradas vao junto).
-- Sem policy de proposito: so' o bot (service role) le e escreve.

create table if not exists cyron_sorteio (
  id          bigserial   primary key,
  guild_id    text        not null check (guild_id ~ '^[0-9]{5,25}$'),
  canal_id    text        not null check (canal_id ~ '^[0-9]{5,25}$'),
  msg_id      text,
  premio      text        not null check (char_length(premio) between 1 and 200),
  ganhadores  integer     not null default 1 check (ganhadores between 1 and 20),
  termina_em  timestamptz not null,
  criado_por  text        not null,
  encerrado   boolean     not null default false,
  vencedores  jsonb       not null default '[]'::jsonb,
  criado_em   timestamptz not null default now()
);
alter table cyron_sorteio enable row level security;
create index if not exists cyron_sorteio_aberto on cyron_sorteio (termina_em) where not encerrado;

create table if not exists cyron_sorteio_entrada (
  sorteio_id bigint not null references cyron_sorteio(id) on delete cascade,
  user_id    text   not null check (user_id ~ '^[0-9]{5,25}$'),
  primary key (sorteio_id, user_id)
);
alter table cyron_sorteio_entrada enable row level security;
