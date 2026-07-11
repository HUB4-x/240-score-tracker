import { mount } from 'svelte';

import './app.css';
import App from './App.svelte';
import { initializeDatabase } from './db/database';

async function startApp() {
  const target = document.getElementById('app');

  if (!target) {
    throw new Error('Could not find the #app element.');
  }

  await initializeDatabase();

  mount(App, {
    target
  });
}

void startApp();