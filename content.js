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
            const adDateText = row.querySelector('td:nth-child(9)')?.innerText.trim() || '';
            const adDate = moment(adDateText, 'DD MMMM YYYY').toDate();
            const location = row.querySelector('td:nth-child(10)')?.innerText.trim().replace('\n', ' ') || '';
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
              location,
              adUrl
            });
          }
        });
  
        if (cars.length > 0) {
          // Verileri backend'e gönder
          const response = await fetch('http://localhost:5000/api/cars', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(cars)
          });
          const data = await response.json();
  
          if (response.ok) {
            return data.message; // Başarı mesajı
          } else {
            throw new Error(data.message || 'Veri gönderilirken bir hata oluştu.');
          }
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
  