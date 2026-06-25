import {  ApiTags , ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateBannerDto, UpdateBannerDto } from './dto/cms.dto';

@Controller()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('cms/banners')
  async getActiveBanners() {
    const banners = await this.cmsService.getActiveBanners();
    return { data: banners };
  }

  // --- ADMIN APIs ---

  @ApiBearerAuth()
  @Get('admin/cms/banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllBannersAdmin() {
    const banners = await this.cmsService.getAllBannersAdmin();
    return { data: banners };
  }

  @ApiBearerAuth()
  @Post('admin/cms/banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createBanner(@Body() dto: CreateBannerDto) {
    const banner = await this.cmsService.createBanner(dto);
    return { message: 'Banner created successfully', data: banner };
  }

  @ApiBearerAuth()
  @Put('admin/cms/banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    const banner = await this.cmsService.updateBanner(id, dto);
    return { message: 'Banner updated successfully', data: banner };
  }

  @ApiBearerAuth()
  @Delete('admin/cms/banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteBanner(@Param('id') id: string) {
    await this.cmsService.deleteBanner(id);
    return { message: 'Banner deleted successfully' };
  }
}
