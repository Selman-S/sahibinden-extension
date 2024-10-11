// content.js

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'checkForList') {
    // Tablonun varlığını kontrol et
    const table = document.getElementById('searchResultsTable');
    let hasList = false;

    if (table) {
      const theadTd = table.querySelector('thead tr td:nth-child(2)');
      if (theadTd && theadTd.innerText.trim() === 'Marka') {
        hasList = true;
      }
    }

    sendResponse({ hasList });
  }

  if (request.action === 'saveList') {
    // Verileri topla ve gönder
    collectAndSendData()
      .then(message => {
        console.log(message);
        
        sendResponse({ message });
      })
      .catch(error => {
        console.error('Hata:', error);
        sendResponse({ message: 'Veri gönderilirken bir hata oluştu.' });
      });

    // sendResponse'u asenkron fonksiyon içinde kullanmak için true döndürüyoruz
    return true;
  }
});
function convertStringToDate(dateString) {
  // Türkçe ay isimlerini içeren bir dizi
  const months = {
    Ocak: '01', Şubat: '02', Mart: '03', Nisan: '04', Mayıs: '05', Haziran: '06',
    Temmuz: '07', Ağustos: '08', Eylül: '09', Ekim: '10', Kasım: '11', Aralık: '12'
  };

  // Gelen string'i boşluklara göre ayırarak tarih bölümlerini elde etme
  const parts = dateString.split(' ');

  // Gün, ay ve yıl bilgisini ayırma
  const day = parts[0];
  const month = months[parts[1]]; // Ay ismini sayıya çevirme
  const year = parts[2];

  // YYYY-MM-DD formatında tarih string'i oluşturma
  const formattedDate = `${year}-${month}-${day}`;

  // String'i tarih objesine dönüştürme
  return new Date(formattedDate);
}


async function collectAndSendData() {
  // Tablonun varlığını kontrol et
  const table = document.getElementById('searchResultsTable');
  if (table) {
    const theadTd = table.querySelector('thead tr td:nth-child(2)');
    if (theadTd && theadTd.innerText.trim() === 'Marka') {
      // Verileri topla
      const rows = table.querySelectorAll('tbody tr');
      const cars = [];
       rows.forEach(row => {
        const adId = row.getAttribute('data-id');
        if (adId) {

         let city;
         let ilce;
         let semt;
         let mahalle;
          const imageUrl = row.querySelector('.searchResultsLargeThumbnail img')?.src || '';
          const brand = row.querySelector('td:nth-child(2)')?.innerText.trim() || '';
          const series = row.querySelector('td:nth-child(3)')?.innerText.trim() || '';
          const model = row.querySelector('td:nth-child(4)')?.innerText.trim() || '';
          const title = row.querySelector('.classifiedTitle')?.innerText.trim() || '';
          const year = parseInt(row.querySelector('td:nth-child(6)')?.innerText.trim()) || null;
          const kmText = row.querySelector('td:nth-child(7)')?.innerText.trim().replace(/\./g, '') || '';
          const km = parseInt(kmText) || null;
          const priceText = row.querySelector('td:nth-child(8)')?.innerText.trim().replace(/\./g, '').replace(' TL', '') || '';
          const price = parseInt(priceText) || null;
         
           const adDate =convertStringToDate(row.querySelector('td:nth-child(9)')?.innerText.trim()) || '';

           if (document.querySelector('.searchResultsLocationHeader a')?.getAttribute("title")=="İl / İlçe") {
            city =row.querySelector('td:nth-child(10)')?.innerText.split("\n")[0]
            ilce =row.querySelector('td:nth-child(10)')?.innerText.split("\n")[1]
            semt =""
            mahalle =""
           }else if (document.querySelector('.searchResultsLocationHeader a')?.getAttribute("title")=='İlçe / Semt') {
            city = document.querySelector('[data-address="city"] a').innerText.trim();
            ilce =row.querySelector('td:nth-child(10)')?.innerText.split("\n")[0]
            semt =row.querySelector('td:nth-child(10)')?.innerText.split("\n")[1]
            mahalle =""
           }else if (document.querySelector('.searchResultsLocationHeader a')?.getAttribute("title")=='Semt / Mahalle') {
            city = document.querySelector('[data-address="city"] a').innerText.trim();
            ilce = document.querySelector('[data-address="town"] a').innerText.trim();
            semt =row.querySelector('td:nth-child(10)')?.innerText.split("\n")[0]
            mahalle =row.querySelector('td:nth-child(10)')?.innerText.split("\n")[1]
            
           }else {
            city=""
            ilce=""
            semt=""
            mahalle=""
           }
          const adUrl = 'https://www.sahibinden.com' + row.querySelector('.classifiedTitle')?.getAttribute('href') || '';

          cars.push({
            adId: parseInt(adId),
            imageUrl,
            brand,
            series,
            model,
            title,
            year,
            km,
            price,
            adDate,
            city,
            ilce,
            semt,
            mahalle,
            adUrl
          });
        }
      });

      if (cars.length > 0) {
        // Verileri backend'e gönder
        console.log(cars);
       
        // const response = await fetch('http://localhost:5000/api/cars', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(cars)
        // });
        // const data = await response.json();

        // if (response.ok) {
        //   return data.message; // Başarı mesajı
        // } else {
        //   throw new Error(data.message || 'Veri gönderilirken bir hata oluştu.');
        // }
      } else {
        throw new Error('Listede kaydedilecek veri bulunamadı.');
      }
    } else {
      throw new Error('Bu sayfada kaydedilebilir bir liste bulunamadı.');
    }
  } else {
    throw new Error('Bu sayfada kaydedilebilir bir liste bulunamadı.');
  }
}
