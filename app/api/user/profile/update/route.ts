import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

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
    const { name, currentPassword, newPassword } = await request.json();

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Update name if provided
    if (name !== undefined) {
      updateData.name = name.trim() || null;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Password saat ini salah" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    let message = "Profil berhasil diupdate";
    if (currentPassword && newPassword) {
      message = "Password berhasil diubah";
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}