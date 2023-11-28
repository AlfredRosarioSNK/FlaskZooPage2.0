document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.user-form form');

    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const formData = {
        username: document.getElementById('username').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        confirmEmail: document.getElementById('confirmEmail').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
      };
      if(formData.email !== formData.confirmEmail) {
        alert('Emails do not match.');
        return;
      }
      if(formData.password !== formData.confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      fetch('/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => {
        if(data.status === 'success') {
          window.location.href = data.redirect;
        } else {
          alert('Registration failed: ' + data.message);
        }
      })
      .catch(error => {
        alert('There was a problem with the registration: ' + error.message);
      });
    });
  });