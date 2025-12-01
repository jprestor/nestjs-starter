# Сравнение mockDeep (jest-mock-extended) vs createMock (@golevelup/ts-jest)

## Результаты тестирования

Оба инструмента **СОЗДАЮТ ВЛОЖЕННЫЕ МОКИ** для DatabaseService! ✅

## Ключевые различия

### 1. **jest-mock-extended (mockDeep)**

#### Преимущества:
- ✅ **Строгая типизация**: Предоставляет строгие типы TypeScript
- ✅ **calledWith() matcher**: Дополнительные методы для проверки аргументов вызовов
- ✅ **Более детальный контроль**: Больше возможностей для настройки моков
- ✅ **Специализация**: Создан специально для глубокого мокирования

#### Пример уникальных возможностей:
```typescript
const mock = mockDeep<DatabaseService>();

// Проверка с какими аргументами был вызван метод
mock.user.findMany.calledWith({ where: { id: 1 } }); // уникальная фича!
```

### 2. **@golevelup/ts-jest (createMock)**

#### Преимущества:
- ✅ **Интеграция с NestJS**: Создан специально для NestJS экосистемы
- ✅ **Простой API**: Более простой и интуитивный
- ✅ **Автоматические моки**: Автоматически создает моки для всех свойств
- ✅ **DeepMocked тип**: Предоставляет удобный тип DeepMocked<T>

#### Пример:
```typescript
const mock: DeepMocked<DatabaseService> = createMock<DatabaseService>();

// Простой и понятный API
mock.user.findMany.mockResolvedValue([...]);
```

## Так почему в исходном коде использовались оба?

### Исторический контекст:

1. **@golevelup/ts-jest** - новая библиотека, создана сообществом NestJS
2. **jest-mock-extended** - более старая, зрелая библиотека

### Вероятная причина:

```typescript
// В старых версиях @golevelup/ts-jest могли быть проблемы
// с глубоким мокированием Prisma Client

// Поэтому использовали:
{ provide: DatabaseService, useValue: mockDeep<DatabaseService>() }  // ✅ Надежно

// А для простых сервисов:
{ provide: LoggerService, useValue: createMock<LoggerService>() }    // ✅ Удобно
```

## Текущая рекомендация (2025)

### Вариант 1: Использовать только @golevelup/ts-jest ✅
```typescript
// Плюсы:
// - Одна зависимость вместо двух
// - Лучшая интеграция с NestJS
// - createMock теперь поддерживает глубокое мокирование
// - DeepMocked<T> тип из коробки

const db = createMock<DatabaseService>();
const logger = createMock<LoggerService>();
const cache = createMock<CacheService>();
```

### Вариант 2: Использовать mockDeep для сложных случаев ⚡
```typescript
// Когда нужны специальные возможности jest-mock-extended:
// - calledWith() проверки
// - Более точный контроль над моками
// - Сложные сценарии мокирования

const db = mockDeep<DatabaseService>();
db.user.findMany.calledWith({ where: { id: 1 } }); // уникальная фича
```

## Вывод

**Изначальное использование `mockDeep` для DatabaseService было правильным решением**, потому что:

1. ✅ Гарантировало работу с вложенной структурой Prisma (на момент написания)
2. ✅ Предоставляло дополнительные возможности для тестирования
3. ✅ Было проверенным решением в сообществе

**Сейчас можно использовать `createMock` для всех сервисов**, потому что:

1. ✅ Библиотека @golevelup/ts-jest созрела
2. ✅ Поддерживает глубокое мокирование
3. ✅ Проще в использовании
4. ✅ Меньше зависимостей

## Практический выбор

```typescript
// РЕКОМЕНДУЕТСЯ: Унифицировать на createMock
import { createMock, DeepMocked } from '@golevelup/ts-jest';

// Для всех сервисов (включая DatabaseService):
const db: DeepMocked<DatabaseService> = createMock<DatabaseService>();
const logger: DeepMocked<LoggerService> = createMock<LoggerService>();
const cache: DeepMocked<CacheService> = createMock<CacheService>();

// Преимущества:
// - Единый подход
// - Меньше зависимостей
// - Лучшая интеграция с NestJS
// - DeepMocked<T> тип для всех моков
```
