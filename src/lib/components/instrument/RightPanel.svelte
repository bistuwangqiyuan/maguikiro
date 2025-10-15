<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let knobValue = 50;
  let isDragging = false;
  let startY = 0;
  let startValue = 0;
  
  const handleBack = () => dispatch('back');
  const handleSave = () => dispatch('save');
  const handleMenu = () => dispatch('menu');
  
  const handleKnobMouseDown = (e: MouseEvent) => {
    isDragging = true;
    startY = e.clientY;
    startValue = knobValue;
    document.addEventListener('mousemove', handleKnobMouseMove);
    document.addEventListener('mouseup', handleKnobMouseUp);
  };
  
  const handleKnobMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = startY - e.clientY;
    const newValue = Math.max(0, Math.min(100, startValue + deltaY / 2));
    knobValue = Math.round(newValue);
    dispatch('knobChange', { value: knobValue });
  };
  
  const handleKnobMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', handleKnobMouseMove);
    document.removeEventListener('mouseup', handleKnobMouseUp);
  };
</script>

<div class="right-panel">
  <div class="button-group">
    <button class="panel-button" on:click={handleBack}>
      <svg viewBox="0 0 24 24" class="button-icon">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
      </svg>
      <span class="button-label">返回</span>
    </button>
    
    <button class="panel-button save" on:click={handleSave}>
      <svg viewBox="0 0 24 24" class="button-icon">
        <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" fill="currentColor"/>
      </svg>
      <span class="button-label">SAVE</span>
    </button>
    
    <button class="panel-button" on:click={handleMenu}>
      <svg viewBox="0 0 24 24" class="button-icon">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
      </svg>
      <span class="button-label">MENU</span>
    </button>
  </div>
  
  <div class="knob-section">
    <div class="knob-label">调节</div>
    <div 
      class="knob" 
      class:dragging={isDragging}
      on:mousedown={handleKnobMouseDown}
      role="slider"
      aria-valuenow={knobValue}
      aria-valuemin="0"
      aria-valuemax="100"
      tabindex="0"
    >
      <div class="knob-inner" style="transform: rotate({knobValue * 2.7}deg)">
        <div class="knob-indicator"></div>
      </div>
      <div class="knob-value">{knobValue}</div>
    </div>
    <div class="knob-marks">
      <span>0</span>
      <span>50</span>
      <span>100</span>
    </div>
  </div>
</div>

<style>
  .right-panel {
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

  .panel-button:hover {
    background: linear-gradient(135deg, #4a4a4a 0%, #3d3d3d 100%);
    border-color: var(--primary-orange, #FF6B35);
    color: #fff;
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 12px rgba(255, 107, 53, 0.3);
  }

  .panel-button:active {
    transform: translateY(2px);
    box-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.3),
      inset 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .panel-button.save {
    border-color: #4CAF50;
  }

  .panel-button.save:hover {
    border-color: #4CAF50;
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 12px rgba(76, 175, 80, 0.4);
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

  .knob-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-top: auto;
  }

  .knob-label {
    font-size: 12px;
    color: #b0b0b0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .knob {
    width: 90px;
    height: 90px;
    background: radial-gradient(circle, #3d3d3d 0%, #1a1a1a 100%);
    border: 3px solid #4a4a4a;
    border-radius: 50%;
    cursor: grab;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.5),
      inset 0 2px 4px rgba(255, 255, 255, 0.1),
      inset 0 -2px 4px rgba(0, 0, 0, 0.5);
    transition: all 0.2s ease;
  }

  .knob:hover {
    border-color: var(--primary-orange, #FF6B35);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.6),
      0 0 16px rgba(255, 107, 53, 0.3),
      inset 0 2px 4px rgba(255, 255, 255, 0.1);
  }

  .knob.dragging {
    cursor: grabbing;
    border-color: var(--primary-orange, #FF6B35);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.6),
      0 0 20px rgba(255, 107, 53, 0.5),
      inset 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .knob-inner {
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.1s ease;
  }

  .knob-indicator {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 20px;
    background: var(--primary-orange, #FF6B35);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(255, 107, 53, 0.8);
  }

  .knob-value {
    position: absolute;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    font-family: 'Roboto Mono', monospace;
    pointer-events: none;
  }

  .knob-marks {
    display: flex;
    justify-content: space-between;
    width: 90px;
    font-size: 10px;
    color: #666;
    font-family: 'Roboto Mono', monospace;
  }
</style>
