<div class="main-display">
  <slot />
</div>

<style>
  .main-display {
    flex: 1;
    background: linear-gradient(135deg, #0d0d0d 0%, #000000 100%);
    border: 2px solid #2d2d2d;
    border-radius: 8px;
    padding: 16px;
    overflow: auto;
    box-shadow: 
      inset 0 2px 8px rgba(0, 0, 0, 0.8),
      0 2px 4px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .main-display::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 107, 53, 0.3) 50%, 
      transparent 100%
    );
    pointer-events: none;
  }

  /* Custom scrollbar */
  .main-display::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .main-display::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 4px;
  }

  .main-display::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 4px;
  }

  .main-display::-webkit-scrollbar-thumb:hover {
    background: var(--primary-orange, #FF6B35);
  }
</style>
