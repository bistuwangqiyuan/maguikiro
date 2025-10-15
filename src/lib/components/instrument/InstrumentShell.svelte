<script lang="ts">
  import TopBar from './TopBar.svelte';
  import LeftPanel from './LeftPanel.svelte';
  import RightPanel from './RightPanel.svelte';
  import MainDisplay from './MainDisplay.svelte';
  import { NavigationMenu } from '$lib/components/navigation';
  import { testingStore } from '$lib/stores/testing';
  import { goto } from '$app/navigation';
  
  // 菜单状态 / Menu state
  let isMenuOpen = $state(false);
  
  // 处理播放按钮 / Handle play button
  async function handlePlay() {
    const result = await testingStore.startTesting('New Test Session');
    if (!result.success) {
      console.error('Failed to start testing:', result.error);
      // TODO: Show error toast
    }
  }
  
  // 处理暂停按钮 / Handle pause button
  function handlePause() {
    testingStore.pauseTesting();
  }
  
  // 处理DISP按钮 / Handle DISP button
  function handleDisp() {
    // TODO: Implement display settings
    console.log('DISP clicked');
  }
  
  // 处理主菜单按钮 / Handle main menu button
  function handleMenu() {
    isMenuOpen = !isMenuOpen;
  }
  
  // 关闭菜单 / Close menu
  function handleCloseMenu() {
    isMenuOpen = false;
  }
  
  // 处理GATE按钮 / Handle GATE button
  function handleGate() {
    goto('/demo-gate-settings');
  }
  
  // 处理VPA按钮 / Handle VPA button
  function handleVPA() {
    // TODO: Implement VPA controls
    console.log('VPA clicked');
  }
  
  // 处理返回按钮 / Handle back button
  function handleBack() {
    window.history.back();
  }
  
  // 处理保存按钮 / Handle save button
  async function handleSave() {
    // TODO: Implement save functionality
    console.log('Save clicked');
  }
  
  // 处理旋钮变化 / Handle knob change
  function handleKnobChange(event: CustomEvent<{ value: number }>) {
    // TODO: Implement knob functionality (e.g., adjust gain)
    console.log('Knob value:', event.detail.value);
  }
</script>

<div class="instrument-shell">
  <TopBar />
  
  <div class="instrument-body">
    <LeftPanel 
      on:play={handlePlay}
      on:pause={handlePause}
      on:disp={handleDisp}
      on:menu={handleMenu}
      on:gate={handleGate}
      on:vpa={handleVPA}
    />
    <MainDisplay>
      <slot />
    </MainDisplay>
    <RightPanel 
      on:back={handleBack}
      on:save={handleSave}
      on:menu={handleMenu}
      on:knobChange={handleKnobChange}
    />
  </div>
  
  <!-- 导航菜单 / Navigation Menu -->
  <NavigationMenu isOpen={isMenuOpen} onClose={handleCloseMenu} />
</div>

<style>
  .instrument-shell {
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
    border: 8px solid var(--primary-orange, #FF6B35);
    border-radius: 12px;
    box-shadow: 
      0 0 20px rgba(255, 107, 53, 0.3),
      inset 0 2px 4px rgba(255, 255, 255, 0.1),
      inset 0 -2px 4px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .instrument-body {
    flex: 1;
    display: flex;
    gap: 8px;
    padding: 8px;
    overflow: hidden;
  }
</style>
