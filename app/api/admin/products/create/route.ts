import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
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
    
    const name = formData.get("name") as string;
    const price = parseInt(formData.get("price") as string);
    const description = formData.get("description") as string;
    const stock = parseInt(formData.get("stock") as string);
    const imageFile = formData.get("image") as File;

    // Validasi
    // Validasi
        if (!name || !price || stock === undefined) {
        return NextResponse.json(
            { error: "Nama, harga, dan stok harus diisi" },
            { status: 400 }
        );
        }

        if (!imageFile || imageFile.size === 0) {
        return NextResponse.json(
            { error: "Gambar produk harus diupload" },
            { status: 400 }
        );
        }

    let imageUrl = "/placeholder-product.jpg";

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
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

    // Create product in database
    const product = await prisma.product.create({
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
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}