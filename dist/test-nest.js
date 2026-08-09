"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const orders_service_1 = require("./src/modules/orders/orders.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const ordersService = app.get(orders_service_1.OrdersService);
    try {
        const orders = await ordersService.findAll('dummy', 1, 50);
        console.log('Success:', orders);
    }
    catch (error) {
        console.error('Error occurred:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=test-nest.js.map