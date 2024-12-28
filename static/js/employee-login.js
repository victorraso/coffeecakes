document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    const rightSide = document.querySelector('.rightside');

    loginForm();

    /* REGISTRATION FORM */
    registerBtn.addEventListener('click', () => {
        rightSide.innerHTML = '';

        const formDiv = document.createElement('div');
        rightSide.appendChild(formDiv);

        const form = document.createElement('form');
        form.classList.add('bg-light', 'text-dark');
        form.setAttribute('id', 'registration-form');
        formDiv.appendChild(form);

        const formTitle = document.createElement('h2');
        formTitle.classList.add('text-center', 'mb-4');
        formTitle.textContent = 'Employee Registration';
        form.appendChild(formTitle);

        const usernameDiv = document.createElement('div');
        usernameDiv.classList.add('mb-3');
        const usernameLabel = document.createElement('label');
        usernameLabel.setAttribute('for', 'username');
        usernameLabel.classList.add('form-label');
        usernameLabel.textContent = 'Username';
        const usernameInput = document.createElement('input');
        usernameInput.setAttribute('type', 'text');
        usernameInput.setAttribute('id', 'username');
        usernameInput.setAttribute('name', 'username');
        usernameInput.classList.add('form-control');
        usernameInput.setAttribute('required', true);
        usernameInput.setAttribute('autocomplete', 'off');
        usernameDiv.appendChild(usernameLabel);
        usernameDiv.appendChild(usernameInput);
        form.appendChild(usernameDiv);

        const regCodeDiv = document.createElement('div');
        regCodeDiv.classList.add('mb-3');
        const regCodeLabel = document.createElement('label');
        regCodeLabel.setAttribute('for', 'registration_code');
        regCodeLabel.classList.add('form-label');
        regCodeLabel.textContent = 'Registration Code';
        const regCodeInput = document.createElement('input');
        regCodeInput.setAttribute('type', 'text');
        regCodeInput.setAttribute('id', 'registration_code');
        regCodeInput.setAttribute('name', 'registration_code');
        regCodeInput.classList.add('form-control');
        regCodeInput.setAttribute('required', true);
        regCodeInput.setAttribute('autocomplete', 'off');
        regCodeDiv.appendChild(regCodeLabel);
        regCodeDiv.appendChild(regCodeInput);
        form.appendChild(regCodeDiv);

        const passwordDiv = document.createElement('div');
        passwordDiv.classList.add('mb-3');
        const passwordLabel = document.createElement('label');
        passwordLabel.setAttribute('for', 'password');
        passwordLabel.classList.add('form-label');
        passwordLabel.textContent = 'Password';
        const passwordInput = document.createElement('input');
        passwordInput.setAttribute('type', 'password');
        passwordInput.setAttribute('id', 'password');
        passwordInput.setAttribute('name', 'password');
        passwordInput.classList.add('form-control');
        passwordInput.setAttribute('required', true);
        passwordDiv.appendChild(passwordLabel);
        passwordDiv.appendChild(passwordInput);
        form.appendChild(passwordDiv);

        const confirmPasswordDiv = document.createElement('div');
        confirmPasswordDiv.classList.add('mb-3');
        const confirmPasswordLabel = document.createElement('label');
        confirmPasswordLabel.setAttribute('for', 'confirm_password');
        confirmPasswordLabel.classList.add('form-label');
        confirmPasswordLabel.textContent = 'Confirm Password';
        const confirmPasswordInput = document.createElement('input');
        confirmPasswordInput.setAttribute('type', 'password');
        confirmPasswordInput.setAttribute('id', 'confirm_password');
        confirmPasswordInput.setAttribute('name', 'confirm_password');
        confirmPasswordInput.classList.add('form-control');
        confirmPasswordInput.setAttribute('required', true);
        confirmPasswordDiv.appendChild(confirmPasswordLabel);
        confirmPasswordDiv.appendChild(confirmPasswordInput);
        form.appendChild(confirmPasswordDiv);

        const submitButton = document.createElement('button');
        submitButton.setAttribute('type', 'submit');
        submitButton.classList.add('btn', 'btn-primary', 'w-100');
        submitButton.textContent = 'Register';
        form.appendChild(submitButton);


        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            // password must include 8 char, uppercase and number
            const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/;

            if (!passwordPattern.test(password)) {
                alert('Password must be at least 8 characters long, include an uppercase letter, a number, and a lowercase letter.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            const formData = new FormData(form);

            fetch('/employee-registration', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {

                const existingMessage = formDiv.querySelector('.alert');
                if (existingMessage) {
                    existingMessage.remove();
                }

                const messageDiv = document.createElement('div');
                messageDiv.className = `alert ${data.status === 'success' ? 'alert-success' : 'alert-danger'}`;
                messageDiv.textContent = data.message;
                formDiv.appendChild(messageDiv);

                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 5000);

                if (data.status === 'success') {
                    alert('Registration successful! You can now log in.');
                    form.reset();
                    loginForm();
                }
            })
            .catch(error => console.error('Error:', error));
        });

    });

    loginBtn.addEventListener('click', () => {
        loginForm();
    });

    /* LOGIN FORM */
    function loginForm() {

        rightSide.innerHTML = '';

        const formDiv = document.createElement('div');
        rightSide.appendChild(formDiv);

        const form = document.createElement('form');
        form.classList.add('bg-light', 'text-dark');
        form.setAttribute('id', 'registration-form');
        formDiv.appendChild(form);

        const formTitle = document.createElement('h2');
        formTitle.classList.add('text-center', 'mb-4');
        formTitle.textContent = 'Login';
        form.appendChild(formTitle);

        const usernameDiv = document.createElement('div');
        usernameDiv.classList.add('mb-3');
        const usernameLabel = document.createElement('label');
        usernameLabel.setAttribute('for', 'username');
        usernameLabel.classList.add('form-label');
        usernameLabel.textContent = 'Username';
        const usernameInput = document.createElement('input');
        usernameInput.setAttribute('type', 'text');
        usernameInput.setAttribute('id', 'username');
        usernameInput.setAttribute('name', 'username');
        usernameInput.classList.add('form-control');
        usernameInput.setAttribute('required', true);
        usernameInput.setAttribute('autocomplete', 'off');
        usernameDiv.appendChild(usernameLabel);
        usernameDiv.appendChild(usernameInput);
        form.appendChild(usernameDiv);

        const passwordDiv = document.createElement('div');
        passwordDiv.classList.add('mb-3');
        const passwordLabel = document.createElement('label');
        passwordLabel.setAttribute('for', 'password');
        passwordLabel.classList.add('form-label');
        passwordLabel.textContent = 'Password';
        const passwordInput = document.createElement('input');
        passwordInput.setAttribute('type', 'password');
        passwordInput.setAttribute('id', 'password');
        passwordInput.setAttribute('name', 'password');
        passwordInput.classList.add('form-control');
        passwordInput.setAttribute('required', true);
        passwordDiv.appendChild(passwordLabel);
        passwordDiv.appendChild(passwordInput);
        form.appendChild(passwordDiv);

        const submitButton = document.createElement('button');
        submitButton.setAttribute('type', 'submit');
        submitButton.classList.add('btn', 'btn-primary', 'w-100');
        submitButton.textContent = 'Login';
        form.appendChild(submitButton);


        form.addEventListener('submit', (e) => {
            e.preventDefault();

            fetch('/employee-login-form', {
                method: 'POST',
                body: new FormData(form)
            })
            .then(response => response.json())
            .then(data => {

                const existingMessage = formDiv.querySelector('.alert');
                if (existingMessage) {
                    existingMessage.remove();
                }

                const messageDiv = document.createElement('div');
                messageDiv.className = `alert ${data.status === 'success' ? 'alert-success' : 'alert-danger'}`;
                messageDiv.textContent = data.message;
                formDiv.appendChild(messageDiv);

                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 5000);

                if (data.status === 'success') {
                    window.location.href = '/employee';
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

});