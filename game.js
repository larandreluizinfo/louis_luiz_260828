// Cidade Sitiada — protótipo top-down 2D
// Armas: glock, p90, ump, ak47, groza, dose (cal12), awm
// Classes: bandido / policia | Modos: aberto / historia
// Sistemas: kit medico, energia, loja, banco, carros/motos/aviao

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hudEl = document.getElementById('hud');
const msgEl = document.getElementById('msg');
const shopEl = document.getElementById('shop');

const WEAPONS = {
  glock: { nome: 'Glock 17', dano: 22, rpm: 350, pente: 17, recarga: 1.4, alcance: 320, spread: 0.05, auto: false, preco: 0, tecla: '1', cor: '#aaa' },
  p90:   { nome: 'P90', dano: 24, rpm: 900, pente: 50, recarga: 2.2, alcance: 420, spread: 0.09, auto: true, preco: 4500, tecla: '2', cor: '#7fe07f' },
  ump:   { nome: 'UMP-45', dano: 30, rpm: 650, pente: 25, recarga: 2.0, alcance: 460, spread: 0.07, auto: true, preco: 5200, tecla: '3', cor: '#6fb7ff' },
  ak47:  { nome: 'AK-47', dano: 42, rpm: 600, pente: 30, recarga: 2.5, alcance: 560, spread: 0.06, auto: true, preco: 9000, tecla: '4', cor: '#ffb347' },
  groza: { nome: 'Groza', dano: 45, rpm: 750, pente: 30, recarga: 2.6, alcance: 540, spread: 0.08, auto: true, preco: 12000, tecla: '5', cor: '#ff7b7b' },
  dose:  { nome: 'Dose Cal.12', dano: 12, perdigotos: 8, rpm: 70, pente: 6, recarga: 2.8, alcance: 200, spread: 0.22, auto: false, preco: 3000, tecla: '6', cor: '#d9a066' },
  awm:   { nome: 'AWM', dano: 110, rpm: 40, pente: 5, recarga: 3.5, alcance: 900, spread: 0.005, auto: false, preco: 18000, tecla: '7', cor: '#c9a7ff' },
};
const ORDER = ['glock','p90','ump','ak47','groza','dose','awm'];

let G = null;
let playerClass = 'bandido';

function setClass(c) {
  playerClass = c;
  document.getElementById('classSel').innerHTML = 'Classe: <b>' + c + '</b>';
  msg('Classe selecionada: ' + c);
}
function msg(t) { msgEl.textContent = t; }

function startGame(modo) {
  G = novoJogo(playerClass, modo);
  shopEl.style.display = 'none';
  msg(modo === 'historia' ? 'Modo História: siga o objetivo no topo!' : 'Mundo Aberto livre! Vá à loja, banco, garagem e aeroporto.');
  requestAnimationFrame(loop);
}

function novoJogo(classe, modo) {
  const owned = { glock: true, p90: false, ump: false, ak47: false, groza: false, dose: false, awm: false };
  const ammo = {}; const reserve = {};
  ORDER.forEach(w => { ammo[w] = WEAPONS[w].pente; reserve[w] = WEAPONS[w].pente * 3; });
  return {
    classe, modo,
    px: 400, py: 400, ang: 0, hp: 100, colete: classe === 'policia' ? 50 : 0,
    dinheiro: classe === 'policia' ? 1500 : 800,
    dinheiroSujo: 0, wanted: 0,
    kits: 2, energias: 2, stamina: 100, energiaTimer: 0,
    owned, ammo, reserve, arma: 'glock',
    reloading: 0, lastShot: 0, mouseDown: false, mx: 0, my: 0,
    bullets: [], inimigos: [], roubo: 0, roubando: false,
    emVeiculo: null, voando: false,
    objetivoIdx: 0, tempo: 0,
    veiculos: [
      { tipo: 'carro', nome: 'Sedan', x: 700, y: 300, vx: 0, vy: 0, vel: 0, max: 5.2, ace: 0.18, dir: 0, cor: '#4da3ff', hp: 100 },
      { tipo: 'carro', nome: 'SUV Blindado', x: 760, y: 300, vx: 0, vy: 0, vel: 0, max: 4.4, ace: 0.15, dir: 0, cor: '#333', hp: 160 },
      { tipo: 'moto', nome: 'Moto 160', x: 820, y: 300, vx: 0, vy: 0, vel: 0, max: 6.2, ace: 0.25, dir: 0, cor: '#ff4040', hp: 60 },
      { tipo: 'moto', nome: 'Esportiva 600', x: 870, y: 300, vx: 0, vy: 0, vel: 0, max: 7.5, ace: 0.3, dir: 0, cor: '#ffcc00', hp: 60 },
      { tipo: 'aviao', nome: 'Monomotor', x: 1400, y: 1100, vx: 0, vy: 0, vel: 0, max: 8.5, ace: 0.12, dir: -Math.PI/2, cor: '#ffffff', hp: 120 },
    ],
    missoes: missoesPorClasse(classe),
  };
}

function missoesPorClasse(classe) {
  if (classe === 'bandido') return [
    'Fale com o contato no MORRO (quadrado marrom). Vá até lá.',
    'Compre a AK-47 na LOJA DE ARMAS (quadrado laranja).',
    'Roube o BANCO (quadrado verde): fique dentro e segure F.',
    'Fuja para o AEROPORTO e entre no AVIÃO (pista cinza).',
    'História concluída! Agora é mundo aberto.',
  ];
  return [
    'Apresente-se no DP (quadrado azul). Vá até lá.',
    'Compre a UMP na LOJA DE ARMAS.',
    'Impeça o roubo: vá ao BANCO e elimine 3 bandidos.',
    'Patrulhe de AVIÃO: entre no monomotor no aeroporto.',
    'História concluída! Agora é mundo aberto.',
  ];
}

// ---- mapa / zonas ----
const ZONAS = {
  loja: { x: 200, y: 200, w: 120, h: 90, cor: '#E8A33D', nome: 'LOJA DE ARMAS' },
  banco: { x: 1000, y: 300, w: 150, h: 100, cor: '#2ecc71', nome: 'BANCO' },
  hospital: { x: 300, y: 900, w: 130, h: 90, cor: '#ff6b81', nome: 'HOSPITAL (cura)' },
  dp: { x: 1100, y: 900, w: 130, h: 90, cor: '#3498db', nome: 'DP / ESCONDERIJO' },
  morro: { x: 1400, y: 600, w: 160, h: 140, cor: '#8d5a2b', nome: 'MORRO' },
  aeroporto: { x: 1300, y: 1000, w: 300, h: 160, cor: '#777', nome: 'AEROPORTO' },
  garagem: { x: 650, y: 250, w: 300, h: 110, cor: '#555', nome: 'GARAGEM' },
};
const PREDIOS = [
  { x: 500, y: 100, w: 200, h: 120 }, { x: 800, y: 600, w: 180, h: 140 },
  { x: 400, y: 600, w: 150, h: 120 }, { x: 950, y: 700, w: 120, h: 100 },
];

function dentro(z, x, y) { return x > z.x && x < z.x + z.w && y > z.y && y < z.y + z.h; }
function colidePredio(x, y) {
  for (const p of PREDIOS) if (x > p.x - 8 && x < p.x + p.w + 8 && y > p.y - 8 && y < p.y + p.h + 8) return true;
  return false;
}

// ---- input ----
const keys = {};
window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (!G) return;
  const k = e.key.toLowerCase();
  if (k >= '1' && k <= '7') trocarArma(ORDER[Number(k) - 1]);
  if (k === 'r') recarregar();
  if (k === 'h') usarKit();
  if (k === 'e') usarEnergia();
  if (k === 'f') interagir();
  if (k === 'q') sairVeiculo();
  if (k === ' ' && G.emVeiculo?.tipo === 'aviao') { G.voando = !G.voando; msg(G.voando ? 'Decolou! Use W/S para velocidade.' : 'Pousou.'); e.preventDefault(); }
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  G.mx = e.clientX - r.left; G.my = e.clientY - r.top;
});
canvas.addEventListener('mousedown', () => { if (G) G.mouseDown = true; });
window.addEventListener('mouseup', () => { if (G) G.mouseDown = false; });

function trocarArma(w) {
  if (!G.owned[w]) { msg(WEAPONS[w].nome + ' não comprada. Vá à loja!'); return; }
  G.arma = w; G.reloading = 0;
  msg('Arma: ' + WEAPONS[w].nome);
}
function recarregar() {
  const w = WEAPONS[G.arma];
  const precisa = w.pente - G.ammo[G.arma];
  if (precisa <= 0 || G.reserve[G.arma] <= 0 || G.reloading > 0) return;
  G.reloading = w.recarga;
  msg('Recarregando ' + w.nome + '...');
}
function usarKit() {
  if (G.kits <= 0) { msg('Sem kit médico! Compre na loja (R$300).'); return; }
  if (G.hp >= 100) { msg('Vida cheia.'); return; }
  G.kits--; G.hp = Math.min(100, G.hp + 75);
  msg('Kit médico usado. HP: ' + Math.round(G.hp));
}
function usarEnergia() {
  if (G.energias <= 0) { msg('Sem energético! Compre na loja (R$100).'); return; }
  G.energias--; G.energiaTimer = 60; G.hp = Math.min(100, G.hp + 15); G.stamina = 100;
  msg('Energético! Stamina cheia por 60s.');
}

function zonaAtual() {
  for (const [k, z] of Object.entries(ZONAS)) if (dentro(z, G.px, G.py)) return k;
  return null;
}

function interagir() {
  const z = zonaAtual();
  // veículo próximo?
  if (!G.emVeiculo) {
    for (const v of G.veiculos) {
      if (Math.hypot(v.x - G.px, v.y - G.py) < 40) {
        G.emVeiculo = v; msg('Entrou: ' + v.nome + ' (' + v.tipo + '). Q para sair.');
        shopEl.style.display = 'none'; return;
      }
    }
  }
  if (z === 'loja') abrirLoja();
  else if (z === 'banco') {
    if (G.classe === 'bandido') { G.roubando = !G.roubando; msg(G.roubando ? 'Roubo iniciado! Fique no banco...' : 'Roubo interrompido.'); }
    else { msg('Polícia: elimine os bandidos do banco!'); spawnInimigos(3); }
  }
  else if (z === 'hospital') { G.hp = 100; msg('Curado no hospital!'); }
  else if (z === 'dp' || z === 'morro') avancaMissao();
  else if (z === 'aeroporto') msg('Avião na pista! Aperte F perto dele e Espaço para decolar.');
  else msg('Nada para interagir aqui.');
}
function sairVeiculo() {
  if (G.emVeiculo) { G.emVeiculo.vel = 0; G.px += 30; G.py += 10; G.emVeiculo = null; G.voando = false; msg('Saiu do veículo.'); }
}

function abrirLoja() {
  let html = '<b>LOJA DE ARMAS</b> — Dinheiro: R$' + G.dinheiro + ' | Kits: ' + G.kits + ' | Energias: ' + G.energias + '<br>';
  for (const w of ORDER) {
    const d = WEAPONS[w];
    const tem = G.owned[w] ? '✔' : 'R$' + d.preco;
    html += `<button class="shopBtn" onclick="comprar('${w}')">${d.nome} (${tem})</button>`;
  }
  html += `<button class="shopBtn" onclick="comprarKit()">Kit Médico R$300</button>
           <button class="shopBtn" onclick="comprarEnergia()">Energético R$100</button>
           <button class="shopBtn" onclick="comprarMunicao()">Munição todas R$500</button>
           <button class="shopBtn" onclick="fecharLoja()">Fechar [F]</button>`;
  shopEl.innerHTML = html; shopEl.style.display = 'block';
}
window.comprar = function (w) {
  const d = WEAPONS[w];
  if (G.owned[w]) { trocarArma(w); fecharLoja(); return; }
  if (G.dinheiro < d.preco) { msg('Sem dinheiro para ' + d.nome); return; }
  G.dinheiro -= d.preco; G.owned[w] = true; G.arma = w;
  msg('Comprou ' + d.nome + '!'); avancaMissao(); abrirLoja();
};
window.comprarKit = function () {
  if (G.dinheiro < 300) return msg('Sem dinheiro.');
  G.dinheiro -= 300; G.kits++; abrirLoja();
};
window.comprarEnergia = function () {
  if (G.dinheiro < 100) return msg('Sem dinheiro.');
  G.dinheiro -= 100; G.energias++; abrirLoja();
};
window.comprarMunicao = function () {
  if (G.dinheiro < 500) return msg('Sem dinheiro.');
  G.dinheiro -= 500;
  ORDER.forEach(w => { if (G.owned[w]) G.reserve[w] += WEAPONS[w].pente * 2; });
  abrirLoja();
};
window.fecharLoja = function () { shopEl.style.display = 'none'; };

function avancaMissao() {
  if (G.modo !== 'historia') return;
  if (G.objetivoIdx < G.missoes.length - 1) {
    G.objetivoIdx++;
    G.dinheiro += 1000;
    msg('Missão avançada! +R$1000. Novo objetivo: ' + G.missoes[G.objetivoIdx]);
  }
}

function spawnInimigos(n) {
  for (let i = 0; i < n; i++) {
    G.inimigos.push({ x: G.px + 150 + Math.random() * 200, y: G.py + (Math.random() - 0.5) * 300, hp: 60, vivo: true, cd: 0 });
  }
}

// ---- update ----
let camX = 0, camY = 0;
function update(dt) {
  G.tempo += dt;
  // stamina / energia
  if (G.energiaTimer > 0) G.energiaTimer -= dt; else G.stamina = Math.max(0, G.stamina - dt * 1.5);
  if (keys['shift']) G.stamina = Math.max(0, G.stamina - dt * 20);

  // roubo
  if (G.roubando && dentro(ZONAS.banco, G.px, G.py)) {
    G.roubo += dt;
    if (Math.floor(G.roubo * 2) !== Math.floor((G.roubo - dt) * 2)) {
      G.dinheiroSujo += 150;
      G.wanted = Math.min(5, G.wanted + 0.2);
    }
    if (G.roubo > 12) {
      G.roubando = false; G.dinheiro += G.dinheiroSujo; G.dinheiroSujo = 0;
      G.wanted = Math.min(5, G.wanted + 2);
      msg('Roubo concluído! Fuja! Wanted: ' + Math.round(G.wanted));
      spawnInimigos(2 + Math.round(G.wanted));
      avancaMissao();
    }
  } else if (G.roubando) { G.roubando = false; G.roubo = 0; }

  // wanted cai com tempo
  G.wanted = Math.max(0, G.wanted - dt * 0.05);
  if (G.wanted >= 2 && G.inimigos.filter(e => e.vivo).length < G.wanted) spawnInimigos(1);

  // movimento
  const sprint = keys['shift'] && G.stamina > 0 ? 1.5 : 1;
  if (G.emVeiculo) updateVeiculo(dt);
  else {
    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;
    const n = Math.hypot(dx, dy) || 1;
    const sp = 2.6 * sprint;
    const nx = G.px + dx / n * sp, ny = G.py + dy / n * sp;
    if (!colidePredio(nx, ny)) { G.px = nx; G.py = ny; }
    G.px = Math.max(0, Math.min(1700, G.px)); G.py = Math.max(0, Math.min(1300, G.py));
  }

  // mira
  const wx = G.px - camX, wy = G.py - camY;
  G.ang = Math.atan2(G.my - wy - 0 + (canvas.height / 2 - wy) * 0 + (G.my - (G.py - camY)), G.mx - (G.px - camX));

  // recarga
  if (G.reloading > 0) {
    G.reloading -= dt;
    if (G.reloading <= 0) {
      const w = WEAPONS[G.arma];
      const precisa = w.pente - G.ammo[G.arma];
      const pega = Math.min(precisa, G.reserve[G.arma]);
      G.ammo[G.arma] += pega; G.reserve[G.arma] -= pega;
    }
  }

  // tiro
  const w = WEAPONS[G.arma];
  const intervalo = 60 / w.rpm;
  const podeAuto = w.auto ? G.mouseDown : (G.mouseDown && !G._fired);
  if (podeAuto && G.tempo - G.lastShot >= intervalo && G.reloading <= 0) {
    if (G.ammo[G.arma] <= 0) { recarregar(); }
    else {
      G.lastShot = G.tempo; G._fired = true;
      G.ammo[G.arma]--;
      const tiros = w.perdigotos || 1;
      for (let i = 0; i < tiros; i++) atirar(w);
      // recuo da AWM
      if (G.arma === 'awm') { G.px -= Math.cos(G.ang) * 4; G.py -= Math.sin(G.ang) * 4; }
      if (G.emVeiculo && G.emVeiculo.tipo === 'aviao' && G.voando) { /* pode atirar voando */ }
    }
  }
  if (!G.mouseDown) G._fired = false;

  // balas
  for (const b of G.bullets) { b.x += b.vx; b.y += b.vy; b.dist += Math.hypot(b.vx, b.vy); }
  G.bullets = G.bullets.filter(b => b.dist < b.max && b.x > -50 && b.y > 1750 && b.y > -50 && b.y < 1350);

  // inimigos
  for (const e of G.inimigos) {
    if (!e.vivo) continue;
    const d = Math.hypot(G.px - e.x, G.py - e.y);
    if (d > 40) { e.x += (G.px - e.x) / d * 1.6; e.y += (G.py - e.y) / d * 1.6; }
    e.cd -= dt;
    if (d < 350 && e.cd <= 0) {
      e.cd = 1.0;
      const dano = 8 + Math.random() * 8;
      if (G.colete > 0) G.colete = Math.max(0, G.colete - dano); else G.hp -= dano;
    }
    // colisão bala x inimigo
    for (const b of G.bullets) {
      if (!b.inimiga && Math.hypot(b.x - e.x, b.y - e.y) < 14) {
        e.hp -= b.dano; b.dist = 9999;
        if (e.hp <= 0 && e.vivo) {
          e.vivo = false; G.dinheiro += 200; G.wanted = Math.max(0, G.wanted - 0.3);
          msg('Abateu inimigo! +R$200');
          if (G.modo === 'historia' && G.objetivoIdx === 2 && G.classe === 'policia') {
            const mortos = G.inimigos.filter(x => !x.vivo).length;
            if (mortos >= 3) avancaMissao();
          }
        }
      }
    }
  }
  // balas inimigas não implementadas separadas — dano direto acima

  if (G.hp <= 0) {
    G.hp = 100; G.colete = 0; G.px = ZONAS.hospital.x + 60; G.py = ZONAS.hospital.y + 40;
    G.dinheiro = Math.max(0, G.dinheiro - 300); G.wanted = 0; G.inimigos = [];
    sairVeiculoForcado();
    msg('Você caiu! Acordou no hospital (-R$300).');
  }

  // missão história por posição
  if (G.modo === 'historia') checarMissaoPos();

  camX += ((G.emVeiculo ? G.emVeiculo.x : G.px) - canvas.width / 2 - camX) * 0.12;
  camY += ((G.emVeiculo ? G.emVeiculo.y : G.py) - canvas.height / 2 - camY) * 0.12;
}

function sairVeiculoForcado() { G.emVeiculo = null; G.voando = false; }

function updateVeiculo(dt) {
  const v = G.emVeiculo;
  const fw = (keys['w'] || keys['arrowup']);
  const br = (keys['s'] || keys['arrowdown']);
  const esq = (keys['a'] || keys['arrowleft']);
  const dir = (keys['d'] || keys['arrowright']);
  if (fw) v.vel = Math.min(v.max * (G.voando ? 1.4 : 1), v.vel + v.ace);
  else if (br) v.vel = Math.max(v.tipo === 'aviao' ? 0 : -v.max * 0.4, v.vel - v.ace * 1.4);
  else v.vel *= 0.985;
  const giro = v.tipo === 'moto' ? 0.09 : v.tipo === 'aviao' ? 0.05 : 0.065;
  if (esq) v.dir -= giro * (v.vel >= 0 ? 1 : -1);
  if (dir) v.dir += giro * (v.vel >= 0 ? 1 : -1);
  v.x += Math.cos(v.dir) * v.vel; v.y += Math.sin(v.dir) * v.vel;
  v.x = Math.max(0, Math.min(1700, v.x)); v.y = Math.max(0, Math.min(1300, v.y));
  G.px = v.x; G.py = v.y; G.ang = v.dir;
  // avião voa por cima dos prédios
  if (v.tipo !== 'aviao' || !G.voando) {
    if (colidePredio(v.x, v.y)) { v.vel *= 0.5; v.x -= Math.cos(v.dir) * 4; v.y -= Math.sin(v.dir) * 4; }
  }
}

function checarMissaoPos() {
  const z = zonaAtual();
  if (G.classe === 'bandido') {
    if (G.objetivoIdx === 0 && z === 'morro') avancaMissao();
    if (G.objetivoIdx === 3 && z === 'aeroporto') {
      // entra no avião?
      for (const v of G.veiculos) if (v.tipo === 'aviao' && Math.hypot(v.x - G.px, v.y - G.py) < 60) { avancaMissao(); break; }
    }
  } else {
    if (G.objetivoIdx === 0 && z === 'dp') avancaMissao();
    if (G.objetivoIdx === 3 && G.emVeiculo?.tipo === 'aviao') avancaMissao();
  }
}

function atirar(w) {
  const ox = G.emVeiculo ? G.emVeiculo.x : G.px;
  const oy = G.emVeiculo ? G.emVeiculo.y : G.py;
  const a = G.ang + (Math.random() - 0.5) * w.spread * 2;
  const vel = 12;
  G.bullets.push({ x: ox + Math.cos(a) * 20, y: oy + Math.sin(a) * 20, vx: Math.cos(a) * vel, vy: Math.sin(a) * vel, dist: 0, max: w.alcance, dano: w.dano, inimiga: false });
}

// ---- render ----
function loop() {
  if (!G) return;
  update(1 / 60);
  draw();
  drawHUD();
  requestAnimationFrame(loop);
}

function draw() {
  ctx.fillStyle = '#2a2f35'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.translate(-camX, -camY);
  // ruas
  ctx.strokeStyle = '#3d434b'; ctx.lineWidth = 40;
  for (let x = 200; x < 1700; x += 300) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1300); ctx.stroke(); }
  for (let y = 150; y < 1300; y += 250) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1700, y); ctx.stroke(); }
  // zonas
  for (const z of Object.values(ZONAS)) {
    ctx.fillStyle = z.cor; ctx.globalAlpha = 0.35; ctx.fillRect(z.x, z.y, z.w, z.h); ctx.globalAlpha = 1;
    ctx.strokeStyle = z.cor; ctx.strokeRect(z.x, z.y, z.w, z.h);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Arial'; ctx.fillText(z.nome, z.x + 4, z.y + 16);
  }
  // prédios
  ctx.fillStyle = '#1a1d22';
  for (const p of PREDIOS) { ctx.fillRect(p.x, p.y, p.w, p.h); ctx.strokeStyle = '#000'; ctx.strokeRect(p.x, p.y, p.w, p.h); }
  // veículos
  for (const v of G.veiculos) {
    ctx.save(); ctx.translate(v.x, v.y); ctx.rotate(v.dir);
    ctx.fillStyle = v.cor;
    if (v.tipo === 'carro') ctx.fillRect(-18, -9, 36, 18);
    if (v.tipo === 'moto') ctx.fillRect(-12, -4, 24, 8);
    if (v.tipo === 'aviao') { ctx.fillRect(-22, -4, 44, 8); ctx.fillRect(-4, -18, 10, 36); }
    ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = '10px Arial'; ctx.fillText(v.nome, v.x - 20, v.y - 14);
  }
  // inimigos
  for (const e of G.inimigos) {
    if (!e.vivo) continue;
    ctx.fillStyle = G.classe === 'bandido' ? '#0044ff' : '#cc0000';
    ctx.beginPath(); ctx.arc(e.x, e.y, 12, 0, 7); ctx.fill();
    ctx.fillStyle = 'red'; ctx.fillRect(e.x - 12, e.y - 20, 24 * (e.hp / 60), 4);
  }
  // balas
  ctx.fillStyle = '#ffe66d';
  for (const b of G.bullets) { ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, 7); ctx.fill(); }
  // player
  const px = G.emVeiculo ? G.emVeiculo.x : G.px;
  const py = G.emVeiculo ? G.emVeiculo.y : G.py;
  if (!G.emVeiculo) {
    ctx.save(); ctx.translate(px, py); ctx.rotate(G.ang);
    ctx.fillStyle = G.classe === 'bandido' ? '#111' : '#0a3d91';
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill();
    ctx.strokeStyle = WEAPONS[G.arma].cor; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(30, 0); ctx.stroke();
    ctx.restore();
  } else {
    ctx.strokeStyle = '#ffff00'; ctx.lineWidth = 2;
    ctx.strokeRect(px - 24, py - 24, 48, 48);
  }
  // roubo barra
  if (G.roubando) {
    ctx.fillStyle = '#000'; ctx.fillRect(G.px - 30, G.py - 34, 60, 8);
    ctx.fillStyle = '#2ecc71'; ctx.fillRect(G.px - 30, G.py - 34, 60 * Math.min(1, G.roubo / 12), 8);
  }
  ctx.restore();
}

function drawHUD() {
  const w = WEAPONS[G.arma];
  let s = `<span>❤ ${Math.round(G.hp)} | 🛡 ${Math.round(G.colete)}</span>`;
  s += `<span>🔫 ${w.nome} ${G.ammo[G.arma]}/${G.reserve[G.arma]}${G.reloading > 0 ? ' (recarregando)' : ''}</span>`;
  s += `<span>💰 R$${G.dinheiro}${G.dinheiroSujo > 0 ? ' (+sujo R$' + Math.round(G.dinheiroSujo) + ')' : ''}</span>`;
  s += `<span>⭐ ${G.wanted.toFixed(1)}</span>`;
  s += `<span>💊 ${G.kits} | ⚡ ${G.energias} | stamina ${Math.round(G.stamina)}</span>`;
  s += `<span>${G.classe} | ${G.modo}</span>`;
  if (G.emVeiculo) s += `<span>🚗 ${G.emVeiculo.nome}${G.voando ? ' VOANDO' : ''} [Q sai]</span>`;
  if (G.modo === 'historia') s += `<br><span style="background:#3a2f00">🎯 ${G.missoes[G.objetivoIdx]}</span>`;
  hudEl.innerHTML = s;
}
