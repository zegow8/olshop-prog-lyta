import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
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

    // Parse form data
    const formData = await request.formData();
    
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const price = parseInt(formData.get("price") as string);
    const description = formData.get("description") as string;
    const stock = parseInt(formData.get("stock") as string);
    const imageFile = formData.get("image") as File;

    // Validasi
    if (!id || !name || !price || stock === undefined) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
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

    let imageUrl = existingProduct.image;

    // Handle image upload jika ada file baru
    if (imageFile && imageFile.size > 0) {
      // Delete old image if not placeholder
      if (existingProduct.image && !existingProduct.image.includes("placeholder")) {
        const oldFilename = existingProduct.image.split("/").pop();
        const oldPath = join(process.cwd(), "public", "uploads", oldFilename || "");
        try {
          await unlink(oldPath);
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename
      const timestamp = Date.now();
      const ext = imageFile.name.split(".").pop();
      const filename = `product_${timestamp}.${ext}`;
      
      // Save to public/uploads folder
      const path = join(process.cwd(), "public", "uploads", filename);
      await writeFile(path, buffer);
      
      imageUrl = `/uploads/${filename}`;
    }

    // Update product in database
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        description,
        stock,
        image: imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}