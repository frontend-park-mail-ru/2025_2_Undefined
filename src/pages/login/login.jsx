import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const passwordRef = useRef(null);

    const togglePassword = () => {
        const input = passwordRef.current;
        if (!input) return;

        const newType = input.type === 'password' ? 'text' : 'password';
        input.type = newType;
        setShowPassword(newType === 'text');
    };

    return (
        <div className="login-block">
            <h1>Вход</h1>

            <form id="login" action="" className="login-form">
                <div className="input-group">
                    <input
                        type="text"
                        name="phone_number"
                        id="tel"
                        className="login-input"
                        placeholder="Введите номер телефона"
                    />
                    <div className="error-message" data-field="phone_number"></div>
                </div>

                <div className="input-group">
                    <div className="login-password-input">
                        <input
                            type="password"
                            name="password"
                            id="passwordInput"
                            ref={passwordRef}
                            className="login-input"
                            placeholder="Введите пароль"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            id="togglePassword"
                            onClick={togglePassword}
                        >
                            {showPassword ? (
                                <i className="eyeHidden-icon"></i>
                            ) : (
                                <i className="eye-icon"></i>
                            )}
                        </button>
                    </div>

                    <div className="error-message" data-field="password"></div>
                </div>

                <button type="submit" className="login-button">
                    Войти
                </button>
            </form>

            <div className="link-to-signup-block">
                <span>Еще нет аккаунта?</span>
                <a id="linkToSignup" className="link-to-signup">
                    Регистрация
                </a>
            </div>
        </div>
    );
};

ReactDOM.render(<Login />, document.getElementById('root'));
