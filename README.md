# Drop Forge Web

Tarayıcıda çalışan 2D procedural arena shooter / roguelite.

## Çalıştırma

`index.html` dosyasını açın veya `python -m http.server 8000` ile yerel sunucu başlatıp `http://localhost:8000` adresini açın. Derleme ve dış bağımlılık gerekmez. Oyun açılır açılmaz **1280×720 çizim çözünürlüğündeki oynanabilir hazırlık alanı** yüklenir. Ekran, pencerenin yüksekliğine göre 16:9 oranını koruyarak ölçeklenir.

## Dosyalar

- `index.html` — oyun ekranı, menüler ve bağımlılık sırasıyla yüklenen CSS/JS dosyaları
- `styles/game.css` — ortak oyun ekranı ve temel arayüz stilleri
- `styles/quickbar.css` — kare slotlu hızlı envanter ve responsive HUD
- `styles/workbench.css` — atölye, eklenti kartları, stat karşılaştırmaları ve alt bildirim şeridi
- `styles/ui-refresh.css` — tüm arayüz ve HUD için ortak, kompakt görsel tema
- `src/catalog.js` — değişmeyen mermi aileleri, 12 eklenti ve silah istatistik tabloları
- `src/progression.js` — kalıcı ustalık, silah açma ve yükseltme kayıtları
- `src/abilities-data.js` — 13 silah yeteneğinin tanımları ve bekleme süreleri
- `src/shop-data.js` — sefer tüccarı ve kalıcı usta ürün/fiyat katalogları
- `src/mod-presentation.js` — silaha özgü eklenti adları, açıklamaları ve ödünleşimleri
- `src/world.js` — seed tabanlı harita/oda üretimi ve deterministik rastgelelik yardımcıları
- `src/weapon-stats.js` — ateş, HUD ve atölyenin ortak silah istatistiği hesaplayıcısı
- `src/enemy-ai.js` — düşman hareketi, kaçınma, destek ve saldırı davranışları
- `src/shop-view.js` — mağaza uygunluk kontrolleri ve ürün listesinin sunumu
- `src/map-view.js` — rota haritasının canvas çizimi
- `src/biome-view.js` — oda zemini, kapı çerçeveleri ve biyom tehlikelerinin çizimi
- `src/loadout-presentation.js` — silah stat karşılaştırması ve düşman rehberi HTML'i
- `src/scene-props.js` — hub, tüccar, çark ve jeneratör canvas çizimi
- `src/loot-view.js` — sandık, kırılabilir nesne, dekor ve ganimet çizimi
- `src/hud-view.js` — sefer HUD durumu ve animasyonlu şans çarkı ekranı çizimi
- `src/game.js` — oyun durumunu, savaş ve envanter etkileşimlerini, mağaza satın alımlarını ve sahne döngüsünü koordine eden çalışma zamanı
- `tests/smoke.test.mjs` — katalog ve ana oyun birlikte yüklenerek çalışan regresyon testleri

`npm test` regresyon testlerini, `npm run check` tüm `src/*.js` giriş dosyalarının sözdizimini kontrol eder. Tarayıcıda yükleme sırası: `catalog.js` → `progression.js` → `shop-data.js` → `mod-presentation.js` → `world.js` → `weapon-stats.js` → `attachment-effects.js` → `chest-rewards.js` → `weapon-traits.js` → `enemy-ai.js` → `shop-view.js` → `map-view.js` → `biome-view.js` → `loadout-presentation.js` → `scene-props.js` → `loot-view.js` → `hud-view.js` → `gear.js` → `bosses.js` → `game.js`.

Refaktör durumu: kataloglar, kayıtlar, eklenti sunumu, harita/oda üretimi, silah istatistikleri, düşman davranışları, mağaza görünümü, HUD çizimleri ve CSS ayrı modüllerdedir. `game.js` hâlâ büyük bir çalışma zamanı dosyasıdır; sonraki adaylar sahne çizimi, envanter/atölye etkileşimleri ve savaşın yan etkileridir. Her ayrımda açılış/hub, mağaza ve silah etkileşimleri regresyon testleriyle korunmalıdır.

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

## Oyun özellikleri

Ayrıntılı oynanış, ilerleme ve içerik notları için [FEATURES.md](FEATURES.md) dosyasına bakın.
