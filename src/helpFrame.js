document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('supportButton');
    const windowElement = document.getElementById('supportWindow');
    const iframe = document.getElementById('supportIframe');

    if (button && windowElement) {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            if (windowElement.style.display === 'block') {
                windowElement.style.display = 'none';
            } else {
                windowElement.style.display = 'block';
                // Опционально: обновляем iframe при каждом открытии
                // iframe.src = iframe.src;
            }
        });

        // Закрытие по клику вне окна
        document.addEventListener('click', function (e) {
            if (!windowElement.contains(e.target) && e.target !== button) {
                windowElement.style.display = 'none';
            }
        });

        // Предотвращаем закрытие при клике внутри окна
        windowElement.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }
});
