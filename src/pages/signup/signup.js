import signupTemplate from '../../templates/signup/signup.hbs';
import { signUpUser } from '../../api/modules/auth';
import goToPage from '../../main'

/**
 * Класс для управления логикой страницы регистрации
 */
export class Signup {
    #parent
    #isSubmitting = false;

    /**
     * Создает экземпляр класса Signup
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     */
    constructor(parent) {
        this.#parent = parent;
        this.onSubmit = this.onSubmit.bind(this);
    }

    /**
     * Очищает все ошибки валидации формы
     */
    clearErrors() {
        const inputs = this.#parent.querySelectorAll('.signup-input');
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

    /**
     * Показывает ошибку для конкретного поля формы
     * @param {string} fieldName - Имя поля
     * @param {string} message - Текст ошибки
     */
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

    /**
     * Показывает успешную валидацию для поля формы
     * @param {string} fieldName - Имя поля
     */
    showFieldOk(fieldName) {
        const input = this.#parent.querySelector(`[name="${fieldName}"]`);
        const okElement = this.#parent.querySelector(`[data-field="${fieldName}"]`);
        
        if (input && okElement) {
            input.classList.add('ok');
            input.classList.remove('remove');
        }
    }

    /**
     * Показывает общую ошибку формы
     * @param {string} message - Текст ошибки
     */
    showFormError(message) {
        this.clearErrors();
        
        const form = this.#parent.querySelector('#signup');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        
        form.insertBefore(errorDiv, form.firstChild);
    }

    /**
     * Валидирует данные формы регистрации
     * @param {Object} data - Данные формы
     * @param {string} data.phone_number - Номер телефона
     * @param {string} data.username - Логин пользователя
     * @param {string} data.email - Email пользователя
     * @param {string} data.name - Имя пользователя
     * @param {string} data.password - Пароль пользователя
     * @returns {boolean} Результат валидации
     */
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

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!data.username || data.username.trim().length === 0) {
            this.showFieldError('username', 'Логин обязателен');
            isValid = false;
        } else if (data.username.length < 3 && data.username.length < 20) {
            this.showFieldError('username', 'Логин должен содержать не менее 3 и не более 20 символов');
            isValid = false;
        } else if (!usernameRegex.test(data.username)) {
            this.showFieldError('username', 'Недопустимые символы');
            isValid = false;
        } else {
            this.showFieldOk('username');
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!data.email || data.email.trim().length === 0) {
            this.showFieldError('email', 'Почта обязательна');
            isValid = false;
        } else if (!emailRegex.test(data.email)) {
            this.showFieldError('email', 'Недопустимые символы');
            isValid = false;
        } else {
            this.showFieldOk('email');
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

    /**
     * Обрабатывает отправку формы регистрации
     * @param {Event} event - Событие отправки формы
     * @returns {Promise<void>}
     */
    async onSubmit(event) {
        event.preventDefault();
        
        if (this.#isSubmitting) return;
        
        this.clearErrors();
        this.#isSubmitting = true;
        
        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.disabled = true;
        submitButton.textContent = 'Регистрация...';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            if (!this.validateForm(data)) {
                return;
            }

            await signUpUser(data);
            
            form.reset();

            goToPage('home');
            
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.errors) {
                error.errors.forEach(errorItem => {
                    this.showFieldError(errorItem.field, errorItem.message);
                });
            } else if (error.message) {
                console.log(error.errors)
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

    /**
     * Переключает видимость пароля в поле ввода
     */
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

    /**
     * Переход на страницу авторизации
     * @param {Event} event - Событие клика
     */
    linkToLogin(event){
        event.preventDefault();
        goToPage('login');
    }

    /**
     * Рендерит страницу регистрации
     */
    render() {
        this.#parent.innerHTML = signupTemplate();
        this.#parent.querySelector("#signup").addEventListener("submit", this.onSubmit);
        this.#parent.querySelector("#togglePassword").addEventListener("click", this.togglePassword);
        this.#parent.querySelector('#linkToLogin').addEventListener("click", this.linkToLogin)
    }
}