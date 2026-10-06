-- O texto que o administrador escreveu para as boas-vindas (o botao ✏️ do
-- /boas-vindas), com marcadores: {usuario} {nome} {servidor} {numero} {ola}.
-- Vazio e' o padrao: "👋 {usuario} · {ola}".

alter table cyron_servidor add column if not exists boas_vindas_texto text
  check (boas_vindas_texto is null or char_length(boas_vindas_texto) <= 1000);
