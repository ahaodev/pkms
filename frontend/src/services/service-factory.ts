import {ReleaseService} from '@/services/interfaces/release-service.interface';
import {DeploymentService} from '@/services/interfaces/deployment-service.interface';
import {DashboardService} from '@/services/interfaces/dashboard-service.interface';
import serviceConfig from '@/config/service-config';

// Mock implementations
import {MockReleaseService} from '@/services/implementations/mock-release.service';
import {MockDeploymentService} from '@/services/implementations/mock-deployment.service';
import {MockDashboardService} from '@/services/implementations/mock-dashboard.service';

// ServiceFactory：统一管理所有 Service 的单例工厂，支持 mock/真实 service 切换
class ServiceFactory {
    // ServiceFactory 单例实例
    private static instance: ServiceFactory;
    // ReleaseService 实例
    private releaseService: ReleaseService | null = null;
    // DeploymentService 实例
    private deploymentService: DeploymentService | null = null;
    // DashboardService 实例
    private dashboardService: DashboardService | null = null;

    // 构造函数私有化，禁止外部实例化
    private constructor() {
    }

    // 获取 ServiceFactory 单例实例
    static getInstance(): ServiceFactory {
        if (!ServiceFactory.instance) {
            ServiceFactory.instance = new ServiceFactory();
        }
        return ServiceFactory.instance;
    }

    // 获取 ReleaseService 实例
    getReleaseService(): ReleaseService {
        if (!this.releaseService) {
            if (serviceConfig.useMockServices) {
                this.releaseService = new MockReleaseService();
            } else {
                // TODO: 实现真实 API service
                // this.releaseService = new ApiReleaseService();
                throw new Error('Real API service not implemented yet. Set VITE_USE_MOCK_SERVICES=true to use mock services.');
            }
        }
        return this.releaseService;
    }

    // 获取 DeploymentService 实例
    getDeploymentService(): DeploymentService {
        if (!this.deploymentService) {
            if (serviceConfig.useMockServices) {
                this.deploymentService = new MockDeploymentService();
            } else {
                // TODO: 实现真实 API service
                // this.deploymentService = new ApiDeploymentService();
                throw new Error('Real API service not implemented yet. Set VITE_USE_MOCK_SERVICES=true to use mock services.');
            }
        }
        return this.deploymentService;
    }

    // 获取 DashboardService 实例
    getDashboardService(): DashboardService {
        if (!this.dashboardService) {
            if (serviceConfig.useMockServices) {
                this.dashboardService = new MockDashboardService();
            } else {
                // TODO: 实现真实 API service
                // this.dashboardService = new ApiDashboardService();
                throw new Error('Real API service not implemented yet. Set VITE_USE_MOCK_SERVICES=true to use mock services.');
            }
        }
        return this.dashboardService;
    }

    // 切换为真实服务（后续可扩展）
    enableRealServices(): void {
        this.releaseService = null;
        this.deploymentService = null;
        this.dashboardService = null;
        // 更新配置
        serviceConfig.useMockServices = false;
    }

    // 启用 mock 服务
    enableMockServices(): void {
        this.releaseService = null;
        this.deploymentService = null;
        this.dashboardService = null;
        // 更新配置
        serviceConfig.useMockServices = true;
    }

    // 重置所有 service 实例（测试用）
    resetServices(): void {
        this.releaseService = null;
        this.deploymentService = null;
        this.dashboardService = null;
    }

    // 获取当前配置
    getConfig() {
        return serviceConfig;
    }
}

// 默认导出 ServiceFactory 类
export default ServiceFactory;
// 直接导出工厂单例，便于全局调用
export const serviceFactory = ServiceFactory.getInstance();
