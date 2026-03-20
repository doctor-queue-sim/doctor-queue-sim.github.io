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
            patientStreet: '#9b59b6',
            doctor: '#2ecc71',
            doctorBusy: '#f39c12',
            doctorFree: '#2ecc71',
            background: '#ecf0f1',
            queueArea: '#bdc3c7',
            streetArea: '#a8d8ea',
            text: '#2c3e50',
            textLight: '#ffffff'
        };

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
        const queueX = 230;
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

        this._drawStreetArea(ctx, w, h);
        this._drawQueueArea(ctx, w, h);
        this._drawDoctors(ctx, w, h);
        this._drawPatients(ctx);

        if (this._welcomeVisible) {
            this._drawWelcome(ctx, w, h);
        }
    }

    /**
     * Нарисовать зону «Улица» (левая часть)
     */
    _drawStreetArea(ctx, w, h) {
        const x = 10;
        const y = h / 2 - 60;
        const rectW = 90;
        const rectH = 120;

        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = this.colors.streetArea;
        this._roundRect(ctx, x, y, rectW, rectH, 10);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#5dade2';
        ctx.lineWidth = 2;
        this._roundRect(ctx, x, y, rectW, rectH, 10);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Улица', x + rectW / 2, y - 8);
        ctx.textAlign = 'left';
    }

    /**
     * Нарисовать область очереди
     */
    _drawQueueArea(ctx, w, h) {
        const x = 120;
        const y = h / 2 - 100;
        const rectW = 140;
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
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Очередь', x + rectW / 2, y - 8);
        ctx.textAlign = 'left';
    }

    /**
     * Нарисовать врачей
     */
    _drawDoctors(ctx, w, h) {
        this.doctorSprites = [];

        if (!this._state) return;

        const { doctors } = this._state;
        const doctorStartX = w - 310;
        const doctorY = h / 2;
        const spacing = 140;

        doctors.forEach((doctor, index) => {
            const capacity = doctor.capacity || 1;
            const cols = Math.min(capacity, 2);
            const rows = Math.ceil(capacity / cols);

            const slotW = 36;
            const slotH = 28;
            const slotPadX = 8;
            const slotPadY = 8;

            // Высота кабинета: заголовок (50px) + строки слотов
            const boxW = slotPadX * 2 + cols * slotW + (cols - 1) * 6;
            const boxH = 50 + rows * (slotH + slotPadY);
            const x = doctorStartX + (index % 2) * spacing;
            const y = doctorY - boxH / 2 + Math.floor(index / 2) * (boxH + 20);
            const color = doctor.isBusy ? this.colors.doctorBusy : this.colors.doctorFree;

            // Кабинет
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = color;
            this._roundRect(ctx, x, y, boxW, boxH, 10);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = doctor.isBusy ? 3 : 2;
            this._roundRect(ctx, x, y, boxW, boxH, 10);
            ctx.stroke();
            ctx.restore();

            // Иконка врача (круг)
            ctx.beginPath();
            ctx.arc(x + boxW / 2, y + 14, 10, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Имя
            ctx.fillStyle = this.colors.text;
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Врач ${doctor.id}`, x + boxW / 2, y + 34);
            ctx.textAlign = 'left';

            // Слоты-зоны для мест (стульев)
            const slots = [];
            for (let s = 0; s < capacity; s++) {
                const col = s % cols;
                const row = Math.floor(s / cols);
                const slotX = x + slotPadX + col * (slotW + 6);
                const slotY = y + 42 + row * (slotH + slotPadY);
                const centerX = slotX + slotW / 2;
                const centerY = slotY + slotH / 2;
                slots.push({ x: centerX, y: centerY });

                const isOccupied = s < doctor.currentPatients.length;

                // Зона-слот (прямоугольник)
                ctx.save();
                ctx.fillStyle = isOccupied ? 'rgba(230, 126, 34, 0.25)' : 'rgba(189, 195, 199, 0.35)';
                this._roundRect(ctx, slotX, slotY, slotW, slotH, 6);
                ctx.fill();
                ctx.strokeStyle = isOccupied ? '#e67e22' : '#b2bec3';
                ctx.lineWidth = isOccupied ? 2 : 1.5;
                ctx.setLineDash(isOccupied ? [] : [4, 3]);
                this._roundRect(ctx, slotX, slotY, slotW, slotH, 6);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }

            this.doctorSprites.push({ x, y, boxW, boxH, doctor, slots });
        });
    }

    /**
     * Нарисовать пациентов
     */
    _drawPatients(ctx) {
        for (const [, sprite] of this.patientSprites.entries()) {
            let color;
            if (sprite.location === 'street') {
                color = this.colors.patientStreet;
            } else if (sprite.location === 'queue') {
                color = this.colors.patientWaiting;
            } else {
                color = this.colors.patient;
            }

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
        ctx.globalAlpha = 0.9;
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

        const { queue, doctors, streetPatient } = state;
        this._syncStreetPatient(streetPatient);
        this._syncQueue(queue);
        this._syncPatientsAtDoctors(doctors);
    }

    /**
     * Синхронизировать пациента на улице
     */
    _syncStreetPatient(streetPatient) {
        const h = this.canvas.height;
        const streetX = 55;
        const streetY = h / 2;

        // Удаляем старых street-пациентов, которых больше нет
        for (const [id, sprite] of this.patientSprites.entries()) {
            if (sprite.location === 'street') {
                if (!streetPatient || streetPatient.id !== id) {
                    this.patientSprites.delete(id);
                }
            }
        }

        if (streetPatient) {
            if (!this.patientSprites.has(streetPatient.id)) {
                this.patientSprites.set(streetPatient.id, {
                    id: streetPatient.id,
                    x: streetX,
                    y: streetY,
                    location: 'street'
                });
            }
        }
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
                sprite.location = 'queue';
                this._animateTo(sprite, pos.x, pos.y);
            }
        });
    }

    /**
     * Синхронизировать пациентов у врачей
     */
    _syncPatientsAtDoctors(doctors) {
        const activeDoctorPatients = new Set();
        doctors.forEach(d => {
            d.currentPatients.forEach(p => activeDoctorPatients.add(p.id));
        });

        doctors.forEach((doctor, index) => {
            if (doctor.currentPatients.length === 0) return;
            const ds = this.doctorSprites[index];
            if (!ds) return;

            doctor.currentPatients.forEach((patient, slotIndex) => {
                const slot = ds.slots[slotIndex] || ds.slots[ds.slots.length - 1];
                const targetX = slot.x;
                const targetY = slot.y;

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
