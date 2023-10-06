function openGallery(id) {
  let gallery = document.getElementById('gallery');
  let galleryPath = {
    'mammals': '/api/mammals',
    'birds': '/api/bird',
    'reptiles': '/api/reptile',
    'amphibians': '/api/amphibian'
  };
  const iconWrappers = document.querySelectorAll('.icon-wrapper');
  for (const wrapper of iconWrappers) {
    if (wrapper.querySelector('img').getAttribute('onclick').includes(id)) {
      wrapper.classList.add('selected');
    } else {
      wrapper.classList.remove('selected');
    }
  }
  if (galleryPath[id]) {
    fetch(galleryPath[id])
      .then(response => response.json())
      .then(data => {
        gallery.innerHTML = data.map(createCard).join('');
        gallery.style.display = 'flex';
        setTimeout(function () {
          gallery.classList.add('show');
        }, 20);
      });
  }
}
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
function createCard(animal) {
  return `
<div class="card" style="width: 18rem;">
<img src="${animal.image}" class="card-img-top" alt="Image of ${animal.name}">
<div class="card-body">
<h5 class="card-title">${animal.name}</h5>
<p class="card-text">${animal["interesting-fact"]}</p>
</div>
</div>
`;
}
const sliderWords = document.querySelectorAll(".slider-word");
const galleries = document.querySelectorAll(".gallery");
galleries.forEach((gallery) => {
  if (gallery.classList.contains("active")) {
    gallery.style.maxHeight = "100vh";
  }
});
sliderWords.forEach((word) => {
  word.addEventListener("click", () => {
    const galleryToShow = word.getAttribute("data-gallery");
    galleries.forEach((gallery) => {
      if (gallery.id === galleryToShow) {
        gallery.classList.add("active");
        gallery.style.maxHeight = "100vh";
      } else {
        gallery.classList.remove("active");
        gallery.style.maxHeight = "0";
      }
    });
    sliderWords.forEach((w) => {
      w.classList.remove("active");
    });
    word.classList.add("active");
  });
});
document.getElementById("toggle-calendar").addEventListener("click", function () {
  const calendar = document.querySelector(".calendar-container");

  if (calendar.classList.contains("hidden")) {
    calendar.classList.remove("hidden");
  } else {
    calendar.classList.add("hidden");
  }
});
