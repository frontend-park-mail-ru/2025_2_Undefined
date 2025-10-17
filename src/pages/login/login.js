import loginTemplate from '../../templates/login/login.hbs';
import { loginUser } from '../../api/modules/auth';
import goToPage from '../../main';

/**
 * Класс для управления логикой страницы авторизации
 */
export class Login {
    #parent;
    #isSubmitting = false;

    /**
     * Создает экземпляр класса Login
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     */
    constructor(parent) {
        this.#parent = parent;
        this.onSubmit = this.onSubmit.bind(this);
        this.changeInput = this.changeInput.bind(this);
    }

    /**
     * Очищает все ошибки валидации формы
     */
    clearErrors() {
        const inputs = this.#parent.querySelectorAll('.login-input');
        inputs.forEach((input) => {
            input.classList.remove('error');
            const fieldName = input.getAttribute('name');
            const errorElement = this.#parent.querySelector(
                `[data-field="${fieldName}"]`
            );
            errorElement.style.display = 'none';
        });

        const errorMessages = this.#parent.querySelectorAll('.error-message');
        errorMessages.forEach((message) => {
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
        const errorElement = this.#parent.querySelector(
            `[data-field="${fieldName}"]`
        );

        if (input && errorElement) {
            input.classList.add('error');
            input.classList.remove('ok');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Показывает общую ошибку формы
     * @param {string} message - Текст ошибки
     */
    showFormError(message) {
        this.clearErrors();

        const form = this.#parent.querySelector('#login');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;

        form.insertBefore(errorDiv, form.firstChild);
    }

    /**
     * Валидирует данные формы авторизации
     * @param {Object} data - Данные формы
     * @param {string} data.phone_number - Номер телефона
     * @param {string} data.password - Пароль
     * @returns {boolean} Результат валидации
     */
    validateForm(data) {
        let isValid = true;

        if (!data.phone_number || data.phone_number.trim().length === 0) {
            this.showFieldError('phone_number', 'Номер телефона обязателен');
            isValid = false;
        }

        if (!data.password || data.password.length === 0) {
            this.showFieldError('password', 'Пароль обязателен');
            isValid = false;
        }
        return isValid;
    }

    telValidate(event) {
        let value = event.target.value.replace(/\D/g, '');

        if (value.startsWith('7') || value.startsWith('8')) {
            value = value.substring(1);
        }

        let formattedValue = '+7 (';

        if (value.length > 0) {
            formattedValue += value.substring(0, 3);
        }
        if (value.length > 3) {
            formattedValue += ') ' + value.substring(3, 6);
        }
        if (value.length > 6) {
            formattedValue += '-' + value.substring(6, 8);
        }
        if (value.length > 8) {
            formattedValue += '-' + value.substring(8, 10);
        }

        event.target.value = formattedValue;
    }

    changeInput(event) {
        event.target.classList.remove('error');
        event.target.classList.remove('ok');
        const fieldName = event.target.getAttribute('name');
        const errorElement = this.#parent.querySelector(
            `[data-field="${fieldName}"]`
        );
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    }

    /**
     * Обрабатывает отправку формы авторизации
     * @param {Event} event - Событие отправки формы
     * @returns {Promise<void>}
     */
    async onSubmit(event) {
        event.preventDefault();

        if (this.#isSubmitting) return;

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

            data['phone_number'] =
                '+' + data['phone_number'].replace(/\D/g, '');

            await loginUser(data);

            form.reset();

            goToPage('home');
        } catch (error) {
            console.error('Authorization error:', error);
            if (error.message) {
                this.showFormError('Неверные учётные данные');
            } else {
                this.showFormError('Произошла ошибка при авторизации');
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
    togglePassword() {
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('passwordInput');
        const eyeHidden = document.createElement('i');
        eyeHidden.className = 'eyeHidden';

        if (togglePassword && passwordInput) {
            const type =
                passwordInput.getAttribute('type') === 'password'
                    ? 'text'
                    : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML =
                type === 'password'
                    ? '<i class="eye-icon"></i>'
                    : '<i class="eyeHidden-icon"></i>';
        }
    }

    /**
     * Переход на страницу регистрации
     * @param {Event} event - Событие клика
     */
    linkToSignup(event) {
        event.preventDefault();
        goToPage('signup');
    }

    /**
     * Рендерит страницу авторизации
     */
    render() {
        this.#parent.innerHTML = loginTemplate();
        this.#parent
            .querySelector('#login')
            .addEventListener('submit', this.onSubmit);
        this.#parent
            .querySelector('#togglePassword')
            .addEventListener('click', this.togglePassword);
        this.#parent
            .querySelector('#linkToSignup')
            .addEventListener('click', this.linkToSignup);
        this.#parent
            .querySelector('#tel')
            .addEventListener('input', this.telValidate);

        const allInputs = this.#parent.querySelectorAll('.login-input');
        allInputs.forEach((input) => {
            input.addEventListener('input', this.changeInput);
        });
    }
}
