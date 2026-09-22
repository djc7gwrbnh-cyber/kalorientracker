import './app.css';
import { mount } from 'svelte';
import { registerSW } from 'virtual:pwa-register';
import App from './App.svelte';
import { toastStore } from './lib/stores/toast.svelte';
import { requestPersistentStorage } from './lib/utils/persist';

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    toastStore.show(
      'Neue Version verfügbar',
      { label: 'Neu laden', run: () => updateSW(true) },
      20_000,
    );
  },
});

void requestPersistentStorage();

const target = document.getElementById('app');
if (!target) throw new Error('Mount-Ziel #app nicht gefunden.');

export default mount(App, { target });
