import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, UpdateVariantDto, CreateImageDto } from './dto/products.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category_id') categoryId?: string,
    @Query('brand_id') brandId?: string,
    @Query('min_price') minPrice?: number,
    @Query('max_price') maxPrice?: number,
    @Query('sort') sort?: string,
    @Query('q') q?: string,
  ) {
    return this.productsService.findAll(
      page ? Number(page) : 1, 
      limit ? Number(limit) : 10, 
      categoryId, 
      brandId, 
      minPrice ? Number(minPrice) : undefined, 
      maxPrice ? Number(maxPrice) : undefined,
      sort,
      q
    );
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const product = await this.productsService.findOneBySlug(slug);
    return { data: product };
  }

  // --- ADMIN ROUTES ---

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN') // TEMPORARILY DISABLED FOR TESTING
  async create(@Body() createDto: CreateProductDto) {
    const product = await this.productsService.create(createDto);
    return { message: 'Product created', data: product };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
    const product = await this.productsService.update(id, updateDto);
    return { message: 'Product updated', data: product };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async delete(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { message: 'Product deleted' };
  }

  // --- VARIANTS ---

  @Post(':id/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async addVariant(@Param('id') id: string, @Body() variantDto: CreateVariantDto) {
    const variant = await this.productsService.addVariant(id, variantDto);
    return { message: 'Variant added', data: variant };
  }

  @Put('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateVariant(@Param('id') id: string, @Body() variantDto: UpdateVariantDto) {
    const variant = await this.productsService.updateVariant(id, variantDto);
    return { message: 'Variant updated', data: variant };
  }

  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async removeVariant(@Param('id') id: string) {
    await this.productsService.removeVariant(id);
    return { message: 'Variant removed' };
  }

  // --- IMAGES ---

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async addImage(@Param('id') id: string, @Body() imageDto: CreateImageDto) {
    const image = await this.productsService.addImage(id, imageDto);
    return { message: 'Image added', data: image };
  }

  @Delete('images/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async removeImage(@Param('id') id: string) {
    await this.productsService.removeImage(id);
    return { message: 'Image removed' };
  }
}
