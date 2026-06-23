import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { title: true, slug: true, images: { select: { url: true }, take: 1, orderBy: { sort_order: 'asc' } } }
                }
              }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { user_id: userId },
        include: { items: { include: { variant: { include: { product: true } } } } }
      });
    }

    // Calculate dynamic total price
    const total_amount = cart.items.reduce((total, item) => {
      const price = Number(item.variant.compare_price || item.variant.price);
      return total + (price * item.quantity);
    }, 0);

    return {
      ...cart,
      total_amount
    };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    let cart = await this.prisma.cart.findUnique({ where: { user_id: userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { user_id: userId } });
    }

    const variant = await this.prisma.productVariant.findUnique({ where: { id: dto.variant_id } });
    if (!variant) throw new NotFoundException('Variant not found');

    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cart_id_variant_id: { cart_id: cart.id, variant_id: dto.variant_id } }
    });

    if (existingItem) {
      // Upsert: Increment quantity
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity }
      });
    } else {
      // Create new
      return this.prisma.cartItem.create({
        data: {
          cart_id: cart.id,
          variant_id: dto.variant_id,
          quantity: dto.quantity
        }
      });
    }
  }

  async updateItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
    if (!item || item.cart.user_id !== userId) throw new NotFoundException('Cart item not found');

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity }
    });
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
    if (!item || item.cart.user_id !== userId) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return true;
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { user_id: userId } });
    if (!cart) return;

    await this.prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
    return true;
  }
}
