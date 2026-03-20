/**
 * Класс SimulationEngine - основной движок дискретно-событийной симуляции
 */
class SimulationEngine {
    constructor() {
        this.eventQueue = new EventQueue();
        this.queue = null;
        this.doctors = [];
        this.statistics = new Statistics();

        // Параметры симуляции
        this.params = {
            arrivalRate: 10,      // пациентов/час
            serviceTime: 15,      // минут (среднее)
            numDoctors: 2,
            queueCapacity: 10
        };

        // Состояние симуляции
        this.currentTime = 0;
        this.isRunning = false;
        this.isPaused = false;

        // Пациент, стоящий на улице (ожидает решения о входе)
        this.streetPatient = null;

        // Callback для обновления визуализации
        this.onUpdate = null;
    }

    /**
     * Инициализировать симуляцию с параметрами
     */
    initialize(params) {
        this.params = { ...this.params, ...params };
        this.reset();

        // Создаем очередь
        this.queue = new Queue(this.params.queueCapacity);

        // Создаем врачей
        this.doctors = [];
        for (let i = 0; i < this.params.numDoctors; i++) {
            this.doctors.push(new Doctor(i + 1));
        }

        // Планируем первый приход пациента
        this.scheduleNextArrival();
    }

    /**
     * Сбросить симуляцию
     */
    reset() {
        this.eventQueue.clear();
        this.currentTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.streetPatient = null;
        this.statistics.reset();
        Patient.nextId = 1;

        if (this.queue) {
            this.queue.clear();
        }

        for (const doctor of this.doctors) {
            doctor.reset();
        }
    }

    /**
     * Запланировать следующий приход пациента (Пуассоновское распределение)
     */
    scheduleNextArrival() {
        // Интервал между приходами следует экспоненциальному распределению
        const lambda = this.params.arrivalRate / 60; // переводим в пациентов/минуту
        const interArrivalTime = -Math.log(1 - Math.random()) / lambda;

        const arrivalTime = this.currentTime + interArrivalTime;
        this.eventQueue.schedule(arrivalTime, EventType.ARRIVAL);
    }

    /**
     * Сгенерировать время обслуживания (экспоненциальное распределение)
     */
    generateServiceTime() {
        const mean = this.params.serviceTime;
        return -mean * Math.log(1 - Math.random());
    }

    /**
     * Шаг 1: пациент появляется на улице.
     * Планируем следующий приход и событие ENTER (вход в клинику).
     * Задержка перед входом — чтобы визуализация успела показать пациента на улице.
     */
    handleArrival() {
        const patient = new Patient(this.currentTime);
        this.streetPatient = patient;

        // Планируем вход пациента через небольшую задержку (1 мин симуляции)
        // чтобы визуализация успела показать пациента на улице
        this.eventQueue.schedule(this.currentTime + 1, EventType.ENTER, { patient });

        // Планируем следующий приход
        this.scheduleNextArrival();
    }

    /**
     * Шаг 2: пациент с улицы принимает решение о входе.
     * Логика:
     *   - Если все врачи заняты И очередь пуста → встаёт первым в очередь
     *   - Если есть свободный врач → идёт к врачу
     *   - Если врачи заняты, очередь не пуста и есть место → встаёт в очередь
     *   - Если очередь полна → уходит (отказ)
     */
    handleEnter(event) {
        const { patient } = event.data;
        this.streetPatient = null;

        const availableDoctor = this.doctors.find(d => d.isAvailable());

        if (availableDoctor) {
            // Свободный врач есть — идёт сразу к нему
            this.startService(patient, availableDoctor);
        } else if (this.queue.isEmpty()) {
            // Врачи заняты, очередь пуста — встаёт первым в очередь
            this.queue.enqueue(patient);
        } else if (!this.queue.isFull()) {
            // Врачи заняты, очередь не пуста, есть место
            this.queue.enqueue(patient);
        } else {
            // Очередь полна — уходит
            this.statistics.addRejection();
        }
    }

    /**
     * Начать обслуживание пациента
     */
    startService(patient, doctor) {
        const serviceTime = this.generateServiceTime();

        patient.startService(this.currentTime, doctor.id, serviceTime);
        doctor.startService(patient, this.currentTime);

        // Планируем окончание обслуживания
        this.eventQueue.schedule(
            this.currentTime + serviceTime,
            EventType.SERVICE_END,
            { doctorId: doctor.id, patient: patient }
        );
    }

    /**
     * Обработать окончание обслуживания.
     * Врач освобождается — на следующем шаге придёт пациент из очереди.
     */
    handleServiceEnd(event) {
        const { doctorId, patient } = event.data;
        const doctor = this.doctors.find(d => d.id === doctorId);

        if (!doctor) return;

        // Завершаем обслуживание
        patient.endService(this.currentTime);
        doctor.endService(this.currentTime);

        // Добавляем в статистику
        this.statistics.addServedPatient(patient);

        // Если есть пациенты в очереди — планируем их вход к врачу через небольшую задержку
        // чтобы визуализация успела показать врача как свободного
        if (!this.queue.isEmpty()) {
            const nextPatient = this.queue.dequeue();
            this.eventQueue.schedule(this.currentTime + 1, EventType.SERVICE_START, {
                doctorId: doctor.id,
                patient: nextPatient
            });
        }
    }

    /**
     * Обработать событие
     */
    processEvent(event) {
        this.currentTime = event.time;

        switch (event.type) {
            case EventType.ARRIVAL:
                this.handleArrival();
                break;
            case EventType.ENTER:
                this.handleEnter(event);
                break;
            case EventType.SERVICE_START:
                this.handleServiceStart(event);
                break;
            case EventType.SERVICE_END:
                this.handleServiceEnd(event);
                break;
        }

        // Вызываем callback для обновления UI
        if (this.onUpdate) {
            this.onUpdate(this.getState());
        }
    }

    /**
     * Выполнить один шаг симуляции
     */
    step() {
        if (this.eventQueue.isEmpty()) {
            this.stop();
            return false;
        }

        const event = this.eventQueue.getNext();
        this.processEvent(event);
        return true;
    }

    /**
     * Запустить симуляцию
     */
    start() {
        this.isRunning = true;
        this.isPaused = false;
    }

    /**
     * Приостановить симуляцию
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Продолжить симуляцию
     */
    resume() {
        this.isPaused = false;
    }

    /**
     * Остановить симуляцию
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
    }

    /**
     * Обновить параметры симуляции
     */
    updateParams(params) {
        // Обновляем количество врачей
        if (params.numDoctors !== undefined && params.numDoctors !== this.params.numDoctors) {
            const diff = params.numDoctors - this.doctors.length;

            if (diff > 0) {
                // Добавляем врачей
                for (let i = 0; i < diff; i++) {
                    this.doctors.push(new Doctor(this.doctors.length + 1));
                }
            } else if (diff < 0) {
                // Удаляем врачей (только свободных)
                const toRemove = Math.abs(diff);
                const availableDoctors = this.doctors.filter(d => d.isAvailable());

                for (let i = 0; i < Math.min(toRemove, availableDoctors.length); i++) {
                    const index = this.doctors.indexOf(availableDoctors[i]);
                    this.doctors.splice(index, 1);
                }
            }
        }

        // Обновляем вместимость очереди
        if (params.queueCapacity !== undefined) {
            this.queue.setCapacity(params.queueCapacity);
        }

        // Обновляем остальные параметры
        this.params = { ...this.params, ...params };
    }

    /**
     * Обработать начало обслуживания (пациент из очереди идёт к освободившемуся врачу)
     */
    handleServiceStart(event) {
        const { doctorId, patient } = event.data;
        const doctor = this.doctors.find(d => d.id === doctorId);
        if (!doctor) return;
        this.startService(patient, doctor);
    }

    /**
     * Получить текущее состояние симуляции
     */
    getState() {
        return {
            currentTime: this.currentTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            queue: this.queue,
            doctors: this.doctors,
            streetPatient: this.streetPatient,
            statistics: this.statistics.getFullStatistics(
                this.doctors,
                this.currentTime,
                this.queue.getLength(),
                this.queue.getMaxLength()
            )
        };
    }
}
