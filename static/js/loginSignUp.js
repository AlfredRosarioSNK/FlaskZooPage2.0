function toggleLoginForm() {
  let form = document.getElementById("loginFormContainer");
  if (form !== null) {
    form.style.display = form.style.display === "none" ? "block" : "none";
  }
}
function toggleSignupForm() {
  let form = document.getElementById('loginForm');
  let userNameContainer = document.getElementById('userNameContainer');
  let confirmPasswordContainer = document.getElementById('confirmPasswordContainer');
  if (form && userNameContainer && confirmPasswordContainer) {
    if (form.action.endsWith("/login")) {
      form.action = form.dataset.signupUrl;
      form.querySelector('button[type="submit"]').textContent = "Sign Up";
      document.getElementById('toggleButton').textContent = "Log In";
      userNameContainer.style.display = 'block';
      form.noValidate = false;
      if (!confirmPasswordContainer.firstChild) {
        let confirmPasswordInput = document.createElement('input');
        confirmPasswordInput.type = 'password';
        confirmPasswordInput.name = 'confirmPassword';
        confirmPasswordInput.placeholder = 'Confirm Password';
        confirmPasswordInput.required = true;
        confirmPasswordContainer.appendChild(confirmPasswordInput);
      }
      confirmPasswordContainer.style.display = 'block';
      confirmPasswordContainer.firstChild.required = true;
    } else {
      form.noValidate = true;
      if (confirmPasswordContainer.firstChild) {
        let confirmPasswordInput = confirmPasswordContainer.firstChild;
        confirmPasswordInput.required = false;
        confirmPasswordContainer.removeChild(confirmPasswordInput);
      }
      form.action = form.dataset.loginUrl;
      form.querySelector('button[type="submit"]').textContent = "Log In";
      document.getElementById('toggleButton').textContent = "Sign Up";
      userNameContainer.style.display = 'none';
      confirmPasswordContainer.style.display = 'none';
    }
  }
}
let ticketLink = document.querySelector('.ticket-links');
if (ticketLink) {
  ticketLink.addEventListener('click', function (e) {
    if (this.classList.contains('disabled')) {
      toggleLoginForm();
      e.preventDefault();
    }
  });
}
let loginForm = document.getElementById('loginForm');
if (loginForm !== null) {
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    let confirmPasswordContainer = document.getElementById('confirmPasswordContainer');
    let confirmPasswordInput = confirmPasswordContainer ? confirmPasswordContainer.firstChild : null;
    if (confirmPasswordContainer && confirmPasswordInput) {
      if (confirmPasswordContainer.style.display === 'none' && confirmPasswordInput.required) {
        confirmPasswordInput.required = false;
      }
    }
    let form = this;
    setTimeout(function () {
      if (form.action.endsWith("/signup") && confirmPasswordContainer.style.display !== 'none') {
        let password = form.querySelector('input[name="password"]').value;
        let confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
        if (password !== confirmPassword) {
          let messageContainer = document.getElementById('message');
          messageContainer.textContent = "Passwords do not match.";
          messageContainer.style.display = 'block';
          messageContainer.style.color = 'red';
          setTimeout(function () {
            messageContainer.style.display = 'none';
          }, 5000);
          return;
        }
      }
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
      })
        .then(response => response.json())
        .then(data => {
          let messageContainer = document.getElementById('message');
          messageContainer.textContent = data.message;
          messageContainer.style.display = 'block';
          if (data.status === 'success') {
            messageContainer.style.color = 'green';
            if (data.redirect) {
              window.location.href = data.redirect;
            } else {
              location.reload();
            }
          } else {
            messageContainer.style.color = 'red';
          }
          setTimeout(function () {
            messageContainer.style.display = 'none';
          }, 5000);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }, 0);
  });
}
