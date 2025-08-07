// 导出所有API模块
export * from './auth';
export * from './projects';
export * from './packages';
export * from './users';
export * from './dashboard';
export * from './access-manager.ts';
export * from './shares';

// 为了向后兼容，可以单独导出每个模块
export * as AuthAPI from './auth';
export * as ProjectsAPI from './projects';
export * as PackagesAPI from './packages';
export * as UsersAPI from './users';
export * as DashboardAPI from './dashboard';
export * as ClientAccessAPI from './access-manager.ts';
export * as SharesAPI from './shares';
