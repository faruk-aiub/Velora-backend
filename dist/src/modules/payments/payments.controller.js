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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const payments_dto_1 = require("./dto/payments.dto");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async initiatePayment(dto, req) {
        const userId = req.user.sub;
        const result = await this.paymentsService.initiatePayment(userId, dto);
        return { message: 'Payment initiated', data: result };
    }
    async verifyPayment(dto) {
        const result = await this.paymentsService.verifyPayment(dto);
        return { message: 'Payment verified', data: result };
    }
    async stripeWebhook(signature, req) {
        if (!signature || !req.rawBody) {
            return { received: false, message: 'Missing signature or rawBody' };
        }
        return this.paymentsService.handleStripeWebhook(signature, req.rawBody);
    }
    mockGatewayPage(paymentId, res) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock Payment Gateway</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f4f9; }
          .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
          button { padding: 10px 20px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin: 10px; color: white; }
          .btn-success { background: #28a745; }
          .btn-fail { background: #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Mock Payment Gateway</h2>
          <p>Payment ID: <strong>${paymentId}</strong></p>
          <p>Simulate the outcome of this payment:</p>
          <button class="btn-success" onclick="verify('SUCCESS')">Simulate Success</button>
          <button class="btn-fail" onclick="verify('FAILED')">Simulate Failure</button>
        </div>
        <script>
          async function verify(status) {
            const res = await fetch('/api/v1/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: '${paymentId}',
                status: status,
                transactionId: 'txn_' + Date.now()
              })
            });
            if(res.ok) {
              alert('Payment ' + status + '! You can close this or redirect to frontend.');
              // Redirect to frontend (adjust port based on env)
              window.location.href = 'http://localhost:3001/checkout/success';
            } else {
              alert('Verification failed');
            }
          }
        </script>
      </body>
      </html>
    `;
        res.type('html').send(html);
    }
    async getPaymentDetails(orderId, req) {
        const userId = req.user.sub;
        const data = await this.paymentsService.getPaymentDetails(orderId, userId);
        return { data };
    }
    async getAllPaymentsAdmin(page, limit) {
        return this.paymentsService.findAllAdmin(page, limit);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('payments/initiate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.InitiatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Post)('payments/verify'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('payments/webhook'),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "stripeWebhook", null);
__decorate([
    (0, common_1.Get)('payments/mock-gateway/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "mockGatewayPage", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('payments/:orderId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentDetails", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('admin/payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getAllPaymentsAdmin", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map