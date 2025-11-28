import React, { useState, useRef } from 'minireact';
import ReactDOM from 'minireact-dom';
import Login from '../login/login.jsx';
import { signUpUser } from '@api/modules/auth';
import { fetchUser } from '../login/login.jsx';
import { getRouter } from '@/router/router.jsx';

const Signup = () => {
    const passwordRef = useRef(null);

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Значения полей
    const [formData, setFormData] = useState({
        phone_number: '',
        name: '',
        password: ''
    });

    // Ошибки формы
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState(null);

    /** -----------------------------
     * Маска телефона
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

        setFormData(prev => ({ ...prev, phone_number: formatted }));
    };

    /** -----------------------------
     * Изменение input
    --------------------------------*/
    const changeInput = (event) => {
        const { name, value } = event.target;

        setFormData(prev => ({ ...prev, [name]: value }));

        setErrors(prev => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
        });

        setFormError(null);
    };

    /** -----------------------------
     * Показ/скрытие пароля
    --------------------------------*/
    const togglePassword = () => {
        if (!passwordRef.current) return;

        const newType = passwordRef.current.type === 'password' ? 'text' : 'password';
        passwordRef.current.type = newType;
        setShowPassword(newType === 'text');
    };

    /** -----------------------------
     * Валидация формы
    --------------------------------*/
    const validateForm = () => {
        const newErrors = {};

        // Телефон
        const cleanPhone = formData.phone_number.replace(/\D/g, '');
        if (cleanPhone.length !== 11) {
            newErrors.phone_number = "Введите номер полностью в формате +7 (XXX) XXX-XX-XX";
        }

        // Имя
        if (!formData.name.trim()) {
            newErrors.name = "Имя не может быть пустым";
        }

        // Пароль
        const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;

        if (!formData.password || formData.password.length < 8) {
            newErrors.password = "Пароль должен содержать минимум 8 символов";
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = "Пароль может содержать латиницу, цифры и спецсимволы";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setFormError("Исправьте ошибки в форме.");
            return false;
        }

        return true;
    };

    /** -----------------------------
     * Сабмит формы
    --------------------------------*/
    const onSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        setErrors({});
        setFormError(null);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        const dataToSend = {
            ...formData,
            phone_number: formData.phone_number.replace(/\D/g, '') // отправляем без маски
        };

        try {
            await signUpUser(dataToSend);
            await fetchUser();
            getRouter().navigateTo('/');
        } catch (error) {
            console.log("Signup error:", error);
            if (error.errors) {
                const newErrors = {};
                error.errors.forEach(err => {
                    newErrors[err.field] = err.message;
                });
                setErrors(newErrors);
                setFormError("Некоторые данные введены некорректно. Исправьте ошибки и попробуйте снова.");
            } else {
                setFormError("Ошибка регистрации. Попробуйте позже.");
            }
        }

        setIsSubmitting(false);
    };

    const goToLogin = () => {
        getRouter().navigateTo('/login');
    };

    return (
        <div class="signup-block">
            <h1>Регистрация</h1>

            {formError && <div class="form-error">{formError}</div>}

            <form id="signup" class="signup-form" onSubmit={onSubmit}>

                {/* Телефон */}
                <div class="input-group">
                    <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        class={`signup-input ${errors.phone_number ? 'error' : ''}`}
                        placeholder="Введите номер телефона"
                        autocomplete="tel"
                        onInput={telValidate}
                        onChange={changeInput}
                    />
                    <div class="error-message">{errors.phone_number}</div>
                </div>

                {/* Имя */}
                <div class="input-group">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        class={`signup-input ${errors.name ? 'error' : ''}`}
                        placeholder="Введите имя"
                        autocomplete="name"
                        onChange={changeInput}
                    />
                    <div class="error-message">{errors.name}</div>
                </div>

                {/* Пароль */}
                <div class="input-group">
                    <div class="signup-password-input">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            autocomplete="new-password"
                            class={`signup-input ${errors.password ? 'error' : ''}`}
                            placeholder="Введите пароль"
                            ref={passwordRef}
                            onChange={changeInput}
                        />

                        <button type="button" class="toggle-password" onClick={togglePassword}>
                            {showPassword ? <i class="eyeHidden-icon"></i> : <i class="eye-icon"></i>}
                        </button>
                    </div>
                    <div class="error-message">{errors.password}</div>
                </div>

                {/* Кнопка */}
                <button type="submit" class="signup-button">
                    {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>

            <div class="link-to-login-block">
                <span>Уже есть аккаунт?</span>
                <a class="link-to-login" onClick={goToLogin}>Вход</a>
            </div>
        </div>
    );
};

export default Signup;
