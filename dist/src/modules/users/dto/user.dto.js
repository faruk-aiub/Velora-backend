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
exports.ChangePasswordDto = exports.UpdateAddressDto = exports.CreateAddressDto = exports.UpdateProfileDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateProfileDto {
    first_name;
    last_name;
    phone;
    avatar_url;
    static _OPENAPI_METADATA_FACTORY() {
        return { first_name: { required: false, type: () => String }, last_name: { required: false, type: () => String }, phone: { required: false, type: () => String }, avatar_url: { required: false, type: () => String } };
    }
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "first_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "last_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "avatar_url", void 0);
class CreateAddressDto {
    type;
    address_line1;
    city;
    postal_code;
    is_default;
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: true, enum: ["BILLING", "SHIPPING"] }, address_line1: { required: true, type: () => String }, city: { required: true, type: () => String }, postal_code: { required: true, type: () => String }, is_default: { required: false, type: () => Boolean } };
    }
}
exports.CreateAddressDto = CreateAddressDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AddressType),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "address_line1", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAddressDto.prototype, "postal_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAddressDto.prototype, "is_default", void 0);
class UpdateAddressDto {
    type;
    address_line1;
    city;
    postal_code;
    is_default;
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: false, enum: ["BILLING", "SHIPPING"] }, address_line1: { required: false, type: () => String }, city: { required: false, type: () => String }, postal_code: { required: false, type: () => String }, is_default: { required: false, type: () => Boolean } };
    }
}
exports.UpdateAddressDto = UpdateAddressDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AddressType),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "address_line1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAddressDto.prototype, "postal_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAddressDto.prototype, "is_default", void 0);
class ChangePasswordDto {
    currentPassword;
    newPassword;
    static _OPENAPI_METADATA_FACTORY() {
        return { currentPassword: { required: true, type: () => String }, newPassword: { required: true, type: () => String } };
    }
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=user.dto.js.map