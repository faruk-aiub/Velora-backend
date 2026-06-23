import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategoryTree() {
    // Fetch categories up to 3 levels deep (Root -> Child -> Grandchild)
    return this.prisma.category.findMany({
      where: { parent_id: null, deleted_at: null },
      include: {
        children: {
          where: { deleted_at: null },
          include: {
            children: {
              where: { deleted_at: null }
            }
          }
        }
      }
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      where: { deleted_at: null }
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });

    // Check slug collision
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Category with this name/slug already exists');
    }

    // Verify parent if provided
    if (dto.parent_id) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parent_id } });
      if (!parent || parent.deleted_at) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        parent_id: dto.parent_id,
        image_url: dto.image_url
      }
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category || category.deleted_at) throw new NotFoundException('Category not found');

    let slug = category.slug;
    if (dto.name && dto.name !== category.name) {
      slug = slugify(dto.name, { lower: true, strict: true });
      const existing = await this.prisma.category.findUnique({ where: { slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Category with this name/slug already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
        parent_id: dto.parent_id,
        image_url: dto.image_url
      }
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category || category.deleted_at) throw new NotFoundException('Category not found');

    // Check if it has children
    const children = await this.prisma.category.count({ where: { parent_id: id, deleted_at: null } });
    if (children > 0) {
      throw new ConflictException('Cannot delete a category with active subcategories');
    }

    return this.prisma.category.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}
