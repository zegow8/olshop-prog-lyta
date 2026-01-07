import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";

const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "rahasia_banget_2025"
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cek session
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let user: any;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    user = payload;
    
    // Cek role
    if (user.role !== "ADMIN") {
      redirect("/user");
    }
  } catch (error) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="p-6">{children}</main>
    </div>
  );
}