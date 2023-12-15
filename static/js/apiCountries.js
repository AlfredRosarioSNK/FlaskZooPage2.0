document.addEventListener('DOMContentLoaded', function () {
  try {

      const countrySelect = document.getElementById('country');
      const countriesList = document.getElementById('countriesList');
      const countryApiUrl = 'https://restcountries.com/v3.1/all';

      fetch(countryApiUrl)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(countries => {
              countries.forEach(country => {
                  const option = document.createElement('option');
                  option.value = country.name.common;
                  option.text = country.name.common;
                  countrySelect.add(option);
              });
          })
          .catch(error => {
          });

      const getEntryLink = document.getElementById('getEntryLink');
      const isLoggedIn = document.getElementById('isLoggedIn').value === 'true';
      const loginUrl = document.getElementById('loginUrl').value;

      getEntryLink.addEventListener('click', function (event) {
          try {
              if (!isLoggedIn) {
                  event.preventDefault();
                  alert('You need to be logged in to get an entry.');
                  window.location.href = loginUrl;
              }
          } catch (_) {
          }
      });

      let reviews = document.querySelectorAll('.review');
      let currentIndex = 0;

      function showReview(index) {
          try {
              reviews.forEach((review, i) => {
                  if (i === index) {
                      review.classList.add('show');
                  } else {
                      review.classList.remove('show');
                  }
              });
          } catch (_) {
          }
      }

  } catch (_) {
  }
});
