import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { LoginDto } from '../auth/dto/auth.dto';
import type { Request, Response } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminChangePasswordDto } from './dto/admin-auth.dto';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Limit to 5 requests per minute
  @ApiOperation({ summary: 'Admin login' })
  async login(
    @Body() loginDto: LoginDto, 
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';
    const ua = request.headers['user-agent'] || 'unknown';
    
    const { tokens, user } = await this.adminAuthService.login(loginDto, ip, ua);
    
    return { 
      message: 'Admin login successful', 
      data: { 
        accessToken: tokens.accessToken,
        user 
      } 
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin logout' })
  async logout() {
    return { message: 'Admin logout successful' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin change password' })
  async changePassword(@Body() changePasswordDto: AdminChangePasswordDto, @Req() request: Request) {
    const user = request.user as any;
    const userId = user.sub;
    return this.adminAuthService.changePassword(userId, changePasswordDto.old_password, changePasswordDto.new_password);
  }
}
