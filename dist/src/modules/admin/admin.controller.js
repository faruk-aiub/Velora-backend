"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAnalyticsController = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const prisma_service_1 = require("../../database/prisma.service");
let AdminAnalyticsController = class AdminAnalyticsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard() {
        const totalOrders = await this.prisma.order.count();
        const totalCustomers = await this.prisma.user.count({ where: { role: 'CUSTOMER' } });
        const totalProducts = await this.prisma.product.count({ where: { is_active: true } });
        const orders = await this.prisma.order.aggregate({
            _sum: { total_amount: true },
            where: { status: 'DELIVERED' }
        });
        const totalSales = Number(orders._sum.total_amount || 0);
        const ordersList = await this.prisma.order.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: { user: { select: { email: true, profile: { select: { first_name: true, last_name: true } } } } }
        });
        const recentOrders = ordersList.map(order => ({
            id: order.order_number,
            customer: order.user?.profile ? `${order.user.profile.first_name} ${order.user.profile.last_name}` : order.user.email,
            date: order.created_at.toISOString().split('T')[0],
            total: `$${order.total_amount.toString()}`,
            status: order.status
        }));
        return {
            success: true,
            data: {
                totalSales,
                totalOrders,
                totalCustomers,
                totalProducts,
                recentOrders
            }
        };
    }
    async getSalesReport() {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const orders = await this.prisma.order.findMany({
            where: {
                status: 'DELIVERED',
                created_at: { gte: startOfYear }
            },
            select: { total_amount: true, created_at: true }
        });
        const monthlySales = Array(12).fill(0);
        orders.forEach(order => {
            const orderDate = new Date(order.created_at);
            if (orderDate.getFullYear() === currentYear) {
                monthlySales[orderDate.getMonth()] += Number(order.total_amount);
            }
        });
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthly = monthlySales.map((total, index) => ({
            name: months[index],
            total: total
        }));
        return { data: { monthly } };
    }
    async getUserStats() {
        const total = await this.prisma.user.count({ where: { role: 'CUSTOMER' } });
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newThisMonth = await this.prisma.user.count({
            where: {
                role: 'CUSTOMER',
                created_at: { gte: thirtyDaysAgo }
            }
        });
        return { data: { total, newThisMonth } };
    }
    async getAdmins() {
        const admins = await this.prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: {
                id: true,
                email: true,
                role: true,
                is_active: true,
                created_at: true,
                profile: true
            }
        });
        return { data: admins };
    }
    async createAdmin(dto) {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const admin = await this.prisma.user.create({
            data: {
                email: dto.email,
                password_hash: hashedPassword,
                role: 'ADMIN',
                profile: {
                    create: {
                        first_name: dto.first_name,
                        last_name: dto.last_name
                    }
                }
            },
            select: { id: true, email: true, role: true }
        });
        return { message: 'Admin created successfully', data: admin };
    }
};
exports.AdminAnalyticsController = AdminAnalyticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('sales-report'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('user-stats'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getUserStats", null);
__decorate([
    (0, common_1.Get)('admins'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getAdmins", null);
__decorate([
    (0, common_1.Post)('admins'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "createAdmin", null);
exports.AdminAnalyticsController = AdminAnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminAnalyticsController);
//# sourceMappingURL=admin.controller.js.map