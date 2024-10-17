(() => {
    // Türkçe ay isimlerini içeren bir dizi
    const months = {
      Ocak: '01', Şubat: '02', Mart: '03', Nisan: '04', Mayıs: '05', Haziran: '06',
      Temmuz: '07', Ağustos: '08', Eylül: '09', Ekim: '10', Kasım: '11', Aralık: '12'
    };
  
    let lastUrl = location.href;
    processPage();
  
    // URL değişikliklerini daha performanslı bir şekilde izlemek için setInterval kullanalım
    setInterval(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        processPage();
      }
    }, 1000); // Her saniyede bir kontrol ediyoruz
  
    function showNotification(message, isError = false) {
      const notification = document.createElement('div');
      notification.innerText = message;
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
      notification.style.color = 'white';
      notification.style.padding = '15px';
      notification.style.zIndex = '9999';
      notification.style.borderRadius = '4px';
      notification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  

  
    // Tooltip gösterme fonksiyonu
    function showTooltip(element, message) {
      const tooltip = document.createElement('div');
      tooltip.innerText = message;
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = '#333';
      tooltip.style.color = 'white';
      tooltip.style.padding = '5px 10px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.zIndex = '1000';
      tooltip.style.fontSize = '12px';
      tooltip.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      document.body.appendChild(tooltip);
  
      element.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
      });
  
      element.addEventListener('mouseleave', () => {
        tooltip.remove();
      });
    }
  
    async function processPage() {
      try {
        const table = document.querySelector('#searchResultsTable');
        if (!table) {
          console.log('Bu sayfada tablo bulunamadı.');
          return;
        }
  
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) {
          console.log('Tabloda satır bulunamadı.');
          return;
        }
  
        for (const row of rows) {
          const car = extractCarData(row);
          if (car) {
            // Araç verisini API'ye gönder ve fiyat geçmişini al
            await saveCarData(car);
            const priceHistory = await fetchPriceHistory(car.adId);
  
            if (priceHistory && priceHistory.length > 0) {
              // Fiyat değişimi varsa hesapla ve göster
              const firstPrice = priceHistory[0].price;
              const lastPrice = priceHistory[priceHistory.length - 1].price;
  
              if (firstPrice !== lastPrice) {
                const priceDifference = ((lastPrice - firstPrice) / firstPrice) * 100;
                const priceCell = row.querySelector('.searchResultsPriceValue');
  
                const differenceElement = document.createElement('div');
                differenceElement.style.fontSize = '12px';
                differenceElement.style.fontWeight = 'bold';
                differenceElement.style.color = priceDifference < 0 ? 'green' : 'red';
                differenceElement.innerText = `${priceDifference.toFixed(2)}% ${priceDifference < 0 ? '↓' : '↑'}`;
                priceCell.appendChild(differenceElement);
  
                // Tooltip için fiyat geçmişini hazırla
                const tooltipData = priceHistory
                  .map(item => `${new Date(item.updatedAt).toLocaleDateString('tr-TR')}: ${item.price.toLocaleString()} TL`)
                  .join('\n');
  
                priceCell.addEventListener('mouseenter', () => {
                  showTooltip(priceCell, tooltipData);
                });
              }
            }
          }
        }
  
      } catch (error) {
        console.error('processPage hatası:', error);
        showNotification('Sayfa işlenirken bir hata oluştu.', true);
      }
    }
  
    function extractCarData(row) {
      try {
        const adId = row.getAttribute('data-id');
        if (!adId) return null;
  
        const th = document.querySelector('#searchResultsTable thead tr');
        const index = {
          imageUrl: 0,
          brand: null,
          series: null,
          model: null,
          title: null,
          year: null,
          km: null,
          price: null,
          adDate: null,
          location: null,
        };
  
        th.querySelectorAll('td').forEach((el) => {
          if (el.innerText.trim() === "Marka") {
            index.brand = el.cellIndex;
          } else if (el.innerText.trim() === "Seri") {
            index.series = el.cellIndex;
          } else if (el.innerText.trim() === "Model") {
            index.model = el.cellIndex;
          } else if (el.innerText.trim() === "İlan Başlığı") {
            index.title = el.cellIndex;
          } else if (el.innerText.trim() === "Yıl") {
            index.year = el.cellIndex;
          } else if (el.innerText.trim() === "KM") {
            index.km = el.cellIndex;
          } else if (el.innerText.trim() === "Fiyat") {
            index.price = el.cellIndex;
          } else if (el.innerText.trim() === "İlan Tarihi") {
            index.adDate = el.cellIndex;
          } else if (el.innerText.trim() === "İlçe / Semt") {
            index.location = el.cellIndex;
          } else if (el.innerText.trim() === "İl / İlçe") {
            index.location = el.cellIndex;
          } else if (el.innerText.trim() === "Semt / Mahalle") {
            index.location = el.cellIndex;
          }
        });
  
        const dataCells = row.querySelectorAll('td');
        if (!index.brand) {
          document.querySelector('#search_cats ul .cl2')?.innerText.trim();
        }
  
        // Temel verileri çıkarma
        const car = {
          adId: parseInt(adId),
          imageUrl: dataCells[index.imageUrl]?.querySelector('img')?.src || '',
          brand: index.brand ? dataCells[index.brand]?.innerText.trim() : document.querySelector('#search_cats ul .cl2')?.innerText.trim() || '',
          series: index.series ? dataCells[index.series]?.innerText.trim() : document.querySelector('#search_cats ul .cl3')?.innerText.trim() || '',
          model: index.model ? dataCells[index.model]?.innerText.trim() : document.querySelector('#search_cats ul .cl4')?.innerText.trim() || '',
          title: row.querySelector('.classifiedTitle')?.innerText.trim() || '',
          year: parseInt(dataCells[index.year]?.innerText.trim()) || null,
          km: parseInt(dataCells[index.km]?.innerText.replace(/\D/g, '')) || null,
          price: parseInt(dataCells[index.price]?.innerText.replace(/\D/g, '')) || null,
          adDate: dataCells[index.adDate]?.innerText.trim().replace("\n", ' ') || '',
          adUrl: 'https://www.sahibinden.com' + row.querySelector('.classifiedTitle')?.getAttribute('href') || ''
        };
  
        // Lokasyon bilgisini çıkarma
        let city = '';
        let ilce = '';
        let semt = '';
        let mahalle = '';
  
        const locationHeaderTitle = document.querySelector('.searchResultsLocationHeader a')?.getAttribute('title');
        const locationCell = dataCells[index.location];
        const locationTexts = locationCell?.innerText.trim().split("\n") || [];
  
        if (locationHeaderTitle === "İl / İlçe") {
          city = locationTexts[0] || '';
          ilce = locationTexts[1] || '';
        } else if (locationHeaderTitle === "İlçe / Semt") {
          city = document.querySelector('[data-address="city"] a')?.innerText.trim() || '';
          ilce = locationTexts[0] || '';
          semt = locationTexts[1] || '';
        } else if (locationHeaderTitle === "Semt / Mahalle") {
          city = document.querySelector('[data-address="city"] a')?.innerText.trim() || '';
          ilce = document.querySelector('[data-address="town"] a')?.innerText.trim() || '';
          semt = locationTexts[0] || '';
          mahalle = locationTexts[1] || '';
        }
  
        // Lokasyon bilgilerini araca ekleme
        car.city = city;
        car.ilce = ilce;
        car.semt = semt;
        car.mahalle = mahalle;
  
        return car;
      } catch (error) {
        console.error('extractCarData hatası:', error);
        return null;
      }
    }
  
    // API'ye araç verisini gönderme
    async function saveCarData(car) {
      try {
        const response = await fetch('https://sahibinden-backend-production.up.railway.app/api/cars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([car])
        });
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || 'Veri gönderilirken bir hata oluştu.');
        }
      } catch (error) {
        console.error('saveCarData hatası:', error);
      }
    }
  
    // API'den fiyat geçmişini alma
    async function fetchPriceHistory(adId) {
      try {
        const response = await fetch(`https://sahibinden-backend-production.up.railway.app/api/cars/${adId}/price-history`);
        const data = await response.json();
  
        if (response.ok) {
          return data.priceHistory || [];
        } else {
          throw new Error(data.message || 'Fiyat geçmişi alınırken bir hata oluştu.');
        }
      } catch (error) {
        console.error('fetchPriceHistory hatası:', error);
        return [];
      }
    }
  
  })();
  