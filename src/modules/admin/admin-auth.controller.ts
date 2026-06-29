import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { LoginDto } from '../auth/dto/auth.dto';
import type { Request, Response } from 'express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

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
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const ua = request.headers['user-agent'] || 'unknown';
    
    const { tokens, user } = await this.adminAuthService.login(loginDto, ip, ua);
    
    // Set httpOnly cookie for refresh token
    response.cookie('admin_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Admin login successful', data: { accessToken: tokens.accessToken, user } };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin logout' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('admin_refresh_token');
    return { message: 'Admin logout successful' };
  }
}
