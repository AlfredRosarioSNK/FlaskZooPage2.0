const isAdmin = document.body.getAttribute('data-is-admin') === 'true';

document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/news')
    .then(response => response.json())
    .then(newsArray => {
      const newsContainer = document.getElementById('newsContainer');
      newsArray.forEach(newsItem => {
        const newsCard = createNewsCard(newsItem);
        newsContainer.appendChild(newsCard);
      });
    })
    .catch(error => console.error('Error:', error));

  if (isAdmin) {
      document.getElementById('editAllNews').style.display = 'block';
      document.getElementById('editAllNews').addEventListener('click', editAllNewsFunction);
  }

  document.getElementById('saveAllNews').addEventListener('click', saveAllNewsFunction);
  document.getElementById('cancelAllNews').addEventListener('click', cancelAllNewsFunction);
  document.getElementById('submitImageUrlBtn').addEventListener('click', submitImageUrlFunction);
  document.getElementById('cancelImageUrlBtn').addEventListener('click', cancelImageUrlFunction);
});

function createNewsCard(newsItem) {
  const card = document.createElement('div');
  card.className = 'card';
  let newsIdStr = newsItem._id.$oid || newsItem._id;
  card.setAttribute('data-news-id', newsIdStr);

  card.innerHTML = `
    <div class="image-section">
        <img class="news-image" ${isAdmin ? 'contenteditable="true"' : ''} id="newsImage${newsIdStr}" src="${newsItem.image}">
    </div>
    <div class="article">
        <h4 class="news-title" contenteditable="false" id="newsTitle${newsIdStr}">${newsItem.titular}</h4>
        <p class="news-content" contenteditable="false" id="newsContent${newsIdStr}">${newsItem.content}</p>
    </div>
    <div class="posted-date">
        <p class="news-date" id="newsDate${newsIdStr}">${newsItem.publishedDate}</p>
    </div>
  `;

  if (isAdmin) {
    const imageElement = card.querySelector('.news-image');
    imageElement.addEventListener('click', function() {
        document.getElementById('imageEditModal').style.display = 'block';
        document.getElementById('newImageUrlInput').value = this.src;
        document.getElementById('imageEditModal').setAttribute('data-news-id', newsIdStr);
    });
  }

  return card;
}

function editAllNewsFunction() {
  document.querySelectorAll('.card').forEach(function(card) {
    card.querySelector('.news-title').contentEditable = true;
    card.querySelector('.news-content').contentEditable = true;
    card.querySelector('.news-image').contentEditable = true;
    card.querySelector('.news-date').contentEditable = true;
  });

  document.getElementById('editAllNews').style.display = 'none';
  document.getElementById('saveAllNews').style.display = 'block';
  document.getElementById('cancelAllNews').style.display = 'block';
}

function saveAllNewsFunction() {
  const updatedNews = [];
  const newsIds = [];
  document.querySelectorAll('.card').forEach(function(card) {
    const newsId = card.getAttribute('data-news-id');
    const title = card.querySelector('.news-title').textContent;
    const content = card.querySelector('.news-content').textContent;
    const imageSrc = card.querySelector('.news-image').src;
    const publishedDate = card.querySelector('.news-date').textContent;

    if (newsId) {
      newsIds.push(newsId);
      updatedNews.push({ 
        titular: title, 
        content: content, 
        image: imageSrc, 
        publishedDate: publishedDate 
      });
    }
  });

  const payload = {
    updatedNews: updatedNews,
    newsIds: newsIds
  };

  fetch('/api/news/updateMultiple', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    alert('Noticias actualizadas con éxito');
  })
  .catch(error => {
    console.error('Error:', error);
  });

  document.getElementById('editAllNews').style.display = 'block';
  document.getElementById('saveAllNews').style.display = 'none';
  document.getElementById('cancelAllNews').style.display = 'none';
}

function cancelAllNewsFunction() {
  document.querySelectorAll('.card').forEach(function(card) {
    const originalTitle = card.getAttribute('data-original-title');
    const originalContent = card.getAttribute('data-original-content');
    const originalImageSrc = card.getAttribute('data-original-image');
    const originalDate = card.getAttribute('data-original-date');

    card.querySelector('.news-title').textContent = originalTitle;
    card.querySelector('.news-content').textContent = originalContent;
    card.querySelector('.news-image').src = originalImageSrc;
    card.querySelector('.news-date').textContent = originalDate;
  });

  document.getElementById('editAllNews').style.display = 'block';
  document.getElementById('saveAllNews').style.display = 'none';
  document.getElementById('cancelAllNews').style.display = 'none';
}

function submitImageUrlFunction() {
  const newUrl = document.getElementById('newImageUrlInput').value;
  const newsId = document.getElementById('imageEditModal').getAttribute('data-news-id');
  fetch(`/api/news/updateImage/${newsId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newImageUrl: newUrl })
  })
  .then(response => response.json())
  .then(data => {
    if(data.status === 'success') {
      document.querySelector(`#newsImage${newsId}`).src = newUrl;
      alert('Imagen actualizada con éxito');
    } else {
      alert('Error al actualizar la imagen');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });

  document.getElementById('imageEditModal').style.display = 'none';
}

function cancelImageUrlFunction() {
  document.getElementById('imageEditModal').style.display = 'none';
}