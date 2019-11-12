# SOS - UI pubblica

## Configurazione
I file di configurazione sono in `src/environments` (uno per ogni ambiente) e contengono gli indirizzi del backend attivo.

È necessario inoltre settare il collegamento al pacchetto "shared": cambiare il riferimento in `package.json`
per la dipendeza `@sos/sos-ui-shared` in modo che punti alla corretta locazione del pacchetto.

## Packaging
Requisiti per la compilazione sono node.js ed npm.
Scaricare le dipendenze con `npm install`.
Per compilare l'applicazione eseguire `npx ng build -aot -prod`.
Questo produrrà la cartella `dist`.

## Deploy
L'intero contenuto della cartella `dist` può essere caricato su un qualsiasi Web server direttamente.
