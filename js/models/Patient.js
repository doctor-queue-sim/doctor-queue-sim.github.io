/**
 * Класс Patient - представляет пациента в системе
 */
class Patient {
    static nextId = 1;

    constructor(arrivalTime) {
        this.id = Patient.nextId++;
        this.arrivalTime = arrivalTime; // Время прихода в систему
        this.serviceStartTime = null; // Время начала обслуживания
        this.serviceEndTime = null; // Время окончания обслуживания
        this.waitTime = 0; // Время ожидания в очереди
        this.serviceTime = 0; // Время обслуживания
        this.doctorId = null; // ID врача, который обслуживает
    }

    /**
     * Начать обслуживание пациента
     */
    startService(currentTime, doctorId, serviceTime) {
        this.serviceStartTime = currentTime;
        this.waitTime = currentTime - this.arrivalTime;
        this.doctorId = doctorId;
        this.serviceTime = serviceTime;
        this.serviceEndTime = currentTime + serviceTime;
    }

    /**
     * Завершить обслуживание пациента
     */
    endService(currentTime) {
        this.serviceEndTime = currentTime;
    }

    /**
     * Получить общее время в системе
     */
    getTotalTime() {
        if (this.serviceEndTime === null) {
            return null;
        }
        return this.serviceEndTime - this.arrivalTime;
    }

    /**
     * Проверить, обслужен ли пациент
     */
    isServed() {
        return this.serviceEndTime !== null;
    }
}
