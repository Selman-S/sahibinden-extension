// popup.js

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    
    const allCarList = JSON.parse(localStorage.getItem('allCarList')) || [];
    const messageDiv = document.getElementById('message');
    console.log(messageDiv);
    
    messageDiv.innerText = `Toplam Kayıtlı Araç Sayısı: ${allCarList.length}`;
  }, 500);
});
