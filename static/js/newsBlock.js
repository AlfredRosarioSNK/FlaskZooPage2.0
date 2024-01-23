const isAdmin = document.body.getAttribute('data-is-admin') === 'true';
let isEditing = false;

document.addEventListener('DOMContentLoaded', function () {
  console.log("DOMContentLoaded event fired");
  fetch('/api/news')
    .then(response => response.json())
    .then(newsArray => {
      const newsContainer = document.getElementById('newsContainer');
      let activeNewsCount = 0;

      newsArray.forEach(newsItem => {
        if (newsItem.isActive) {
          const newsCard = createNewsCard(newsItem);
          newsContainer.appendChild(newsCard);
          activeNewsCount++;
        }
      });

      adjustNewsLayout();

      if (activeNewsCount >= 3) {
        document.getElementById('retrieveNewsButton').style.display = 'none';
      }
    })
    .catch(error => console.error('Error:', error));
});

function createNewsCard(newsItem) {
  const card = document.createElement('div');
  let newsId = newsItem._id.$oid || newsItem._id;
  card.className = 'card';
  card.setAttribute('data-news-id', newsId);
  
  let cardFooterHTML = '';
  if (isAdmin) {
    cardFooterHTML = `
      <div class="card-footer">
        <i class="fas fa-edit edit-icon" onclick="editNews('${newsId}')"></i>
        <i class="fas fa-trash-alt delete-icon" onclick="hideNews('${newsId}')"></i>
      </div>
    `;
  }

  let formattedDate = "Fecha no disponible";
  if (newsItem.publishedDate) {
    const timestamp = Date.parse(newsItem.publishedDate);
    if (!isNaN(timestamp)) {
      formattedDate = new Date(timestamp).toLocaleDateString("es-ES"); 
    }
  }

  card.innerHTML = `
    <div class="card-header"></div>
    <div class="image-section">
      <img class="news-image" ${isAdmin ? 'contenteditable="true"' : ''} id="newsImage${newsId}" src="${newsItem.image}">
    </div>
    <div class="article">
      <h4 class="news-title" contenteditable="false" id="newsTitle${newsId}">${newsItem.titular}</h4>
      <p class="news-content" contenteditable="false" id="newsContent${newsId}">${newsItem.content}</p>
    </div>
    <div class="posted-date">
      <p class="news-date" id="newsDate${newsId}">${formattedDate}</p>
      ${cardFooterHTML}
    </div>
  `;

  return card;
}

function cancelImageUrlFunction() {
  document.getElementById('imageEditModal').style.display = 'none';
}

function editNews(newsId) {
  const title = document.querySelector(`#newsTitle${newsId}`).textContent;
  const content = document.querySelector(`#newsContent${newsId}`).textContent;
  const image = document.querySelector(`#newsImage${newsId}`).src;

  const originalDate = document.querySelector(`#newsDate${newsId}`).textContent;
  let dateISO = '';

  if (originalDate && !isNaN(Date.parse(originalDate))) {
    dateISO = new Date(originalDate).toISOString().substring(0, 16);
  }

  const today = new Date();
  const maxDate = today.toISOString().substring(0, 16);

  const editNewsDateTime = document.getElementById('editNewsDateTime');
  editNewsDateTime.value = dateISO;
  editNewsDateTime.max = maxDate;

  document.getElementById('editNewsTitle').value = title;
  document.getElementById('editNewsContent').value = content;
  document.getElementById('editNewsImage').value = image;

  document.getElementById('editNewsModal').style.display = 'block';
  document.getElementById('editNewsModal').setAttribute('data-news-id', newsId);
}

function closeEditModal() {
  document.getElementById('editNewsModal').style.display = 'none';
}

function submitNewsEdit() {
  const newsId = document.getElementById('editNewsModal').getAttribute('data-news-id');
  const updatedTitle = document.getElementById('editNewsTitle').value;
  const updatedContent = document.getElementById('editNewsContent').value;
  const updatedImage = document.getElementById('editNewsImage').value;
  
  const updatedDateTime = document.getElementById('editNewsDateTime').value;

  const updatedNewsData = {
    titular: updatedTitle,
    content: updatedContent,
    image: updatedImage,
    publishedDate: updatedDateTime 
  };

  fetch(`/api/news/${newsId}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedNewsData)
  })
  .then(response => {
    if (response.ok) {
      alert('Noticia actualizada exitosamente');
      location.reload(); 
    } else {
      alert('Error updating news');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error updating news');
  });

  closeEditModal();
}
function hideNews(newsId) {
  fetch(`/api/news/${newsId}`, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
  })
  .then(response => {
      if (response.ok) {
        const newsCard = document.querySelector(`[data-news-id="${newsId}"]`);
        if (newsCard) {
          newsCard.remove();
          adjustNewsLayout();
        }
          newsCard.remove();
          adjustNewsLayout();
      } else {
          alert('Error hiding the news');
      }
      location.reload();
  })
  .catch(error => console.error('Error:', error));
}
function adjustNewsLayout() {
  const newsContainer = document.getElementById('newsContainer');
  const blogSection = document.querySelector('.blog-section');

  const hasNewsCards = newsContainer.children.length > 0;

  if (hasNewsCards) {
    blogSection.style.display = '';
    switch (newsContainer.children.length) {
      case 1:
        newsContainer.style.gridTemplateColumns = '1fr';
        break;
      case 2:
        newsContainer.style.gridTemplateColumns = '1fr 1fr';
        break;
      case 3:
        newsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        break;
      default:
        newsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))'; 
        break;
    }
  } else {
    blogSection.style.display = 'none';
  }
}

function addNews() {
  fetch('/api/news/retrieve', { method: 'GET' })
      .then(response => response.json())
      .then(newsArray => {
          if (newsArray && newsArray.length > 0) {
              const newsContainer = document.getElementById('newsContainer');
              newsArray.forEach(newsItem => {
                  const newsCard = createNewsCard(newsItem);
                  newsContainer.appendChild(newsCard);
              });
              adjustNewsLayout();
          } else {
              alert('No news to retrieve.');
          }

          document.getElementById('addNewsButton').style.display = 'none';
      })
      .catch(error => {
          console.error('Error retrieving news:', error);
          alert('Error retrieving news');
      });
}

function retrieveOneNews() {
  fetch('/api/news/retrieveOne', {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
      if (data.status === 'success') {
          alert('news retrieved successfully');
          location.reload();
      } else {
          alert('Error retrieving the news');
      }
  })
  .catch(error => console.error('Error:', error));
}

function checkNewsVisibility() {
  fetch('/api/news')
      .then(response => response.json())
      .then(newsArray => {
          const hiddenNews = newsArray.filter(news => !news.isActive);
          if (hiddenNews.length === 0) {
              document.getElementById('retrieveNewsButton').style.display = 'none';
          }
      })
      .catch(error => console.error('Error:', error));
}

