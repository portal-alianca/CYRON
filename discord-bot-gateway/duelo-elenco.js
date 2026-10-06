/* O elenco do Duelo CYRON: personagens da história e das lendas, cada um com
 * as suas habilidades e as páginas do Códex.
 *
 * Arquivo de DADOS, como o catalogo.js. Nada aqui custa nuvem: está escrito
 * uma vez e vai junto com o bot.
 *
 * O EQUILÍBRIO É DO ESPAÇO, NÃO DO PERSONAGEM. Cada personagem tem quatro
 * espaços (básica, defesa, especial, suprema), e o que uma habilidade pode
 * fazer depende só do espaço: a força é a mesma para todo mundo, e o que
 * muda é o estilo. `MOLDES` diz exatamente quais formatos cada espaço
 * aceita, e o teste reprova qualquer habilidade fora deles -- é assim que
 * ninguém escreve, sem querer, um golpe de 60 para o personagem favorito.
 *
 * Cada espaço tem a habilidade inicial e UMA alternativa, liberada num nível
 * (defesa no 2, básica no 4, especial no 6, suprema no 8). A alternativa é
 * diferente, nunca mais forte: o nível 10 tem mais escolhas, não mais poder.
 *
 * Personagens: domínio público -- figuras históricas e lendas. Nada de
 * personagem de obra com dono, e ninguém que ofenda (ditadores, genocidas,
 * figuras religiosas). */

/* O que cada espaço custa e quando libera. */
export const ESPACOS = {
  basica: { energia: 0, nivelAlternativa: 4 },
  defesa: { energia: 25, nivelAlternativa: 2 },
  especial: { energia: 40, nivelAlternativa: 6 },
  suprema: { energia: 80, nivelAlternativa: 8, aPartirDoTurno: 3 },
};

/* Os formatos permitidos em cada espaço: [dano, efeito]. */
export const MOLDES = {
  basica: [[10, null], [7, "energia"], [7, "perfurar"], [7, "drenar"]],
  defesa: [[0, "escudo"], [0, "esquiva"], [0, "cura"], [0, "preparar"]],
  especial: [[28, null], [18, "queimar"], [18, "atordoar"], [18, "confundir"], [18, "perfurar"], [18, "drenar"], [18, "preparar"]],
  suprema: [[50, null], [38, "atordoar"], [38, "perfurar"], [38, "drenar"], [38, "cura"], [38, "queimar"]],
};

/* O que cada efeito faz, em números. */
export const EFEITOS = {
  escudo: { valor: 20, texto: "escudo de 20" },
  esquiva: { texto: "esquiva o próximo golpe" },
  cura: { valor: 15, texto: "cura 15" },
  energia: { valor: 10, texto: "+10 de energia" },
  atordoar: { texto: "o outro perde a vez" },
  queimar: { valor: 8, turnos: 2, texto: "queima 8 por 2 turnos" },
  perfurar: { texto: "ignora o escudo" },
  drenar: { texto: "cura metade do dano causado" },
  preparar: { texto: "o próximo golpe causa +50%" },
  confundir: { texto: "o próximo golpe do outro tem 50% de chance de errar" },
};

/* Níveis do personagem: XP total para chegar em cada um (1 a 10). */
export const NIVEIS_DO_PERSONAGEM = [0, 60, 150, 270, 420, 600, 810, 1050, 1320, 1620];

const h = (emoji, nome, dano, efeito = null) => ({ emoji, nome, dano, efeito });

export const PERSONAGENS = [
  {
    id: "alexandre", nome: "Alexandre, o Grande", bandeira: "🇬🇷", titulo: "O Conquistador",
    epoca: "Macedônia, 331 a.C.", frase: "O rei que nunca perdeu uma batalha.",
    kit: {
      basica: [h("🗡️", "Golpe de Xiphos", 10), h("🏹", "Dardo Macedônio", 7, "perfurar")],
      defesa: [h("🛡️", "Falange Macedônica", 0, "escudo"), h("📐", "Lição de Aristóteles", 0, "preparar")],
      especial: [h("🐎", "Carga de Bucéfalo", 18, "preparar"), h("⚔️", "Martelo e Bigorna", 28)],
      suprema: [h("✂️", "Corte do Nó Górdio", 38, "perfurar"), h("🌅", "Glória de Gaugamela", 38, "atordoar")],
    },
    fatos: [
      "Alexandre foi aluno de Aristóteles, um dos maiores filósofos da história.",
      "Ainda menino, domou o cavalo Bucéfalo ao perceber que o animal tinha medo da própria sombra: virou o cavalo de frente para o sol.",
      "Em mais de dez anos de campanhas, Alexandre nunca perdeu uma batalha.",
      "Virou rei aos 20 anos, depois que seu pai, Filipe II, foi assassinado.",
      "Fundou mais de vinte cidades chamadas Alexandria. A do Egito é até hoje uma das maiores cidades do país.",
      "Segundo a lenda, em 333 a.C. ele \"resolveu\" o Nó Górdio cortando-o com a espada em vez de desatá-lo.",
      "Em Gaugamela (331 a.C.) venceu o rei persa Dario III com um exército bem menor.",
      "Seu império ia da Grécia até o atual Paquistão.",
      "Quando Bucéfalo morreu, Alexandre fundou uma cidade com o nome do cavalo: Bucéfala.",
      "Morreu na Babilônia em 323 a.C., com apenas 32 anos.",
    ],
  },
  {
    id: "napoleao", nome: "Napoleão Bonaparte", bandeira: "🇫🇷", titulo: "O Estrategista",
    epoca: "Austerlitz, 1805", frase: "O imperador que redesenhou o mapa da Europa.",
    kit: {
      basica: [h("⚔️", "Sabre de Cavalaria", 10), h("📯", "Toque de Corneta", 7, "energia")],
      defesa: [h("🎖️", "Guarda Imperial", 0, "escudo"), h("🗺️", "Mapa de Campanha", 0, "preparar")],
      especial: [h("💥", "Artilharia de Austerlitz", 18, "queimar"), h("🐎", "Carga dos Couraceiros", 18, "perfurar")],
      suprema: [h("🦅", "O Sol de Austerlitz", 38, "atordoar"), h("👑", "A Coroa nas Próprias Mãos", 50)],
    },
    fatos: [
      "Napoleão não era baixo: tinha cerca de 1,69 m, a altura média da época. O \"baixinho\" foi propaganda inglesa.",
      "Nasceu na Córsega em 1769, um ano depois de a ilha passar a ser francesa.",
      "Austerlitz (1805) ficou conhecida como a \"Batalha dos Três Imperadores\".",
      "O Código Napoleônico, de 1804, influenciou as leis civis de muitos países, inclusive o Brasil.",
      "Na própria coroação, em 1804, Napoleão pegou a coroa e a colocou na própria cabeça.",
      "Por causa da invasão napoleônica de Portugal, a família real portuguesa fugiu para o Brasil em 1808.",
      "A invasão da Rússia, em 1812, começou com mais de 600 mil soldados. Poucos voltaram.",
      "Fugiu do exílio na ilha de Elba em 1815 e voltou ao poder por cerca de cem dias.",
      "Foi derrotado de vez em Waterloo, na atual Bélgica, em 1815.",
      "Morreu em 1821, exilado na ilha de Santa Helena, no meio do Atlântico.",
    ],
  },
  {
    id: "cleopatra", nome: "Cleópatra", bandeira: "🇪🇬", titulo: "A Rainha do Nilo",
    epoca: "Alexandria, 48 a.C.", frase: "A última faraó, mais esperta que dois impérios.",
    kit: {
      basica: [h("🐍", "Bote da Áspide", 10), h("🍷", "Taça Envenenada", 7, "drenar")],
      defesa: [h("💎", "Tesouro do Nilo", 0, "cura"), h("🏺", "Escondida no Tapete", 0, "esquiva")],
      especial: [h("🗣️", "Diplomacia em Nove Línguas", 18, "confundir"), h("⛵", "Frota de Áccio", 18, "queimar")],
      suprema: [h("👑", "Decreto da Faraó", 38, "drenar"), h("☀️", "Bênção de Rá", 38, "cura")],
    },
    fatos: [
      "Cleópatra falava cerca de nove línguas.",
      "Viveu mais perto da invenção do iPhone do que da construção da Grande Pirâmide de Gizé.",
      "Sua família era de origem grega macedônia, e ela foi a primeira da dinastia a aprender a língua egípcia.",
      "Subiu ao trono por volta dos 18 anos, dividindo o poder com o irmão Ptolomeu XIII.",
      "Segundo Plutarco, entrou escondida no palácio de Júlio César, enrolada num tecido.",
      "Teve um filho com Júlio César: Ptolomeu César, apelidado de Cesarião.",
      "Foi aliada e companheira do general romano Marco Antônio.",
      "Ela e Marco Antônio perderam a Batalha de Áccio, em 31 a.C., para Otaviano.",
      "Foi a última governante do Egito antes de ele virar uma província romana.",
      "A tradição conta que morreu picada por uma áspide, mas os historiadores ainda discutem como foi.",
    ],
  },
  {
    id: "musashi", nome: "Miyamoto Musashi", bandeira: "🇯🇵", titulo: "O Espadachim Invicto",
    epoca: "Ilha Ganryū, 1612", frase: "Sessenta e um duelos. Sessenta e uma vitórias.",
    kit: {
      basica: [h("🗡️", "Corte Duplo", 10), h("⚡", "Corte Rápido", 7, "energia")],
      defesa: [h("🌊", "Passo da Água", 0, "esquiva"), h("🗻", "Postura Imóvel", 0, "escudo")],
      especial: [h("🪵", "Espada de Remo", 28), h("⏳", "Atraso Proposital", 18, "confundir")],
      suprema: [h("💍", "O Livro dos Cinco Anéis", 50), h("🏝️", "Duelo em Ganryū", 38, "perfurar")],
    },
    fatos: [
      "Segundo ele mesmo, Musashi venceu 61 duelos e nunca perdeu.",
      "Lutou seu primeiro duelo aos 13 anos.",
      "No duelo contra Sasaki Kojirō, em 1612, chegou atrasado de propósito e venceu com uma espada de madeira esculpida de um remo.",
      "Criou o estilo Niten Ichi-ryū, de lutar com duas espadas ao mesmo tempo.",
      "Escreveu \"O Livro dos Cinco Anéis\", sobre estratégia, pouco antes de morrer.",
      "Também era pintor e calígrafo. Obras dele estão hoje em museus do Japão.",
      "Passou os últimos anos numa caverna, a Reigandō, onde escreveu o seu livro.",
      "Dias antes de morrer, escreveu \"O Caminho da Solidão\", com 21 regras de vida.",
      "Segundo a tradição, ainda jovem lutou na Batalha de Sekigahara, em 1600.",
      "\"O Livro dos Cinco Anéis\" é lido até hoje por atletas e empresários do mundo todo.",
    ],
  },
  {
    id: "joana", nome: "Joana d'Arc", bandeira: "🇫🇷", titulo: "A Donzela de Orléans",
    epoca: "Orléans, 1429", frase: "Aos 17 anos, comandou um exército.",
    kit: {
      basica: [h("⚔️", "Golpe de Espada", 10), h("🏹", "Flecha no Ombro", 7, "drenar")],
      defesa: [h("🚩", "Estandarte de Orléans", 0, "escudo"), h("🕯️", "Coragem Inabalável", 0, "cura")],
      especial: [h("🔥", "Rompendo o Cerco", 18, "preparar"), h("🏰", "Assalto às Muralhas", 28)],
      suprema: [h("🏰", "A Libertação de Orléans", 38, "cura"), h("👑", "Coroação em Reims", 38, "atordoar")],
    },
    fatos: [
      "Aos 17 anos, Joana liderou o fim do cerco de Orléans, em 1429.",
      "Tinha apenas 19 anos quando morreu, em 1431.",
      "Era filha de camponeses do vilarejo de Domrémy.",
      "Não sabia ler nem escrever: ditava as suas cartas.",
      "Em Orléans, foi atingida por uma flecha no ombro e voltou à luta no mesmo dia.",
      "Ajudou a levar Carlos VII para ser coroado rei em Reims, em 1429.",
      "Foi capturada pelos borgonheses e entregue aos ingleses.",
      "Usava roupas masculinas e cabelo curto, e isso foi usado contra ela no julgamento.",
      "Seu julgamento foi anulado em 1456, 25 anos depois da sua morte.",
      "A \"Guerra dos Cem Anos\", em que ela lutou, na verdade durou 116 anos (1337–1453).",
    ],
  },
  {
    id: "gengis", nome: "Gengis Khan", bandeira: "🇲🇳", titulo: "O Senhor das Estepes",
    epoca: "Mongólia, 1206", frase: "Do nada, o maior império contínuo da história.",
    kit: {
      basica: [h("🏹", "Flecha a Galope", 10), h("🐎", "Arqueiro Montado", 7, "perfurar")],
      defesa: [h("🐎", "Mensageiro do Yam", 0, "esquiva"), h("⛺", "Acampamento da Horda", 0, "cura")],
      especial: [h("🌪️", "Horda das Estepes", 18, "queimar"), h("🔟", "Os Dez Mil", 18, "atordoar")],
      suprema: [h("🌍", "O Império Sem Fim", 38, "drenar"), h("📜", "A Lei da Yassa", 38, "queimar")],
    },
    fatos: [
      "O nome de nascimento de Gengis Khan era Temüjin.",
      "Foi proclamado \"Gengis Khan\", o governante universal, em 1206.",
      "O Império Mongol foi o maior império contínuo da história.",
      "O Yam, rede de mensageiros a cavalo com estações de troca, era um \"correio expresso\" de 800 anos atrás.",
      "Seu exército era dividido em grupos de 10, 100, 1.000 e 10.000 soldados.",
      "Os arqueiros mongóis atiravam com precisão em pleno galope.",
      "Criou um código de leis para o império chamado Yassa.",
      "O império garantia liberdade religiosa a quem vivia nele.",
      "Até hoje ninguém encontrou o túmulo de Gengis Khan.",
      "Um estudo genético de 2003 sugeriu que milhões de homens hoje podem descender dele.",
    ],
  },
  {
    id: "leonidas", nome: "Leônidas", bandeira: "🇬🇷", titulo: "O Rei de Esparta",
    epoca: "Termópilas, 480 a.C.", frase: "\"Venham buscá-las.\"",
    kit: {
      basica: [h("🛡️", "Golpe de Escudo", 10), h("🔱", "Estocada de Lança", 7, "perfurar")],
      defesa: [h("🏛️", "Muralha de Escudos", 0, "escudo"), h("💇", "Pentear antes da Batalha", 0, "preparar")],
      especial: [h("🔱", "Lança Espartana", 18, "perfurar"), h("⛰️", "O Desfiladeiro", 18, "atordoar")],
      suprema: [h("⚡", "Molon Labe", 38, "atordoar"), h("🛡️", "Volte com o Escudo", 50)],
    },
    fatos: [
      "Nas Termópilas não eram só 300: havia cerca de 7.000 gregos no começo. Os 300 eram os espartanos.",
      "Quando os persas mandaram entregar as armas, Leônidas respondeu: \"Molon labe\", \"venham buscá-las\".",
      "\"Termópilas\" quer dizer \"portões quentes\", por causa das fontes termais do lugar.",
      "A batalha durou três dias.",
      "Os persas só passaram depois que um grego, Efialtes, mostrou a eles um caminho pela montanha.",
      "Segundo Heródoto, os espartanos penteavam o cabelo antes da batalha.",
      "Os espartanos começavam o treinamento militar aos 7 anos.",
      "No último dia ficaram cerca de 300 espartanos, 700 téspios e 400 tebanos.",
      "Pela tradição, Leônidas descendia do herói Héracles (o Hércules dos romanos).",
      "No ano seguinte, em Plateias (479 a.C.), os gregos venceram os persas.",
    ],
  },
  {
    id: "anibal", nome: "Aníbal Barca", bandeira: "🇹🇳", titulo: "O General de Cartago",
    epoca: "Alpes, 218 a.C.", frase: "Atravessou montanhas com elefantes.",
    kit: {
      basica: [h("⚔️", "Falcata Ibérica", 10), h("🪨", "Funda Balear", 7, "perfurar")],
      defesa: [h("🏔️", "Travessia dos Alpes", 0, "esquiva"), h("🛤️", "Acharemos um Caminho", 0, "preparar")],
      especial: [h("🐘", "Carga dos Elefantes", 28), h("🔥", "Bois com Tochas", 18, "confundir")],
      suprema: [h("🦀", "A Pinça de Canas", 38, "atordoar"), h("🐘", "Os Elefantes de Cartago", 50)],
    },
    fatos: [
      "Em 218 a.C., Aníbal atravessou os Alpes com um exército e 37 elefantes de guerra.",
      "A tática dele em Canas (216 a.C.), cercar o inimigo pelos dois lados, ainda é estudada em escolas militares.",
      "Ainda criança, jurou ao pai que seria inimigo de Roma para sempre.",
      "Passou cerca de 15 anos na Itália sem perder uma grande batalha.",
      "Perdeu a visão de um olho por uma infecção ao atravessar pântanos.",
      "Para escapar de uma armadilha, prendeu tochas nos chifres de bois e soltou-os de noite, enganando os romanos.",
      "Cartago ficava onde hoje é Túnis, capital da Tunísia.",
      "Foi derrotado em Zama, em 202 a.C., pelo general romano Cipião Africano.",
      "Depois da guerra, virou magistrado em Cartago e fez reformas no governo.",
      "A ele se atribui a frase \"Acharemos um caminho, ou faremos um\".",
    ],
  },
  {
    id: "zumbi", nome: "Zumbi dos Palmares", bandeira: "🇧🇷", titulo: "O Guerreiro da Liberdade",
    epoca: "Serra da Barriga, 1690", frase: "O último líder de Palmares.",
    kit: {
      basica: [h("👊", "Golpe de Ginga", 10), h("🦶", "Meia-Lua", 7, "energia")],
      defesa: [h("🌳", "Paliçada de Palmares", 0, "escudo"), h("🌿", "Ervas da Mata", 0, "cura")],
      especial: [h("🌀", "Rasteira da Serra", 18, "confundir"), h("🏹", "Emboscada na Mata", 18, "atordoar")],
      suprema: [h("✊", "Liberdade de Palmares", 38, "cura"), h("⛰️", "A Serra da Barriga", 38, "atordoar")],
    },
    fatos: [
      "O Quilombo dos Palmares resistiu por quase 100 anos.",
      "O dia da morte de Zumbi, 20 de novembro, é o Dia da Consciência Negra, feriado nacional no Brasil.",
      "Palmares ficava na Serra da Barriga, onde hoje é o estado de Alagoas.",
      "Palmares chegou a reunir milhares de pessoas. Algumas estimativas falam em até 20 mil.",
      "Palmares não era uma aldeia só: era formado por vários povoados, os mocambos.",
      "Segundo a tradição, Zumbi nasceu livre em Palmares, foi capturado ainda bebê e voltou ao quilombo aos 15 anos.",
      "Zumbi assumiu a liderança depois de recusar um acordo de paz que não libertava todos.",
      "Antes de Zumbi, o líder de Palmares era Ganga Zumba.",
      "A Serra da Barriga é hoje o Parque Memorial Quilombo dos Palmares.",
      "Zumbi foi morto em 20 de novembro de 1695.",
    ],
  },
  {
    id: "suntzu", nome: "Sun Tzu", bandeira: "🇨🇳", titulo: "O Mestre da Estratégia",
    epoca: "China, séc. V a.C.", frase: "Vencer sem lutar é a arte suprema.",
    kit: {
      basica: [h("🎋", "Golpe de Bambu", 10), h("🕵️", "Rede de Espiões", 7, "energia")],
      defesa: [h("📜", "Conhece a Ti Mesmo", 0, "cura"), h("🌫️", "Parecer Fraco", 0, "esquiva")],
      especial: [h("🧠", "Ataque Onde Não Esperam", 18, "confundir"), h("🔥", "O Ataque de Fogo", 18, "queimar")],
      suprema: [h("☯️", "A Arte da Guerra", 38, "atordoar"), h("🌊", "Como a Água", 38, "drenar")],
    },
    fatos: [
      "\"A Arte da Guerra\" tem cerca de 2.500 anos e ainda é lida por generais, técnicos e empresários.",
      "O livro tem 13 capítulos.",
      "\"Conheça o inimigo e conheça a si mesmo, e não temerá o resultado de cem batalhas.\"",
      "Para Sun Tzu, a maior vitória é vencer sem precisar lutar.",
      "O último capítulo do livro é inteiro sobre espiões.",
      "Um capítulo inteiro fala do ataque com fogo.",
      "Em 1972 foi encontrada uma cópia antiga do livro escrita em tiras de bambu.",
      "A primeira tradução para uma língua europeia foi feita por um padre francês, em 1772.",
      "Alguns historiadores acham que o livro foi escrito por mais de uma pessoa ao longo do tempo.",
      "\"A Arte da Guerra\" é estudada até hoje em escolas de administração do mundo todo.",
    ],
  },
  {
    id: "ragnar", nome: "Ragnar Lodbrok", bandeira: "🇳🇴", titulo: "O Rei Viking",
    epoca: "Mar do Norte, séc. IX", frase: "Lenda das sagas nórdicas.",
    kit: {
      basica: [h("🪓", "Machado Viking", 10), h("🗡️", "Saque Rápido", 7, "drenar")],
      defesa: [h("🛶", "Escudo de Drakkar", 0, "escudo"), h("🐍", "Calças Peludas", 0, "esquiva")],
      especial: [h("🐻", "Fúria Berserker", 18, "preparar"), h("🌊", "Ataque pelo Rio", 28)],
      suprema: [h("⚡", "Saga de Ragnar", 38, "drenar"), h("🏰", "O Cerco de Paris", 38, "queimar")],
    },
    fatos: [
      "Os historiadores ainda discutem se Ragnar existiu, ou se é a mistura de vários vikings das sagas.",
      "\"Lodbrok\" quer dizer \"calças peludas\": a saga conta que ele as usou para lutar contra uma serpente.",
      "Ele é ligado ao ataque viking a Paris em 845.",
      "A lenda diz que ele morreu num poço de cobras, por ordem do rei Ælla, da Nortúmbria.",
      "Segundo as sagas, seus filhos incluíam Ivar, o Sem-Ossos, e Bjorn, o Costas de Ferro.",
      "O Grande Exército Pagão que invadiu a Inglaterra em 865 teria vindo vingar a sua morte.",
      "Os navios vikings, rasos, conseguiam subir rios e atacar cidades longe do mar.",
      "Os vikings de verdade não usavam capacete com chifres: isso veio de figurinos do século XIX.",
      "A história dele está na \"Saga de Ragnar Lodbrok\", escrita no século XIII.",
      "Os vikings chegaram à América do Norte por volta do ano 1000, quase 500 anos antes de Colombo.",
    ],
  },
  {
    id: "tesla", nome: "Nikola Tesla", bandeira: "🇷🇸", titulo: "O Mago da Eletricidade",
    epoca: "Colorado Springs, 1899", frase: "O homem que iluminou o mundo.",
    kit: {
      basica: [h("⚡", "Faísca", 10), h("🔋", "Recarga", 7, "energia")],
      defesa: [h("🧲", "Campo Magnético", 0, "esquiva"), h("🔌", "Aterramento", 0, "escudo")],
      especial: [h("🌩️", "Bobina de Tesla", 18, "atordoar"), h("📡", "Barco por Rádio", 18, "confundir")],
      suprema: [h("💡", "Corrente Alternada", 50), h("🌩️", "Raio de Colorado", 38, "queimar")],
    },
    fatos: [
      "A unidade de campo magnético se chama \"tesla\" em homenagem a ele.",
      "A corrente alternada que chega na sua tomada nasceu das ideias dele.",
      "Segundo a família, nasceu durante uma tempestade de raios, em 1856.",
      "Teve cerca de 300 patentes em vários países.",
      "Trabalhou para Thomas Edison antes de os dois virarem rivais.",
      "A usina das Cataratas do Niágara, de 1895, usou o sistema de corrente alternada dele.",
      "Em 1898 mostrou ao público um barquinho controlado por rádio, um dos primeiros controles remotos.",
      "Em Colorado Springs, seu laboratório produzia raios artificiais de vários metros.",
      "A bobina de Tesla, inventada por ele, ainda é usada em demonstrações de ciência.",
      "Morreu em 1943, num quarto de hotel em Nova York, com pouco dinheiro.",
    ],
  },
];

/* Confere o elenco inteiro contra os moldes. Devolve a lista de problemas
   (vazia = tudo certo). O teste e o bot usam a mesma conferência. */
export function problemasDoElenco(lista = PERSONAGENS) {
  const erros = [];
  const ids = new Set();
  for (const p of lista) {
    if (ids.has(p.id)) erros.push(`${p.id}: id repetido`);
    ids.add(p.id);
    for (const espaco of Object.keys(ESPACOS)) {
      const opcoes = p.kit?.[espaco];
      if (!Array.isArray(opcoes) || opcoes.length !== 2) { erros.push(`${p.id}.${espaco}: precisa de 2 habilidades`); continue; }
      for (const hab of opcoes) {
        const ok = MOLDES[espaco].some(([d, e]) => d === hab.dano && e === hab.efeito);
        if (!ok) erros.push(`${p.id}.${espaco}: "${hab.nome}" (${hab.dano}, ${hab.efeito}) fora do molde`);
        if (hab.efeito && !EFEITOS[hab.efeito]) erros.push(`${p.id}.${espaco}: efeito desconhecido ${hab.efeito}`);
      }
    }
    if (!Array.isArray(p.fatos) || p.fatos.length !== 10) erros.push(`${p.id}: precisa de 10 fatos`);
  }
  return erros;
}
