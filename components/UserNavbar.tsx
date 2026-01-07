"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, Home, Package, ChevronDown, Menu, X } from "lucide-react";

export default function UserNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/user/cart/count");
      const data = await res.json();
      if (data.success) {
        setCartCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  // Polling untuk real-time cart count
  useEffect(() => {
    fetchCartCount();
    const interval = setInterval(fetchCartCount, 10000); // Update setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div style={styles.navbar}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .cart-icon:hover {
          transform: scale(1.1);
        }
        .nav-link:hover {
          color: #800000;
        }
        .dropdown-item:hover {
          background: #fdf2f2;
          transform: translateX(5px);
        }
        .mobile-menu-item:hover {
          background: #fdf2f2;
        }
        .badge-pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      {/* Desktop Navigation */}
      <div style={styles.navbarContainer}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <Link href="/user" style={styles.logo}>
            <div style={styles.logoIcon}>
              <Home size={24} />
            </div>
            <span style={styles.logoText}>
              E-Commerce<span style={styles.logoHighlight}> Lyta</span>
            </span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div style={styles.desktopMenu}>
          <Link
            href="/user"
            style={{
              ...styles.navLink,
              ...(isActive("/user") ? styles.navLinkActive : {})
            }}
            className="nav-link"
          >
            <Home size={20} style={{ marginRight: '8px' }} />
            Beranda
          </Link>
          
          <Link
            href="/user/orders"
            style={{
              ...styles.navLink,
              ...(isActive("/user/orders") ? styles.navLinkActive : {})
            }}
            className="nav-link"
          >
            <Package size={20} style={{ marginRight: '8px' }} />
            Pesanan
          </Link>
        </div>

        {/* Desktop Right Menu */}
        <div style={styles.rightMenu}>
          {/* Cart Button */}
          <Link href="/user/cart" style={styles.cartButton}>
            <div style={styles.cartIcon} className="cart-icon">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <div 
                  style={styles.cartBadge} 
                  className={cartCount > 0 ? 'badge-pulse' : ''}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </div>
              )}
            </div>
            <span style={styles.cartText}>Keranjang</span>
          </Link>

          {/* User Dropdown */}
          <div 
            style={styles.userDropdown}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button style={styles.userButton}>
              <div style={styles.userAvatar}>
                <User size={20} />
              </div>
              <span style={styles.userName}>Akun</span>
              <ChevronDown size={16} style={styles.dropdownChevron} />
            </button>

            {isDropdownOpen && (
              <div style={styles.dropdownMenu}>
                <div style={styles.dropdownHeader}>
                  <div style={styles.dropdownAvatar}>
                    <User size={24} />
                  </div>
                  <div>
                    <p style={styles.dropdownTitle}>Akun Anda</p>
                    <p style={styles.dropdownSubtitle}>Pengguna Terdaftar</p>
                  </div>
                </div>

                <div style={styles.dropdownDivider}></div>

                <Link
                  href="/user/profile"
                  style={styles.dropdownItem}
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User size={18} style={{ marginRight: '12px' }} />
                  <div>
                    <p style={styles.dropdownItemTitle}>Profil</p>
                    <p style={styles.dropdownItemDesc}>Kelola akun Anda</p>
                  </div>
                </Link>

                <Link
                  href="/user/orders"
                  style={styles.dropdownItem}
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Package size={18} style={{ marginRight: '12px' }} />
                  <div>
                    <p style={styles.dropdownItemTitle}>Riwayat Pesanan</p>
                    <p style={styles.dropdownItemDesc}>Lihat pesanan Anda</p>
                  </div>
                </Link>

                <div style={styles.dropdownDivider}></div>

                <button
                  onClick={handleLogout}
                  style={styles.logoutButton}
                  className="dropdown-item"
                >
                  <LogOut size={18} style={{ marginRight: '12px' }} />
                  <div>
                    <p style={styles.logoutText}>Keluar</p>
                    <p style={styles.logoutDesc}>Logout dari akun</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={styles.mobileToggle}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={styles.mobileMenu}>
          <div style={styles.mobileMenuContent}>
            <Link
              href="/user"
              style={{
                ...styles.mobileMenuItem,
                ...(isActive("/user") ? styles.mobileMenuItemActive : {})
              }}
              onClick={() => setIsMenuOpen(false)}
              className="mobile-menu-item"
            >
              <Home size={20} style={{ marginRight: '12px' }} />
              Beranda
            </Link>

            <Link
              href="/user/orders"
              style={{
                ...styles.mobileMenuItem,
                ...(isActive("/user/orders") ? styles.mobileMenuItemActive : {})
              }}
              onClick={() => setIsMenuOpen(false)}
              className="mobile-menu-item"
            >
              <Package size={20} style={{ marginRight: '12px' }} />
              Pesanan
            </Link>

            <Link
              href="/user/profile"
              style={{
                ...styles.mobileMenuItem,
                ...(isActive("/user/profile") ? styles.mobileMenuItemActive : {})
              }}
              onClick={() => setIsMenuOpen(false)}
              className="mobile-menu-item"
            >
              <User size={20} style={{ marginRight: '12px' }} />
              Profil
            </Link>

            <Link
              href="/user/cart"
              style={styles.mobileMenuItem}
              onClick={() => setIsMenuOpen(false)}
              className="mobile-menu-item"
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCart size={20} style={{ marginRight: '12px' }} />
                Keranjang
              </div>
              {cartCount > 0 && (
                <div style={styles.mobileCartBadge}>
                  {cartCount > 99 ? '99+' : cartCount}
                </div>
              )}
            </Link>

            <div style={styles.mobileDivider}></div>

            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              style={styles.mobileLogout}
            >
              <LogOut size={20} style={{ marginRight: '12px' }} />
              Keluar
            </button>
          </div>
        </div>
      )}

      {/* Active Page Indicator */}
      <div style={styles.pageIndicator}>
        <div style={styles.indicatorContainer}>
          <div style={styles.indicatorDot}></div>
          <p style={styles.indicatorText}>
            {pathname === '/user' && 'Beranda'}
            {pathname === '/user/orders' && 'Pesanan'}
            {pathname === '/user/profile' && 'Profil'}
            {pathname === '/user/cart' && 'Keranjang'}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    background: 'white',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    position: 'sticky' as 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid #f3f4f6'
  },
  navbarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: '70px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  
  // Logo Section
  logoSection: {
    
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    gap: '12px'
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    background: 'linear-gradient(135deg, #800000, #a62626)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 6px 16px rgba(128, 0, 0, 0.2)'
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#111827',
    letterSpacing: '-0.5px'
  },
  logoHighlight: {
    color: '#800000'
  },
  
  // Desktop Menu
  desktopMenu: {
    display: 'flex',
    gap: '40px',
    marginLeft: '60px'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    color: '#4b5563',
    padding: '12px 0',
    position: 'relative' as 'relative',
    transition: 'color 0.3s ease'
  },
  navLinkActive: {
    color: '#800000',
    fontWeight: '700'
  },
  
  // Right Menu
  rightMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  
  // Cart Button
  cartButton: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '10px',
    background: '#f9fafb',
    transition: 'all 0.3s ease'
  },
  cartIcon: {
    position: 'relative' as 'relative',
    transition: 'transform 0.3s ease'
  },
  cartBadge: {
    position: 'absolute' as 'absolute',
    top: '-8px',
    right: '-8px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    fontSize: '11px',
    fontWeight: '900',
    borderRadius: '50%',
    minWidth: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
  },
  cartText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  
  // User Dropdown
  userDropdown: {
    position: 'relative' as 'relative'
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #800000, #a62626)',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 16px rgba(128, 0, 0, 0.2)'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userName: {
    
  },
  dropdownChevron: {
    transition: 'transform 0.3s ease'
  },
  
  // Dropdown Menu
  dropdownMenu: {
    position: 'absolute' as 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: '320px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e5e7eb',
    zIndex: 1001,
    animation: 'fadeIn 0.3s ease-out',
    overflow: 'hidden'
  },
  dropdownHeader: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'linear-gradient(135deg, #fdf2f2, #fce7e7)'
  },
  dropdownAvatar: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #800000, #a62626)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  dropdownTitle: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#111827',
    margin: 0
  },
  dropdownSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px'
  },
  dropdownDivider: {
    height: '1px',
    background: '#f3f4f6',
    margin: '0 24px'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 24px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s ease',
    borderBottom: '1px solid #f9fafb'
  },
  dropdownItemTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
    margin: 0
  },
  dropdownItemDesc: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '20px 24px',
    background: 'none',
    border: 'none',
    textAlign: 'left' as 'left',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  logoutText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#ef4444',
    margin: 0
  },
  logoutDesc: {
    fontSize: '13px',
    color: '#ef4444',
    opacity: 0.7,
    marginTop: '4px'
  },
  
  // Mobile Toggle
  mobileToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '#374151',
    cursor: 'pointer',
    padding: '8px'
  },
  
  // Mobile Menu
  mobileMenu: {
    position: 'absolute' as 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    borderTop: '1px solid #e5e7eb',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease-out'
  },
  mobileMenuContent: {
    padding: '20px 24px'
  },
  mobileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#374151',
    padding: '16px 20px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '10px',
    marginBottom: '8px',
    transition: 'all 0.3s ease'
  },
  mobileMenuItemActive: {
    background: '#fdf2f2',
    color: '#800000',
    fontWeight: '700'
  },
  mobileCartBadge: {
    marginLeft: 'auto',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    fontSize: '12px',
    fontWeight: '900',
    borderRadius: '20px',
    minWidth: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 8px'
  },
  mobileDivider: {
    height: '1px',
    background: '#f3f4f6',
    margin: '20px 0'
  },
  mobileLogout: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #fdf2f2, #fce7e7)',
    border: 'none',
    color: '#ef4444',
    fontSize: '16px',
    fontWeight: '700',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  
  // Page Indicator
  pageIndicator: {
    background: 'linear-gradient(90deg, #fdf2f2, #fce7e7)',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    borderTop: '1px solid #fce7e7'
  },
  indicatorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%'
  },
  indicatorDot: {
    width: '8px',
    height: '8px',
    background: '#800000',
    borderRadius: '50%'
  },
  indicatorText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#800000',
    textTransform: 'capitalize' as 'capitalize'
  }
};

// Responsive styles
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 1024px) {
      .navbar-container {
        padding: 0 20px !important;
      }
      
      .desktop-menu {
        gap: 24px !important;
        margin-left: 40px !important;
      }
    }
    
    @media (max-width: 768px) {
      .navbar-container {
        height: 60px !important;
        padding: 0 16px !important;
      }
      
      .desktop-menu {
        display: none !important;
      }
      
      .logo-text {
        font-size: 20px !important;
      }
      
      .logo-icon {
        width: 36px !important;
        height: 36px !important;
      }
      
      .mobile-toggle {
        display: block !important;
      }
      
      .cart-button span:last-child {
        display: none !important;
      }
      
      .user-button span:last-child {
        display: none !important;
      }
      
      .page-indicator {
        display: none !important;
      }
    }
    
    @media (max-width: 480px) {
      .dropdown-menu {
        width: 280px !important;
        right: -20px !important;
      }
      
      .right-menu {
        gap: 16px !important;
      }
      
      .cart-button {
        padding: 8px !important;
      }
      
      .user-button {
        padding: 8px 16px !important;
      }
      
      .mobile-menu-content {
        padding: 16px !important;
      }
    }
    
    .cart-button:hover {
      background: #f3f4f6;
      transform: translateY(-2px);
    }
    
    .user-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(128, 0, 0, 0.3);
    }
    
    .mobile-logout:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2);
    }
  `;
  document.head.appendChild(style);
}