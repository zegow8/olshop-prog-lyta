import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import UserNavbar from "@/components/UserNavbar";

const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "rahasia_banget_2025"
);

export default async function UserLayout({
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
    if (user.role !== "USER") {
      redirect("/admin");
    }
  } catch (error) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}