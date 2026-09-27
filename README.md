# Drop Forge Web

Tarayıcıda çalışan 2D procedural arena shooter / roguelite.

## Çalıştırma

`index.html` dosyasını açın veya `python -m http.server 8000` ile yerel sunucu başlatıp `http://localhost:8000` adresini açın. Derleme ve dış bağımlılık gerekmez.

## Dosyalar

- `index.html` — oyun ekranı ve menüler
- `styles/game.css` — retro arayüz ve görsel stiller
- `src/game.js` — mevcut oyun mantığı (davranışı korumak için ilk aktarımda tek dosyada)
- `tests/smoke.test.mjs` — temel doğrulamalar

`npm test` temel testleri, `npm run check` JavaScript sözdizimini kontrol eder.

Sonraki aşamada oyun mantığı bağımsız modüllere ayrılabilir.
