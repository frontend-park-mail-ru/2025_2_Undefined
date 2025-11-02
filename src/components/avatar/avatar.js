/**
 * Получает первую букву из имени чата для placeholder
 * @param {string} name - Название чата
 * @returns {string} Первая буква в верхнем регистре или заглушка
 */
function getPlaceholder(name) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return '?';
    }

    const trimmedName = name.trim();
    const firstChar = trimmedName.charAt(0).toUpperCase();

    // Проверяем, является ли символ буквой (кириллица или латиница)
    if (/[a-zA-Zа-яА-Я]/.test(firstChar)) {
        return firstChar;
    } else {
        return '?';
    }
}

export { getPlaceholder };
