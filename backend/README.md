# AgencyRoom Backend (NestJS + Prisma)

## Установка
1. `cd backend`
2. `npm install`
3. Создайте файл `.env` по примеру `.env.example` и пропишите `DATABASE_URL`, `JWT_SECRET`, при необходимости `PORT` (по умолчанию 4000).

## Prisma
- Генерация клиента: `npm run prisma:generate`
- Миграции: `npm run prisma:migrate`
- Seed (демо-данные, владелец demo@agency.com / password123): `npx prisma db seed`

## Запуск
- Dev: `npm run start:dev` (http://localhost:4000)
- Prod build: `npm run build` + `npm run start:prod`

## Доступные эндпоинты
Все ниже (кроме регистрации/логина) требуют JWT Bearer и ролей `owner`/`manager`. Данные фильтруются по `agencyId` из токена.

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
- `GET /reports?projectId=` — отчеты по агентству (опционально фильтр по проекту).
- `POST /reports` — создать отчет.
- `GET /reports/:id` — отчет + проект/клиент.
- `PATCH /reports/:id` — обновление отчета.

## Примечания
- JWT payload содержит `userId`, `role`, `agencyId`; доступ к клиентам/проектам/отчетам ограничен `agencyId`.
- Prisma-схема в `prisma/schema.prisma` совпадает с фронтом, добавлены поля `passwordHash` (User) и `contactPhone` (Client) для авторизации/контактов.
