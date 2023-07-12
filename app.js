// app.js
// Mengambil kategori makanan dari API
function getCategories() {
    return fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
      .then(response => response.json())
      .then(data => data.categories);
  }
  
  // Mengambil menu makanan berdasarkan kategori dari API
  function getMealsByCategory(category) {
    return fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`)
      .then(response => response.json())
      .then(data => data.meals);
  }
  
  // Menampilkan kategori makanan pada halaman
  function showCategories(categories) {
    const categoriesElement = document.getElementById('categories');
    categories.forEach(category => {
      const categoryElement = document.createElement('div');
      categoryElement.innerHTML = category.strCategory;
      categoryElement.addEventListener('click', () => {
        getMealsByCategory(category.strCategory)
          .then(showMeals);
      });
      categoriesElement.appendChild(categoryElement);
    });
  }
  
  // Menampilkan menu makanan pada halaman
  function showMeals(meals) {
    const mealsElement = document.getElementById('meals');
    mealsElement.innerHTML = '';
    meals.forEach(meal => {
      const mealElement = document.createElement('div');
      mealElement.innerHTML = meal.strMeal;
      mealsElement.appendChild(mealElement);
    });
  }
  
  // Registrasi service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
  
  // Panggil fungsi untuk memuat kategori makanan saat halaman dimuat
  getCategories()
    .then(showCategories);
  