document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/getUsers')
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('userList');
            users.forEach(user => {
                const li = document.createElement('li');
                li.innerHTML = `
                  ${user.username} - Actual Rol: ${user.role}
                  <button onclick="changeRole('${user._id}', '${user.role === 'admin' ? 'user' : 'admin'}')">Cambiar a ${user.role === 'admin' ? 'usuario' : 'admin'}</button>
              `;
                userList.appendChild(li);
            });
        });
    window.changeRole = function (userId, newRole) {
        fetch('/api/updateUserRole', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, new_role: newRole })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                location.reload();
            });
    };
});
