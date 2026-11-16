/* ============================================================
   LAYON'S PIZZARIA — DADOS DO CARDÁPIO
   ------------------------------------------------------------
   Para atualizar preços ou sabores, edite apenas este arquivo.
   Valores vigentes: cardápio 2026.
   ============================================================ */

const MENU = {
  brand: {
    name: "Layon's Pizzaria",
    short: "Layon's",
    year: "2026",
    instagram: "@layons.pizzaria",
    instagramUrl: "https://www.instagram.com/layons.pizzaria/",
    phone: "(99) 99162-0986",
    whatsappUrl:
      "https://wa.me/5599991620986?text=" +
      encodeURIComponent("Olá! Vim pelo cardápio digital da Layon's Pizzaria 🍕"),
    cards: "Aceitamos os cartões",
  },

  /* Faixas de tamanho — usadas em todas as categorias */
  sizes: [
    { key: "P", label: "Pequena" },
    { key: "M", label: "Média" },
    { key: "G", label: "Grande" },
    { key: "GG", label: "Extra Grande" },
  ],

  /* ------------------------------------------------------------
     COMBO — Calzone 200g + Batata frita + Refrigerante 350ml
     ------------------------------------------------------------ */
  combo: {
    title: "Combo da Casa",
    tagline: "O combo que mais sai — perfeito para dividir ou matar a fome",
    includes: [
      { name: "Calzone 200g", note: "escolha o sabor" },
      { name: "Batata frita", note: "porção crocante" },
      { name: "Refrigerante 350ml", note: "lata gelada" },
    ],
    prices: { P: 35, M: 39, G: 47, GG: 54 },
  },

  /* ------------------------------------------------------------
     MAIS PEDIDAS (destaque)
     ------------------------------------------------------------ */
  mostOrdered: [
    { flavor: "07", name: "Calabresa", category: "simples" },
    { flavor: "08", name: "Exótica", category: "simples" },
    { flavor: "32", name: "Calabresa Tocantinense", category: "especiais" },
    { flavor: "34", name: "Carne de Sol com Requeijão", category: "especiais" },
    { flavor: "40", name: "Strogonoff de Frango", category: "especiais" },
    { flavor: "53", name: "Lampião", category: "premium" },
  ],
};

/* ------------------------------------------------------------
   CALZONES — P 25,00 · M 29,00 · G 37,00 · GG 44,00
   ------------------------------------------------------------ */
MENU.calzones = {
  id: "calzones",
  eyebrow: "Recheio generoso",
  title: "Calzones",
  prices: { P: 25, M: 29, G: 37, GG: 44 },
  flavors: [
    { name: "Frango", desc: "Molho de tomate especial da casa, frango desfiado, muçarela, milho e orégano." },
    { name: "Mexicana", desc: "Molho de tomate especial da casa, muçarela, calabresa moída, pimentão, pimenta calabresa, milho e orégano." },
    { name: "Muçarela", desc: "Molho de tomate, muçarela, tomate e orégano." },
    { name: "Presunto", desc: "Molho de tomate especial da casa, muçarela, presunto, tomate e orégano." },
    { name: "Exótica", desc: "Molho de tomate especial da casa, muçarela, calabresa, banana, milho, creme de leite e orégano." },
    { name: "Calabresa", desc: "Molho de tomate especial da casa, muçarela, calabresa, cebola e orégano." },
    { name: "Carne de Sol", desc: "Molho de tomate especial da casa, carne de sol desfiada, muçarela, tomate e orégano." },
    { name: "Americana", desc: "Molho de tomate especial da casa, muçarela, presunto, cebola, ovo, milho e orégano." },
    { name: "Araguatins", desc: "Molho de tomate especial da casa, muçarela, calabresa moída, tomate, requeijão cremoso, milho e orégano." },
    { name: "Toscana", desc: "Molho de tomate especial da casa, muçarela, calabresa moída, pimentão, milho, ovos e orégano." },
    { name: "Três Queijos", desc: "Molho de tomate especial da casa, muçarela, requeijão cremoso e cheddar cremoso." },
    { name: "Romana", desc: "Molho de tomate especial da casa, muçarela, calabresa moída, tomate, alho frito e orégano." },
    { name: "Strogonoff de Frango", desc: "Molho de tomate especial da casa, strogonoff de frango, muçarela, milho, orégano e batata palha." },
    { name: "Frango com Requeijão", desc: "Muçarela, frango desfiado, requeijão cremoso e orégano." },
    { name: "Frango Cheddar", desc: "Muçarela, frango desfiado, cheddar cremoso e orégano." },
    { name: "Portuguesa", desc: "Muçarela, presunto, calabresa, cebola, pimentão e orégano." },
    { name: "Calabresa Picante", desc: "Muçarela, calabresa, pimenta calabresa, cebola e orégano." },
    { name: "Carne de Sol com Requeijão", desc: "Carne de sol desfiada, muçarela, tomate, requeijão cremoso e orégano." },
  ],
};

/* ------------------------------------------------------------
   PIZZAS SIMPLES — P 39,00 · M 48,00 · G 57,00 · GG 67,00
   ------------------------------------------------------------ */
MENU.pizzas = [];

MENU.pizzas.push({
  id: "simples",
  eyebrow: "Clássicas da casa",
  title: "Pizzas Simples",
  prices: { P: 39, M: 48, G: 57, GG: 67 },
  flavors: [
    { n: "01", name: "Americana", desc: "Molho de tomate especial da casa, muçarela, presunto, cebola, ovo, milho e orégano." },
    { n: "02", name: "Araguatins", desc: "Molho de tomate especial da casa, muçarela, calabresa moída, tomate, requeijão cremoso, milho e orégano." },
    { n: "03", name: "Baiana", desc: "Molho de tomate especial da casa, muçarela, calabresa moída, pimenta calabresa e orégano." },
    { n: "04", name: "Batata Frita", desc: "Molho de tomate especial da casa, muçarela, batata frita e orégano." },
    { n: "05", name: "Batata Frita com Barbecue", desc: "Molho de tomate especial da casa, muçarela, batata frita, barbecue e orégano." },
    { n: "07", name: "Calabresa", desc: "Molho de tomate especial da casa, muçarela, calabresa, cebola e orégano." },
    { n: "08", name: "Exótica", desc: "Molho de tomate especial da casa, muçarela, calabresa, banana, milho, creme de leite e orégano." },
    { n: "09", name: "Frango", desc: "Molho de tomate especial da casa, frango desfiado, muçarela, milho e orégano." },
    { n: "10", name: "Frango Simples", desc: "Molho de tomate especial da casa, frango desfiado, muçarela, creme de leite, milho e orégano." },
    { n: "11", name: "Marguerita", desc: "Molho de tomate especial da casa, muçarela, tomate, manjericão e orégano." },
    { n: "12", name: "Mexicana", desc: "Molho de tomate especial da casa, muçarela, calabresa moída, pimentão, pimenta calabresa, milho e orégano." },
    { n: "13", name: "Muçarela", desc: "Molho de tomate, muçarela, tomate e orégano." },
    { n: "14", name: "Presunto", desc: "Molho de tomate especial da casa, muçarela, presunto, tomate e orégano." },
    { n: "15", name: "Romana", desc: "Molho de tomate especial da casa, muçarela, calabresa moída, tomate, alho frito, manjericão e orégano." },
    { n: "16", name: "Toscana", desc: "Molho de tomate especial da casa, muçarela, calabresa moída, pimentão, milho, ovos e orégano." },
    { n: "17", name: "Três Queijos", desc: "Molho de tomate especial da casa, muçarela, requeijão cremoso, cheddar cremoso, orégano e azeitona." },
  ],
});

/* ------------------------------------------------------------
   PIZZAS TRADICIONAIS — P 41,00 · M 50,00 · G 61,00 · GG 69,00
   ------------------------------------------------------------ */
MENU.pizzas.push({
  id: "tradicionais",
  eyebrow: "Sempre bem pedidas",
  title: "Pizzas Tradicionais",
  prices: { P: 41, M: 50, G: 61, GG: 69 },
  flavors: [
    { n: "18", name: "Bacon Tradicional", desc: "Molho de tomate especial da casa, muçarela, tomate, bacon em tiras e orégano." },
    { n: "19", name: "Batata Frita com Calabresa", desc: "Molho de tomate especial da casa, muçarela, calabresa, batata frita e orégano." },
    { n: "20", name: "Calabrúxa", desc: "Molho de tomate especial da casa, banana, muçarela, calabresa, cebola, cream cheese e orégano." },
    { n: "21", name: "Cinco Queijos", desc: "Molho de tomate especial da casa, muçarela, provolone, requeijão cremoso, cheddar, cream cheese e orégano." },
    { n: "22", name: "Fralho", desc: "Molho de tomate especial da casa, muçarela, frango desfiado, tomate, milho, alho frito e orégano." },
    { n: "23", name: "Fralho Cheese", desc: "Molho de tomate especial da casa, muçarela, frango desfiado, tomate, milho, alho frito, cream cheese e orégano." },
    { n: "24", name: "Frango Requeijão", desc: "Molho de tomate especial da casa, frango desfiado, muçarela, milho, requeijão cremoso e orégano." },
    { n: "25", name: "Frango Cheddar", desc: "Molho de tomate especial da casa, frango desfiado, muçarela, milho, cheddar e orégano." },
    { n: "26", name: "Frango Cheese", desc: "Molho de tomate especial da casa, frango desfiado, muçarela, milho, cream cheese e orégano." },
    { n: "27", name: "Havanna", desc: "Molho de tomate especial da casa, muçarela, tomate, bacon em tiras, cheddar, milho e orégano." },
    { n: "28", name: "Quatro Queijos", desc: "Molho de tomate especial da casa, muçarela, provolone, cheddar, requeijão cremoso e orégano." },
    { n: "29", name: "Portuguesa", desc: "Molho de tomate especial da casa, muçarela, presunto, calabresa, tomate, cebola, pimentão, milho, ovo em rodelas e orégano." },
  ],
});

/* ------------------------------------------------------------
   PIZZAS ESPECIAIS — P 43,00 · M 57,00 · G 66,00 · GG 72,00
   ------------------------------------------------------------ */
MENU.pizzas.push({
  id: "especiais",
  eyebrow: "Sabor de outro nível",
  title: "Pizzas Especiais",
  prices: { P: 43, M: 57, G: 66, GG: 72 },
  flavors: [
    { n: "30", name: "Bacon Especial", desc: "Molho de tomate especial da casa, muçarela, bacon em tiras e orégano." },
    { n: "31", name: "Batata Frita com Bacon", desc: "Molho de tomate especial da casa, muçarela, bacon em tiras, batata frita e orégano." },
    { n: "32", name: "Calabresa Tocantinense", desc: "Molho de tomate especial da casa, muçarela, calabresa, bacon em tiras, milho e orégano." },
    { n: "33", name: "Carne de Sol", desc: "Molho de tomate especial da casa, carne de sol desfiada, muçarela, tomate e orégano." },
    { n: "34", name: "Carne de Sol com Requeijão", desc: "Molho de tomate especial da casa, carne de sol desfiada, muçarela, tomate, requeijão cremoso e orégano." },
    { n: "35", name: "Carne de Sol com Cheddar", desc: "Molho de tomate especial da casa, carne de sol desfiada, muçarela, tomate, cheddar e orégano." },
    { n: "36", name: "Família", desc: "Molho de tomate especial da casa, banana, carne de sol, muçarela, milho, creme de leite e orégano." },
    { n: "37", name: "Frango Requeijão Especial", desc: "Molho de tomate especial da casa, frango desfiado, muçarela, milho, requeijão cremoso, palmito e orégano." },
    { n: "38", name: "Lombinho", desc: "Molho de tomate especial da casa, muçarela, lombo, milho, cebola e orégano." },
    { n: "39", name: "Peito de Peru", desc: "Molho de tomate especial da casa, muçarela, peito de peru, tomate, cebola, milho e orégano." },
    { n: "40", name: "Strogonoff de Frango", desc: "Molho de tomate especial da casa, strogonoff de frango, muçarela, milho, orégano e batata palha." },
    { n: "41", name: "Nordestina", desc: "Molho de tomate especial da casa, carne de sol desfiada, muçarela, tomate, pimentão, milho, alho frito e orégano." },
    { n: "42", name: "Paulista", desc: "Molho de tomate especial da casa, muçarela, frango desfiado, calabresa, cream cheese, milho, cebola e orégano." },
    { n: "43", name: "Tocantins", desc: "Molho de tomate especial da casa, muçarela, frango desfiado, presunto, bacon em tiras, tomate e orégano." },
  ],
});

/* ------------------------------------------------------------
   PIZZAS PREMIUM — P 47,00 · M 61,00 · G 70,00 · GG 76,00
   ------------------------------------------------------------ */
MENU.pizzas.push({
  id: "premium",
  eyebrow: "Ingredientes selecionados",
  title: "Pizzas Premium",
  prices: { P: 47, M: 61, G: 70, GG: 76 },
  flavors: [
    { n: "44", name: "Bacon Premium", desc: "Molho de tomate especial da casa, muçarela, tomate, bacon em tiras, milho, catupiry original e orégano." },
    { n: "45", name: "Bacon Barbecue", desc: "Molho especial da casa, muçarela, tomate, bacon em tiras, molho barbecue, catupiry original e orégano." },
    { n: "46", name: "Carne de Sol com Catupiry Original", desc: "Molho de tomate, carne de sol desfiada, muçarela, tomate, catupiry original e orégano." },
    { n: "47", name: "Carne de Sol com Cheese", desc: "Molho de tomate especial da casa, carne de sol desfiada, muçarela, tomate, palmito, cream cheese e orégano." },
    { n: "48", name: "Carne de Sol Especial Premium", desc: "Molho de tomate, carne de sol, muçarela, tomate, palmito, catupiry original e orégano." },
    { n: "49", name: "Do Chefe", desc: "Molho de tomate especial da casa, muçarela, peito de peru, salame em rodelas, tomate, cebola, requeijão cremoso e orégano." },
    { n: "50", name: "Frango Premium", desc: "Molho de tomate especial da casa, frango desfiado, muçarela, barbecue, milho, palmito e orégano." },
    { n: "51", name: "Frango com Catupiry Original", desc: "Molho de tomate especial da casa, frango desfiado, muçarela, palmito, catupiry original, milho e orégano." },
    { n: "52", name: "Frango Cheese Premium", desc: "Molho de tomate especial da casa, frango desfiado, muçarela, milho, palmito, cream cheese e orégano." },
    { n: "53", name: "Lampião", desc: "Molho de tomate especial da casa, carne de sol desfiada, muçarela, abacaxi, cebola, cream cheese e orégano." },
    { n: "54", name: "Lombinho Premium", desc: "Molho de tomate especial da casa, muçarela, lombo, milho, cebola, palmito, catupiry original e orégano." },
    { n: "55", name: "Peito de Peru Premium", desc: "Molho de tomate especial da casa, muçarela, peito de peru, tomate, cebola, milho, palmito, catupiry original e orégano." },
  ],
});

/* ------------------------------------------------------------
   PIZZAS PREMIUM ESPECIAIS (NOVA CATEGORIA)
   P 55,00 · M 65,00 · G 77,00 · GG 90,00
   Envia a lista de sabores para eu adicionar aqui.
   ------------------------------------------------------------ */
MENU.pizzas.push({
  id: "premium-especiais",
  eyebrow: "Novidade",
  title: "Pizzas Premium Especiais",
  prices: { P: 55, M: 65, G: 77, GG: 90 },
  comingSoon: {
    title: "Novos sabores a caminho",
    text: "Estamos preparando criações exclusivas para a categoria Premium Especiais. Chame no WhatsApp ou no Instagram para conferir os sabores disponíveis hoje.",
  },
  flavors: [],
});

/* ------------------------------------------------------------
   PIZZAS DOCES — P 39,00 · M 48,00 · G 57,00 · GG 67,00
   ------------------------------------------------------------ */
MENU.pizzas.push({
  id: "doces",
  eyebrow: "Para fechar com doçura",
  title: "Pizzas Doces",
  prices: { P: 39, M: 48, G: 57, GG: 67 },
  flavors: [
    { n: "56", name: "Abacaxi", desc: "Creme de leite, muçarela, abacaxi, canela em pó e leite condensado." },
    { n: "57", name: "Banana", desc: "Creme de leite, muçarela, banana, canela e leite condensado." },
    { n: "58", name: "Brigadeiro", desc: "Creme de leite, muçarela, chocolate e granulado de chocolate." },
    { n: "59", name: "Chocolate", desc: "Creme de leite, muçarela e chocolate." },
    { n: "60", name: "Chocolate com Banana", desc: "Creme de leite, muçarela, banana e chocolate." },
    { n: "61", name: "Disquete", desc: "Creme de leite, muçarela, chocolate e disquete." },
    { n: "62", name: "Doce de Leite", desc: "Creme de leite, muçarela e doce de leite." },
    { n: "63", name: "Prestígio", desc: "Creme de leite, muçarela, chocolate, coco ralado, cereja e leite condensado." },
    { n: "64", name: "Romeu & Julieta", desc: "Creme de leite, muçarela, requeijão cremoso e goiabada." },
    { n: "65", name: "Bananada", desc: "Creme de leite, muçarela, banana e goiabada." },
    { n: "66", name: "Chocolate com Abacaxi", desc: "Creme de leite, muçarela, chocolate e abacaxi." },
    { n: "67", name: "Banana Cheese", desc: "Creme de leite, muçarela, banana, cream cheese e canela em pó." },
  ],
});

/* ------------------------------------------------------------
   BORDAS RECHEADAS (preços mantidos do cardápio anterior)
   ------------------------------------------------------------ */
MENU.bordas = [
  {
    title: "Bordas Simples",
    flavors: ["Requeijão", "Requeijão Picante", "Cheddar", "Cheddar Picante"],
    prices: { P: 6, M: 6, G: 10, GG: 10 },
  },
  {
    title: "Bordas Doces",
    flavors: ["Doce de Leite", "Chocolate"],
    prices: { P: 12, M: 12, G: 15, GG: 15 },
  },
  {
    title: "Bordas Especiais",
    flavors: ["Catupiry Original", "Catupiry Original Picante", "Cream Cheese"],
    prices: { P: 14, M: 14, G: 18, GG: 18 },
  },
];

/* ------------------------------------------------------------
   APERITIVOS (preço mantido)
   ------------------------------------------------------------ */
MENU.aperitivos = [{ name: "Batata Frita", size: "350g", price: 17 }];

/* ------------------------------------------------------------
   BEBIDAS — preços novos
   ------------------------------------------------------------ */
MENU.drinks = [
  {
    id: "refri-2l",
    title: "Refrigerantes 2L",
    rows: [
      { name: "Guaraná Antarctica", size: "2L", price: 14 },
      { name: "Coca-Cola", size: "2L", price: 17 },
      { name: "Fanta", size: "2L", price: 17 },
      { name: "Coca-Cola Zero", size: "2L", price: 17 },
    ],
  },
  {
    id: "refri-1l",
    title: "Refrigerantes 1L",
    rows: [
      { name: "Guaraná Antarctica", size: "1L", price: 11 },
      { name: "Coca-Cola", size: "1L", price: 11 },
      { name: "Fanta", size: "1L", price: 11 },
      { name: "Coca-Cola Zero", size: "1L", price: 11 },
    ],
  },
  {
    id: "refri-lata",
    title: "Refrigerantes em Lata",
    note: "Todos os sabores — 350ml",
    rows: [
      { name: "Guaraná Antarctica", size: "350ml", price: 7 },
      { name: "Coca-Cola", size: "350ml", price: 7 },
      { name: "Coca-Cola Zero", size: "350ml", price: 7 },
      { name: "Fanta", size: "350ml", price: 7 },
      { name: "Sprite", size: "350ml", price: 7 },
    ],
  },
  {
    id: "agua",
    title: "Água Mineral",
    rows: [
      { name: "Água mineral sem gás", size: "500ml", price: 4 },
      { name: "Água mineral com gás", size: "500ml", price: 5 },
    ],
  },
  {
    id: "sucos",
    title: "Sucos Naturais",
    note: "Acerola · Goiaba · Maracujá · Cajá · Laranja",
    rows: [
      { name: "Suco no copo", size: "300ml", price: 10 },
      { name: "Suco na jarra", size: "1L", price: 19 },
    ],
  },
  {
    id: "energeticos",
    title: "Energéticos",
    note: "Todos os energéticos — 473ml",
    rows: [
      { name: "Monster Energy", size: "473ml", price: 15 },
      { name: "Monster Ultra", size: "473ml", price: 15 },
    ],
  },
];

/* ------------------------------------------------------------
   CERVEJAS (preços mantidos do cardápio anterior)
   ------------------------------------------------------------ */
MENU.beers = {
  title: "Cervejas",
  rows: [
    { name: "Brahma", size: "Lata 269ml", price: 4 },
    { name: "Brahma", size: "Long Neck", price: 7 },
    { name: "Brahma", size: "Garrafa 600ml", price: 10 },
    { name: "Budweiser", size: "Long Neck", price: 7 },
    { name: "Corona", size: "Long Neck", price: 10 },
    { name: "Tiger", size: "Lata 350ml", price: 5 },
  ],
};
