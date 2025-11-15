import React, { useState, useRef } from 'minireact';
import ReactDOM from 'minireact-dom';
import Login from '../login/login.jsx';
import { signUpUser } from '@api/modules/auth';

const Signup = () => {
    const formRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const passwordRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    /** -----------------------------
     * Очистка ошибок
    --------------------------------*/
    const clearErrors = () => {
        const form = formRef.current;
        if (!form) return;

        const inputs = form.querySelectorAll('.signup-input');
        inputs.forEach((input) => {
            input.classList.remove('error');
            input.classList.remove('ok');

            const fieldName = input.getAttribute('name');
            const errorElement = form.querySelector(`[data-field="${fieldName}"]`);

            if (errorElement) {
                errorElement.style.display = 'none';
                errorElement.textContent = '';
            }
        });

        const formError = form.querySelector('.form-error');
        if (formError) formError.remove();
    };

    /** -----------------------------
     * Ошибка поля
    --------------------------------*/
    const showFieldError = (fieldName, message) => {
        const form = formRef.current;
        const input = form.querySelector(`[name="${fieldName}"]`);
        const errorElement = form.querySelector(`[data-field="${fieldName}"]`);

        if (input && errorElement) {
            input.classList.add('error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    };

    const showFieldOk = (fieldName) => {
        const form = formRef.current;
        const input = form.querySelector(`[name="${fieldName}"]`);
        if (input) {
            input.classList.add('ok');
            input.classList.remove('error');
        }
    };

    /** -----------------------------
     * Общая ошибка формы
    --------------------------------*/
    const showFormError = (message) => {
        clearErrors();

        const form = formRef.current;
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;

        form.prepend(errorDiv);
    };

    /** -----------------------------
     * Валидация формы
    --------------------------------*/
    const validateForm = (data) => {
        let isValid = true;

        if (!data.phone_number || data.phone_number.trim().length === 0) {
            showFieldError('phone_number', 'Номер телефона обязателен');
            isValid = false;
        } else if (data.phone_number.trim().length < 18) {
            showFieldError('phone_number', 'Введите номер полностью');
            isValid = false;
        } else {
            showFieldOk('phone_number');
        }

        if (!data.name || data.name.trim().length === 0) {
            showFieldError('name', 'Имя обязательно');
            isValid = false;
        } else {
            showFieldOk('name');
        }

        const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;

        if (!data.password || data.password.length === 0) {
            showFieldError('password', 'Пароль обязателен');
            isValid = false;
        } else if (data.password.length < 8) {
            showFieldError('password', 'Минимум 8 символов');
            isValid = false;
        } else if (!passwordRegex.test(data.password)) {
            showFieldError(
                'password',
                'Допустима латиница, цифры и спецсимволы'
            );
            isValid = false;
        } else {
            showFieldOk('password');
        }

        return isValid;
    };

    /** -----------------------------
     * Красивое форматирование номера
    --------------------------------*/
    const telValidate = (event) => {
        let value = event.target.value.replace(/\D/g, '');

        if (value.startsWith('7') || value.startsWith('8')) {
            value = value.substring(1);
        }

        let formatted = '+7 (';

        if (value.length > 0) formatted += value.substring(0, 3);
        if (value.length > 3) formatted += ') ' + value.substring(3, 6);
        if (value.length > 6) formatted += '-' + value.substring(6, 8);
        if (value.length > 8) formatted += '-' + value.substring(8, 10);

        event.target.value = formatted;
    };

    /** -----------------------------
     * Удаление ошибки при вводе
    --------------------------------*/
    const changeInput = (event) => {
        event.target.classList.remove('error');
        event.target.classList.remove('ok');

        const form = formRef.current;
        const fieldName = event.target.name;
        const errorElement = form.querySelector(`[data-field="${fieldName}"]`);

        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    };

    /** -----------------------------
     * Переключение видимости пароля
    --------------------------------*/
    const togglePassword = () => {
        const input = passwordRef.current;
        if (!input) return;

        const newType = input.type === 'password' ? 'text' : 'password';
        input.type = newType;
        setShowPassword(newType === 'text');
    };

    /** -----------------------------
     * Сабмит формы
    --------------------------------*/
    const onSubmit = async (event) => {
        event.preventDefault();

        // if (isSubmitting) return;

        clearErrors();
        setIsSubmitting(true);

        const form = formRef.current;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!validateForm(data)) {
            setIsSubmitting(false);
            return;
        }

        data.phone_number = '+' + data.phone_number.replace(/\D/g, '');

        try {
            await signUpUser(data);
            form.reset();
            ReactDOM.render(<Login />, document.getElementById('root'));
        } catch (error) {
            if (error.errors) {
                error.errors.forEach((err) =>
                    showFieldError(err.field, err.message)
                );
            } else {
                showFormError('Ошибка регистрации');
            }
        }

        setIsSubmitting(false);
    };

    const goToLogin = () => {
        ReactDOM.render(<Login />, document.getElementById('root'));
    };

    return (
        <div class='signup-block'>
            <h1>Регистрация</h1>

            <form id='signup' ref={formRef} class='signup-form' onSubmit={onSubmit}>
                <div class='input-group'>
                    <input
                        type='text'
                        id='tel'
                        name='phone_number'
                        class='signup-input'
                        placeholder='Введите номер телефона'
                        onInput={telValidate}
                        onChange={changeInput}
                    />
                    <div class='error-message' data-field='phone_number'></div>
                </div>

                <div class='input-group'>
                    <input
                        type='text'
                        name='name'
                        class='signup-input'
                        placeholder='Введите имя'
                        onChange={changeInput}
                    />
                    <div class='error-message' data-field='name'></div>
                </div>

                <div class='input-group'>
                    <div class='signup-password-input'>
                        <input
                            type='password'
                            name='password'
                            id='passwordInput'
                            class='signup-input'
                            placeholder='Введите пароль'
                            ref={passwordRef}
                            onChange={changeInput}
                        />
                        <button
                            type='button'
                            class='toggle-password'
                            id='togglePassword'
                            onClick={togglePassword}
                        >
                            {showPassword ? (
                                <i class='eyeHidden-icon'></i>
                            ) : (
                                <i class='eye-icon'></i>
                            )}
                        </button>
                    </div>
                    <div class='error-message' data-field='password'></div>
                </div>

                <button type='submit' class='signup-button'>
                    {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>

            <div class='link-to-login-block'>
                <span>Уже есть аккаунт?</span>
                <a class='link-to-login' onClick={goToLogin}>
                    Вход
                </a>
            </div>
        </div>
    );
};

ReactDOM.render(<Signup />, document.getElementById('root'));
export default Signup;
