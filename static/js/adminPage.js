document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/getUsers')
        .then(response => response.json())
        .then(users => {
            const userList = document.getElementById('userList');
            users.forEach(user => {
                const li = document.createElement('li');
                const roleClass = user.role === 'admin' ? 'role-admin' : 'role-user';
                li.innerHTML = `
                <span class="role-container">
                ${user.username} - 
                Actual Rol: &nbsp; <span class="${roleClass}">${user.role}</span></span>
                <button class="change-btn--style btn btn-success" onclick="changeRole('${user._id}', '${user.role === 'admin' ? 'user' : 'admin'}')">Change</button>
              `
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
