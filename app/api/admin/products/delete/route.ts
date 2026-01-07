import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "rahasia_banget_2025"
);

export async function POST(request: NextRequest) {
  try {
    // Cek authentication & role admin
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, secretKey);
    
    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID produk diperlukan" },
        { status: 400 }
      );
    }

    // Cek product exist
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete image file jika bukan placeholder
    if (existingProduct.image && !existingProduct.image.includes("placeholder")) {
      const filename = existingProduct.image.split("/").pop();
      const path = join(process.cwd(), "public", "uploads", filename || "");
      try {
        await unlink(path);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    // Delete product from database
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}