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
function initializeApp() {
    try {
        // Создаем движок симуляции
        simulationEngine = new SimulationEngine();

        // Создаем визуализатор
        visualizer = new Visualizer('canvas-container');

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
 * Показать приветственное сообщение
 */
function showWelcomeMessage() {
    const canvas = visualizer.app.view;
    const ctx = canvas.getContext('2d');

    // Создаем текстовый элемент с инструкциями
    const welcomeText = new PIXI.Text(
        'Добро пожаловать в симуляцию очереди к врачу!\n\n' +
        'Настройте параметры слева и нажмите "Старт"\n' +
        'для начала симуляции.',
        {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0x2c3e50,
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 400
        }
    );

    welcomeText.x = visualizer.app.screen.width / 2 - welcomeText.width / 2;
    welcomeText.y = visualizer.app.screen.height / 2 - welcomeText.height / 2;

    visualizer.app.stage.addChild(welcomeText);

    // Удаляем сообщение при первом запуске
    const originalStart = uiController.handleStart.bind(uiController);
    uiController.handleStart = function() {
        visualizer.app.stage.removeChild(welcomeText);
        uiController.handleStart = originalStart;
        originalStart();
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

    // Проверяем доступность PIXI
    if (typeof PIXI === 'undefined') {
        showError('Библиотека PixiJS не загружена. Проверьте подключение к интернету.');
        return;
    }

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
