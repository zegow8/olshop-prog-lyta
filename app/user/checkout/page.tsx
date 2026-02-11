"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  Truck, 
  Wallet,
  Smartphone,
  QrCode,
  Building,
  ArrowLeft,
  Home,
  Shield,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Instagram
} from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

const paymentMethods = [
  { id: "dana", name: "DANA", icon: <Wallet size={20} />, description: "Transfer ke 081234567890" },
  { id: "ovo", name: "OVO", icon: <Smartphone size={20} />, description: "Transfer ke 081234567891" },
  { id: "shopeepay", name: "ShopeePay", icon: <Smartphone size={20} />, description: "Transfer ke 081234567892" },
  { id: "gopay", name: "GoPay", icon: <Smartphone size={20} />, description: "Transfer ke 081234567893" },
  { id: "qris", name: "QRIS", icon: <QrCode size={20} />, description: "Scan QR code di kasir" },
  { id: "bank", name: "Bank Transfer", icon: <Building size={20} />, description: "BCA 1234567890 a/n Toko" },
  { id: "cod", name: "COD", icon: <Truck size={20} />, description: "Bayar saat barang sampai" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [address, setAddress] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [inputTotal, setInputTotal] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!address.trim()) {
      newErrors.address = "Alamat pengiriman harus diisi";
    }

    if (!selectedPayment) {
      newErrors.payment = "Pilih metode pembayaran";
    }

    if (!inputTotal) {
      newErrors.total = "Masukkan total pembayaran";
    } else if (parseInt(inputTotal) !== subtotal) {
      newErrors.total = `Total harus Rp ${subtotal.toLocaleString()}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          payment: selectedPayment,
          total: subtotal
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Pesanan berhasil dibuat! Terima kasih telah berbelanja.");
        router.push("/user/orders");
      } else {
        setErrors({ submit: data.error || "Gagal membuat pesanan" });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setErrors({ submit: "Terjadi kesalahan" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={styles.emptyState}>
        <h2 style={styles.emptyTitle}>Keranjang Kosong</h2>
        <p style={styles.emptyText}>Tambahkan produk ke keranjang terlebih dahulu</p>
        <button
          onClick={() => router.push("/user")}
          style={styles.shopButton}
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={styles.container}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .payment-method:hover {
            border-color: #800000;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(128, 0, 0, 0.1);
          }
          .payment-method.selected {
            animation: fadeIn 0.3s ease-out;
          }
          .checkout-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 20px 40px rgba(128, 0, 0, 0.4);
          }
          .back-btn:hover {
            color: #800000;
            transform: translateX(-5px);
          }
        `}</style>

        {/* Header */}
        <div style={styles.header}>
          <button
            onClick={() => router.back()}
            style={styles.backButton}
            className="back-btn"
          >
            <ArrowLeft size={20} style={{ marginRight: '8px' }} />
            Kembali ke Keranjang
          </button>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Checkout</h1>
            <p style={styles.subtitle}>Lengkapi data untuk menyelesaikan pesanan</p>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div style={styles.errorAlert}>
            <AlertCircle size={20} style={{ marginRight: '12px' }} />
            {errors.submit}
          </div>
        )}

        <div style={styles.contentGrid}>
          {/* Left Column - Form */}
          <div style={styles.formColumn}>
            {/* Shipping Address */}
            <div style={styles.formCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>
                  <Truck size={24} />
                </div>
                <h2 style={styles.cardTitle}>Alamat Pengiriman</h2>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  Alamat Lengkap <span style={styles.required}>*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4}
                  style={{
                    ...styles.textarea,
                    borderColor: errors.address ? '#ef4444' : '#e5e7eb'
                  }}
                  placeholder="Masukkan alamat lengkap pengiriman..."
                />
                {errors.address && (
                  <p style={styles.errorText}>{errors.address}</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div style={styles.formCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>
                  <CreditCard size={24} />
                </div>
                <h2 style={styles.cardTitle}>Metode Pembayaran</h2>
              </div>
              
              {/* Payment Methods Grid */}
              <div style={styles.paymentGrid}>
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    style={{
                      ...styles.paymentMethod,
                      borderColor: selectedPayment === method.id ? '#800000' : '#e5e7eb',
                      background: selectedPayment === method.id ? '#fdf2f2' : 'white'
                    }}
                    className={`payment-method ${selectedPayment === method.id ? 'selected' : ''}`}
                  >
                    <div style={styles.paymentHeader}>
                      <div style={styles.paymentIcon}>
                        {method.icon}
                      </div>
                      <span style={styles.paymentName}>{method.name}</span>
                      {selectedPayment === method.id && (
                        <CheckCircle size={16} style={styles.checkIcon} />
                      )}
                    </div>
                    <p style={styles.paymentDescription}>{method.description}</p>
                  </div>
                ))}
              </div>
              {errors.payment && (
                <p style={styles.errorText}>{errors.payment}</p>
              )}

              {/* Input Total */}
              <div style={styles.totalInputGroup}>
                <label style={styles.formLabel}>
                  Masukkan Total Pembayaran <span style={styles.required}>*</span>
                  <span style={styles.inputHint}>(Harus sama dengan total di samping)</span>
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.currencyLabel}>Rp</span>
                  <input
                    type="number"
                    value={inputTotal}
                    onChange={(e) => setInputTotal(e.target.value)}
                    style={{
                      ...styles.totalInput,
                      borderColor: errors.total ? '#ef4444' : '#e5e7eb'
                    }}
                    placeholder="Masukkan total pembayaran"
                  />
                </div>
                {errors.total && (
                  <p style={styles.errorText}>{errors.total}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div style={styles.summaryColumn}>
            <div style={styles.summaryCard}>
              <h2 style={styles.summaryTitle}>Ringkasan Pesanan</h2>

              {/* Order Items */}
              <div style={styles.orderItems}>
                <h3 style={styles.itemsTitle}>
                  Produk ({totalItems} item)
                </h3>
                <div style={styles.itemsList}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={styles.orderItem}>
                      <div style={styles.itemImage}>
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          style={styles.productImage}
                        />
                      </div>
                      <div style={styles.itemInfo}>
                        <p style={styles.itemName}>
                          {item.product.name}
                        </p>
                        <p style={styles.itemDetails}>
                          {item.quantity} × Rp {item.product.price.toLocaleString()}
                        </p>
                      </div>
                      <div style={styles.itemPrice}>
                        Rp {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={styles.priceBreakdown}>
                <div style={styles.priceRow}>
                  <span style={styles.priceLabel}>Subtotal</span>
                  <span style={styles.priceValue}>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div style={styles.priceRow}>
                  <span style={styles.priceLabel}>Pengiriman</span>
                  <span style={styles.freeShipping}>Gratis</span>
                </div>
                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total</span>
                  <div style={styles.totalAmount}>
                    <span style={styles.totalCurrency}>Rp</span>
                    <span style={styles.totalNumber}>{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div style={styles.securityInfo}>
                <Shield size={18} style={styles.securityIcon} />
                <div>
                  <p style={styles.securityTitle}>Pembayaran Aman</p>
                  <p style={styles.securityText}>
                    Data Anda terlindungi dengan enkripsi 256-bit
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={submitting}
                style={submitting ? styles.checkoutButtonDisabled : styles.checkoutButton}
                className="checkout-btn"
              >
                {submitting ? (
                  <>
                    <div style={styles.submittingSpinner}></div>
                    <span style={{ marginLeft: '12px' }}>Memproses...</span>
                  </>
                ) : (
                  'Konfirmasi Pesanan'
                )}
              </button>

              <p style={styles.termsText}>
                Dengan mengkonfirmasi pesanan, Anda menyetujui syarat dan ketentuan kami
              </p>
            </div>

            {/* Continue Shopping */}
            <button
              onClick={() => router.push("/user")}
              style={styles.continueButton}
            >
              <Home size={18} style={{ marginRight: '8px' }} />
              Lanjutkan Belanja
            </button>
          </div>
        </div>
      </div>

      {/* Footer Minimal */}
      <footer style={{
        background: '#f8f9fa',
        padding: '40px 20px 20px',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginBottom: '30px'
        }}>
          <a 
            href="mailto:earlytadwi7@gmail.com"
            style={{
              color: '#4b5563',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#800000'}
            onMouseOut={(e) => e.currentTarget.style.color = '#4b5563'}
          >
            <Mail size={20} />
            <span style={{ fontSize: '12px', marginTop: '5px' }}>Email</span>
          </a>
          
          <a 
            href="https://wa.me/6281547184307" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#4b5563',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#800000'}
            onMouseOut={(e) => e.currentTarget.style.color = '#4b5563'}
          >
            <Phone size={20} />
            <span style={{ fontSize: '12px', marginTop: '5px' }}>WhatsApp</span>
          </a>
          
          <a 
            href="https://instagram.com/eddlyaa__" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#4b5563',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#800000'}
            onMouseOut={(e) => e.currentTarget.style.color = '#4b5563'}
          >
            <Instagram size={20} />
            <span style={{ fontSize: '12px', marginTop: '5px' }}>Instagram</span>
          </a>
        </div>
        
        <div style={{
          color: '#6b7280',
          fontSize: '14px',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '20px'
        }}>
          © 2026 E-commerce Lyta
        </div>
      </footer>
    </>
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
  emptyState: {
    textAlign: 'center' as 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    maxWidth: '500px',
    margin: '40px auto'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#111827',
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
  },
  
  // Header
  header: {
    marginBottom: '40px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#4b5563',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: '16px',
    transition: 'all 0.3s ease'
  },
  titleSection: {
    
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
  
  // Error Alert
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderLeft: '4px solid #ef4444',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '30px',
    fontSize: '14px',
    color: '#dc2626',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center'
  },
  
  // Content Grid
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '30px'
  },
  
  // Form Column
  formColumn: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '30px'
  },
  formCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  cardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #800000, #a62626)',
    borderRadius: '12px',
    color: 'white'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#111827',
    margin: 0
  },
  formGroup: {
    
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '12px'
  },
  required: {
    color: '#ef4444'
  },
  textarea: {
    width: '100%',
    padding: '16px',
    fontSize: '15px',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    color: '#111827',
    outline: 'none',
    transition: 'all 0.3s ease',
    resize: 'vertical' as 'vertical'
  },
  errorText: {
    fontSize: '13px',
    color: '#ef4444',
    marginTop: '8px',
    fontWeight: '500'
  },
  
  // Payment Methods
  paymentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '30px'
  },
  paymentMethod: {
    border: '2px solid',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'white'
  },
  paymentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    position: 'relative' as 'relative'
  },
  paymentIcon: {
    color: '#800000'
  },
  paymentName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    flex: 1
  },
  checkIcon: {
    color: '#10b981'
  },
  paymentDescription: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.4
  },
  
  // Total Input
  totalInputGroup: {
    
  },
  inputHint: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 'normal',
    marginLeft: '8px'
  },
  inputWrapper: {
    position: 'relative' as 'relative'
  },
  currencyLabel: {
    position: 'absolute' as 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151'
  },
  totalInput: {
    width: '100%',
    padding: '16px 16px 16px 48px',
    fontSize: '16px',
    fontWeight: '600',
    background: '#f9fafb',
    border: '2px solid',
    borderRadius: '10px',
    color: '#111827',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  
  // Summary Column
  summaryColumn: {
    
  },
  summaryCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
    position: 'sticky' as 'sticky',
    top: '30px'
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#111827',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '2px solid #f3f4f6'
  },
  orderItems: {
    marginBottom: '24px'
  },
  itemsTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '16px'
  },
  itemsList: {
    maxHeight: '240px',
    overflowY: 'auto' as 'auto',
    paddingRight: '8px'
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  itemImage: {
    width: '48px',
    height: '48px',
    background: '#f3f4f6',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as 'cover'
  },
  itemInfo: {
    flex: 1,
    marginLeft: '16px'
  },
  itemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
    lineHeight: 1.3
  },
  itemDetails: {
    fontSize: '12px',
    color: '#6b7280'
  },
  itemPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#800000',
    marginLeft: '16px'
  },
  priceBreakdown: {
    marginBottom: '24px'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  priceLabel: {
    fontSize: '14px',
    color: '#4b5563'
  },
  priceValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827'
  },
  freeShipping: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#10b981'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0'
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827'
  },
  totalAmount: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px'
  },
  totalCurrency: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#800000'
  },
  totalNumber: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#800000',
    letterSpacing: '-0.5px'
  },
  
  // Security Info
  securityInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#f0f9ff',
    border: '1px solid #e0f2fe',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px'
  },
  securityIcon: {
    color: '#0369a1'
  },
  securityTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0369a1',
    marginBottom: '2px'
  },
  securityText: {
    fontSize: '12px',
    color: '#0c4a6e'
  },
  
  // Checkout Button
  checkoutButton: {
    width: '100%',
    padding: '20px',
    background: 'linear-gradient(to right, #800000, #a62626)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 15px 30px rgba(128, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkoutButtonDisabled: {
    width: '100%',
    padding: '20px',
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
  submittingSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  termsText: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center' as 'center',
    marginTop: '16px',
    lineHeight: 1.4
  },
  
  // Continue Shopping
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
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

// Responsive styles
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (min-width: 1024px) {
      .content-grid {
        grid-template-columns: 2fr 1fr !important;
      }
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 20px !important;
      }
      
      .form-card,
      .summary-card {
        padding: 20px !important;
      }
      
      .payment-grid {
        grid-template-columns: 1fr !important;
      }
      
      .card-icon {
        width: 40px !important;
        height: 40px !important;
      }
      
      .card-title {
        font-size: 18px !important;
      }
      
      .title {
        font-size: 28px !important;
      }
    }
    
    @media (max-width: 480px) {
      .container {
        padding: 16px !important;
      }
      
      .header {
        margin-bottom: 30px !important;
      }
      
      .order-item {
        align-items: flex-start !important;
      }
      
      .item-info {
        margin-left: 12px !important;
      }
      
      .item-price {
        margin-left: 12px !important;
        font-size: 13px !important;
      }
      
      .checkout-button,
      .checkout-button-disabled {
        padding: 16px !important;
        font-size: 15px !important;
      }
    }
    
    .continue-button:hover {
      background: #f9fafb;
      border-color: #800000;
      color: #800000;
    }
    
    .textarea:focus,
    .total-input:focus {
      border-color: #800000;
      background: white;
      box-shadow: 0 0 0 4px rgba(128, 0, 0, 0.1);
    }
  `;
  document.head.appendChild(style);
}