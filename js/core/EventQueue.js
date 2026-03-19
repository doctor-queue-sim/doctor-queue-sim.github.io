/**
 * Класс Event - представляет событие в симуляции
 */
class Event {
    constructor(time, type, data = {}) {
        this.time = time; // Время события
        this.type = type; // Тип события: 'ARRIVAL', 'SERVICE_START', 'SERVICE_END'
        this.data = data; // Дополнительные данные события
    }
}

/**
 * Класс EventQueue - очередь событий с приоритетом по времени
 */
class EventQueue {
    constructor() {
        this.events = [];
    }

    /**
     * Добавить событие в очередь
     */
    schedule(time, type, data = {}) {
        const event = new Event(time, type, data);

        // Вставляем событие в правильную позицию (сортировка по времени)
        let inserted = false;
        for (let i = 0; i < this.events.length; i++) {
            if (this.events[i].time > time) {
                this.events.splice(i, 0, event);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            this.events.push(event);
        }

        return event;
    }

    /**
     * Извлечь следующее событие
     */
    getNext() {
        if (this.isEmpty()) {
            return null;
        }
        return this.events.shift();
    }

    /**
     * Посмотреть на следующее событие без извлечения
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.events[0];
    }

    /**
     * Проверить, пуста ли очередь событий
     */
    isEmpty() {
        return this.events.length === 0;
    }

    /**
     * Получить количество событий в очереди
     */
    size() {
        return this.events.length;
    }

    /**
     * Очистить очередь событий
     */
    clear() {
        this.events = [];
    }

    /**
     * Удалить все события определенного типа
     */
    removeEventsByType(type) {
        this.events = this.events.filter(event => event.type !== type);
    }

    /**
     * Получить все события (для отладки)
     */
    getAllEvents() {
        return [...this.events];
    }
}

/**
 * Типы событий
 */
const EventType = {
    ARRIVAL: 'ARRIVAL',           // Приход пациента
    SERVICE_START: 'SERVICE_START', // Начало обслуживания
    SERVICE_END: 'SERVICE_END'      // Окончание обслуживания
};
