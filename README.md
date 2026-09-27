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

## Oynanış döngüsü

- **Forge Flow:** İsabetler, öldürmeler ve dash ile mermiden kaçış göstergesi doldurur. Dövüşten uzaklaşınca azalır; yüksek seviyede silah XP bonusu vardır.
- **Hareket bonusu:** Kanca kullanırken veya dash/duvar zıplamasından kısa süre sonra yapılan atışlar daha fazla hasar verir.
- **Okunabilir saldırılar:** Tank saldırı alanını, menzilli düşmanlar nişan çizgisini saldırı öncesinde gösterir.
- **Yeni görevler:** Jeneratör savunmasında süre boyunca jeneratörü koruyun; hedef avında işaretli düşmanı yenerek portalları kapatın.
- **Rota ödülleri:** M haritasında komşu odaların görev türü ve öngörülebilen mermi / silah XP / eklenti / sağlık ödülleri görünür.
- **Eklenti sinerjileri:** Ark tüfeğinde Faz Çekirdeği alan hasarını, patlayıcı silahta Dengeleyici patlama yarıçapını artırır. TAB çantası bu sinerjiyi gösterir.

## Geliştirme ve kontrol

`npm run check` sözdizimini, `npm test` regresyon testlerini kontrol eder. GitHub Actions, `main` dalına gönderilen değişikliklerde ve pull request'lerde aynı kontrolleri çalıştırır.

Bu ilk entegrasyon sürümüdür. Hasar, Forge Flow kazanımı ve yeni görev sürelerinin oynanışta dengelenmesi gereklidir.
