const SERVER_API = `${location.origin}/api/v1`;

export async function sendPOSTRequest(path, data) {
    try {
        const response = await fetch(SERVER_API + path, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            // Пытаемся получить JSON с ошибкой, если сервер его возвращает
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `HTTP error ${response.status}` };
            }
            
            const error = new Error(errorData.message || 'Request failed');
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        return response;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Нет соединения с сервером');
        }
        throw error;
    }
}