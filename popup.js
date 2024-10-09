document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const messageDiv = document.getElementById('message');
  
    // Aktif sekmedeki içerikle iletişim kur
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
  
      // İçerik script'ine mesaj gönder ve sayfada liste olup olmadığını sor
      chrome.tabs.sendMessage(tab.id, { action: 'checkForList' }, function (response) {
        if (response && response.hasList) {
          saveButton.style.display = 'block';
        } else {
          messageDiv.textContent = 'Bu sayfada kaydedilebilir bir liste bulunamadı.';
        }
      });
    });
  
    // Kaydet butonuna tıklandığında
    saveButton.addEventListener('click', function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
  
        // İçerik script'ine veri toplaması ve göndermesi için mesaj gönder
        chrome.tabs.sendMessage(tab.id, { action: 'saveList' }, function (response) {
          if (response && response.message) {
            messageDiv.textContent = response.message;
            saveButton.style.display = 'none';
          } else {
            messageDiv.textContent = 'Bir hata oluştu.';
          }
        });
      });
    });
  });
  