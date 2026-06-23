import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  
  @Get()
  async getCategories() {
    const categories = await this.categoriesService.getCategories();
    return { data: categories };
  }

  @Get('tree')
  async getCategoryTree() {
    const tree = await this.categoriesService.getCategoryTree();
    return { data: tree }; 
  }

  // --- ADMIN APIs ---

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createCategory(@Body() createDto: CreateCategoryDto) {
    const category = await this.categoriesService.createCategory(createDto);
    return { message: 'Category created', data: category };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateCategory(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto) {
    const category = await this.categoriesService.updateCategory(id, updateDto);
    return { message: 'Category updated', data: category };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteCategory(@Param('id') id: string) {
    await this.categoriesService.deleteCategory(id);
    return { message: 'Category deleted (soft)' };
  }
}
