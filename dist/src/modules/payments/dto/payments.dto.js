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
exports.VerifyPaymentDto = exports.InitiatePaymentDto = exports.PaymentStatusEnum = exports.PaymentProviderEnum = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var PaymentProviderEnum;
(function (PaymentProviderEnum) {
    PaymentProviderEnum["BKASH"] = "BKASH";
    PaymentProviderEnum["NAGAD"] = "NAGAD";
    PaymentProviderEnum["COD"] = "COD";
    PaymentProviderEnum["STRIPE"] = "STRIPE";
})(PaymentProviderEnum || (exports.PaymentProviderEnum = PaymentProviderEnum = {}));
var PaymentStatusEnum;
(function (PaymentStatusEnum) {
    PaymentStatusEnum["PENDING"] = "PENDING";
    PaymentStatusEnum["SUCCESS"] = "SUCCESS";
    PaymentStatusEnum["FAILED"] = "FAILED";
    PaymentStatusEnum["REFUNDED"] = "REFUNDED";
})(PaymentStatusEnum || (exports.PaymentStatusEnum = PaymentStatusEnum = {}));
class InitiatePaymentDto {
    orderId;
    provider;
    static _OPENAPI_METADATA_FACTORY() {
        return { orderId: { required: true, type: () => String }, provider: { required: true, enum: require("./payments.dto").PaymentProviderEnum } };
    }
}
exports.InitiatePaymentDto = InitiatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'd3f6a2b8-9e1c-4b3a-8f5d-7e2c1a4b9f6c' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BKASH', enum: PaymentProviderEnum }),
    (0, class_validator_1.IsEnum)(PaymentProviderEnum),
    __metadata("design:type", String)
], InitiatePaymentDto.prototype, "provider", void 0);
class VerifyPaymentDto {
    paymentId;
    status;
    transactionId;
    static _OPENAPI_METADATA_FACTORY() {
        return { paymentId: { required: true, type: () => String }, status: { required: true, enum: require("./payments.dto").PaymentStatusEnum }, transactionId: { required: false, type: () => String } };
    }
}
exports.VerifyPaymentDto = VerifyPaymentDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "paymentId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentStatusEnum),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "transactionId", void 0);
//# sourceMappingURL=payments.dto.js.map