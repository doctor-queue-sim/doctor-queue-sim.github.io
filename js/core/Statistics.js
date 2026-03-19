/**
 * Класс Statistics - сбор и расчет статистики симуляции
 */
class Statistics {
    constructor() {
        this.reset();
    }

    /**
     * Сбросить всю статистику
     */
    reset() {
        this.servedPatients = []; // Обслуженные пациенты
        this.rejectedPatients = 0; // Количество отказов
        this.totalWaitTime = 0; // Общее время ожидания
        this.waitTimes = []; // Массив времен ожидания для расчета перцентилей
    }

    /**
     * Добавить обслуженного пациента
     */
    addServedPatient(patient) {
        this.servedPatients.push(patient);
        this.totalWaitTime += patient.waitTime;
        this.waitTimes.push(patient.waitTime);
    }

    /**
     * Добавить отказ
     */
    addRejection() {
        this.rejectedPatients++;
    }

    /**
     * Получить среднее время ожидания
     */
    getAverageWaitTime() {
        if (this.servedPatients.length === 0) {
            return 0;
        }
        return this.totalWaitTime / this.servedPatients.length;
    }

    /**
     * Получить перцентиль времени ожидания
     */
    getWaitTimePercentile(percentile) {
        if (this.waitTimes.length === 0) {
            return 0;
        }

        const sorted = [...this.waitTimes].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    /**
     * Получить 95-й перцентиль времени ожидания
     */
    get95thPercentileWaitTime() {
        return this.getWaitTimePercentile(95);
    }

    /**
     * Получить количество обслуженных пациентов
     */
    getServedCount() {
        return this.servedPatients.length;
    }

    /**
     * Получить количество отказов
     */
    getRejectedCount() {
        return this.rejectedPatients;
    }

    /**
     * Получить пропускную способность (пациентов/час)
     */
    getThroughput(simulationTime) {
        if (simulationTime === 0) {
            return 0;
        }
        return this.servedPatients.length / simulationTime;
    }

    /**
     * Получить среднюю загрузку врачей
     */
    getAverageDoctorUtilization(doctors, simulationTime) {
        if (doctors.length === 0 || simulationTime === 0) {
            return 0;
        }

        let totalUtilization = 0;
        for (const doctor of doctors) {
            totalUtilization += doctor.getUtilization(simulationTime);
        }

        return totalUtilization / doctors.length;
    }

    /**
     * Получить полную статистику
     */
    getFullStatistics(doctors, simulationTime, currentQueueLength, maxQueueLength) {
        return {
            avgWaitTime: this.getAverageWaitTime(),
            p95WaitTime: this.get95thPercentileWaitTime(),
            throughput: this.getThroughput(simulationTime),
            doctorUtilization: this.getAverageDoctorUtilization(doctors, simulationTime),
            servedPatients: this.getServedCount(),
            rejectedPatients: this.getRejectedCount(),
            currentQueueLength: currentQueueLength,
            maxQueueLength: maxQueueLength,
            simulationTime: simulationTime
        };
    }
}
