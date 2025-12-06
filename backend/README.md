# AgencyRoom Backend (NestJS + Prisma)

## Установка
1. `cd backend`
2. `npm install`
3. Создайте файл `.env` по примеру `.env.example` и пропишите `DATABASE_URL`, `JWT_SECRET`, при необходимости `PORT` (по умолчанию 4000).

## Prisma
- Каноничная схема: `prisma/schema.prisma` (здесь в backend), миграции в `prisma/migrations`.
- Основные команды:
  - Генерация клиента: `npm run prisma:generate`
  - Миграции (dev): `npm run prisma:migrate`
  - Reset+seed: `npm run db:reset`
  - Seed (демо-данные: owner demo@agency.com / password123, client client@alpharetail.com / password123): `npm run db:seed`

## Запуск
- Dev: `npm run start:dev` (http://localhost:4000)
- Prod build: `npm run build` + `npm run start:prod`

## Роли
- `owner/manager` — админская часть агентства, полный доступ к своим клиентам/проектам/отчетам.
- `viewer` — чтение (пока не используется явно).
- `client` — пользователь клиента, привязан к одному Client, видит только опубликованные отчеты своего бизнеса.

## Доступные эндпоинты
Все ниже (кроме регистрации/логина и health) требуют JWT Bearer. CRUD в админке защищен ролями `owner`/`manager` и скоупом `agencyId`.

### Auth
- `POST /auth/register-agency` — создать агентство + владельца, вернуть JWT.
- `POST /auth/login` — логин по email/password.
- `GET /auth/me` — профиль текущего пользователя и агентства.

### Clients
- `GET /clients` — список клиентов агентства.
- `POST /clients` — создать клиента.
- `GET /clients/:id` — клиент по id.
- `PATCH /clients/:id` — обновление.

### Projects
- `GET /projects?clientId=` — проекты агентства (опционально фильтр по клиенту).
- `POST /projects` — создать проект.
- `GET /projects/:id` — проект + клиент.
- `PATCH /projects/:id` — обновление.

### Reports
- `GET /reports?projectId=&publishedOnly=&fromPeriod=&toPeriod=&page=&pageSize=` — отчеты по агентству (фильтры + пагинация), возвращает `{ items, page, pageSize, total }`.
- `GET /reports/summary?projectId=&fromPeriod=&toPeriod=&publishedOnly=` — сводка (totalSpend, totalRevenue, totalLeads, avgCpa, avgRoas, countReports).
- `POST /reports` — создать отчет.
- `GET /reports/:id` — отчет + проект/клиент.
- `PATCH /reports/:id` — обновление отчета.
- `POST /reports/:id/publish` — опубликовать отчет (status → published).
- `POST /reports/:id/unpublish` — снять с публикации (status → draft).
- `GET /reports/:id/export?format=pdf|docx` — заглушка экспорта (возвращает JSON с reportId, format, message).

### Client Portal API (для роли `client`)
- Авторизация через обычный `/auth/login` (демо: `client@alpharetail.com` / `password123`).
- `GET /client/reports?fromPeriod=&toPeriod=&page=&pageSize=` — опубликованные отчеты привязанного клиента.
- `GET /client/reports/:id` — один опубликованный отчет.
- `GET /client/reports/summary?fromPeriod=&toPeriod=` — агрегированная сводка по опубликованным отчетам.
*Все ручки требуют JWT и роли `client`, доступ ограничен привязанным clientId.*

### Health
- `GET /health` — простой health-check (без авторизации).

## Seed / Demo
- agency owner: `demo@agency.com` / `password123`
- client user: `client@alpharetail.com` / `password123` (привязан к клиенту Alpha Retail, видит только опубликованные отчеты)

## Примечания
- JWT payload содержит `userId`, `role`, `agencyId`, `clientId`; доступ к сущностям ограничен по `agencyId`, а клиентские ручки — по `clientId`.
- Prisma-схема в `prisma/schema.prisma` расширена полями `passwordHash` (User), `contactPhone` (Client), статусами отчетов и связью user→client для роли `client`.
