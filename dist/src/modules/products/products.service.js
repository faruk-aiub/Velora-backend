"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
const slugify_1 = __importDefault(require("slugify"));
let ProductsService = class ProductsService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async invalidateProductCaches() {
        await this.redis.delByPattern('cache:products:*');
    }
    async findAll(page = 1, limit = 10, categoryId, brandId, minPrice, maxPrice, sort, search) {
        const { skip, take } = (0, pagination_util_1.getPaginationParams)(page, limit);
        const cacheKey = `cache:products:list:cat_${categoryId || 'all'}:br_${brandId || 'all'}:min_${minPrice || 0}:max_${maxPrice || 'inf'}:s_${sort || 'default'}:q_${search || 'none'}:p_${page}:l_${limit}`;
        return this.redis.getOrSet(cacheKey, 300, async () => {
            let sortField = 'created_at';
            let sortOrder = 'desc';
            if (sort) {
                const parts = sort.split(':');
                if (parts.length === 2) {
                    sortField = parts[0];
                    if (sortField === 'price')
                        sortField = 'base_price';
                    sortOrder = parts[1].toLowerCase() === 'asc' ? 'asc' : 'desc';
                }
            }
            const whereClause = {
                is_active: true,
                deleted_at: null,
            };
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
            if (brandId)
                whereClause.brand_id = brandId;
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
                            where: { sort_order: 0 },
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
            return (0, pagination_util_1.createPaginationResponse)(products, total, page, limit);
        });
    }
    async findOneBySlug(slug) {
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
            if (!product)
                throw new common_1.NotFoundException(`Product not found`);
            return product;
        });
    }
    async create(dto) {
        const slug = (0, slugify_1.default)(dto.title, { lower: true, strict: true });
        const existing = await this.prisma.product.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.ConflictException('Product with this title/slug already exists');
        const product = await this.prisma.product.create({
            data: {
                title: dto.title,
                slug,
                description: dto.description,
                category_id: dto.category_id,
                brand_id: dto.brand_id,
                is_active: dto.is_active ?? true,
            }
        });
        await this.invalidateProductCaches();
        return product;
    }
    async update(id, dto) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product || product.deleted_at)
            throw new common_1.NotFoundException('Product not found');
        let slug = product.slug;
        if (dto.title && dto.title !== product.title) {
            slug = (0, slugify_1.default)(dto.title, { lower: true, strict: true });
            const existing = await this.prisma.product.findUnique({ where: { slug } });
            if (existing && existing.id !== id)
                throw new common_1.ConflictException('Product title/slug already exists');
        }
        const updated = await this.prisma.product.update({
            where: { id },
            data: {
                title: dto.title,
                slug,
                description: dto.description,
                category_id: dto.category_id,
                brand_id: dto.brand_id,
                is_active: dto.is_active,
            }
        });
        await this.invalidateProductCaches();
        return updated;
    }
    async delete(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product || product.deleted_at)
            throw new common_1.NotFoundException('Product not found');
        await this.prisma.product.update({
            where: { id },
            data: { deleted_at: new Date(), is_active: false }
        });
        await this.invalidateProductCaches();
        return true;
    }
    async addVariant(productId, dto) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const existingSku = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
        if (existingSku)
            throw new common_1.ConflictException('Variant with this SKU already exists');
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
    async updateVariant(variantId, dto) {
        if (dto.sku) {
            const existingSku = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
            if (existingSku && existingSku.id !== variantId)
                throw new common_1.ConflictException('SKU already exists');
        }
        const variant = await this.prisma.productVariant.update({
            where: { id: variantId },
            data: dto
        });
        await this.invalidateProductCaches();
        return variant;
    }
    async removeVariant(variantId) {
        await this.prisma.productVariant.delete({ where: { id: variantId } });
        await this.invalidateProductCaches();
    }
    async addImage(productId, dto) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
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
    async removeImage(imageId) {
        await this.prisma.productImage.delete({ where: { id: imageId } });
        await this.invalidateProductCaches();
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], ProductsService);
//# sourceMappingURL=products.service.js.map