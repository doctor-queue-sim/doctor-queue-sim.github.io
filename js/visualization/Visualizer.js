/**
 * Класс Visualizer - визуализация симуляции с помощью нативного Canvas 2D API
 */
class Visualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = null;
        this.ctx = null;
        this.patientSprites = new Map(); // Map<patientId, {x, y, location, doctorId}>
        this.doctorSprites = [];
        this.queuePositions = [];
        this.animationFrameId = null;

        this.colors = {
            patient: '#3498db',
            patientWaiting: '#e74c3c',
            doctor: '#2ecc71',
            doctorBusy: '#f39c12',
            background: '#ecf0f1',
            queueArea: '#bdc3c7',
            text: '#2c3e50',
            textLight: '#ffffff'
        };

        this._renderLoop = this._renderLoop.bind(this);
        this._state = null;
        this._welcomeVisible = true;
    }

    /**
     * Инициализировать Canvas
     */
    async initialize() {
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;

        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.display = 'block';
        this.container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        this._computeQueuePositions();
        this._startRenderLoop();
    }

    /**
     * Вычислить позиции слотов очереди
     */
    _computeQueuePositions() {
        const height = this.canvas.height;
        const queueX = 150;
        const queueStartY = height / 2 - 80;
        const spacing = 35;

        this.queuePositions = [];
        for (let i = 0; i < 10; i++) {
            this.queuePositions.push({
                x: queueX,
                y: queueStartY + i * spacing
            });
        }
    }

    /**
     * Запустить цикл рендеринга
     */
    _startRenderLoop() {
        const loop = () => {
            this._draw();
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    }

    /**
     * Основной цикл отрисовки
     */
    _draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Фон
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, w, h);

        this._drawQueueArea(ctx, w, h);
        this._drawDoctors(ctx, w, h);
        this._drawPatients(ctx);

        if (this._welcomeVisible) {
            this._drawWelcome(ctx, w, h);
        }
    }

    /**
     * Нарисовать область очереди
     */
    _drawQueueArea(ctx, w, h) {
        const x = 50;
        const y = h / 2 - 100;
        const rectW = 200;
        const rectH = 200;

        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.colors.queueArea;
        this._roundRect(ctx, x, y, rectW, rectH, 10);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.colors.queueArea;
        ctx.lineWidth = 2;
        this._roundRect(ctx, x, y, rectW, rectH, 10);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 18px Arial';
        ctx.fillText('Очередь', 120, h / 2 - 115);
    }

    /**
     * Нарисовать врачей
     */
    _drawDoctors(ctx, w, h) {
        this.doctorSprites = [];

        if (!this._state) return;

        const { doctors } = this._state;
        const doctorStartX = w - 300;
        const doctorY = h / 2;
        const spacing = 120;

        doctors.forEach((doctor, index) => {
            const x = doctorStartX + (index % 2) * spacing;
            const y = doctorY - 50 + Math.floor(index / 2) * 130;
            const color = doctor.isBusy ? this.colors.doctorBusy : this.colors.doctor;

            // Кабинет
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = color;
            this._roundRect(ctx, x, y, 100, 100, 10);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            this._roundRect(ctx, x, y, 100, 100, 10);
            ctx.stroke();
            ctx.restore();

            // Иконка врача (круг)
            ctx.beginPath();
            ctx.arc(x + 50, y + 35, 15, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Имя
            ctx.fillStyle = this.colors.text;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Врач ${doctor.id}`, x + 50, y + 65);

            // Статус
            ctx.fillStyle = doctor.isBusy ? '#e74c3c' : '#27ae60';
            ctx.font = '12px Arial';
            ctx.fillText(doctor.isBusy ? 'Занят' : 'Свободен', x + 50, y + 82);

            ctx.textAlign = 'left';

            this.doctorSprites.push({ x, y, doctor });
        });
    }

    /**
     * Нарисовать пациентов
     */
    _drawPatients(ctx) {
        for (const [, sprite] of this.patientSprites.entries()) {
            const color = sprite.location === 'queue'
                ? this.colors.patientWaiting
                : this.colors.patient;

            ctx.beginPath();
            ctx.arc(sprite.x, sprite.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.fillStyle = this.colors.textLight;
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(sprite.id), sprite.x, sprite.y);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        }
    }

    /**
     * Нарисовать приветственное сообщение
     */
    _drawWelcome(ctx, w, h) {
        const msg = [
            'Добро пожаловать в симуляцию очереди к врачу!',
            '',
            'Настройте параметры слева и нажмите «Старт»',
            'для начала симуляции.'
        ];

        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#ffffff';
        this._roundRect(ctx, w / 2 - 220, h / 2 - 70, 440, 130, 12);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();

        ctx.fillStyle = this.colors.text;
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        msg.forEach((line, i) => {
            ctx.fillText(line, w / 2, h / 2 - 40 + i * 26);
        });
        ctx.textAlign = 'left';
    }

    /**
     * Вспомогательный метод: скруглённый прямоугольник
     */
    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    /**
     * Обновить визуализацию
     */
    update(state) {
        if (!state) return;
        this._state = state;

        const { queue, doctors } = state;
        this._syncQueue(queue);
        this._syncPatientsAtDoctors(doctors);
    }

    /**
     * Синхронизировать пациентов в очереди
     */
    _syncQueue(queue) {
        const patients = queue.getAllPatients();
        const currentIds = new Set(patients.map(p => p.id));

        // Удаляем ушедших из очереди
        for (const [id, sprite] of this.patientSprites.entries()) {
            if (sprite.location === 'queue' && !currentIds.has(id)) {
                this.patientSprites.delete(id);
            }
        }

        // Добавляем/обновляем
        patients.forEach((patient, index) => {
            if (index >= this.queuePositions.length) return;
            const pos = this.queuePositions[index];

            if (!this.patientSprites.has(patient.id)) {
                this.patientSprites.set(patient.id, {
                    id: patient.id,
                    x: pos.x,
                    y: pos.y,
                    location: 'queue'
                });
            } else {
                const sprite = this.patientSprites.get(patient.id);
                this._animateTo(sprite, pos.x, pos.y);
            }
        });
    }

    /**
     * Синхронизировать пациентов у врачей
     */
    _syncPatientsAtDoctors(doctors) {
        const activeDoctorPatients = new Set(
            doctors.filter(d => d.currentPatient).map(d => d.currentPatient.id)
        );

        doctors.forEach((doctor, index) => {
            if (!doctor.currentPatient) return;
            const patient = doctor.currentPatient;
            const ds = this.doctorSprites[index];
            if (!ds) return;

            const targetX = ds.x + 50;
            const targetY = ds.y + 35;

            if (!this.patientSprites.has(patient.id)) {
                this.patientSprites.set(patient.id, {
                    id: patient.id,
                    x: targetX,
                    y: targetY,
                    location: 'doctor',
                    doctorId: doctor.id
                });
            } else {
                const sprite = this.patientSprites.get(patient.id);
                if (sprite.location !== 'doctor' || sprite.doctorId !== doctor.id) {
                    sprite.location = 'doctor';
                    sprite.doctorId = doctor.id;
                    this._animateTo(sprite, targetX, targetY);
                }
            }
        });

        // Удаляем пациентов, закончивших обслуживание
        for (const [id, sprite] of this.patientSprites.entries()) {
            if (sprite.location === 'doctor' && !activeDoctorPatients.has(id)) {
                this.patientSprites.delete(id);
            }
        }
    }

    /**
     * Плавное перемещение спрайта к целевой позиции
     */
    _animateTo(sprite, targetX, targetY, duration = 300) {
        const startX = sprite.x;
        const startY = sprite.y;
        const startTime = Date.now();

        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            sprite.x = startX + (targetX - startX) * eased;
            sprite.y = startY + (targetY - startY) * eased;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }

    /**
     * Изменить размер canvas
     */
    resize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.canvas.width = width;
        this.canvas.height = height;
        this._computeQueuePositions();
    }

    /**
     * Скрыть приветственное сообщение
     */
    hideWelcome() {
        this._welcomeVisible = false;
    }

    /**
     * Уничтожить визуализатор
     */
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}
