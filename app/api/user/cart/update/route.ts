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
    const { itemId, quantity } = await request.json();

    if (!itemId || !quantity) {
      return NextResponse.json(
        { error: "Item ID dan quantity diperlukan" },
        { status: 400 }
      );
    }

    // Cek item exist
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        cart: true
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Item tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (cartItem.cart.userId !== payload.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Cek stock
    if (quantity > cartItem.product.stock) {
      return NextResponse.json(
        { error: "Jumlah melebihi stock yang tersedia" },
        { status: 400 }
      );
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });

    return NextResponse.json({
      success: true,
      message: "Kuantitas berhasil diupdate"
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}