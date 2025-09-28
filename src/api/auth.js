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
        console.log(err.name)
        throw err;
    }
}