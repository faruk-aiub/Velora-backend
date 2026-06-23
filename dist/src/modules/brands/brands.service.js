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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const slugify_1 = __importDefault(require("slugify"));
let BrandsService = class BrandsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBrands() {
        return this.prisma.brand.findMany({
            where: { deleted_at: null },
            orderBy: { name: 'asc' }
        });
    }
    async createBrand(dto) {
        const slug = (0, slugify_1.default)(dto.name, { lower: true, strict: true });
        const existing = await this.prisma.brand.findUnique({ where: { slug } });
        if (existing) {
            throw new common_1.ConflictException('Brand with this name/slug already exists');
        }
        return this.prisma.brand.create({
            data: {
                name: dto.name,
                slug,
                logo_url: dto.logo_url
            }
        });
    }
    async updateBrand(id, dto) {
        const brand = await this.prisma.brand.findUnique({ where: { id } });
        if (!brand || brand.deleted_at)
            throw new common_1.NotFoundException('Brand not found');
        let slug = brand.slug;
        if (dto.name && dto.name !== brand.name) {
            slug = (0, slugify_1.default)(dto.name, { lower: true, strict: true });
            const existing = await this.prisma.brand.findUnique({ where: { slug } });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Brand with this name/slug already exists');
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
    async deleteBrand(id) {
        const brand = await this.prisma.brand.findUnique({ where: { id } });
        if (!brand || brand.deleted_at)
            throw new common_1.NotFoundException('Brand not found');
        const productCount = await this.prisma.product.count({ where: { brand_id: id, deleted_at: null } });
        if (productCount > 0) {
            throw new common_1.ConflictException('Cannot delete a brand with active products');
        }
        return this.prisma.brand.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BrandsService);
//# sourceMappingURL=brands.service.js.map