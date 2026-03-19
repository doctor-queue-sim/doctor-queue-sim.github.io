/**
 * Класс Doctor - представляет врача в системе
 */
class Doctor {
    constructor(id) {
        this.id = id;
        this.isBusy = false;
        this.currentPatient = null;
        this.totalBusyTime = 0; // Общее время занятости
        this.lastBusyStartTime = null; // Время начала последнего периода занятости
        this.patientsServed = 0; // Количество обслуженных пациентов
    }

    /**
     * Начать обслуживание пациента
     */
    startService(patient, currentTime) {
        this.isBusy = true;
        this.currentPatient = patient;
        this.lastBusyStartTime = currentTime;
    }

    /**
     * Завершить обслуживание пациента
     */
    endService(currentTime) {
        if (this.isBusy && this.lastBusyStartTime !== null) {
            this.totalBusyTime += (currentTime - this.lastBusyStartTime);
            this.patientsServed++;
        }
        this.isBusy = false;
        this.currentPatient = null;
        this.lastBusyStartTime = null;
    }

    /**
     * Получить коэффициент загрузки врача
     */
    getUtilization(totalTime) {
        if (totalTime === 0) return 0;

        let busyTime = this.totalBusyTime;

        // Если врач сейчас занят, добавляем текущий период
        if (this.isBusy && this.lastBusyStartTime !== null) {
            busyTime += (totalTime - this.lastBusyStartTime);
        }

        return (busyTime / totalTime) * 100;
    }

    /**
     * Проверить, свободен ли врач
     */
    isAvailable() {
        return !this.isBusy;
    }

    /**
     * Сбросить статистику врача
     */
    reset() {
        this.isBusy = false;
        this.currentPatient = null;
        this.totalBusyTime = 0;
        this.lastBusyStartTime = null;
        this.patientsServed = 0;
    }
}
