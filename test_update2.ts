import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { OrdersService } from './src/modules/orders/orders.service';
import { OrderStatus } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ordersService = app.get(OrdersService);

  try {
    // Try updating a customer order
    const updated = await ordersService.updateStatus('3fef8ef3-1649-466f-afc3-981700a5fc19', OrderStatus.PROCESSING as any);
    console.log('Update successful:', updated.status);
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await app.close();
  }
}
bootstrap();
