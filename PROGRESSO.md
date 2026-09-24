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
- Personagens ainda são **placeholders** (bonecos de blocos), prontos para trocar por modelos 3D `.glb`.

### Jogo 2 — Exploração "Uncharted" (`prototype/index.html`)
- Protótipo inicial de exploração: andar, correr, saltar, escalar, câmara 3ª pessoa.
- Serve de base técnica (movimento, câmara, controles).

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

---

## Próximo passo — Hub multi-jogo + Personagens 3D

### Hub de jogos
- Página inicial que lista todos os jogos e permite entrar em cada um.
- Estrutura para adicionar jogos 2, 3, 4... facilmente.

### Personagens 3D
| Tema | Detalhe |
|---|---|
| **Formato 3D** | `GLB`/`GLTF` (padrão para jogos web) |
| **Modelo** | personagem com esqueleto (rig) — ex.: **Mixamo** (grátis) ou Synty (pago, do GDD) |
| **Animações** | `idle`, `walk`, `run`, `attack`, `hit`, `die` |
| **Integração** | trocar os bonecos de blocos pelo modelo + `AnimationMixer` do Three.js |

---

## Fila de trabalho (ordem sugerida)

1. Criar o **hub** (página inicial com a lista de jogos)
2. Melhorar o **Tower Brawler**: feedback de combate, som, progressão de dificuldade
3. Carregar **1 personagem 3D** e trocar os placeholders
4. Ligar as **animações** aos estados (andar, atacar, morrer)
5. Adicionar **Jogo 2**
6. Mais tarde: sistema de **pagamento/acesso** (secção 8 do GDD)

---

## Notas técnicas

- Plataforma é um **site estático** (HTML + JS), sem base de dados.
- Three.js carregado via CDN (importmap).
- `prototype/server.js` serve os jogos localmente (`node server.js` → http://localhost:8080).
- Config do Vercel: `prototype/vercel.json` + `rootDirectory: prototype`.
- Cada jogo vive no seu próprio ficheiro `.html` dentro de `prototype/`.
