# DOCUMENTO DE INSTRUÇÕES PARA AGENTE DE DESENVOLVIMENTO
## Projeto: [Nome provisório] — Action-Adventure estilo Uncharted em Moçambique

---

## 1. CONTEXTO DO PROJETO

Jogo de ação-aventura em terceira pessoa, inspirado em Uncharted, ambientado em Moçambique (ilhas, fortalezas coloniais, minas antigas). Protagonista: ex-operativo/caçador de relíquias, visual noir (casaco longo preto, luvas de couro, óculos escuros).

**Escopo inicial:** Vertical slice — um nível único jogável, 10-15 minutos de gameplay, demonstrando os 4 pilares abaixo.

---

## 2. STACK TÉCNICA

- **Engine:** Unity (C#) — melhor equilíbrio entre curva de aprendizagem, assets disponíveis e performance para projeto solo
- **Renderização:** URP (Universal Render Pipeline) — visual cinemático sem custo de HDRP
- **Controle de versão:** Git, commits atômicos por feature
- **Assets externos:** Unity Asset Store (Synty, Kevin Iglesias packs para terceira pessoa) + geração IA para texturas/conceitos

---

## 3. PILARES DE GAMEPLAY (ordem de prioridade de implementação)

### 3.1 Movimento e Exploração Vertical
- Sistema de escalada (ledge grab, jump-to-ledge, climbing em superfícies marcadas)
- Salto com correção de trajetória (assistido, estilo Uncharted — não punitivo)
- Câmera terceira pessoa com colisão inteligente (evitar clipping em espaços apertados)

### 3.2 Combate Tático Cover-Based
- Sistema de cover (agachar atrás de objetos, transição automática)
- Mira com aim-assist leve
- Poucos inimigos por encontro (3-5 máx), IA com flanking básico
- Sistema de vida simples (regeneração por tempo fora de combate)

### 3.3 Puzzles Ambientais
- Mecanismos rotativos/deslizantes baseados em símbolos
- Lógica espacial (alinhar elementos, sequência de ativação)
- Feedback visual/sonoro claro de progresso

### 3.4 Set-Piece Narrativo (opcional para vertical slice, prioridade baixa)
- Sequência scripted simples (queda de estrutura, perseguição linear)
- Pode ser timeline/cutscene pré-gravada se recursos forem limitados

---

## 4. ESTRUTURA DE PASTAS DO PROJETO

```
Assets/
  _Project/
    Scripts/
      Player/
      Combat/
      Puzzles/
      Camera/
      AI/
    Prefabs/
    Scenes/
      VerticalSlice_01
    Art/
      Characters/
      Environment/
      UI/
    Audio/
```

---

## 5. ORDEM DE DESENVOLVIMENTO (sprints sugeridos)

1. **Sprint 1:** Setup do projeto, controlador de movimento básico (andar, correr, saltar)
2. **Sprint 2:** Sistema de escalada e câmera terceira pessoa
3. **Sprint 3:** Sistema de cover e mira
4. **Sprint 4:** IA de inimigo básica (patrulha, deteção, ataque)
5. **Sprint 5:** Sistema de puzzle ambiental (1 puzzle funcional)
6. **Sprint 6:** Level design do vertical slice (whitebox → dressing)
7. **Sprint 7:** Polish — animações, som, iluminação, feedback de UI
8. **Sprint 8:** Playtest e correção de bugs

---

## 6. RESTRIÇÕES E PRINCÍPIOS DE DESIGN

- Priorizar **ritmo sobre quantidade**: poucos inimigos bem desenhados > hordas
- Puzzles devem ser resolúveis sem tutorial explícito (design intuitivo)
- Todo asset gerado por IA deve ser tratado como placeholder até validação visual
- Câmera nunca deve quebrar imersão (evitar clipping, jitter)
- Manter escopo do vertical slice contido — não expandir para múltiplos níveis antes de validar o loop principal

---

## 7. REFERÊNCIAS VISUAIS/NARRATIVAS

- Uncharted 4 (movimento, cover, set-pieces)
- Tomb Raider reboot (puzzles ambientais)
- Ambientação: Ilha de Moçambique, fortalezas coloniais, minas — pesquisa de referências arquitetónicas reais recomendada antes do level design

---

## 8. DISTRIBUIÇÃO WEB E MONETIZAÇÃO

**Plataforma de acesso:** Web, com paywall — jogo pago antes de jogar.

### 8.1 Ajustes de escopo para WebGL
- Reduzir poligonagem, simplificar iluminação (baked em vez de dinâmica pesada)
- Nível mais compacto que a visão original (menos geometria vertical complexa)
- Texturas otimizadas para tamanho de build web (evitar downloads longos)

### 8.2 Arquitetura de acesso + pagamento

```
Utilizador → Landing page (React) → Checkout (Stripe / M-Pesa / e-Mola)
→ Backend (Node.js) confirma pagamento → Gera token de acesso (JWT/sessão)
→ Página protegida carrega build Unity WebGL
```

**Componentes a implementar:**
- **Frontend:** React — landing page, checkout, página de jogo protegida por autenticação
- **Backend:** Node.js/Express — validação de pagamento, gestão de sessão/token, controlo de acesso ao build
- **Pagamento:** Stripe (cartão internacional) + M-Pesa/e-Mola API (mercado moçambicano)
- **Hospedagem do build WebGL:** servir apenas após validação de sessão (não expor ficheiros publicamente)
- **Base de dados:** registo de utilizadores/compras (Neon/Postgres — já usado noutros produtos TECNOINCUBADORA)

### 8.3 Restrição técnica a respeitar
- Build Unity WebGL nunca deve ser acessível por URL direta sem token válido
- Sessão de jogo deve expirar/revalidar para evitar partilha de acesso

---

## 9. ENTREGÁVEL ESPERADO DO AGENTE

- Projeto Unity funcional com build WebGL otimizado
- Cena única (vertical slice) jogável do início ao fim, os 3 pilares principais implementados
- Frontend React com landing page, checkout e página de jogo protegida
- Backend Node.js com integração de pagamento (Stripe + M-Pesa/e-Mola) e controlo de acesso por token
- Sistema testável ponta a ponta: pagamento → acesso → jogo
