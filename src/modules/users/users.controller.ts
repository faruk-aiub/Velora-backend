import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: Request) {
    const userId = (req as any).user.sub;
    const user = await this.usersService.getProfile(userId);
    return { data: user };
  }

  @Put('me')
  async updateProfile(@Req() req: Request, @Body() updateDto: UpdateProfileDto) {
    const userId = (req as any).user.sub;
    const profile = await this.usersService.updateProfile(userId, updateDto);
    return { message: 'Profile updated', data: profile };
  }

  // --- ADDRESS APIs ---

  @Post('address')
  async addAddress(@Req() req: Request, @Body() addressDto: CreateAddressDto) {
    const userId = (req as any).user.sub;
    const address = await this.usersService.addAddress(userId, addressDto);
    return { message: 'Address added', data: address };
  }

  @Get('address')
  async getAddresses(@Req() req: Request) {
    const userId = (req as any).user.sub;
    const addresses = await this.usersService.getAddresses(userId);
    return { data: addresses };
  }

  @Put('address/:id')
  async updateAddress(
    @Req() req: Request, 
    @Param('id') id: string, 
    @Body() addressDto: UpdateAddressDto
  ) {
    const userId = (req as any).user.sub;
    const address = await this.usersService.updateAddress(userId, id, addressDto);
    return { message: 'Address updated', data: address };
  }

  @Delete('address/:id')
  async deleteAddress(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.sub;
    await this.usersService.deleteAddress(userId, id);
    return { message: 'Address deleted' };
  }

  // --- ADMIN APIs ---

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.usersService.getAllUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    return { data: user };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted (soft)' };
  }
}
