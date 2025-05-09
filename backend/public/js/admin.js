// Глобальные переменные
let currentPage = 1;
const itemsPerPage = 10;

// Функция для загрузки статистики
async function loadStats() {
  try {
    const response = await fetch('/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();

    document.getElementById('totalClinics').textContent = data.totalClinics;
    document.getElementById('totalReviews').textContent = data.totalReviews;
    document.getElementById('totalUsers').textContent = data.totalUsers;
    document.getElementById('totalNotifications').textContent = data.totalNotifications;
  } catch (error) {
    console.error('Error loading stats:', error);
    showError('Ошибка при загрузке статистики');
  }
}

// Функция для загрузки пользователей
async function loadUsers() {
  try {
    const roleFilter = document.getElementById('userRoleFilter').value;
    const searchQuery = document.getElementById('userSearchInput').value;

    const response = await fetch(
      `/api/admin/users?page=${currentPage}&limit=${itemsPerPage}&role=${roleFilter}&search=${searchQuery}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    const data = await response.json();

    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';

    data.users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user._id}</td>
        <td>${user.firstName} ${user.lastName}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editUser('${user._id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      usersList.appendChild(row);
    });

    // Обновляем пагинацию
    updatePagination(data.total, data.pages, 'usersPagination');
  } catch (error) {
    console.error('Error loading users:', error);
    showError('Ошибка при загрузке пользователей');
  }
}

// Функция для загрузки клиник
async function loadClinics() {
  try {
    const response = await fetch(`/api/admin/clinics?page=${currentPage}&limit=${itemsPerPage}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();

    const clinicsList = document.getElementById('clinicsList');
    clinicsList.innerHTML = '';

    data.clinics.forEach(clinic => {
      const clinicCard = document.createElement('div');
      clinicCard.className = 'col-md-4';
      clinicCard.innerHTML = `
        <div class="clinic-card">
          <img src="${clinic.photos[0] || '/images/default-clinic.jpg'}" alt="${clinic.name}">
          <h3 class="mt-3">${clinic.name}</h3>
          <p>${clinic.address}</p>
          <p>Телефон: ${clinic.phone}</p>
          <div class="d-flex justify-content-between">
            <button class="btn btn-primary" onclick="editClinic('${clinic._id}')">
              <i class="bi bi-pencil"></i> Редактировать
            </button>
            <button class="btn btn-danger" onclick="deleteClinic('${clinic._id}')">
              <i class="bi bi-trash"></i> Удалить
            </button>
          </div>
        </div>
      `;
      clinicsList.appendChild(clinicCard);
    });

    // Обновляем пагинацию
    updatePagination(data.total, data.pages, 'clinicsPagination');
  } catch (error) {
    console.error('Error loading clinics:', error);
    showError('Ошибка при загрузке клиник');
  }
}

// Функция для загрузки отзывов
async function loadReviews() {
  try {
    const response = await fetch(`/api/admin/reviews?page=${currentPage}&limit=${itemsPerPage}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();

    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';

    data.reviews.forEach(review => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${review.clinic.name}</td>
        <td>${review.user.name}</td>
        <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
        <td>${review.text}</td>
        <td>${new Date(review.createdAt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm btn-success" onclick="approveReview('${review._id}')" ${review.isApproved ? 'disabled' : ''}>
            <i class="bi bi-check"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteReview('${review._id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      reviewsList.appendChild(row);
    });

    // Обновляем пагинацию
    updatePagination(data.total, data.pages, 'reviewsPagination');
  } catch (error) {
    console.error('Error loading reviews:', error);
    showError('Ошибка при загрузке отзывов');
  }
}

// Функция для обновления пагинации
function updatePagination(total, pages, elementId) {
  const pagination = document.getElementById(elementId);
  pagination.innerHTML = '';

  // Добавляем кнопку "Предыдущая"
  const prevButton = document.createElement('button');
  prevButton.className = 'btn btn-outline-primary me-2';
  prevButton.innerHTML = '<i class="bi bi-chevron-left"></i>';
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadCurrentSection();
    }
  };
  pagination.appendChild(prevButton);

  // Добавляем номера страниц
  for (let i = 1; i <= pages; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = `btn ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} me-2`;
    pageButton.textContent = i;
    pageButton.onclick = () => {
      currentPage = i;
      loadCurrentSection();
    };
    pagination.appendChild(pageButton);
  }

  // Добавляем кнопку "Следующая"
  const nextButton = document.createElement('button');
  nextButton.className = 'btn btn-outline-primary';
  nextButton.innerHTML = '<i class="bi bi-chevron-right"></i>';
  nextButton.disabled = currentPage === pages;
  nextButton.onclick = () => {
    if (currentPage < pages) {
      currentPage++;
      loadCurrentSection();
    }
  };
  pagination.appendChild(nextButton);
}

// Функция для загрузки текущего раздела
function loadCurrentSection() {
  const activeSection = document.querySelector('.nav-link.active').dataset.section;
  switch (activeSection) {
    case 'dashboard':
      loadStats();
      break;
    case 'users':
      loadUsers();
      break;
    case 'clinics':
      loadClinics();
      break;
    case 'reviews':
      loadReviews();
      break;
  }
}

// Функция для отображения ошибок
function showError(message) {
  // Здесь можно добавить красивое отображение ошибок
  alert(message);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем авторизацию
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  // Загружаем начальные данные
  loadStats();

  // Обработчики навигации
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();

      // Убираем активный класс у всех ссылок
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

      // Добавляем активный класс к выбранной ссылке
      link.classList.add('active');

      // Скрываем все секции
      document.querySelectorAll('.section').forEach(section => section.classList.add('d-none'));

      // Показываем выбранную секцию
      const sectionId = link.dataset.section;
      document.getElementById(sectionId).classList.remove('d-none');

      // Сбрасываем текущую страницу
      currentPage = 1;

      // Загружаем данные для выбранной секции
      loadCurrentSection();
    });
  });
});
