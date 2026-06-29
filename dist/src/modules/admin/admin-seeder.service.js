"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdminSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSeederService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const argon2 = __importStar(require("argon2"));
const config_1 = require("@nestjs/config");
let AdminSeederService = AdminSeederService_1 = class AdminSeederService {
    prisma;
    configService;
    logger = new common_1.Logger(AdminSeederService_1.name);
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async onModuleInit() {
        await this.seedSuperAdmin();
    }
    async seedSuperAdmin() {
        const adminEmail = this.configService.get('SUPER_ADMIN_EMAIL');
        const adminPassword = this.configService.get('SUPER_ADMIN_PASSWORD');
        if (!adminEmail || !adminPassword) {
            this.logger.warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD is not defined in .env. Skipping admin seeding.');
            return;
        }
        const existingAdmin = await this.prisma.user.findFirst({
            where: { email: adminEmail },
        });
        if (existingAdmin) {
            this.logger.log('Super Admin already exists. Seeding skipped.');
            return;
        }
        const hashedPassword = await argon2.hash(adminPassword);
        await this.prisma.user.create({
            data: {
                email: adminEmail,
                password_hash: hashedPassword,
                role: 'ADMIN',
                is_email_verified: true,
                profile: {
                    create: {
                        first_name: 'Super',
                        last_name: 'Admin',
                    },
                },
            },
        });
        this.logger.log('Super Admin account created successfully.');
    }
};
exports.AdminSeederService = AdminSeederService;
exports.AdminSeederService = AdminSeederService = AdminSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AdminSeederService);
//# sourceMappingURL=admin-seeder.service.js.map