import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request, Response } from 'express';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('firebase/login')
  @ApiOperation({ summary: 'Login or Register using Firebase idToken' })
  async firebaseLogin(
    @Body('idToken') idToken: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    if (!idToken) {
      throw new Error('idToken is required');
    }

    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const ua = request.headers['user-agent'] || 'unknown';
    
    const { tokens, user } = await this.authService.firebaseLogin(idToken, ip, ua);
    
    // Set httpOnly cookie for refresh token (Security Rule)
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Automatically set admin token if user is an ADMIN
    if (user.role === 'ADMIN') {
      response.cookie('admin_refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return { message: 'Authentication successful', data: { accessToken: tokens.accessToken, user } };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and clear refresh token cookie' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refresh_token');
    response.clearCookie('admin_refresh_token');
    return { message: 'Logout successful' };
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh_token cookie' })
  async refreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }
    
    const tokens = await this.authService.refreshTokens(refreshToken);
    
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Token refreshed', data: { accessToken: tokens.accessToken } };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() request: Request) {
    const user = request['user'];
    return { data: user };
  }
}
