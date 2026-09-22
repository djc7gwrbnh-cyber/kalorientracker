<script lang="ts">
  import { TABS, type Tab } from '../navigation';

  let { active, onselect }: { active: Tab; onselect: (tab: Tab) => void } = $props();
</script>

<nav class="tabbar" aria-label="Hauptnavigation">
  {#each TABS as tab (tab.id)}
    <button
      type="button"
      class="tab"
      class:active={active === tab.id}
      aria-current={active === tab.id ? 'page' : undefined}
      onclick={() => onselect(tab.id)}
    >
      <svg
        class="icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        {#if tab.id === 'today'}
          <path d="M12 4a8 8 0 1 0 8 8" />
          <circle cx="12" cy="4" r="0.9" fill="currentColor" stroke="none" />
        {:else if tab.id === 'history'}
          <circle cx="5.2" cy="7" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="5.2" cy="12" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="5.2" cy="17" r="1.1" fill="currentColor" stroke="none" />
          <path d="M9.5 7h9.3M9.5 12h9.3M9.5 17h9.3" />
        {:else if tab.id === 'library'}
          <rect x="5" y="4" width="14" height="16" rx="2.5" />
          <path d="M9 4v16" />
        {:else}
          <path d="M4 16.5l4.6-5 3.4 3L20 7" />
        {/if}
      </svg>
      <span class="label">{tab.label}</span>
    </button>
  {/each}
</nav>

<style>
  .tabbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: stretch;
    padding-bottom: var(--safe-bottom);
    padding-left: var(--safe-left);
    padding-right: var(--safe-right);
    border-top: 0.5px solid var(--separator);
    background: color-mix(in srgb, var(--bg) 82%, transparent);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    backdrop-filter: blur(20px) saturate(180%);
  }

  .tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-height: var(--tabbar-height);
    padding: 7px 0 6px;
    color: var(--text-2);
    transition: color 0.15s ease;
  }

  .tab.active {
    color: var(--accent);
  }

  .tab:active .icon {
    transform: scale(0.92);
  }

  .icon {
    width: 26px;
    height: 26px;
    transition: transform 0.12s ease;
  }

  .label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
</style>
