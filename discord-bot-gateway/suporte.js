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
  /* Pelo numero primeiro: nao vence e nao depende de rede. O convite fica
     como segunda via, para quem trocar de servidor so' trocando o link. */
  const peloNumero = d.SUPORTE.guild ? d.client.guilds.cache.get(d.SUPORTE.guild) : null;
  if (peloNumero) return peloNumero;
  const link = d.SUPORTE.link;
  if (achado.link === link && achado.guild && Date.now() - achado.t < 60 * 60 * 1000) return achado.guild;
  const convite = await d.client.fetchInvite(link).catch(() => null);
  const guild = convite?.guild?.id ? d.client.guilds.cache.get(convite.guild.id) ?? null : null;
  achado = { link, guild, t: Date.now() };
  return guild;
}

/* O convite do botao 💬 Suporte vivo.

   Convite vencido e' um botao que leva a "convite invalido" -- justamente
   para quem queria ajuda ou queria pagar. Se o do ajuste morreu, o proprio
   bot cria um que nunca vence, na sala de boas-vindas, e grava no lugar.
   Devolve o link novo, ou null se o de agora ainda vale (ou nao deu). */
export async function garantirConvite(guild) {
  const vale = await d.client.fetchInvite(d.SUPORTE.link).then((c) => c?.guild?.id === guild.id).catch(() => false);
  if (vale) return null;
  const sala = guild.systemChannel ||
    guild.channels.cache.find((c) => c.type === d.ChannelType.GuildText && c.name === ESTRUTURA[0].canais[0].nome);
  if (!sala) return null;
  const novo = await sala.createInvite({ maxAge: 0, maxUses: 0, unique: false, reason: "convite do suporte venceu" })
    .catch(() => null);
  if (!novo?.code) return null;
  const link = `https://discord.gg/${novo.code}`;
  d.SUPORTE.link = link;
  if (d.porAjuste) await d.porAjuste("suporte_link", link).catch(() => {});
  return link;
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

/* Cada texto e' um cartao: uma frase de abertura e secoes curtas em campos,
   em vez de um bloco corrido. Numa sala de leitura a pessoa bate o olho e
   acha o que procura -- e campo curto traduz melhor que paragrafo longo. */
const RODAPE = {
  pt: "CYRON Support · 🌐 toque no botão para ler na sua língua",
  en: "CYRON Support · 🌐 tap the button to read in your language",
};

export const TEXTOS = {
  boas: {
    pt: {
      title: "👋 Bem-vindo ao suporte do CYRON",
      description: "O **CYRON** traduz o seu servidor do Discord: cada pessoa escreve na língua dela, e todo mundo lê na sua.",
      fields: [
        { name: "1️⃣ Escolha o seu idioma", value: "As salas aparecem na sua língua, só para você." },
        { name: "2️⃣ Leia as regras e o modo de usar", value: "📜 regras · 📖 como usar · 💳 planos" },
        { name: "3️⃣ Precisa de ajuda?", value: "Escreva no **💬 chat** do seu idioma, na sua língua. A equipe lê traduzido e responde." },
        { name: "💡 Ideias e 🐞 defeitos", value: "Abra um post no fórum de sugestões ou no de bugs." },
      ],
      footer: { text: RODAPE.pt },
    },
    en: {
      title: "👋 Welcome to CYRON Support",
      description: "**CYRON** translates your Discord server: everyone writes in their own language, and everyone reads in theirs.",
      fields: [
        { name: "1️⃣ Pick your language", value: "The rooms show up in your language, just for you." },
        { name: "2️⃣ Read the rules and how to use it", value: "📜 rules · 📖 how to use · 💳 plans" },
        { name: "3️⃣ Need help?", value: "Write in your language's **💬 chat**, in your own language. The team reads it translated and replies." },
        { name: "💡 Ideas and 🐞 defects", value: "Open a post in the suggestions or bugs forum." },
      ],
      footer: { text: RODAPE.en },
    },
  },
  regras: {
    pt: {
      title: "📜 Regras",
      description: "Poucas regras, para todo mundo se entender bem.",
      fields: [
        { name: "🤝 Respeito", value: "Sem ofensa, preconceito ou provocação." },
        { name: "🚫 Sem spam", value: "Sem propaganda de outros servidores ou bots." },
        { name: "🌐 Qualquer língua", value: "Escreva na sua. O CYRON traduz." },
        { name: "🔑 Nada de senha", value: "Nunca poste token, senha ou chave de API. A equipe **nunca** pede isso." },
        { name: "⚠️ Cuidado com golpe", value: "A equipe **nunca** cobra no privado. Pagamento é só pelo botão do bot. Se alguém pedir dinheiro no privado, avise a gente." },
        { name: "📍 Cada coisa no seu lugar", value: "Dúvida e pagamento no 💬 chat · ideia no 💡 fórum de sugestões · defeito no 🐞 fórum de bugs." },
      ],
      footer: { text: "Quem não cumprir as regras pode ser removido. · 🌐 toque no botão para ler na sua língua" },
    },
    en: {
      title: "📜 Rules",
      description: "A few rules so everyone gets along.",
      fields: [
        { name: "🤝 Respect", value: "No insults, hate or provocation." },
        { name: "🚫 No spam", value: "No advertising other servers or bots." },
        { name: "🌐 Any language", value: "Write in yours. CYRON translates." },
        { name: "🔑 No passwords", value: "Never post a token, password or API key. Staff will **never** ask for one." },
        { name: "⚠️ Watch out for scams", value: "Staff **never** charges in DMs. Payment happens only through the bot's button. If someone asks you for money in DMs, let us know." },
        { name: "📍 Everything in its place", value: "Questions and payments in 💬 chat · ideas in the 💡 suggestions forum · defects in the 🐞 bugs forum." },
      ],
      footer: { text: "Anyone who breaks the rules may be removed. · 🌐 tap the button to read in your language" },
    },
  },
  uso: {
    pt: {
      title: "📖 Como usar o CYRON",
      description: "Do zero ao servidor traduzido em três passos.",
      fields: [
        { name: "1️⃣ Instale", value: "Use o link de instalação e escolha o seu servidor. O bot cria o canal 🌐 de idiomas e um painel para a administração." },
        { name: "2️⃣ Configure com /cyron", value: "No painel, marque os canais que quer traduzir e veja o seu plano." },
        { name: "3️⃣ Cada pessoa escolhe o idioma", value: "No canal 🌐, uma vez só. Pronto." },
        { name: "💬 Traduzir uma mensagem solta", value: "Reaja com a bandeira do idioma, ou use o botão direito → Apps → Translate." },
        { name: "⭐ No Pro e na Aliança", value: "Cada idioma ganha salas próprias e um chat onde todos conversam traduzidos, com nome e foto. Também traduz 🖼️ imagem e 🎧 áudio." },
        { name: "🎁 Teste grátis", value: "No /cyron, o botão 🎁 liga 7 dias de Pro. É preciso estar neste servidor." },
      ],
      footer: { text: RODAPE.pt },
    },
    en: {
      title: "📖 How to use CYRON",
      description: "From zero to a translated server in three steps.",
      fields: [
        { name: "1️⃣ Install", value: "Use the install link and pick your server. The bot creates the 🌐 language channel and a panel for the admins." },
        { name: "2️⃣ Set it up with /cyron", value: "In the panel, mark the channels you want translated and see your plan." },
        { name: "3️⃣ Everyone picks their language", value: "In the 🌐 channel, just once. Done." },
        { name: "💬 Translate a single message", value: "React with the language's flag, or right-click → Apps → Translate." },
        { name: "⭐ On Pro and Alliance", value: "Each language gets its own rooms and a chat where everyone talks translated, with name and avatar. It also translates 🖼️ images and 🎧 audio." },
        { name: "🎁 Free trial", value: "In /cyron, the 🎁 button turns on 7 days of Pro. You need to be in this server." },
      ],
      footer: { text: RODAPE.en },
    },
  },
  pagamento: {
    pt: {
      title: "💳 Planos",
      description: "Comece de graça. Assine quando quiser mais.",
      fields: [
        { name: "🆓 Grátis", value: "Tradução por bandeira e botão de tradução, sem limite." },
        { name: "⭐ Pro · R$ 29,90 ou US$ 6 por mês", value: "Até 5 idiomas, 3 canais copiados, 🖼️ imagem e 🎧 áudio." },
        { name: "🏆 Aliança · R$ 79 ou US$ 15 por mês", value: "Até 20 idiomas, 10 canais copiados e o triplo de tradução e de áudio." },
        { name: "🇧🇷 Pagar no Brasil", value: "No /cyron, toque em 💠 Pagar com Pix. O plano liga sozinho quando o Pix cai." },
        { name: "🌍 Pagar de fora do Brasil", value: "Escreva no 💬 chat do seu idioma qual plano quer e o nome do servidor. A gente combina com você." },
      ],
      footer: { text: "A equipe nunca cobra no privado. · 🌐 toque no botão para ler na sua língua" },
    },
    en: {
      title: "💳 Plans",
      description: "Start free. Subscribe when you want more.",
      fields: [
        { name: "🆓 Free", value: "Flag translation and the translate button, unlimited." },
        { name: "⭐ Pro · US$ 6 (R$ 29.90) per month", value: "Up to 5 languages, 3 mirrored channels, 🖼️ images and 🎧 audio." },
        { name: "🏆 Alliance · US$ 15 (R$ 79) per month", value: "Up to 20 languages, 10 mirrored channels and triple the translation and audio." },
        { name: "🇧🇷 Paying in Brazil", value: "In /cyron, tap 💠 Pagar com Pix. The plan turns on by itself when the Pix lands." },
        { name: "🌍 Paying from outside Brazil", value: "Write in your language's 💬 chat which plan you want and your server's name. We'll arrange it with you." },
      ],
      footer: { text: "Staff never charges in DMs. · 🌐 tap the button to read in your language" },
    },
  },
  novidades: {
    pt: { title: "📣 Novidades", description: "Aqui saem as novidades do CYRON: recursos novos, correções e avisos importantes.\n\nToque em **Seguir** para receber no seu servidor.", footer: { text: RODAPE.pt } },
    en: { title: "📣 News", description: "CYRON news lands here: new features, fixes and important notices.\n\nTap **Follow** to get them in your own server.", footer: { text: RODAPE.en } },
  },
  sugestoes: {
    pt: { title: "💡 Sugestões", description: "Tem uma ideia para o CYRON? Abra um post, um por ideia.\n\nReaja com 👍 nas ideias que você também quer: as mais votadas vêm primeiro." },
    en: { title: "💡 Suggestions", description: "Got an idea for CYRON? Open a post, one per idea.\n\nReact 👍 on the ideas you want too: the most voted come first." },
  },
  bugs: {
    pt: { title: "🐞 Bugs", description: "Achou um defeito? Abra um post contando:\n**1.** O que você fez.\n**2.** O que esperava.\n**3.** O que aconteceu de verdade.\nUm print ajuda muito." },
    en: { title: "🐞 Bugs", description: "Found a defect? Open a post telling us:\n**1.** What you did.\n**2.** What you expected.\n**3.** What actually happened.\nA screenshot helps a lot." },
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
  /* Bugs e sugestoes sao FORUM: cada relato e' um post proprio, com
     etiqueta de andamento. Numa sala comum, dez ideias viravam uma conversa
     so', e ninguem sabia o que ja' tinha sido feito. */
  { categoria: "💬 HELP", canais: [
    { nome: "💡・suggestions", texto: "sugestoes", forum: true, reacao: "👍", etiquetas: [
      ["💭", "New · Nova"], ["📌", "Planned · Planejada"], ["✅", "Done · Feita"], ["❌", "Declined · Recusada"],
    ] },
    { nome: "🐞・bugs", texto: "bugs", forum: true, etiquetas: [
      ["🟡", "Open · Aberto"], ["🔍", "Investigating · Investigando"], ["✅", "Fixed · Resolvido"],
    ] },
  ] },
];

/* As regras do forum, no lugar onde o Discord as mostra: ao abrir um post.
   Ingles e portugues juntos, porque o Discord nao tem botao 🌐 ali. */
export function regrasDoForum(chave) {
  const t = TEXTOS[chave];
  return `${t.en.description}\n\n—\n\n${t.pt.description}`.replace(/\*\*/g, "").slice(0, 4096);
}

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

/* A ordem das copias no suporte e' a da ESTRUTURA, e nao a ordem em que as
   fontes foram cadastradas -- senao a sala que nasceu primeiro (news, de uma
   montagem antiga) ficava no topo, antes das boas-vindas. Sala que nao e'
   do suporte vai para o fim. */
export function ordemNoSuporte(nomeOriginal) {
  const i = ESTRUTURA.flatMap((b) => b.canais).findIndex((c) => c.nome === nomeOriginal);
  return i < 0 ? 999 : i;
}

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
  if (meu) {
    const antes = meu.embeds?.[0]?.toJSON?.() ?? meu.embeds?.[0] ?? meu.corpo?.embeds?.[0] ?? {};
    const agora = corpo.embeds[0];
    const igual = JSON.stringify([antes.title, antes.description, (antes.fields || []).map((f) => [f.name, f.value])]) ===
      JSON.stringify([agora.title, agora.description, (agora.fields || []).map((f) => [f.name, f.value])]);
    if (igual) return "igual";
    await meu.edit(corpo);
    return "editado";
  }
  await canal.send(corpo);
  return "postado";
}

export async function montarSuporte(guild) {
  const { ChannelType, PermissionFlagsBits: P } = d;
  const feito = [];
  const leitura = [];
  const mudaram = [];
  await guild.channels.fetch();
  const eu = d.client.user.id;

  for (const bloco of ESTRUTURA) {
    let categoria = guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name === bloco.categoria);
    if (!categoria) {
      categoria = await guild.channels.create({ name: bloco.categoria, type: ChannelType.GuildCategory });
      feito.push(`📁 ${bloco.categoria}`);
    }
    for (const c of bloco.canais) {
      if (c.forum) {
        for (const f of await garantirForum(guild, categoria, c)) feito.push(f);
        continue;
      }
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
      if (como === "editado") { feito.push(`✏️ texto novo em #${c.nome}`); mudaram.push(canal.id); }
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

  /* Texto que mudou: as copias traduzidas guardam o texto velho (a copia
     nao acompanha edicao). Elas saem, e a varredura seguinte as refaz com o
     texto novo -- a sala do suporte e' so' de leitura, nao ha' conversa ali
     para perder. */
  if (d.refazerCopias && mudaram.length) {
    const n = await d.refazerCopias(guild, mudaram).catch(() => 0);
    if (n) feito.push(`🔄 ${n} ${n === 1 ? "cópia traduzida refeita" : "cópias traduzidas refeitas"} na próxima varredura`);
  }

  for (const f of await limparSobras(guild)) feito.push(f);
  const convite = await garantirConvite(guild).catch(() => null);
  if (convite) feito.push(`🔗 o convite tinha vencido: criei um que nunca vence (${convite})`);
  return feito;
}

/* O forum de bugs ou de sugestoes.

   Forum so' existe em servidor com Comunidade ligada -- sem ela o Discord
   recusa. Ai' a sala fica como sala comum, com o texto de sempre, e o dono
   fica sabendo o que ligar. Sala comum antiga com o mesmo nome vira forum
   so' se ninguem conversou nela: o Discord nao converte, entao converter e'
   apagar e criar de novo. */
async function garantirForum(guild, categoria, c) {
  const { ChannelType } = d;
  const feito = [];
  const etiquetas = c.etiquetas.map(([emoji, name]) => ({ name, emoji: { id: null, name: emoji } }));
  let forum = guild.channels.cache.find((x) => x.type === ChannelType.GuildForum && x.name === c.nome);
  if (forum) {
    const faltam = etiquetas.filter((e) => !(forum.availableTags || []).some((t) => t.name === e.name));
    if (faltam.length) {
      await forum.setAvailableTags([...(forum.availableTags || []), ...faltam].slice(0, 20)).catch(() => {});
      feito.push(`🏷️ etiquetas em ${c.nome}`);
    }
    return feito;
  }

  const comum = guild.channels.cache.find((x) => x.type === ChannelType.GuildText && x.name === c.nome);
  if (comum && !await semConversa(comum)) {
    feito.push(`⚠️ #${c.nome} tem conversa: continua sala comum (apague você para virar fórum)`);
    return feito;
  }

  try {
    forum = await guild.channels.create({
      name: c.nome, type: ChannelType.GuildForum, parent: categoria.id,
      topic: regrasDoForum(c.texto), availableTags: etiquetas,
      ...(c.reacao ? { defaultReactionEmoji: { id: null, name: c.reacao } } : {}),
    });
  } catch (e) {
    /* Sem Comunidade: fica a sala comum. */
    if (!comum) {
      const sala = await guild.channels.create({ name: c.nome, type: ChannelType.GuildText, parent: categoria.id });
      await postarOuEditar(sala, c.texto);
      feito.push(`#${c.nome}`);
    } else {
      await postarOuEditar(comum, c.texto);
    }
    feito.push(`⚠️ ${c.nome} ficou sala comum: para virar fórum, ligue Configurações do servidor → Ativar Comunidade e aperte de novo`);
    return feito;
  }
  if (comum) await comum.delete("virou fórum").catch(() => {});
  feito.push(`🗂️ fórum ${c.nome}`);
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
