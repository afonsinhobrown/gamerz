# Gamerz — Resumo de Progresso

**Repositório:** https://github.com/afonsinhobrown/gamerz (público)
**Jogo online:** https://gamerz-plum.vercel.app
**Auto-deploy:** cada `git push` publica sozinho no Vercel

---

## O que já foi feito

1. **Git + GitHub** ligados ao repositório
2. **Protótipo jogável no browser** (Three.js, sem instalação) — `prototype/index.html`
3. **Vercel** ligado com deploy automático
4. **Movimento:** andar (WASD), correr (Shift), saltar (Espaço), escalada (paredes azuis)
5. **Câmera** em 3ª pessoa a seguir o jogador
6. **Controles de telemóvel** (joystick + botões Correr/Saltar)
7. **Legendas** no ecrã (indicador Shift/Espaço)
8. **Bugs corrigidos:** o jogo não desenhava; o salto era cancelado no chão
9. **Testes automatizados** em Node a provar salto e corrida

---

## Próximo passo — Personagens 3D

| Tema | Detalhe |
|---|---|
| **Formato 3D** | `GLB`/`GLTF` (formato padrão para jogos web) |
| **Modelo** | personagem com esqueleto (rig) — ex.: **Mixamo** (grátis) ou Synty (pago, do GDD) |
| **Animações** | `idle`, `walk`, `run`, `jump`, `climb`, `cover` |
| **Integração** | trocar a cápsula atual pelo modelo + `AnimationMixer` do Three.js |

---

## Fila de trabalho (ordem sugerida)

1. Carregar **1 personagem 3D** e trocar a cápsula (idle + andar)
2. Ligar as **animações** aos estados do jogo (correr, saltar, escalar)
3. **Combate com cover** (pilar 2 do GDD)
4. **Puzzles ambientais** (pilar 3)
5. Polir **ambiente de Moçambique** (ilha, fortaleza, minas)
6. Mais tarde: sistema de **pagamento/acesso** (secção 8 do GDD)

---

## Notas técnicas

- O jogo é um **site estático** (HTML + JS), sem base de dados.
- Three.js carregado via CDN (importmap).
- `prototype/server.js` serve o jogo localmente (`node server.js` → http://localhost:8080).
- Config do Vercel: `prototype/vercel.json` + `rootDirectory: prototype`.
