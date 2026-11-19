/* ============================================================
   LAYON'S PIZZARIA — PAINEL DO PROPRIETÁRIO
   ------------------------------------------------------------
   Edita os dados do cardápio (menu-data.js) sem tocar em código.
   - Rascunho automático neste navegador (localStorage)
   - Publicação direto no GitHub (Contents API) com token
   - Alternativa: baixar o arquivo e enviar pelo GitHub
   ============================================================ */

(function () {
  "use strict";

  const REPO = "MuelTec/layons-cardapio";
  const API = "https://api.github.com/repos/" + REPO + "/contents/";
  const K_DRAFT = "layons_draft";
  const K_TOKEN = "layons_token";

  const $ = (s, c) => (c || document).querySelector(s);
  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const toNum = (v) => {
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };
  const disp = (v) => String(v == null ? 0 : v).replace(".", ",");
  const slug = (s) =>
    String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "foto";

  /* ---------------- estado ---------------- */

  let BASE = clone(MENU); // o que está publicado (como carregou)
  let D = clone(MENU); // rascunho de trabalho
  /* localStorage pode falhar (modo privado / cookies bloqueados) */
  const storage = {
    get: function (k) {
      try {
        return localStorage.getItem(k);
      } catch (e) {
        return null;
      }
    },
    set: function (k, v) {
      try {
        localStorage.setItem(k, v);
      } catch (e) {}
    },
    del: function (k) {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    },
  };

  let token = storage.get(K_TOKEN) || "";
  let tab = "sabores";
  let publishing = false;
  let logLines = [];
  let draftTimer = null;
  let toastTimer = null;
  let draftAt = null;

  /* tenta recuperar rascunho salvo neste navegador */
  try {
    const raw = storage.get(K_DRAFT);
    if (raw) {
      const dr = JSON.parse(raw);
      if (dr && dr.d && dr.d.brand) {
        D = dr.d;
        draftAt = dr.at || null;
      }
    }
  } catch (e) {
    /* rascunho corrompido — segue com o publicado */
  }

  /* ---------------- caminhos (data-path) ---------------- */

  function getByPath(path) {
    return String(path)
      .split(".")
      .reduce((o, k) => (o == null ? o : o[k]), D);
  }

  function setPath(path, val) {
    const parts = String(path).split(".");
    let o = D;
    for (let i = 0; i < parts.length - 1; i++) {
      if (o == null || typeof o !== "object") return;
      o = o[parts[i]];
    }
    if (o == null || typeof o !== "object") return;
    o[parts[parts.length - 1]] = val;
  }

  /* ---------------- rascunho ---------------- */

  function isDirty() {
    return JSON.stringify(D) !== JSON.stringify(BASE);
  }

  function saveDraft() {
    updateDirty();
    clearTimeout(draftTimer);
    draftTimer = setTimeout(function () {
      draftAt = Date.now();
      storage.set(K_DRAFT, JSON.stringify({ d: D, at: draftAt }));
      updateDirty();
    }, 350);
  }

  function clearDraft() {
    clearTimeout(draftTimer);
    storage.del(K_DRAFT);
    draftAt = null;
    updateDirty();
  }

  function updateDirty() {
    const dirty = isDirty();
    const ind = $("#aDirty");
    if (ind) ind.classList.toggle("is-hidden", !dirty);
    const banner = $("#aBanner");
    const msg = $("#aBannerMsg");
    if (banner && msg) {
      banner.classList.toggle("is-hidden", !dirty);
      if (dirty) {
        msg.textContent =
          "Alterações não publicadas — rascunho salvo neste navegador" +
          (draftAt ? " às " + new Date(draftAt).toLocaleTimeString("pt-BR") : "") +
          ".";
      }
    }
  }

  function discardDraft() {
    if (!isDirty()) {
      toast("Nenhuma alteração para descartar.");
      return;
    }
    D = clone(BASE);
    clearDraft();
    toast("Rascunho descartado.");
    render();
  }

  /* ---------------- aviso / log ---------------- */

  function toast(msg, isErr) {
    const t = $("#aToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle("is-err", !!isErr);
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("is-on");
    }, 2800);
  }

  function log(kind, msg) {
    logLines.push('<span class="' + kind + '">' + esc(msg) + "</span>");
    const el = $("#aLog");
    if (el) {
      el.classList.add("is-on");
      el.innerHTML = logLines.join("\n");
      el.scrollTop = el.scrollHeight;
    }
  }

  /* ---------------- helpers de HTML ---------------- */

  function head(title, sub) {
    return (
      '<div class="a-sec-head"><h1>' +
      esc(title) +
      "</h1><p>" +
      esc(sub) +
      "</p></div>"
    );
  }

  function field(label, path, val, opts) {
    opts = opts || {};
    const attrs =
      ' data-path="' + esc(path) + '"' + (opts.num ? ' data-num="1"' : "");
    const cls = opts.num ? ' class="a-num"' : "";
    const v = val == null ? "" : val;
    const control = opts.area
      ? "<textarea" + attrs + cls + ">" + esc(v) + "</textarea>"
      : '<input type="text"' + attrs + cls + ' value="' + esc(v) + '">';
    return (
      '<label class="a-field"><span>' +
      esc(label) +
      "</span>" +
      control +
      "</label>"
    );
  }

  function priceGrid(basePath, prices, sizes) {
    return (
      '<div class="a-grid a-grid--4">' +
      sizes
        .map(function (s) {
          return field(
            "Preço " + s.key,
            basePath + ".prices." + s.key,
            disp(prices ? prices[s.key] : 0),
            { num: true }
          );
        })
        .join("") +
      "</div>"
    );
  }

  function cats() {
    const list = [{ path: "calzones", cat: D.calzones }];
    D.pizzas.forEach(function (c, i) {
      list.push({ path: "pizzas." + i, cat: c });
    });
    return list;
  }

  /* foto de capa de uma seção (sabores / calzones) */
  function catPhotoHTML(path, cat, withTitle) {
    const img = cat.img || "";
    let h =
      '<div class="a-catphoto">' +
      "<strong>" +
      (withTitle ? esc(cat.title || cat.id) : "Foto da seção") +
      "</strong>" +
      '<p class="a-sub">Banner exibido no topo da seção no site. Opcional.</p>';
    if (img) {
      h +=
        '<img src="' +
        esc(img) +
        '" alt="Foto de ' +
        esc(cat.title || cat.id) +
        '" style="width:100%;max-width:340px;aspect-ratio:16/9;object-fit:cover;border-radius:12px;background:#000">';
    } else {
      h += '<p class="a-empty">Nenhuma foto nesta seção.</p>';
    }
    h +=
      '<div class="a-card-actions">' +
      '<label class="a-btn a-btn--gold a-btn--sm">' +
      (img ? "Trocar foto" : "+ Adicionar foto") +
      '<input type="file" accept="image/*" data-up="cat:' +
      esc(path) +
      '"></label>' +
      (img
        ? '<button type="button" class="a-btn a-btn--sm" data-act="rm-catimg" data-path="' +
          esc(path) +
          '">Remover foto</button>'
        : "") +
      "</div></div>";
    return h;
  }

  function rowsHTML(base, rows) {
    let h = "";
    rows.forEach(function (r, i) {
      const p = base + "." + i;
      h +=
        '<div class="a-item a-item--3">' +
        '<input type="text" data-path="' +
        p +
        '.name" value="' +
        esc(r.name) +
        '" placeholder="Nome">' +
        '<input type="text" data-path="' +
        p +
        '.size" value="' +
        esc(r.size) +
        '" placeholder="Tamanho">' +
        '<input type="text" class="a-num" data-num="1" data-path="' +
        p +
        '.price" value="' +
        disp(r.price) +
        '" placeholder="Preço">' +
        '<button type="button" class="a-del" data-act="del-row" data-path="' +
        base +
        '" data-i="' +
        i +
        '" title="Excluir">×</button>' +
        "</div>";
    });
    return h || '<p class="a-empty">Nenhum item ainda.</p>';
  }

  function catSelect(path, val) {
    const opts = cats()
      .map(function (c) {
        return (
          '<option value="' +
          esc(c.cat.id) +
          '"' +
          (c.cat.id === val ? " selected" : "") +
          ">" +
          esc(c.cat.title) +
          "</option>"
        );
      })
      .join("");
    return '<select data-path="' + esc(path) + '">' + opts + "</select>";
  }

  /* ---------------- serialização ---------------- */

  function serialize() {
    return (
      "/* ============================================================\n" +
      "   LAYON'S PIZZARIA — DADOS DO CARDÁPIO\n" +
      "   -------------------------------------------------------------\n" +
      "   Gerado pelo painel (admin.html). Edite pelo painel ou aqui.\n" +
      "   Valores vigentes: cardápio " +
      D.brand.year +
      ".\n" +
      "   ============================================================ */\n\n" +
      "const MENU = " +
      JSON.stringify(D, null, 2) +
      ";\n"
    );
  }

  function b64enc(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function authHeaders(extra) {
    const h = { Accept: "application/vnd.github+json" };
    if (token) h.Authorization = "Bearer " + token;
    if (extra) Object.assign(h, extra);
    return h;
  }

  /* ---------------- render ---------------- */

  function render() {
    document.querySelectorAll(".a-tab").forEach(function (b) {
      b.classList.toggle("is-on", b.dataset.tab === tab);
    });
    let html = "";
    if (tab === "sabores") html = renderSabores();
    else if (tab === "bebidas") html = renderBebidas();
    else if (tab === "bordas") html = renderBordas();
    else if (tab === "destaques") html = renderDestaques();
    else if (tab === "fotos") html = renderFotos();
    else if (tab === "contato") html = renderContato();
    else html = renderPublicar();
    $("#aMain").innerHTML = html;
    if (logLines.length) {
      const el = $("#aLog");
      if (el) {
        el.classList.add("is-on");
        el.innerHTML = logLines.join("\n");
      }
    }
    updateDirty();
  }

  /* ============================================================
     ABA — SABORES (calzones + categorias de pizza)
     ============================================================ */

  function renderSabores() {
    const sizes = D.sizes;
    let html = head(
      "Sabores e preços",
      "Edite títulos, preços por tamanho e a lista de sabores de cada categoria. Tudo fica salvo como rascunho neste navegador até você publicar."
    );

    /* faixas de tamanho */
    html +=
      '<div class="a-card"><h2>Tamanhos <span class="a-count">' +
      sizes.length +
      "</span></h2>" +
      '<p class="a-sub">Rótulos das colunas de preço (P, M, G, GG) usados em todo o cardápio.</p>' +
      '<div class="a-grid">' +
      sizes
        .map(function (s, i) {
          return field("Tamanho " + s.key, "sizes." + i + ".label", s.label);
        })
        .join("") +
      "</div></div>";

    cats().forEach(function (entry) {
      const path = entry.path;
      const cat = entry.cat;
      const showNum = path !== "calzones";
      const n = (cat.flavors || []).length;

      html +=
        '<div class="a-card"><h2>' +
        esc(cat.title || cat.id) +
        ' <span class="a-count">' +
        n +
        (n === 1 ? " sabor" : " sabores") +
        "</span></h2>";

      html +=
        '<div class="a-grid">' +
        field("Título da seção", path + ".title", cat.title) +
        field("Sobretítulo", path + ".eyebrow", cat.eyebrow) +
        "</div>";

      html += catPhotoHTML(path, cat, false);

      html += priceGrid(path, cat.prices, sizes);

      /* aviso "em breve" */
      if (cat.comingSoon) {
        html +=
          '<div class="a-warn"><strong>Aviso “em breve” ativo</strong> — aparece no lugar da grade quando não há sabores.' +
          '<div class="a-grid" style="margin-top:10px">' +
          field("Título do aviso", path + ".comingSoon.title", cat.comingSoon.title) +
          field("Texto do aviso", path + ".comingSoon.text", cat.comingSoon.text, { area: true }) +
          "</div>" +
          '<button type="button" class="a-btn a-btn--sm" data-act="rm-aviso" data-path="' +
          path +
          '">Remover aviso</button></div>';
      } else {
        html +=
          '<div class="a-card-actions"><button type="button" class="a-btn a-btn--sm" data-act="add-aviso" data-path="' +
          path +
          '">+ Aviso “em breve”</button></div>';
      }

      /* lista de sabores */
      if (!n) {
        html += '<p class="a-empty">Nenhum sabor ainda — use o botão abaixo para adicionar o primeiro.</p>';
      }
      (cat.flavors || []).forEach(function (f, i) {
        const p = path + ".flavors." + i;
        html +=
          '<div class="a-item' +
          (showNum ? "" : " a-item--flavor3") +
          '">' +
          (showNum
            ? '<input type="text" class="a-num" data-path="' + p + '.n" value="' + esc(f.n || "") + '" placeholder="nº" aria-label="Número do sabor">'
            : "") +
          '<input type="text" data-path="' + p + '.name" value="' + esc(f.name || "") + '" placeholder="Nome do sabor">' +
          '<textarea data-path="' + p + '.desc" placeholder="Ingredientes / descrição">' + esc(f.desc || "") + "</textarea>" +
          '<button type="button" class="a-del" data-act="del-flavor" data-path="' + path + '" data-i="' + i + '" title="Excluir sabor">×</button>' +
          "</div>";
      });

      html +=
        '<div class="a-card-actions"><button type="button" class="a-btn" data-act="add-flavor" data-path="' +
        path +
        '">+ Novo sabor</button></div></div>';
    });

    return html;
  }

  /* ============================================================
     ABA — BEBIDAS (grupos + cervejas)
     ============================================================ */

  function renderBebidas() {
    let html = head(
      "Bebidas e cervejas",
      "Grupos de refrigerantes, águas, sucos, energéticos e a lista de cervejas. Itens com preço em R$."
    );

    D.drinks.forEach(function (g, gi) {
      const p = "drinks." + gi;
      html +=
        '<div class="a-card"><h2>' +
        esc(g.title) +
        ' <span class="a-count">' +
        g.rows.length +
        " itens</span></h2>" +
        '<div class="a-grid">' +
        field("Título do grupo", p + ".title", g.title) +
        field("Nota (opcional)", p + ".note", g.note || "") +
        "</div>" +
        rowsHTML(p + ".rows", g.rows) +
        '<div class="a-card-actions">' +
        '<button type="button" class="a-btn a-btn--sm" data-act="add-row" data-path="' + p + '.rows">+ Item</button>' +
        '<button type="button" class="a-btn a-btn--sm" data-act="del-group" data-path="drinks" data-i="' + gi + '">Excluir grupo</button>' +
        "</div></div>";
    });

    html +=
      '<div class="a-card-actions" style="margin-bottom:22px"><button type="button" class="a-btn" data-act="add-group">+ Novo grupo de bebidas</button></div>';

    /* cervejas */
    const b = D.beers;
    html +=
      '<div class="a-card"><h2>' +
      esc(b.title) +
      ' <span class="a-count">' +
      b.rows.length +
      " itens</span></h2>" +
      field("Título da seção", "beers.title", b.title) +
      rowsHTML("beers.rows", b.rows) +
      '<div class="a-card-actions"><button type="button" class="a-btn" data-act="add-row" data-path="beers.rows">+ Item</button></div></div>';

    return html;
  }

  /* ============================================================
     ABA — BORDAS E APERITIVOS
     ============================================================ */

  function renderBordas() {
    const sizes = D.sizes;
    let html = head(
      "Bordas e aperitivos",
      "Bordas recheadas por grupo (sabores e preço por tamanho) e a lista de aperitivos."
    );

    D.bordas.forEach(function (b, i) {
      const p = "bordas." + i;
      html +=
        '<div class="a-card"><h2>' +
        esc(b.title) +
        ' <span class="a-count">' +
        b.flavors.length +
        " sabores</span></h2>" +
        field("Título do grupo", p + ".title", b.title) +
        priceGrid(p, b.prices, sizes);

      html += '<div class="a-sub">Sabores da borda:</div><div class="a-chips">';
      if (!b.flavors.length) html += '<span class="a-empty">Nenhum sabor.</span>';
      b.flavors.forEach(function (fl, j) {
        html +=
          '<span class="a-tag">' +
          esc(fl) +
          ' <button type="button" data-act="del-bflavor" data-path="' + p + '" data-i="' + j + '" title="Remover">×</button></span>';
      });
      html += "</div>";

      html +=
        '<div class="a-card-actions">' +
        '<input type="text" placeholder="Novo sabor da borda…" aria-label="Novo sabor da borda">' +
        '<button type="button" class="a-btn a-btn--sm" data-act="add-bflavor" data-path="' + p + '">+ Adicionar</button>' +
        '<button type="button" class="a-btn a-btn--sm" data-act="del-bgroup" data-path="bordas" data-i="' + i + '">Excluir grupo</button>' +
        "</div></div>";
    });

    html +=
      '<div class="a-card-actions" style="margin-bottom:22px"><button type="button" class="a-btn" data-act="add-bgroup">+ Novo grupo de bordas</button></div>';

    /* aperitivos */
    html +=
      '<div class="a-card"><h2>Aperitivos <span class="a-count">' +
      D.aperitivos.length +
      "</span></h2>";
    if (!D.aperitivos.length) html += '<p class="a-empty">Nenhum aperitivo.</p>';
    D.aperitivos.forEach(function (a, i) {
      const p = "aperitivos." + i;
      html +=
        '<div class="a-item a-item--3">' +
        '<input type="text" data-path="' + p + '.name" value="' + esc(a.name) + '" placeholder="Nome">' +
        '<input type="text" data-path="' + p + '.size" value="' + esc(a.size) + '" placeholder="Tamanho">' +
        '<input type="text" class="a-num" data-num="1" data-path="' + p + '.price" value="' + disp(a.price) + '" placeholder="Preço">' +
        '<button type="button" class="a-del" data-act="del-aperi" data-i="' + i + '" title="Excluir">×</button>' +
        "</div>";
    });
    html +=
      '<div class="a-card-actions"><button type="button" class="a-btn" data-act="add-aperi">+ Novo aperitivo</button></div></div>';

    return html;
  }

  /* ============================================================
     ABA — DESTAQUES (mais pedidas)
     ============================================================ */

  function renderDestaques() {
    let html = head(
      "Destaques",
      "A lista de “Mais pedidas” exibida no topo do site."
    );

    /* mais pedidas */
    html +=
      '<div class="a-card"><h2>Mais pedidas <span class="a-count">' +
      D.mostOrdered.length +
      "</span></h2>" +
      '<p class="a-sub">Destaque “Mais pedidas” no topo do site — o número é a ordem, não o preço.</p>';
    if (!D.mostOrdered.length) html += '<p class="a-empty">Nenhum destaque.</p>';
    D.mostOrdered.forEach(function (m, i) {
      const p = "mostOrdered." + i;
      html +=
        '<div class="a-item a-item--mo">' +
        '<input type="text" class="a-num" data-path="' + p + '.flavor" value="' + esc(m.flavor || "") + '" placeholder="nº" aria-label="Número">' +
        '<input type="text" data-path="' + p + '.name" value="' + esc(m.name || "") + '" placeholder="Nome do sabor">' +
        catSelect(p + ".category", m.category) +
        '<button type="button" class="a-del" data-act="del-most" data-i="' + i + '" title="Excluir">×</button>' +
        "</div>";
    });
    html +=
      '<div class="a-card-actions"><button type="button" class="a-btn" data-act="add-most">+ Destaque</button></div></div>';

    return html;
  }

  /* ============================================================
     ABA — FOTOS
     ============================================================ */

  function renderFotos() {
    let html = head(
      "Fotos",
      "A foto de capa, as fotos de cada seção de sabores/calzones e a galeria do site. As imagens são otimizadas (até 1600px, JPG) e enviadas direto para a pasta img/ do repositório."
    );

    /* capa */
    html +=
      '<div class="a-card"><h2>Foto de capa (hero)</h2>' +
      '<p class="a-sub">Imagem de fundo do topo do site — substitui <code>img/hero-pizza.jpg</code>.</p>' +
      '<img src="img/hero-pizza.jpg" alt="Foto de capa atual" style="width:100%;max-width:340px;aspect-ratio:16/9;object-fit:cover;border-radius:12px;background:#000">' +
      '<div class="a-card-actions"><label class="a-btn a-btn--gold">Trocar foto de capa<input type="file" accept="image/*" data-up="hero"></label></div></div>';

    /* fotos das seções */
    html +=
      '<div class="a-card"><h2>Fotos das seções <span class="a-count">' +
      cats().length +
      " seções</span></h2>" +
      '<p class="a-sub">Uma foto por seção (calzones e categorias de pizza) — aparece no topo de cada seção no site.</p>';
    cats().forEach(function (entry) {
      html += catPhotoHTML(entry.path, entry.cat, true);
    });
    html += "</div>";

    /* galeria */
    html +=
      '<div class="a-card"><h2>Galeria <span class="a-count">' +
      D.gallery.length +
      " fotos</span></h2>" +
      '<div class="a-upload"><label class="a-btn a-btn--primary">+ Adicionar fotos<input type="file" accept="image/*" multiple data-up="gallery"></label>' +
      "<p>Envia para <code>img/</code> e adiciona na galeria. É preciso ter o token salvo na aba Publicar. Fotos novas ficam no fim — use ← → para reordenar.</p></div>";

    if (!D.gallery.length) html += '<p class="a-empty">Nenhuma foto na galeria.</p>';
    html += '<div class="a-gal">';
    D.gallery.forEach(function (g, i) {
      html +=
        '<div class="a-shot"><img src="' + esc(g.src) + '" alt="' + esc(g.alt || "") + '">' +
        '<div class="a-shot-body">' +
        '<input type="text" data-path="gallery.' + i + '.alt" value="' + esc(g.alt || "") + '" placeholder="Descrição da foto">' +
        '<div class="a-shot-ctrl">' +
        '<button type="button" data-act="gal-move" data-i="' + i + '" data-dir="-1" title="Mover para a esquerda">←</button>' +
        '<button type="button" data-act="gal-move" data-i="' + i + '" data-dir="1" title="Mover para a direita">→</button>' +
        '<button type="button" class="a-del" data-act="gal-del" data-i="' + i + '" title="Remover da galeria">×</button>' +
        "</div></div></div>";
    });
    html += "</div></div>";

    return html;
  }

  /* ============================================================
     ABA — CONTATO / MARCA
     ============================================================ */

  function waParts() {
    const u = D.brand.whatsappUrl || "";
    const mark = "?text=";
    const i = u.indexOf(mark);
    return {
      num: i >= 0 ? u.slice("https://wa.me/".length, i) : u.replace("https://wa.me/", ""),
      text: i >= 0 ? decodeURIComponent(u.slice(i + mark.length)) : "",
    };
  }

  function renderContato() {
    const b = D.brand;
    const wa = waParts();
    let html = head(
      "Contato e marca",
      "Nome, redes e telefone exibidos no site. Os botões de WhatsApp usam o número e a mensagem definidos aqui."
    );

    html +=
      '<div class="a-card"><h2>Identidade</h2><div class="a-grid">' +
      field("Nome", "brand.name", b.name) +
      field("Apelido (topo)", "brand.short", b.short) +
      field("Ano / cardápio", "brand.year", b.year) +
      field("Texto dos cartões", "brand.cards", b.cards) +
      "</div></div>";

    html +=
      '<div class="a-card"><h2>Redes e telefone</h2><div class="a-grid">' +
      field("Instagram (@)", "brand.instagram", b.instagram) +
      field("Link do Instagram", "brand.instagramUrl", b.instagramUrl) +
      field("Telefone exibido", "brand.phone", b.phone) +
      "</div></div>";

    html +=
      '<div class="a-card"><h2>WhatsApp</h2>' +
      '<p class="a-sub">Todos os botões “Peça pelo WhatsApp” abrem este link.</p>' +
      '<div class="a-grid">' +
      '<label class="a-field"><span>Número (só dígitos com DDD)</span><input type="text" data-special="wa-num" value="' + esc(wa.num) + '" placeholder="5599991620986"></label>' +
      '<label class="a-field"><span>Mensagem padrão</span><textarea data-special="wa-text">' + esc(wa.text) + "</textarea></label>" +
      "</div>" +
      '<p class="a-hint">Link atual: <code>' + esc(D.brand.whatsappUrl) + "</code></p></div>";

    html +=
      '<div class="a-card"><h2>Pagamento Pix</h2>' +
      '<p class="a-sub">Com a chave preenchida, o site exibe a seção “Pague com Pix” e o QR Code (com o valor do pedido) na revisão do montador. Deixe a chave em branco para ocultar o Pix.</p>' +
      '<div class="a-grid">' +
      field("Chave Pix", "brand.pixKey", b.pixKey || "") +
      field("Cidade (Pix)", "brand.pixCity", b.pixCity || "") +
      "</div>" +
      '<p class="a-hint">Aceita CPF, CNPJ, e-mail, telefone (<code>+55…</code>) ou chave aleatória. A cidade entra no código Pix (até 15 letras, sem acento).</p></div>';

    return html;
  }

  /* ============================================================
     ABA — PUBLICAR
     ============================================================ */

  function renderPublicar() {
    const dirty = isDirty();
    let html = head(
      "Publicar",
      "Salve suas alterações no GitHub para o site atualizar sozinho (leva ~1 minuto)."
    );

    html += dirty
      ? '<div class="a-warn"><strong>Há alterações não publicadas.</strong> Elas estão salvas como rascunho neste navegador.</div>'
      : '<div class="a-ok-box">O painel está igual ao site publicado. Nada pendente.</div>';

    /* token */
    html +=
      '<div class="a-card"><h2>Token do GitHub</h2>' +
      '<ol class="a-steps">' +
      "<li>Abra <b>github.com/settings/tokens</b> (ou Settings → Developer settings → <b>Personal access tokens</b>).</li>" +
      "<li>Crie um token <b>Fine-grained</b>, repositório <b>MuelTec/layons-cardapio</b>, permissão <b>Contents: Read and write</b>.</li>" +
      "<li>Cole o token abaixo e clique em <b>Salvar</b>. Ele fica só neste navegador.</li>" +
      "</ol>" +
      '<div class="a-token-row">' +
      '<label class="a-field"><span>Token</span><input type="password" id="aToken" value="' + esc(token) + '" placeholder="ghp_… ou github_pat_…" autocomplete="off"></label>' +
      '<button type="button" class="a-btn a-btn--gold" data-act="save-token">Salvar token</button>' +
      '<button type="button" class="a-btn" data-act="clear-token">Limpar</button>' +
      "</div>" +
      '<p class="a-hint">Alternativa clássica: token com escopo <b>repo</b>. Sem permissão de escrita a publicação falha com HTTP 403.</p></div>';

    /* publicar */
    html +=
      '<div class="a-card"><h2>Publicar alterações</h2>' +
      '<div class="a-card-actions">' +
      '<button type="button" class="a-btn a-btn--primary" id="aPub" data-act="publish"' + (publishing ? " disabled" : "") + '>🚀 Publicar agora</button>' +
      '<button type="button" class="a-btn" data-act="download">⬇ Baixar menu-data.js</button>' +
      '<button type="button" class="a-btn" data-act="discard">Descartar rascunho</button>' +
      "</div>" +
      '<p class="a-hint">Publicar grava o <code>menu-data.js</code> no GitHub; o GitHub Pages atualiza o site em seguida. O download é para enviar manualmente se preferir.</p>' +
      '<div class="a-log" id="aLog"></div></div>';

    /* manual */
    html +=
      '<div class="a-card"><h2>Alternativa manual (sem token)</h2>' +
      '<ol class="a-steps">' +
      "<li>Clique em <b>Baixar menu-data.js</b>.</li>" +
      "<li>Abra o repositório <b>MuelTec/layons-cardapio</b> no GitHub e arraste o arquivo para a pasta raiz (substituir).</li>" +
      "<li>Confirme o <b>Commit changes</b> — o site atualiza sozinho.</li>" +
      "</ol></div>";

    return html;
  }

  /* ============================================================
     PUBLICAÇÃO (GitHub Contents API)
     ============================================================ */

  async function publish() {
    if (publishing) return;
    if (!token) {
      toast("Salve o token primeiro (campo acima).", true);
      const t = $("#aToken");
      if (t) t.focus();
      return;
    }
    publishing = true;
    const btn = $("#aPub");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Publicando…";
    }
    try {
      log("info", "Lendo menu-data.js no GitHub…");
      const r = await fetch(API + "menu-data.js", { headers: authHeaders() });
      if (!r.ok) {
        let extra = "";
        if (r.status === 401) extra = " — token inválido.";
        else if (r.status === 403) extra = " — sem permissão de escrita no repositório.";
        throw new Error("Falha ao ler o arquivo (HTTP " + r.status + ")" + extra);
      }
      const meta = await r.json();
      const content = serialize();

      log("info", "Enviando atualização (" + content.length + " bytes)…");
      const r2 = await fetch(API + "menu-data.js", {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          message:
            "Painel: atualiza cardápio (" + new Date().toLocaleString("pt-BR") + ")",
          content: b64enc(content),
          sha: meta.sha,
        }),
      });
      if (!r2.ok) {
        let msg = "HTTP " + r2.status;
        try {
          const j = await r2.json();
          if (j.message) msg += " — " + j.message;
        } catch (e) {}
        throw new Error(msg);
      }
      const out = await r2.json();
      BASE = clone(D);
      clearDraft();
      log(
        "ok",
        "Publicado! commit " + (out.commit && out.commit.sha ? out.commit.sha.slice(0, 7) : "?")
      );
      log("info", "O site atualiza sozinho em ~1 minuto.");
      toast("Publicado com sucesso 🎉");
      render();
    } catch (e) {
      log("err", "Erro: " + e.message);
      toast("Erro ao publicar: " + e.message, true);
    } finally {
      publishing = false;
      const b2 = $("#aPub");
      if (b2) {
        b2.disabled = false;
        b2.textContent = "🚀 Publicar agora";
      }
    }
  }

  function download() {
    const blob = new Blob([serialize()], { type: "text/javascript;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "menu-data.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 3000);
    toast("Arquivo menu-data.js baixado.");
  }

  /* ============================================================
     FOTOS — otimização e envio
     ============================================================ */

  function optimizeImage(file) {
    return new Promise(function (resolve, reject) {
      const fr = new FileReader();
      fr.onerror = function () {
        reject(new Error("Não consegui ler o arquivo."));
      };
      fr.onload = function () {
        const img = new Image();
        img.onerror = function () {
          reject(new Error("Imagem inválida."));
        };
        img.onload = function () {
          try {
            const maxDim = 1600;
            let w = img.naturalWidth;
            let h = img.naturalHeight;
            const scale = Math.min(1, maxDim / Math.max(w, h));
            w = Math.max(1, Math.round(w * scale));
            h = Math.max(1, Math.round(h * scale));
            const cv = document.createElement("canvas");
            cv.width = w;
            cv.height = h;
            cv.getContext("2d").drawImage(img, 0, 0, w, h);
            resolve(cv.toDataURL("image/jpeg", 0.85));
          } catch (e) {
            reject(e instanceof Error ? e : new Error("Não consegui processar a imagem."));
          }
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  async function putImage(path, dataUrl) {
    const b64 = dataUrl.split(",")[1];
    let sha;
    const g = await fetch(API + path, { headers: authHeaders() });
    if (g.ok) {
      sha = (await g.json()).sha;
    } else if (g.status !== 404) {
      throw new Error("HTTP " + g.status + " ao verificar " + path);
    }
    const r = await fetch(API + path, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        message: "Painel: foto " + path,
        content: b64,
        sha: sha,
      }),
    });
    if (!r.ok) {
      let msg = "HTTP " + r.status;
      try {
        const j = await r.json();
        if (j.message) msg += " — " + j.message;
      } catch (e) {}
      throw new Error(msg);
    }
  }

  async function handleFiles(fileList, kind) {
    if (!token) {
      toast("Salve o token na aba Publicar para enviar fotos.", true);
      tab = "publicar";
      render();
      return;
    }
    const files = Array.prototype.slice.call(fileList, 0, 8);
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        toast("Otimizando " + f.name + "…");
        const dataUrl = await optimizeImage(f);
        let name;
        if (kind === "hero") {
          name = "hero-pizza.jpg";
        } else if (kind.indexOf("cat:") === 0) {
          const cp = kind.slice(4);
          const c = getByPath(cp) || {};
          name = "cat-" + slug(c.id || cp.replace(/\./g, "-")) + ".jpg";
        } else {
          const base = slug(String(f.name).replace(/\.[^.]+$/, ""));
          name = base + ".jpg";
        }
        await putImage("img/" + name, dataUrl);
        if (kind === "hero") {
          log("ok", "Foto de capa atualizada: img/" + name);
        } else if (kind.indexOf("cat:") === 0) {
          setPath(kind.slice(4) + ".img", "img/" + name);
          saveDraft();
          log("ok", "Foto da seção atualizada: img/" + name);
        } else {
          D.gallery.push({
            src: "img/" + name,
            alt: String(f.name)
              .replace(/\.[^.]+$/, "")
              .replace(/[-_]+/g, " "),
          });
          saveDraft();
          log("ok", "Foto enviada e adicionada à galeria: img/" + name);
        }
        toast("Foto enviada ✓");
      } catch (e) {
        log("err", f.name + ": " + e.message);
        toast("Erro na foto: " + e.message, true);
      }
    }
    render();
  }

  /* ============================================================
     EVENTOS
     ============================================================ */

  function onInput(e) {
    const el = e.target;
    if (el.dataset.special) {
      const parts = waParts();
      if (el.dataset.special === "wa-num") {
        parts.num = String(el.value).replace(/\D/g, "");
      } else {
        parts.text = el.value;
      }
      D.brand.whatsappUrl =
        "https://wa.me/" +
        parts.num +
        (parts.text ? "?text=" + encodeURIComponent(parts.text) : "");
      saveDraft();
      return;
    }
    const path = el.dataset.path;
    if (!path) return;
    setPath(path, el.dataset.num ? toNum(el.value) : el.value);
    saveDraft();
  }

  function onClick(e) {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    const path = btn.dataset.path;
    const i = parseInt(btn.dataset.i, 10);

    switch (act) {
      case "add-flavor": {
        const cat = getByPath(path);
        cat.flavors = cat.flavors || [];
        const f =
          path === "calzones"
            ? { name: "", desc: "" }
            : { n: "", name: "", desc: "" };
        cat.flavors.push(f);
        break;
      }
      case "del-flavor":
        getByPath(path).flavors.splice(i, 1);
        break;
      case "add-aviso":
        getByPath(path).comingSoon = {
          title: "Novos sabores a caminho",
          text:
            "Estamos preparando novos sabores para esta categoria. Chame no WhatsApp ou no Instagram para conferir os disponíveis hoje.",
        };
        break;
      case "rm-aviso":
        delete getByPath(path).comingSoon;
        break;
      case "rm-catimg":
        delete getByPath(path).img;
        break;
      case "add-row":
        getByPath(path).push({ name: "", size: "", price: 0 });
        break;
      case "del-row":
        getByPath(path).splice(i, 1);
        break;
      case "add-group":
        D.drinks.push({
          id: "grupo-" + (D.drinks.length + 1),
          title: "Novo grupo",
          rows: [{ name: "", size: "", price: 0 }],
        });
        break;
      case "del-group":
        D.drinks.splice(i, 1);
        break;
      case "add-bflavor": {
        const inp = btn.parentElement.querySelector("input");
        const v = inp ? inp.value.trim() : "";
        if (!v) {
          if (inp) inp.focus();
          return;
        }
        getByPath(path).flavors.push(v);
        break;
      }
      case "del-bflavor":
        getByPath(path).flavors.splice(i, 1);
        break;
      case "add-bgroup":
        D.bordas.push({
          title: "Novo grupo de bordas",
          flavors: [],
          prices: { P: 0, M: 0, G: 0, GG: 0 },
        });
        break;
      case "del-bgroup":
        D.bordas.splice(i, 1);
        break;
      case "add-aperi":
        D.aperitivos.push({ name: "", size: "", price: 0 });
        break;
      case "del-aperi":
        D.aperitivos.splice(i, 1);
        break;
      case "add-most":
        D.mostOrdered.push({
          flavor: "",
          name: "",
          category: D.pizzas[0] ? D.pizzas[0].id : "simples",
        });
        break;
      case "del-most":
        D.mostOrdered.splice(i, 1);
        break;
      case "gal-move": {
        const dir = parseInt(btn.dataset.dir, 10);
        const j = i + dir;
        if (j < 0 || j >= D.gallery.length) return;
        const tmp = D.gallery[i];
        D.gallery[i] = D.gallery[j];
        D.gallery[j] = tmp;
        break;
      }
      case "gal-del":
        D.gallery.splice(i, 1);
        break;
      case "save-token": {
        const t = $("#aToken");
        token = t ? t.value.trim() : "";
        if (token) {
          storage.set(K_TOKEN, token);
          toast("Token salvo neste navegador.");
          log("ok", "Token salvo.");
        } else {
          storage.del(K_TOKEN);
          toast("Campo vazio — nenhum token salvo.", true);
        }
        return;
      }
      case "clear-token":
        token = "";
        storage.del(K_TOKEN);
        toast("Token removido.");
        render();
        return;
      case "publish":
        publish();
        return;
      case "download":
        download();
        return;
      case "discard":
        discardDraft();
        return;
      default:
        return;
    }
    saveDraft();
    render();
  }

  /* ---------------- boot ---------------- */

  function init() {
    $("#aTabs").addEventListener("click", function (e) {
      const b = e.target.closest(".a-tab");
      if (!b) return;
      tab = b.dataset.tab;
      render();
    });
    $("#aBannerBtn").addEventListener("click", discardDraft);

    const main = $("#aMain");
    main.addEventListener("input", onInput);
    main.addEventListener("click", onClick);
    main.addEventListener("change", function (e) {
      const el = e.target;
      if (el.dataset.up && el.files && el.files.length) {
        handleFiles(el.files, el.dataset.up);
      }
    });

    render();
    if (isDirty()) {
      toast("Rascunho recuperado deste navegador.");
    }
  }

  /* ---- boot ---- */
  init();
})();
