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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const slugify_1 = __importDefault(require("slugify"));
let CategoriesService = class CategoriesService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async invalidateCategoryCaches() {
        await this.redis.delByPattern('cache:categories:*');
    }
    async getCategoryTree() {
        return this.redis.getOrSet('cache:categories:tree', 3600, async () => {
            const categories = await this.prisma.category.findMany({
                where: { parent_id: null, deleted_at: null },
                orderBy: { created_at: 'asc' },
                include: {
                    children: {
                        where: { deleted_at: null },
                        orderBy: { created_at: 'asc' },
                        include: {
                            children: {
                                where: { deleted_at: null },
                                orderBy: { created_at: 'asc' }
                            }
                        }
                    }
                }
            });
            const agri = categories.find(c => c.name === 'Agricultural Products');
            const others = categories.filter(c => c.name !== 'Agricultural Products');
            return agri ? [agri, ...others] : others;
        });
    }
    async getCategories() {
        return this.redis.getOrSet('cache:categories:list', 3600, async () => {
            const categories = await this.prisma.category.findMany({
                where: { deleted_at: null },
                orderBy: { created_at: 'asc' }
            });
            const agri = categories.find(c => c.name === 'Agricultural Products');
            const others = categories.filter(c => c.name !== 'Agricultural Products');
            return agri ? [agri, ...others] : others;
        });
    }
    async createCategory(dto) {
        const slug = (0, slugify_1.default)(dto.name, { lower: true, strict: true });
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing) {
            throw new common_1.ConflictException('Category with this name/slug already exists');
        }
        if (dto.parent_id) {
            const parent = await this.prisma.category.findUnique({ where: { id: dto.parent_id } });
            if (!parent || parent.deleted_at) {
                throw new common_1.NotFoundException('Parent category not found');
            }
        }
        const category = await this.prisma.category.create({
            data: {
                name: dto.name,
                slug,
                parent_id: dto.parent_id,
                image_url: dto.image_url
            }
        });
        await this.invalidateCategoryCaches();
        return category;
    }
    async updateCategory(id, dto) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category || category.deleted_at)
            throw new common_1.NotFoundException('Category not found');
        let slug = category.slug;
        if (dto.name && dto.name !== category.name) {
            slug = (0, slugify_1.default)(dto.name, { lower: true, strict: true });
            const existing = await this.prisma.category.findUnique({ where: { slug } });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Category with this name/slug already exists');
            }
        }
        const dataToUpdate = {
            name: dto.name,
            slug,
        };
        if (dto.parent_id !== undefined) {
            dataToUpdate.parent_id = dto.parent_id === '' ? null : dto.parent_id;
        }
        if (dto.image_url !== undefined) {
            dataToUpdate.image_url = dto.image_url === '' ? null : dto.image_url;
        }
        const updated = await this.prisma.category.update({
            where: { id },
            data: dataToUpdate
        });
        await this.invalidateCategoryCaches();
        return updated;
    }
    async deleteCategory(id) {
        const category = await this.prisma.category.findUnique({ where: { id } });
        if (!category || category.deleted_at)
            throw new common_1.NotFoundException('Category not found');
        const children = await this.prisma.category.count({ where: { parent_id: id, deleted_at: null } });
        if (children > 0) {
            throw new common_1.ConflictException('Cannot delete a category with active subcategories');
        }
        const deleted = await this.prisma.category.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
        await this.invalidateCategoryCaches();
        return deleted;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map