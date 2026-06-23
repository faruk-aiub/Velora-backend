import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { user_id: userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: {
              select: { url: true },
              take: 1,
              orderBy: { sort_order: 'asc' }
            },
            variants: {
              select: { price: true, compare_price: true },
              take: 1
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async toggleWishlistItem(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.deleted_at) throw new NotFoundException('Product not found');

    const existing = await this.prisma.wishlist.findUnique({
      where: { user_id_product_id: { user_id: userId, product_id: productId } }
    });

    if (existing) {
      // Remove it
      await this.prisma.wishlist.delete({ where: { id: existing.id } });
      return { message: 'Removed from wishlist', status: 'removed' };
    } else {
      // Add it
      await this.prisma.wishlist.create({
        data: { user_id: userId, product_id: productId }
      });
      return { message: 'Added to wishlist', status: 'added' };
    }
  }
}
