# Kalorientracker

Schlichte Kalorienzähler-PWA für das iPhone. Alle Daten bleiben lokal auf dem
Gerät – kein Konto, kein Server, kein Tracking.

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # Typprüfung + Produktions-Build nach dist/
npm test         # Unit-Tests der Berechnungslogik
```

Die App-Icons liegen unter `public/` und werden mit
`node scripts/generate-icons.mjs` neu erzeugt.

## Stack

- **Svelte 5 + TypeScript + Vite** – kompiliert zu kleinem Vanilla-JS ohne
  Framework-Runtime.
- **Dexie.js** – schlanker IndexedDB-Wrapper mit sauberen Migrationen.
- **vite-plugin-pwa** – erzeugt Service Worker und Web App Manifest.
- **barcode-detector** – nur für den Barcode-Scanner, erst beim ersten Scan
  nachgeladen (Safari kennt die `BarcodeDetector`-API nicht). Die
  WebAssembly-Datei liegt im eigenen Verzeichnis, nicht auf einem fremden CDN.

Mehr Laufzeit-Abhängigkeiten gibt es nicht; Diagramme und Ringe sind
handgeschriebenes SVG.

## Online-Suche

Optional lassen sich Lebensmittel über [Open Food Facts](https://world.openfoodfacts.org)
suchen oder per Barcode abrufen. Die Werte sind vor dem Speichern bearbeitbar
und landen danach lokal in der Datenbank. Ohne Internet meldet die App das
sauber; alles andere funktioniert weiter.

## Deployment

Jeder Push baut die App per GitHub Actions und veröffentlicht sie auf GitHub
Pages (siehe `.github/workflows/deploy.yml`). Der Basis-Pfad ist auf
`/kalorientracker/` gesetzt und lässt sich über die Umgebungsvariable
`BASE_PATH` überschreiben.

## Installation auf dem iPhone

Seite in Safari öffnen → Teilen-Menü → „Zum Home-Bildschirm“.
