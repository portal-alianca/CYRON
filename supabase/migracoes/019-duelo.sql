-- ⚔️ Duelo CYRON: o progresso de cada pessoa com cada personagem.
-- O duelo em si vive na memoria do bot; aqui so' o resultado, gravado no fim.
-- Sem policy de proposito: so' o bot (service role) le e escreve.

create table if not exists cyron_duelo_personagem (
  user_id       text        not null check (user_id ~ '^[0-9]{5,25}$'),
  personagem    text        not null check (personagem ~ '^[a-z]{2,20}$'),
  xp            integer     not null default 0 check (xp >= 0),
  kit           jsonb       not null default '{}'::jsonb,
  vitorias      integer     not null default 0 check (vitorias >= 0),
  derrotas      integer     not null default 0 check (derrotas >= 0),
  atualizado_em timestamptz not null default now(),
  primary key (user_id, personagem)
);
alter table cyron_duelo_personagem enable row level security;
