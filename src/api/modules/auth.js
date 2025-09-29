import { sendPOSTRequest } from "./server";

/**
 * Регистрирует нового пользователя в системе
 * @param {Object} userForm - Данные пользователя для регистрации
 * @param {string} userForm.email - Email пользователя
 * @param {string} userForm.name - Имя пользователя
 * @param {string} userForm.password - Пароль пользователя
 * @param {string} userForm.phone_number - Номер телефона пользователя
 * @param {string} userForm.username - Имя пользователя (логин)
 * @returns {Promise<void>}
 * @throws {Error} Ошибка регистрации с дополнительными данными об ошибках
 */
export async function signUpUser(userForm) {
    try {
        const response = await sendPOSTRequest("/register", {
            email: userForm.email,
            name: userForm.name,
            password: userForm.password,
            phone_number: userForm.phone_number,
            username: userForm.username,
        });

        if (!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.message || 'Ошибка регистрации');
            error.errors = errorData.errors; 
            throw error;
        }
    } catch (err) {
        throw err;
    }
}

/**
 * Выполняет авторизацию пользователя в системе
 * @param {Object} userForm - Данные пользователя для входа
 * @param {string} userForm.password - Пароль пользователя
 * @param {string} userForm.phone_number - Номер телефона пользователя
 * @returns {Promise<void>}
 * @throws {Error} Ошибка авторизации с дополнительными данными об ошибках
 */
export async function loginUser(userForm) {
    try {
        const response = await sendPOSTRequest("/login", {
            password: userForm.password,
            phone_number: userForm.phone_number,
        });
        if (!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.message || 'Ошибка авторизации');
            error.errors = errorData.errors; 
            throw error;
        }
    } catch (err) {
        throw err;
    }
}

/**
 * Выполняет выход пользователя из системы
 * @returns {Promise<Object>} Результат операции выхода
 * @throws {Error} Ошибка выхода с дополнительными данными об ошибках
 */
export async function logoutUser() {
    try {
        const response = await sendPOSTRequest("/logout", {});  // ← Используйте sendPOSTRequest
        
        if (!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.message || 'Ошибка выхода');
            error.errors = errorData.errors; 
            throw error;
        }

        return { success: true, message: 'Logout successful' };
    } catch (err) {
        throw err;
    }
}
