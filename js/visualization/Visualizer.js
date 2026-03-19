/**
 * Класс Visualizer - визуализация симуляции с помощью PixiJS
 */
class Visualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.app = null;
        this.patientSprites = new Map(); // Map<patientId, sprite>
        this.doctorSprites = [];
        this.queuePositions = [];

        this.colors = {
            patient: 0x3498db,
            patientWaiting: 0xe74c3c,
            doctor: 0x2ecc71,
            doctorBusy: 0xf39c12,
            background: 0xecf0f1,
            queueArea: 0xbdc3c7
        };
    }

    /**
     * Инициализировать PixiJS приложение
     */
    async initialize() {
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;

        try {
            // Для PixiJS 7 и некоторых окружений GitHub Pages нужна явная async-инициализация
            this.app = new PIXI.Application();
            await this.app.init({
                width: width,
                height: height,
                backgroundColor: this.colors.background,
                antialias: true,
                preference: 'webgl'
            });

            this.container.appendChild(this.app.canvas || this.app.view);

            // Создаем контейнеры для разных слоев
            this.backgroundLayer = new PIXI.Container();
            this.queueLayer = new PIXI.Container();
            this.doctorLayer = new PIXI.Container();
            this.patientLayer = new PIXI.Container();

            this.app.stage.addChild(this.backgroundLayer);
            this.app.stage.addChild(this.queueLayer);
            this.app.stage.addChild(this.doctorLayer);
            this.app.stage.addChild(this.patientLayer);

            this.drawBackground();
        } catch (error) {
            console.error('Ошибка инициализации PixiJS:', error);
            throw error;
        }
    }

    /**
     * Нарисовать фон и области
     */
    drawBackground() {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        // Область очереди
        const queueArea = new PIXI.Graphics();
        queueArea.beginFill(this.colors.queueArea, 0.3);
        queueArea.drawRoundedRect(50, height / 2 - 100, 200, 200, 10);
        queueArea.endFill();
        this.backgroundLayer.addChild(queueArea);

        // Текст "Очередь"
        const queueText = new PIXI.Text('Очередь', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0x34495e,
            fontWeight: 'bold'
        });
        queueText.x = 120;
        queueText.y = height / 2 - 130;
        this.backgroundLayer.addChild(queueText);

        // Вычисляем позиции для пациентов в очереди
        const queueX = 150;
        const queueStartY = height / 2 - 80;
        const spacing = 35;

        for (let i = 0; i < 10; i++) {
            this.queuePositions.push({
                x: queueX,
                y: queueStartY + i * spacing
            });
        }
    }

    /**
     * Создать или обновить врачей
     */
    updateDoctors(doctors) {
        // Удаляем старые спрайты врачей
        this.doctorSprites.forEach(sprite => {
            this.doctorLayer.removeChild(sprite.container);
        });
        this.doctorSprites = [];

        const width = this.app.screen.width;
        const height = this.app.screen.height;
        const doctorStartX = width - 300;
        const doctorY = height / 2;
        const spacing = 120;

        doctors.forEach((doctor, index) => {
            const container = new PIXI.Container();

            // Кабинет врача
            const office = new PIXI.Graphics();
            const color = doctor.isBusy ? this.colors.doctorBusy : this.colors.doctor;
            office.beginFill(color, 0.3);
            office.drawRoundedRect(0, 0, 100, 100, 10);
            office.endFill();
            office.lineStyle(3, color);
            office.drawRoundedRect(0, 0, 100, 100, 10);
            container.addChild(office);

            // Иконка врача
            const doctorCircle = new PIXI.Graphics();
            doctorCircle.beginFill(color);
            doctorCircle.drawCircle(50, 35, 15);
            doctorCircle.endFill();
            container.addChild(doctorCircle);

            // Текст
            const text = new PIXI.Text(`Врач ${doctor.id}`, {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0x2c3e50,
                fontWeight: 'bold'
            });
            text.x = 50 - text.width / 2;
            text.y = 60;
            container.addChild(text);

            // Статус
            const status = new PIXI.Text(
                doctor.isBusy ? 'Занят' : 'Свободен',
                {
                    fontFamily: 'Arial',
                    fontSize: 12,
                    fill: doctor.isBusy ? 0xe74c3c : 0x27ae60
                }
            );
            status.x = 50 - status.width / 2;
            status.y = 80;
            container.addChild(status);

            container.x = doctorStartX + (index % 2) * spacing;
            container.y = doctorY - 50 + Math.floor(index / 2) * 130;

            this.doctorLayer.addChild(container);
            this.doctorSprites.push({
                container: container,
                doctor: doctor,
                office: office,
                circle: doctorCircle,
                statusText: status
            });
        });
    }

    /**
     * Создать спрайт пациента
     */
    createPatientSprite(patient, x, y) {
        const container = new PIXI.Container();

        // Круг пациента
        const circle = new PIXI.Graphics();
        circle.beginFill(this.colors.patient);
        circle.drawCircle(0, 0, 12);
        circle.endFill();
        container.addChild(circle);

        // ID пациента
        const text = new PIXI.Text(`${patient.id}`, {
            fontFamily: 'Arial',
            fontSize: 10,
            fill: 0xffffff,
            fontWeight: 'bold'
        });
        text.anchor.set(0.5);
        container.addChild(text);

        container.x = x;
        container.y = y;

        this.patientLayer.addChild(container);

        return { container, circle, text };
    }

    /**
     * Обновить визуализацию
     */
    update(state) {
        if (!state) return;

        const { queue, doctors } = state;

        // Обновляем врачей
        this.updateDoctors(doctors);

        // Обновляем пациентов в очереди
        this.updateQueue(queue);

        // Обновляем пациентов у врачей
        this.updatePatientsAtDoctors(doctors);
    }

    /**
     * Обновить очередь пациентов
     */
    updateQueue(queue) {
        const patients = queue.getAllPatients();
        const currentPatientIds = new Set(patients.map(p => p.id));

        // Удаляем пациентов, которых больше нет в очереди
        for (const [patientId, sprite] of this.patientSprites.entries()) {
            if (!currentPatientIds.has(patientId) && sprite.location === 'queue') {
                this.patientLayer.removeChild(sprite.container);
                this.patientSprites.delete(patientId);
            }
        }

        // Добавляем или обновляем пациентов в очереди
        patients.forEach((patient, index) => {
            if (index >= this.queuePositions.length) return;

            const pos = this.queuePositions[index];

            if (!this.patientSprites.has(patient.id)) {
                const sprite = this.createPatientSprite(patient, pos.x, pos.y);
                sprite.location = 'queue';
                this.patientSprites.set(patient.id, sprite);
            } else {
                const sprite = this.patientSprites.get(patient.id);
                this.animateToPosition(sprite.container, pos.x, pos.y);
            }
        });
    }

    /**
     * Обновить пациентов у врачей
     */
    updatePatientsAtDoctors(doctors) {
        doctors.forEach((doctor, index) => {
            if (doctor.currentPatient) {
                const patient = doctor.currentPatient;
                const doctorSprite = this.doctorSprites[index];

                if (!doctorSprite) return;

                const targetX = doctorSprite.container.x + 50;
                const targetY = doctorSprite.container.y + 35;

                if (!this.patientSprites.has(patient.id)) {
                    const sprite = this.createPatientSprite(patient, targetX, targetY);
                    sprite.location = 'doctor';
                    sprite.doctorId = doctor.id;
                    this.patientSprites.set(patient.id, sprite);
                } else {
                    const sprite = this.patientSprites.get(patient.id);
                    if (sprite.location !== 'doctor' || sprite.doctorId !== doctor.id) {
                        sprite.location = 'doctor';
                        sprite.doctorId = doctor.id;
                        this.animateToPosition(sprite.container, targetX, targetY);
                    }
                }
            }
        });

        // Удаляем пациентов, которые закончили обслуживание
        const activeDoctorPatients = new Set(
            doctors.filter(d => d.currentPatient).map(d => d.currentPatient.id)
        );

        for (const [patientId, sprite] of this.patientSprites.entries()) {
            if (sprite.location === 'doctor' && !activeDoctorPatients.has(patientId)) {
                this.fadeOutAndRemove(sprite);
                this.patientSprites.delete(patientId);
            }
        }
    }

    /**
     * Анимировать перемещение к позиции
     */
    animateToPosition(sprite, targetX, targetY, duration = 0.3) {
        const startX = sprite.x;
        const startY = sprite.y;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            sprite.x = startX + (targetX - startX) * eased;
            sprite.y = startY + (targetY - startY) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Плавно удалить спрайт
     */
    fadeOutAndRemove(sprite) {
        const startAlpha = sprite.container.alpha;
        const startTime = Date.now();
        const duration = 0.5;

        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);

            sprite.container.alpha = startAlpha * (1 - progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.patientLayer.removeChild(sprite.container);
            }
        };

        animate();
    }

    /**
     * Изменить размер canvas
     */
    resize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.app.renderer.resize(width, height);

        // Перерисовываем фон
        this.backgroundLayer.removeChildren();
        this.drawBackground();
    }

    /**
     * Уничтожить визуализатор
     */
    destroy() {
        if (this.app) {
            this.app.destroy(true, { children: true, texture: true });
        }
    }
}
