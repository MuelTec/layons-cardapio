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
     Pix — BR Code (EMV), QR Code e copia-e-cola
     ------------------------------------------------------------ */
  const PIX_KEY = String(B.pixKey || "").trim();
  const PIX_CITY = String(B.pixCity || "").trim() || "Imperatriz";

  const pixAscii = (s, max) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['’`´./]/g, "")
      .replace(/[^A-Za-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max)
      .trim();

  function pixTlv(id, val) {
    const v = String(val);
    return id + String(v.length).padStart(2, "0") + v;
  }

  function pixCrc16(str) {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let b = 0; b < 8; b++) {
        crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
      }
    }
    return ("0000" + crc.toString(16).toUpperCase()).slice(-4);
  }

  /* payload Pix copia-e-cola (amount 0 = sem valor definido) */
  function pixPayload(amount) {
    if (!PIX_KEY) return "";
    const mai = pixTlv("00", "br.gov.bcb.pix") + pixTlv("01", PIX_KEY);
    let p =
      pixTlv("00", "01") +
      pixTlv("26", mai) +
      pixTlv("52", "0000") +
      pixTlv("53", "986");
    if (amount > 0) p += pixTlv("54", Number(amount).toFixed(2));
    p +=
      pixTlv("58", "BR") +
      pixTlv("59", pixAscii(B.name, 25)) +
      pixTlv("60", pixAscii(PIX_CITY, 15)) +
      pixTlv("62", pixTlv("05", "***"));
    return p + "6304" + pixCrc16(p + "6304");
  }

  function qrSvg(payload) {
    if (!payload || typeof qrcode !== "function") return "";
    try {
      if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs["UTF-8"]) {
        qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
      }
      const qr = qrcode(0, "M");
      qr.addData(payload);
      qr.make();
      return qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } catch (e) {
      return "";
    }
  }

  function copyText(text) {
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(fallback);
    } else {
      fallback();
    }
  }

  /* botão que copia um texto e mostra "Copiado ✓" por instantes */
  function bindCopy(btn, getText) {
    if (!btn) return;
    btn.addEventListener("click", () => {
      const text = getText();
      if (!text) return;
      copyText(text);
      const old = btn.textContent;
      btn.textContent = "Copiado ✓";
      btn.classList.add("is-copied");
      setTimeout(() => {
        btn.textContent = old;
        btn.classList.remove("is-copied");
      }, 1800);
    });
  }

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
     Faixa de preços (clicável: já abre o montador com o tamanho)
     ------------------------------------------------------------ */
  function pricesHTML(prices, small, cat) {
    return (
      '<div class="prices' +
      (small ? " prices--sm" : "") +
      '">' +
      MENU.sizes
        .map((s) => {
          const inner = "<i>" + s.key + "</i><b>" + brl(prices[s.key]) + "</b>";
          if (!cat) {
            return (
              '<span class="price" title="' + esc(s.label) + '">' + inner + "</span>"
            );
          }
          return (
            '<button type="button" class="price price--btn" data-size="' +
            s.key +
            '" data-cat="' +
            esc(cat.id) +
            '" title="Montar ' +
            esc(cat.title) +
            " — tamanho " +
            esc(s.label) +
            '" aria-label="Montar ' +
            esc(cat.title) +
            " tamanho " +
            esc(s.label) +
            ", " +
            brl(prices[s.key]) +
            '">' +
            inner +
            "</button>"
          );
        })
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
      pricesHTML(cat.prices, false, cat) +
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
     PAGAMENTO PIX (seção própria)
     ------------------------------------------------------------ */
  function pixSectionHTML() {
    if (!PIX_KEY) return "";
    return (
      '<section class="sec sec--pix no-print" id="pix"><div class="container">' +
      '<div class="pix-card">' +
      '<div class="pix-qr" id="pixQr" aria-hidden="true"></div>' +
      '<div class="pix-info">' +
      '<span class="pix-tag">Pague com Pix</span>' +
      "<h2>Pix rápido e sem taxa</h2>" +
      "<p>Aponte a câmera do celular para o QR Code ou use o código copia-e-cola " +
      "no aplicativo do seu banco. Depois é só enviar o pedido pelo WhatsApp.</p>" +
      '<div class="pix-key"><span>Chave Pix</span><code id="pixKeyText">' +
      esc(PIX_KEY) +
      "</code></div>" +
      '<div class="pix-actions">' +
      '<button type="button" class="btn btn-primary" id="pixCopyCode">Copiar código Pix</button>' +
      '<button type="button" class="btn btn-ghost" id="pixCopyKey">Copiar chave</button>' +
      "</div>" +
      "</div></div></div></section>"
    );
  }

  /* ------------------------------------------------------------
     Galeria de fotos
     ------------------------------------------------------------ */
  function galleryHTML() {
    const shots = MENU.gallery || [];
    if (!shots.length) return "";
    return (
      '<section class="sec sec--gallery" id="galeria" data-break="page"><div class="container">' +
      '<header class="sec-head"><div class="sec-title">' +
      '<span class="sec-eyebrow">Direto do nosso forno</span>' +
      "<h2>A casa em fotos</h2></div></header>" +
      '<div class="gallery">' +
      shots
        .map(
          (g, i) =>
            '<figure class="g-item g-item--' +
            (i % 8) +
            '"><img src="' +
            esc(g.src) +
            '" alt="' +
            esc(g.alt) +
            '" loading="lazy"></figure>'
        )
        .join("") +
      "</div></div></section>"
    );
  }

  /* ------------------------------------------------------------
     MONTE SUA PIZZA — montador para o cliente
     ------------------------------------------------------------ */
  function montarHTML() {
    const steps = ["Tamanho", "Sabores", "Refrigerante", "Revisão"];
    const prog = steps
      .map(
        (t, i) =>
          '<button type="button" class="m-p' +
          (i === 0 ? " is-on" : "") +
          '" data-step="' +
          (i + 1) +
          '" aria-label="Etapa ' +
          (i + 1) +
          ": " +
          t +
          '"><b>' +
          (i + 1) +
          "</b><span>" +
          t +
          "</span></button>"
      )
      .join("");

    const sizes = MENU.sizes
      .map(
        (s) =>
          '<button type="button" class="m-size" data-size="' +
          s.key +
          '" aria-pressed="false"><b>' +
          s.key +
          "</b><span>" +
          s.label +
          "</span></button>"
      )
      .join("");

    return (
      '<section class="sec sec--montar no-print" id="montar"><div class="container">' +
      '<header class="sec-head"><div class="sec-title">' +
      '<span class="sec-eyebrow">Do seu jeito</span>' +
      "<h2>Monte seu pedido</h2></div>" +
      '<p class="montar-hint">Passo a passo: escolha o tipo e o tamanho, os sabores (com ou sem borda), ' +
      "o refrigerante e revise — o valor aparece na hora e o pedido sai pronto para o WhatsApp.</p></header>" +
      '<div class="montar-card">' +
      /* progresso das etapas */
      '<div class="m-prog" aria-label="Etapas do pedido">' +
      prog +
      "</div>" +
      '<div class="m-panels">' +
      /* etapa 1 — tipo + tamanho */
      '<div class="m-panel is-on" data-panel="1">' +
      '<div class="m-step"><h3><span class="m-num">1</span> Tamanho</h3>' +
      '<div class="m-types" role="group" aria-label="Tipo de pedido">' +
      '<button type="button" class="m-type is-on" data-type="pizza" aria-pressed="true">🍕 Pizza</button>' +
      '<button type="button" class="m-type" data-type="calzone" aria-pressed="false">🥟 Calzone</button>' +
      "</div>" +
      '<div class="m-sizes">' +
      sizes +
      "</div></div></div>" +
      /* etapa 2 — sabores + borda */
      '<div class="m-panel" data-panel="2">' +
      '<div class="m-step"><h3><span class="m-num">2</span> Sabores <small id="mMax">até 3 no GG</small></h3>' +
      '<input type="search" class="m-filter" id="mFilter" placeholder="Buscar sabor… (ex.: calabresa)" autocomplete="off" aria-label="Buscar sabor para montar">' +
      '<p class="m-focus is-hidden" id="mFocus"></p>' +
      '<div class="m-flavors" id="mFlavors"></div>' +
      '<div class="m-sel" id="mSel"></div>' +
      '<div class="m-borda-wrap" id="mBordaWrap"><h4>Borda recheada <small>opcional</small></h4>' +
      '<select class="m-borda" id="mBorda" aria-label="Escolha a borda recheada"></select></div>' +
      "</div></div>" +
      /* etapa 3 — refrigerantes */
      '<div class="m-panel" data-panel="3">' +
      '<div class="m-step"><h3><span class="m-num">3</span> Refrigerante <small>opcional</small></h3>' +
      '<div class="m-drinks" id="mDrinks"></div>' +
      "</div></div>" +
      /* etapa 4 — revisão */
      '<div class="m-panel m-summary" data-panel="4"><h3>Seu pedido</h3>' +
      '<div class="m-lines" id="mLines"></div>' +
      '<div class="m-total"><span>Total</span><b id="mTotal">R$ —</b></div>' +
      '<div class="m-pix is-hidden" id="mPix">' +
      '<div class="m-pix-head"><b>⚡ Pague com Pix</b><small>opcional — o pedido segue pelo WhatsApp</small></div>' +
      '<div class="m-pix-body">' +
      '<div class="m-pix-qr" id="mPixQr"></div>' +
      '<div class="m-pix-side">' +
      "<p>O QR Code já sai com o valor do pedido. Também dá para copiar o código e colar no app do seu banco.</p>" +
      '<button type="button" class="btn btn-ghost" id="mPixCopy">Copiar código Pix</button>' +
      "</div></div></div>" +
      '<input type="text" class="m-obs" id="mObs" placeholder="Observações (opcional): sem cebola…" maxlength="140">' +
      '<a class="btn btn-primary m-send" id="mSend" href="#" target="_blank" rel="noopener">Enviar pedido no WhatsApp</a>' +
      '<p class="m-note">Na mistura de sabores vale o preço do sabor mais caro. ' +
      "Bordas são cobradas à parte.</p></div>" +
      "</div>" +
      /* avisos + navegação */
      '<p class="m-warn is-hidden" id="mWarn"></p>' +
      '<div class="m-foot">' +
      '<button type="button" class="btn btn-ghost m-back is-hidden" id="mBack">← Voltar</button>' +
      '<span class="m-mini" id="mMini">Comece escolhendo o tamanho</span>' +
      '<button type="button" class="btn btn-primary m-next" id="mNext">Avançar →</button>' +
      "</div>" +
      "</div></div></section>"
    );
  }

  /* ------------------------------------------------------------
     Montagem das seções + chips
     ------------------------------------------------------------ */
  const CHIPS = [
    { id: "montar", label: "Montar" },
    {
      id: "simples",
      label: "Pizzas",
      match: [
        "simples",
        "tradicionais",
        "especiais",
        "premium",
        "premium-especiais",
        "doces",
        "bordas",
      ],
    },
    { id: "calzones", label: "Calzones" },
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
      "Bordas recheadas",
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
    let html = montarHTML();
    html += menuSection(MENU.calzones, {});
    MENU.pizzas.forEach((cat) => {
      html += menuSection(cat, { pageBreak: !!PAGE_BREAKS[cat.id] });
    });
    html += bordasHTML();
    html += bebidasHTML();
    html += cervejasHTML();
    html += pixSectionHTML();
    html += galleryHTML();
    $("#sections").innerHTML = html;

    /* atalho: clicar num tamanho do card já abre o montador */
    $$("#sections .price--btn").forEach((b) => {
      b.addEventListener("click", () => {
        document.dispatchEvent(
          new CustomEvent("layon:build", {
            detail: { size: b.dataset.size, cat: b.dataset.cat },
          })
        );
      });
    });

    /* seção Pix: QR + copiar código / chave */
    const pixQr = $("#pixQr");
    if (pixQr) {
      pixQr.innerHTML = qrSvg(pixPayload(0));
      bindCopy($("#pixCopyCode"), () => pixPayload(0));
      bindCopy($("#pixCopyKey"), () => PIX_KEY);
    }

    /* atalho: montar um calzone direto da seção */
    const czHead = document.querySelector("#calzones .sec-head");
    if (czHead) {
      czHead.insertAdjacentHTML(
        "beforeend",
        '<a class="btn btn-ghost m-cta" href="#montar" data-mtype="calzone">Montar um calzone</a>'
      );
    }
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

    /* seção → chip (uma categoria pode alimentar o mesmo chip, ex.: Pizzas) */
    const secToChip = {};
    CHIPS.forEach((c) => (c.match || [c.id]).forEach((id) => (secToChip[id] = c.id)));

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const chipId = secToChip[en.target.id];
          chips.forEach((c) => c.classList.toggle("active", !!chipId && c.dataset.chip === chipId));
          const active = chipId ? byId[chipId] : null;
          if (active && active.scrollIntoView) {
            active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    /* observa todas as seções: as não mapeadas (Pix, fotos, CTA) limpam o chip */
    $$(".sec").forEach((sec) => {
      if (sec) obs.observe(sec);
    });
  }

  /* ------------------------------------------------------------
     Montador — lógica
     ------------------------------------------------------------ */
  function setupBuilder() {
    const sec = document.getElementById("montar");
    if (!sec) return;

    /* base: fontes de sabores — pizza (categorias) ou calzone (grupo único) */
    const SRC = {
      pizza: { cats: MENU.pizzas || [] },
      calzone: { cats: MENU.calzones ? [MENU.calzones] : [] },
    };
    let flat = [];
    let groups = [];

    function buildSource(key) {
      flat = [];
      groups = [];
      (SRC[key].cats || []).forEach((cat) => {
        const items = [];
        (cat.flavors || []).forEach((f) => {
          items.push({ idx: flat.length, f: f });
          flat.push({ cat: cat, f: f });
        });
        if (items.length) groups.push({ cat: cat, items: items });
      });
    }
    buildSource("pizza");

    /* base: refrigerantes disponíveis (grupos de refri do cardápio) */
    const drinkFlat = [];
    const drinkGroups = [];
    (MENU.drinks || []).forEach((g) => {
      if (!/refri/i.test((g.id || "") + " " + (g.title || ""))) return;
      const items = [];
      (g.rows || []).forEach((r) => {
        items.push({ idx: drinkFlat.length, r: r });
        drinkFlat.push({ r: r });
      });
      if (items.length) drinkGroups.push({ g: g, items: items });
    });

    const state = { type: "pizza", step: 1, size: null, sel: [], borda: "", drinks: [], total: 0, ready: false };
    let warnTimer = null;
    let focusCat = null; /* categoria em destaque na lista (não limita a escolha) */
    let pixPayloadNow = "";
    let lastPixTotal = null;

    const flavorsBox = $("#mFlavors", sec);
    const drinksBox = $("#mDrinks", sec);
    const filterEl = $("#mFilter", sec);
    const selBox = $("#mSel", sec);
    const warnEl = $("#mWarn", sec);
    const bordaEl = $("#mBorda", sec);
    const bordaWrap = $("#mBordaWrap", sec);
    const linesEl = $("#mLines", sec);
    const totalEl = $("#mTotal", sec);
    const obsEl = $("#mObs", sec);
    const sendEl = $("#mSend", sec);
    const sizeBtns = $$(".m-size", sec);
    const typeBtns = $$(".m-type", sec);
    const progBtns = $$(".m-p", sec);
    const panels = $$(".m-panel", sec);
    const backEl = $("#mBack", sec);
    const nextEl = $("#mNext", sec);
    const miniEl = $("#mMini", sec);

    const sizeLabel = (k) => {
      const s = MENU.sizes.find((x) => x.key === k);
      return s ? s.label + " (" + k + ")" : k;
    };

    /* limite de sabores: calzone é 1; pizza aceita 2 (3 no GG) */
    const GG_KEY = "GG";
    const maxFlavors = () => (state.type === "calzone" ? 1 : state.size === GG_KEY ? 3 : 2);

    function updateMaxBadge() {
      const el = $("#mMax", sec);
      if (!el) return;
      el.textContent =
        state.type === "calzone" ? "1 sabor" : state.size ? "até " + maxFlavors() : "até 3 no GG";
    }

    const bordaInfo = () => {
      if (state.type !== "pizza" || !state.borda || !state.size) return null;
      const parts = state.borda.split(".");
      const g = MENU.bordas[Number(parts[0])];
      if (!g) return null;
      const name = g.flavors[Number(parts[1])];
      if (name == null) return null;
      return { name: name, price: Number(g.prices[state.size] || 0) };
    };

    /* --- lista de sabores (com filtro) --- */
    function updateFocus() {
      const el = $("#mFocus", sec);
      if (!el) return;
      const cat = focusCat ? groups.find((g) => g.cat.id === focusCat) : null;
      if (!cat) {
        el.classList.add("is-hidden");
        el.innerHTML = "";
        return;
      }
      el.innerHTML =
        "Sabores de <b>" +
        esc(cat.cat.title) +
        "</b> vêm primeiro — todas as outras categorias seguem liberadas.";
      el.classList.remove("is-hidden");
    }

    function drawFlavors() {
      const q = normalize((filterEl.value || "").trim());
      let html = "";
      let count = 0;

      const list = focusCat
        ? groups
            .slice()
            .sort(
              (a, b) => (b.cat.id === focusCat ? 1 : 0) - (a.cat.id === focusCat ? 1 : 0)
            )
        : groups;
      updateFocus();

      list.forEach((gr) => {
        const rows = gr.items.filter(
          (it) => !q || normalize((it.f.n ? it.f.n + " " : "") + it.f.name + " " + it.f.desc).indexOf(q) !== -1
        );
        if (!rows.length) return;
        count += rows.length;
        html +=
          '<div class="m-group"><h4>' +
          esc(gr.cat.title) +
          '<small>' +
          rows.length +
          "</small></h4>";
        rows.forEach((it) => {
          const on = state.sel.indexOf(it.idx) !== -1;
          html +=
            '<button type="button" class="m-f' +
            (on ? " is-sel" : "") +
            '" data-i="' +
            it.idx +
            '" aria-pressed="' +
            (on ? "true" : "false") +
            '">' +
            (it.f.n ? '<span class="m-f-n">' + esc(it.f.n) + "</span>" : "") +
            '<span class="m-f-name">' +
            esc(it.f.name) +
            "</span>" +
            '<span class="m-f-check">✓</span></button>';
        });
        html += "</div>";
      });

      if (!count) html = '<p class="m-empty">Nenhum sabor encontrado para “' + esc(filterEl.value.trim()) + '”.</p>';
      flavorsBox.innerHTML = html;
    }

    /* --- sabores escolhidos (chips) --- */
    function drawSel() {
      selBox.innerHTML = state.sel
        .map((idx) => {
          const it = flat[idx];
          return (
            '<button type="button" class="m-chip" data-i="' +
            idx +
            '" title="Remover">' +
            esc(it.f.name) +
            "<span>×</span></button>"
          );
        })
        .join("");
      selBox.classList.toggle("is-empty", !state.sel.length);
      if (!state.sel.length) selBox.innerHTML = '<span class="m-sel-ph">Nenhum sabor escolhido ainda</span>';
    }

    /* --- refrigerantes (chips, múltipla escolha) --- */
    function drawDrinks() {
      if (!drinkGroups.length) {
        drinksBox.innerHTML = '<p class="m-empty">Nenhum refrigerante disponível.</p>';
        return;
      }
      let html = "";
      drinkGroups.forEach((gr) => {
        html += '<div class="m-dgroup"><h4>' + esc(gr.g.title) + "</h4>";
        gr.items.forEach((it) => {
          const on = state.drinks.indexOf(it.idx) !== -1;
          html +=
            '<button type="button" class="m-d' +
            (on ? " is-sel" : "") +
            '" data-d="' +
            it.idx +
            '" aria-pressed="' +
            (on ? "true" : "false") +
            '"><span>' +
            esc(it.r.name + (it.r.size ? " " + it.r.size : "")) +
            "</span><b>" +
            brl(it.r.price) +
            '</b><span class="m-d-check">✓</span></button>';
        });
        html += "</div>";
      });
      drinksBox.innerHTML = html;
    }

    /* --- opções de borda (preço por tamanho) --- */
    function drawBorda() {
      const prev = state.borda;
      let html = '<option value="">Sem borda</option>';
      (MENU.bordas || []).forEach((g, gi) => {
        html += '<optgroup label="' + esc(g.title) + '">';
        g.flavors.forEach((name, fi) => {
          const val = gi + "." + fi;
          const pr = state.size ? Number(g.prices[state.size] || 0) : null;
          html +=
            '<option value="' +
            val +
            '">' +
            esc(name) +
            (pr != null ? " — +" + brl(pr) : "") +
            "</option>";
        });
        html += "</optgroup>";
      });
      bordaEl.innerHTML = html;
      bordaEl.value = prev || "";
      if (bordaEl.value !== prev) {
        state.borda = "";
        bordaEl.value = "";
      }
    }

    /* --- resumo + total + link do WhatsApp --- */
    function drawSummary() {
      const lines = [];
      let total = 0;

      if (state.size) lines.push(["Tamanho", sizeLabel(state.size)]);

      state.sel.forEach((idx, i) => {
        const it = flat[idx];
        lines.push([
          state.sel.length > 1 ? "Sabor " + (i + 1) : "Sabor",
          it.f.name +
            " · " +
            (state.type === "calzone" ? "Calzone" : it.cat.title.replace(/^Pizzas\s*/, "")),
        ]);
      });

      if (state.sel.length && state.size) {
        total = state.sel.reduce(
          (mx, idx) => Math.max(mx, Number(flat[idx].cat.prices[state.size] || 0)),
          0
        );
      }

      const bd = bordaInfo();
      if (bd) {
        lines.push(["Borda", bd.name + " — +" + brl(bd.price)]);
        total += bd.price;
      }

      state.drinks.forEach((idx) => {
        const it = drinkFlat[idx];
        lines.push([
          "Refrigerante",
          it.r.name + (it.r.size ? " " + it.r.size : "") + " — " + brl(it.r.price),
        ]);
        total += Number(it.r.price || 0);
      });

      if (state.sel.length > 1) lines.push(["Regra da mistura", "Vale o sabor mais caro"]);

      state.total = total;
      state.ready = !!state.size && state.sel.length > 0;

      linesEl.innerHTML = lines.length
        ? lines
            .map(
              (l) =>
                '<div class="m-line"><span>' + esc(l[0]) + "</span><b>" + esc(l[1]) + "</b></div>"
            )
            .join("")
        : '<p class="m-line-ph">Escolha o tamanho e pelo menos 1 sabor.</p>';

      totalEl.textContent = state.ready ? brl(total) : "R$ —";
      sendEl.classList.toggle("is-off", !state.ready);
      sendEl.setAttribute("aria-disabled", state.ready ? "false" : "true");
      sendEl.href = state.ready ? waHref() : "#";

      updatePix(total);
      drawMini();
      updateNav();
    }

    /* --- bloco Pix da revisão: QR com o valor do pedido --- */
    function updatePix(total) {
      const box = $("#mPix", sec);
      if (!box) return;
      const show = !!PIX_KEY && state.ready && total > 0;
      box.classList.toggle("is-hidden", !show);
      if (!show) {
        pixPayloadNow = "";
        lastPixTotal = null;
        return;
      }
      if (lastPixTotal === total) return;
      lastPixTotal = total;
      pixPayloadNow = pixPayload(total);
      const qr = $("#mPixQr", sec);
      if (qr) qr.innerHTML = qrSvg(pixPayloadNow);
    }

    /* --- resumo enxuto no rodapé do passo a passo --- */
    function drawMini() {
      const bits = [state.type === "calzone" ? "Calzone" : "Pizza"];
      if (state.size) bits.push(sizeLabel(state.size));
      if (state.sel.length === 1) bits.push(flat[state.sel[0]].f.name);
      else if (state.sel.length > 1) bits.push(state.sel.length + " sabores");
      let t = bits.join(" · ");
      if (state.ready) t += " — " + brl(state.total);
      miniEl.textContent = t;
    }

    /* --- navegação entre etapas --- */
    function canAdvance(step) {
      if (step === 1) return !!state.size;
      if (step === 2) return state.sel.length > 0;
      return true;
    }

    function updateNav() {
      const can = canAdvance(state.step);
      nextEl.classList.toggle("is-off", !can);
      nextEl.setAttribute("aria-disabled", can ? "false" : "true");
      backEl.classList.toggle("is-hidden", state.step === 1);
      nextEl.classList.toggle("is-hidden", state.step >= 4);
      progBtns.forEach((b) => {
        const n = Number(b.dataset.step);
        b.classList.toggle("is-on", n === state.step);
        b.classList.toggle("is-done", n < state.step);
        b.setAttribute("aria-current", n === state.step ? "step" : "false");
      });
      panels.forEach((p) => p.classList.toggle("is-on", Number(p.dataset.panel) === state.step));
    }

    function showStep(n) {
      state.step = Math.min(4, Math.max(1, n));
      updateNav();
      const card = sec.querySelector(".montar-card");
      if (card) {
        const rect = card.getBoundingClientRect();
        if (rect.top < 60) {
          window.scrollTo({ top: rect.top + window.scrollY - 74, behavior: "smooth" });
        }
      }
    }

    function waHref() {
      const isCz = state.type === "calzone";
      const L = [
        "Olá! Quero fazer um pedido pela " + B.name + " 🍕",
        "",
        isCz ? "🥟 Monte seu calzone" : "🍕 Monte sua pizza",
        "• Tamanho: " + sizeLabel(state.size),
      ];
      state.sel.forEach((idx, i) => {
        const it = flat[idx];
        L.push(
          "• Sabor" + (state.sel.length > 1 ? " " + (i + 1) : "") + ": " + it.f.name +
            (isCz ? " (Calzone)" : " (" + it.cat.title.replace(/^Pizzas\s*/, "") + ")")
        );
      });
      const bd = bordaInfo();
      if (bd) L.push("• Borda: " + bd.name + " (+" + brl(bd.price) + ")");
      state.drinks.forEach((idx) => {
        const it = drinkFlat[idx];
        L.push(
          "• Refrigerante: " + it.r.name + (it.r.size ? " " + it.r.size : "") +
            " — " + brl(it.r.price)
        );
      });
      L.push("💰 Total: " + brl(state.total));
      const obs = (obsEl.value || "").trim();
      if (obs) L.push("📝 " + obs);

      const mm = B.whatsappUrl.match(/wa\.me\/(\d+)/);
      return mm
        ? "https://wa.me/" + mm[1] + "?text=" + encodeURIComponent(L.join("\n"))
        : B.whatsappUrl;
    }

    function refreshLink() {
      if (state.ready) sendEl.href = waHref();
    }

    function warn() {
      warnEl.textContent =
        "Máximo de " + maxFlavors() + " sabores neste tamanho — desmarque um para trocar.";
      warnEl.classList.remove("is-hidden");
      if (warnTimer) clearTimeout(warnTimer);
      warnTimer = setTimeout(() => warnEl.classList.add("is-hidden"), 3200);
    }

    /* --- eventos --- */
    sizeBtns.forEach((b) => {
      b.addEventListener("click", () => {
        state.size = b.dataset.size;
        sizeBtns.forEach((x) => {
          const on = x === b;
          x.classList.toggle("is-on", on);
          x.setAttribute("aria-pressed", on ? "true" : "false");
        });
        /* trocou para tamanho com limite menor? corta o excedente */
        const max = maxFlavors();
        const trimmed = state.sel.length > max;
        if (trimmed) state.sel = state.sel.slice(0, max);
        updateMaxBadge();
        drawBorda();
        if (trimmed) {
          drawFlavors();
          drawSel();
        }
        drawSummary();
      });
    });

    /* tipo de pedido: pizza ou calzone (troca a lista de sabores) */
    typeBtns.forEach((b) => {
      b.addEventListener("click", () => {
        const key = b.dataset.type;
        if (key === state.type) return;
        state.type = key;
        typeBtns.forEach((x) => {
          const on = x === b;
          x.classList.toggle("is-on", on);
          x.setAttribute("aria-pressed", on ? "true" : "false");
        });
        buildSource(key);
        state.sel = [];
        state.borda = "";
        focusCat = null;
        filterEl.value = "";
        if (bordaWrap) bordaWrap.hidden = key !== "pizza";
        updateMaxBadge();
        drawFlavors();
        drawSel();
        drawBorda();
        drawSummary();
      });
    });

    flavorsBox.addEventListener("click", (e) => {
      const btn = e.target.closest(".m-f");
      if (!btn) return;
      const i = Number(btn.dataset.i);
      if (focusCat && flat[i] && flat[i].cat.id !== focusCat) focusCat = null;
      const at = state.sel.indexOf(i);
      if (at !== -1) state.sel.splice(at, 1);
      else if (state.sel.length < maxFlavors()) {
        state.sel.push(i);
        /* escolheu o sabor? limpa o buscador e mostra a lista inteira de novo */
        if (filterEl.value) filterEl.value = "";
      } else {
        warn();
        return;
      }
      drawFlavors();
      drawSel();
      drawSummary();
    });

    selBox.addEventListener("click", (e) => {
      const btn = e.target.closest(".m-chip");
      if (!btn) return;
      const i = Number(btn.dataset.i);
      state.sel = state.sel.filter((x) => x !== i);
      drawFlavors();
      drawSel();
      drawSummary();
    });

    filterEl.addEventListener("input", () => {
      if (focusCat) focusCat = null;
      drawFlavors();
    });
    drinksBox.addEventListener("click", (e) => {
      const btn = e.target.closest(".m-d");
      if (!btn) return;
      const i = Number(btn.dataset.d);
      const at = state.drinks.indexOf(i);
      if (at !== -1) state.drinks.splice(at, 1);
      else state.drinks.push(i);
      drawDrinks();
      drawSummary();
    });
    bordaEl.addEventListener("change", () => {
      state.borda = bordaEl.value;
      drawSummary();
    });
    obsEl.addEventListener("input", refreshLink);
    sendEl.addEventListener("click", (e) => {
      if (!state.ready) e.preventDefault();
    });

    /* --- navegação do passo a passo --- */
    function warnStep() {
      warnEl.textContent =
        state.step === 1
          ? "Escolha um tamanho para continuar."
          : "Escolha pelo menos 1 sabor para continuar.";
      warnEl.classList.remove("is-hidden");
      if (warnTimer) clearTimeout(warnTimer);
      warnTimer = setTimeout(() => warnEl.classList.add("is-hidden"), 3200);
    }

    nextEl.addEventListener("click", () => {
      if (!canAdvance(state.step)) {
        warnStep();
        return;
      }
      showStep(state.step + 1);
    });

    backEl.addEventListener("click", () => showStep(state.step - 1));

    progBtns.forEach((b) => {
      b.addEventListener("click", () => {
        const target = Number(b.dataset.step);
        if (target === state.step) return;
        if (target < state.step) {
          showStep(target);
          return;
        }
        for (let s = state.step; s < target; s++) {
          if (!canAdvance(s)) {
            warnStep();
            return;
          }
        }
        showStep(target);
      });
    });

    /* atalho "Montar um calzone" vindo da seção de calzones */
    $$("[data-mtype]").forEach((a) => {
      a.addEventListener("click", () => {
        const key = a.dataset.mtype;
        const btn = typeBtns.find((x) => x.dataset.type === key);
        if (btn && key !== state.type) btn.click();
      });
    });

    /* atalho vindo dos cards de sabor: tamanho + categoria já marcados */
    document.addEventListener("layon:build", (e) => {
      const d = (e && e.detail) || {};
      if (!d.size) return;

      const wantType = d.cat === "calzones" ? "calzone" : "pizza";
      if (state.type !== wantType) {
        const tb = typeBtns.find((x) => x.dataset.type === wantType);
        if (tb) tb.click();
      }

      const sb = sizeBtns.find((x) => x.dataset.size === d.size);
      if (sb && state.size !== d.size) sb.click();

      focusCat = wantType === "pizza" && d.cat ? d.cat : null;
      drawFlavors();
      showStep(2);

      const card = sec.querySelector(".montar-card");
      if (card) {
        window.scrollTo({
          top: card.getBoundingClientRect().top + window.scrollY - 74,
          behavior: "smooth",
        });
      }
    });

    /* copiar código Pix da revisão */
    bindCopy($("#mPixCopy", sec), () => pixPayloadNow);

    /* --- início --- */
    if (bordaWrap) bordaWrap.hidden = false;
    updateMaxBadge();
    drawFlavors();
    drawDrinks();
    drawSel();
    drawBorda();
    drawSummary();
    updateNav();
  }

  /* ------------------------------------------------------------ */
  render();
  setupSearch();
  setupBuilder();
  setupSpy();
})();
