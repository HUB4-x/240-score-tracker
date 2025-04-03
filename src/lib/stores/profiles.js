import { createLocalStorageStore } from "./storeMGMT";

export const players = createLocalStorageStore('players', [
    {
        id: 1,
        name: 'Gast 1',
        isGast: true,
        color: 'red',
        abrv: 'G1',
    },
    {
        id: 2,
        name: 'Gast 2',
        isGast: true,
        color: 'green', 
        abrv: 'G2',
    },
    {
        id: 3,
        name: 'Gast 3',
        isGast: true,
        color: 'purple',
        abrv: 'G3',
    },
    {
        id: 4,
        name: 'Gast 4',
        isGast: true,
        color: 'yellow',
        abrv: 'G4',
    },
]);
