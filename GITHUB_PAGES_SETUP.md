# Настройка GitHub Pages

## Шаги для публикации проекта на GitHub Pages

### 1. Инициализация Git репозитория (если еще не сделано)

```bash
git init
git add .
git commit -m "Initial commit: Doctor queue simulation"
```

### 2. Создание репозитория на GitHub

1. Перейдите на [GitHub](https://github.com)
2. Нажмите "New repository"
3. Назовите репозиторий: `doctor-queue-sim.github.io`
4. Оставьте репозиторий публичным (Public)
5. НЕ добавляйте README, .gitignore или лицензию (они уже есть)
6. Нажмите "Create repository"

### 3. Подключение удаленного репозитория

```bash
git remote add origin https://github.com/YOUR_USERNAME/doctor-queue-sim.github.io.git
git branch -M main
git push -u origin main
```

Замените `YOUR_USERNAME` на ваше имя пользователя GitHub.

### 4. Включение GitHub Pages

1. Перейдите в настройки репозитория (Settings)
2. В левом меню выберите "Pages"
3. В разделе "Source" выберите:
   - Branch: `main`
   - Folder: `/ (root)`
4. Нажмите "Save"

### 5. Проверка публикации

Через несколько минут ваш сайт будет доступен по адресу:
```
https://YOUR_USERNAME.github.io/doctor-queue-sim.github.io/
```

## Обновление сайта

После внесения изменений в код:

```bash
git add .
git commit -m "Описание изменений"
git push
```

GitHub Pages автоматически обновит сайт через 1-2 минуты.

## Альтернативный вариант: использование gh-pages ветки

Если вы хотите использовать отдельную ветку для публикации:

```bash
# Создать ветку gh-pages
git checkout -b gh-pages
git push origin gh-pages

# Вернуться на main
git checkout main
```

Затем в настройках GitHub Pages выберите ветку `gh-pages`.

## Проверка работоспособности

После публикации проверьте:
- ✅ Страница загружается
- ✅ PixiJS библиотека подключена (проверьте консоль браузера)
- ✅ Все JavaScript файлы загружаются без ошибок
- ✅ Визуализация отображается корректно
- ✅ Кнопки управления работают

## Возможные проблемы

### Проблема: 404 ошибка
**Решение**: Убедитесь, что файл `index.html` находится в корне репозитория.

### Проблема: JavaScript не работает
**Решение**: Проверьте консоль браузера (F12) на наличие ошибок. Убедитесь, что все пути к файлам относительные.

### Проблема: PixiJS не загружается
**Решение**: Проверьте подключение к CDN. Если CDN недоступен, скачайте библиотеку локально.

### Проблема: Стили не применяются
**Решение**: Проверьте путь к `styles.css` в `index.html`. Очистите кэш браузера (Ctrl+Shift+R).

## Дополнительные настройки

### Добавление custom domain

1. Создайте файл `CNAME` в корне репозитория:
```
yourdomain.com
```

2. Настройте DNS записи у вашего регистратора домена:
```
Type: CNAME
Name: www
Value: YOUR_USERNAME.github.io
```

### Добавление favicon

Добавьте файл `favicon.ico` в корень проекта и обновите `index.html`:
```html
<link rel="icon" type="image/x-icon" href="favicon.ico">
```

## Полезные команды Git

```bash
# Проверить статус
git status

# Посмотреть историю коммитов
git log --oneline

# Отменить последний коммит (не отправленный)
git reset --soft HEAD~1

# Посмотреть изменения
git diff

# Создать новую ветку
git checkout -b feature-name

# Переключиться между ветками
git checkout branch-name

# Слить ветку
git merge branch-name
```

## Мониторинг

После публикации вы можете отслеживать:
- Количество посещений (GitHub Insights)
- Ошибки в консоли браузера
- Производительность (Chrome DevTools)

## Поддержка

Если возникли проблемы:
1. Проверьте [GitHub Pages документацию](https://docs.github.com/en/pages)
2. Проверьте консоль браузера на ошибки
3. Убедитесь, что все файлы закоммичены и отправлены
