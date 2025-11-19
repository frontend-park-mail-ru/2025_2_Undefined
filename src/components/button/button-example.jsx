import React, { useState, useEffect, useRef } from 'minireact';
import { Button } from './button.jsx';
import './button.css';

export function ButtonExample() {
    const [activeTab, setActiveTab] = useState('all');
    const [loadingStates, setLoadingStates] = useState({});

    const simulateLoading = (buttonId) => {
        setLoadingStates((prev) => ({ ...prev, [buttonId]: true }));
        setTimeout(() => {
            setLoadingStates((prev) => ({ ...prev, [buttonId]: false }));
        }, 2000);
    };

    const buttonSections = {
        all: (
            <div>
                {/* Базовые кнопки */}
                <Section title="Базовые кнопки">
                    <Button>Обычная кнопка</Button>
                    <Button variant="primary">Основная кнопка</Button>
                    <Button variant="secondary">Вторичная кнопка</Button>
                </Section>

                {/* Размеры */}
                <Section title="Размеры кнопок">
                    <Button size="xs" icon="edit">
                        XS
                    </Button>
                    <Button size="sm" icon="edit">
                        SM
                    </Button>
                    <Button size="md" icon="edit">
                        MD
                    </Button>
                    <Button size="lg" icon="edit">
                        LG
                    </Button>
                    <Button size="xl" icon="edit">
                        XL
                    </Button>
                </Section>

                {/* Круглые кнопки */}
                <Section title="Круглые кнопки (только иконки)">
                    <Button icon="menu" iconOnly size="xs" />
                    <Button icon="menu" iconOnly size="sm" />
                    <Button icon="menu" iconOnly size="md" />
                    <Button icon="menu" iconOnly size="lg" />
                    <Button icon="menu" iconOnly size="xl" />
                </Section>

                {/* Состояния */}
                <Section title="Состояния кнопок">
                    <Button disabled>Неактивная</Button>
                    <Button variant="secondary" disabled>
                        Неактивная вторичная
                    </Button>
                    <Button loading>Загрузка...</Button>
                    <Button icon="search" loading>
                        Поиск...
                    </Button>
                </Section>

                {/* Иконки */}
                <Section title="Кнопки с иконками">
                    <Button icon="edit">Редактировать</Button>
                    <Button icon="search" iconPosition="right">
                        Поиск
                    </Button>
                    <Button icon="userAdd">Добавить контакт</Button>
                    <Button icon="delete" variant="secondary">
                        Удалить
                    </Button>
                </Section>
            </div>
        ),

        sizes: (
            <div>
                <Section title="Текстовые кнопки">
                    <Button size="xs">Кнопка XS</Button>
                    <Button size="sm">Кнопка SM</Button>
                    <Button size="md">Кнопка MD</Button>
                    <Button size="lg">Кнопка LG</Button>
                    <Button size="xl">Кнопка XL</Button>
                </Section>

                <Section title="Круглые кнопки">
                    <Button icon="menu" iconOnly size="xs" />
                    <Button icon="menu" iconOnly size="sm" />
                    <Button icon="menu" iconOnly size="md" />
                    <Button icon="menu" iconOnly size="lg" />
                    <Button icon="menu" iconOnly size="xl" />
                </Section>

                <Section title="С иконками">
                    <Button size="xs" icon="edit">
                        XS с иконкой
                    </Button>
                    <Button size="sm" icon="edit">
                        SM с иконкой
                    </Button>
                    <Button size="md" icon="edit">
                        MD с иконкой
                    </Button>
                    <Button size="lg" icon="edit">
                        LG с иконкой
                    </Button>
                    <Button size="xl" icon="edit">
                        XL с иконкой
                    </Button>
                </Section>
            </div>
        ),

        states: (
            <div>
                <Section title="Disabled состояния">
                    <Button disabled>Обычная disabled</Button>
                    <Button variant="primary" disabled>
                        Primary disabled
                    </Button>
                    <Button variant="secondary" disabled>
                        Secondary disabled
                    </Button>
                    <Button icon="edit" disabled>
                        С иконкой disabled
                    </Button>
                </Section>

                <Section title="Loading состояния">
                    <Button loading>Загрузка...</Button>
                    <Button variant="primary" loading>
                        Primary загрузка
                    </Button>
                    <Button variant="secondary" loading>
                        Secondary загрузка
                    </Button>
                    <Button icon="search" loading>
                        Поиск...
                    </Button>
                </Section>

                <Section title="Интерактивные состояния">
                    <Button
                        loading={loadingStates['btn1']}
                        onClick={() => simulateLoading('btn1')}
                    >
                        {loadingStates['btn1'] ? 'Загрузка...' : 'Нажми меня'}
                    </Button>

                    <Button
                        variant="primary"
                        loading={loadingStates['btn2']}
                        onClick={() => simulateLoading('btn2')}
                    >
                        {loadingStates['btn2'] ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </Section>
            </div>
        ),

        icons: (
            <div>
                <Section title="Основные иконки">
                    <Button icon="edit">Редактировать</Button>
                    <Button icon="delete">Удалить</Button>
                    <Button icon="search">Поиск</Button>
                    <Button icon="close">Закрыть</Button>
                    <Button icon="menu">Меню</Button>
                </Section>

                <Section title="Социальные иконки">
                    <Button icon="userAdd">Добавить пользователя</Button>
                    <Button icon="user">Пользователь</Button>
                    <Button icon="group">Группа</Button>
                    <Button icon="channel">Канал</Button>
                </Section>

                <Section title="Навигационные иконки">
                    <Button icon="leftArrow">Назад</Button>
                    <Button icon="rightArrow">Вперед</Button>
                    <Button icon="exit">Выйти</Button>
                </Section>

                <Section title="Размеры иконок">
                    <Button icon="edit" iconSize="xs">
                        XS иконка
                    </Button>
                    <Button icon="edit" iconSize="sm">
                        SM иконка
                    </Button>
                    <Button icon="edit" iconSize="md">
                        MD иконка
                    </Button>
                    <Button icon="edit" iconSize="lg">
                        LG иконка
                    </Button>
                    <Button icon="edit" iconSize="xl">
                        XL иконка
                    </Button>
                </Section>

                <Section title="Позиции иконок">
                    <Button icon="exit" iconPosition="left">
                        Выйти (слева)
                    </Button>
                    <Button icon="exit" iconPosition="right">
                        Выйти (справа)
                    </Button>
                    <Button icon="search" iconPosition="left">
                        Поиск (слева)
                    </Button>
                    <Button icon="search" iconPosition="right">
                        Поиск (справа)
                    </Button>
                </Section>
            </div>
        ),

        practical: (
            <div>
                <Section title="Интерфейс мессенджера">
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                        }}
                    >
                        <Button icon="menu" iconOnly />
                        <Button icon="edit" iconOnly />
                        <Button icon="userAdd" iconOnly />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '16px',
                        }}
                    >
                        <Button
                            variant={
                                activeTab === 'chats' ? 'primary' : 'secondary'
                            }
                            size="sm"
                            onClick={() => setActiveTab('chats')}
                        >
                            Чаты
                        </Button>
                        <Button
                            variant={
                                activeTab === 'contacts'
                                    ? 'primary'
                                    : 'secondary'
                            }
                            size="sm"
                            onClick={() => setActiveTab('contacts')}
                        >
                            Контакты
                        </Button>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '16px',
                        }}
                    >
                        <Button icon="phone" iconOnly variant="secondary" />
                        <Button icon="info" iconOnly variant="secondary" />
                        <Button icon="meatballs" iconOnly variant="secondary" />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            marginTop: '16px',
                            alignItems: 'center',
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Введите сообщение..."
                            style={{
                                padding: '10px',
                                border: '1px solid #384d6a',
                                borderRadius: '20px',
                                background: 'transparent',
                                color: 'white',
                                flex: 1,
                            }}
                        />
                        <Button icon="post" iconOnly type="submit" />
                    </div>
                </Section>

                <Section title="Действия профиля">
                    <Button icon="edit" variant="primary">
                        Редактировать профиль
                    </Button>

                    <Button icon="exit" variant="secondary">
                        Выйти из аккаунта
                    </Button>
                </Section>
            </div>
        ),
    };

    return (
        <div
            style={{
                padding: '20px',
                background: '#1a1f2e',
                minHeight: '100vh',
                color: 'white',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>
                Компонент Button - Демонстрация
            </h1>

            {/* Навигация по примерам */}
            <div
                style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '30px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                <Button
                    variant={activeTab === 'all' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveTab('all')}
                >
                    Все примеры
                </Button>
                <Button
                    variant={activeTab === 'sizes' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveTab('sizes')}
                >
                    Размеры
                </Button>
                <Button
                    variant={activeTab === 'states' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveTab('states')}
                >
                    Состояния
                </Button>
                <Button
                    variant={activeTab === 'icons' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveTab('icons')}
                >
                    Иконки
                </Button>
                <Button
                    variant={
                        activeTab === 'practical' ? 'primary' : 'secondary'
                    }
                    size="sm"
                    onClick={() => setActiveTab('practical')}
                >
                    Практические примеры
                </Button>
            </div>

            {/* Контент примеров */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {buttonSections[activeTab]}
            </div>
        </div>
    );
}

// Компонент секции для группировки
function Section({ title, children }) {
    return (
        <div
            style={{
                marginBottom: '40px',
                padding: '20px',
                background: '#2a3038',
                borderRadius: '8px',
            }}
        >
            <h3
                style={{
                    marginBottom: '20px',
                    color: '#e2e8f0',
                    borderBottom: '1px solid #384d6a',
                    paddingBottom: '10px',
                }}
            >
                {title}
            </h3>
            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                {children}
            </div>
        </div>
    );
}

export default ButtonExample;
