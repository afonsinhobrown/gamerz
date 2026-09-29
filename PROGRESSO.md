# Gamerz — Resumo de Progresso

**Repositório:** https://github.com/afonsinhobrown/gamerz (público)
**Site online:** https://gamerz-plum.vercel.app
**Auto-deploy:** cada `git push` publica sozinho no Vercel

---

## Visão do sistema

O **Gamerz é uma plataforma com VÁRIOS jogos**, não um jogo só. A ideia é ter:

```
gamerz.vercel.app  (hub / página inicial)
   ├── Jogo 1: "Tower Brawler"      → subir o edifício, 5 andares
   ├── Jogo 2: (a definir)
   ├── Jogo 3: (a definir)
   └── ...
```

Cada jogo é uma página própria (ex.: `tower.html`) e o hub lista os jogos disponíveis.

---

## Jogos

### Jogo 1 — Tower Brawler (`prototype/tower.html`)
- **Objetivo:** subir um edifício de **5 andares**.
- **Combate:** corpo a corpo (clique/espaço; botão no telemóvel).
- **Câmara:** 3ª pessoa, por trás.
- **Regra de morte:** 1 golpe = recomeça no **andar de baixo** (checkpoint por andar).
- **Cada andar:** sala com assassinos para derrotar; ao limpar, abre a porta/escada verde para o andar de cima.
- **Vitória:** chegar ao topo após limpar o 5º andar.
- Personagens 3D **humanos** (ver `prototype/characters.js`), com andar/correr/soco/morte animados.

### Jogo 2 — Exploração "Uncharted" (`prototype/explore.html`)
- Protótipo inicial de exploração: andar, correr, saltar, escalar, câmara 3ª pessoa.
- Serve de base técnica (movimento, câmara, controles).

### Landing page / Hub (`prototype/index.html`)
- Página inicial com a lista de jogos para selecionar (sem escrever endereços).
- Basta abrir `gamerz-plum.vercel.app` e escolher o jogo.
- Cartão "Em breve" para novos jogos.
- **Regra:** todo o jogo tem um botão **‹ Menu** (canto superior direito) para voltar à landing page.

---

## O que já foi feito

1. **Git + GitHub** ligados ao repositório
2. **Vercel** ligado com deploy automático
3. **Protótipo de exploração** (Three.js): andar (WASD), correr (Shift), saltar (Espaço), escalada
4. **Câmera** em 3ª pessoa com controlo estável
5. **Controles de telemóvel** (joystick + botões)
6. **Legendas** no ecrã (indicador de teclas)
7. **Bugs corrigidos:** o jogo não desenhava; o salto era cancelado no chão
8. **Testes automatizados** em Node a provar salto e corrida
9. **Tower Brawler v1** criado (`tower.html`)
10. **Hub / landing page** criado (`index.html`) — lista de jogos com seleção
11. **Tower Brawler corrigido:** a câmara/parede tapavam a visão (removida a parede de trás; câmara ajustada)
12. **Botão Menu** adicionado a todos os jogos (voltar à landing page)
13. **Morrer/recém-começar:** ao ser atingido, ecrã a vermelho, mensagem e reinício no andar de baixo (~1,6s), com invencibilidade temporária. (Estava com bug — ficava parado — já corrigido.)
14. **Personagens 3D humanos** (módulo partilhado `prototype/characters.js`) em vez dos bonecos de blocos, usados nos dois jogos.

---

## Personagens 3D (`prototype/characters.js`)

Módulo único importado pelos jogos: `import { Character, PRESETS, ENEMY_PRESETS } from './characters.js';`

| | Detalhe |
|---|---|
| **Corpo** | Esqueleto de 16 ossos (grupos aninhados) + corpo em cápsulas/esferas: quadril, tronco, pescoço, cabeça com cara (olhos, sobrancelhas, nariz, boca), cabelo/chapéu/capuz, mãos, sapatos |
| **Proporções** | ~1,82 m de altura; `build` muda a corpulência, `height` a estatura |
| **Animações** | parado, andar, correr, guarda, soco (com impacto no frame certo), levar golpe, escalada, no ar, queda para trás |
| **Feedback** | `hitFlash()` (pisca a vermelho ao levar dano), `setGlow()` (o inimigo brilha a telegrafar o soco) |
| **Presets** | `PRESETS.hero`, `PRESETS.explorer`, `ENEMY_PRESETS` (capuzado, bandido, brutamontes, elite) |
| **Custo** | Zero downloads: geometrias partilhadas entre personagens, sem dependências externas |

Uso rápido:
```js
const ch = new Character({ preset: PRESETS.hero });
scene.add(ch);
ch.play('attack', { windup: 0.3 });
ch.onImpact = () => { /* o soco acertou */ };
ch.update(dt, { speed: 6, guard: false, grounded: true });
```

---

## Próximo passo

**Para testar já:** abrir https://gamerz-plum.vercel.app → escolher **Tower Brawler** → jogar os 5 andares.

### Se quiseres personagens ainda mais realistas (opcional)
| Tema | Detalhe |
|---|---|
| **Formato 3D** | `GLB`/`GLTF` (padrão para jogos web) |
| **Modelo** | personagem com esqueleto (rig) — ex.: **Mixamo** (grátis) ou Synty (pago, do GDD) |
| **Animações** | `idle`, `walk`, `run`, `attack`, `hit`, `die` |
| **Integração** | o `Character` aceita um `preset` — só teria de mudar a construção do corpo por `GLTFLoader` + `AnimationMixer` |

---

## Fila de trabalho (ordem sugerida)

1. Ver os personagens em jogo e dizer o que ajustar (cabeça, mãos, cores, ritmo das animações)
2. Melhorar o **Tower Brawler**: feedback de combate, som, progressão de dificuldade
3. Escolher 2-3 inimigos por tipo em vez de aleatório
4. Adicionar **Jogo 3**
5. Mais tarde: sistema de **pagamento/acesso** (secção 8 do GDD)

---

## Notas técnicas

- Plataforma é um **site estático** (HTML + JS), sem base de dados.
- Three.js carregado via CDN (importmap).
- `prototype/server.js` serve os jogos localmente (`node server.js` → http://localhost:8080).
- Config do Vercel: `prototype/vercel.json` + `rootDirectory: prototype`.
- Cada jogo vive no seu próprio ficheiro `.html` dentro de `prototype/`.
