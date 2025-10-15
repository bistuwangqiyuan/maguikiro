<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  interface MenuItem {
    id: string;
    label: string;
    labelEn: string;
    icon: string;
    path?: string;
    action?: () => void;
  }
  
  interface Props {
    isOpen?: boolean;
    onClose?: () => void;
  }
  
  let { isOpen = false, onClose }: Props = $props();
  
  // 菜单项配置 / Menu items configuration
  const menuItems: MenuItem[] = [
    {
      id: 'display',
      label: '图像显示',
      labelEn: 'Display',
      icon: 'M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z',
      path: '/'
    },
    {
      id: 'dashboard',
      label: '仪表盘',
      labelEn: 'Dashboard',
      icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
      path: '/dashboard'
    },
    {
      id: 'history',
      label: '历史记录',
      labelEn: 'History',
      icon: 'M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z',
      path: '/history'
    },
    {
      id: 'reports',
      label: '报告',
      labelEn: 'Reports',
      icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
      path: '/reports'
    },
    {
      id: 'threshold',
      label: '阈值设置',
      labelEn: 'Threshold',
      icon: 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
      path: '/demo-parameters'
    },
    {
      id: 'gate',
      label: '闸门设置',
      labelEn: 'Gate Settings',
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
      path: '/demo-gate-settings'
    },
    {
      id: 'settings',
      label: '系统设置',
      labelEn: 'System Settings',
      icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
      path: '/settings'
    },
    {
      id: 'fullscreen',
      label: '全屏模式',
      labelEn: 'Fullscreen',
      icon: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',
      action: toggleFullscreen
    },
    {
      id: 'calibration',
      label: '校准',
      labelEn: 'Calibration',
      icon: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
      path: '/calibration'
    },
    {
      id: 'help',
      label: '帮助',
      labelEn: 'Help',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
      path: '/help'
    },
    {
      id: 'about',
      label: '关于',
      labelEn: 'About',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
      path: '/about'
    }
  ];
  
  // 切换全屏模式 / Toggle fullscreen mode
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    handleClose();
  }
  
  // 处理菜单项点击 / Handle menu item click
  function handleMenuItemClick(item: MenuItem) {
    if (item.action) {
      item.action();
    } else if (item.path) {
      goto(item.path);
      handleClose();
    }
  }
  
  // 关闭菜单 / Close menu
  function handleClose() {
    if (onClose) {
      onClose();
    }
  }
  
  // 处理背景点击 / Handle backdrop click
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
  
  // 检查是否为当前页面 / Check if current page
  function isCurrentPage(path?: string): boolean {
    if (!path) return false;
    return $page.url.pathname === path;
  }
</script>

<!-- 菜单背景遮罩 / Menu backdrop -->
{#if isOpen}
  <div 
    class="menu-backdrop" 
    onclick={handleBackdropClick}
    role="button"
    tabindex="-1"
    aria-label="Close menu"
  >
    <!-- 菜单面板 / Menu panel -->
    <div class="menu-panel" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <!-- 菜单标题 / Menu title -->
      <div class="menu-header">
        <h2 class="menu-title">
          主菜单 / Main Menu
        </h2>
        <button 
          class="close-button" 
          onclick={handleClose}
          aria-label="Close menu"
        >
          <svg viewBox="0 0 24 24" class="close-icon">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <!-- 菜单项列表 / Menu items list -->
      <div class="menu-items">
        {#each menuItems as item (item.id)}
          <button
            class="menu-item"
            class:active={isCurrentPage(item.path)}
            onclick={() => handleMenuItemClick(item)}
            aria-label={`${item.label} / ${item.labelEn}`}
          >
            <svg viewBox="0 0 24 24" class="menu-icon">
              <path d={item.icon} fill="currentColor"/>
            </svg>
            <div class="menu-label">
              <span class="label-zh">{item.label}</span>
              <span class="label-en">{item.labelEn}</span>
            </div>
            {#if isCurrentPage(item.path)}
              <svg viewBox="0 0 24 24" class="check-icon">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .menu-panel {
    background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
    border: 3px solid var(--primary-orange, #FF6B35);
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.6),
      0 0 20px rgba(255, 107, 53, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.1);
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      transform: scale(0.9) translateY(-20px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
  
  .menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 2px solid #3d3d3d;
    background: linear-gradient(135deg, #3d3d3d 0%, #2d2d2d 100%);
    border-radius: 9px 9px 0 0;
  }
  
  .menu-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--primary-orange, #FF6B35);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .close-button {
    width: 40px;
    height: 40px;
    background: transparent;
    border: 2px solid #4a4a4a;
    border-radius: 8px;
    color: #b0b0b0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .close-button:hover {
    background: #3d3d3d;
    border-color: var(--primary-orange, #FF6B35);
    color: #fff;
    box-shadow: 0 0 12px rgba(255, 107, 53, 0.3);
  }
  
  .close-icon {
    width: 24px;
    height: 24px;
  }
  
  .menu-items {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .menu-item {
    background: linear-gradient(135deg, #3d3d3d 0%, #2d2d2d 100%);
    border: 2px solid #4a4a4a;
    border-radius: 8px;
    padding: 20px 16px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    transition: all 0.2s ease;
    position: relative;
    min-height: 120px;
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 1px 2px rgba(255, 255, 255, 0.1);
  }
  
  .menu-item:hover {
    background: linear-gradient(135deg, #4a4a4a 0%, #3d3d3d 100%);
    border-color: var(--primary-orange, #FF6B35);
    transform: translateY(-2px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 16px rgba(255, 107, 53, 0.3);
  }
  
  .menu-item:active {
    transform: translateY(0);
  }
  
  .menu-item.active {
    background: linear-gradient(135deg, var(--primary-orange, #FF6B35) 0%, #E55A2B 100%);
    border-color: var(--primary-orange, #FF6B35);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(255, 107, 53, 0.6),
      inset 0 1px 2px rgba(255, 255, 255, 0.2);
  }
  
  .menu-icon {
    width: 40px;
    height: 40px;
    color: #b0b0b0;
    transition: color 0.2s ease;
  }
  
  .menu-item:hover .menu-icon,
  .menu-item.active .menu-icon {
    color: #fff;
  }
  
  .menu-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
  }
  
  .label-zh {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.5px;
  }
  
  .label-en {
    font-size: 11px;
    color: #b0b0b0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .menu-item:hover .label-en,
  .menu-item.active .label-en {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .check-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    color: #fff;
  }
  
  /* 滚动条样式 / Scrollbar styles */
  .menu-items::-webkit-scrollbar {
    width: 8px;
  }
  
  .menu-items::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 4px;
  }
  
  .menu-items::-webkit-scrollbar-thumb {
    background: #4a4a4a;
    border-radius: 4px;
  }
  
  .menu-items::-webkit-scrollbar-thumb:hover {
    background: var(--primary-orange, #FF6B35);
  }
  
  /* 响应式设计 / Responsive design */
  @media (max-width: 768px) {
    .menu-panel {
      width: 95%;
      max-height: 90vh;
    }
    
    .menu-items {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
    }
    
    .menu-item {
      min-height: 100px;
      padding: 16px 12px;
    }
    
    .menu-icon {
      width: 32px;
      height: 32px;
    }
    
    .label-zh {
      font-size: 13px;
    }
    
    .label-en {
      font-size: 10px;
    }
  }
</style>
