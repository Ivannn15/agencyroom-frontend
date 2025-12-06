# AgencyRoom Frontend (Next.js)

Next.js приложение для CRM-платформы AgencyRoom. Поддерживает админку агентства и клиентский кабинет.

## Быстрый старт

1. Запустите backend (http://localhost:4000):
   ```bash
   cd backend
   npm run start:dev
   ```
2. Запустите frontend:
   ```bash
   npm install
   npm run dev
   ```
   По умолчанию фронт слушает http://localhost:3000 (при занятости порта переключится на 3001).
3. Переменные окружения для фронта:
   - `NEXT_PUBLIC_API_URL` — базовый URL API (по умолчанию http://localhost:4000).

## Маршруты

- Админская зона: текущие страницы `/login`, `/app` (демо/заготовки).
- Клиентский кабинет:
  - `/client/login` — вход для роли client.
  - `/client` — дашборд: фильтры по периоду, сводка, список опубликованных отчетов.
  - `/client/reports/[id]` — детальный просмотр отчета.

## База данных / Prisma
- Каноничная схема и миграции: `backend/prisma/schema.prisma` и `backend/prisma/migrations`.
- Единый сид: `backend/prisma/seed.ts` (создает demo agency, owner `demo@agency.com/password123`, client `client@alpharetail.com/password123`, клиенты/проекты/отчеты).
- Основные команды (из корня):
  - `npm run db:generate`
  - `npm run db:migrate:dev`
  - `npm run db:seed`
  - `npm run db:reset` (reset + seed по одной линии миграций)

## Как проверить клиентский кабинет (demo)

1. Запустите backend и frontend (см. выше).
2. В браузере откройте `/client/login`.
3. Введите демо-доступ:
   - email: `client@alpharetail.com`
   - password: `password123`
4. После входа:
   - произойдет редирект на `/client`,
   - в блоке сводки отобразятся агрегаты из `/client/reports/summary`,
   - в списке будет минимум один опубликованный отчет (из сид-данных).
5. Откройте отчет: перейдите по кнопке «Открыть» → `/client/reports/[id]`, убедитесь, что видны все поля.
6. Попробуйте сменить период через «Период с/по» и кнопку «Применить» — обновятся сводка и список.
7. Кнопка «Выйти» очищает токен и возвращает на `/client/login`.

## Примечания
- Все запросы в клиентской зоне идут к backend API на `NEXT_PUBLIC_API_URL` с Bearer-токеном.
- Клиентская зона доступна только роли `client`; при отсутствии токена или неверной роли происходит редирект на `/client/login`.
