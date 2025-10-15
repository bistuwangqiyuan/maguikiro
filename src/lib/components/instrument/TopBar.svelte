<script lang="ts">
  import { onMount } from 'svelte';
  
  let currentTime = '';
  
  onMount(() => {
    const updateTime = () => {
      const now = new Date();
      currentTime = now.toLocaleTimeString('zh-CN', { hour12: false });
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  });
</script>

<div class="top-bar">
  <div class="brand-section">
    <div class="brand-logo">DOPPLER</div>
    <div class="model-info">MT-2000 Series</div>
  </div>
  
  <div class="status-section">
    <div class="status-item">
      <span class="status-label">状态</span>
      <span class="status-value ready">就绪</span>
    </div>
    <div class="status-item">
      <span class="status-label">时间</span>
      <span class="status-value">{currentTime}</span>
    </div>
  </div>
</div>

<style>
  .top-bar {
    height: 60px;
    background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
    border-bottom: 2px solid var(--primary-orange, #FF6B35);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .brand-section {
    display: flex;
    align-items: baseline;
    gap: 16px;
  }

  .brand-logo {
    font-size: 28px;
    font-weight: 700;
    color: var(--primary-orange, #FF6B35);
    text-shadow: 
      0 0 10px rgba(255, 107, 53, 0.5),
      0 2px 4px rgba(0, 0, 0, 0.8);
    letter-spacing: 2px;
  }

  .model-info {
    font-size: 14px;
    color: #b0b0b0;
    font-weight: 500;
  }

  .status-section {
    display: flex;
    gap: 32px;
  }

  .status-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .status-label {
    font-size: 11px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .status-value {
    font-size: 16px;
    color: #fff;
    font-weight: 600;
    font-family: 'Roboto Mono', monospace;
  }

  .status-value.ready {
    color: #4CAF50;
    text-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
  }
</style>
