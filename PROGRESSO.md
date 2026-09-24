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

---

## Próximo passo

**Para testar já:** abrir https://gamerz-plum.vercel.app → escolher **Tower Brawler** → jogar os 5 andares.

### Personagens 3D
| Tema | Detalhe |
|---|---|
| **Formato 3D** | `GLB`/`GLTF` (padrão para jogos web) |
| **Modelo** | personagem com esqueleto (rig) — ex.: **Mixamo** (grátis) ou Synty (pago, do GDD) |
| **Animações** | `idle`, `walk`, `run`, `attack`, `hit`, `die` |
| **Integração** | trocar os bonecos de blocos pelo modelo + `AnimationMixer` do Three.js |

---

## Fila de trabalho (ordem sugerida)

1. Melhorar o **Tower Brawler**: feedback de combate, som, progressão de dificuldade
2. Carregar **1 personagem 3D** e trocar os placeholders
3. Ligar as **animações** aos estados (andar, atacar, morrer)
4. Adicionar **Jogo 3**
5. Mais tarde: sistema de **pagamento/acesso** (secção 8 do GDD)

---

## Notas técnicas

- Plataforma é um **site estático** (HTML + JS), sem base de dados.
- Three.js carregado via CDN (importmap).
- `prototype/server.js` serve os jogos localmente (`node server.js` → http://localhost:8080).
- Config do Vercel: `prototype/vercel.json` + `rootDirectory: prototype`.
- Cada jogo vive no seu próprio ficheiro `.html` dentro de `prototype/`.
