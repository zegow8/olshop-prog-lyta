import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "rahasia_banget_2025"
);

export async function POST(request: NextRequest) {
  try {
    // Cek authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, secretKey);
    const { address, payment, total } = await request.json();

    if (!address || !payment || !total) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: payload.id as string },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Keranjang kosong" },
        { status: 400 }
      );
    }

    // Validasi stock
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return NextResponse.json(
          { error: `Stock ${item.product.name} tidak mencukupi` },
          { status: 400 }
        );
      }
    }

    // Mulai transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.order.create({
        data: {
          userId: payload.id as string,
          total,
          address,
          payment,
          status: "PENDING"
        }
      });

      // 2. Create order items dan update product stock
      for (const cartItem of cart.items) {
        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            price: cartItem.product.price
          }
        });

        // Update product stock
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stock: {
              decrement: cartItem.quantity
            }
          }
        });
      }

      // 3. Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      order: result,
      message: "Pesanan berhasil dibuat"
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}