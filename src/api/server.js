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
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `HTTP error ${response.status}` };
            }
            const error = new Error(errorData.message || 'Ошибка');
            error.errors = errorData.errors; 

            throw error;
        }

        return response;
    } catch (error) {
        throw error;
    }
}
