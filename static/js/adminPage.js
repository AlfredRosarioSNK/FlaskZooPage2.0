document.addEventListener('DOMContentLoaded', function () {
    let users = []; // Aquí almacenaremos todos los usuarios
    let currentPage = 1;
    const usersPerPage = 5;

    fetch('/api/getUsers')
        .then(response => response.json())
        .then(data => {
            users = data;
            displayUsers(currentPage);
        });

    function displayUsers(page) {
        const userList = document.getElementById('userList');
        const pagination = document.getElementById('pagination');

        const startIndex = (page - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);

        userList.innerHTML = ''; 
        paginatedUsers.forEach((user, index) => {
            const tr = document.createElement('tr');
            const roleClass = user.role === 'admin' ? 'role-admin' : 'role-user';
            tr.innerHTML = `
                <td>${startIndex + index + 1}</td>
                <td>${user.username}</td>
                <td><span class="${roleClass}">${user.role}</span></td>
                <td><button class="change-btn--style btn btn-success" onclick="changeRole('${user._id}', '${user.role === 'admin' ? 'user' : 'admin'}')">Change</button></td>
                <td><button class="delete-btn--style btn btn-danger" onclick="deleteUser('${user._id}')">Delete</button></td>
            `;
            userList.appendChild(tr);
        });

        // Actualizamos los botones de paginación
        const totalPages = Math.ceil(users.length / usersPerPage);
        pagination.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item');
            li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
            if (i === currentPage) {
                li.classList.add('active');
            }
            pagination.appendChild(li);
        }
    }

    window.changePage = function (page) {
        currentPage = page;
        displayUsers(currentPage);
    };

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

    window.deleteUser = function (userId) {
        fetch('/api/deleteUser', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
        })

        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        });
    };
});
