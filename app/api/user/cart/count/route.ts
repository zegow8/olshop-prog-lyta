import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "rahasia_banget_2025"
);

export async function GET(request: NextRequest) {
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
    
    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: payload.id as string },
      include: {
        items: true
      }
    });

    const count = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get cart count error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}