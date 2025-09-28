import loginTemplate from '../../templates/login/login.hbs';
import { loginUser } from '../../api/auth';

export class Login {
    #parent
    #isSubmitting = false;

    constructor(parent) {
        this.#parent = parent;
        this.onSubmit = this.onSubmit.bind(this);
    }

    clearErrors() {
        const inputs = this.#parent.querySelectorAll('.login-input');
        inputs.forEach(input => {
            input.classList.remove('error');
            input.classList.remove('ok'); 
            const fieldName = input.getAttribute('name');
            const errorElement = this.#parent.querySelector(`[data-field="${fieldName}"]`);
            errorElement.style.display = 'none';
        });

       const errorMessages = this.#parent.querySelectorAll('.error-message');
        errorMessages.forEach(message => {
            message.textContent = '';
        });

        const formError = this.#parent.querySelector('.form-error');
        if (formError) {
            formError.remove();
        }
    }

    showFieldError(fieldName, message) {
        const input = this.#parent.querySelector(`[name="${fieldName}"]`);
        const errorElement = this.#parent.querySelector(`[data-field="${fieldName}"]`);
        
        if (input && errorElement) {
            input.classList.add('error');
            input.classList.remove('ok');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    showFieldOk(fieldName) {
        const input = this.#parent.querySelector(`[name="${fieldName}"]`);
        const okElement = this.#parent.querySelector(`[data-field="${fieldName}"]`);
        
        if (input && okElement) {
            input.classList.add('ok');
            input.classList.remove('remove');
        }
    }

    showFormError(message) {
        this.clearErrors();
        
        const form = this.#parent.querySelector('#login');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        
        form.insertBefore(errorDiv, form.firstChild);
    }

    validateForm(data) {
        let isValid = true;
        
        if (!data.phone_number || data.phone_number.trim().length === 0) {
            this.showFieldError('phone_number', 'Номер телефона обязателен');
            isValid = false;
        } else if (!/^[\d+\-\s()]+$/.test(data.phone_number) && data.phone_number.length < 11) {
            this.showFieldError('phone_number', 'Некорректный формат номера телефона');
            isValid = false;
        } else {
            this.showFieldOk('phone_number');
        }

        const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
        if (!data.password || data.password.length === 0) {
            this.showFieldError('password', 'Пароль обязателен');
            isValid = false;
        } else if (data.password.length < 8) {
            this.showFieldError('password', 'Пароль должен содержать минимум 8 символов');
            isValid = false;
        } else if (!passwordRegex.test(data.password)){
            this.showFieldError('password', 'Недопустимые символы');
            isValid = false;
        } else {
            this.showFieldOk('password');
        }

        return isValid;
    }

    async onSubmit(event) {
        event.preventDefault();
        
        if (this.#isSubmitting) return;
        
        this.clearErrors();
        this.#isSubmitting = true;
        
        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.disabled = true;
        submitButton.textContent = 'Авторизация...';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            if (!this.validateForm(data)) {
                return;
            }

            await loginUser(data);
            
            form.reset();
            
        } catch (error) {
            console.error('Authorization error:', error);
            
            if (error.errors) {
                error.errors.forEach(errorItem => {
                    this.showFieldError(errorItem.field, errorItem.message);
                });
            } else if (error.message) {
                console.log(error.errors)
                this.showFormError(error.message);
            } else {
                this.showFormError('Произошла ошибка при авторизации');
            }
        } finally {
            this.#isSubmitting = false;
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    togglePassword(){
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('passwordInput');
        const eyeHidden = document.createElement('i');
        eyeHidden.className = 'eyeHidden';
        
        if (togglePassword && passwordInput) {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                togglePassword.innerHTML = type === 'password' ? '<i class="eye-icon"></i>' : '<i class="eyeHidden-icon"></i>';
        }
    }

    render() {
        this.#parent.innerHTML = loginTemplate();
        this.#parent.querySelector("#login").addEventListener("submit", this.onSubmit);
        this.#parent.querySelector("#togglePassword").addEventListener("click", this.togglePassword);
    }
}