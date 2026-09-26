/* O servidor de suporte do CYRON: montado pelo proprio bot, e porta de entrada
   para o teste e para o pagamento.

   Duas coisas moram aqui:

     - montarSuporte: cria (ou arruma) as categorias, as salas e os textos do
       servidor de suporte -- boas-vindas, regras, modo de usar, planos. Pode
       rodar de novo quantas vezes quiser: o que existe e' reaproveitado, e o
       texto que eu ja' postei e' EDITADO, nao duplicado.
     - estaNoSuporte / exigirSuporte: o plano gratis e' de todos, mas o teste
       de 7 dias, o Pix e o codigo pedem que quem clicou esteja no servidor de
       suporte. E' la' que a pessoa tira duvida e fala com o dono se o
       pagamento der errado -- quem paga sem estar la' nao tem a quem recorrer.

   Qual e' o servidor de suporte sai do CONVITE (SUPORTE.link), e nao de um id
   escrito aqui: trocar de servidor e' trocar o link no ajuste.

   O index.js chama `ligarSuporte` uma vez, entregando o que este arquivo usa
   de la'. Assim nao ha' import circular. */

let d = null;
export function ligarSuporte(dependencias) { d = dependencias; }

/* ---------------- qual e' o servidor de suporte ---------------- */

let achado = { link: "", guild: null, t: 0 };

export async function guildDoSuporte() {
  const link = d.SUPORTE.link;
  if (achado.link === link && achado.guild && Date.now() - achado.t < 60 * 60 * 1000) return achado.guild;
  const convite = await d.client.fetchInvite(link).catch(() => null);
  const guild = convite?.guild?.id ? d.client.guilds.cache.get(convite.guild.id) ?? null : null;
  achado = { link, guild, t: Date.now() };
  return guild;
}

/* ---------------- quem esta' no suporte ----------------

   So' o SIM fica guardado: quem acabou de entrar precisa que o clique
   seguinte ja' passe, entao o NAO e' sempre perguntado de novo.

   Na duvida, deixa passar. Se o Discord nao responde, ou eu nem estou no
   servidor do convite, o problema e' meu -- e barrar um cliente que quer
   pagar por um defeito meu e' o pior erro possivel aqui. */
const membros = new Map(); // userId -> quando confirmei

export async function estaNoSuporte(userId) {
  const visto = membros.get(userId);
  if (visto && Date.now() - visto < 10 * 60 * 1000) return true;
  const guild = await guildDoSuporte().catch(() => null);
  if (!guild) return true;
  const membro = await guild.members.fetch({ user: userId, force: true })
    .catch((e) => (e?.code === 10007 || e?.code === 10013 ? null : undefined));
  if (membro === undefined) return true;
  if (!membro) return false;
  membros.set(userId, Date.now());
  return true;
}

export function botaoDoSuporte() {
  return { type: 2, style: 5, emoji: { name: "💬" }, label: "Entrar no suporte · Join support", url: d.SUPORTE.link };
}

/* Devolve true quando pode seguir. Quando nao pode, ja' respondeu -- na
   lingua de quem clicou, porque quem mais cai aqui e' justamente quem e' de
   fora. */
export async function exigirSuporte(inter, oque) {
  if (await estaNoSuporte(inter.user.id)) return true;
  const idioma = (await d.idiomaEscolhido(inter.user.id).catch(() => "")) || d.idiomaDoAplicativo(inter.locale);
  const embed = await d.traduzirEmbed({
    color: d.COR,
    title: "💬 Falta um passo",
    description: `Para ${oque}, entre antes no servidor de suporte do CYRON. ` +
      "Lá você tira dúvidas, recebe as novidades e fala com a gente se o pagamento der errado.\n\n" +
      "Depois de entrar, clique de novo no mesmo botão.",
  }, idioma).catch(() => null);
  const resposta = { flags: 64, embeds: [embed ?? { color: d.COR, title: "💬 Join the CYRON support server first" }],
    components: [{ type: 1, components: [botaoDoSuporte()] }] };
  if (inter.deferred || inter.replied) await inter.editReply(resposta);
  else await inter.reply(resposta);
  return false;
}

/* ---------------- o que o servidor tem ----------------

   Os textos sao escritos em portugues e ingles. O ingles e' o que fica na
   sala: o servidor e' internacional, e ingles e' a lingua que mais gente le.
   O botao 🌐 de cada texto traduz o PORTUGUES para a lingua de quem clicou --
   o tradutor parte sempre do portugues, e o portugues e' o texto original. */
const COR_SUPORTE = 0x5865F2;

export const TEXTOS = {
  boas: {
    pt: {
      title: "👋 Bem-vindo ao suporte do CYRON",
      description: [
        "O CYRON é um bot de tradução para Discord: cada pessoa escreve na língua dela e todo mundo lê na sua.",
        "",
        "**Por onde começar:**",
        "🌐 Escolha o seu idioma. As salas aparecem na sua língua.",
        "📜 Leia as regras.",
        "📖 Veja como usar o bot.",
        "💬 Tem uma dúvida, quer assinar ou o pagamento deu errado? Escreva no chat do seu idioma.",
        "",
        "No chat, cada pessoa escreve na língua dela e a equipe lê traduzido. Aqui a gente se entende.",
      ].join("\n"),
    },
    en: {
      title: "👋 Welcome to CYRON Support",
      description: [
        "CYRON is a translation bot for Discord: everyone writes in their own language and everyone reads in theirs.",
        "",
        "**Where to start:**",
        "🌐 Pick your language. The rooms show up in your language.",
        "📜 Read the rules.",
        "📖 See how to use the bot.",
        "💬 Got a question, want to subscribe, or had a payment problem? Write in your language's chat.",
        "",
        "In the chat, everyone writes in their own language and the team reads it translated. We'll understand each other here.",
      ].join("\n"),
    },
  },
  regras: {
    pt: {
      title: "📜 Regras",
      description: [
        "**1.** Respeito com todo mundo. Sem ofensa, preconceito ou provocação.",
        "**2.** Sem spam e sem propaganda de outros servidores ou bots.",
        "**3.** Escreva na língua que quiser. O CYRON traduz.",
        "**4.** Nunca poste token, senha ou chave de API. A equipe **nunca** pede isso.",
        "**5.** A equipe **nunca** chama você no privado para cobrar. Pagamento é só pelo botão do bot. Se alguém pedir dinheiro no privado, é golpe: avise a gente.",
        "**6.** Dúvida e pagamento no chat do seu idioma, defeito na sala de bugs, ideia na sala de sugestões.",
        "",
        "Quem não cumprir as regras pode ser removido do servidor.",
      ].join("\n"),
    },
    en: {
      title: "📜 Rules",
      description: [
        "**1.** Be respectful to everyone. No insults, hate or provocation.",
        "**2.** No spam and no advertising other servers or bots.",
        "**3.** Write in any language you like. CYRON translates.",
        "**4.** Never post a token, password or API key. Staff will **never** ask for one.",
        "**5.** Staff will **never** DM you asking for payment. Payment happens only through the bot's button. If someone asks you for money in DMs, it's a scam: let us know.",
        "**6.** Questions and payments go in your language's chat, defects in bugs, ideas in suggestions.",
        "",
        "Anyone who breaks the rules may be removed from the server.",
      ].join("\n"),
    },
  },
  uso: {
    pt: {
      title: "📖 Como usar o CYRON",
      description: [
        "**1. Instale.** Use o link de instalação e escolha o seu servidor. Eu crio um canal onde cada pessoa escolhe o idioma dela, e um painel para a administração.",
        "",
        "**2. Abra o painel com /cyron.** Lá você marca os canais que quer traduzir e vê o seu plano.",
        "",
        "**3. Cada pessoa escolhe o idioma** no canal 🌐, uma vez só.",
        "",
        "**Traduzir uma mensagem solta:** reaja com a bandeira do idioma, ou use o botão direito na mensagem → Apps → Translate.",
        "",
        "**No Pro e na Aliança:** cada idioma ganha salas próprias, e quem escreve numa sala aparece traduzido nas outras, com nome e foto. Também traduzo texto em imagem 🖼️ e áudio 🎧.",
        "",
        "**Teste grátis:** no /cyron, o botão 🎁 liga 7 dias de Pro. Para liberar, é preciso estar neste servidor.",
      ].join("\n"),
    },
    en: {
      title: "📖 How to use CYRON",
      description: [
        "**1. Install.** Use the install link and pick your server. I create a channel where each person picks their language, plus a panel for the admins.",
        "",
        "**2. Open the panel with /cyron.** There you mark the channels you want translated and see your plan.",
        "",
        "**3. Everyone picks their language** in the 🌐 channel, just once.",
        "",
        "**Translate a single message:** react with the language's flag, or right-click the message → Apps → Translate.",
        "",
        "**On Pro and Alliance:** each language gets its own rooms, and whoever writes in one room shows up translated in the others, with name and avatar. I also translate text in images 🖼️ and audio 🎧.",
        "",
        "**Free trial:** in /cyron, the 🎁 button turns on 7 days of Pro. To unlock it, you need to be in this server.",
      ].join("\n"),
    },
  },
  novidades: {
    pt: { title: "📣 Novidades", description: "Aqui saem as novidades do CYRON: recursos novos, correções e avisos importantes. Siga este canal para receber no seu servidor." },
    en: { title: "📣 News", description: "CYRON news lands here: new features, fixes and important notices. Follow this channel to get them in your own server." },
  },
  pagamento: {
    pt: {
      title: "💳 Planos e pagamentos",
      description: [
        "⭐ **Pro** — R$ 29,90 ou US$ 6 por mês: até 5 idiomas, 3 canais copiados, imagem e áudio.",
        "🏆 **Aliança** — R$ 79 ou US$ 15 por mês: até 20 idiomas, 10 canais copiados e o triplo de tradução e de áudio.",
        "",
        "🇧🇷 **No Brasil:** no /cyron, clique em 💠 Pagar com Pix. O plano liga sozinho quando o Pix cai.",
        "🌍 **Fora do Brasil:** escreva no chat do seu idioma qual plano você quer e o nome do seu servidor. A gente combina o pagamento com você.",
        "",
        "Pagamento é só pelo botão do bot ou combinado no chat. A equipe nunca cobra no privado.",
      ].join("\n"),
    },
    en: {
      title: "💳 Plans and payments",
      description: [
        "⭐ **Pro** — US$ 6 (R$ 29.90) per month: up to 5 languages, 3 mirrored channels, images and audio.",
        "🏆 **Alliance** — US$ 15 (R$ 79) per month: up to 20 languages, 10 mirrored channels and triple the translation and audio.",
        "",
        "🇧🇷 **In Brazil:** in /cyron, click 💠 Pagar com Pix. The plan turns on by itself when the Pix lands.",
        "🌍 **Outside Brazil:** write in your language's chat which plan you want and your server's name. We'll arrange payment with you.",
        "",
        "Payment happens only through the bot's button or arranged in the chat. Staff never charges in DMs.",
      ].join("\n"),
    },
  },
  sugestoes: {
    pt: { title: "💡 Sugestões", description: "Tem uma ideia para o CYRON? Escreva aqui. Reaja com 👍 nas ideias que você também quer: as mais votadas vêm primeiro." },
    en: { title: "💡 Suggestions", description: "Got an idea for CYRON? Write it here. React 👍 on the ideas you want too: the most voted come first." },
  },
  bugs: {
    pt: { title: "🐞 Bugs", description: "Achou um defeito? Conte aqui:\n**1.** O que você fez.\n**2.** O que esperava que acontecesse.\n**3.** O que aconteceu de verdade.\nUm print ajuda muito." },
    en: { title: "🐞 Bugs", description: "Found a defect? Tell us here:\n**1.** What you did.\n**2.** What you expected to happen.\n**3.** What actually happened.\nA screenshot helps a lot." },
  },
};

/* leitura: so' eu escrevo (a pessoa le e reage) -- e a sala vira FONTE:
   cada idioma ganha a copia dela, traduzida e com o nome na lingua dele.
   sistema: e' onde o Discord anuncia quem entrou. chave: qual nome traduzido
   a copia recebe (ver NOMES).

   Duvida e pagamento nao tem sala propria: sao conversa, e conversa e' no
   chat do idioma -- la' a pessoa escreve na lingua dela e a equipe le
   traduzido. Uma sala "help" em ingles era justamente onde o japones nao
   conseguia pedir ajuda. */
export const ESTRUTURA = [
  { categoria: "📌 START HERE", canais: [
    { nome: "👋・welcome", chave: "welcome", texto: "boas", leitura: true, sistema: true },
    { nome: "📜・rules", chave: "rules", texto: "regras", leitura: true },
    { nome: "📖・how-to-use", chave: "howto", texto: "uso", leitura: true },
    { nome: "💳・plans", chave: "plans", texto: "pagamento", leitura: true },
    { nome: "📣・news", chave: "news", texto: "novidades", leitura: true },
  ] },
  { categoria: "💬 HELP", canais: [
    { nome: "💡・suggestions", texto: "sugestoes", topico: "Ideas for CYRON · Ideias para o CYRON" },
    { nome: "🐞・bugs", texto: "bugs", topico: "Report a defect · Conte um defeito" },
  ] },
];

/* Salas que existiram numa versao anterior e sairam. So' somem se ninguem
   conversou nelas: apagar a pergunta de um cliente seria pior que deixar
   uma sala sobrando. */
export const SALAS_ANTIGAS = ["❓・help", "💳・plans-and-payments"];

/* O que o Discord cria sozinho em servidor novo. Mesma regra: so' sai vazio. */
const PADROES_TEXTO = ["geral", "general"];
const PADROES_VOZ = ["Geral", "General"];
const PADROES_CATEGORIA = ["Canais de Texto", "Canais de Voz", "Text Channels", "Voice Channels"];

/* O nome da copia na lingua de quem a le. Escrito a mao, e nao pelo
   tradutor: nome de canal e' curto demais para o tradutor acertar sozinho
   ("news" virava "notícias" num dia e "novas" no outro), e um nome que muda
   de uma varredura para outra renomearia a sala sem fim. */
export const NOMES = {
  pt: { welcome: "boas-vindas", rules: "regras", howto: "como-usar", plans: "planos", news: "novidades", chat: "chat" },
  en: { welcome: "welcome", rules: "rules", howto: "how-to-use", plans: "plans", news: "news", chat: "chat" },
  es: { welcome: "bienvenida", rules: "reglas", howto: "cómo-usar", plans: "planes", news: "novedades", chat: "chat" },
  ko: { welcome: "환영", rules: "규칙", howto: "사용법", plans: "요금제", news: "소식", chat: "채팅" },
  ja: { welcome: "ようこそ", rules: "ルール", howto: "使い方", plans: "プラン", news: "お知らせ", chat: "チャット" },
  "zh-CN": { welcome: "欢迎", rules: "规则", howto: "使用方法", plans: "套餐", news: "新闻", chat: "聊天" },
  de: { welcome: "willkommen", rules: "regeln", howto: "anleitung", plans: "preise", news: "neuigkeiten", chat: "chat" },
  fr: { welcome: "bienvenue", rules: "règles", howto: "mode-d-emploi", plans: "offres", news: "actualités", chat: "discussion" },
  it: { welcome: "benvenuto", rules: "regole", howto: "come-usare", plans: "piani", news: "novità", chat: "chat" },
  ru: { welcome: "добро-пожаловать", rules: "правила", howto: "как-пользоваться", plans: "тарифы", news: "новости", chat: "чат" },
  ar: { welcome: "مرحبا", rules: "القواعد", howto: "طريقة-الاستخدام", plans: "الخطط", news: "الأخبار", chat: "الدردشة" },
  tr: { welcome: "hoş-geldin", rules: "kurallar", howto: "nasıl-kullanılır", plans: "planlar", news: "haberler", chat: "sohbet" },
  id: { welcome: "selamat-datang", rules: "aturan", howto: "cara-pakai", plans: "paket", news: "berita", chat: "obrolan" },
  th: { welcome: "ยินดีต้อนรับ", rules: "กฎ", howto: "วิธีใช้", plans: "แพ็กเกจ", news: "ข่าว", chat: "แชท" },
  vi: { welcome: "chào-mừng", rules: "quy-tắc", howto: "hướng-dẫn", plans: "gói", news: "tin-tức", chat: "trò-chuyện" },
  pl: { welcome: "witaj", rules: "zasady", howto: "jak-używać", plans: "plany", news: "aktualności", chat: "czat" },
  nl: { welcome: "welkom", rules: "regels", howto: "handleiding", plans: "abonnementen", news: "nieuws", chat: "chat" },
  tl: { welcome: "maligayang-pagdating", rules: "mga-patakaran", howto: "paano-gamitin", plans: "mga-plano", news: "balita", chat: "chat" },
  hi: { welcome: "स्वागत", rules: "नियम", howto: "उपयोग-कैसे-करें", plans: "प्लान", news: "समाचार", chat: "चैट" },
  uk: { welcome: "вітаємо", rules: "правила", howto: "як-користуватися", plans: "тарифи", news: "новини", chat: "чат" },
};

/* "👋・welcome" em japones vira "👋・ようこそ". O emoji fica: e' ele que
   diz, sem ler, que a sala e' a mesma nas vinte linguas. Nula quando a sala
   nao e' do suporte ou a lingua nao esta' na tabela -- e ai vale o nome de
   sempre. */
export function nomeNoIdioma(nomeOriginal, idioma) {
  const palavras = NOMES[idioma];
  if (!palavras) return null;
  if (nomeOriginal === "chat") return `💬・${palavras.chat}`;
  const sala = ESTRUTURA.flatMap((b) => b.canais).find((c) => c.nome === nomeOriginal && c.chave);
  if (!sala) return null;
  return `${nomeOriginal.split("・")[0]}・${palavras[sala.chave]}`;
}

export const PREFIXO_LER = "sup:ler:";

function linhaDeLer(chave) {
  return { type: 1, components: [
    { type: 2, style: 2, custom_id: `${PREFIXO_LER}${chave}`, emoji: { name: "🌐" }, label: "My language · Na minha língua" },
  ] };
}

function cartao(chave, lingua) {
  return { color: COR_SUPORTE, ...TEXTOS[chave][lingua] };
}

/* O texto que eu ja' postei e' reconhecido pelo botao dele, e nao pelo
   titulo: o titulo pode mudar numa versao nova, o custom_id nao. */
async function postarOuEditar(canal, chave) {
  const corpo = { embeds: [cartao(chave, "en")], components: [linhaDeLer(chave)] };
  const recentes = await canal.messages.fetch({ limit: 30 }).catch(() => null);
  const meu = recentes?.find((m) => m.author?.id === d.client.user.id &&
    m.components?.some((l) => l.components?.some((c) => c.customId === `${PREFIXO_LER}${chave}`)));
  if (meu) { await meu.edit(corpo); return "editado"; }
  await canal.send(corpo);
  return "postado";
}

export async function montarSuporte(guild) {
  const { ChannelType, PermissionFlagsBits: P } = d;
  const feito = [];
  const leitura = [];
  await guild.channels.fetch();
  const eu = d.client.user.id;

  for (const bloco of ESTRUTURA) {
    let categoria = guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name === bloco.categoria);
    if (!categoria) {
      categoria = await guild.channels.create({ name: bloco.categoria, type: ChannelType.GuildCategory });
      feito.push(`📁 ${bloco.categoria}`);
    }
    for (const c of bloco.canais) {
      let canal = guild.channels.cache.find((x) => x.type === ChannelType.GuildText && x.name === c.nome);
      if (!canal) {
        canal = await guild.channels.create({
          name: c.nome, type: ChannelType.GuildText, parent: categoria.id, topic: c.topico,
          permissionOverwrites: c.leitura
            ? [
                { id: guild.roles.everyone.id, deny: [P.SendMessages, P.CreatePublicThreads, P.CreatePrivateThreads] },
                { id: eu, allow: [P.ViewChannel, P.SendMessages, P.EmbedLinks] },
              ]
            : [],
        });
        feito.push(`#${c.nome}`);
      }
      const como = await postarOuEditar(canal, c.texto);
      if (como === "postado") feito.push(`📝 texto em #${c.nome}`);
      if (c.sistema && guild.systemChannelId !== canal.id) {
        await guild.setSystemChannel(canal).then(() => feito.push(`👋 entradas anunciadas em #${c.nome}`)).catch(() => {});
      }
      if (c.leitura) leitura.push(canal.id);
    }
  }

  /* As salas de leitura sao AS fontes do suporte -- exatamente elas. Cada
     idioma escolhido ganha a copia delas, traduzida, e a sala nova ja' nasce
     com os textos. Qualquer outra fonte (de uma montagem antiga, de um teste)
     sai, e as copias que ficaram sem origem vao junto. */
  if (d.fontesDoSuporte && leitura.length) {
    const r = await d.fontesDoSuporte(guild, leitura).catch(() => null);
    if (r?.apagadas) feito.push(`🗑️ ${r.apagadas} ${r.apagadas === 1 ? "cópia sem origem apagada" : "cópias sem origem apagadas"}`);
  }

  for (const f of await limparSobras(guild)) feito.push(f);
  return feito;
}

/* Ninguem conversou aqui? Mensagem minha e de sistema nao conta. Na duvida
   (nao consegui ler), a resposta e' NAO: apagar sem ler e' o erro que nao
   tem volta. */
async function semConversa(canal) {
  const msgs = await canal.messages?.fetch?.({ limit: 50 }).catch(() => null);
  if (!msgs) return false;
  return ![...msgs.values()].some((m) => !m.system && !m.author?.bot);
}

async function limparSobras(guild) {
  const { ChannelType } = d;
  const feito = [];
  const todos = [...guild.channels.cache.values()];
  const apagar = async (c, porque) => {
    if (await c.delete(porque).then(() => true).catch(() => false)) feito.push(`🧹 ${c.name} apagado`);
  };
  for (const c of todos) {
    if (c.type === ChannelType.GuildText && (SALAS_ANTIGAS.includes(c.name) || PADROES_TEXTO.includes(c.name))) {
      if (await semConversa(c)) await apagar(c, "sala que o suporte não usa mais");
      else feito.push(`⚠️ #${c.name} tem conversa: deixei, apague você se quiser`);
    }
    if (c.type === ChannelType.GuildVoice && PADROES_VOZ.includes(c.name) && !(c.members?.size)) {
      await apagar(c, "canal de voz padrão do Discord, sem uso no suporte");
    }
  }
  /* Categoria padrao so' depois: ela so' sai vazia, e vazia ela fica quando
     os canais de dentro sairam logo acima. */
  for (const c of [...guild.channels.cache.values()]) {
    if (c.type !== ChannelType.GuildCategory || !PADROES_CATEGORIA.includes(c.name)) continue;
    const dentro = [...guild.channels.cache.values()].filter((x) => x.parentId === c.id);
    if (!dentro.length) await apagar(c, "categoria padrão vazia");
  }
  return feito;
}

/* O 🌐 de cada texto: a copia na lingua de quem clicou, so' para ela. */
export async function cliqueSuporte(inter) {
  const chave = inter.customId.slice(PREFIXO_LER.length);
  if (!TEXTOS[chave]) return inter.reply({ flags: 64, content: "🤷" });
  await inter.deferReply({ flags: 64 });
  const idioma = (await d.idiomaEscolhido(inter.user.id).catch(() => "")) || d.idiomaDoAplicativo(inter.locale) || "en";
  const embed = idioma === "en" ? cartao(chave, "en") : await d.traduzirEmbed(cartao(chave, "pt"), idioma);
  return inter.editReply({ embeds: [embed] });
}
