/**
 * Главный файл приложения - инициализация и запуск симуляции
 */

// Глобальные переменные
let simulationEngine;
let visualizer;
let uiController;

/**
 * Инициализация приложения
 */
async function initializeApp() {
    try {
        // Создаем движок симуляции
        simulationEngine = new SimulationEngine();

        // Создаем визуализатор и инициализируем его асинхронно
        visualizer = new Visualizer('canvas-container');
        await visualizer.initialize();

        // Создаем контроллер UI
        uiController = new UIController(simulationEngine, visualizer);

        console.log('Приложение успешно инициализировано');

        // Показываем начальное состояние
        showWelcomeMessage();

    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        showError('Не удалось инициализировать приложение. Проверьте консоль для деталей.');
    }
}

/**
 * Показать приветственное сообщение (рисуется внутри Visualizer)
 * Скрывается при первом нажатии «Старт»
 */
function showWelcomeMessage() {
    // Скрываем приветствие при первом «Старт» или первом «Шаг»
    const hideOnce = () => {
        visualizer.hideWelcome();
        uiController.handleStart = originalStart;
        uiController.handleStep = originalStep;
    };

    const originalStart = uiController.handleStart.bind(uiController);
    const originalStep = uiController.handleStep.bind(uiController);

    uiController.handleStart = function() {
        hideOnce();
        originalStart();
    };

    uiController.handleStep = function() {
        hideOnce();
        originalStep();
    };
}

/**
 * Показать сообщение об ошибке
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #e74c3c;
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 16px;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}

/**
 * Обработчик загрузки страницы
 */
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализация приложения...');

    // Инициализируем приложение
    initializeApp();
});

/**
 * Обработчик выгрузки страницы
 */
window.addEventListener('beforeunload', () => {
    if (visualizer) {
        visualizer.destroy();
    }
});

/**
 * Обработчик ошибок
 */
window.addEventListener('error', (event) => {
    console.error('Глобальная ошибка:', event.error);
    showError('Произошла ошибка. Проверьте консоль для деталей.');
});
