// Max e Amigos: A Cabana na Floresta — jogo kid-friendly (7 a 15 anos)
// Cinco amigos (Max, Noah, Luiza, Vitória e Matheus) numa cabana na floresta.
// Sem violência: colete frutinhas, cogumelos, ervas e madeira; faça geléia,
// sopa e casinhas de pássaro na garagem-oficina; ajude os bichinhos da mata.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hudEl = document.getElementById('hud');
const msgEl = document.getElementById('msg');
const lojaEl = document.getElementById('loja');

const ITENS = {
  fruta:   { nome: 'Frutinha', emoji: '🫐', energia: 20 },
  cogu:    { nome: 'Cogumelo', emoji: '🍄', energia: 10 },
  erva:    { nome: 'Erva', emoji: '🌿', energia: 5 },
  madeira: { nome: 'Madeira', emoji: '🪵', energia: 0 },
};
const FEITOS = {
  geleia:  { nome: 'Geléia', emoji: '🍓', energia: 45, custo: { fruta: 3 } },
  casinha: { nome: 'Casinha de Pássaro', emoji: '🐦', energia: 0, custo: { madeira: 2 } },
  sopa:    { nome: 'Sopa', emoji: '🍲', energia: 60, custo: { cogu: 1, erva: 1 } },
};
const GEL_PRECO = 8;
const CASA_PRECO = 15;

// --- OS 5 AMIGOS (todos jogáveis; os outros ficam na fogueira) ---
const BANDO = {
  max:     { nome: 'Max',     idade: 12, cor: '#ff7043', emoji: '👦', x: 515, y: 460,
             fala: 'Fala com a Mãe do Max e do Matheus 👩 para começar a nossa aventura!' },
  noah:    { nome: 'Noah',    idade: 11, cor: '#26c6da', emoji: '🧒', x: 760, y: 432,
             fala: 'Os arbustos vermelhos têm frutinhas 🫐 deliciosas!' },
  luiza:   { nome: 'Luiza',   idade: 11, cor: '#ec407a', emoji: '👧', x: 700, y: 568,
             fala: 'Na cozinha da cabana a gente faz geléia 🍓 e sopa 🍲!' },
  vitoria: { nome: 'Vitória', idade: 12, cor: '#ab47bc', emoji: '👧', x: 540, y: 568,
             fala: 'Dê comida aos bichinhos: cada amigo ganha ⭐ e 🪙10!' },
  matheus: { nome: 'Matheus', idade: 13, cor: '#66bb6a', emoji: '🧑', x: 828, y: 520,
             fala: 'A GARAGEM 🚗 virou oficina: 2 madeiras 🪵 fazem uma casinha 🐦!' },
};

// --- AS MÃES (ajudam e dão as missões) ---
const MAES = [
  { id: 'maeMax', nome: 'Mãe do Max e do Matheus', idade: 43, emoji: '👩', x: 600, y: 412, cor: '#8d6e63',
    fala: 'Que bom que vocês chegaram! Vão preparar um piquenique incrível e ainda ajudar os bichinhos da mata! 💚',
    tip: 'Aqui eu cuido das encomendas: vendo suas GELÉIAS 🍓 por 🪙' + GEL_PRECO + ' e CASINHAS 🐦 por 🪙' + CASA_PRECO + '.' },
  { id: 'maeNoah', nome: 'Mãe do Noah e da Luiza', idade: 42, emoji: '👩‍🦰', x: 715, y: 552, cor: '#e57373',
    fala: 'Na cozinha da CABANA 🏕️ fazemos geléia 🍓 de frutinhas e sopa 🍲 quentinha!',
    tip: 'Receita da Sopa: 1 cogumelo 🍄 + 1 erva 🌿. A geléia leva 3 frutinhas 🫐.' },
  { id: 'maeVitoria', nome: 'Mãe da Vitória', emoji: '👱‍♀️', x: 470, y: 480, cor: '#9575cd',
    fala: 'Essa floresta está cheia de amigos! Alimente os bichinhos com carinho e eles vão amar vocês. 💛',
    tip: 'Cada animal alimentado com a comida certa vira amigo: ⭐ e 🪙10!' },
];

let G = null;
let hero = 'max';

function setHero(h) {
  hero = h;
  document.getElementById('heroSel').innerHTML = 'Herói: <b>' + BANDO[h].nome + '</b>';
  msg('Você escolheu ' + BANDO[h].nome + '! Clique em Jogar!');
}
function msg(t) { msgEl.textContent = t; }

function startGame() {
  G = novoJogo(hero);
  lojaEl.style.display = 'none';
  msg('Bem-vindo(a) à cabana, ' + BANDO[hero].nome + '! Fale com a Mãe do Max e do Matheus 👩 (F) para começar.');
  requestAnimationFrame(loop);
}

function novoJogo(heroKey) {
  const b = BANDO[heroKey];
  return {
    hero: heroKey,
    px: b.x, py: b.y, vx: 0, vy: 0, dir: -Math.PI / 2,
    energia: 100, moedas: 0, amigos: 0,
    inv: { fruta: 0, cogu: 0, erva: 0, madeira: 0, geleia: 0, casinha: 0, sopa: 0 },
    fed: { pardal: false, esquilo: false, coelho: false, sapo: false, raposa: false },
    casinhaColocada: false,
    maeFalado: { maeMax: false, maeNoah: false, maeVitoria: false },
    missao: 0, tempo: 0, dia: 0.35, wonAt: -1,
    spTime: COLETA.map(() => -999),
    missoes: [
      'Fale com a Mãe do Max e do Matheus 👩 perto da CABANA (aperte F).',
      'Pegue 3 FRUTINHAS 🫐 nos arbustos vermelhos da floresta.',
      'Faça 1 GELÉIA 🍓 na cozinha da cabana (3 frutinhas).',
      'Na GARAGEM 🚗 faça 1 CASINHA DE PÁSSARO 🐦 (2 madeiras 🪵) e pendure na árvore do esquilo.',
      'Cozinhe SOPA 🍲 (1 cogumelo 🍄 + 1 erva 🌿) e dê para a raposinha 🦊. Você venceu! 🏆',
    ],
  };
}

// ---- MAPA ----
const CABANA = { x: 660, y: 220, w: 260, h: 170 };
const GARAGEM = { x: 350, y: 235, w: 210, h: 130 };
const FOGUEIRA = { x: 610, y: 500 };
const CASINHA_TREE = { x: 1120, y: 175 };

const COLETA = [
  { idx: 0, tipo: 'fruta',   nome: 'Arbusto vermelho',     x: 250,  y: 640,  qtd: 2, cd: 8 },
  { idx: 1, tipo: 'fruta',   nome: 'Arbusto da clareira',  x: 1350, y: 430,  qtd: 2, cd: 8 },
  { idx: 2, tipo: 'fruta',   nome: 'Arbusto da colina',    x: 1320, y: 640,  qtd: 2, cd: 8 },
  { idx: 3, tipo: 'cogu',    nome: 'Cogumelos do brejo',   x: 280,  y: 1180, qtd: 1, cd: 12 },
  { idx: 4, tipo: 'cogu',    nome: 'Cogumelos do bosque',  x: 900,  y: 1240, qtd: 1, cd: 12 },
  { idx: 5, tipo: 'cogu',    nome: 'Cogumelos do rochedo', x: 1480, y: 620,  qtd: 1, cd: 12 },
  { idx: 6, tipo: 'erva',    nome: 'Ervas do vale',        x: 320,  y: 900,  qtd: 1, cd: 12 },
  { idx: 7, tipo: 'erva',    nome: 'Ervas da campina',     x: 1260, y: 850,  qtd: 1, cd: 12 },
  { idx: 8, tipo: 'madeira', nome: 'Pilha de madeira',     x: 585,  y: 330,  qtd: 1, cd: 12 },
];

const ANIMAIS = [
  { id: 'pardal',  nome: 'Pardal',    emoji: '🐦', x: 300,  y: 690,  comida: 'fruta', pede: 'frutinhas 🫐 dos arbustos', fala: 'Piu-piu! Com frutinhas eu tenho energia para voar!' },
  { id: 'esquilo', nome: 'Esquilo',   emoji: '🐿️', x: 1290, y: 380,  comida: 'fruta', pede: 'frutinhas 🫐', fala: 'Guardo frutinhas na minha toca para o inverno!' },
  { id: 'coelho',  nome: 'Coelho',    emoji: '🐰', x: 1350, y: 900,  comida: 'erva',  pede: 'ervas 🌿 verdes', fala: 'As ervas deixam minha pelagem macia e fofa!' },
  { id: 'sapo',    nome: 'Sapo',      emoji: '🐸', x: 1390, y: 1280, comida: 'cogu',  pede: 'cogumelos 🍄', fala: 'Croac! Dica: a Sopa se faz com 1 cogumelo + 1 erva.' },
  { id: 'raposa',  nome: 'Raposinha', emoji: '🦊', x: 1560, y: 300,  comida: 'sopa',  pede: 'uma SOPA 🍲 quentinha', fala: 'Obrigada por cuidar de mim. Que a floresta te abrace!' },
];

const OBST = [CABANA, GARAGEM];
const ARV_SOLIDAS = [
  { x: 150, y: 250 }, { x: 260, y: 300 }, { x: 120, y: 450 }, { x: 180, y: 590 },
  { x: 880, y: 130 }, { x: 1050, y: 120 }, { x: 980, y: 300 }, { x: 940, y: 540 },
  { x: 1280, y: 250 }, { x: 1500, y: 300 }, { x: 1600, y: 420 },
  { x: 240, y: 780 }, { x: 330, y: 980 }, { x: 150, y: 1210 }, { x: 270, y: 1340 },
  { x: 520, y: 1390 }, { x: 1550, y: 1180 }, { x: 1620, y: 700 }, { x: 1430, y: 520 },
  { x: 1560, y: 450 }, { x: 410, y: 1240 }, { x: 1180, y: 600 },
];
const ARV_DECO = [
  { x: 80, y: 140 }, { x: 500, y: 60 }, { x: 1180, y: 60 }, { x: 1500, y: 130 },
  { x: 1640, y: 280 }, { x: 1650, y: 900 }, { x: 1600, y: 1050 }, { x: 1080, y: 1120 },
  { x: 820, y: 1320 }, { x: 640, y: 1420 }, { x: 420, y: 1410 }, { x: 180, y: 1390 },
  { x: 100, y: 1150 }, { x: 60, y: 800 }, { x: 360, y: 1180 },
];
const RIO = { y: 1045, h: 80, x1: 0, x2: 1700 };
const PONTE = { x: 680, x2: 1070 };
const LAGO = { x: 1520, y: 1280, rx: 120, ry: 78 };

function colide(x, y) {
  if (x < 25 || x > 1675 || y < 25 || y > 1475) return true;
  for (const o of OBST) {
    if (x > o.x - 10 && x < o.x + o.w + 10 && y > o.y - 10 && y < o.y + o.h + 10) return true;
  }
  for (const t of ARV_SOLIDAS) {
    if (Math.hypot(x - t.x, y - t.y) < 28) return true;
  }
  if (y > RIO.y && y < RIO.y + RIO.h && !(x > PONTE.x && x < PONTE.x2)) return true;
  const ed = Math.hypot((x - LAGO.x) / LAGO.rx, (y - LAGO.y) / LAGO.ry);
  if (ed < 0.92) return true;
  return false;
}

function pertoP(x1, y1, x2, y2, d) { return Math.hypot(x1 - x2, y1 - y2) < d; }
function inRect(r, x, y, pad) {
  pad = pad || 0;
  return x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad;
}

// ---- input ----
const keys = {};
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (!G) return;
  if (k === 'f') interagir();
  if (k === 'e') comer();
  if (k === 'm') msg('🎯 Missão: ' + G.missoes[Math.min(G.missao, G.missoes.length - 1)]);
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

function comer() {
  const ordem = [['sopa', 60], ['geleia', 45], ['fruta', 20], ['cogu', 10], ['erva', 5]];
  for (const [chave, en] of ordem) {
    if (G.inv[chave] > 0) {
      G.inv[chave]--;
      G.energia = Math.min(100, G.energia + en);
      const f = FEITOS[chave] || ITENS[chave];
      msg('Hmm, delicioso! Comeu ' + f.emoji + ' ' + f.nome + ' (+' + en + ' energia).');
      return;
    }
  }
  msg('Estômago vazio! Colete frutinhas 🫐 ou faça comida na cabana.');
}

function interagir() {
  for (const m of MAES) {
    if (pertoP(m.x, m.y, G.px, G.py, 75)) { abrirMae(m); return; }
  }
  for (const b of Object.keys(BANDO)) {
    if (b === G.hero) continue;
    const am = BANDO[b];
    if (pertoP(am.x, am.y, G.px, G.py, 70)) { msg(am.emoji + ' ' + am.nome + ': ' + am.fala); return; }
  }
  for (const s of COLETA) {
    if (pertoP(s.x, s.y, G.px, G.py, 85)) { coletar(s); return; }
  }
  if (inRect(CABANA, G.px, G.py, 22)) { abrirCozinha(); return; }
  if (inRect(GARAGEM, G.px, G.py, 22)) { abrirOficina(); return; }
  if (pertoP(CASINHA_TREE.x, CASINHA_TREE.y, G.px, G.py, 75)) { pendurarCasinha(); return; }
  if (pertoP(FOGUEIRA.x, FOGUEIRA.y, G.px, G.py, 70)) { msg('🔥 A fogueira aquece a roda de amigos! Fique perto para recuperar energia.'); return; }
  for (const a of ANIMAIS) {
    if (pertoP(a.x, a.y, G.px, G.py, 70)) { alimentar(a); return; }
  }
  msg('Explore a floresta: arbustos 🫐, cogumelos 🍄, ervas 🌿 e madeira 🪵. Fale com as MÃES 👩!');
}

function coletar(s) {
  if (G.tempo - G.spTime[s.idx] < s.cd) { msg(s.nome + ' ainda está crescendo... volte em instantes 🌱'); return; }
  G.spTime[s.idx] = G.tempo;
  G.inv[s.tipo] += s.qtd;
  msg('Coletou ' + s.qtd + ' ' + ITENS[s.tipo].emoji + ' ' + ITENS[s.tipo].nome + '!');
  checarMissao();
}

function abrirMae(m) {
  const primeira = !G.maeFalado[m.id];
  if (primeira) { G.maeFalado[m.id] = true; G.moedas += 5; }
  if (m.id === 'maeMax' && G.missao === 0) {
    G.missao = 1; G.moedas += 5;
    msg('Missão 1 ok! +🪙5. ' + G.missoes[1]);
  }
  let html = '<b>' + m.emoji + ' ' + m.nome + '</b>';
  html += m.idade ? ' (' + m.idade + ' anos) ' : '';
  html += '— Moedas: 🪙' + G.moedas + ' | ⭐ Amigos: ' + G.amigos + '/5';
  if (primeira) html += '<br><span style="color:#c62828">💛 Só conhecer vocês já me deixa feliz! +🪙5</span>';
  html += '<br><small>🎯 Missão ' + Math.min(G.missao + 1, 5) + '/5: ' + G.missoes[Math.min(G.missao, G.missoes.length - 1)] + '</small><br>';
  html += '<p>' + m.fala + '<br><span style="color:#2e5d1f">' + m.tip + '</span></p>';
  if (m.id === 'maeMax') {
    html += '<button onclick="trocar(\'geleia\')">Vender 1 Geléia 🍓 por 🪙' + GEL_PRECO + '</button>';
    html += '<button onclick="trocar(\'casinha\')">Vender 1 Casinha 🐦 por 🪙' + CASA_PRECO + '</button>';
  }
  html += '<button onclick="fecharLoja()">Fechar</button>';
  lojaEl.innerHTML = html; lojaEl.style.display = 'block';
}

function trocar(chave) {
  const preco = chave === 'geleia' ? GEL_PRECO : CASA_PRECO;
  if (G.inv[chave] <= 0) {
    msg('Você não tem ' + FEITOS[chave].emoji + ' ' + FEITOS[chave].nome + ' para vender.');
    return;
  }
  G.inv[chave]--;
  G.moedas += preco;
  msg('Vendeu para a Mãe do Max e do Matheus! +🪙' + preco);
  abrirMae(MAES[0]);
}

function abrirCozinha() {
  let html = '<b>🍳 Cozinha da Cabana 🏕️</b> — Moedas: 🪙' + G.moedas + '<br>';
  html += '<button onclick="fazer(\'geleia\')">🍓 Geléia (3 🫐)</button>';
  html += '<button onclick="fazer(\'sopa\')">🍲 Sopa (1 🍄 + 1 🌿)</button>';
  html += '<button onclick="fecharLoja()">Fechar</button>';
  html += '<br><small>Você tem: 🫐' + G.inv.fruta + ' 🍄' + G.inv.cogu + ' 🌿' + G.inv.erva + ' | Feitos: 🍓' + G.inv.geleia + ' 🍲' + G.inv.sopa + '</small>';
  lojaEl.innerHTML = html; lojaEl.style.display = 'block';
}

function abrirOficina() {
  let html = '<b>🚗 Garagem-Oficina</b> — Moedas: 🪙' + G.moedas + '<br>';
  html += '<button onclick="fazer(\'casinha\')">🐦 Casinha (2 🪵)</button>';
  html += '<button onclick="fecharLoja()">Fechar</button>';
  html += '<br><small>Você tem: 🪵' + G.inv.madeira + ' | Feitos: 🐦' + G.inv.casinha + '</small>';
  lojaEl.innerHTML = html; lojaEl.style.display = 'block';
}

function fazer(chave) {
  const f = FEITOS[chave];
  for (const req of Object.keys(f.custo)) {
    if (G.inv[req] < f.custo[req]) {
      msg('Faltam ingredientes para a ' + f.nome + '! Veja o que precisa acima ⬆');
      return;
    }
  }
  for (const req of Object.keys(f.custo)) G.inv[req] -= f.custo[req];
  G.inv[chave]++;
  msg('Criou ' + f.emoji + ' ' + f.nome + '!');
  checarMissao();
  if (chave === 'casinha') abrirOficina(); else abrirCozinha();
}

function pendurarCasinha() {
  if (G.casinhaColocada) { msg('A casinha já está na árvore — o Pardal canta feliz! 🐦💚'); return; }
  if (G.inv.casinha <= 0) {
    msg('Uma árvore perfeita! Pendure uma CASINHA 🐦 (faça na GARAGEM 🚗 com 2 madeiras 🪵).');
    return;
  }
  G.inv.casinha--;
  G.casinhaColocada = true;
  msg('Casinha pendurada! O Pardal tem casa nova! 🐦');
  checarMissao();
}

function alimentar(a) {
  const chave = a.comida;
  const f = FEITOS[chave];
  const it = ITENS[chave];
  if (a.id === 'raposa' && G.missao < 4) {
    msg('🤫 A Raposinha está escondida na toca... ela só aparece para quem completar as missões das mães!');
    return;
  }
  if (G.inv[chave] <= 0) {
    const info = f || it;
    msg(a.emoji + ' ' + a.nome + ': preciso de ' + info.emoji + ' ' + info.nome + '! (colete ou faça primeiro)');
    return;
  }
  G.inv[chave]--;
  const novo = !G.fed[a.id];
  G.fed[a.id] = true;
  if (novo) { G.amigos++; G.moedas += 10; }
  const em = (f || it).emoji;
  msg(a.emoji + ' comeu ' + em + ' e ficou feliz! ' + (novo ? '🎉 Novo amigo! +🪙10 ' : '') + (a.id === 'raposa' ? '❤️ Que gesto lindo!' : ''));
  checarMissao();
}

function checarMissao() {
  const m = G.missao;
  if (m === 1 && G.inv.fruta >= 3) { G.missao = 2; G.moedas += 10; msg('Missão 2 ok! +🪙10. ' + G.missoes[2]); }
  else if (m === 2 && G.inv.geleia >= 1) { G.missao = 3; G.moedas += 15; msg('Geléia pronta! +🪙15. ' + G.missoes[3]); }
  else if (m === 3 && G.casinhaColocada) { G.missao = 4; G.moedas += 20; msg('Casinha na árvore! +🪙20. ' + G.missoes[4]); }
  else if (m === 4 && G.fed.raposa) {
    G.missao = 5; G.moedas += 30; G.wonAt = G.tempo;
    msg('🏆 VOCÊ VENCEU! A Raposinha está feliz e a floresta te ama! +🪙30');
  }
}

function fecharLoja() { lojaEl.style.display = 'none'; }

// ---- update/draw ----
let camX = 0, camY = 0;
function update(dt) {
  G.tempo += dt; G.dia = (0.35 + G.tempo * 0.004) % 1;
  const correndo = keys['shift'] && G.energia > 0;
  const pertoFogo = pertoP(FOGUEIRA.x, FOGUEIRA.y, G.px, G.py, 90);
  const base = correndo ? 3.4 : 2.2;
  if (correndo) G.energia = Math.max(0, G.energia - dt * 5);
  else if (pertoFogo) G.energia = Math.min(100, G.energia + dt * 14);
  else G.energia = Math.min(100, G.energia + dt * 2.5);

  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;
  const n = Math.hypot(dx, dy) || 1;
  G.vx = G.vx * 0.82 + (dx / n) * base * 0.35;
  G.vy = G.vy * 0.82 + (dy / n) * base * 0.35;
  const nx = G.px + G.vx * 3, ny = G.py + G.vy * 3;
  if (!colide(nx, ny)) { G.px = nx; G.py = ny; }
  else { G.vx *= 0.3; G.vy *= 0.3; }
  if (Math.hypot(G.vx, G.vy) > 0.2) G.dir = Math.atan2(G.vy, G.vx);
  if (G.energia <= 0) msg('Cansado! Descanse na fogueira 🔥 ou coma algo (E).');
  camX += (G.px - 480 - camX) * 0.1;
  camY += (G.py - 300 - camY) * 0.1;
}

function loop() {
  if (!G) return;
  update(1 / 60); draw(); drawHUD();
  requestAnimationFrame(loop);
}

function trilha(pontos, larg) {
  ctx.strokeStyle = '#cdb27c';
  ctx.lineWidth = larg;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pontos[0][0], pontos[0][1]);
  for (let i = 1; i < pontos.length; i++) ctx.lineTo(pontos[i][0], pontos[i][1]);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,235,190,0.35)';
  ctx.lineWidth = larg * 0.45;
  ctx.stroke();
}

function arvore(t, esc) {
  esc = esc || 1;
  ctx.fillStyle = 'rgba(0,70,0,0.18)';
  ctx.beginPath(); ctx.ellipse(t.x + 5, t.y + 14, 30 * esc, 11 * esc, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#7b5a32';
  ctx.fillRect(t.x - 6 * esc, t.y, 12 * esc, 18 * esc);
  ctx.fillStyle = '#2c7a35';
  ctx.beginPath(); ctx.arc(t.x, t.y - 8 * esc, 28 * esc, 0, 7); ctx.fill();
  ctx.fillStyle = '#54a94f';
  ctx.beginPath(); ctx.arc(t.x + 8 * esc, t.y - 14 * esc, 14 * esc, 0, 7); ctx.fill();
}

function pronto(i, cd) { return G.tempo - G.spTime[i] >= cd; }

function drawCabana() {
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(CABANA.x + 8, CABANA.y + 10, CABANA.w, CABANA.h);
  ctx.fillStyle = '#c62828';
  ctx.beginPath(); ctx.moveTo(CABANA.x - 20, CABANA.y + 20); ctx.lineTo(CABANA.x + CABANA.w / 2, CABANA.y - 25); ctx.lineTo(CABANA.x + CABANA.w + 20, CABANA.y + 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b0713f'; ctx.fillRect(CABANA.x, CABANA.y + 20, CABANA.w, CABANA.h - 20);
  ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 3; ctx.strokeRect(CABANA.x, CABANA.y + 20, CABANA.w, CABANA.h - 20);
  ctx.fillStyle = '#5d4037'; ctx.fillRect(CABANA.x + CABANA.w / 2 - 22, CABANA.y + 95, 44, 75);
  ctx.fillStyle = '#90caf9'; ctx.fillRect(CABANA.x + 24, CABANA.y + 55, 34, 30); ctx.fillRect(CABANA.x + CABANA.w - 58, CABANA.y + 55, 34, 30);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Arial'; ctx.fillText('🏕️ CABANA', CABANA.x + 88, CABANA.y + 10);
}

function drawGaragem() {
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(GARAGEM.x + 8, GARAGEM.y + 10, GARAGEM.w, GARAGEM.h);
  ctx.fillStyle = '#546e7a';
  ctx.beginPath(); ctx.moveTo(GARAGEM.x - 14, GARAGEM.y + 14); ctx.lineTo(GARAGEM.x + GARAGEM.w / 2, GARAGEM.y - 16); ctx.lineTo(GARAGEM.x + GARAGEM.w + 14, GARAGEM.y + 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#90a4ae'; ctx.fillRect(GARAGEM.x, GARAGEM.y + 14, GARAGEM.w, GARAGEM.h - 14);
  ctx.strokeStyle = '#37474f'; ctx.lineWidth = 3; ctx.strokeRect(GARAGEM.x, GARAGEM.y + 14, GARAGEM.w, GARAGEM.h - 14);
  ctx.fillStyle = '#37474f'; ctx.fillRect(GARAGEM.x + 34, GARAGEM.y + 34, 92, 90);
  ctx.fillStyle = '#263238'; ctx.fillRect(GARAGEM.x + 42, GARAGEM.y + 42, 76, 74);
  for (let i = 0; i < 2; i++) {
    ctx.beginPath(); ctx.arc(GARAGEM.x + 62 + i * 40, GARAGEM.y + 116, 8, 0, 7); ctx.strokeStyle = '#78909c'; ctx.lineWidth = 4; ctx.stroke();
  }
  ctx.fillStyle = '#ffd54f'; ctx.font = 'bold 13px Arial'; ctx.fillText('🚗 GARAGEM', GARAGEM.x + 62, GARAGEM.y + 5);
}

function drawFogueira() {
  for (let i = 0; i < 3; i++) {
    const a = (i - 1) * 0.5;
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(FOGUEIRA.x + Math.cos(a) * 12 - 4, FOGUEIRA.y + Math.sin(a) * 5, 8, 18);
  }
  const fl = Math.sin(G.tempo * 10) * 5;
  ctx.fillStyle = '#ff8f00';
  ctx.beginPath(); ctx.moveTo(FOGUEIRA.x, FOGUEIRA.y - 20 - fl); ctx.lineTo(FOGUEIRA.x - 12, FOGUEIRA.y + 2); ctx.lineTo(FOGUEIRA.x + 12, FOGUEIRA.y + 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd54f';
  ctx.beginPath(); ctx.moveTo(FOGUEIRA.x + 2, FOGUEIRA.y - 12 - fl); ctx.lineTo(FOGUEIRA.x - 7, FOGUEIRA.y + 2); ctx.lineTo(FOGUEIRA.x + 7, FOGUEIRA.y + 2); ctx.closePath(); ctx.fill();
}

function draw() {
  ctx.fillStyle = '#9ed48a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.translate(-camX, -camY);

  // trilhas de terra
  trilha([[FOGUEIRA.x, 500], [FOGUEIRA.x, 1055]], 46);
  trilha([[FOGUEIRA.x, 480], [540, 400], [500, 360]], 32);
  trilha([[FOGUEIRA.x, 515], [520, 600], [340, 640]], 34);
  trilha([[FOGUEIRA.x, 515], [950, 515], [1290, 430]], 34);
  trilha([[1070, 1085], [1330, 1085], [1400, 1220]], 32);

  // rio
  ctx.fillStyle = '#3f8fce';
  ctx.fillRect(RIO.x1, RIO.y, RIO.x2 - RIO.x1, RIO.h);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const yy = RIO.y + 14 + i * 5;
    const off = Math.sin(G.tempo * 2 + i) * 8;
    ctx.beginPath();
    ctx.moveTo(60 + i * 130 + off, yy);
    ctx.lineTo(180 + i * 130 + off, yy);
    ctx.stroke();
  }
  // ponte
  ctx.fillStyle = '#8a5a2b'; ctx.fillRect(PONTE.x, RIO.y - 10, PONTE.x2 - PONTE.x, RIO.h + 20);
  ctx.fillStyle = '#a06a35';
  for (let i = 0; i < 8; i++) ctx.fillRect(PONTE.x + 44 + i * 44, RIO.y - 10, 12, RIO.h + 20);
  ctx.fillStyle = '#5e3b1c'; ctx.fillRect(PONTE.x, RIO.y - 14, PONTE.x2 - PONTE.x, 6);
  ctx.fillRect(PONTE.x, RIO.y + RIO.h + 8, PONTE.x2 - PONTE.x, 6);

  // lago
  ctx.fillStyle = '#4aa3d6';
  ctx.beginPath(); ctx.ellipse(LAGO.x, LAGO.y, LAGO.rx, LAGO.ry, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(LAGO.x, LAGO.y, LAGO.rx * 0.55, LAGO.ry * 0.45, 0, 0, 7); ctx.stroke();

  // árvores (mata cerrada)
  ARV_DECO.forEach((t, i) => arvore(t, i % 3 === 0 ? 1.2 : 0.9));
  for (const t of ARV_SOLIDAS) { arvore(t, 1.05); }

  // pontos de coleta
  for (const s of COLETA) {
    const reg = pronto(s.idx, s.cd);
    if (s.tipo === 'fruta') {
      ctx.fillStyle = reg ? '#2f6b31' : '#3a5a38';
      ctx.beginPath(); ctx.ellipse(s.x, s.y, 30, 22, 0, 0, 7); ctx.fill();
      if (reg) {
        ctx.fillStyle = '#e53935';
        for (let i = 0; i < 7; i++) {
          const a = i * 0.9;
          ctx.beginPath(); ctx.arc(s.x + Math.cos(a) * 14, s.y + Math.sin(a) * 8, 3.4, 0, 7); ctx.fill();
        }
      }
    } else if (s.tipo === 'cogu') {
      ctx.fillStyle = '#8d6e43';
      ctx.beginPath(); ctx.ellipse(s.x, s.y, 18, 12, 0, 0, 7); ctx.fill();
      if (reg) { ctx.font = '20px Arial'; ctx.fillText('🍄', s.x - 10, s.y + 7); }
    } else if (s.tipo === 'erva') {
      ctx.fillStyle = '#4c9a3a';
      ctx.beginPath(); ctx.ellipse(s.x, s.y, 16, 10, 0, 0, 7); ctx.fill();
      if (reg) { ctx.font = '18px Arial'; ctx.fillText('🌿', s.x - 9, s.y + 6); }
    } else {
      ctx.fillStyle = '#7b5a32';
      ctx.fillRect(s.x - 20, s.y - 10, 40, 20);
      ctx.fillStyle = '#9c7248';
      ctx.fillRect(s.x - 14, s.y - 6, 9, 12); ctx.fillRect(s.x - 2, s.y - 6, 9, 12); ctx.fillRect(s.x + 10, s.y - 6, 9, 12);
      if (reg) { ctx.font = '18px Arial'; ctx.fillText('🪵', s.x - 9, s.y - 14); }
    }
    if (s.tipo !== 'madeira' && !reg && s.nome) {
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.85;
      ctx.font = '11px Arial'; ctx.fillText('crescendo...', s.x - 28, s.y - 16);
      ctx.globalAlpha = 1;
    }
  }

  // árvore da casinha
  arvore({ x: CASINHA_TREE.x, y: CASINHA_TREE.y }, 1);
  if (G.casinhaColocada) { ctx.font = '22px Arial'; ctx.fillText('🏠', CASINHA_TREE.x + 10, CASINHA_TREE.y - 20); }

  // cabana + garagem + fogueira
  drawCabana();
  drawGaragem();
  drawFogueira();

  // as mães
  for (const m of MAES) {
    ctx.font = '26px Arial'; ctx.fillText(m.emoji, m.x - 13, m.y + 9);
    ctx.fillStyle = m.cor; ctx.font = 'bold 11px Arial'; ctx.fillText(m.nome, m.x - m.nome.length * 3.5, m.y - 16);
  }

  // animais
  for (let i = 0; i < ANIMAIS.length; i++) {
    const a = ANIMAIS[i];
    if (a.id === 'raposa' && G.missao < 4) {
      ctx.fillStyle = '#3d2817';
      ctx.beginPath(); ctx.ellipse(a.x, a.y, 18, 12, 0, 0, 7); ctx.fill();
      ctx.font = '18px Arial'; ctx.fillText('🕳️', a.x - 9, a.y + 7);
      ctx.fillStyle = '#fff'; ctx.font = '11px Arial'; ctx.fillText('Toca da Raposinha?', a.x - 52, a.y - 18);
      continue;
    }
    const bob = Math.sin(G.tempo * 2 + i) * 2;
    ctx.font = '24px Arial'; ctx.fillText(a.emoji + (a.id === 'raposa' && G.fed.raposa ? '💚' : ''), a.x - 12, a.y + 8 + bob);
    ctx.fillStyle = '#223'; ctx.font = '11px Arial'; ctx.fillText(a.nome, a.x - (a.nome.length * 3), a.y - 16 + bob);
  }

  // os amigos na fogueira (menos o herói)
  for (const b of Object.keys(BANDO)) {
    if (b === G.hero) continue;
    const am = BANDO[b];
    const bob = Math.sin(G.tempo * 2 + b.length) * 2;
    ctx.font = '24px Arial'; ctx.fillText(am.emoji, am.x - 12, am.y + 8 + bob);
    ctx.fillStyle = am.cor; ctx.font = 'bold 11px Arial'; ctx.fillText(am.nome, am.x - am.nome.length * 3.5, am.y - 16 + bob);
  }

  // jogador
  const H = BANDO[G.hero];
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(G.px, G.py + 12, 12, 5, 0, 0, 7); ctx.fill();
  ctx.font = '26px Arial'; ctx.fillText(H.emoji, G.px - 13, G.py + 9);
  ctx.fillStyle = H.cor; ctx.font = 'bold 11px Arial'; ctx.fillText(H.nome, G.px - H.nome.length * 3.5, G.py - 18);

  ctx.restore();

  // dia/noite suave
  const noite = Math.max(0, Math.cos(G.dia * Math.PI * 2)) * 0.18;
  if (noite > 0.03) {
    ctx.fillStyle = 'rgba(10,20,60,' + noite + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const gx = FOGUEIRA.x - camX, gy = FOGUEIRA.y - camY;
    const grad = ctx.createRadialGradient(gx, gy, 10, gx, gy, 260);
    grad.addColorStop(0, 'rgba(255,160,40,0.40)');
    grad.addColorStop(1, 'rgba(255,160,40,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(gx, gy, 260, 0, 7); ctx.fill();
  }

  // banner de vitória
  if (G.missao >= 5) {
    ctx.fillStyle = 'rgba(255,214,0,0.92)';
    ctx.fillRect(140, 210, 680, 110);
    ctx.strokeStyle = '#c68b00'; ctx.lineWidth = 5; ctx.strokeRect(140, 210, 680, 110);
    ctx.fillStyle = '#4e342e'; ctx.font = 'bold 38px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 VOCÊ VENCEU! 🏆', 480, 262);
    ctx.font = 'bold 18px Arial'; ctx.fillStyle = '#7b5a32';
    ctx.fillText('Max, Noah, Luiza, Vitória e Matheus: a floresta os abraça!', 480, 302);
    ctx.textAlign = 'left';
  }
}

function drawHUD() {
  const h = BANDO[G.hero];
  let s = '<span>' + h.emoji + ' ' + h.nome + ' (grupo na fogueira 🔥)</span>';
  s += '<span>🪙 ' + G.moedas + '</span>';
  s += '<span>⭐ Amigos: ' + G.amigos + '/5</span>';
  s += '<span>⚡ ' + Math.round(G.energia) + '</span>';
  s += '<span>🫐 ' + G.inv.fruta + '</span><span>🍄 ' + G.inv.cogu + '</span><span>🌿 ' + G.inv.erva + '</span><span>🪵 ' + G.inv.madeira + '</span>';
  s += '<span>🍓 ' + G.inv.geleia + '</span><span>🐦 ' + G.inv.casinha + '</span><span>🍲 ' + G.inv.sopa + '</span>';
  const mi = Math.min(G.missao, G.missoes.length - 1);
  s += '<br><span style="background:#fff3d6">🎯 Missão ' + Math.min(G.missao + 1, 5) + '/5: ' + G.missoes[mi] + '</span>';
  hudEl.innerHTML = s;
}