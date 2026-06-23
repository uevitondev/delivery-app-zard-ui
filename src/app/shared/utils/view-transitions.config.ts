/**
 * Configuração de View Transitions API
 * Define animações customizadas por tipo de transição de rota
 */

export const viewTransitionConfig = {
  // Transição padrão (fade suave)
  default: {
    animation: 'fade 0.3s ease-in-out',
  },

  // Transição para detalhes (slide da direita)
  detail: {
    animation: 'slide-from-right 0.3s ease-out',
  },

  // Transição de volta (slide da esquerda)
  back: {
    animation: 'slide-from-left 0.3s ease-out',
  },

  // Transição para checkout (fade + scale)
  checkout: {
    animation: 'fade-scale 0.3s ease-out',
  },

  // Transição para modais (fade + scale up)
  modal: {
    animation: 'fade-scale-up 0.2s ease-out',
  },
};

/**
 * Animações CSS customizadas para View Transitions
 * Adicionar estas regras no arquivo CSS global (styles.css)
 */
export const viewTransitionStyles = `
/* Animação de fade padrão */
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Animação de slide da direita (para detalhes) */
@keyframes slide-from-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Animação de slide da esquerda (para voltar) */
@keyframes slide-from-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Animação de fade + scale (para checkout) */
@keyframes fade-scale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Animação de fade + scale up (para modais) */
@keyframes fade-scale-up {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* View Transition Names para elementos compartilhados */
.restaurant-card-image {
  view-transition-name: restaurant-image;
}

.restaurant-card-title {
  view-transition-name: restaurant-title;
}

/* Configuração de duração das transições */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

/* Suavizar transições de imagem */
::view-transition-old(restaurant-image),
::view-transition-new(restaurant-image) {
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
}
`;