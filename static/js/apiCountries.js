const countrySelect = document.getElementById('country');
const countryApiUrl = 'https://restcountries.com/v3.1/all';
fetch(countryApiUrl)
  .then((response) => response.json())
  .then((countries) => {
    countries.forEach((country) => {
      const option = document.createElement('option');
      option.value = country.name.common;
      option.text = country.name.common;
      countrySelect.add(option);
    });
  })
  .catch((error) => {
    console.error('Error fetching countries:', error);
  });
let reviews = document.querySelectorAll('.review');
let currentIndex = 0;
function showReview(index) {
  reviews.forEach((review, i) => {
    if (i === index) {
      review.classList.add('show');
    } else {
      review.classList.remove('show');
    }
  });
}
