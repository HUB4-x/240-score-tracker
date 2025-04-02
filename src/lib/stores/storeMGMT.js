import { writable } from 'svelte/store';

export function createLocalStorageStore(key, initialValue) {
    let value = initialValue;
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            value = JSON.parse(stored);
        }
    } catch (e) {
        console.error(`Error loading ${key} from localStorage`, e);
    }

    const store = writable(value);

    store.subscribe(val => {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.error(`Error saving ${key} to localStorage`, e);
        }
    });

    return store;
}


export function resetStorageCompletely(){
    localStorage.clear();
}

export function deleteStorage(storagename){
    localStorage.removeItem(storagename);
}
