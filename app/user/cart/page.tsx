"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Package
} from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
  };
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const res = await fetch("/api/user/cart");
      const data = await res.json();
      if (data.success) {
        setCartItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Update quantity
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(itemId);
    try {
      const res = await fetch("/api/user/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      const data = await res.json();

      if (data.success) {
        fetchCartItems();
      } else {
        alert(data.error || "Gagal mengupdate kuantitas");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Terjadi kesalahan");
    } finally {
      setUpdating(null);
    }
  };

  // Remove item
  const removeItem = async (itemId: string) => {
    setRemoving(itemId);
    try {
      const res = await fetch("/api/user/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();

      if (data.success) {
        fetchCartItems();
      } else {
        alert(data.error || "Gagal menghapus item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Terjadi kesalahan");
    } finally {
      setRemoving(null);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Keranjang kosong!");
      return;
    }
    router.push("/user/checkout");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .cart-item:hover {
          border-color: #800000;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.95);
        }
        .checkout-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(128, 0, 0, 0.4);
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Keranjang Belanja</h1>
        <p style={styles.subtitle}>
          {totalItems} item di keranjang
        </p>
      </div>

      {cartItems.length > 0 ? (
        <div style={styles.contentGrid}>
          {/* Cart Items */}
          <div style={styles.itemsColumn}>
            <div style={styles.cartList}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.cartItem} className="cart-item">
                  {/* Product Image */}
                  <div style={styles.productImageContainer}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={styles.productImage}
                    />
                  </div>

                  {/* Product Info */}
                  <div style={styles.productInfo}>
                    <div style={styles.productHeader}>
                      <div>
                        <h3 style={styles.productName}>
                          {item.product.name}
                        </h3>
                        <p style={styles.unitPrice}>
                          Rp {item.product.price.toLocaleString()}
                        </p>
                        <p style={styles.stockInfo}>
                          Stok: {item.product.stock}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={removing === item.id}
                        style={styles.removeButton}
                      >
                        {removing === item.id ? (
                          <div style={styles.removingSpinner}></div>
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div style={styles.controlsRow}>
                      <div style={styles.quantityControls}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updating === item.id}
                          style={styles.quantityButton}
                        >
                          <Minus size={16} />
                        </button>
                        <div style={styles.quantityDisplay}>
                          {updating === item.id ? (
                            <div style={styles.updatingSpinner}></div>
                          ) : (
                            <span style={styles.quantityText}>{item.quantity}</span>
                          )}
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock || updating === item.id}
                          style={styles.quantityButton}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div style={styles.itemTotal}>
                        <div style={styles.totalPrice}>
                          Rp {(item.product.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div style={styles.summaryColumn}>
            <div style={styles.summaryCard}>
              <h2 style={styles.summaryTitle}>Ringkasan Belanja</h2>

              <div style={styles.summaryItems}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Total ({totalItems} item)</span>
                  <span style={styles.summaryValue}>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Biaya Pengiriman</span>
                  <span style={styles.freeShipping}>Gratis</span>
                </div>
              </div>

              <div style={styles.totalSection}>
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total Bayar</span>
                  <div style={styles.totalAmount}>
                    <span style={styles.totalNumber}>Rp {subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                style={cartItems.length === 0 ? styles.checkoutButtonDisabled : styles.checkoutButton}
                className="checkout-btn"
              >
                Lanjut ke Checkout
                <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </button>

              <p style={styles.noteText}>
                *Harga sudah termasuk PPN
              </p>
            </div>

            {/* Continue Shopping */}
            <button
              onClick={() => router.push("/user")}
              style={styles.continueButton}
            >
              Lanjutkan Belanja
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <Package size={64} style={styles.emptyIcon} />
          <h3 style={styles.emptyTitle}>
            Keranjang Belanja Kosong
          </h3>
          <p style={styles.emptyText}>
            Yuk tambahkan produk favoritmu ke keranjang!
          </p>
          <button
            onClick={() => router.push("/user")}
            style={styles.shopButton}
          >
            Mulai Belanja
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    background: 'linear-gradient(135deg, #fdf2f2 0%, #f9fafb 100%)',
    minHeight: '100vh'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #800000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  // Header
  header: {
    marginBottom: '40px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.5px',
    position: 'relative' as 'relative',
    display: 'inline-block'
  },
  subtitle: {
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '8px'
  },
  
  // Content Grid
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '30px'
  },
  
  // Items Column
  itemsColumn: {
    
  },
  cartList: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '20px'
  },
  cartItem: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    gap: '24px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.4s ease'
  },
  productImageContainer: {
    flexShrink: 0
  },
  productImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover' as 'cover',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'space-between'
  },
  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  productName: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#111827',
    marginBottom: '8px'
  },
  unitPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#800000',
    marginBottom: '4px'
  },
  stockInfo: {
    fontSize: '14px',
    color: '#6b7280'
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '8px'
  },
  removingSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #fee2e2',
    borderTop: '2px solid #ef4444',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  quantityButton: {
    width: '36px',
    height: '36px',
    border: '2px solid #e5e7eb',
    background: 'white',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  quantityDisplay: {
    width: '40px',
    textAlign: 'center' as 'center'
  },
  quantityText: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827'
  },
  updatingSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #e5e7eb',
    borderTop: '2px solid #800000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  },
  itemTotal: {
    
  },
  totalPrice: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#800000'
  },
  
  // Summary Column
  summaryColumn: {
    
  },
  summaryCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb',
    marginBottom: '20px'
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#111827',
    marginBottom: '24px'
  },
  summaryItems: {
    marginBottom: '20px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#4b5563'
  },
  summaryValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827'
  },
  freeShipping: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#10b981'
  },
  totalSection: {
    marginBottom: '24px',
    paddingTop: '16px',
    borderTop: '2px solid #e5e7eb'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827'
  },
  totalAmount: {
    
  },
  totalNumber: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#800000'
  },
  checkoutButton: {
    width: '100%',
    padding: '18px',
    background: 'linear-gradient(to right, #800000, #a62626)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px rgba(128, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkoutButtonDisabled: {
    width: '100%',
    padding: '18px',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '900',
    cursor: 'not-allowed',
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  noteText: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center' as 'center',
    marginTop: '16px'
  },
  continueButton: {
    width: '100%',
    padding: '16px',
    background: 'white',
    border: '2px solid #e5e7eb',
    color: '#374151',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  },
  
  // Empty State
  emptyState: {
    background: 'white',
    borderRadius: '16px',
    padding: '60px',
    textAlign: 'center' as 'center',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb'
  },
  emptyIcon: {
    color: '#9ca3af',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '12px'
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '16px',
    marginBottom: '24px'
  },
  shopButton: {
    padding: '14px 32px',
    background: 'linear-gradient(to right, #800000, #a62626)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px rgba(128, 0, 0, 0.3)'
  }
};

// Responsive styles
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (min-width: 768px) {
      .content-grid {
        grid-template-columns: 2fr 1fr !important;
      }
    }
    
    @media (max-width: 767px) {
      .cart-item {
        flex-direction: column;
        gap: 16px;
      }
      
      .product-image-container {
        width: 100%;
      }
      
      .product-image {
        width: 100%;
        height: 200px;
      }
    }
    
    .quantity-button:hover:not(:disabled) {
      background: #fdf2f2;
      border-color: #800000;
    }
    
    .continue-button:hover {
      background: #f9fafb;
      border-color: #800000;
      color: #800000;
    }
    
    .shop-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(128, 0, 0, 0.4);
    }
  `;
  document.head.appendChild(style);
}