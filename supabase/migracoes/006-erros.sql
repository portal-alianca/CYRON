-- A fila de erros do bot.
--
-- Cada TIPO de erro e' uma linha (a chave e' o hash do que ele quer dizer), e
-- nao cada ocorrencia: trinta quedas iguais do Supabase sao uma linha com
-- vezes = 30. O canal 🐛-erros mostra um cartao por linha, editado no lugar.
--
-- E' tambem a fila de conserto: quem for consertar (pessoa ou Claude) le as
-- linhas abertas, conserta, e muda o status -- o cartao no Discord acompanha
-- sozinho na proxima volta do relogio. Fica no banco, e nao em issue do
-- GitHub, porque o repositorio e' publico e mensagem de erro carrega nome de
-- servidor e pedaco de conversa.
--
-- Sem policy de proposito: so' o bot (service role) le e escreve.

create table if not exists cyron_erro (
  chave            text        primary key,
  titulo           text        not null,
  onde             text        not null,
  porque           text        not null,
  explicado        boolean     not null default false,
  precisa_de_voce  boolean     not null default false,
  vezes            integer     not null default 0,
  primeiro_em      timestamptz not null default now(),
  ultimo_em        timestamptz not null default now(),
  status           text        not null default 'aberto'
                   check (status in ('aberto', 'consertando', 'resolvido', 'silenciado')),
  nota             text,
  silencio_ate     timestamptz,
  msg_id           text
);

alter table cyron_erro enable row level security;

create index if not exists cyron_erro_status on cyron_erro (status, ultimo_em desc);
