import helpForm from './components/helpForm.hbs';
import appealList from './components/appealList.hbs';
import { appealsApi } from './api/appeals';

const app = {
    user: null,
    isAuth: false,
};

async function fetchUser() {
    try {
        const response = await fetch('/api/v1/me', {
            credentials: 'include',
        });
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const userData = await response.json();
                app.user = userData;
                app.isAuth = true;
                return true;
            } else {
                console.error('Unexpected response format:', contentType);
            }
        }
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
    }
    
    app.user = null;
    app.isAuth = false;
    return false;
}

document.addEventListener('DOMContentLoaded', async () => { 
    await fetchUser();

    const container = document.getElementById('helpContainer');
    if (!container) return;

    const loadAppeals = async () => {
        try {
            if (app.isAuth) {
                const appeals = await appealsApi.list();
                            const categoryMap = {
                'bug': 'Баг',
                'feature': 'Предложение', 
                'claim': 'Продуктовая жалоба',
                'other': 'Другое'
            };
            
            // Преобразуем категории в русские названия
            const appealsWithRussianCategories = appeals.map(appeal => ({
                ...appeal,
                category: categoryMap[appeal.category] || appeal.category // если категория не найдена, оставляем как есть
            }));
            
            return { appeals: appealsWithRussianCategories };
            } else {
                return { 
                    appeals: [],
                    message: 'Для просмотра обращений необходимо авторизоваться'
                };
            }
        } catch (error) {
            console.error('Ошибка при загрузке обращений:', error);
            return { 
                appeals: [],
                error: 'Не удалось загрузить обращения'
            };
        }
    };

    const renderList = async () => {
        const appealsData = await loadAppeals();
        container.innerHTML = appealList(appealsData);
    };

    const renderForm = () => {
        container.innerHTML = helpForm();
    };

    container.addEventListener('click', (e) => {
        if (e.target.id === 'goBackBtn') {
            e.preventDefault();
            renderList();
            return;
        }

        if (e.target.id === 'createAppeal') {
            e.preventDefault();
            if (!app.isAuth) {
                alert('Для создания обращения необходимо авторизоваться');
                return;
            }
            renderForm();
            return;
        }
    });

    container.addEventListener('submit', async (e) => { 
        if (e.target.tagName === 'FORM') {
            e.preventDefault();
            
            if (!app.isAuth) {
                alert('Необходима авторизация');
                return;
            }

            const data = Object.fromEntries(new FormData(e.target));
            const appealData = {
                category: data.selectProblem,
                title: data.problemTitle,
            }
            
            console.log('📤 Данные обращения:', appealData);

            try {
                const appealResponse = await appealsApi.create(appealData);
                console.log('✅ Ответ от создания обращения:', appealResponse);
                
                const appealId = appealResponse.id || appealResponse.appeal_id || appealResponse.appealId;
                
                if (!appealId) {
                    console.error('Не удалось получить ID обращения:', appealResponse);
                    throw new Error('Не удалось получить ID созданного обращения');
                }

                console.log('📝 ID обращения:', appealId);

                if (data.problemDescription) {
                    const messageData = {
                        appeal_id: appealId,
                        text: data.problemDescription,
                    }
                    console.log('📤 Данные сообщения:', messageData);
                    await appealsApi.addMessage(messageData); 
                    console.log('✅ Сообщение добавлено');
                }

                await renderList();
                
            } catch (error) {
                console.error('❌ Ошибка при создании обращения:', error);
                alert(`Ошибка: ${error.message}`);
            }
        }
    });

    await renderList();
});