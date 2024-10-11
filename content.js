(() => {
  // Türkçe ay isimlerini içeren bir dizi
  const months = {
    Ocak: '01', Şubat: '02', Mart: '03', Nisan: '04', Mayıs: '05', Haziran: '06',
    Temmuz: '07', Ağustos: '08', Eylül: '09', Ekim: '10', Kasım: '11', Aralık: '12'
  };

  let lastUrl = location.href;
  // console.log('URL:', lastUrl);
  processPage();

  // URL değişikliklerini daha performanslı bir şekilde izlemek için setInterval kullanalım
  setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      processPage();
      // console.log("URL değişti:", currentUrl);
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

  function convertStringToDate(dateString) {
    const parts = dateString.split(' ');
    const day = parts[0];
    const month = months[parts[1]];
    const year = parts[2];
    return new Date(`${year}-${month}-${day}`);
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

      const cars = [];
      for (const row of rows) {
        const car = extractCarData(row);
        if (car) cars.push(car);
      }

      if (cars.length > 0) {
        updateLocalStorage(cars);
        showNotification(`${cars.length} yeni araç işlendi.`);
      } else {
        console.log('Geçerli araç verisi bulunamadı.');
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
      // console.log(adId);
      // console.log(row.querySelector('.searchResultsLargeThumbnail'));
      const th = document.querySelector('#searchResultsTable thead tr')
// console.log(th);
const index={
        imageUrl:0,
        brand: null,
        series:null,
        model: null,
        title:null,
        year: null,
        km: null,
        price:null,
        adDate: null,
        location:null,

}
th.querySelectorAll('td').forEach((el)=>{
    // console.log(el.innerText.trim());
    if(el.innerText.trim() === "Marka"){
        index.brand = el.cellIndex;
    }else if(el.innerText.trim() === "Seri"){
        index.series = el.cellIndex;
    }else if(el.innerText.trim() === "Model"){
        index.model = el.cellIndex;
    }else if(el.innerText.trim() === "İlan Başlığı"){
        index.title = el.cellIndex;
    }else if(el.innerText.trim() === "Yıl"){
        index.year = el.cellIndex;
    }else if(el.innerText.trim() === "KM"){
        index.km = el.cellIndex;
    }else if(el.innerText.trim() === "Fiyat"){
        index.price = el.cellIndex;
    }else if(el.innerText.trim() === "İlan Tarihi"){
        index.adDate = el.cellIndex;
    }else if(el.innerText.trim() === "İlçe / Semt"){
        index.location = el.cellIndex;
    }else if(el.innerText.trim() === "İl / İlçe"){
        index.location = el.cellIndex;
    }else if(el.innerText.trim() === "Semt / Mahalle"){
        index.location = el.cellIndex;
    }
   
    
})
// console.log(index);

      const dataCells = row.querySelectorAll('td');
// console.log(dataCells);

      // Temel verileri çıkarma
      const car = {
        adId: parseInt(adId),
        imageUrl: dataCells[index.imageUrl].querySelector('img')?.src || '',
        brand: dataCells[index.brand]?.innerText.trim() || '',
        series: dataCells[index.series]?.innerText.trim() || '',
        model: dataCells[index.model]?.innerText.trim() || '',
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

  function updateLocalStorage(cars) {
    try {
      const existingCars = JSON.parse(localStorage.getItem('allCarList')) || [];
      cars.forEach(newCar => {
        const index = existingCars.findIndex(car => car.adId === newCar.adId);
        if (index !== -1) {
          existingCars[index] = newCar;
        } else {
          existingCars.push(newCar);
        }
      });
      localStorage.setItem('allCarList', JSON.stringify(existingCars));
      console.log(`${cars.length} yeni araç işlendi. Toplam araç sayısı: ${existingCars.length}`);
    } catch (error) {
      console.error('updateLocalStorage hatası:', error);
      showNotification('Veriler kaydedilirken bir hata oluştu.', true);
    }
  }

})();
