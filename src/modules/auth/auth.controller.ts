import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import {  ApiTags, ApiOperation, ApiResponse , ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request, Response } from 'express';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { message: 'Registration successful', data: user };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto, 
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const ua = request.headers['user-agent'] || 'unknown';
    
    const tokens = await this.authService.login(loginDto, ip, ua);
    
    // Set httpOnly cookie for refresh token (Security Rule)
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message: 'Login successful', data: { accessToken: tokens.accessToken } };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refresh_token');
    return { message: 'Logout successful' };
  }

  @Post('refresh-token')
  async refreshToken(@Req() request: Request) {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }
    // const newTokens = await this.authService.refreshTokens(refreshToken);
    return { message: 'Token refreshed', data: { accessToken: 'new-jwt-mock' } };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request: Request) {
    const user = request['user'];
    return { data: user };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto);
    return { message: 'If the email exists, a reset link was sent' };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { message: 'Password reset successfully' };
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto);
    return { message: 'Email verified successfully' };
  }
}
