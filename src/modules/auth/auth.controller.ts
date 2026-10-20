import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RegisterDto, LoginDto, ForgotPasswordDto } from './dto/auth.dto';
import type { Request, Response } from 'express';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { message: 'Registration successful', data: user };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const ip = request.ip || request.socket?.remoteAddress || 'unknown';
    const ua = request.headers['user-agent'] || 'unknown';
    
    const { tokens, user } = await this.authService.login(loginDto, ip, ua);
    
    return { 
      message: 'Authentication successful', 
      data: { 
        accessToken: tokens.accessToken,
        user 
      } 
    };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and clear refresh token cookie' })
  async logout() {
    return { message: 'Logout successful' };
  }



  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() request: Request) {
    const user = request['user'];
    return { data: user };
  }
}
