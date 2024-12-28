function kickstartRegister() {

    const form = document.getElementById('register-form');
    const messageContainer = document.getElementById('message-container');

    form.addEventListener('submit', (x) => {
        x.preventDefault();

        messageContainer.innerHTML = '';

        const formData = new FormData(form);

        fetch('/register-employee', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `alert ${data.status === 'success' ? 'alert-success' : 'alert-danger'}`;
            messageDiv.textContent = data.message;

            messageContainer.appendChild(messageDiv);

            if (data.status === 'success') {
                form.reset();
                fetchEmployees();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    fetchEmployees();
}

function fetchEmployees() {
    fetch('/get-employees')
        .then(response => response.json())
        .then(employees => {
            const container = document.getElementById('employees-list');
            container.innerHTML = '';

            if (employees.length === 0) {
                container.innerHTML = '<p>No employees found.</p>';

            } else {
                const table = document.createElement('table');
                table.className = 'table table-striped';

                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                const headers = ['ID', 'Username', 'Registration Code', 'Actions'];

                headers.forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                const tbody = document.createElement('tbody');
                employees.forEach(employee => {
                    const row = document.createElement('tr');

                    const tdId = document.createElement('td');
                    tdId.textContent = employee.id;
                    row.appendChild(tdId);

                    const tdUsername = document.createElement('td');
                    tdUsername.textContent = employee.username;
                    row.appendChild(tdUsername);

                    const tdRegistrationCode = document.createElement('td');
                    tdRegistrationCode.textContent = employee.registration_code;
                    row.appendChild(tdRegistrationCode);

                    const tdActions = document.createElement('td');
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'btn btn-danger btn-sm';
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', () => deleteEmployee(employee.id, row));
                    tdActions.appendChild(deleteButton);
                    row.appendChild(tdActions);

                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
                container.appendChild(table);
            }
        })
        .catch(error => {
            console.error('Error fetching employees:', error);
        });
}

function deleteEmployee(employeeId, row) {
    if (confirm('Are you sure you want to delete this employee?')) {
        fetch(`/delete-employee/${employeeId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                row.remove();
            } else {
                alert('Failed to delete employee.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the employee.');
        });
    }
}

