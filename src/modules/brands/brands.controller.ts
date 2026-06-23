import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';

@ApiTags('Brands')
@ApiBearerAuth()
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async getBrands() {
    const brands = await this.brandsService.getBrands();
    return { data: brands };
  }

  // --- ADMIN APIs ---

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createBrand(@Body() createDto: CreateBrandDto) {
    const brand = await this.brandsService.createBrand(createDto);
    return { message: 'Brand created', data: brand };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateBrand(@Param('id') id: string, @Body() updateDto: UpdateBrandDto) {
    const brand = await this.brandsService.updateBrand(id, updateDto);
    return { message: 'Brand updated', data: brand };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteBrand(@Param('id') id: string) {
    await this.brandsService.deleteBrand(id);
    return { message: 'Brand deleted (soft)' };
  }
}
