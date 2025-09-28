import { sendPOSTRequest } from "./server";

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