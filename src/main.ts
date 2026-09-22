import './app.css';
import { mount } from 'svelte';
import { registerSW } from 'virtual:pwa-register';
import App from './App.svelte';
import { requestPersistentStorage } from './lib/utils/persist';

registerSW({ immediate: true });
void requestPersistentStorage();

const target = document.getElementById('app');
if (!target) throw new Error('Mount-Ziel #app nicht gefunden.');

export default mount(App, { target });
