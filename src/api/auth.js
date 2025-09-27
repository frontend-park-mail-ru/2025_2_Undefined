import { sendPOSTRequest } from "./server";

export async function signUpUser(userForm) {
    try {
        const response = await sendPOSTRequest("/register", {
            name: userForm.name,
            username: userForm.username,
            phone_number: userForm.phone_number,
            email: userForm.email,
            password: userForm.password
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // Создаем объект ошибки с дополнительной информацией
            const error = new Error(errorData.message || 'Ошибка регистрации');
            error.status = response.status;
            error.errors = errorData.errors; // Ожидаем, что сервер возвращает errors объект
            
            throw error;
        }

        return await response.json();
        
    } catch (err) {
        // Пробрасываем ошибку дальше для обработки в компоненте
        throw err;
    }
}