
# TaskTracker

Практична робота №1
Базовий клієнт — бекенд — база даних

Студент: Омельчук Максим
Група: ІПЗ-33

## Опис
TaskTracker — навчальний вебзастосунок для
перегляду списку завдань.

## Технології
- HTML, CSS, JavaScript
- Node.js
- Express.js
- SQLite

## Архітектура
Frontend → Backend → SQLite

## Запуск

1. Встановити залежності:
   npm install

2. Запустити сервер:
   node server.js

3. Відкрити у браузері:
   http://localhost:3000

## API
GET /items — повертає список завдань із БД.

## Результат
Реалізовано вебсторінку, сервер і локальну
базу даних. Кнопка Load items отримує
дані через API та відображає їх списком.

## Перевірка практичної №1

Після запуску сервера доступні:

- http://localhost:3000 — вебінтерфейс
- http://localhost:3000/items — API

Кнопка Load items виконує GET-запит
і показує записи з бази даних SQLite.

Архітектура:
Client → Express Backend → SQLite.


## Практична робота №2

Бізнес-документ і архітектура TaskTracker.

- [Бізнес-документ](docs/business_doc.md)
- [Архітектурна діаграма](docs/architecture_diagram.drawio)
- [Roadmap](docs/roadmap.md)
### Архітектурна діаграма TaskTracker

![Архітектурна діаграма](docs/architecture_diagram.png)

## Практична робота №3 — Domain-Driven Design

Виконано аналіз предметної області TaskTracker.

- [Глосарій термінів](docs/domain/glossary.md)
- [Опис сутностей](docs/domain/entities.md)
- [Контекстна діаграма](docs/domain/context_map.png)
- [Редагована діаграма](docs/domain/context_map.drawio)
- [Моделі JavaScript](domain/models.js)

Реалізовано прототип моделей для роботи із завданнями.

## Практична робота №4

У цій практичній реалізовано CRUD API
для керування завданнями.

### API документація

[OpenAPI специфікація](docs/api/openapi.yaml)

![Swagger Editor](docs/api/swagger_screenshot.png)

### Архітектурні рішення

- [ADR 0001](docs/adr/0001-architecture-style.md)
- [ADR 0002](docs/adr/0002-layered-architecture.md)
- [ADR 0003](docs/adr/0003-api-style-and-error-model.md)

### Тестування

Команда для запуску тестів:

`node --test test/tasks.test.js`

Результат: 2 тести пройдено, 0 помилок.
## Практична робота №5 — Надійність API

У цій роботі покращено обробку запитів та помилок у TaskTracker.

### Реалізовані зміни

- X-Request-Id для ідентифікації запитів.
- Idempotency-Key для захисту від повторного створення завдань.
- Rate Limit: 8 POST-запитів за 10 секунд.
- HTTP 429 та заголовок Retry-After.
- Retry з експоненційною затримкою.
- AbortController для обмеження часу запиту.
- Degraded Mode із повідомленням про недоступність сервера.
- requestId у JSON-відповідях на помилки.

### Перевірка

Перевірено повторні POST-запити, перевищення ліміту,
роботу Retry, таймаутів та Degraded Mode.

Для перевірки API:
- GET /health
- GET /tasks/999999
- POST /tasks

Запуск тестів:

node --test test/tasks.test.js

### Обмеження

Idempotency-Key та Rate Limit зберігають стан у пам'яті.
Після перезапуску сервера цей стан скидається.
Для реального застосунку потрібне постійне сховище.

## Практична робота №6 — Docker

Мета роботи — навчитися створювати Docker-образи
та запускати власний вебзастосунок у контейнері.

### Виконання

1. Встановлено Docker Desktop та перевірено hello-world.
2. Створено .dockerignore для виключення зайвих файлів.
3. Створено Dockerfile для Node.js-застосунку TaskTracker.
4. Зібрано Docker-образ та запущено контейнер.
5. Перевірено вебінтерфейс і доступність API.

### Команди запуску

```powershell
docker build -t tasktracker:lab6 .
docker run --rm -d --name tasktracker-lab6 -p 3001:3000 tasktracker:lab6
docker ps
docker logs tasktracker-lab6
curl.exe http://localhost:3001/health
```

Сайт доступний за адресою http://localhost:3001.

Для зупинки контейнера:

```powershell
docker stop tasktracker-lab6
```

### Висновок

Під час роботи я навчився створювати Docker-образ,
запускати Node.js-застосунок у контейнері та перевіряти
його роботу через браузер і термінал.
