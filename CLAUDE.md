# Инструкции для React проекта (Modern Stack)

Этот файл определяет стандарты разработки для современного React-приложения.

## Основной стек
- **Framework**: Next.js (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand (для клиента), React Server Components + URL (для сервера)
- **Data Fetching**: Server Actions + TanStack Query (для сложных клиентских сценариев)
- **Validation**: Zod (для форм и API)

## Команды разработки
- Установка: `pnpm install`
- Запуск dev-сервера: `pnpm dev`
- Сборка: `pnpm build`
- Линтинг и форматирование: `pnpm lint` / `pnpm format`
- Добавление компонентов shadcn: `pnpm dlx shadcn-ui@latest add [component]`

## Тестирование
- Unit/Integration: `pnpm vitest`
- E2E: `pnpm playwright test`
- Проверка типов: `pnpm typecheck`

## Кодинг-стандарты и паттерны

### 1. Архитектура компонентов
- **Server First**: По умолчанию создавай Server Components. Используй `'use client'` только для интерактивности (hooks, event listeners).
- **Структура**: Папка `components/` делится на `ui/` (атомарные из shadcn), `shared/` (общие) и `features/` (бизнес-логика).
- **Server Actions**: Выноси логику мутаций в `src/app/actions.ts` или файлы `.actions.ts` внутри фичей.

### 2. TypeScript и типизация
- Используй `interface` для объектов, `type` для объединений (unions).
- Обязательно типизируй пропсы компонентов: `interface Props { ... }`.
- Избегай `any`. Используй `unknown` и Zod для валидации внешних данных.

### 3. Производительность и рендеринг
- Используй `next/image` для оптимизации изображений.
- Применяй паттерн "Streaming с Suspense" для медленных запросов данных.
- Используй `lucide-react` для иконок (импортируй конкретные иконки для tree-shaking).

### 4. Стилизация (Tailwind)
- Следуй порядку классов: Layout -> Box Sizing -> Typography -> Visual -> Misc.
- Используй библиотеку `clsx` и `tailwind-merge` (функция `cn()`) для условных стилей.

### 5. Обработка форм
- Используй `react-hook-form` в связке с `zod` для валидации на стороне клиента и сервера.

## Правила работы с Git
- Формат коммитов: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- Перед пушем обязательно запускай `pnpm typecheck`.