# TAS - Training Application System

培训报名系统，基于 **SvelteKit 2 + Svelte 5 (Runes) + Tailwind CSS v4 + Vitest** 实现。

> 包含完整的 mock 数据方案，开发者无需依赖后端服务即可独立完成端到端调试。

## 环境要求

- Node.js ≥ 20
- pnpm ≥ 9

## 快速开始

```sh
pnpm install
pnpm dev          # 启动开发服务（默认 5173 端口，被占用则递增）
```

浏览器访问 [http://localhost:5173](http://localhost:5173) 即可。

## 项目结构

```
tas-app/
├── src/
│   ├── lib/
│   │   ├── types/      # 共享类型契约（mock 与未来真实 API 共用）
│   │   ├── schemas/    # 动态表单 schema 定义
│   │   └── mock/       # Mock 数据层（详见下节）
│   └── routes/
│       ├── api/        # RESTful 端点
│       └── ...
└── ...
```

## Mock 数据方案

### 设计目标

- **SvelteKit 原生**：通过 `+server.ts` 暴露 mock 接口，未来切换为真实后端时无需改动前端调用层
- **类型安全**：mock 与真实 API 共用 `src/lib/types/` 下的类型契约
- **环境隔离**：开发环境自动启用，生产环境自动关闭
- **状态联动**：进程内内存数据库，支持报名后容量递减、状态变化等业务验证

### 目录结构

```
src/lib/mock/
├── index.ts                    # 统一导出
├── config.ts                   # MOCK_ENABLED 环境开关
├── store/                      # 内存数据库
│   ├── users.store.ts          # 预生成 5 个用户
│   ├── courses.store.ts        # 预生成 ~30 门课程
│   ├── locations.store.ts      # 课程地点（含 P2 CAS 锁）
│   └── applications.store.ts   # 申请记录
├── generators/                 # mockjs 数据模板
├── handlers/                   # 业务逻辑（与路由解耦）
├── auth/
│   ├── current-user.ts         # x-mock-user 头解析
│   └── guard.ts                # requireUser / optionalUser
└── utils/                      # logger / pagination / response
```

### 环境开关

| 环境 | MOCK 状态 | 控制方式 |
|---|---|---|
| `pnpm dev` | **启用** | 默认 |
| `pnpm build` + `pnpm preview` | **关闭** | 默认 |
| 任意环境强制启用 | 启用 | 设置 `MOCK_FORCE=true` |
| 任意环境显式关闭 | 关闭 | 设置 `MOCK_ENABLED=false` |

关闭时所有 mock 路由返回 404，前端会回落到真实接口（待对接）。

### 身份机制

通过 `x-mock-user: user-001` HTTP 头切换当前用户，未传头视为访客。

- `GET /api/auth/me` 返回当前用户或 `{ user: null, isGuest: true }`
- `GET /api/users` 列出可切换的 5 个 mock 用户
- 受保护接口（申请/统计）需登录，否则 401

### API 端点速查

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| GET | `/api/courses` | 公开 | 课程列表（分页/搜索/筛选） |
| GET | `/api/courses/:id` | 公开 | 课程详情 |
| GET | `/api/locations?courseId=` | 公开 | 课程关联地点 |
| GET | `/api/schemas/:category` | 公开 | 动态表单 schema |
| GET | `/api/users` | 公开 | 可切换用户列表 |
| GET | `/api/auth/me` | 公开 | 当前用户信息 |
| GET | `/api/applications` | 必填 | 我的申请 |
| POST | `/api/applications` | 必填 | 提交报名 |
| GET | `/api/applications/:id` | 必填+归属 | 申请详情 |
| PUT | `/api/applications/:id` | 必填+归属+锁定 | 修改 |
| DELETE | `/api/applications/:id` | 必填+归属 | 撤销 |
| GET | `/api/stats` | 公开 | 统计报表 |

### 调试示例

```sh
# 浏览课程（按热度降序，包含未过期课程）
curl http://localhost:5173/api/courses?type=offline

# 模拟 user-001 提交报名
curl -X POST http://localhost:5173/api/applications \
  -H "x-mock-user: user-001" \
  -H "content-type: application/json" \
  -d '{ "courseId": 1001, ... }'

# 验证并发报名触发地点容量 CAS 锁
# （后端 locationStore.tryEnroll 已支持带延迟的并发冲突处理，若 expectedEnrolled 过期将返回 409 cas_conflict）


# 切换到 user-002 查询自己的申请
curl -H "x-mock-user: user-002" http://localhost:5173/api/applications

# 未登录访问受保护接口
curl http://localhost:5173/api/applications   # → 401
```

控制台日志统一前缀 `[MOCK]`，例如：

```
[MOCK] 12:34:56 GET /api/courses?page=1&pageSize=10 → 200 (2ms) total=30
[MOCK] 12:34:58 GET /api/applications → 401 (1ms)
```

### 新增一个 mock 接口的标准流程

1. **类型契约**：在 `src/lib/types/` 新增或扩展类型
2. **store 层**：在 `src/lib/mock/store/` 添加数据访问（必要时继承 `Map` + `Promise` 链式锁实现 CAS）
3. **generator（可选）**：在 `src/lib/mock/generators/` 编写 mockjs 模板用于冷启动种子化
4. **handler**：在 `src/lib/mock/handlers/` 实现业务逻辑，handler 是纯函数，便于单测
5. **路由**：在 `src/routes/api/...` 新增 `+server.ts`，仅做参数解析与环境判定，调用 handler 后通过 `ok()` 包装返回
6. **README 更新**：在端点速查表中登记新接口与鉴权要求

### 注意事项

- **内存数据生命周期**：mock 数据存储在 Node 进程内，`pnpm dev` 重启即清空
- **禁止从 .svelte 文件 import `$lib/mock`**：mockjs 是 Node-only 库，会导致客户端构建失败。所有 mock 导入必须只出现在 `+server.ts` 或 `*.server.ts` 文件中
- **mock 路由与未来真实 API 共用同一 URL 前缀**（`/api/*`），前端代码无需特判环境

## 开发脚本

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 启动开发服务（自动启用 mock） |
| `pnpm build` | 生产构建 |
| `pnpm preview` | 预览生产构建（默认禁用 mock） |
| `pnpm check` | svelte-check 类型检查 |
| `pnpm test` | 运行 Vitest 单元测试 |
| `pnpm lint` | Prettier + ESLint 检查 |
| `pnpm format` | Prettier 格式化 |

## 技术栈

- **SvelteKit 2** + **Svelte 5**（Runes 模式）
- **TypeScript**（strict 模式）
- **Tailwind CSS v4** + `@tailwindcss/forms`
- **Vitest 4**（client / server 双 project）
- **Apache ECharts**（数据可视化）
- **mockjs**（mock 数据生成）

## 部署

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

当前使用 `@sveltejs/adapter-auto`，根据部署平台自动选择。如需生产环境启用 mock 调试，请设置 `MOCK_FORCE=true`。
