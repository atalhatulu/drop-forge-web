# Drop Forge — Güncel oyun ve savaş mekanikleri

> **Güncel kod referansı:** `main`, Ekim 2026. Bu belge eski dört eklenti yuvasına dayalı tasarımın yerine geçen mevcut sistemi anlatır. Farklı sürümlere ait kayıtlar için uyumluluk yolu korunur.

## 1. Oyunun akışı ve dört bölge

Oyun, kukla ve ödülsüz savaş test alanı içeren **fiziksel hazırlık merkezinde** başlar. `E` ile atölyeden başlangıç silahlarını ve yeteneklerini seçip portal üzerinden sefere girersin. Seed'e göre oluşan uzun rota dört bölge içerir: Terk Edilmiş Maden (LV 1), Zehirli Orman (LV 2), Mor Kristal (LV 3), Lav Çekirdeği (LV 4). Ana rota her beş derinlikte boss arenasına çıkar; son boss dördüncü bölgededir. Yan dallarda hazine, anahtar, özel oda ve ödül seçenekleri bulunur. `M` haritası bağlantıları ve keşfedilmiş oda bilgilerini gösterir.

Normal odalarda portal ve düşman temizleme, işaretli av hedefi, jeneratör savunması gibi görevler bulunur. Odada uzun süre kalmak tehdidi yükseltir. Düşmanların canı/hasarı bölgeyle artar; son bölgedeki düşmanlar ek kalkan taşıyabilir. Boss arenalarında şifacı doğuşunu engelleyen ayrı davranış vardır.

## 2. Üç eşdeğer silah özelliği yuvası

**13 silah** için `src/weapon-traits.js` içinde **36 silah özelliği** tanımlıdır. Her silahın **üç run özellik yuvası** bulunur; bunlar ana/destek/atak olarak zorunlu bölünmez. Katalogdaki `kind` alanı etkinin sınıfını anlatır, yuva zorunluluğunu değil.

- Her yeni özellik, açık bulunan ilk yuvayı doldurur.
- Aynı özelliği yeniden almak kendi seviyesini yükseltir; üst sınır **3**'tür.
- Üç yuva doluysa boş yuvaya yeni özellik gelmez. Henüz en üst seviyeye ulaşmamış takılı özelliklerin yükseltmeleri sunulabilir.
- Özellik seçimi **silaha özeldir**: tabanca, hafif otomatik, pompalı, enerji, keskin nişancı, lazer, patlayıcı ve ark gruplarının uygun havuzları farklıdır.
- Özellikler ve seviyeleri silahın üzerindedir. Silah yere bırakılıp tekrar alındığında diğer yapılandırma parçalarıyla birlikte korunur.
- Önceki sürümün `traits.main` ve `traits.supports` kayıtları, üç yuvalı düzene dönüştürülerek okunur.

### 36 özellik — etki grupları

| Savaş davranışı | Özellikler |
| --- | --- |
| Element ve isabet etkileri | Elektrik Zinciri, Yanıcı Atış, Kriyo İsabeti, Avcı İşareti, Şok Ağzı, Kanatan Çekirdek, Kış Çekirdeği |
| Mermi biçimi ve delme | Lazer Hattı, Son Mermi Patlaması, Seken Mermi, Faz Delici Namlu, Avcı Mermi, Yankı Mermisi, Yerçekimi Mermisi |
| Atış ve mühimmat | Hızlı Besleme, Geniş Şarjör, Mühimmat Tasarrufu, Hız Aşımı, Üçlü Atış, Geri Kazanım, Hızlı Namlu, Kapasitör Atışı |
| Hasar, dağılım ve hareket | Dengeli Atış, Hareketli Atış, Rezonans Çekirdeği, Ağır Sabitleyici, Uzun Menzil Kabzası, Ağır Namlu, Faz Çekirdeği, Ağır Kabza |
| İlave etkiler | İnfaz Çekirdeği, Parçalayıcı Çekirdek, Sömürü Mermisi, Kırılgan Yük, Sarsıntı Çekirdeği, Açık Yara Atışı |

Bu gruplama okuyucu içindir; hangi özelliğin hangi silahta seçilebildiğinin kaynağı koddaki `groups` listeleridir. İstatistik, mermi ailesi ve efektler `weapon-stats.js`, `attachment-effects.js` ve `game.js` tarafından birlikte uygulanır.

### Tanımlı ikili sinerjiler

| İkili | Sinerji |
| --- | --- |
| Elektrik Zinciri + Üçlü Atış | **Aşırı Yük:** tetik serisinde elektrik zinciri daha fazla hedefe sıçrayabilir. |
| Yanıcı Atış + Mühimmat Tasarrufu | **Kalıcı Yanma:** yanma süresi ve hasarı artar. |
| Kriyo İsabeti + Hareketli Atış | **Hareketli Dondurucu:** hareket ederken dondurmak için gereken isabet sayısı azalır. |
| Avcı İşareti + Ağır Sabitleyici | **Nokta Atışı:** işaretli hedefe hareketsiz ateş etme kritik hasarı artırır. |
| Lazer Hattı + Faz Delici Namlu | **Faz Kesici:** lazer daha fazla hedefi deler. |

## 3. Ödül seçimi ve ekonomi

İlgili sandık ve oda özellik ödülleri önce **hangi silahı geliştireceğini** seçtirir; ardından yalnızca o silaha uygun özellik kartları gösterilir. Seçilen özellik hemen ilgili silaha işlenir. Ödül havuzunda silahın sağ tık yeteneği için geliştirmeler ve zırh çipleri gibi ayrı hedefler de bulunabilir; görüntülenen seçenekler mevcut envanter ve oyun durumuna bağlıdır.

Hazine, çark, oda temizleme, boss ve görevler altın, ekipman, ustalık XP'si, silah ve sarf malzemesi gibi farklı sonuçlar üretebilir. Uygun seçim kalmadığında bazı ödüllerde **altın telafisi** devreye girer. Geçici sefer tüccarı sağlık kiti, mühimmat, bomba gibi sarf malzemelerini satar; **eski dört yuvalı eklentilerin satın alınıp TAB çantasından takılması artık güncel döngünün parçası değildir**. Kalıcı usta ise Kalıcı Çekirdek kullanır.

## 4. Silah başına sağ tık yeteneği ve Z karakter modülü

Atölyede iki silah seçilir. **Her silahın sağ tık yeteneği ayrıca seçilir**; uygun seçenekler silahın mermi ailesine göre belirlenir. Sağ tık, bu silah yeteneğini kendi bekleme süresiyle etkinleştirir. Seçenek havuzunda üçlü atış, hız aşımı, şok dalgası, plazma mızrağı, nüfuz, sarsıcı atış, plazma yağmuru, pompalı süpürme, avcı işareti, seri aşım, lazer süpürme, küme bomba ve elektrik sıçraması gibi **13 temel yetenek tanımı** bulunur. Yeteneklere ait geliştirme seviyesi, silah yapılandırmasının bir parçasıdır.

**`Z` karakter modülü sağ tıktan bağımsızdır.** Hazırlıkta modül seçimi, silaha ait sağ tık seçicileriyle karıştırılmamalıdır. Aktif modülün bekleme süresi ve etkisi ayrı yönetilir. Silah değişimi silaha ait yeteneği ve yapılandırmayı değiştirebilir; karakter modülü ayrı kalır.

## 5. Yakın dövüş, sersemletme ve finisher

`V`, uygun hedef yokken zaman penceresine bağlı **üç vuruşluk yakın dövüş kombosu** uygular. Üçüncü vuruşun menzili ve hasarı daha yüksektir. Sersemlemiş ve finisher için uygun hale gelmiş düşmana nişan alıp menzilde `V` kullanıldığında normal bıçak yerine **finisher** başlatılır: karakter hedefe kısa bir ileri atılmayla yaklaşır, darbe animasyonu ve kısa dokunulmazlık penceresi kullanır. Menzil dışındaki hedefte işlem başlamaz. Bazı çipler finisher erişimini, can iadesini, dash yenilemeyi veya mühimmat kazanımını etkiler.

Savaş okunurluğu için mermi çarpma kıvılcımları, statü efektleri, namlu parlaması, geri tepme, ekran vurulma tepkileri, düşman/boss görselleri ve piksel siluetleri yeniden düzenlenmiştir. `src/procedural-background.js` ile maden dekorları ve sahne ayrıntıları desteklenir.

## 6. Zırh, pasif çipler ve blueprint

Zırh **beş parça** üzerinden kurulur: kask, gövde zırhı, eldiven, kemer ve bot. Kale, Rüzgâr, Cephanelik ve Kanbağı setleri tam set bonusları sağlar. Pasif çipler belirli parça yuvalarına uygundur. Güncel örnekler:

- **Mıknatıslı Kemer:** yakındaki ganimeti kendine çeker.
- **Ayna Göğüslüğü:** alınan hasarın bir kısmını yakındaki düşmana yansıtır.
- **Koç Botları / Sert İniş:** dash çarpması ve yüksekten inişe savaş etkileri ekler.
- **Avcı Vizörü / Hasat Eldiveni / İnfaz Haznesi:** finisher menzili, can veya mühimmat kazanımı.
- **Koruyucu Kapasitör / Faz Bataryası:** dash sonrasında savunma veya hasar emme.
- **Sıçrama Yayı / Çift Adım:** ek hava hareketliliği veya dash.
- **Son Savunma / Karşı Darbe:** kritik durumda koruma veya hasar sonrası çevresel sersemletme.

Güncel hazırlık ekranında **Blueprint Koleksiyonu** ve ayrı **Zırh Atölyesi** bulunur. Bu ekranlar silahın üç run özelliği yuvasından bağımsızdır.

## 7. Kalıcı ustalık ve kayıtlar

Kalıcı ilerleme; silah ustalığı XP/seviyeleri, açılmış silahlar, Ustalık 4'te seçilebilen başlangıç tarzları, üst ustalık tercihleri, Kalıcı Çekirdek ile alınan gelişmeler ve ilgili koleksiyon kayıtlarını kapsar. **Run özellikleri, sefer altını ve çoğu sarf malzemesi kalıcı değildir.**

Kayıtlar tarayıcı `localStorage` alanındadır. Dışa aktarma/yedekten yükleme ve sıfırlama seçenekleri mevcuttur. `src/progression.js` önceki `weaponBuilds.v1` gibi uyumluluk anahtarlarını tanımayı sürdürür, ancak bunlar **güncel atölyede dört soketli eklenti build'i kurulduğu anlamına gelmez**. Eski silahlardaki eklentilerin savaş etkileri için uyumluluk kodu korunabilir.

## 8. Test, HUD ve harita

Hazırlıkta hedef kuklası ve **ödülsüz savaş test alanı** vardır. Test alanı taşıdığın silahın mevcut özelliklerini, sağ tık yapılandırmasını ve uyumlu eski parçalarını kullanacak şekilde tasarlanmıştır; test bitince önceki ekipman geri yüklenir ve kalıcı ustalık XP'si verilmez. `TAB` ekipman/özellikleri, `M` haritayı açar. Güncel HUD sağlık, akış/kalkan göstergesi, silah-mühimmat, oda, altın ve öldürme bilgisini ayrı sunar.

Kod kontrolleri:

```sh
npm run check
npm test
```

Bu komutlar JS sözdizimi ve mevcut regresyon testlerini doğrular; görsel uyum, uzun sefer, özellik kombinasyonlarının gerçek güç dengesi ve tüm boss davranışları için **oynanış testi ayrıca gereklidir**.

## 9. Kontrol özeti

| Tuş | Eylem |
| --- | --- |
| `A/D` | Hareket |
| `Space/W` | Zıplama / çift zıplama |
| `Shift` | Dash |
| Sol tık | Ateş |
| Sağ tık | Silaha ait seçilmiş özel yetenek |
| `Z` | Karakter modülü |
| `Q` / `1` / `2` | Silah değişimi |
| `R` | Doldurma |
| `V` | Yakın dövüş / uygun hedefte finisher |
| `3/H`, `4`, `5` | Sağlık kiti, bomba, özel eşya |
| `E` | Yakın etkileşim |
| `TAB`, `M`, `ESC` | Ekipman, harita, menü |
