import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpsertConfigDto } from './dto/config.dto';

@Controller()
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('config')
  async getGlobalConfig() {
    const config = await this.configService.getGlobalConfig();
    return { data: config };
  }

  // --- ADMIN APIs ---

  @Get('admin/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllAdmin() {
    const configs = await this.configService.getAllAdmin();
    return { data: configs };
  }

  @Post('admin/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async upsertConfig(@Body() dto: UpsertConfigDto) {
    const config = await this.configService.upsertConfig(dto);
    return { message: 'Config saved successfully', data: config };
  }

  @Delete('admin/config/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteConfig(@Param('key') key: string) {
    await this.configService.deleteConfig(key);
    return { message: 'Config deleted successfully' };
  }
}
