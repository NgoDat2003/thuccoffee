# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Tham chiếu chi tiết**: Xem file [`.agent/GUIDELINES.md`](./.agent/GUIDELINES.md) và [`.agent/projectRules/`](./.agent/projectRules/) để biết đầy đủ patterns, code samples, và checklists.

---

## Project Overview

| Property | Value |
|----------|-------|
| **Architecture** | Monorepo với Turborepo |
| **Package Manager** | pnpm 10.30.2 |
| **Node Version** | >= 18 |

### Apps Structure

```
.
├── apps/
│   ├── react-frontend/      # React 19 + Vite SPA (Port 3000)
│   └── nestjs-backend/      # NestJS 11 REST API (Port 4000)
├── packages/
│   ├── openapi/             # Shared DTOs & Types (BẮT BUỘC)
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # ESLint configurations
│   ├── typescript-config/   # TypeScript configurations
│   └── jest-config/         # Jest configurations
└── docker/                  # Docker configurations
```

---

## Tech Stack

### Frontend (`apps/react-frontend`)

| Category | Technology |
|----------|------------|
| Core | **React 19** + **Vite 7** |
| Routing | **TanStack Router** |
| Data Fetching | **TanStack Query 5** |
| State | **Zustand 5** |
| Forms | **react-hook-form + Zod** |
| HTTP | **Axios** |
| Styling | **Tailwind CSS 4** (CSS variables for dark/light mode) |
| UI | **shadcn/ui** + **HeroUI** + **Radix UI** |
| Tables | **TanStack Table** |
| i18n | **react-i18next** (Vietnamese default + English) |
| Animations | **Framer Motion** |
| Toast | **Sonner** |
| Testing | **Vitest** + **@testing-library/react** |

### Backend (`apps/nestjs-backend`)

| Category | Technology |
|----------|------------|
| Framework | **NestJS 11** |
| Database | **PostgreSQL + Prisma 7** (multi-schema: `warehouse_db`) |
| Cache | **Redis (cache-manager)** |
| Auth | **JWT + Passport** (global `APP_GUARD`, `@Permissions()`, `@Public()` decorators) |
| Validation | **class-validator** |
| API Docs | **Swagger** (`http://localhost:4000/api/docs`, dev only) |
| File Storage | **MinIO** (Attachment model with JSON file paths) |
| Logging | **nestjs-pino** |
| Testing | **Jest** + **ts-jest** |

---

## CRITICAL: Shared DTOs Architecture

> [!CAUTION]
> **BẮT BUỘC**: Tất cả DTOs và types PHẢI import từ `@warehouse-system/openapi`. KHÔNG được định nghĩa inline hoặc local.

```typescript
// Frontend
import type { CreateWarehouseDto, WarehouseResponseDto } from '@warehouse-system/openapi';

// Backend
import { CreateWarehouseDto, UpdateWarehouseDto } from '@warehouse-system/openapi';
```

After creating/modifying DTOs, rebuild: `pnpm --filter=@warehouse-system/openapi build`

### DTO Location Pattern

```
packages/openapi/src/{feature}/
├── create-{entity}.dto.ts
├── update-{entity}.dto.ts
├── get-{entities}.dto.ts
├── {entity}-response.dto.ts
└── index.ts    # Re-export all, then export from packages/openapi/src/index.ts
```

---

## Feature Module Structure

### Frontend Feature

```
features/{feature-name}/
├── components/     # Feature-specific components
│   ├── {feature}-form.tsx
│   ├── {feature}-table.tsx
│   └── {feature}-dialog.tsx
└── hooks/          # Feature-specific hooks (optional)
    └── use-{feature}.ts
```

### Backend Feature

```
features/{feature-name}/
├── {feature}.module.ts
├── {feature}.controller.ts
└── {feature}.service.ts
# NO dto/ folder - use @warehouse-system/openapi
```

---

## Frontend Patterns

### i18n (Internationalization)

All user-facing text MUST use `react-i18next`. See `.agent/projectRules/i18n.md` for full guide.

```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation('feature-namespace');
// Usage: t('key')
```

### Dark/Light Mode

Tailwind CSS 4 with CSS variables. Hardcoded colors are forbidden. Use semantic classes. See `.agent/projectRules/theme.md`.

### shadcn/ui Components

Add new components: `pnpx shadcn@latest add <component>`. Located in `src/components/ui/`.

### Form Pattern (react-hook-form + Zod)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateEntityDto } from '@warehouse-system/openapi';

const formSchema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
});
type FormData = z.infer<typeof formSchema>;

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: '', email: '' },
});

const onSubmit = (data: FormData) => {
  const dto: CreateEntityDto = { ...data };
  mutation.mutate(dto);
};
```

### TanStack Query Pattern

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';  // from constants/common.ts
import { entityApi } from '@/services/api/entities.api';
import { toast } from 'sonner';

export function useEntities(params?: GetEntitiesDto) {
  return useQuery({
    queryKey: [QUERY_KEYS.ENTITIES, params],
    queryFn: () => entityApi.getAll(params),
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: entityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENTITIES] });
      toast.success('Tạo thành công');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
```

### API Service Pattern

```typescript
import { api } from '@/lib/axios';
import { API_VERSION } from '@/constants';
import type { EntityResponseDto, CreateEntityDto } from '@warehouse-system/openapi';

export const entityApi = {
  getAll: async (params?) => {
    const response = await api.get(`api/${API_VERSION}/entities`, { params });
    return response.data;
  },
  create: async (data: CreateEntityDto): Promise<EntityResponseDto> => {
    const response = await api.post(`api/${API_VERSION}/entities`, data);
    return response.data;
  },
};
```

---

## Backend Patterns

### Auth & Permissions

Auth is handled globally via `APP_GUARD` (JwtAuthGuard + AuthorizationGuard) — no need for `@UseGuards()` on controllers.

- `@Public()` — skip auth for public routes (login, health check)
- `@Permissions('resource:action')` — require specific permission (e.g., `'warehouse:create'`, `'warehouse-zone:delete'`)

### Controller Pattern

```typescript
import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../../authorization/decorators/permissions.decorator';
import { CreateEntityDto, GetEntitiesDto } from '@warehouse-system/openapi';

@ApiTags('Entities')
@ApiBearerAuth()
@Controller('entities')
export class EntitiesController {
  constructor(private readonly service: EntitiesService) {}

  @Post()
  @Permissions('entity:create')
  @ApiOperation({ summary: 'Create entity' })
  async create(@Body() dto: CreateEntityDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: GetEntitiesDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
```

### Service Pattern

```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { I18nHelperService } from '../../common/services/i18n-helper.service';

@Injectable()
export class EntitiesService {
  private readonly logger = new Logger(EntitiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nHelperService,
  ) {}

  async findAll(query: GetEntitiesDto, lang: string = 'en') {
    const { limit = 10, offset = 0, search } = query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.entity.findMany({ where, take: limit, skip: offset }),
      this.prisma.entity.count({ where }),
    ]);
    return { data, meta: { total, limit, offset, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number, lang: string = 'en') {
    const entity = await this.prisma.entity.findUnique({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        this.i18n.translateError('entity.not_found', { lang, args: { id } })
      );
    }
    return entity;
  }
}
```

### Backend i18n (Error Messages)

Services use `I18nHelperService` for translated error messages. Translation files are in `apps/nestjs-backend/src/i18n/{en,vi}/errors.json`.

```typescript
// Translate error: looks up "errors.entity.not_found" in i18n JSON
this.i18n.translateError('entity.not_found', { lang, args: { id } })
```

### Prisma Notes

- All models use `@@schema("warehouse_db")`
- Schema is split into modular files: `prisma/schema/{feature}.prisma` (warehouse, inventory, product, etc.)
- Decimal fields use `@db.Decimal(15,2)` — use `Prisma.Decimal` for math
- Quantities stored as `Decimal`, not `Float`
- `WarehouseLocation` → `WarehouseZone` uses `onDelete: Cascade`

### ValidationPipe (Global)

`whitelist: true` and `forbidNonWhitelisted: true` are set globally in `main.ts`. This means:
- Properties not in the DTO are **stripped** (whitelist)
- Extra properties cause **400 error** (forbidNonWhitelisted)
- When using `UpdateDto` (partial), do NOT send fields not defined in the DTO

---

## API Response Format

```typescript
// Success
{ statusCode: 200, data: T | T[], message?: string, meta?: { offset, limit, total, totalPages } }

// Error
{ statusCode: number, message: string, error: string }
```

---

## Development Commands

```bash
# Install
pnpm install

# Dev all apps
pnpm dev

# Dev frontend only (port 3000)
pnpm dev:fe

# Dev backend only (port 4000)
pnpm dev:be

# Build
pnpm build

# Lint & Format
pnpm lint
pnpm format

# Type check frontend
pnpm --filter=react-frontend check-types

# Tests
pnpm test                                    # All tests
pnpm --filter=react-frontend test            # Frontend (Vitest)
pnpm --filter=nestjs-backend test            # Backend (Jest)
pnpm --filter=nestjs-backend test:e2e        # Backend E2E

# Prisma
pnpm --filter=nestjs-backend prisma:generate       # Regenerate Prisma client
pnpm --filter=nestjs-backend prisma:studio         # Open Prisma Studio GUI
pnpm --filter=nestjs-backend prisma:seed           # Seed (admin/Admin@123)

# Database Migrations
pnpm --filter=nestjs-backend migrate:new <name>    # Create new migration (dev)
pnpm --filter=nestjs-backend migrate:up            # Apply migrations (deploy)
pnpm --filter=nestjs-backend migrate:down          # Rollback migration
pnpm --filter=nestjs-backend migrate:status        # Check migration status

# Build shared DTOs after changes
pnpm --filter=@warehouse-system/openapi build
```

---

## New Feature Checklist

### Frontend
- [ ] Components trong `features/{name}/components/`
- [ ] Hooks nếu cần trong `features/{name}/hooks/`
- [ ] API service trong `services/api/`
- [ ] Routes trong `routes/_authenticated/`
- [ ] Import types từ `@warehouse-system/openapi`
- [ ] All user-facing text uses i18n (`useTranslation`)
- [ ] Supports dark/light mode (semantic Tailwind classes only)

### Backend
- [ ] Module trong `features/{name}/`
- [ ] DTOs trong `packages/openapi/src/{name}/`
- [ ] Export DTOs trong `packages/openapi/src/index.ts`
- [ ] Rebuild: `pnpm --filter=@warehouse-system/openapi build`

---

## Common Mistakes to Avoid

| Category | Don't | Do |
|----------|-------|-----|
| **Types** | Inline types, `any` | Import từ `@warehouse-system/openapi` |
| **State** | Mix Zustand + React Query cho cùng data | Zustand cho UI state, Query cho server state |
| **API** | Hard-code URLs | Dùng constants `API_VERSION` |
| **Forms** | useState cho form | react-hook-form + Zod |
| **Cache** | Quên invalidate | `queryClient.invalidateQueries()` sau mutation |
| **Files** | PascalCase components | kebab-case: `user-profile.tsx` |
| **Backend** | Business logic trong controller | Đặt trong service |
| **Backend** | Local DTOs | Dùng `@warehouse-system/openapi` |
| **Backend** | `@UseGuards(JwtAuthGuard)` | Auth is global; use `@Permissions()` or `@Public()` |
| **Backend** | Send extra fields in Update DTO | Only send fields defined in `UpdateDto` (forbidNonWhitelisted) |
| **Colors** | Hardcoded hex/rgb | Semantic Tailwind CSS variables |
| **Text** | Hardcoded Vietnamese/English | `t('key')` via react-i18next |

---

## References

- **Chi tiết patterns**: [`.agent/GUIDELINES.md`](./.agent/GUIDELINES.md)
- **Project rules by topic**: [`.agent/projectRules/`](./.agent/projectRules/) (backend, frontend, shared, database, i18n, theme)
- **API Docs**: `http://localhost:4000/api/docs` (Swagger, dev only)
- **Prisma Studio**: `pnpm --filter=nestjs-backend prisma:studio`
