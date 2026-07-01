"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const orders_service_1 = require("./src/modules/orders/orders.service");
const client_1 = require("@prisma/client");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const ordersService = app.get(orders_service_1.OrdersService);
    try {
        const updated = await ordersService.updateStatus('3fef8ef3-1649-466f-afc3-981700a5fc19', client_1.OrderStatus.PROCESSING);
        console.log('Update successful:', updated.status);
    }
    catch (error) {
        console.error('Update failed:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=test_update2.js.map