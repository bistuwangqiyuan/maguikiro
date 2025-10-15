<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let isPlaying = false;
  
  const handlePlay = () => {
    isPlaying = true;
    dispatch('play');
  };
  
  const handlePause = () => {
    isPlaying = false;
    dispatch('pause');
  };
  
  const handleDisp = () => dispatch('disp');
  const handleMenu = () => dispatch('menu');
  const handleGate = () => dispatch('gate');
  const handleVPA = () => dispatch('vpa');
</script>

<div class="left-panel">
  <div class="button-group">
    <button 
      class="panel-button play" 
      class:active={isPlaying}
      on:click={handlePlay}
      disabled={isPlaying}
    >
      <svg viewBox="0 0 24 24" class="button-icon">
        <path d="M8 5v14l11-7z" fill="currentColor"/>
      </svg>
      <span class="button-label">播放</span>
    </button>
    
    <button 
      class="panel-button pause" 
      class:active={!isPlaying}
      on:click={handlePause}
      disabled={!isPlaying}
    >
      <svg viewBox="0 0 24 24" class="button-icon">
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="currentColor"/>
      </svg>
      <span class="button-label">暂停</span>
    </button>
  </div>
  
  <div class="button-group">
    <button class="panel-button" on:click={handleDisp}>
      <svg viewBox="0 0 24 24" class="button-icon">
        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="currentColor"/>
      </svg>
      <span class="button-label">DISP</span>
    </button>
    
    <button class="panel-button" on:click={handleMenu}>
      <svg viewBox="0 0 24 24" class="button-icon">
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
      </svg>
      <span class="button-label">主菜单</span>
    </button>
  </div>
  
  <div class="button-group">
    <button class="panel-button gate" on:click={handleGate}>
      <svg viewBox="0 0 24 24" class="button-icon">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" fill="currentColor"/>
      </svg>
      <span class="button-label">GATE</span>
    </button>
    
    <button class="panel-button vpa" on:click={handleVPA}>
      <svg viewBox="0 0 24 24" class="button-icon">
        <path d="M7 14l5-5 5 5z" fill="currentColor"/>
      </svg>
      <span class="button-label">VPA</span>
    </button>
  </div>
</div>

<style>
  .left-panel {
    width: 120px;
    background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
    border-radius: 8px;
    padding: 16px 8px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    box-shadow: 
      inset 0 2px 4px rgba(0, 0, 0, 0.5),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .panel-button {
    width: 100%;
    height: 80px;
    background: linear-gradient(135deg, #3d3d3d 0%, #2d2d2d 100%);
    border: 2px solid #4a4a4a;
    border-radius: 8px;
    color: #b0b0b0;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 2px rgba(255, 255, 255, 0.1);
  }

  .panel-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #4a4a4a 0%, #3d3d3d 100%);
    border-color: var(--primary-orange, #FF6B35);
    color: #fff;
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 12px rgba(255, 107, 53, 0.3);
  }

  .panel-button:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.3),
      inset 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .panel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .panel-button.active {
    background: linear-gradient(135deg, var(--primary-orange, #FF6B35) 0%, #E55A2B 100%);
    border-color: var(--primary-orange, #FF6B35);
    color: #fff;
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 16px rgba(255, 107, 53, 0.6),
      inset 0 1px 2px rgba(255, 255, 255, 0.2);
  }

  .button-icon {
    width: 32px;
    height: 32px;
  }

  .button-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .panel-button.play .button-icon,
  .panel-button.pause .button-icon {
    width: 36px;
    height: 36px;
  }

  .panel-button.gate {
    border-color: #FFD700;
  }

  .panel-button.gate:hover:not(:disabled) {
    border-color: #FFD700;
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 12px rgba(255, 215, 0, 0.4);
  }

  .panel-button.vpa {
    border-color: #FF69B4;
  }

  .panel-button.vpa:hover:not(:disabled) {
    border-color: #FF69B4;
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 12px rgba(255, 105, 180, 0.4);
  }
</style>
