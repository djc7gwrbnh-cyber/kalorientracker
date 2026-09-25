<script lang="ts">
  import TabBar from './lib/components/TabBar.svelte';
  import Toast from './lib/components/Toast.svelte';
  import TodayScreen from './lib/screens/TodayScreen.svelte';
  import TrainingScreen from './lib/screens/TrainingScreen.svelte';
  import HistoryScreen from './lib/screens/HistoryScreen.svelte';
  import LibraryScreen from './lib/screens/LibraryScreen.svelte';
  import WeightScreen from './lib/screens/WeightScreen.svelte';
  import OnboardingScreen from './lib/screens/OnboardingScreen.svelte';
  import { profileStore } from './lib/stores/profile.svelte';
  import type { Tab } from './lib/navigation';

  let tab = $state<Tab>('today');

  void profileStore.load();
</script>

{#if !profileStore.ready}
  <div class="boot"></div>
{:else if !profileStore.current}
  <OnboardingScreen />
{:else}
  <div class="app">
    <main>
      {#if tab === 'today'}
        <TodayScreen />
      {:else if tab === 'training'}
        <TrainingScreen />
      {:else if tab === 'history'}
        <HistoryScreen />
      {:else if tab === 'library'}
        <LibraryScreen />
      {:else}
        <WeightScreen />
      {/if}
    </main>
    <TabBar active={tab} onselect={(next) => (tab = next)} />
  </div>
  <Toast />
{/if}

<style>
  .boot {
    height: 100dvh;
    background: var(--bg);
  }

  .app {
    position: relative;
    height: 100dvh;
    overflow: hidden;
  }

  main {
    height: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding-top: var(--safe-top);
    padding-left: var(--safe-left);
    padding-right: var(--safe-right);
    /* Inhalt scrollt unter der transluzenten Tab-Leiste hindurch. */
    padding-bottom: calc(var(--tabbar-height) + var(--safe-bottom));
  }
</style>
