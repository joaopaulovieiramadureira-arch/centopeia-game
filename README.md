# 🐛 Jogo da Centopeia

Um jogo estilo Snake onde você controla uma **centopeia** que cresce ao comer **insetos**!

## 🎮 Como Jogar

1. **Inicie o jogo** clicando em "Iniciar Jogo"
2. **Use as SETAS do teclado** para controlar a centopeia
3. **Coma os insetos verdes** para ganhar pontos e aumentar o tamanho
4. **Evite colidir** com as paredes e com o próprio corpo
5. Quanto maior a centopeia, mais pontos você ganha por inseto!

## 🎯 Objetivo

Crescer ao máximo possível comendo insetos sem colidir com as paredes ou consigo mesma!

## 📊 Pontuação

- Cada inseto comido: **10 pontos × tamanho atual da centopeia**
- Exemplo: Se a centopeia tem 5 pernas, cada inseto vale 50 pontos!

## 🕹️ Controles

- **Seta para Cima** (↑) - Mover para cima
- **Seta para Baixo** (↓) - Mover para baixo
- **Seta para Esquerda** (←) - Mover para esquerda
- **Seta para Direita** (→) - Mover para direita
- **Pausar** - Pausar/Retomar o jogo

## 🐛 Características

- ✨ **Centopeia animada** com corpo, cabeça, olhos e antenas dinâmicas
- 🦗 **Insetos verdes** com pernas e antenas realistas
- 📈 **Sistema de pontuação progressivo** - quanto maior, mais pontos!
- 🎨 **Interface colorida** com gradientes modernos
- 📱 **Responsiva** - funciona em desktop e mobile
- 🎵 **Gameplay suave** com física clara

## 🚀 Execução

Abra o arquivo `index.html` em seu navegador e aproveite!

```bash
# Se você tiver um servidor Python
python -m http.server 8000

# Ou use qualquer outro servidor local
```

Então acesse: `http://localhost:8000`

## 📝 Estrutura do Projeto

```
centopeia-game/
├── index.html    # Estrutura HTML
├── style.css     # Estilos e design
├── game.js       # Lógica do jogo
└── README.md     # Este arquivo
```

## 🎨 Personalização

Você pode personalizar o jogo editando as constantes em `game.js`:

```javascript
const gridSize = 20;  // Tamanho de cada célula
// Ajuste os timers em setTimeout(gameLoop, 100) para controlar velocidade
```

## 🏆 Dicas

- Planeje seus movimentos com antecedência
- Não se pressione contra as paredes
- Use a pausa para planejar estratégias
- Tente fazer a centopeia ficar cada vez maior!

---

**Desenvolvido por:** João Paulo Vieira Madureira  
**Data:** 2026