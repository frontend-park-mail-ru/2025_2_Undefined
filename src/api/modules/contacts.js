import { SERVER_API } from '../config';
import { sendPOSTRequest } from './server';

export async function addContact (number) {
    try {
        const data = await getUserByNumber(number);
        const response = await sendPOSTRequest('/contacts', {
            contact_id: data.id
        })
        
        if(!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.message || 'Ошибка добавления в контакты');
            error.errors = errorData.errors;
            error.statusCode = response.status;
            throw error;
        }

    } catch(err) {
        throw err;
    }
}

export async function getUserByNumber (number) {
    try {
        number = '+' + number.replace(/\D/g, '');
        const response = await sendPOSTRequest('/user/by-phone', {
            phone_number: number,
        })

        if(!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.message || 'Ошибка получения данных пользователя');
            error.errors = errorData.errors;
            error.statusCode = response.status;
            throw error;
        }
        const data = await response.json(); 
        if (!data || !data.id) {
            throw new Error('Пользователь не найден');
        }
        return data;
    } catch(err) {
        throw err;
    }
}

export async function getContacts() {
    try {
        const response = await fetch(SERVER_API + '/contacts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if(!response.ok) {
            const errorData = await response.json();
            const error = new Error(errorData.message || 'Ошибка получения контактов');
            error.errors = errorData.errors;
            error.statusCode = response.status;
            throw error;
        }
        const data = await response.json(); 
        return data;
    } catch(err) {
        throw err;
    } 

}