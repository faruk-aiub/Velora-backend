import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import slugify from 'slugify';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBrands() {
    return this.prisma.brand.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' }
    });
  }

  async createBrand(dto: CreateBrandDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });

    const existing = await this.prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Brand with this name/slug already exists');
    }

    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        logo_url: dto.logo_url
      }
    });
  }

  async updateBrand(id: string, dto: UpdateBrandDto) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand || brand.deleted_at) throw new NotFoundException('Brand not found');

    let slug = brand.slug;
    if (dto.name && dto.name !== brand.name) {
      slug = slugify(dto.name, { lower: true, strict: true });
      const existing = await this.prisma.brand.findUnique({ where: { slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Brand with this name/slug already exists');
      }
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
        logo_url: dto.logo_url
      }
    });
  }

  async deleteBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand || brand.deleted_at) throw new NotFoundException('Brand not found');

    // Check products connected to brand
    const productCount = await this.prisma.product.count({ where: { brand_id: id, deleted_at: null } });
    if (productCount > 0) {
      throw new ConflictException('Cannot delete a brand with active products');
    }

    return this.prisma.brand.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}
