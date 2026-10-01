# Drop Forge Web

Tarayıcıda çalışan, seed tabanlı haritası ve dört bölgeli uzun sefer yapısı bulunan 2D pixel-art roguelite shooter.

## Başlatma

`index.html` dosyasını tarayıcıda açın veya proje dizininde `python -m http.server 8000` çalıştırıp `http://localhost:8000` adresine gidin. Derleme ve harici paket yükleme gerekmiyor. Oyun 1280 × 720 çizim alanını pencereye göre ölçeklendirir.

## Güncel oynanış — Ekim 2026

- **Hazırlık alanı:** Atölyeye `E` ile gir; iki başlangıç silahını, her silahın **sağ tık yeteneğini** ve bağımsız **Z karakter modülünü** seç. Blueprint koleksiyonu, zırh atölyesi, kalıcı usta, hedef kuklası ve ödülsüz savaş test alanı bulunur.
- **Silah gelişimi:** 13 silah, silah gruplarına göre seçilebilen **36 run özelliği** kullanır. Her silahın **üç eşdeğer özellik yuvası** vardır; eski 1 ana + 2 destek zorunlu dizilimi geçerli değildir. Bir özelliği tekrar alarak üç seviyeye kadar yükseltirsin.
- **Ödül akışı:** İlgili sandık/oda ödülünde önce geliştireceğin silahı, ardından o silaha uygun özellik seçeneklerini seçersin. Özellikler anında silaha uygulanır; eski dört yuvalı eklenti çantasına gitmez. Beş tanımlı ikili sinerji bulunur.
- **Savaş:** Sol tık ateş, sağ tık seçili silahın bekleme süreli özel yeteneği, `Z` karakter modülü, `V` üç vuruşlu yakın dövüş veya uygun sersemlemiş hedefte **finisher**. Finisher hedefe kısa bir atılma animasyonuyla ulaşır.
- **Savunma ve hareket:** Dash, çift zıplama, durum etkileri, kalkanlar, zırh setleri ve zırha takılan pasif çipler. İlgili çipler finisher, dash, mühimmat veya hasar alma mekaniklerini geliştirebilir.
- **Sefer:** Dört bölge, derinlik 5/10/15/20 boss kapıları, yan dallar, portal temizleme, hedef avı, jeneratör savunması, hazine, gezgin tüccar ve şans çarkı.
- **Kalıcı gelişim:** Ustalık XP'si, silah açılımları, ustalık tarzları/tercihleri, blueprint koleksiyonu ve Kalıcı Çekirdek yükseltmeleri. Seferlik altın, sarf malzemeleri ve silah run özellikleri bir sonraki sefere taşınmaz. Önceki kayıtların eski eklenti verileri uyumluluk amacıyla okunabilir.

Ayrıntılı mekanikler, özellik havuzları ve kontrol açıklamaları için **[FEATURES.md](FEATURES.md)** dosyasına bakın.

## Kontroller

| Girdi | İşlev |
| --- | --- |
| A / D | Hareket |
| Space / W | Zıplama; uygun durumlarda çift zıplama |
| Shift | Dash |
| Sol tık | Ateş |
| Sağ tık | Seçili silahın özel yeteneği |
| Z | Karakter modülü |
| Q / 1 / 2 | Silah değiştirme |
| R | Doldurma |
| V | Yakın dövüş; uygun sersemlemiş hedefte finisher |
| 3 / H, 4, 5 | Sağlık kiti, bomba, özel eşya |
| E | Yakındaki etkileşim |
| TAB / M / ESC | Silah ve ekipman, harita, menü |

## Kod düzeni

- `src/game.js`: Oyun durumunu, silah/ödül etkileşimlerini ve savaş döngüsünü birleştiren çalışma zamanı.
- `src/catalog.js`, `src/weapon-stats.js`: Silah aileleri, temel değerler ve birleşik savaş istatistikleri.
- `src/weapon-traits.js`: 36 özellik, silah grubu uygunluğu, üç run yuvası, seviye yükseltmeleri ve sinerjiler.
- `src/abilities-data.js`, `src/weapon-ability-data.js`: Sağ tık yetenek kataloğu ve silaha uygun yetenek seçenekleri.
- `src/attachment-effects.js`: Mermi davranışları ve eski parçalarla uyumlu savaş efektleri.
- `src/gear.js`: Beş zırh yuvası, setler, pasif çipler ve karakter ekipman çizimi.
- `src/progression.js`: Kalıcı kayıt, ustalık, açılımlar, yedekleme ve eski kayıt uyumluluğu.
- `src/world.js`, `src/bosses.js`, `src/enemy-ai.js`: Dünya üretimi, boss ve düşman davranışı.
- `src/procedural-background.js`, `src/hud-view.js`, `styles/ui-refresh.css`, `styles/prep-reference.css`: Güncel sahne ve arayüz katmanları.
- `tests/*.test.mjs`: Regresyon, silah/özellik uyumluluğu, seed, kayıt ve savaş doğrulamaları.

## Geliştirme kontrolü

```sh
npm run check
npm test
```

`npm run check` kaynak JS sözdizimini, `npm test` Node testlerini kontrol eder. GitHub Actions aynı kontrolleri `main` dalında çalıştırır. Otomatik testler uzun sefer oynanış dengelemesinin yerini tutmaz.
