/* A casca de Discord das páginas de dentro.

   Cada página (passos, recursos, painel, termos, privacidade) continua com o
   próprio conteúdo e o próprio script; este arquivo só monta em volta dela a
   mesma barra de servidores, a mesma lateral de canais e o mesmo topo da
   página inicial. Um lugar só para a lista de canais: mudar um canal aqui
   muda nas cinco páginas.

   Os botões PT/EN e o usuário do painel são MOVIDOS do topo antigo para o
   novo, e não recriados: mover um elemento mantém os cliques que o script
   da página já ligou nele. */
(function () {
  var raiz = document.documentElement;
  var pagina = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "");

  var NOMES = {
    passos: ["primeiros-passos", "get-started"],
    recursos: ["tudo-que-ela-faz", "everything-it-does"],
    painel: ["meus-servidores", "my-servers"],
    termos: ["termos-de-uso", "terms-of-use"],
    privacidade: ["privacidade", "privacy"],
  };
  var CONVITE = "https://discord.com/oauth2/authorize?client_id=1498142929041096856" +
    "&permissions=327223209040&scope=bot%20applications.commands";

  function duas(pt, en) { return '<span data-pt>' + pt + '</span><span data-en>' + en + "</span>"; }
  function esc(t) { return String(t || "").replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function canal(href, pt, en, fora, chave) {
    return '<a class="canal' + (fora ? " fora" : "") + (chave === pagina ? " ativo" : "") + '" href="' + href + '">' +
      duas(pt, en) + "</a>";
  }

  function montar() {
    var antigo = document.querySelector("header.barra");
    var idioma = antigo && antigo.querySelector(".idioma");
    var eu = document.getElementById("eu");
    var nome = NOMES[pagina] || [pagina, pagina];

    var app = document.createElement("div");
    app.className = "app";
    app.innerHTML =
      '<div class="veu" hidden></div>' +
      '<nav class="servidores" aria-label="Servidores">' +
        '<a href="./" title="CYRON"><img src="./img/cyron.png" alt="CYRON" width="48" height="48"></a>' +
        "<hr>" +
        '<div id="meus" hidden></div>' +
        '<a class="outro" href="' + CONVITE + '" title="Adicionar ao Discord / Add to Discord">+</a>' +
      "</nav>" +
      '<aside class="lateral">' +
        '<img class="banner" src="./img/banner.jpg" alt="" width="240" height="85">' +
        "<header>CYRON</header>" +
        '<nav class="canais" aria-label="Canais / Channels">' +
          '<div class="categoria">' + duas("Comece aqui", "Start here") + "</div>" +
          canal("./#boas-vindas", "boas-vindas", "welcome") +
          canal("./#funciona", "como-funciona", "how-it-works") +
          canal("./#recursos", "o-que-ela-faz", "what-it-does") +
          '<div class="categoria">' + duas("Para o dono", "For owners") + "</div>" +
          canal("./#planos", "planos", "pricing") +
          canal("./#perguntas", "perguntas", "questions") +
          '<div class="categoria">' + duas("Links", "Links") + "</div>" +
          canal("./passos.html", "primeiros-passos", "get-started", true, "passos") +
          canal("./recursos.html", "tudo-que-ela-faz", "everything-it-does", true, "recursos") +
          canal("./painel.html", "meus-servidores", "my-servers", true, "painel") +
          canal("https://discord.gg/yDwePceB38", "suporte", "support", true) +
          '<div class="categoria">' + duas("Regras", "Rules") + "</div>" +
          canal("./termos.html", "termos-de-uso", "terms-of-use", false, "termos") +
          canal("./privacidade.html", "privacidade", "privacy", false, "privacidade") +
        "</nav>" +
        '<div class="voce"><a class="quem" id="quem" href="./painel.html?entrar=1" hidden></a>' +
          '<small id="rotulo-conta">' + duas("Você não entrou", "Not signed in") + "</small></div>" +
      "</aside>" +
      /* div, e não <main>: as páginas têm regras próprias para "main" (margem,
         largura) que, pegando aqui, empurravam a casca inteira. */
      '<div class="conversa" role="main">' +
        '<div class="topo-canal">' +
          '<button type="button" class="menu-bt" aria-label="Menu" aria-expanded="false">☰</button>' +
          '<span class="hash">↗</span><span class="titulo">' + duas(nome[0], nome[1]) + "</span>" +
        "</div>" +
      "</div>";

    var conversa = app.querySelector(".conversa");
    var topo = app.querySelector(".topo-canal");
    if (idioma) topo.appendChild(idioma);
    if (eu) topo.appendChild(eu);
    if (pagina !== "painel") {
      var entrar = document.createElement("a");
      entrar.className = "entrar";
      entrar.id = "entrar";
      entrar.href = "./painel.html?entrar=1";
      entrar.innerHTML = duas("Entrar", "Sign in");
      topo.appendChild(entrar);
    }
    if (antigo) antigo.remove();

    /* Tudo o que a página tinha vai para dentro da conversa, na ordem. */
    while (document.body.firstChild) conversa.appendChild(document.body.firstChild);
    document.body.appendChild(app);

    /* ---- gaveta do celular ---- */
    var botao = topo.querySelector(".menu-bt");
    var veu = app.querySelector(".veu");
    function gaveta(aberta) {
      raiz.classList.toggle("gaveta", aberta);
      veu.hidden = !aberta;
      botao.setAttribute("aria-expanded", String(aberta));
    }
    botao.addEventListener("click", function () { gaveta(!raiz.classList.contains("gaveta")); });
    veu.addEventListener("click", function () { gaveta(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") gaveta(false); });
    [].forEach.call(app.querySelectorAll(".lateral a, .servidores a"), function (a) {
      a.addEventListener("click", function () { gaveta(false); });
    });

    /* ---- quem já entrou (o painel guarda isto; ver painel.html) ---- */
    var conta = null;
    try { conta = JSON.parse(localStorage.getItem("cyron-conta") || "null"); } catch (e) { /* modo privado */ }
    if (!conta || !conta.quando || Date.now() - conta.quando > 30 * 864e5) return;
    var doDiscord = function (u) { return /^https:\/\/cdn\.discordapp\.com\//.test(u || ""); };
    var meus = (conta.servidores || []).filter(function (s) { return s.instalado; }).slice(0, 12);
    if (meus.length) {
      var caixa = app.querySelector("#meus");
      caixa.innerHTML = meus.map(function (s) {
        return '<a class="meu' + (pagina === "painel" && location.hash === "#g=" + s.id ? " ativo" : "") + '" href="./painel.html' + (s.id ? "#g=" + esc(s.id) : "") + '" title="' + esc(s.nome) + '">' +
          (doDiscord(s.icone) ? '<img src="' + esc(s.icone) + '" alt="' + esc(s.nome) + '" width="48" height="48">'
            : esc(String(s.nome || "?").trim().slice(0, 2))) + "</a>";
      }).join("") + "<hr>";
      caixa.hidden = false;
      caixa.style.display = "contents";
      /* No painel, o servidor aberto fica marcado na barra, como no Discord. */
      window.addEventListener("hashchange", function () {
        [].forEach.call(caixa.querySelectorAll(".meu"), function (m) {
          m.classList.toggle("ativo", pagina === "painel" && m.getAttribute("href") === "./painel.html" + location.hash);
        });
      });
    }
    if (conta.nome) {
      var foto = doDiscord(conta.avatar) ? '<img src="' + esc(conta.avatar) + '" alt="">' : "";
      var quem = app.querySelector("#quem");
      quem.innerHTML = foto + "<span>" + esc(conta.nome) + "</span>";
      quem.hidden = false;
      app.querySelector("#rotulo-conta").hidden = true;
      var b = app.querySelector("#entrar");
      quem.href = "./painel.html";
      if (b) { b.innerHTML = foto + "<span>" + esc(conta.nome) + "</span>"; b.title = "Meus servidores / My servers"; b.href = "./painel.html"; }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar);
  else montar();
})();
