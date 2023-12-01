document.addEventListener('DOMContentLoaded', function () {
  var form = document.querySelector('form');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var adminEmail = document.getElementById('email').value;
    var adminPassword = document.getElementById('password').value;

    var loginData = {
      adminEmail: adminEmail,
      adminPassword: adminPassword
    };

    fetch('/adminLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          window.location.href = data.redirect;
        } else {
          alert('Login failed: ' + data.message);
        }
      })
      .catch(error => {
        alert('There was a problem with the login: ' + error.message);
      });
  });
});