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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const pagination_util_1 = require("../../common/utils/pagination.util");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                is_email_verified: true,
                profile: true,
                addresses: true,
            }
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateProfile(userId, dto) {
        return this.prisma.userProfile.upsert({
            where: { user_id: userId },
            update: dto,
            create: {
                user_id: userId,
                first_name: dto.first_name || '',
                last_name: dto.last_name || '',
                phone: dto.phone,
                avatar_url: dto.avatar_url,
            }
        });
    }
    async getAddresses(userId) {
        return this.prisma.userAddress.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
    }
    async addAddress(userId, dto) {
        return this.prisma.$transaction(async (prisma) => {
            if (dto.is_default) {
                await prisma.userAddress.updateMany({
                    where: { user_id: userId, is_default: true },
                    data: { is_default: false }
                });
            }
            const count = await prisma.userAddress.count({ where: { user_id: userId } });
            const is_default = count === 0 ? true : dto.is_default;
            return prisma.userAddress.create({
                data: {
                    ...dto,
                    user_id: userId,
                    is_default,
                }
            });
        });
    }
    async updateAddress(userId, addressId, dto) {
        const address = await this.prisma.userAddress.findUnique({ where: { id: addressId } });
        if (!address || address.user_id !== userId) {
            throw new common_1.NotFoundException('Address not found');
        }
        return this.prisma.$transaction(async (prisma) => {
            if (dto.is_default) {
                await prisma.userAddress.updateMany({
                    where: { user_id: userId, is_default: true, id: { not: addressId } },
                    data: { is_default: false }
                });
            }
            return prisma.userAddress.update({
                where: { id: addressId },
                data: dto
            });
        });
    }
    async deleteAddress(userId, addressId) {
        const address = await this.prisma.userAddress.findUnique({ where: { id: addressId } });
        if (!address || address.user_id !== userId) {
            throw new common_1.NotFoundException('Address not found');
        }
        return this.prisma.userAddress.delete({ where: { id: addressId } });
    }
    async getAllUsers(page = 1, limit = 10) {
        const { skip, take } = (0, pagination_util_1.getPaginationParams)(page, limit);
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: { deleted_at: null },
                skip,
                take,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    is_active: true,
                    created_at: true,
                    profile: {
                        select: { first_name: true, last_name: true }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            this.prisma.user.count({ where: { deleted_at: null } })
        ]);
        return (0, pagination_util_1.createPaginationResponse)(users, total, page, limit);
    }
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
                addresses: true,
                login_history: { take: 5, orderBy: { login_time: 'desc' } }
            }
        });
        if (!user || user.deleted_at)
            throw new common_1.NotFoundException('User not found');
        delete user.password_hash;
        return user;
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.user.update({
            where: { id },
            data: {
                deleted_at: new Date(),
                is_active: false
            }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map