const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#account_password');

    togglePassword.addEventListener('click', function (e) {
        e.preventDefault(); 
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? 'Show Password' : 'Hide Password';
    });