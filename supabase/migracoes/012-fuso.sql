-- O fuso de cada pessoa, escolhido no /hora ("que horas sao ai agora?").
--
-- Tabela propria, uma linha por pessoa, lida uma pessoa por vez -- e nao no
-- cyron_ajuste, que o bot le inteiro a cada minuto. O Discord nao conta ao
-- bot onde ninguem esta'; isto so' existe para quem tocou no proprio horario,
-- e o 🗑️ do /hora apaga na hora.
-- Sem policy de proposito: so' o bot (service role) le e escreve.

create table if not exists cyron_fuso (
  discord_user_id text        primary key check (discord_user_id ~ '^[0-9]{5,25}$'),
  zona            text        not null check (char_length(zona) <= 64),
  atualizado_em   timestamptz not null default now()
);

alter table cyron_fuso enable row level security;
