document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
  
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());
  
      fetch(this.action, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          window.location.href = data.redirect; 
        } else {
          alert(data.message); 
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  });