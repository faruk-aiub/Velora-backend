import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateStockDto } from './dto/inventory.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('low-stock')
  async getLowStock(@Query('threshold') threshold?: number) {
    const data = await this.inventoryService.getLowStockVariants(threshold ? Number(threshold) : 5);
    return { data };
  }

  @Get('all')
  async getAllInventory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') q?: string,
  ) {
    return this.inventoryService.getAllInventory(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      q
    );
  }

  @Post(':variantId/increment')
  async incrementStock(@Param('variantId') variantId: string, @Body() dto: UpdateStockDto) {
    const inventory = await this.inventoryService.incrementStock(variantId, dto.amount);
    return { message: 'Stock incremented', data: inventory };
  }

  @Post(':variantId/decrement')
  async decrementStock(@Param('variantId') variantId: string, @Body() dto: UpdateStockDto) {
    const inventory = await this.inventoryService.decrementStock(variantId, dto.amount);
    return { message: 'Stock decremented', data: inventory };
  }
}
