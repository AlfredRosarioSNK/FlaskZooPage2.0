const isAdmin = document.body.getAttribute('data-is-admin') === 'true';
let isEditing = false;
let imageUrl = '';

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded event fired");

    const scrollPosition = localStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, scrollPosition);
        localStorage.removeItem('scrollPosition');
    }

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

function retrieveOneNews() {
    fetch('/api/news/retrieveOne', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
          
            alert('News successfully retrieved');
            fetch('/api/news')  
                .then(response => response.json())
                .then(newsArray => {
                    const newsContainer = document.getElementById('newsContainer');
                    newsContainer.innerHTML = ''; 
                    newsArray.forEach(newsItem => {
                        if (newsItem.isActive) {
                            const newsCard = createNewsCard(newsItem);
                            newsContainer.appendChild(newsCard);
                        }
                    });
                    adjustNewsLayout();
                })
                .catch(error => console.error('Error reloading news:', error));
        } else {
            alert(result.message);
        }
    })
    .catch(error => {
        console.error('Error retrieving news:', error);
        alert('Failed to retrieve news');
    });
}

function createNewsCard(newsItem) {
    let newsId = newsItem._id.$oid || newsItem._id;
    const imageSrc = newsItem.image ? newsItem.image : 'https://thumbs.dreamstime.com/z/pug-dog-constructor-safety-helmet-yellow-black-work-progress-sign-wooden-pole-isolated-white-background-92995840.jpg';

    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-news-id', newsId);

    let cardFooterHTML = '';
    if (isAdmin) {
        cardFooterHTML = `
        <div class="card-footer">
            <i class="fas fa-edit edit-icon" onclick="editNews('${newsId}')"></i>
            <i class="fas fa-trash-alt delete-icon" onclick="hideNews('${newsId}')"></i>
        </div>`;
    }

    let formattedDate = "Fecha no disponible";
    if (newsItem.publishedDate) {
        const timestamp = Date.parse(newsItem.publishedDate);
        if (!isNaN(timestamp)) {
            formattedDate = new Date(timestamp).toLocaleDateString("es-ES");
        }
    }

    card.innerHTML = `
    <div class="image-section">
        <img class="news-image" id="newsImage${newsId}" src="${imageSrc}">
    </div>
    <div class="article">
        <h4 class="news-title" id="newsTitle${newsId}">${newsItem.titular}</h4>
        <p class="news-content" id="newsContent${newsId}">${newsItem.content}</p>
    </div>
    <div class="posted-date">
        <p class="news-date" id="newsDate${newsId}">${formattedDate}</p>
        ${cardFooterHTML}
    </div>`;
    return card;
}

function editNews(newsId) {
    const title = document.querySelector(`#newsTitle${newsId}`).textContent;
    const content = document.querySelector(`#newsContent${newsId}`).textContent;
    const originalDate = document.querySelector(`#newsDate${newsId}`).textContent;

    let dateISO = '';
    if (originalDate && !isNaN(Date.parse(originalDate))) {
        dateISO = new Date(originalDate).toISOString().substring(0, 16);
    }

    const today = new Date();
    const maxDate = today.toISOString().substring(0, 16);

    document.getElementById('editNewsDateTime').value = dateISO;
    document.getElementById('editNewsDateTime').max = maxDate;
    document.getElementById('editNewsTitle').value = title;
    document.getElementById('editNewsContent').value = content;

    const imageElement = document.getElementById(`newsImage${newsId}`);
    imageUrl = imageElement.src; 
    document.getElementById('newsImageThumbnail').src = imageUrl; 

    document.getElementById('editNewsModal').style.display = 'block';
    document.getElementById('editNewsModal').setAttribute('data-news-id', newsId);
}


function openImagePicker(newsId) {
    const imageInput = document.getElementById('editNewsImageInput');
    imageInput.setAttribute('data-news-id', newsId);
    imageInput.click();
}

function handleImageUpload() {
    const newsId = document.getElementById('editNewsModal').getAttribute('data-news-id');
    const imageInput = document.getElementById('editNewsImageInput');
    const file = imageInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        fetch(`/api/news/image/${newsId}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.imageUrl) {
                imageUrl = data.imageUrl + '?' + new Date().getTime(); // Cache-busting
                document.getElementById(`newsImage${newsId}`).src = imageUrl;
                document.getElementById('newsImageThumbnail').src = imageUrl;
                alert('Imagen cargada exitosamente');
            } else {
                alert('Error cargando la imagen');
            }
        })
        .catch(error => {
            console.error('Error cargando la imagen:', error);
            alert('Error cargando la imagen');
        });
    }
}

  



function submitNewsEdit() {
    const newsId = document.getElementById('editNewsModal').getAttribute('data-news-id');
    const updatedTitle = document.getElementById('editNewsTitle').value;
    const updatedContent = document.getElementById('editNewsContent').value;
    const updatedDateTime = document.getElementById('editNewsDateTime').value;

    const updatedNewsData = {
        titular: updatedTitle,
        content: updatedContent,
        publishedDate: updatedDateTime
    };

   
    if (imageUrl !== document.getElementById(`newsImage${newsId}`).src) {
        updatedNewsData.image = imageUrl;
    }

    fetch(`/api/news/${newsId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedNewsData)
    })
    .then(response => {
        if (response.ok) {
        
            document.getElementById(`newsTitle${newsId}`).textContent = updatedTitle;
            document.getElementById(`newsContent${newsId}`).textContent = updatedContent;
            document.getElementById(`newsImage${newsId}`).src = imageUrl;
            const dateElement = document.getElementById(`newsDate${newsId}`);
            if (updatedDateTime) {
                dateElement.textContent = new Date(updatedDateTime).toLocaleDateString("es-ES");
            }
            alert('Noticia actualizada exitosamente');
            closeEditModal(); 
        } else {
            alert('Error actualizando la noticia');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error actualizando la noticia');
    });
}



function closeEditModal() {
    document.getElementById('editNewsModal').style.display = 'none';
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
            }
            alert('Noticia eliminada exitosamente');
            adjustNewsLayout(); 
        } else {
            alert('Error ocultando la noticia');
        }
    })
    .catch(error => console.error('Error:', error));
}


function adjustNewsLayout() {
    const newsContainer = document.getElementById('newsContainer');
    const blogSection = document.querySelector('.blog-section');
    const retrieveNewsButton = document.getElementById('retrieveNewsButton');
    const newsCards = newsContainer.querySelectorAll('.card');
    const hasNewsCards = newsCards.length > 0;

    if (hasNewsCards) {
        blogSection.style.display = '';
        switch (newsCards.length) {
            case 1:
            case 2:
                newsContainer.style.gridTemplateColumns = 'repeat(' + newsCards.length + ', 1fr)';
                retrieveNewsButton.style.display = 'block'; 
                break;
            case 3:
                newsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
                retrieveNewsButton.style.display = 'none'; 
                break;
            default:
                newsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
                retrieveNewsButton.style.display = 'none'; 
                break;
        }
    } else {
        blogSection.style.display = 'none';
        retrieveNewsButton.style.display = 'block'; 
}

}