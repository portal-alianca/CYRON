# Como consertar os erros do CYRON

O bot organiza os próprios erros. Este é o roteiro para quem for consertar,
seja pessoa ou Claude.

## Onde estão

- **No Discord:** canal `🐛-erros` do servidor de painel. Cada tipo de erro tem
  **um cartão**, editado no lugar, com quantas vezes aconteceu, desde quando e
  o status. O quadro fixado no topo lista o que está aberto.
- **No banco:** tabela `cyron_erro` do Supabase. É a fila de conserto. O
  repositório é público, então os erros não viram issue: a mensagem de erro
  pode carregar nome de servidor e pedaço de conversa.

## O roteiro

1. Ver o que está aberto, o mais repetido primeiro:

   ```sql
   select chave, titulo, onde, porque, vezes, primeiro_em, ultimo_em, nota
   from cyron_erro
   where status in ('aberto', 'consertando')
   order by precisa_de_voce desc, vezes desc;
   ```

2. Avisar que está mexendo (o cartão no Discord muda em até 1 hora):

   ```sql
   update cyron_erro set status = 'consertando', nota = 'investigando' where chave = '<chave>';
   ```

3. Achar o lugar: `onde` é o prefixo do `console.error` em `index.js`
   (ex.: `espelho`, `eventos`, `painel`). Procure a mensagem de `porque` no código.

4. Consertar com teste em `testes.js` (`node testes.js` tem de passar), abrir o
   PR e juntar depois que o "Testes do bot" passar.

5. Fechar, dizendo o que foi feito:

   ```sql
   update cyron_erro set status = 'resolvido', nota = 'PR #123: <o que mudou>' where chave = '<chave>';
   ```

Se o erro voltar depois de resolvido, o bot reabre o cartão sozinho com a nota
"voltou a acontecer". Erro que passa 24 horas sem aparecer fecha sozinho.

Pelos botões do cartão o dono também pode marcar **Resolvido**, **Estou
consertando**, **Silenciar 7 dias** ou **Reabrir**.
