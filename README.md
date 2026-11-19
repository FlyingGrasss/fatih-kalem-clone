# Fatih Kalem — Web

MEB akıllı tahtalarında kullanılan **Fatih Kalem**'den esinlenen, tarayıcıda çalışan bir çizim ve anlatım aracı. Kurulum, derleme veya bağımlılık gerektirmez; tek klasörü açıp `index.html` dosyasını çalıştırmak yeterlidir.

> Bu proje resmî bir MEB uygulaması değildir. Fatih Kalem'in web için bağımsız, sade bir yeniden yorumudur.

## Ne yapar?

İki çalışma modu vardır:

- **Tahta:** Tam ekran, temiz beyaz bir yazı tahtası.
- **Üzerine çiz:** Aynı çizim katmanı; bir görsel, PDF, YouTube videosu veya web sitesinin **üzerine** saydam olarak yerleşir.

Çizim katmanı her zaman içeriğin üstündedir. **Etkileşim** aracına geçtiğinizde çizim katmanı dokunmaya kapanır; alttaki PDF, video veya web sayfası normal şekilde kullanılabilir. Yeniden bir çizim aracı seçtiğinizde kalem açılır.

## Özellikler

- **Kalem:** 24 renk, 3 kalınlık (ince / orta / kalın), yumuşatılmış serbest çizim.
- **Fosforlu kalem:** Yarı saydam, geniş vurgulama; çizim sırasında canlı önizleme.
- **Silgi:** İki boy (küçük / büyük), gerçek `destination-out` silme. Silinen bölgeden alttaki içerik görünür.
- **Şekiller:** Çizgi, dikdörtgen ve elips; sürüklerken canlı önizleme.
- **Metin:** Tahtaya tıklayın, açılan kutucuğa yazın, `Enter` ile yerleştirin.
- **Geri al / yinele:** En fazla 30 adım; her çizim, şekil, metin ve temizleme işlemi geri alınabilir.
- **Tümünü temizle:** Onay penceresiyle; işlem geri alınabilir.
- **Perdele:** Ekranı karartıp sürüklenebilir, boyutlandırılabilir yuvarlak bir pencere bırakır.
- **Yüzen araç çubuğu:** Sürükleyerek taşınır; tek düğmeyle sola veya sağa yaslanır.
- **İçerik katmanı:** Yerel görsel, yerel PDF, YouTube bağlantısı ve web sitesi adresi yükleme.
- **PNG dışa aktarma:** İçerik + çizim birleştirilerek indirilir (çapraz kaynak kısıtları hariç).
- **Dokunmatik uyum:** Pointer Events sayesinde akıllı tahta, tablet, kalem ve fare ile çalışır.
- **Türkçe arayüz**, harici font veya kütüphane yok.

## Çalıştırma

1. Proje klasörünü indirin.
2. `index.html` dosyasına çift tıklayın.

Bu kadar. Uygulama `file://` üzerinden çalışacak şekilde tasarlandı. PDF ve uzak web sayfaları için tarayıcıya göre değişen kısıtlar olabilir; daha tutarlı bir sonuç için klasörü herhangi bir statik sunucuyla da açabilirsiniz:

```bash
python -m http.server 8080
```

Ardından `http://localhost:8080` adresini açın.

## Kullanım

### Tahta modu

- Üstteki **Tahta / Üzerine çiz** düğmeleriyle mod değiştirin.
- Araç çubuğundan bir araç seçin.
- **Renk** düğmesi 24 renk paletini ve kalınlık seçeneklerini açar.
- **Perdele** ekranı kapatır; pencereyi içinden sürükleyin, sağ alt köşesinden boyutlandırın. `Esc` perdeyi kapatır.
- **PNG** düğmesi ekran görüntüsünü indirir.

### Üzerine çiz modu

- **İçerik** düğmesinden görsel, PDF, YouTube veya web sitesi yükleyin.
- Çizim yaparken içerik kilitlidir. Videoyu oynatmak, PDF'te gezinmek veya sayfayı kaydırmak için **Etkileşim** aracını seçin.
- **İçeriği kaldır** yalnızca yüklenen içeriği kaldırır; çizimler tahtada kalır.
- **Tümünü sil** yalnızca çizimleri siler; yüklenen içerik korunur.

## Klavye kısayolları

| Tuş | İşlem |
| --- | --- |
| `P` | Kalem |
| `H` | Fosforlu kalem |
| `E` | Silgi |
| `L` | Çizgi |
| `R` | Dikdörtgen |
| `O` | Elips |
| `T` | Metin |
| `K` | Etkileşim / kalemi aç-kapat |
| `U` | Geri al |
| `Ctrl+Z` | Geri al |
| `Ctrl+Y` | Yinele |
| `Ctrl+Shift+Z` | Yinele |
| `Esc` | Metin kutusunu, açık paneli veya perdeyi kapat |

Yazı alanlarında kısayollar devre dışıdır; böylece adres yazarken araç değişmez.

Perde penceresi odaklıyken:

- `Yön tuşları`: pencereyi taşır.
- `Shift + Yön tuşları`: pencereyi boyutlandırır.
- `Alt + Yön tuşları`: daha büyük adımlarla taşır.

## PNG dışa aktarma

İndirilen dosyada içerik ve çizim katmanı birleştirilir. Görsel içerik yerel bir dosyadan geldiği için yakalanabilir. Tarayıcı güvenliği nedeniyle şunlar PNG'ye aktarılamaz:

- Web sitesi iframe'leri ve YouTube videoları (çapraz kaynak),
- Gömülü PDF görüntüleyicileri.

Bu durumda uygulama hata vermez; bir uyarı gösterir ve **yalnızca çizim katmanını beyaz zemin üzerinde** indirir.

## Sınırlamalar

- **Diğer masaüstü uygulamalarının üzerine çizilemez.** Tarayıcı yalnızca kendi sekmesindeki alana çizebilir. Masaüstünün tamamı üzerine çizmek, şeffaf tam ekran pencere desteği gerektirir; bu ancak Windows için yerel bir uygulamayla mümkündür.
- **Çapraz kaynaklı iframe'ler PNG'ye alınamaz** ve bazı siteler gömülmeyi engeller (`X-Frame-Options`, CSP). YouTube ve benzeri servisler internet bağlantısı ister.
- **PDF görüntüleme tarayıcıya bağlıdır.** Tarayıcı yerleşik PDF görüntüleyicisini desteklemiyorsa PDF boş görünebilir.
- **Çizimler kalıcı değildir.** Sayfa yenilenince tahta temizlenir; kaydetmek için PNG indirin.
- **Pencere yeniden boyutlandırılırsa çizim katmanı ölçeklenir.** Web sayfası veya PDF yeniden akabileceği için çizimlerin içerikle hizası kayabilir. En iyi sonuç için çizimden önce tarayıcı penceresini sabit tutun.
- **İki parmak jestleri ve yakınlaştırma** bu sürümde uygulanmadı. İçerikle etkileşim modunda tarayıcının kendi kaydırma/yakınlaştırma davranışı geçerlidir.
- **Hazır şablon galerisi ve arka plan sayfaları** bu v1 kapsamında yoktur; temel şekil araçları, görsel/PDF/video/site yükleme ve perdeleme vardır.
- Çok büyük ekranlarda geri alma geçmişi 30 adımla sınırlıdır.

## GitHub Pages'e yayınlama

Derleme adımı yoktur. Dört dosya deponun kökünde olacak şekilde yükleyin:

```
index.html
styles.css
app.js
README.md
```

1. GitHub'da yeni bir depo oluşturun ve dosyaları `main` dalına gönderin.
2. Depoda **Settings → Pages** bölümüne gidin.
3. **Build and deployment → Source** altında **Deploy from a branch** seçin.
4. Branch: `main`, klasör: `/ (root)` seçip kaydedin.
5. Kısa bir beklemeden sonra `https://<kullanıcı-adınız>.github.io/<depo-adı>/` adresi yayına girer.

GitHub Pages HTTPS üzerinden sunulduğu için ek bir sunucu ayarı gerekmez. Tüm işlemler tarayıcıda, kullanıcının cihazında gerçekleşir; yüklenen dosyalar hiçbir yere gönderilmez.

## Dosyalar

| Dosya | Açıklama |
| --- | --- |
| `index.html` | Uygulama yapısı ve erişilebilir işaretleme |
| `styles.css` | Minimal beyaz tema, yerleşim, araç çubuğu, paneller |
| `app.js` | Canvas çizimi, geçmiş, içerik, perde, dışa aktarma |
| `README.md` | Bu belge |

## Teknoloji

Saf HTML, CSS ve JavaScript. Harici bağımlılık, CDN, build aracı veya çerçeve yoktur. Çizimler Canvas 2D üzerinde tutulur; kalıcı veri saklanmaz.
