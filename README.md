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
