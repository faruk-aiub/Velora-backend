"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const mail_module_1 = require("./modules/mail/mail.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const products_module_1 = require("./modules/products/products.module");
const categories_module_1 = require("./modules/categories/categories.module");
const brands_module_1 = require("./modules/brands/brands.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const cart_module_1 = require("./modules/cart/cart.module");
const wishlist_module_1 = require("./modules/wishlist/wishlist.module");
const orders_module_1 = require("./modules/orders/orders.module");
const payments_module_1 = require("./modules/payments/payments.module");
const coupons_module_1 = require("./modules/coupons/coupons.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const cms_module_1 = require("./modules/cms/cms.module");
const audit_module_1 = require("./modules/audit/audit.module");
const config_module_1 = require("./modules/config/config.module");
const upload_module_1 = require("./modules/upload/upload.module");
const prisma_module_1 = require("./database/prisma.module");
const admin_module_1 = require("./modules/admin/admin.module");
const redis_module_1 = require("./infrastructure/redis/redis.module");
const contact_module_1 = require("./modules/contact/contact.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 60,
                }]),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            admin_module_1.AdminModule,
            auth_module_1.AuthModule, mail_module_1.MailModule, users_module_1.UsersModule, products_module_1.ProductsModule, categories_module_1.CategoriesModule, brands_module_1.BrandsModule, inventory_module_1.InventoryModule, cart_module_1.CartModule, wishlist_module_1.WishlistModule, orders_module_1.OrdersModule, payments_module_1.PaymentsModule, coupons_module_1.CouponsModule, reviews_module_1.ReviewsModule, notifications_module_1.NotificationsModule, cms_module_1.CmsModule, audit_module_1.AuditModule, config_module_1.AppConfigModule, upload_module_1.UploadModule, contact_module_1.ContactModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            }
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map