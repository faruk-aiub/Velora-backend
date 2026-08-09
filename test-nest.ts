import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { OrdersService } from './src/modules/orders/orders.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ordersService = app.get(OrdersService);
  try {
    const orders = await ordersService.findAll('dummy', 1, 50);
    console.log('Success:', orders);
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await app.close();
  }
}
bootstrap();
