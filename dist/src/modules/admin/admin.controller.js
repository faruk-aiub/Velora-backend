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
    dashboardCache = { data: null, timestamp: 0 };
    salesReportCache = { data: null, timestamp: 0 };
    userStatsCache = { data: null, timestamp: 0 };
    CACHE_TTL = 10000;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard() {
        const now = Date.now();
        if (this.dashboardCache.data && (now - this.dashboardCache.timestamp < this.CACHE_TTL)) {
            return this.dashboardCache.data;
        }
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
            total: `৳${order.total_amount.toString()}`,
            status: order.status
        }));
        const topProductsRaw = await this.prisma.$queryRaw `
      SELECT product_name, SUM(quantity) as total_sales, MAX(price) as max_price
      FROM "OrderItem"
      GROUP BY product_name
      ORDER BY total_sales DESC
      LIMIT 5
    `;
        const topProducts = topProductsRaw.map(p => ({
            name: p.product_name,
            sales: Number(p.total_sales || 0),
            price: `৳${Number(p.max_price || 0)}`
        }));
        const result = {
            success: true,
            data: {
                totalSales,
                totalOrders,
                totalCustomers,
                totalProducts,
                recentOrders,
                topProducts
            }
        };
        this.dashboardCache = { data: result, timestamp: now };
        return result;
    }
    async getSalesReport() {
        const now = Date.now();
        if (this.salesReportCache.data && (now - this.salesReportCache.timestamp < this.CACHE_TTL)) {
            return this.salesReportCache.data;
        }
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
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const weeklyOrders = await this.prisma.order.findMany({
            where: {
                status: 'DELIVERED',
                created_at: { gte: sevenDaysAgo }
            },
            select: { total_amount: true, created_at: true }
        });
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyRevenueMap = new Map();
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            weeklyRevenueMap.set(days[d.getDay()], 0);
        }
        weeklyOrders.forEach(order => {
            const orderDate = new Date(order.created_at);
            const dayName = days[orderDate.getDay()];
            if (weeklyRevenueMap.has(dayName)) {
                weeklyRevenueMap.set(dayName, weeklyRevenueMap.get(dayName) + Number(order.total_amount));
            }
        });
        const weekly = Array.from(weeklyRevenueMap, ([name, revenue]) => ({ name, revenue }));
        const result = { data: { monthly, weekly } };
        this.salesReportCache = { data: result, timestamp: now };
        return result;
    }
    async getUserStats() {
        const now = Date.now();
        if (this.userStatsCache.data && (now - this.userStatsCache.timestamp < this.CACHE_TTL)) {
            return this.userStatsCache.data;
        }
        const total = await this.prisma.user.count({ where: { role: 'CUSTOMER' } });
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newThisMonth = await this.prisma.user.count({
            where: {
                role: 'CUSTOMER',
                created_at: { gte: thirtyDaysAgo }
            }
        });
        const result = { data: { total, newThisMonth } };
        this.userStatsCache = { data: result, timestamp: now };
        return result;
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
        const hashedPassword = await bcrypt.hash(dto.password, 8);
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
    async updateAdminStatus(id, dto) {
        const admin = await this.prisma.user.update({
            where: { id },
            data: { is_active: dto.is_active },
            select: { id: true, email: true, is_active: true }
        });
        return { message: 'Admin status updated successfully', data: admin };
    }
    async deleteAdmin(id) {
        try {
            await this.prisma.review.deleteMany({
                where: { user_id: id }
            });
            const userAddresses = await this.prisma.userAddress.findMany({ where: { user_id: id } });
            const addressIds = userAddresses.map(a => a.id);
            await this.prisma.order.deleteMany({
                where: {
                    OR: [
                        { user_id: id },
                        { shipping_address_id: { in: addressIds } }
                    ]
                }
            });
            await this.prisma.userProfile.deleteMany({
                where: { user_id: id }
            });
            await this.prisma.user.delete({
                where: { id }
            });
            return { message: 'Admin deleted successfully' };
        }
        catch (error) {
            console.error(error);
            require('fs').writeFileSync('delete_error.log', error.stack || error.message);
            throw new Error(error.message || 'Deletion failed');
        }
    }
};
exports.AdminAnalyticsController = AdminAnalyticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('sales-report'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('user-stats'),
    openapi.ApiResponse({ status: 200, type: Object }),
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
__decorate([
    (0, common_1.Patch)('admins/:id/status'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "updateAdminStatus", null);
__decorate([
    (0, common_1.Delete)('admins/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminAnalyticsController.prototype, "deleteAdmin", null);
exports.AdminAnalyticsController = AdminAnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminAnalyticsController);
//# sourceMappingURL=admin.controller.js.map