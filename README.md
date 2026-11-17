# 🍕 Layon's Pizzaria — Cardápio Digital

Cardápio digital da **Layon's Pizzaria** — responsivo, com busca por sabor, preços atualizados (2026) e link direto para WhatsApp/Instagram.

**Online em:** https://mueltec.github.io/layons-cardapio/

## 📁 Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Estrutura da página |
| `styles.css` | Estilos (tela + impressão/PDF) |
| `menu-data.js` | **Todo o conteúdo do cardápio** (preços e sabores) |
| `app.js` | Renderização, busca e navegação |
| `img/` | Fotos, miniaturas e logos (extraídos do cardápio original) |
| `cardapio-layons-2026.pdf` | Versão em PDF para imprimir/compartilhar |

## ✏️ Como atualizar preços ou sabores

Edite apenas o arquivo **`menu-data.js`** — não é preciso mexer em mais nada.

- **Preços de pizzas/calzones:** cada categoria tem um objeto `prices: { P, M, G, GG }`
- **Sabores:** cada categoria tem a lista `flavors: [{ n, name, desc }]`
- **Bebidas / cervejas / bordas:** listas `MENU.drinks`, `MENU.beers`, `MENU.bordas`
- **Fotos da galeria:** lista `MENU.gallery` (`src` + `alt`)
- **Contato:** objeto `MENU.brand` (WhatsApp, Instagram, telefone)

Depois é só salvar e fazer o push — o site atualiza sozinho.

## 🖨️ Gerar o PDF novamente

O PDF é gerado a partir do site (Chrome/Edge em modo headless):

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless=new --disable-gpu --no-pdf-header-footer `
  --print-to-pdf="cardapio-layons-2026.pdf" `
  "http://localhost:8765/"
```

(Suba um servidor local na pasta, por exemplo `python -m http.server 8765`)

## 🚀 Publicar atualizações

```bash
git add .
git commit -m "Atualiza cardápio"
git push
```

O GitHub Pages publica automaticamente a partir da branch `main`.

---

Feito com carinho para a Layon's Pizzaria · Cardápio 2026
