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
exports.ValidateCouponDto = exports.CreateCouponDto = exports.DiscountTypeEnum = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var DiscountTypeEnum;
(function (DiscountTypeEnum) {
    DiscountTypeEnum["PERCENT"] = "PERCENT";
    DiscountTypeEnum["FIXED"] = "FIXED";
})(DiscountTypeEnum || (exports.DiscountTypeEnum = DiscountTypeEnum = {}));
class CreateCouponDto {
    code;
    discount_type;
    discount_value;
    min_order_value;
    usage_limit;
    expires_at;
    static _OPENAPI_METADATA_FACTORY() {
        return { code: { required: true, type: () => String }, discount_type: { required: true, enum: require("./coupons.dto").DiscountTypeEnum }, discount_value: { required: true, type: () => Number, minimum: 0 }, min_order_value: { required: false, type: () => Number, minimum: 0 }, usage_limit: { required: false, type: () => Number, minimum: 1 }, expires_at: { required: false, type: () => String } };
    }
}
exports.CreateCouponDto = CreateCouponDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCouponDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(DiscountTypeEnum),
    __metadata("design:type", String)
], CreateCouponDto.prototype, "discount_type", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCouponDto.prototype, "discount_value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCouponDto.prototype, "min_order_value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCouponDto.prototype, "usage_limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCouponDto.prototype, "expires_at", void 0);
class ValidateCouponDto {
    code;
    cart_total;
    static _OPENAPI_METADATA_FACTORY() {
        return { code: { required: true, type: () => String }, cart_total: { required: true, type: () => Number, minimum: 0 } };
    }
}
exports.ValidateCouponDto = ValidateCouponDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateCouponDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ValidateCouponDto.prototype, "cart_total", void 0);
//# sourceMappingURL=coupons.dto.js.map