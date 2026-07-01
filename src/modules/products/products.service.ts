// Triggering backend restart to load new Prisma client
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { getPaginationParams, createPaginationResponse, PaginatedResponse } from '../../common/utils/pagination.util';
import slugify from 'slugify';
import { CreateProductDto, UpdateProductDto, CreateVariantDto, UpdateVariantDto, CreateImageDto } from './dto/products.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private async invalidateProductCaches() {
    await this.redis.delByPattern('cache:products:*');
  }

  // --- QUERY APIs ---

  async findAll(
    page: number = 1, 
    limit: number = 10, 
    categoryId?: string, 
    brandId?: string,
    minPrice?: number,
    maxPrice?: number,
    sort?: string,
    search?: string,
    isAdmin: boolean = false
  ): Promise<PaginatedResponse<any>> {
    const { skip, take } = getPaginationParams(page, limit);
    
    // Create deterministic cache key
    const cacheKey = `cache:products:list:cat_${categoryId || 'all'}:br_${brandId || 'all'}:min_${minPrice || 0}:max_${maxPrice || 'inf'}:s_${sort || 'default'}:q_${search || 'none'}:p_${page}:l_${limit}:admin_${isAdmin}`;
    
    return this.redis.getOrSet(cacheKey, 300, async () => {
      let sortField = 'created_at';
      let sortOrder = 'desc';

      if (sort) {
        const parts = sort.split(':');
        if (parts.length === 2) {
          sortField = parts[0];
          if (sortField === 'price') sortField = 'base_price';
          sortOrder = parts[1].toLowerCase() === 'asc' ? 'asc' : 'desc';
        }
      }

      const whereClause: any = {
        deleted_at: null,
      };

      if (!isAdmin) {
        whereClause.is_active = true;
      }

      if (categoryId) {
        whereClause.category = {
          OR: [
            { id: categoryId },
            { slug: categoryId },
            { name: categoryId },
            { parent: { is: { id: categoryId } } },
            { parent: { is: { slug: categoryId } } },
            { parent: { is: { name: categoryId } } }
          ]
        };
      }
      if (brandId) whereClause.brand_id = brandId;
      
      // Filter by variant price range if provided
      if (minPrice !== undefined || maxPrice !== undefined) {
        whereClause.variants = {
          some: {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice })
            }
          }
        };
      }
      
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      console.log('EXECUTING PRISMA QUERY WITH WHERE CLAUSE:', JSON.stringify(whereClause, null, 2));

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: whereClause,
          include: {
            variants: {
              select: { id: true, price: true, compare_price: true },
            },
            images: {
              orderBy: { sort_order: 'asc' },
              select: { url: true, alt_text: true },
              take: 1,
            },
            brand: { select: { name: true } },
          },
          orderBy: { [sortField]: sortOrder },
          skip,
          take: limit,
        }),
        this.prisma.product.count({ where: whereClause }),
      ]);
      
      return createPaginationResponse(products, total, page, limit);
    });
  }

  async findOneBySlug(slug: string) {
    const cacheKey = `cache:products:detail:${slug}`;

    return this.redis.getOrSet(cacheKey, 300, async () => {
      const product = await this.prisma.product.findUnique({
        where: { slug, is_active: true, deleted_at: null },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true } },
          images: { select: { id: true, url: true, alt_text: true, sort_order: true }, orderBy: { sort_order: 'asc' } },
          variants: {
            select: {
              id: true,
              sku: true,
              price: true,
              compare_price: true,
              attributes: true,
              inventory: { select: { quantity: true, reserved_quantity: true } }
            }
          }
        }
      });

      if (!product) throw new NotFoundException(`Product not found`);
      return product;
    });
  }

  async findOneByIdForAdmin(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, deleted_at: null },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        base_price: true,
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
        images: { select: { id: true, url: true, alt_text: true, sort_order: true }, orderBy: { sort_order: 'asc' } },
        variants: {
          select: {
            id: true,
            sku: true,
            price: true,
            compare_price: true,
            attributes: true,
            inventory: { select: { quantity: true, reserved_quantity: true } }
          }
        }
      }
    });

    if (!product) throw new NotFoundException(`Product not found`);
    return product;
  }

  // --- ADMIN PRODUCT CRUD ---

  async create(dto: CreateProductDto) {
    const slug = slugify(dto.title, { lower: true, strict: true });
    
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Product with this title/slug already exists');

    const product = await this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        category_id: dto.category_id,
        brand_id: dto.brand_id,
        base_price: dto.base_price !== undefined ? dto.base_price : 0,
        is_active: dto.is_active ?? true,
        variants: {
          create: {
            sku: `${slug}-default-${Date.now()}`,
            price: dto.base_price !== undefined ? dto.base_price : 0,
            inventory: {
              create: {
                quantity: 100,
                reserved_quantity: 0
              }
            }
          }
        }
      }
    });

    await this.invalidateProductCaches();
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product || product.deleted_at) throw new NotFoundException('Product not found');

    let slug = product.slug;
    if (dto.title && dto.title !== product.title) {
      slug = slugify(dto.title, { lower: true, strict: true });
      const existing = await this.prisma.product.findUnique({ where: { slug } });
      if (existing && existing.id !== id) throw new ConflictException('Product title/slug already exists');
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        category_id: dto.category_id,
        brand_id: dto.brand_id,
        ...(dto.base_price !== undefined && { base_price: dto.base_price }),
        is_active: dto.is_active,
      }
    });

    if (dto.base_price !== undefined) {
      const variants = await this.prisma.productVariant.findMany({ where: { product_id: id } });
      if (variants.length > 0) {
        await this.prisma.productVariant.updateMany({
          where: { product_id: id },
          data: { price: dto.base_price }
        });
      } else {
        await this.prisma.productVariant.create({
          data: {
            product_id: id,
            sku: `${slug}-default-${Date.now()}`,
            price: dto.base_price,
            inventory: {
              create: {
                quantity: 100,
                reserved_quantity: 0
              }
            }
          }
        });
      }
    }

    await this.invalidateProductCaches();
    return updated;
  }

  async delete(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product || product.deleted_at) throw new NotFoundException('Product not found');

    await this.prisma.product.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false }
    });

    await this.invalidateProductCaches();
    return true;
  }

  // --- VARIANTS ---

  async addVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const existingSku = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
    if (existingSku) throw new ConflictException('Variant with this SKU already exists');

    const variant = await this.prisma.productVariant.create({
      data: {
        product_id: productId,
        sku: dto.sku,
        price: dto.price,
        compare_price: dto.compare_price,
        attributes: dto.attributes || {},
        inventory: {
          create: {
            quantity: 0,
            reserved_quantity: 0
          }
        }
      },
      include: {
        inventory: true
      }
    });

    await this.invalidateProductCaches();
    return variant;
  }

  async updateVariant(variantId: string, dto: UpdateVariantDto) {
    if (dto.sku) {
      const existingSku = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
      if (existingSku && existingSku.id !== variantId) throw new ConflictException('SKU already exists');
    }

    const variant = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: dto
    });

    await this.invalidateProductCaches();
    return variant;
  }

  async removeVariant(variantId: string) {
    await this.prisma.productVariant.delete({ where: { id: variantId } });
    await this.invalidateProductCaches();
  }

  // --- IMAGES ---

  async addImage(productId: string, dto: CreateImageDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const image = await this.prisma.productImage.create({
      data: {
        product_id: productId,
        url: dto.url,
        alt_text: dto.alt_text,
        sort_order: dto.sort_order || 0
      }
    });

    await this.invalidateProductCaches();
    return image;
  }

  async removeImage(imageId: string) {
    await this.prisma.productImage.delete({ where: { id: imageId } });
    await this.invalidateProductCaches();
  }
}
