import React, { useState, useRef } from 'minireact';
import ReactDOM from 'minireact-dom';
import Login from '../login/login.jsx';
import { signUpUser } from '@api/modules/auth';
import { fetchUser } from '../login/login.jsx';
import { getRouter } from '@/router/router.jsx';

const Signup = () => {
    const formRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const passwordRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    const phoneErrorRef = useRef(null);
    const nameErrorRef = useRef(null);
    const passwordErrorRef = useRef(null);
    const formError = useRef(null);

    /** -----------------------------
     * Очистка ошибок
    --------------------------------*/
    const clearErrors = () => {
        phoneErrorRef.current = null;
        nameErrorRef.current = null;
        passwordErrorRef.current = null;

        const form = formRef.current;
        if (!form) return;

        const inputs = form.querySelectorAll('.signup-input');
        inputs.forEach((input) => {
            input.classList.remove('error', 'ok');

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
        const input = form?.querySelector(`[name="${fieldName}"]`);
        const errorElement = form?.querySelector(`[data-field="${fieldName}"]`);

        if (input) {
            input.classList.add('error');
            input.classList.remove('ok');
        }

        if (fieldName === 'phone_number') phoneErrorRef.current = message;
        else if (fieldName === 'name') nameErrorRef.current = message;
        else if (fieldName === 'password') passwordErrorRef.current = message;

        if (errorElement) {
            // errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    };

    const showFieldOk = (fieldName) => {
        const form = formRef.current;
        const input = form?.querySelector(`[name="${fieldName}"]`);
        if (input) {
            input.classList.add('ok');
            input.classList.remove('error');
        }

        // ➕ Очищаем ошибку
        if (fieldName === 'phone_number') phoneErrorRef.current = null;
        else if (fieldName === 'name') nameErrorRef.current = null;
        else if (fieldName === 'password') passwordErrorRef.current = null;
    };

    /** -----------------------------
     * Общая ошибка формы
    --------------------------------*/
    const showFormError = (message) => {
        clearErrors();
        formError.current = message;
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
            await fetchUser();
            getRouter().navigateTo('/');
        } catch (error) {
            switch (error.statusCode) {
                case 409:
                    showFieldError('phone_number', 'Этот номер уже занят')
                    break;
                default:
                    showFormError('Ошибка регистрации');
            }
        }

        setIsSubmitting(false);
    };

    const goToLogin = () => {
        getRouter().navigateTo('/login');
    };

    return (
        <div class='signup-block'>
            <h1>Регистрация</h1>

            {formError.current && 
                <div class="form-error"> {formError.current} </div>
            }

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
                    <div class='error-message' data-field='phone_number'>
                        {phoneErrorRef.current}
                    </div>
                </div>

                <div class='input-group'>
                    <input
                        type='text'
                        name='name'
                        class='signup-input'
                        placeholder='Введите имя'
                        onChange={changeInput}
                    />
                    <div class='error-message' data-field='name'>
                        {nameErrorRef.current}
                    </div>
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
                    <div class='error-message' data-field='password'>
                        {passwordErrorRef.current}
                    </div>
                </div>

                <button type='submit' class='signup-button'>
                    {'Зарегистрироваться'}
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

export default Signup;
