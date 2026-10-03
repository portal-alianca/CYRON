-- A agenda de eventos: GIF, cargo, repeticao, lembrete no privado e o aviso
-- na hora.
--
-- A presenca (cyron_evento_presenca, vai = true) passa a ser a INSCRICAO:
-- quem se inscreve recebe o lembrete no privado e e' marcado quando o evento
-- comeca. Num evento que repete, a inscricao vale para as proximas vezes, como
-- o "inscrever-se automaticamente" do jogo.
--
-- As duas marcas de "ja fiz" sao o que garante que lembrete e aviso saem UMA
-- vez so', mesmo com o bot reiniciando no meio. Quando o evento repete, elas
-- voltam a false junto com a data nova.

alter table cyron_evento add column if not exists gif_url        text;
alter table cyron_evento add column if not exists cargo_id       text;
alter table cyron_evento add column if not exists repetir_min    integer;
alter table cyron_evento add column if not exists lembrete_min   integer;
alter table cyron_evento add column if not exists lembrete_feito boolean not null default false;
alter table cyron_evento add column if not exists aviso_feito    boolean not null default false;

-- A ronda de minuto em minuto procura o que ainda nao foi avisado.
create index if not exists cyron_evento_pendente
  on cyron_evento (quando) where not aviso_feito;
