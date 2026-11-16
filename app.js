/* ============================================================
   LAYON'S PIZZARIA — renderização, busca e navegação
   ============================================================ */

(function () {
  "use strict";

  const B = MENU.brand;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const brl = (v) =>
    "R$ " + Number(v).toFixed(2).replace(".", ",");

  const normalize = (s) =>
    String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  /* ------------------------------------------------------------
     Ícones
     ------------------------------------------------------------ */
  const ICONS = {
    bottle:
      '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M10 2h4v3.2c0 .9.4 1.7 1 2.3l1.2 1.4c.6.7 1 1.6 1 2.5V19a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-7.6c0-.9.4-1.8 1-2.5L8.2 7.5c.6-.6 1-1.4 1-2.3V2Z"/><path d="M6.4 13h11.2"/></svg>',
    drop:
      '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3s6 6.4 6 11a6 6 0 1 1-12 0c0-4.6 6-11 6-11Z"/></svg>',
    juice:
      '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6 5h12l-1.3 14.2A2 2 0 0 1 14.7 21H9.3a2 2 0 0 1-2-1.8L6 5Z"/><path d="M7.5 11h9"/></svg>',
    bolt:
      '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>',
    mug:
      '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M5 4h10v13a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V4Z"/><path d="M15 7h2.5a3 3 0 0 1 0 6H15"/><path d="M5 9h10"/></svg>',
  };

  const DRINK_ICON = {
    "refri-2l": "bottle",
    "refri-1l": "bottle",
    "refri-lata": "bottle",
    agua: "drop",
    sucos: "juice",
    energeticos: "bolt",
    cervejas: "mug",
  };

  /* ------------------------------------------------------------
     Faixa de preços
     ------------------------------------------------------------ */
  function pricesHTML(prices, small) {
    return (
      '<div class="prices' +
      (small ? " prices--sm" : "") +
      '">' +
      MENU.sizes
        .map(
          (s) =>
            '<span class="price" title="' +
            esc(s.label) +
            '"><i>' +
            s.key +
            "</i><b>" +
            brl(prices[s.key]) +
            "</b></span>"
        )
        .join("") +
      "</div>"
    );
  }

  /* ------------------------------------------------------------
     Cabeçalho de seção
     ------------------------------------------------------------ */
  function headHTML(cat, count) {
    return (
      '<header class="sec-head">' +
      '<div class="sec-title">' +
      '<span class="sec-eyebrow">' +
      esc(cat.eyebrow || "") +
      "</span>" +
      "<h2>" +
      esc(cat.title) +
      (count
        ? '<span class="sec-count">' + count + " sabores</span>"
        : "") +
      "</h2>" +
      "</div>" +
      pricesHTML(cat.prices) +
      "</header>"
    );
  }

  /* ------------------------------------------------------------
     Seções de pizza / calzone
     ------------------------------------------------------------ */
  function flavorHTML(f) {
    const num = f.n || "";
    return (
      '<article class="flavor" data-search="' +
      esc(normalize((num ? num + " " : "") + f.name + " " + f.desc)) +
      '">' +
      (num ? '<span class="num">' + esc(num) + "</span>" : "") +
      "<div><h3>" +
      esc(f.name) +
      "</h3><p>" +
      esc(f.desc) +
      "</p></div></article>"
    );
  }

  function menuSection(cat, opts) {
    opts = opts || {};
    const flavors = cat.flavors || [];
    let inner = headHTML(cat, flavors.length);

    if (flavors.length) {
      inner += '<div class="grid">' + flavors.map(flavorHTML).join("") + "</div>";
    }

    if (cat.comingSoon) {
      inner +=
        '<div class="grid"><div class="coming-soon" data-search="' +
        esc(normalize(cat.comingSoon.title + " " + cat.comingSoon.text)) +
        '">' +
        '<div class="cs-star">★</div>' +
        "<h3>" +
        esc(cat.comingSoon.title) +
        "</h3><p>" +
        esc(cat.comingSoon.text) +
        '</p><a href="' +
        B.whatsappUrl +
        '" target="_blank" rel="noopener">Perguntar pelos sabores →</a></div></div>';
    }

    return (
      '<section class="sec" id="' +
      cat.id +
      '"' +
      (opts.pageBreak ? ' data-break="page"' : "") +
      '><div class="container">' +
      inner +
      "</div></section>"
    );
  }

  /* ------------------------------------------------------------
     Combo
     ------------------------------------------------------------ */
  function comboHTML() {
    const c = MENU.combo;
    return (
      '<section class="sec sec--combo" id="combos"><div class="container">' +
      '<div class="combo-card" data-search="' +
      esc(
        normalize(
          c.title +
            " combo " +
            c.includes.map((i) => i.name + " " + i.note).join(" ")
        )
      ) +
      '">' +
      '<div class="combo-info">' +
      '<span class="combo-tag">★ O mais pedido</span>' +
      "<h2>" +
      esc(c.title) +
      "</h2>" +
      '<p class="combo-tagline">' +
      esc(c.tagline) +
      "</p>" +
      '<p class="combo-inclui">Inclui</p>' +
      '<ul class="combo-list">' +
      c.includes
        .map(
          (i) =>
            "<li>" +
            esc(i.name) +
            " <span>· " +
            esc(i.note) +
            "</span></li>"
        )
        .join("") +
      "</ul></div>" +
      '<div class="combo-buy"><h3>Escolha o tamanho</h3>' +
      pricesHTML(c.prices) +
      '<a class="btn btn-primary" href="' +
      B.whatsappUrl +
      '" target="_blank" rel="noopener">Pedir no WhatsApp</a>' +
      "</div></div></div></section>"
    );
  }

  /* ------------------------------------------------------------
     Bordas + Aperitivos
     ------------------------------------------------------------ */
  function bordasHTML() {
    const cards = MENU.bordas
      .map((g) => {
        const search = normalize(g.title + " " + g.flavors.join(" "));
        return (
          '<div class="panel-card" data-search="' +
          esc(search) +
          '"><h3>' +
          esc(g.title) +
          '</h3><p class="panel-sub">Recheio que vira o ponto alto da pizza</p>' +
          '<div class="ing-list">' +
          g.flavors.map((f) => '<span class="ing">' + esc(f) + "</span>").join("") +
          "</div>" +
          '<table class="size-table"><thead><tr>' +
          MENU.sizes.map((s) => "<th>" + s.key + "</th>").join("") +
          "</tr></thead><tbody><tr>" +
          MENU.sizes.map((s) => "<td>" + brl(g.prices[s.key]) + "</td>").join("") +
          "</tr></tbody></table></div>"
        );
      })
      .join("");

    const aperis = MENU.aperitivos
      .map(
        (a) =>
          '<div class="aperi-row" data-search="' +
          esc(normalize(a.name + " " + a.size)) +
          '">' +
          '<span class="aperi-emoji">🍟</span>' +
          "<div><h3>" +
          esc(a.name) +
          '</h3><span class="aperi-size">' +
          esc(a.size) +
          "</span></div>" +
          '<span class="aperi-price">' +
          brl(a.price) +
          "</span></div>"
      )
      .join("");

    return (
      '<section class="sec" id="bordas" data-break="page"><div class="container">' +
      '<header class="sec-head"><div class="sec-title">' +
      '<span class="sec-eyebrow">Complete sua pizza</span>' +
      "<h2>Bordas &amp; Aperitivos</h2></div></header>" +
      '<div class="trio">' +
      cards +
      "</div>" +
      aperis +
      "</div></section>"
    );
  }

  /* ------------------------------------------------------------
     Bebidas
     ------------------------------------------------------------ */
  function drinkGroupHTML(g) {
    const icon = ICONS[DRINK_ICON[g.id]] || ICONS.bottle;
    const search = normalize(
      g.title + " " + (g.note || "") + " " + g.rows.map((r) => r.name + " " + r.size).join(" ")
    );
    return (
      '<div class="drink-group" data-search="' +
      esc(search) +
      '"><h3>' +
      icon +
      esc(g.title) +
      "</h3>" +
      (g.note ? '<p class="drink-note">' + esc(g.note) + "</p>" : "") +
      g.rows
        .map(
          (r) =>
            '<div class="row"><span class="nm">' +
            esc(r.name) +
            (r.size ? " <small>" + esc(r.size) + "</small>" : "") +
            '</span><span class="vl">' +
            brl(r.price) +
            "</span></div>"
        )
        .join("") +
      "</div>"
    );
  }

  function bebidasHTML() {
    return (
      '<section class="sec" id="bebidas" data-break="page"><div class="container">' +
      '<header class="sec-head"><div class="sec-title">' +
      '<span class="sec-eyebrow">Tudo gelado</span>' +
      "<h2>Bebidas</h2></div></header>" +
      '<div class="duo">' +
      MENU.drinks.map(drinkGroupHTML).join("") +
      "</div></div></section>"
    );
  }

  function cervejasHTML() {
    const b = MENU.beers;
    const search = normalize(b.title + " " + b.rows.map((r) => r.name + " " + r.size).join(" "));
    return (
      '<section class="sec" id="cervejas"><div class="container">' +
      '<div class="duo"><div class="drink-group" data-search="' +
      esc(search) +
      '"><h3>' +
      ICONS.mug +
      esc(b.title) +
      "</h3>" +
      '<p class="drink-note">Para acompanhar a pizza</p>' +
      b.rows
        .map(
          (r) =>
            '<div class="row"><span class="nm">' +
            esc(r.name) +
            ' <small>' +
            esc(r.size) +
            '</small></span><span class="vl">' +
            brl(r.price) +
            "</span></div>"
        )
        .join("") +
      "</div></div></div></section>"
    );
  }

  /* ------------------------------------------------------------
     Montagem das seções + chips
     ------------------------------------------------------------ */
  const CHIPS = [
    { id: "combos", label: "Combos" },
    { id: "calzones", label: "Calzones" },
    { id: "simples", label: "Simples" },
    { id: "tradicionais", label: "Tradicionais" },
    { id: "especiais", label: "Especiais" },
    { id: "premium", label: "Premium" },
    { id: "premium-especiais", label: "Premium Esp." },
    { id: "doces", label: "Doces" },
    { id: "bordas", label: "Bordas" },
    { id: "bebidas", label: "Bebidas" },
    { id: "cervejas", label: "Cervejas" },
  ];

  const PAGE_BREAKS = {
    simples: true,
    tradicionais: true,
    especiais: true,
    premium: true,
    doces: true,
  };

  function render() {
    /* links de contato */
    ["heroWhats", "ctaWhats", "fabWhats", "footWhats"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = B.whatsappUrl;
    });
    ["heroInsta", "footInsta"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = B.instagramUrl;
    });
    ["heroPhone", "footPhone"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = B.phone;
    });
    $("#footName").textContent = B.name;
    $("#footYear").textContent = B.year;

    /* faixa rolante */
    const ribbonItems = [
      "Pizzas artesanais",
      "Calzones recheados",
      "Combos da casa",
      "Pizzas doces",
      "Bebidas geladas",
      B.cards,
    ];
    const seq = ribbonItems.map((t) => "<span>" + esc(t) + " ·</span>").join("");
    $("#ribbonTrack").innerHTML = seq + seq;

    /* mais pedidas */
    $("#moList").innerHTML = MENU.mostOrdered
      .map((m) => {
        const cat = MENU.pizzas.find((p) => p.id === m.category);
        const from = cat ? cat.prices.P : null;
        return (
          '<a class="mo-chip" href="#' +
          esc(m.category) +
          '"><b>' +
          esc(m.flavor) +
          "</b>" +
          esc(m.name) +
          (from ? "<span>a partir de " + brl(from) + "</span>" : "") +
          "</a>"
        );
      })
      .join("");

    /* chips de navegação */
    $("#chips").innerHTML = CHIPS.map(
      (c) => '<a class="chip" href="#' + c.id + '" data-chip="' + c.id + '">' + esc(c.label) + "</a>"
    ).join("");

    /* seções */
    let html = comboHTML();
    html += menuSection(MENU.calzones, {});
    MENU.pizzas.forEach((cat) => {
      html += menuSection(cat, { pageBreak: !!PAGE_BREAKS[cat.id] });
    });
    html += bordasHTML();
    html += bebidasHTML();
    html += cervejasHTML();
    $("#sections").innerHTML = html;
  }

  /* ------------------------------------------------------------
     Busca
     ------------------------------------------------------------ */
  function setupSearch() {
    const input = $("#search");
    const clearBtn = $("#searchClear");
    const bar = $("#searchBar");
    const countEl = $("#searchCount");
    const resetBtn = $("#searchReset");
    const main = $("#cardapio");

    const noResults = document.createElement("div");
    noResults.className = "no-results is-hidden";
    noResults.id = "noResults";
    noResults.innerHTML =
      "<h2>Nenhum sabor encontrado</h2><p>Tente outro termo, como <em>calabresa</em>, <em>frango</em> ou <em>chocolate</em>.</p>";
    main.appendChild(noResults);

    function apply() {
      const q = normalize(input.value.trim());
      const has = q.length > 0;
      clearBtn.hidden = !has;
      bar.hidden = !has;

      const items = $$("[data-search]");
      let visible = 0;

      items.forEach((el) => {
        const match = !has || el.dataset.search.indexOf(q) !== -1;
        el.classList.toggle("is-hidden", !match);
        if (match && has) visible++;
      });

      $$(".sec").forEach((sec) => {
        const cands = $$("[data-search]", sec);
        if (!cands.length) {
          sec.classList.toggle("is-hidden", has);
          return;
        }
        const any = cands.some((c) => !c.classList.contains("is-hidden"));
        sec.classList.toggle("is-hidden", has && !any);
      });

      if (has) {
        countEl.innerHTML =
          visible === 0
            ? "Nenhum resultado para <strong>“" + esc(input.value.trim()) + "”</strong>"
            : visible +
              (visible === 1 ? " resultado" : " resultados") +
              " para <strong>“" +
              esc(input.value.trim()) +
              "”</strong>";
      }

      noResults.classList.toggle("is-hidden", !(has && visible === 0));
    }

    function reset() {
      input.value = "";
      apply();
    }

    input.addEventListener("input", apply);
    clearBtn.addEventListener("click", reset);
    resetBtn.addEventListener("click", reset);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") reset();
    });
  }

  /* ------------------------------------------------------------
     Chip ativo conforme a rolagem
     ------------------------------------------------------------ */
  function setupSpy() {
    const chips = $$(".chip");
    if (!chips.length || !("IntersectionObserver" in window)) return;

    const byId = {};
    chips.forEach((c) => (byId[c.dataset.chip] = c));

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const id = en.target.id;
          chips.forEach((c) => c.classList.toggle("active", c.dataset.chip === id));
          const active = byId[id];
          if (active && active.scrollIntoView) {
            active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    CHIPS.forEach((c) => {
      const sec = document.getElementById(c.id);
      if (sec) obs.observe(sec);
    });
  }

  /* ------------------------------------------------------------ */
  render();
  setupSearch();
  setupSpy();
})();
