document.getElementById('splash-screen').style.display = 'flex';
window.addEventListener('load', function () {
  document.getElementById('splash-screen').style.display = 'none';
});
$(document).ready(function () {
  $(".dropbtn").click(function () {
    $(".dropdown-content").toggle();
  });
});
