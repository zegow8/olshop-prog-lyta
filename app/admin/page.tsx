import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign 
} from "lucide-react";

const prisma = new PrismaClient();
const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "rahasia_banget_2025"
);

export default async function AdminDashboard() {
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
    
    if (user.role !== "ADMIN") {
      redirect("/user");
    }
  } catch (error) {
    redirect("/login");
  }

  // Ambil data statistik
  const [
    totalProducts,
    totalUsers,
    totalOrders,
    totalRevenue
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        total: true
      }
    })
  ]);

  // Ambil 5 user terbaru
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard Admin</h1>
        <p style={styles.subtitle}>Selamat datang, {user?.name || 'Admin'}! 👋</p>
      </div>

      {/* Statistik Cards */}
      <div style={styles.statsGrid}>
        {/* Produk */}
        <div style={styles.statCard}>
          <div style={styles.statIconContainerMaroon}>
            <Package size={28} />
          </div>
          <p style={styles.statLabel}>Total Produk</p>
          <p style={styles.statValue}>{totalProducts}</p>
          <p style={styles.statTrend}>Semua produk tersedia</p>
        </div>

        {/* Users */}
        <div style={styles.statCard}>
          <div style={styles.statIconContainerMaroon}>
            <Users size={28} />
          </div>
          <p style={styles.statLabel}>Total Users</p>
          <p style={styles.statValue}>{totalUsers}</p>
          <p style={styles.statTrend}>Pengguna terdaftar</p>
        </div>

        {/* Orders */}
        <div style={styles.statCard}>
          <div style={styles.statIconContainerMaroon}>
            <ShoppingCart size={28} />
          </div>
          <p style={styles.statLabel}>Total Pesanan</p>
          <p style={styles.statValue}>{totalOrders}</p>
          <p style={styles.statTrend}>Transaksi berhasil</p>
        </div>

        {/* Revenue */}
        <div style={styles.statCard}>
          <div style={styles.statIconContainerMaroon}>
            <DollarSign size={28} />
          </div>
          <p style={styles.statLabel}>Total Pendapatan</p>
          <p style={styles.statValue}>Rp {totalRevenue._sum.total?.toLocaleString() || "0"}</p>
          <p style={styles.statTrend}>Pendapatan kotor</p>
        </div>
      </div>

      {/* User List */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>User Terbaru</h2>
        </div>
        
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeaderCell}>Nama</th>
              <th style={styles.tableHeaderCell}>Email</th>
              <th style={styles.tableHeaderCell}>Role</th>
              <th style={styles.tableHeaderCell}>Tanggal Bergabung</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <tr key={user.id} style={styles.tableRow}>
                <td style={styles.tableCell}>
                  <div style={styles.userName}>{user.name || "-"}</div>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.userEmail}>{user.email}</div>
                </td>
                <td style={styles.tableCell}>
                  <span style={user.role === "ADMIN" ? styles.roleAdmin : styles.roleUser}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.userDate}>
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// CSS Styles dalam bentuk JavaScript object
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fdf2f2 0%, #f9fafb 100%)',
    padding: '30px'
  },
  header: {
    marginBottom: '40px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#111827',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
    position: 'relative' as const,
    display: 'inline-block'
  },
  subtitle: {
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '500'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb',
    position: 'relative' as const,
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  statIconContainerBlue: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
  },
  statIconContainerGreen: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
  },
  statIconContainerYellow: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
  },
  statIconContainerMaroon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #800000, #5a0000)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#4b5563',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#111827',
    marginBottom: '4px'
  },
  statTrend: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  tableHeader: {
    padding: '28px',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(135deg, #5a0000, #800000)'
  },
  tableTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: 'white',
    margin: '0'
  },
  tableSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    marginTop: '4px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  tableHeaderRow: {
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb'
  },
  tableHeaderCell: {
    padding: '20px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: '900',
    color: '#374151',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    borderBottom: '2px solid #e5e7eb'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb'
  },
  tableCell: {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827'
  },
  userEmail: {
    fontSize: '14px',
    color: '#4b5563'
  },
  roleAdmin: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '900',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    background: 'linear-gradient(135deg, #800000, #a62626)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(128, 0, 0, 0.2)'
  },
  roleUser: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '900',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
  },
  userDate: {
    fontSize: '13px',
    color: '#4b5563',
    fontWeight: '500'
  }
};