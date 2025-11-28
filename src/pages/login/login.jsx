import React, { useState, useRef, createRoot } from 'minireact';
import ReactDOM from 'minireact-dom';
import Signup from '../signup/signup.jsx';
import { loginUser, logoutUser } from '@api/modules/auth';
import Home from '../home/home.jsx';
import { getRouter } from '@/router/router.jsx';

const Login = () => {
    const formRef = useRef(null);
    const passwordRef = useRef(null);

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /** -----------------------------
     * Очистка ошибок формы
    --------------------------------*/
    const clearErrors = () => {
        const form = formRef.current;
        if (!form) return;

        const inputs = form.querySelectorAll('.login-input');
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

        if (!data.password || data.password.length === 0) {
            showFieldError('password', 'Пароль обязателен');
            isValid = false;
        } else if (data.password.length < 8) {
            showFieldError('password', 'Пароль должен быть минимум 8 символов');
            isValid = false;
        } else {
            showFieldOk('password');
        }

        return isValid;
    };

    /** -----------------------------
     * Проверка отдельного поля
    --------------------------------*/
    const validateField = (event) => {
        const { name, value } = event.target;

        if (name === 'phone_number') {
            if (!value || value.trim().length < 18) {
                showFieldError('phone_number', 'Введите корректный номер');
            } else {
                showFieldOk('phone_number');
            }
        }

        if (name === 'password') {
            if (!value || value.length < 8) {
                showFieldError('password', 'Пароль минимум 8 символов');
            } else {
                showFieldOk('password');
            }
        }
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

        if (isSubmitting) return;
        setIsSubmitting(true);
        clearErrors();

        const form = formRef.current;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!validateForm(data)) {
            setIsSubmitting(false);
            return;
        }

        data.phone_number = '+' + data.phone_number.replace(/\D/g, '');

        try {
            await loginUser(data);
            await fetchUser();
            getRouter().navigateTo('/');
        } catch (error) {
            if (error.errors) {
                error.errors.forEach((err) =>
                    showFieldError(err.field, err.message)
                );
            } else {
                const formError = form.querySelector('.form-error');
                if (!formError) {
                    const div = document.createElement('div');
                    div.className = 'form-error';
                    div.textContent = 'Ошибка авторизации';
                    form.prepend(div);
                }
            }
        }

        setIsSubmitting(false);
    };

    const goToSignup = () => {
        getRouter().navigateTo('/signup');
    };

    return (
        <div class="login-block">
            <h1>Вход</h1>

            <form id="login" ref={formRef} class="login-form" onSubmit={onSubmit}>
                <div class="input-group">
                    <input
                        type="text"
                        name="phone_number"
                        id="tel"
                        class="login-input"
                        placeholder="Введите номер телефона"
                        onInput={telValidate}
                        onChange={changeInput}
                        onBlur={validateField}
                    />
                    <div class="error-message" data-field="phone_number"></div>
                </div>

                <div class="input-group">
                    <div class="login-password-input">
                        <input
                            type="password"
                            name="password"
                            id="passwordInput"
                            ref={passwordRef}
                            class="login-input"
                            placeholder="Введите пароль"
                            onChange={changeInput}
                            onBlur={validateField}
                        />
                        <button
                            type="button"
                            class="toggle-password"
                            id="togglePassword"
                            onClick={togglePassword}
                        >
                            {showPassword ? (
                                <i class="eyeHidden-icon"></i>
                            ) : (
                                <i class="eye-icon"></i>
                            )}
                        </button>
                    </div>

                    <div class="error-message" data-field="password"></div>
                </div>

                <button type="submit" class="login-button">
                    {isSubmitting ? 'Вход...' : 'Войти'}
                </button>
            </form>

            <div class="link-to-signup-block">
                <span>Еще нет аккаунта?</span>
                <a
                    id="linkToSignup"
                    class="link-to-signup"
                    onClick={goToSignup}
                >
                    Регистрация
                </a>
            </div>
        </div>
    );
};

const container = document.getElementById('root');
// createRoot(<Login />, container);
export default Login;

window.app = {
    user: null,
    isAuth: false,
};

export async function fetchUser() {
    try {
        const response = await fetch('/api/v1/me', {
            credentials: 'include',
        });

        if (response.ok) {
            const userData = await response.json();
            app.user = userData;
            app.isAuth = true;
            return true;
        }
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
    }

    app.user = null;
    app.isAuth = false;
    return false;
}

export const checkAuth = () => {
    if (app.isAuth) {
        console.log('Я зареган');
        createRoot(<Home />, container);
        // logoutUser();
    } else {
        console.log('я не зареган');
        createRoot(<Login />, container);
    }
};

await fetchUser();
await checkAuth();
