<script lang="ts">
  import { NavigationMenu } from '$lib/components/navigation';
  
  let isMenuOpen = $state(false);
  
  function openMenu() {
    isMenuOpen = true;
  }
  
  function closeMenu() {
    isMenuOpen = false;
  }
</script>

<div class="demo-container">
  <div class="demo-header">
    <h1 class="demo-title">导航菜单演示 / Navigation Menu Demo</h1>
    <p class="demo-description">
      点击下方按钮打开主导航菜单，体验工业级的菜单交互设计。
      <br />
      Click the button below to open the main navigation menu and experience industrial-grade menu interaction design.
    </p>
  </div>
  
  <div class="demo-content">
    <div class="info-card">
      <h2 class="card-title">功能特性 / Features</h2>
      <ul class="feature-list">
        <li>
          <strong>10个菜单项</strong> - 覆盖所有主要功能
          <br />
          <span class="feature-detail">10 Menu Items - Covers all major features</span>
        </li>
        <li>
          <strong>平滑动画</strong> - 淡入背景和滑入面板效果
          <br />
          <span class="feature-detail">Smooth Animations - Fade-in backdrop and slide-in panel</span>
        </li>
        <li>
          <strong>当前页面高亮</strong> - 自动标记当前所在页面
          <br />
          <span class="feature-detail">Active State - Automatically highlights current page</span>
        </li>
        <li>
          <strong>双语标签</strong> - 中英文双语显示
          <br />
          <span class="feature-detail">Bilingual Labels - Chinese and English for each item</span>
        </li>
        <li>
          <strong>响应式设计</strong> - 适配不同屏幕尺寸
          <br />
          <span class="feature-detail">Responsive Design - Adapts to different screen sizes</span>
        </li>
        <li>
          <strong>全屏模式</strong> - 支持一键切换全屏
          <br />
          <span class="feature-detail">Fullscreen Mode - One-click fullscreen toggle</span>
        </li>
      </ul>
    </div>
    
    <div class="action-card">
      <button class="demo-button" onclick={openMenu}>
        <svg viewBox="0 0 24 24" class="button-icon">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
        </svg>
        <span class="button-text">打开主菜单 / Open Main Menu</span>
      </button>
      
      <p class="action-hint">
        提示：在实际应用中，菜单按钮位于仪器外壳的左侧和右侧面板上。
        <br />
        Tip: In the actual application, menu buttons are located on the left and right panels of the instrument shell.
      </p>
    </div>
    
    <div class="info-card">
      <h2 class="card-title">菜单项列表 / Menu Items</h2>
      <div class="menu-items-grid">
        <div class="menu-item-card">
          <div class="item-icon">📁</div>
          <div class="item-name">文件管理</div>
          <div class="item-name-en">File Management</div>
        </div>
        <div class="menu-item-card">
          <div class="item-icon">📍</div>
          <div class="item-name">切位置</div>
          <div class="item-name-en">Position</div>
        </div>
        <div class="menu-item-card">
          <div class="item-icon">🖥️</div>
          <div class="item-name">图像显示</div>
          <div class="item-name-en">Display</div>
        </div>
        <div class="menu-item-card">
          <div class="item-icon">⚙️</div>
          <div class="item-name">阈值设置</div>
          <div class="item-name-en">Threshold</div>
        </div>
        <div class="menu-item-card">
          <div class="item-icon">🚪</div>
          <div class="item-name">闸门设置</div>
          <div class="item-name-en">Gate Settings</div>
        </div>
        <div class="menu-item-card">
          <div class="item-icon">🔧</div>
          <div class="item-name">系统设置</div>
          <div class="item-name-en">System Settings</div>
        </div>
        <div class="menu-item-card">
          <div class="item-icon">⛶</div>
          <div class="item-name">全屏模式</div>
          <div class="item-name-en">Fullscreen</div>
        </div>
        <div class="menu-item-card">
          <div class="item-icon">🔬</div>
          <div class="item-name">校准</div>
          <div class="item-name-en">Calibration</div>
        </div>
        <div class="menu-item-card">
          <div class="item-icon">❓</div>
          <div class="item-name">帮助</div>
          <div class="item-name-en">Help</div>
        </div>
        <div class="menu-item-card">
          <div class="item-icon">ℹ️</div>
          <div class="item-name">关于</div>
          <div class="item-name-en">About</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 导航菜单 / Navigation Menu -->
<NavigationMenu isOpen={isMenuOpen} onClose={closeMenu} />

<style>
  .demo-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
    padding: 40px 20px;
  }
  
  .demo-header {
    max-width: 1200px;
    margin: 0 auto 40px;
    text-align: center;
  }
  
  .demo-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--primary-orange, #FF6B35);
    margin: 0 0 16px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  
  .demo-description {
    font-size: 16px;
    color: #b0b0b0;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .demo-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .info-card,
  .action-card {
    background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%);
    border: 2px solid #3d3d3d;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 2px rgba(255, 255, 255, 0.1);
  }
  
  .card-title {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #3d3d3d;
  }
  
  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .feature-list li {
    padding-left: 24px;
    position: relative;
    color: #fff;
    line-height: 1.6;
  }
  
  .feature-list li::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: var(--primary-orange, #FF6B35);
    font-size: 18px;
  }
  
  .feature-detail {
    color: #b0b0b0;
    font-size: 14px;
  }
  
  .action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 48px 32px;
  }
  
  .demo-button {
    background: linear-gradient(135deg, var(--primary-orange, #FF6B35) 0%, #E55A2B 100%);
    border: 3px solid var(--primary-orange, #FF6B35);
    border-radius: 12px;
    padding: 24px 48px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s ease;
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(255, 107, 53, 0.4);
  }
  
  .demo-button:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(255, 107, 53, 0.6);
  }
  
  .demo-button:active {
    transform: translateY(0);
  }
  
  .button-icon {
    width: 32px;
    height: 32px;
    color: #fff;
  }
  
  .button-text {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .action-hint {
    text-align: center;
    color: #b0b0b0;
    font-size: 14px;
    line-height: 1.6;
    max-width: 600px;
  }
  
  .menu-items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .menu-item-card {
    background: #2d2d2d;
    border: 2px solid #3d3d3d;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
  }
  
  .menu-item-card:hover {
    border-color: var(--primary-orange, #FF6B35);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  .item-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .item-name {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    text-align: center;
  }
  
  .item-name-en {
    font-size: 11px;
    color: #b0b0b0;
    text-align: center;
    text-transform: uppercase;
  }
  
  @media (max-width: 768px) {
    .demo-title {
      font-size: 24px;
    }
    
    .demo-description {
      font-size: 14px;
    }
    
    .info-card,
    .action-card {
      padding: 24px;
    }
    
    .menu-items-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
    }
    
    .button-text {
      font-size: 16px;
    }
  }
</style>
