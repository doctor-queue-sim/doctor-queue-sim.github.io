/**
 * Класс Queue - представляет очередь пациентов
 */
class Queue {
    constructor(capacity) {
        this.capacity = capacity; // Максимальная длина очереди
        this.patients = []; // Массив пациентов в очереди
        this.maxLengthReached = 0; // Максимальная длина очереди за всё время
    }

    /**
     * Добавить пациента в очередь
     * @returns {boolean} true если пациент добавлен, false если очередь полна
     */
    enqueue(patient) {
        if (this.isFull()) {
            return false;
        }

        this.patients.push(patient);

        // Обновляем максимальную длину очереди
        if (this.patients.length > this.maxLengthReached) {
            this.maxLengthReached = this.patients.length;
        }

        return true;
    }

    /**
     * Извлечь первого пациента из очереди
     * @returns {Patient|null} пациент или null если очередь пуста
     */
    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        return this.patients.shift();
    }

    /**
     * Посмотреть на первого пациента без извлечения
     * @returns {Patient|null} пациент или null если очередь пуста
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.patients[0];
    }

    /**
     * Проверить, пуста ли очередь
     */
    isEmpty() {
        return this.patients.length === 0;
    }

    /**
     * Проверить, полна ли очередь
     */
    isFull() {
        return this.patients.length >= this.capacity;
    }

    /**
     * Получить текущую длину очереди
     */
    getLength() {
        return this.patients.length;
    }

    /**
     * Получить максимальную длину очереди
     */
    getMaxLength() {
        return this.maxLengthReached;
    }

    /**
     * Изменить вместимость очереди
     */
    setCapacity(newCapacity) {
        this.capacity = newCapacity;
    }

    /**
     * Очистить очередь
     */
    clear() {
        this.patients = [];
        this.maxLengthReached = 0;
    }

    /**
     * Получить всех пациентов в очереди
     */
    getAllPatients() {
        return [...this.patients];
    }
}
