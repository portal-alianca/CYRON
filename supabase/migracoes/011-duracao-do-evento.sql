-- Quanto o evento DURA, em segundos ("1h43m27s" = 6207).
--
-- Com duracao, o "repete a cada" conta de quando o evento FECHA, como o
-- contador do jogo: o Urso dura 30m e volta 47h depois de fechar. Vazio e'
-- evento sem duracao, que repete de inicio a inicio, como sempre repetiu --
-- nenhum evento que ja existe muda.

alter table cyron_evento add column if not exists duracao_seg integer
  check (duracao_seg is null or (duracao_seg > 0 and duracao_seg <= 2592000));
