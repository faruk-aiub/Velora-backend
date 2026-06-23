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
exports.UpdateOrderStatusDto = exports.OrderStatusEnum = exports.CreateOrderDto = exports.CartItemDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CartItemDto {
    variantId;
    quantity;
    static _OPENAPI_METADATA_FACTORY() {
        return { variantId: { required: true, type: () => String }, quantity: { required: true, type: () => Number, minimum: 1 } };
    }
}
exports.CartItemDto = CartItemDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CartItemDto.prototype, "variantId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CartItemDto.prototype, "quantity", void 0);
class CreateOrderDto {
    shippingAddressId;
    cartItems;
    static _OPENAPI_METADATA_FACTORY() {
        return { shippingAddressId: { required: true, type: () => String }, cartItems: { required: true, type: () => [require("./orders.dto").CartItemDto] } };
    }
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "shippingAddressId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CartItemDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "cartItems", void 0);
var OrderStatusEnum;
(function (OrderStatusEnum) {
    OrderStatusEnum["PENDING"] = "PENDING";
    OrderStatusEnum["CONFIRMED"] = "CONFIRMED";
    OrderStatusEnum["PROCESSING"] = "PROCESSING";
    OrderStatusEnum["SHIPPED"] = "SHIPPED";
    OrderStatusEnum["DELIVERED"] = "DELIVERED";
    OrderStatusEnum["CANCELLED"] = "CANCELLED";
    OrderStatusEnum["RETURNED"] = "RETURNED";
})(OrderStatusEnum || (exports.OrderStatusEnum = OrderStatusEnum = {}));
class UpdateOrderStatusDto {
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, enum: require("./orders.dto").OrderStatusEnum } };
    }
}
exports.UpdateOrderStatusDto = UpdateOrderStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(OrderStatusEnum),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "status", void 0);
//# sourceMappingURL=orders.dto.js.map