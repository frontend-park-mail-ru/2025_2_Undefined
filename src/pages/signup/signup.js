import signupTemplate from '../../templates/signup/signup.hbs';
import { signUpUser } from '../../api/auth';

export class Signup {
    #parent
    #isSubmitting = false;

    constructor(parent) {
        this.#parent = parent;
        this.onSubmit = this.onSubmit.bind(this);
    }

    clearErrors() {
        const inputs = this.#parent.querySelectorAll('.signup-input');
        inputs.forEach(input => {
            input.classList.remove('error');
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
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    showFieldOk(fieldName) {
        const input = this.#parent.querySelector(`[name="${fieldName}"]`);
        const okElement = this.#parent.querySelector(`[data-field="${fieldName}"]`);
        
        if (input && okElement) {
            input.classList.add('ok');
        }
    }

    showFormError(message) {
        this.clearErrors();
        
        const form = this.#parent.querySelector('#signup');
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
        } else if (!/^[\d+\-\s()]+$/.test(data.phone_number)) {
            this.showFieldError('phone_number', 'Некорректный формат номера телефона');
            isValid = false;
        } else {
            this.showFieldOk('phone_number');
        }

        const nameRegex = /^[a-zA-Z0-9_]+$/;
        if (!data.username || data.username.trim().length === 0) {
            this.showFieldError('username', 'Логин обязателен');
            isValid = false;
        } else if (data.username.length < 3 && data.username.length < 20) {
            this.showFieldError('username', 'Логин должен содержать не менее 3 и не более 20 символов');
            isValid = false;
        } else if (!nameRegex.test(data.username)) {
            this.showFieldError('username', 'Недопустимые символы');
            isValid = false;
        } else {
            this.showFieldOk('username');
        }

        if (!data.name || data.name.trim().length === 0) {
            this.showFieldError('name', 'Имя обязательно');
            isValid = false;
        } else {
            this.showFieldOk('name');
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
        
        // Блокируем кнопку
        submitButton.disabled = true;
        submitButton.textContent = 'Регистрация...';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Валидация на клиенте
            if (!this.validateForm(data)) {
                return;
            }

            await signUpUser(data);
            
            // Успешная регистрация
            alert('Регистрация прошла успешно!');
            form.reset();
            
        } catch (error) {
            console.error('Registration error:', error);
            
            // Обработка ошибок с сервера
            if (error.errors) {
                // Ошибки валидации с сервера
                Object.keys(error.errors).forEach(fieldName => {
                    this.showFieldError(fieldName, error.errors[fieldName].join(', '));
                });
            } else if (error.message) {
                // Общая ошибка
                this.showFormError(error.message);
            } else {
                this.showFormError('Произошла ошибка при регистрации');
            }
        } finally {
            this.#isSubmitting = false;
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    render() {
        this.#parent.innerHTML = signupTemplate();
        this.#parent.querySelector("#signup").addEventListener("submit", this.onSubmit);
    }
}