# GDD — Cidade Sitiada: Polícia vs Bandido

## 1. Tipo de jogo

**Shooter em 3ª/1ª pessoa, mundo aberto realista + modo história**, com classes jogáveis.

- **Modo Mundo Aberto:** mapa urbano + zona rural livre, com polícia e bandidos (NPCs e players), lojas, garagens, hospital, banco central, aeroporto.
- **Modo História:** campanha em capítulos com objetivos, escolhas de lado (Polícia ou Bandido) e 3 finais.
- Plataformas-alvo: PC (teclado/mouse) e gamepad. Sem morte permanente na história.

## 2. Arsenal

Todas as armas têm recuo, dispersão, som e dano por distância realistas. Munição por calibre.

| Arma | Tipo | Dano | Cadência | Alcance | Pente | Recarga | Calibre | Preço na loja |
|------|------|------|----------|---------|-------|---------|---------|---------------|
| Glock 17 | Pistola | 22 | Semi-auto | Curto (30m) | 17 | 1,4s | 9mm | R$ 800 inicial |
| P90 | SMG | 24 | 900 rpm | Curto-médio (60m) | 50 | 2,2s | 5.7mm | R$ 4.500 |
| UMP-45 | SMG | 30 | 650 rpm | Médio (70m) | 25 | 2,0s | .45 | R$ 5.200 |
| AK-47 | Fuzil de assalto | 42 | 600 rpm | Longo (150m) | 30 | 2,5s | 7.62mm | R$ 9.000 |
| Groza | Fuzil bullpup | 45 | 750 rpm | Longo (140m) | 30 | 2,6s | 7.62mm | R$ 12.000 (loja nível 2 / drop raro) |
| Calibre 12 "Dose" | Escopeta | 8x12 (perdigotos) | Pump 70 rpm | Muito curto (20m) | 6 | 2,8s | 12ga | R$ 3.000 |
| AWM | Sniper bolt-action | 110 | 40 rpm | Muito longo (400m) | 5 | 3,5s | .300 Magnum | R$ 18.000 (loja nível 3 / missão) |

- **Acessórios:** mira red dot/holográfica/4x/8x (AWM), silenciador, coronha, empunhadura (reduz recuo), pente estendido.
- **Balanceamento:** escopeta domina perto, SMGs no médio-curto, AK/Groza no médio-longo, AWM one-shot no torso/cabeça com colete 1, mas lenta e barulhenta.

## 3. Classes

O jogador escolhe no início e pode trocar no esconderijo/DP a cada capítulo (mantém nível, perde wanted/reputação parcial).

### 3.1 Bandido
- **Foco:** roubo, fuga, confronto com polícia.
- **Habilidades:** Arrombamento rápido, Suborno (reduz wanted 1 estrela), Pilotagem +10%, Carga extra (+2 slots).
- **Progressão:** Reputação do Morro (missões de roubo, entrega, fuga). Desbloqueia esconderijos, Groza e Calibre 12 com desconto.
- **Wanted:** 0–5 estrelas. 4+ = BOPE/helicóptero no mundo aberto.

### 3.2 Polícia
- **Foco:** patrulha, abordagem, prisão e apreensão.
- **Habilidades:** Colete reforçado (+25 HP inicial), Chamada de reforço, Abordagem (prende NPC procurado sem matar = bônus), Direção defensiva.
- **Progressão:** Patente (Soldado → Cabo → Sargento → BOPE). Desbloqueia AWM, UMP e viaturas especiais.
- **Corrupção (história):** escolhas podem dar dinheiro extra mas travam final "honrado".

Ambas as classes usam todas as armas; o que muda é economia, missões e habilidades.

## 4. Modos

### 4.1 Modo Mundo Aberto
- Mapa único contínuo (~4x4 km): centro, favela/morro, porto, rodovia, fazendas, aeroporto.
- Ciclo dia/noite, chuva, NPCs e trânsito dinâmicos.
- Atividades livres: patrulha/entrega, racha de moto, tiro ao alvo, loja de armas, garagem, hospital, roubo a banco, fuga da polícia.
- Save automático em esconderijo/DP + save rápido.

### 4.2 Modo História (8 capítulos)
1. Chegada à cidade (tutorial: Glock + direção).
2. Primeiro serviço (patrulha ou entrega).
3. Loja de armas e primeiro fuzil (AK-47).
4. Roubo a banco (como bandido) / Assalto a banco (como polícia) — missão espelho.
5. Guerra do morro (UMP/P90).
6. Contrabando no aeroporto (Groza).
7. Sniper na rodovia (AWM + Calibre 12 em CQB).
8. Decisão final: cerco ao banco central ou ao quartel — 3 finais (Ordem, Caos, Acordo).

Duração estimada: 8–12h história, 20h+ com mundo aberto.

## 5. Sistemas de sobrevivência e economia

- **Vida:** 100 HP + colete (50/100). Sem regen automática; precisa de cura.
- **Kit médico:** cura 75 HP em 5s (parado). Preço R$ 300. Máx 5 no inventário.
- **Energias (energéticos):** +stamina por 60s e cura 15 HP. Ex.: lata R$ 100. Efeito acumula 1x.
- **Fome/cansaço leves:** só reduzem stamina, não matam — para não travar o jogo.
- **Lojas de arma:** 3 níveis (bairro, centro, porto). Vendem armas, munição, colete, acessórios, kit médico. Bandido tem desconto no morro; polícia no arsenal do DP.
- **Dinheiro:** missões, apreensões, roubos, vendas de carro apreendido (polícia legal) / desmanche (bandido).

## 6. Roubo ao banco (sistema principal)

Disponível no mundo aberto e no capítulo 4/8.

1. **Planejamento:** máscara, carro de fuga, hacker ou explosivo (compráveis).
2. **Execução:** rende reféns (bônus sem matar), fura alarme em minigame, bolsa de dinheiro ocupa 4 slots e pesa (corre mais devagar).
3. **Fuga:** wanted +2 a +4 estrelas, helicóptero se demorar >3 min, blitz na ponte.
4. **Lavagem:** dinheiro sujo vira limpo no lava-jato/desmanche com taxa de 20%.
5. Como polícia: mesma missão invertida — cerco, negociação, invasão tática, prisão rende mais XP que abate.

## 7. Veículos realistas

Física arcade-sim: peso, derrapagem, dano por parte, pneu furável, combustível.

- **Carros:** hatch (rápido/barato), sedan patrulha, SUV blindado, esportivo (fuga). Rádio, porta-malas (12 slots extras), blindagem 1–3.
- **Motos:** street 160cc (ágil), trail (terra), esportiva 600cc (racha). Empina, cai em batida forte, capacete reduz 30% dano na cabeça.
- **Avião (monomotor):** no aeroporto/deserto. Decolagem/pouso realista (flaps, trem, stall), 4 lugares, pode lançar carga (bandido) ou patrulha aérea (polícia). Sem caça/míssil — só transporte e fuga cinematográfica.
- **Dano e reparo:** mecânico/posto cobra por peça; tanque vazio = a pé ou carona.

## 8. Desafio e regras

- **Combate:** cover real, headshot x2, colete quebra, recuo por arma, NPCs flanqueiam e chamam reforço.
- **Dificuldade:** Recruta / Operacional / Realista (dano amigo + sem HUD de inimigo).
- **Derrota:** história volta ao checkpoint sem perder armas; mundo aberto acorda no hospital/DP, perde 10% dinheiro sujo e munição extra.
- **Leis do projeto:** PT-BR base, sem gore excessivo, sem morte permanente de parceiros principais, roubo nunca exige microtransação.

## 9. Estilo visual e som

- Cidade brasileira litorânea fictícia, dia quente e noite neon.
- Carros/motos/avião com modelos e sons realistas (motor, tiro por calibre, sirene, helicóptero).
- HUD mínimo: vida, colete, munição, minimapa com wanted, marcador de missão.

## 10. Escopo mínimo jogável (MVP)

1. Mapa quarteirão + morro + loja + banco + garagem + aeroporto.
2. 7 armas da tabela funcionando + kit médico + energético.
3. 2 classes com 2 habilidades cada.
4. 1 roubo a banco jogável dos dois lados.
5. 3 carros + 2 motos + 1 avião pilotável.
6. Modo história cap. 1–4 + mundo aberto livre.
