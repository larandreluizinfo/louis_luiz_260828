// Max e Robin: Aventura no Mercado — jogo kid-friendly (8 a 15 anos)
// Sem armas/violência. Comprar/vender: cartas Pokémon, chips de jogos, ursinhos.
// Mapa: ruas paralelas + rotatórias + casas + prédios + mercado central.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hudEl = document.getElementById('hud');
const msgEl = document.getElementById('msg');
const lojaEl = document.getElementById('loja');

const ITENS = {
  carta:   { nome: 'Carta Pokémon', emoji: '🃏', compra: 10, venda: 16 },
  chip:    { nome: 'Chip de Jogo', emoji: '🎮', compra: 25, venda: 38 },
  ursinho: { nome: 'Ursinho', emoji: '🧸', compra: 40, venda: 60 },
};
const SUCO_PRECO = 5;
const BIKE_NOMES = ['Bike Azul', 'Bike Vermelha'];

let G = null;
let hero = 'max';
const HEROS = {
  max: { nome: 'Max', cor: '#0b7cff', emoji: '🧢' },
  robin: { nome: 'Robin', cor: '#ff5fa2', emoji: '🎒' },
};

function setHero(h) {
  hero = h;
  document.getElementById('heroSel').innerHTML = 'Herói: <b>' + HEROS[h].nome + '</b>';
  msg('Você escolheu ' + HEROS[h].nome + '! Clique em Jogar!');
}
function msg(t) { msgEl.textContent = t; }

function startGame() {
  G = novoJogo(hero);
  lojaEl.style.display = 'none';
  msg('Bem-vindo ao Mercado, ' + HEROS[hero].nome + '! Siga a missão 🎯. Aperte F para falar e comprar.');
  requestAnimationFrame(loop);
}

function novoJogo(heroKey) {
  return {
    hero: heroKey, amigo: heroKey === 'max' ? 'robin' : 'max',
    px: 700, py: 1050, vx: 0, vy: 0, dir: 0,
    moedas: 50, energia: 100, sucos: 2,
    inv: { carta: 1, chip: 0, ursinho: 0 },
    missao: 0, tempo: 0, dia: 0.35,
    naBike: null, entregas: 0,
    bikes: [
      { nome: BIKE_NOMES[0], x: 640, y: 1120, vel: 0, dir: 0, cor: '#2196f3' },
      { nome: BIKE_NOMES[1], x: 780, y: 1120, vel: 0, dir: 0, cor: '#e53935' },
    ],
    npc: [
      { x: 500, y: 620, t: 0 }, { x: 900, y: 600, t: 2 }, { x: 700, y: 750, t: 4 },
      { x: 1100, y: 500, t: 1 }, { x: 300, y: 900, t: 3 },
    ],
    missoes: [
      'Vá ao MERCADO e fale com a banca de Carta Pokémon (aperte F).',
      'Compre 1 Chip de Jogo na banca 🎮 do mercado.',
      'Venda 1 Carta Pokémon numa CASA AZUL (bairro) por lucro.',
      'Pegue a BIKE e entregue 1 Ursinho no PRÉDIO AMARELO.',
      'Complete a coleção: tenha 3 cartas + 2 chips + 1 ursinho. Você venceu! 🏆',
    ],
  };
}

// ---- MAPA ----
const RUAS_V = [300, 700, 1100, 1500];       // ruas paralelas verticais
const RUAS_H = [300, 800, 1300];             // ruas horizontais
const ROTATORIAS = [{ x: 700, y: 800, r: 70 }, { x: 1100, y: 800, r: 70 }];
const MERCADO = { x: 520, y: 420, w: 360, h: 240, nome: 'MERCADÃO' };
const BANCAS = [
  { id: 'carta', x: 550, y: 450, w: 90, h: 60, cor: '#ffd54f', titulo: '🃏 Cartas' },
  { id: 'chip', x: 680, y: 450, w: 90, h: 60, cor: '#90caf9', titulo: '🎮 Chips' },
  { id: 'ursinho', x: 810 - 40, y: 450, w: 90, h: 60, cor: '#f8bbd0', titulo: '🧸 Ursinhos' },
];
const CASAS = [
  { x: 150, y: 400, w: 90, h: 70, cor: '#64b5f6', nome: 'Casa Azul' },
  { x: 150, y: 900, w: 90, h: 70, cor: '#64b5f6', nome: 'Casa Azul 2' },
  { x: 1250, y: 400, w: 90, h: 70, cor: '#a5d6a7', nome: 'Casa Verde' },
  { x: 1250, y: 950, w: 90, h: 70, cor: '#ffcc80', nome: 'Casa Laranja' },
];
const PREDIOS = [
  { x: 850, y: 150, w: 120, h: 90, cor: '#ffe082', nome: 'Prédio Amarelo' },
  { x: 350, y: 1050, w: 130, h: 100, cor: '#ce93d8', nome: 'Prédio Roxo' },
  { x: 1250, y: 1050, w: 130, h: 100, cor: '#b0bec5', nome: 'Prédio Cinza' },
];
const PARQUE = { x: 850, y: 950, w: 200, h: 120 };

function colide(x, y) {
  for (const b of [...BANCAS, ...CASAS, ...PREDIOS]) {
    if (x > b.x - 10 && x < b.x + b.w + 10 && y > b.y - 10 && y < b.y + b.h + 10) return true;
  }
  return false;
}
function perto(o, x, y, d) { return Math.hypot(o.x + (o.w || 0) / 2 - x, o.y + (o.h || 0) / 2 - y) < d; }

// ---- input ----
const keys = {};
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (!G) return;
  if (k === 'f') interagir();
  if (k === 'q') { if (G.naBike) { G.naBike = null; msg('Você desceu da bike.'); } }
  if (k === 'e') tomarSuco();
  if (k === 'm') msg('🎯 Missão: ' + G.missoes[Math.min(G.missao, G.missoes.length - 1)]);
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

function tomarSuco() {
  if (G.sucos <= 0) { msg('Sem suco! Compre no mercado por R$5 (aperte F na banca).'); return; }
  if (G.energia > 95) { msg('Energia cheia!'); return; }
  G.sucos--; G.energia = 100;
  msg('🧃 Suco delicioso! Energia cheia para correr e pedalar.');
}

function interagir() {
  // bike próxima?
  if (!G.naBike) {
    for (const b of G.bikes) {
      if (Math.hypot(b.x - G.px, b.y - G.py) < 45) { G.naBike = b; lojaEl.style.display = 'none'; msg('🚲 Subiu na ' + b.nome + '! Q para descer.'); return; }
    }
  }
  // banca?
  for (const b of BANCAS) {
    if (perto(b, G.px, G.py, 80)) { abrirLoja(b.id); return; }
  }
  // casa/prédio = vender com lucro
  for (const c of [...CASAS, ...PREDIOS]) {
    if (perto(c, G.px, G.py, 90)) { abrirVenda(c.nome); return; }
  }
  // amigo NPC
  msg('Explore: MERCADO no centro, casas coloridas, prédios, rotatórias e bikes! 🌳');
}

function abrirLoja(tipo) {
  const it = ITENS[tipo];
  let html = `<b>${it.emoji} Banca: ${it.nome}</b> — Moedas: 🪙${G.moedas}<br>`;
  html += `<button onclick="comprarItem('${tipo}')">Comprar 1 por 🪙${it.compra}</button>`;
  html += `<button onclick="comprarSuco()">🧃 Suco 🪙${SUCO_PRECO} (energia)</button>`;
  html += `<button onclick="fecharLoja()">Fechar</button>`;
  html += `<br><small>Você tem: 🃏${G.inv.carta} 🎮${G.inv.chip} 🧸${G.inv.ursinho} | Sucos: ${G.sucos}</small>`;
  lojaEl.innerHTML = html; lojaEl.style.display = 'block';
}
function abrirVenda(local) {
  let html = `<b>🏠 ${local}</b> — vizinhos adoram colecionáveis! Moedas: 🪙${G.moedas}<br>`;
  for (const k of Object.keys(ITENS)) {
    const it = ITENS[k];
    html += `<button onclick="venderItem('${k}')">Vender ${it.emoji} ${it.nome} por 🪙${it.venda} (tem ${G.inv[k]})</button>`;
  }
  html += `<button onclick="fecharLoja()">Fechar</button>`;
  lojaEl.innerHTML = html; lojaEl.style.display = 'block';
}
window.comprarItem = function (tipo) {
  const it = ITENS[tipo];
  if (G.moedas < it.compra) { msg('Moedas insuficientes! Venda algo nas casas.'); return; }
  G.moedas -= it.compra; G.inv[tipo]++;
  msg('Comprou ' + it.emoji + ' ' + it.nome + '!');
  checarMissao(); abrirLoja(tipo);
};
window.comprarSuco = function () {
  if (G.moedas < SUCO_PRECO) { msg('Sem moedas para o suco.'); return; }
  G.moedas -= SUCO_PRECO; G.sucos++; msg('Comprou 🧃 suco!');
};
window.venderItem = function (tipo) {
  const it = ITENS[tipo];
  if (G.inv[tipo] <= 0) { msg('Você não tem ' + it.nome + '.'); return; }
  G.inv[tipo]--; G.moedas += it.venda;
  msg('Vendeu ' + it.emoji + ' com lucro de 🪙' + (it.venda - it.compra) + '!');
  checarMissao(); fecharLoja();
};
window.fecharLoja = function () { lojaEl.style.display = 'none'; };

function checarMissao() {
  const m = G.missao;
  if (m === 0 && (G.inv.carta >= 1)) { G.missao = 1; msg('Missão 1 ok! 🎉 ' + G.missoes[1]); }
  else if (m === 1 && G.inv.chip >= 1) { G.missao = 2; G.moedas += 10; msg('Missão 2 ok! +🪙10. ' + G.missoes[2]); }
  else if (m === 2 && G.moedas >= 60) { G.missao = 3; G.moedas += 15; msg('Missão 3 ok! +🪙15. ' + G.missoes[3]); }
  else if (m === 3 && G.inv.ursinho >= 0 && G.naBike) { G.entregas++; if (G.entregas >= 1 && G.inv.ursinho >= 1) { G.missao = 4; G.moedas += 20; msg('Entrega feita! +🪙20. ' + G.missoes[4]); } }
  if (G.missao === 4 && G.inv.carta >= 3 && G.inv.chip >= 2 && G.inv.ursinho >= 1) {
    G.missao = 5; msg('🏆 VOCÊ VENCEU! Coleção completa com Max e Robin!');
  }
}

// ---- update/draw ----
let camX = 0, camY = 0;
function update(dt) {
  G.tempo += dt; G.dia = (0.35 + G.tempo * 0.004) % 1;
  const correndo = keys['shift'] && G.energia > 0;
  const base = G.naBike ? 5.2 : (correndo ? 3.4 : 2.2);
  if (correndo || G.naBike) G.energia = Math.max(0, G.energia - dt * (G.naBike ? 2 : 5));
  else G.energia = Math.min(100, G.energia + dt * 3);

  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;
  const n = Math.hypot(dx, dy) || 1;
  // movimento suave realista (aceleração + atrito)
  G.vx = G.vx * 0.82 + (dx / n) * base * 0.35;
  G.vy = G.vy * 0.82 + (dy / n) * base * 0.35;
  const nx = G.px + G.vx * 3, ny = G.py + G.vy * 3;
  if (!colide(nx, ny)) { G.px = nx; G.py = ny; }
  else { G.vx *= 0.3; G.vy *= 0.3; }
  G.px = Math.max(20, Math.min(1680, G.px)); G.py = Math.max(20, Math.min(1480, G.py));
  if (Math.hypot(G.vx, G.vy) > 0.2) G.dir = Math.atan2(G.vy, G.vx);
  if (G.naBike) { G.naBike.x = G.px; G.naBike.y = G.py; G.naBike.dir = G.dir; }
  for (const p of G.npc) { p.t += dt; p.x += Math.cos(p.t * 0.7) * 0.6; p.y += Math.sin(p.t * 0.9) * 0.6; }
  if (G.energia <= 0) msg('Cansado! Tome um suco 🧃 (E) ou descanse no parque 🌳.');
  if (G.missao === 3 && G.inv.ursinho < 1) {
    // dica: comprar ursinho
  }
  camX += (G.px - 480 - camX) * 0.1;
  camY += (G.py - 300 - camY) * 0.1;
}

function loop() {
  if (!G) return;
  update(1 / 60); draw(); drawHUD();
  requestAnimationFrame(loop);
}

function draw() {
  // grama
  ctx.fillStyle = '#9ed48a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.translate(-camX, -camY);
  // ruas paralelas (asfalto)
  ctx.fillStyle = '#5b6067';
  for (const x of RUAS_V) ctx.fillRect(x - 30, 0, 60, 1500);
  for (const y of RUAS_H) ctx.fillRect(0, y - 30, 1700, 60);
  // faixas
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([14, 12]);
  for (const x of RUAS_V) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1500); ctx.stroke(); }
  for (const y of RUAS_H) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1700, y); ctx.stroke(); }
  ctx.setLineDash([]);
  // rotatórias
  for (const r of ROTATORIAS) {
    ctx.fillStyle = '#7a8087'; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 7); ctx.fill();
    ctx.fillStyle = '#7fbf6f'; ctx.beginPath(); ctx.arc(r.x, r.y, r.r - 22, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.fillText('ROTATÓRIA', r.x - 34, r.y + 4);
  }
  // parque
  ctx.fillStyle = '#6fbf5f'; ctx.fillRect(PARQUE.x, PARQUE.y, PARQUE.w, PARQUE.h);
  ctx.font = '20px Arial'; ctx.fillText('🌳🌳 PARQUE 🌳🌳', PARQUE.x + 20, PARQUE.y + 60);
  // mercado
  ctx.fillStyle = '#fff3d6'; ctx.fillRect(MERCADO.x, MERCADO.y, MERCADO.w, MERCADO.h);
  ctx.strokeStyle = '#ff8c42'; ctx.lineWidth = 4; ctx.strokeRect(MERCADO.x, MERCADO.y, MERCADO.w, MERCADO.h);
  ctx.fillStyle = '#a35400'; ctx.font = 'bold 16px Arial'; ctx.fillText('🛍️ MERCADÃO', MERCADO.x + 120, MERCADO.y - 8);
  for (const b of BANCAS) {
    ctx.fillStyle = b.cor; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = '#0b4f7c'; ctx.strokeRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = '#223'; ctx.font = 'bold 11px Arial'; ctx.fillText(b.titulo, b.x + 4, b.y + 34);
  }
  // casas e prédios
  for (const c of [...CASAS, ...PREDIOS]) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(c.x + 5, c.y + 6, c.w, c.h);
    ctx.fillStyle = c.cor; ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = '#0b4f7c'; ctx.lineWidth = 2; ctx.strokeRect(c.x, c.y, c.w, c.h);
    // telhado/janela realista simples
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(c.x + 10, c.y + 12, 20, 16); ctx.fillRect(c.x + c.w - 30, c.y + 12, 20, 16);
    ctx.fillStyle = '#223'; ctx.font = 'bold 11px Arial'; ctx.fillText(c.nome, c.x + 4, c.y - 5);
  }
  // bikes
  for (const b of G.bikes) {
    if (G.naBike === b) continue;
    ctx.save(); ctx.translate(b.x, b.y);
    ctx.fillStyle = b.cor; ctx.font = '22px Arial'; ctx.fillText('🚲', -12, 8);
    ctx.restore();
    ctx.fillStyle = '#223'; ctx.font = '10px Arial'; ctx.fillText(b.nome, b.x - 24, b.y - 16);
  }
  // NPCs amigos
  for (const p of G.npc) {
    ctx.font = '20px Arial'; ctx.fillText('🙂', p.x - 10, p.y + 8);
  }
  // amigo (Robin/Max) segue
  const fx = G.px - 34, fy = G.py + 10;
  ctx.font = '22px Arial'; ctx.fillText(HEROS[G.amigo].emoji, fx - 11, fy + 8);
  ctx.fillStyle = '#223'; ctx.font = '10px Arial'; ctx.fillText(HEROS[G.amigo].nome, fx - 12, fy - 14);
  // jogador Max/Robin
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(G.px, G.py + 12, 12, 5, 0, 0, 7); ctx.fill();
  if (G.naBike) { ctx.font = '26px Arial'; ctx.fillText('🚲', G.px - 13, G.py + 9); }
  ctx.save(); ctx.translate(G.px, G.py); ctx.rotate(0);
  ctx.font = '26px Arial'; ctx.fillText(HEROS[G.hero].emoji, -13, 9);
  ctx.restore();
  ctx.fillStyle = '#0b4f7c'; ctx.font = 'bold 11px Arial'; ctx.fillText(HEROS[G.hero].nome, G.px - 12, G.py - 18);
  ctx.restore();
  // dia/noite suave (realista, mas claro para crianças)
  const noite = Math.max(0, Math.cos(G.dia * Math.PI * 2)) * 0.18;
  if (noite > 0.02) { ctx.fillStyle = `rgba(10,20,60,${noite})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
}

function drawHUD() {
  let s = `<span>${HEROS[G.hero].emoji} ${HEROS[G.hero].nome} & ${HEROS[G.amigo].nome}</span>`;
  s += `<span>🪙 ${G.moedas}</span>`;
  s += `<span>🃏 ${G.inv.carta} | 🎮 ${G.inv.chip} | 🧸 ${G.inv.ursinho}</span>`;
  s += `<span>⚡ ${Math.round(G.energia)} | 🧃 ${G.sucos}</span>`;
  if (G.naBike) s += `<span>🚲 ${G.naBike.nome}</span>`;
  const mi = Math.min(G.missao, G.missoes.length - 1);
  s += `<br><span style="background:#fff3d6">🎯 Missão ${Math.min(G.missao + 1, 5)}/5: ${G.missoes[mi]}</span>`;
  hudEl.innerHTML = s;
}
