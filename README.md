# Drop Forge Web

Tarayıcıda çalışan 2D procedural arena shooter / roguelite.

## Çalıştırma

`index.html` dosyasını açın veya `python -m http.server 8000` ile yerel sunucu başlatıp `http://localhost:8000` adresini açın. Derleme ve dış bağımlılık gerekmez. Oyun açılır açılmaz **1280×720 çizim çözünürlüğündeki oynanabilir hazırlık alanı** yüklenir. Ekran, pencerenin yüksekliğine göre 16:9 oranını koruyarak ölçeklenir.

## Dosyalar

- `index.html` — oyun ekranı, menüler ve bağımlılık sırasıyla yüklenen CSS/JS dosyaları
- `styles/game.css` — ortak oyun ekranı ve temel arayüz stilleri
- `styles/quickbar.css` — kare slotlu hızlı envanter ve responsive HUD
- `styles/workbench.css` — atölye, eklenti kartları, stat karşılaştırmaları ve alt bildirim şeridi
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
- `src/game.js` — oyun durumunu, savaş ve envanter etkileşimlerini, mağaza satın alımlarını ve sahne döngüsünü koordine eden çalışma zamanı
- `tests/smoke.test.mjs` — katalog ve ana oyun birlikte yüklenerek çalışan regresyon testleri

`npm test` regresyon testlerini, `npm run check` tüm `src/*.js` giriş dosyalarının sözdizimini kontrol eder. Tarayıcıda yükleme sırası: `catalog.js` → `progression.js` → `abilities-data.js` → `shop-data.js` → `mod-presentation.js` → `world.js` → `weapon-stats.js` → `enemy-ai.js` → `shop-view.js` → `map-view.js` → `biome-view.js` → `game.js`.

Refaktör durumu: kataloglar, kayıtlar, yetenek tanımları, eklenti sunumu, harita/oda üretimi, silah istatistikleri, düşman davranışları, mağaza uygunluk/sunumu ve CSS ayrı modüllerdedir. `game.js` hâlâ büyük bir çalışma zamanı dosyasıdır. Sonraki adaylar çizim sistemi, envanter/atölye etkileşimleri ve savaşın yan etkileridir. Her ayrımda açılış/hub, mağaza ve silah etkileşimleri regresyon testleriyle korunmalıdır. Her ayrımda açılış/hub, mağaza ve silah etkileşimleri regresyon testleriyle korunmalıdır.

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

## Uzun sefer güncellemesi

- Yeni seferler seed'e göre yaklaşık 64–70 odadan oluşur. Ana rota 20 oda aşağı iner; her 5 aşağı odada bir geniş boss arenası vardır (B1/B2/B3/B4). Zafer yalnızca dördüncü boss yenilince gelir. İlk üç boss sonrası sağlık kitleri ve mühimmat verilir.
- M haritası tüm oda bağlantılarını baştan gösterir. Ulaşılmamış odalar gri `?` olarak etkin değildir; keşfedilince oda türleri ve rota ödülleri görünür.
- Sağlık %50'nin altına inince oyuncu hayattaysa ve çantada kit bulunuyorsa kit otomatik kullanılır (manuel `3/H` de kullanılabilir).
- `V` yakın dövüş kısa zaman penceresinde üç vuruşluk komboya dönüşür; üçüncü vuruş daha geniş alan, daha yüksek hasar ve geri itme uygular.
- Geri tepme, namlu ışığı, isabet kıvılcımları, hasarda kırmızı ekran parlaması ve boss aşaması göstergesi eklendi.

## Dört bölge ve düşman seviyeleri

- **Bölge I, derinlik 0–5:** Terk Edilmiş Maden; LV 1 düşmanlar; derinlik 5'te boss.
- **Bölge II, derinlik 6–10:** Zehirli Orman; LV 2 düşmanlar; derinlik 10'da boss.
- **Bölge III, derinlik 11–15:** Mor Kristal; LV 3 düşmanlar; derinlik 15'te boss.
- **Bölge IV, derinlik 16–20:** Lav Çekirdeği; LV 3 düşmanlar; derinlik 20'de son boss.

Biyom ve düşman seviyesi odanın derinliğine bağlıdır; yan dallarda da aynı bölgede kalır. Dallar yalnızca ana rotanın normal odalarına bağlanır ve ödül/hazine odalarında sonlanır. Boss kapılarını yan dallardan atlamak mümkün değildir. Düşman canı, saldırı hasarı ve ateş sıklığı LV 2–3'te artar. Harita dört bölgeyi ve henüz keşfedilmemiş odaları gösterir.

Sağlık %50'nin altındayken yakında yerde bir sağlık kiti bulunursa önce o kit doğrudan kullanılır; kit çantası dolu olsa bile çantadaki mevcut kitler harcanmaz. Yakında kit yoksa çantadaki kit otomatik kullanılır.

## Stat eklentileri ve gezgin tüccar

Her silahın ustalık 2 / 4 / 6 / 8'de açılan dört kategorik yuvası vardır. Her yuvada **üç farklı eklentiden yalnızca biri** takılabilir (toplam 12 seçenek): namluda Güç / Seri / Delici; mekanizmada Hızlı / Geniş Şarjör / Verimli; çekirdekte Faz / Şok / Yanıcı; kabzada Dengeleyici / Hafif / Ağır. Şok Çekirdeği isabetten yakın hedefe %35 zincir hasarı verir; Yanıcı Çekirdek 3 saniyelik yanma uygular. Başlangıç atölyesi, TAB çantası ve tüccar bu alternatifleri destekler. Yere bırakılan silah eklentilerini korur.

Atış, reload ve stat kartları aynı `weaponStats` hesaplamasını kullanır. Silah kartında hasar / mermi, pompalıda tam isabet hasarı, teorik DPS, atış hızı, doldurma, hız, delme, saçılma, gerçek şarjör, mühimmat tasarrufu, hareket bonusu ve geri tepme görünür. Teorik DPS yenileme ve şartlı etkileri hesaba katmaz.

Düşmanlar garantili altın ve sıkça mühimmat bırakır. Altın düştüğü yerde kalır; toplamak için karakterin paraya dokunması gerekir. Hazine ve ara boss odalarında arena temiz olduğunda sefer tüccarına E ile ulaşılır. Mermi, kit, bomba ve ustalığı açık stat eklentileri sefer altınıyla alınır. Başlangıç arenasındaki ayrı kalıcı usta yalnızca Kalıcı Çekirdek kullanır. Mağaza, çanta kapasitesini ve yetersiz altın durumunu kontrol eder; ESC ile kapanır.

## Oynanabilir hazırlık alanı ve test

Yeni oyun doğrudan fiziksel hazırlık alanında başlar. **Atölye tezgâhına yaklaşıp E** ile iki başlangıç silahını, eklentileri, zorluğu ve seed'i ayarlayabilirsiniz. Hedef kuklasına ateş ederek hasarı ölçebilir, V ile melee kombosunu deneyebilirsiniz. Hazırlıkta yedek mühimmat otomatik yenilenir; antrenman atışları kalıcı ustalık XP'si kazandırmaz. **Sağdaki sefer portalına gidip E** ile ilk savaş odasına geçilir. Geçişte sağlık ve başlangıç mühimmatı doldurulur. YARDIM düğmesi kontrolleri ve ilerleme döngüsünü açar.

Dash görüntü izleri ve enerji çemberi bırakır; kancanın hattı animasyonludur. Düşmanlar isabette kısa süre sarsılır ve geri tepilir. Silahların geri tepmesi sınıfa ve kabza eklentisine göre değişir. Çarkın tabanı ve tüccarın ayakları zemine hizalıdır.

## Neler düşer, neler satın alınır?

- Düşmanlar garantili **altın**, sıkça **yedek mühimmat** ve bazen sağlık kiti bırakır. Altın için fiziksel temas gerekir; uzaktan çekilmez. Boss'lar daha çok altın, garantili mühimmat ve sağlık kiti bırakır.
- Odaların ödülleri, sandıklar ve çarklar eklenti, ustalık XP'si, silah, sağlık, mühimmat veya bomba kazandırabilir. Özel eşya türleri: Koruyucu Kalkan, Adrenalin Serumu, Spor Filtresi ve Prizma Bobini.
- Sefer tüccarında altınla mühimmat, sağlık kiti, bomba ve ustalığı açılmış 12 eklenti alternatifinden biri alınabilir. Başlangıç arenasındaki kalıcı ustadan ise Kalıcı Çekirdek ile başlangıç canı, kit, yedek mühimmat, seçili silaha kalıcı XP ve yeni silah açma yükseltmeleri alınır.
- **Kalıcı ilerleme:** Tarayıcıya kaydedilen silah ustalığı XP/seviyeleri (kalıcı ustadan satın alınan XP dâhil), şans çarkında veya kalıcı ustadan açılan silahlar, Kalıcı Çekirdek bakiyesi ve kalıcı başlangıç yükseltmeleri. Ustalık 2/4/6/8 seviyeleri yeni eklenti yuvası açar.
- **Yalnızca o sefere ait:** Altın, satın alınan ve takılı/çantadaki eklentiler, iki silahın mevcut mühimmatı, ganimet, sağlık kitleri, bombalar, özel eşyalar ve oda ilerlemesi. Ölümden sonra hazırlık alanında yeni sefer sıfır kaynakla başlar; ustalık ve açılmış silahlar kalır.

Her beş düşman öldürülünce +1, boss öldürülünce +3 Kalıcı Çekirdek kazanılır; birikim ölünce silinmez. Bu kaynak başlangıç arenasındaki kalıcı ustada harcanır. Sefer altını ise ölümde sıfırlanır. Yalnızca kalıcı yükseltme veya XP kazandıysan sonraki sefer daha güçlü başlar. Kalıcı kayıtlar tarayıcının yerel depolamasındadır; başka cihazlara otomatik taşınmaz.

## Silah sınıfına özgü eklentiler ve karşılaştırmalı atölye

Başlangıç arenasındaki tezgâhta açık bir `+` eklenti yuvasına tıklayınca o kategorinin üç seçeneği kartlar halinde görünür. Kartlar **gerçek atış hesaplarından gelen önce → sonra stat değişimlerini**, silaha özel etki açıklamasını ve varsa oynanış bedelini gösterir. Takılan eklentinin adı, seçili silah görseli ve özellikleri anında güncellenir. Aynı açıklamalar TAB envanterindeki takılı eklentilerin altında bulunur.

Eklentiler farklı silahlarda aynı sonucu vermeyebilir: Delici Namlu kinetikte +1 delme, pompalıda %25 sıkı dağılım, patlayıcıda %20 geniş etki alanı sağlar. Faz Çekirdeği kinetikte +1 delme, alan etkili enerji silahlarında %25 geniş etki alanı sağlar; her ikisinde de %25 hız verir. Pompalıdaki Dengeleyici saçılmayı %42 azaltırken Ağır Kabza artık Dengeleyici'nin kopyası değildir: %35 daha az geri tepme ve düşmana %50 uzun sarsılma verir. Şok zinciri özellikle pompalılarda dengeli kalması için **atış başına en fazla bir ek hedefe** sıçrar. Çekirdeklerin Yanma ve Şok etkileri mevcut özel etkiler olarak korunur.

## Sağ tıkla silaha özel yetenekler

Her silahın kendine ait **sağ tık yeteneği** ve bağımsız bekleme süresi vardır; silah değişimi süreyi sıfırlamaz. Alt arenadaki şerit seçili silahın yetenek adını ve bekleme süresini gösterir. Hazırlık alanında kuklada denemek serbesttir; portaldan sefere geçince bekleme süreleri sıfırlanır. 13 yetenek: Kıvılcım üçlü atış, Vizir hız aşımı, Kor şok dalgası, enerji tüfeği plazma mızrağı, keskin nişancı nüfuz atışı, ağır tabanca sarsıcı atış, enerji otomatiği plazma yağmuru, ikinci pompalı süpürme, ikinci keskin nişancı avcı işareti, hızlı otomatik seri aşım, lazer süpürme, patlayıcı küme bomba, ark elektrik sıçraması. Sağ tık yetenekleri şarj değil, süre bazlı kullanılır.

**Eklenti sahipliği:** Sefer içinde tüccardan satın alınan eklenti önce ortak çantaya gider; aynı anda yalnızca takıldığı silahı güçlendirir. TAB çantasında söküp uyumlu yuvaya sahip diğer silaha aktarılabilir. Eklentinin adı ve sınıfa özgü etkisi silaha göre değişebilir. Sefer bitince satın alınan ve takılan bu parçalar sıfırlanır; ustalıkla açılan yuvalar kalıcıdır.

**Kalıcı usta:** Hazırlıkta kukla ile portalın arasında bulunur. Başlangıç canı +10 (3 seviye), başlangıç kiti +1 (2 seviye), başlangıç yedek mühimmatı +1 şarjör (3 seviye), seçili silaha +90 kalıcı ustalık XP veya sıradaki kilitli silahı açma sağlar. Kalıcı Çekirdek hesabı `localStorage` içinde tutulur. Alt bilgi şeridi artık oyun alanının altında; coin'ler mıknatıslı değil, temasla toplanır.
