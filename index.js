// Mendapatkan referensi ke elemen HTML yang menampilkan data
const dataContainer = document.getElementById('dataContainer');
const detailContainer = document.getElementById('detailContainer');

// Menyimpan data kategori yang sedang ditampilkan
let currentCategory = '';
let currentMenu = [];

// Fungsi untuk mendapatkan data kategori secara asinkron
async function fetchCategories() {
  try {
    //Mengirim permintaan HTTP GET ke URL 
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
    const data = await response.json();
    // Memperbarui tampilan dengan data yang diperoleh
    updateCategories(data.categories);
    // Menyimpan data kategori di cache
    cacheData('categories', data.categories);
    // Menyimpan gambar dan teks kategori di cache
    data.categories.forEach(category => {
      cacheImage(category.strCategoryThumb);
      cacheText(category.strCategory);
    });
  } catch (error) {
    console.log('Error fetching categories:', error);
    // Jika fetch gagal, coba ambil data dari cache
    getCachedData('categories');
  }
}

// Fungsi untuk memperbarui tampilan dengan data kategori yang diperoleh
function updateCategories(categories) {
  dataContainer.innerHTML = '';
  categories.forEach(category => {
    const card = document.createElement('div');
    card.classList.add('card');

    const image = document.createElement('img');
    image.src = category.strCategoryThumb;
    image.alt = category.strCategory;
    card.appendChild(image);

    const title = document.createElement('h2');
    title.textContent = category.strCategory;
    card.appendChild(title);

    // Event listener saat card kategori diklik
    card.addEventListener('click', () => {
      showCategoryMenu(category.strCategory);
    });

    dataContainer.appendChild(card);
  });
}

// Fungsi untuk menampilkan daftar menu berdasarkan kategori
async function showCategoryMenu(category) {
  try {
    //Mencari Data di cache sebelum mengirim permintaan HTTP ke URL
    const cache = await caches.open('my-data-cache');
    const cachedResponse = await cache.match(category);

    if (cachedResponse) {
      const data = await cachedResponse.json();
      // Menampilkan daftar menu dari cache
      currentCategory = category;
      currentMenu = data;
      updateMenu(currentMenu);
      showBackButton();
    } else {
      //Mengirim permintaan HTTP GET ke URL 
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      const data = await response.json();
      // Menyimpan kategori yang sedang ditampilkan
      currentCategory = category;
      currentMenu = data.meals;
      // Memperbarui tampilan dengan daftar menu
      updateMenu(currentMenu);
      // Menyimpan data menu di cache
      cacheData(category, currentMenu);

      // Menyimpan gambar dan teks menu kategori di cache
      currentMenu.forEach(menu => {
        cacheImage(menu.strMealThumb);
        cacheText(menu.strMeal);
      });

      // Menampilkan tombol/menu kembali
      showBackButton();
    }
  } catch (error) {
    console.log('Error fetching category menu:', error);
  }
}


// Fungsi untuk memperbarui tampilan dengan daftar menu yang diperoleh
function updateMenu(menu) {
  dataContainer.innerHTML = '';
  menu.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');

    const image = document.createElement('img');
    image.src = item.strMealThumb;
    image.alt = item.strMeal;
    card.appendChild(image);

    const title = document.createElement('h2');
    title.textContent = item.strMeal;
    card.appendChild(title);

    // Event listener saat card menu diklik
    card.addEventListener('click', () => {
      showMenuDetail(item.idMeal);
    });

    dataContainer.appendChild(card);
  });
}

// Fungsi untuk menampilkan detail resep berdasarkan ID menu
async function showMenuDetail(id) {
  try {
    //Mencari Data di cache sebelum mengirim permintaan HTTP ke URL
    const cache = await caches.open('my-data-cache');
    const cachedResponse = await cache.match(`detail-${id}`);
    if (cachedResponse) {
      const data = await cachedResponse.json();
      // Menampilkan detail resep
    updateMenuDetail(data.meals[0]);
    // Menyimpan data detail menu di cache
    cacheData(`detail-${id}`, data);
    // Menyembunyikan halaman daftar menu
    hideMenuList();
    // Menampilkan tombol/menu "Back to Menu"
    showBackToMenuButton();
    } else {
      //Mengirim permintaan HTTP GET ke URL 
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await response.json();
    // Menampilkan detail resep
    updateMenuDetail(data.meals[0]);
    // Menyimpan data detail menu di cache
    cacheData(`detail-${id}`, data);
    // Menyembunyikan halaman daftar menu
    hideMenuList();
    // Menampilkan tombol/menu "Back to Menu"
    showBackToMenuButton();
    // Menyimpan gambar dan teks detail menu di cache
    cacheImage(data.meals[0].strMealThumb);
    cacheText(data.meals[0].strMeal);
    }
  } catch (error) {
    console.log('Error fetching menu detail:', error);
  }
}

// Fungsi untuk merapikan teks resep
function formatInstructions(instructions) {
  // Pisahkan instruksi menjadi array berdasarkan tanda baris baru
  const steps = instructions.split('\n');

  // Hapus baris kosong dari array instruksi
  const filteredSteps = steps.filter(step => step.trim() !== '');

  // Buat elemen <ol> untuk daftar langkah-langkah
  const ol = document.createElement('ol');

  // Tambahkan setiap langkah ke dalam elemen <ol>
  filteredSteps.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    ol.appendChild(li);
  });

  return ol;
}

// Fungsi untuk memperbarui tampilan dengan detail resep yang diperoleh
function updateMenuDetail(menu) {
  detailContainer.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card');

  const image = document.createElement('img');
  image.src = menu.strMealThumb;
  image.alt = menu.strMeal;
  card.appendChild(image);

  const title = document.createElement('h2');
  title.textContent = menu.strMeal;
  card.appendChild(title);

  const category = document.createElement('p');
  category.textContent = `Category: ${menu.strCategory}`;
  card.appendChild(category);

  const instructionsLabel = document.createElement('p');
  instructionsLabel.textContent = 'Instructions:';
  card.appendChild(instructionsLabel);

  const instructions = formatInstructions(menu.strInstructions);
  card.appendChild(instructions);

  detailContainer.appendChild(card);
}

// Fungsi untuk menyembunyikan halaman daftar menu
function hideMenuList() {
  dataContainer.style.display = 'none';
}

// Fungsi untuk menampilkan halaman daftar menu
function showMenuList() {
  dataContainer.style.display = 'grid'; // Menggunakan grid layout untuk tampilan daftar menu
  detailContainer.innerHTML = ''; // Untuk Hapus konten detail resep
}

// Fungsi untuk menampilkan tombol/menu "Back to Categories"
function showBackButton() {
  const backButton = document.createElement('button');
  backButton.textContent = 'Back to Categories';
  backButton.addEventListener('click', () => {
    // Memperbarui tampilan dengan kategori sebelumnya
    fetchCategories();
    // Menghapus tombol/menu kembali
    backButton.remove();
    // Menghapus data menu yang sedang ditampilkan
    currentCategory = '';
    currentMenu = [];
  });
  dataContainer.insertAdjacentElement('afterbegin', backButton);
}


// Fungsi untuk menampilkan tombol/menu "Back to Menu"
function showBackToMenuButton() {
  const backButton = document.createElement('button');
  backButton.textContent = 'Back to Menu';
  backButton.classList.add('back-button'); // Tambahkan kelas CSS 'back-button'
  backButton.addEventListener('click', () => {
    // Menghapus tombol/menu "Back to Menu"
    backButton.remove();
    // Menampilkan kembali halaman daftar menu
    showMenuList();
  });
  document.body.appendChild(backButton); // Ubah penempatan tombol ke dalam body
}

// Fungsi untuk menyimpan data di cache
async function cacheData(key, data) {
  try {
    const cache = await caches.open('my-data-cache');
    await cache.put(key, new Response(JSON.stringify(data)));
  } catch (error) {
    console.log('Error caching data:', error);
  }
}

async function cacheImage(url) {
  try {
    const cache = await caches.open('my-image-cache');
    const response = await fetch(url);
    await cache.put(url, response.clone());
  } catch (error) {
    console.log('Error caching image:', error);
  }
}

async function cacheText(text) {
  try {
    const cache = await caches.open('my-text-cache');
    const response = new Response(text);
    await cache.put(text, response);
  } catch (error) {
    console.log('Error caching text:', error);
  }
}

// Fungsi untuk mengambil data dari cache
async function getCachedData(key) {
  try {
    const cache = await caches.open('my-data-cache');
    const response = await cache.match(key);
    if (response) {
      const data = await response.json();
      // Memperbarui tampilan dengan data yang ada di cache
      if (key === 'categories') {
        updateCategories(data);
        // Menambahkan event listener pada card kategori
        addCategoryClickListeners();
      } else {
        currentCategory = key;
        updateMenu(data);
        showBackButton();
      }
    } else {
      // Jika data tidak ada di cache, tampilkan pesan yang sesuai
      if (key === 'categories') {
        dataContainer.innerHTML = '<p>Tidak ada data kategori yang tersimpan di cache.</p>';
      } else {
        dataContainer.innerHTML = '<p>Tidak ada data menu yang tersimpan di cache.</p>';
      }
    }
  } catch (error) {
    console.log('Error getting cached data:', error);
  }
}

function addCategoryClickListeners() {
  const categoryCards = document.querySelectorAll('.card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.querySelector('h2').textContent;
      showCategoryMenu(category);
    });
  });
}


// Event listener saat aplikasi online
window.addEventListener('online', () => {
  // Memperbarui data kategori ketika koneksi jaringan tersedia
  fetchCategories();
});

// Event listener saat aplikasi offline
window.addEventListener('offline', () => {
  // Mengambil data kategori dari cache saat offline
  getCachedData('categories');
});

// Memanggil fungsi fetchCategories untuk mendapatkan data kategori
fetchCategories();