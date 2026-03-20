/**
 * Класс UIController - управление пользовательским интерфейсом
 */
class UIController {
    constructor(simulationEngine, visualizer) {
        this.engine = simulationEngine;
        this.visualizer = visualizer;

        // Элементы управления параметрами
        this.arrivalRateInput = document.getElementById('arrivalRate');
        this.serviceTimeInput = document.getElementById('serviceTime');
        this.numDoctorsInput = document.getElementById('numDoctors');
        this.queueCapacityInput = document.getElementById('queueCapacity');
        this.timeScaleInput = document.getElementById('timeScale');

        // Кнопки управления
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stepBtn = document.getElementById('stepBtn');
        this.resetBtn = document.getElementById('resetBtn');

        // Элементы метрик
        this.avgWaitTimeEl = document.getElementById('avgWaitTime');
        this.p95WaitTimeEl = document.getElementById('p95WaitTime');
        this.throughputEl = document.getElementById('throughput');
        this.doctorUtilizationEl = document.getElementById('doctorUtilization');
        this.currentQueueLengthEl = document.getElementById('currentQueueLength');
        this.maxQueueLengthEl = document.getElementById('maxQueueLength');
        this.servedPatientsEl = document.getElementById('servedPatients');
        this.rejectedPatientsEl = document.getElementById('rejectedPatients');
        this.simulationTimeEl = document.getElementById('simulationTime');

        this.timeScale = 10; // секунд реального времени = 1 час симуляции
        this.animationFrameId = null;

        this.initializeEventListeners();
        this.updateValueDisplays();
    }

    /**
     * Инициализировать обработчики событий
     */
    initializeEventListeners() {
        // Обработчики изменения параметров
        this.arrivalRateInput.addEventListener('input', () => {
            this.updateValueDisplays();
            if (this.engine.isRunning) {
                this.engine.updateParams({
                    arrivalRate: parseFloat(this.arrivalRateInput.value)
                });
            }
        });

        this.serviceTimeInput.addEventListener('input', () => {
            this.updateValueDisplays();
            if (this.engine.isRunning) {
                this.engine.updateParams({
                    serviceTime: parseFloat(this.serviceTimeInput.value)
                });
            }
        });

        this.numDoctorsInput.addEventListener('input', () => {
            this.updateValueDisplays();
            if (this.engine.isRunning) {
                this.engine.updateParams({
                    numDoctors: parseInt(this.numDoctorsInput.value)
                });
            }
        });

        this.queueCapacityInput.addEventListener('input', () => {
            this.updateValueDisplays();
            if (this.engine.isRunning) {
                this.engine.updateParams({
                    queueCapacity: parseInt(this.queueCapacityInput.value)
                });
            }
        });

        this.timeScaleInput.addEventListener('input', () => {
            this.timeScale = parseInt(this.timeScaleInput.value);
            this.updateValueDisplays();
        });

        // Обработчики кнопок
        this.startBtn.addEventListener('click', () => this.handleStart());
        this.pauseBtn.addEventListener('click', () => this.handlePause());
        this.stepBtn.addEventListener('click', () => this.handleStep());
        this.resetBtn.addEventListener('click', () => this.handleReset());

        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.visualizer.resize();
        });
    }

    /**
     * Обновить отображение значений параметров
     */
    updateValueDisplays() {
        const displays = document.querySelectorAll('.parameter .value-display');
        displays[0].textContent = this.arrivalRateInput.value;
        displays[1].textContent = this.serviceTimeInput.value;
        displays[2].textContent = this.numDoctorsInput.value;
        displays[3].textContent = this.queueCapacityInput.value;

        const timeScaleDisplay = document.querySelector('.speed-control .value-display');
        timeScaleDisplay.textContent = `${this.timeScale} сек`;
    }

    /**
     * Обработать нажатие кнопки "Старт"
     */
    handleStart() {
        if (!this.engine.isRunning) {
            // Инициализируем симуляцию с текущими параметрами
            const params = {
                arrivalRate: parseFloat(this.arrivalRateInput.value),
                serviceTime: parseFloat(this.serviceTimeInput.value),
                numDoctors: parseInt(this.numDoctorsInput.value),
                queueCapacity: parseInt(this.queueCapacityInput.value)
            };

            this.engine.initialize(params);
            this.engine.onUpdate = (state) => this.updateUI(state);
            this.engine.start();

            // Отображаем врачей сразу после старта
            const initialState = this.engine.getState();
            this.visualizer.update(initialState);

            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.stepBtn.disabled = false;
            this.pauseBtn.textContent = 'Пауза';

            this._lastFrameTime = performance.now();
            this.runSimulation();
        } else if (this.engine.isPaused) {
            // Продолжаем симуляцию
            this.engine.resume();
            this.pauseBtn.textContent = 'Пауза';
            this._lastFrameTime = performance.now();
            this.runSimulation();
        }
    }

    /**
     * Обработать нажатие кнопки "Пауза"
     */
    handlePause() {
        if (this.engine.isRunning && !this.engine.isPaused) {
            this.engine.pause();
            this.pauseBtn.textContent = 'Продолжить';

            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        } else if (this.engine.isPaused) {
            this.handleStart();
        }
    }

    /**
     * Обработать нажатие кнопки "Шаг"
     */
    handleStep() {
        if (!this.engine.isRunning) {
            const params = {
                arrivalRate: parseFloat(this.arrivalRateInput.value),
                serviceTime: parseFloat(this.serviceTimeInput.value),
                numDoctors: parseInt(this.numDoctorsInput.value),
                queueCapacity: parseInt(this.queueCapacityInput.value)
            };

            this.engine.initialize(params);
            this.engine.onUpdate = (state) => this.updateUI(state);
            this.engine.start();
            this.engine.pause();

            const initialState = this.engine.getState();
            this.visualizer.update(initialState);

            this.startBtn.disabled = false;
            this.pauseBtn.disabled = false;
            this.stepBtn.disabled = false;
            this.pauseBtn.textContent = 'Продолжить';
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (!this.engine.step()) {
            this.handleStop();
            return;
        }

        this.engine.pause();
        this.pauseBtn.textContent = 'Продолжить';
    }

    /**
     * Обработать нажатие кнопки "Сброс"
     */
    handleReset() {
        // Останавливаем симуляцию
        this.engine.stop();

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Сбрасываем движок
        this.engine.reset();

        // Обновляем UI
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stepBtn.disabled = false;
        this.pauseBtn.textContent = 'Пауза';

        // Очищаем метрики
        this.updateMetrics({
            avgWaitTime: 0,
            p95WaitTime: 0,
            throughput: 0,
            doctorUtilization: 0,
            servedPatients: 0,
            rejectedPatients: 0,
            currentQueueLength: 0,
            maxQueueLength: 0,
            simulationTime: 0
        });

        // Обновляем визуализацию
        this.visualizer.update({
            queue: new Queue(parseInt(this.queueCapacityInput.value)),
            doctors: []
        });
    }

    /**
     * Запустить цикл симуляции
     *
     * Логика скорости:
     *   timeScale = сколько секунд реального времени соответствует 1 часу симуляции.
     *   При timeScale=1: 1 час симуляции = 1 сек реального времени → быстро.
     *   При timeScale=5: 1 час симуляции = 5 сек реального времени → медленнее.
     *
     *   Используем performance.now() для точного отслеживания реального времени.
     *   За прошедшее реальное время dt (в секундах) продвигаем симуляцию на:
     *   dt / timeScale * 60 минут симуляции.
     *
     *   Выполняем все события до targetTime, затем продвигаем currentTime до targetTime.
     */
    runSimulation() {
        if (!this.engine.isRunning || this.engine.isPaused) {
            return;
        }

        const now = performance.now();
        const dtReal = (now - this._lastFrameTime) / 1000; // секунды реального времени
        this._lastFrameTime = now;

        // Минут симуляции за прошедший кадр
        const simMinutesPerFrame = (dtReal / this.timeScale) * 60;
        const targetTime = this.engine.currentTime + simMinutesPerFrame;

        // Выполняем события до targetTime, но останавливаемся после ARRIVAL или SERVICE_END
        // чтобы визуализация успела показать промежуточное состояние (пациент на улице,
        // врач свободен) перед следующим событием
        while (true) {
            const nextEvent = this.engine.eventQueue.peek();
            if (!nextEvent || nextEvent.time > targetTime) {
                break;
            }
            const eventType = nextEvent.type;
            if (!this.engine.step()) {
                this.handleStop();
                return;
            }
            // После ARRIVAL (пациент на улице) или SERVICE_END (врач освободился)
            // прерываем цикл — следующий кадр покажет промежуточное состояние
            if (eventType === EventType.ARRIVAL || eventType === EventType.SERVICE_END) {
                break;
            }
        }

        // Продвигаем currentTime до targetTime, даже если событий не было
        if (this.engine.currentTime < targetTime) {
            this.engine.currentTime = targetTime;
        }

        this.animationFrameId = requestAnimationFrame(() => this.runSimulation());
    }

    /**
     * Обработать остановку симуляции
     */
    handleStop() {
        this.engine.stop();
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stepBtn.disabled = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Обновить UI с новым состоянием
     */
    updateUI(state) {
        // Обновляем визуализацию
        this.visualizer.update(state);

        // Обновляем метрики
        this.updateMetrics(state.statistics);
    }

    /**
     * Обновить отображение метрик
     */
    updateMetrics(stats) {
        this.avgWaitTimeEl.textContent = stats.avgWaitTime.toFixed(2);
        this.p95WaitTimeEl.textContent = stats.p95WaitTime.toFixed(2);
        this.throughputEl.textContent = stats.throughput.toFixed(2);
        this.doctorUtilizationEl.textContent = stats.doctorUtilization.toFixed(1);
        this.currentQueueLengthEl.textContent = stats.currentQueueLength;
        this.maxQueueLengthEl.textContent = stats.maxQueueLength;
        this.servedPatientsEl.textContent = stats.servedPatients;
        this.rejectedPatientsEl.textContent = stats.rejectedPatients;
        this.simulationTimeEl.textContent = (stats.simulationTime / 60).toFixed(2);
    }
}
