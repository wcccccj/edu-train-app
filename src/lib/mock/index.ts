/**
 * Mock 数据层统一导出
 * 仅供 +server.ts / *.server.ts 引用；禁止 .svelte 文件直接 import
 */
export { isMockEnabled, MOCK_ENABLED } from './config';
export { logRequest, logWarn, logError } from './utils/logger';
export { paginate, normalizePage, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from './utils/pagination';
export { ok, fail } from './utils/response';
export { userStore } from './store/users.store';
export { courseStore } from './store/courses.store';
export { applicationStore } from './store/applications.store';
export { locationStore } from './store/locations.store';
export { getCurrentUser, MOCK_USER_HEADER } from './auth/current-user';
export { requireUser, optionalUser } from './auth/guard';
export { listCourses, getCourse } from './handlers/course.handler';
export { listApplications, getApplication, createApplication, updateApplication, deleteApplication } from './handlers/application.handler';
export { getSchema, registerSchema } from './handlers/schema.handler';
export { getStatsOverview } from './handlers/stats.handler';
