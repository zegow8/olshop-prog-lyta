"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Helper function to check active link
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand}>
          <h1 style={styles.brandText}>E-COMMERCE Lyta</h1>
        </div>

        {/* Navigation Links */}
        <div style={styles.navLinks}>
          <Link
            href="/admin"
            style={isActive("/admin") ? styles.activeLink : styles.link}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            style={isActive("/admin/products") ? styles.activeLink : styles.link}
          >
            Products
          </Link>
          <Link
            href="/admin/orders"
            style={isActive("/admin/orders") ? styles.activeLink : styles.link}
          >
            Orders
          </Link>
        </div>

        {/* Logout Button */}
        <div style={styles.rightSection}>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            <LogOut size={18} style={{ marginRight: '8px' }} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: '#ffffff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderBottom: '3px solid #800000',
    position: 'sticky' as 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '70px'
  },
  brand: {
    display: 'flex',
    alignItems: 'center'
  },
  brandText: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#800000',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  navLinks: {
    display: 'flex',
    gap: '40px',
    alignItems: 'center',
    height: '100%'
  },
  link: {
    padding: '8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#4b5563',
    textDecoration: 'none',
    position: 'relative' as 'relative',
    transition: 'all 0.3s ease'
  },
  activeLink: {
    padding: '8px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#800000',
    textDecoration: 'none',
    position: 'relative' as 'relative',
    transition: 'all 0.3s ease'
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 24px',
    background: '#800000',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

// Add hover effects
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .link:hover {
      color: #800000;
    }
    
    .active-link::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      right: 0;
      height: 3px;
      background: #800000;
      border-radius: 3px;
    }
    
    .logout-button:hover {
      background: #a62626;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(128, 0, 0, 0.2);
    }
    
    @media (max-width: 768px) {
      .nav-links {
        gap: 20px;
      }
      
      .link, .active-link {
        font-size: 14px;
      }
      
      .brand-text {
        font-size: 20px;
      }
      
      .logout-button {
        padding: 8px 16px;
        font-size: 13px;
      }
    }
    
    @media (max-width: 480px) {
      .container {
        padding: 0 16px;
        height: 60px;
      }
      
      .nav-links {
        gap: 16px;
      }
      
      .brand-text {
        font-size: 18px;
      }
    }
  `;
  document.head.appendChild(style);
}