document.addEventListener('DOMContentLoaded', function() {
    var scheduleLink = document.querySelector('.scheduleEntry-Hyperlink--Item');
    if (scheduleLink) {
        scheduleLink.addEventListener('click', function(event) {
            var isLoggedIn = this.getAttribute('data-is-logged-in') === 'True';
            if (!isLoggedIn) {
                alert('You need to be logged in to do this.');
                event.preventDefault();
            }
        });
    }
});