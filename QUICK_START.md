# Быстрый старт

## Локальный запуск

### Вариант 1: Открыть напрямую
Просто откройте файл `index.html` в браузере (двойной клик).

### Вариант 2: Локальный сервер (рекомендуется)

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server
```

Затем откройте: `http://localhost:8000`

## Публикация на GitHub Pages

### Быстрая публикация:

```bash
# 1. Инициализация (если нужно)
git init
git add .
git commit -m "Initial commit"

# 2. Создайте репозиторий на GitHub с именем: doctor-queue-sim.github.io

# 3. Подключите и отправьте
git remote add origin https://github.com/YOUR_USERNAME/doctor-queue-sim.github.io.git
git branch -M main
git push -u origin main

# 4. Включите GitHub Pages в настройках репозитория
# Settings → Pages → Source: main branch → Save
```

Сайт будет доступен через 1-2 минуты по адресу:
`https://YOUR_USERNAME.github.io/doctor-queue-sim.github.io/`

## Использование

1. **Настройте параметры** (левая панель)
2. **Нажмите "Старт"**
3. **Наблюдайте** за симуляцией и метриками
4. **Экспериментируйте** с параметрами в реальном времени

## Структура проекта

```
doctor-queue-sim.github.io/
├── index.html              # Главная страница
├── styles.css              # Стили
├── README.md               # Полная документация
├── GITHUB_PAGES_SETUP.md   # Детальная инструкция по деплою
└── js/
    ├── main.js             # Точка входа
    ├── models/             # Модели данных
    ├── core/               # Ядро симуляции
    ├── visualization/      # Визуализация PixiJS
    └── ui/                 # Контроллер UI
```

## Требования

- Современный браузер (Chrome, Firefox, Safari, Edge)
- Подключение к интернету (для загрузки PixiJS из CDN)

## Возможные проблемы

**Проблема:** Белый экран
**Решение:** Откройте консоль браузера (F12) и проверьте ошибки

**Проблема:** PixiJS не загружается
**Решение:** Проверьте подключение к интернету

**Проблема:** Кнопки не работают
**Решение:** Убедитесь, что все JS файлы загружены (проверьте консоль)

## Дополнительная информация

- Полная документация: [`README.md`](README.md)
- Инструкция по GitHub Pages: [`GITHUB_PAGES_SETUP.md`](GITHUB_PAGES_SETUP.md)
- План архитектуры: [`plan.md`](plan.md)
