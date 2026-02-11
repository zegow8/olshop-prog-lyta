"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Clock, 
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  ShoppingBag,
  Home,
  MapPin,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  Instagram
} from "lucide-react";

interface Order {
  id: string;
  total: number;
  status: string;
  address: string;
  payment: string;
  createdAt: string;
  items: {
    quantity: number;
    product: {
      name: string;
      price: number;
      image: string;
    };
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/user/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Get status icon and color - UPDATE WARNANYA JADI LEBIH BOLD
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return { 
          icon: <Clock size={14} />, 
          bgColor: "linear-gradient(135deg, #f59e0b, #d97706)",
          textColor: "white",
          label: "PENDING",
          shadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
        };
      case "PAID":
        return { 
          icon: <CheckCircle size={14} />, 
          bgColor: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          textColor: "white",
          label: "PAID",
          shadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
        };
      case "SHIPPED":
        return { 
          icon: <Truck size={14} />, 
          bgColor: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          textColor: "white",
          label: "SHIPPED",
          shadow: "0 4px 12px rgba(139, 92, 246, 0.3)"
        };
      case "DELIVERED":
        return { 
          icon: <Package size={14} />, 
          bgColor: "linear-gradient(135deg, #10b981, #059669)",
          textColor: "white",
          label: "DELIVERED",
          shadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
        };
      case "CANCELLED":
        return { 
          icon: <XCircle size={14} />, 
          bgColor: "linear-gradient(135deg, #ef4444, #dc2626)",
          textColor: "white",
          label: "CANCELLED",
          shadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
        };
      default:
        return { 
          icon: <Clock size={14} />, 
          bgColor: "linear-gradient(135deg, #6b7280, #4b5563)",
          textColor: "white",
          label: status.toUpperCase(),
          shadow: "0 4px 12px rgba(107, 114, 128, 0.3)"
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: 'long',
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
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
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .order-row {
            animation: slideIn 0.5s ease-out forwards;
            opacity: 0;
          }
          .view-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          }
          .shop-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(128, 0, 0, 0.4);
          }
          .status-badge {
            font-weight: 900;
            letter-spacing: 0.5px;
          }
        `}</style>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <div style={styles.headerIcon}>
                <ShoppingBag size={28} color="white" />
              </div>
              <div>
                <h1 style={styles.title}>Riwayat Pesanan</h1>
                <p style={styles.subtitle}>
                  {orders.length} pesanan ditemukan
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = "/user"}
              style={styles.shopButton}
            >
              <Home size={18} style={{ marginRight: '8px' }} />
              Belanja Lagi
            </button>
          </div>
        </div>

        {orders.length > 0 ? (
          <div style={styles.tableContainer}>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCell}>ID Pesanan</th>
                    <th style={styles.tableHeaderCell}>Tanggal</th>
                    <th style={styles.tableHeaderCell}>Total</th>
                    <th style={styles.tableHeaderCell}>Status</th>
                    <th style={styles.tableHeaderCell}>Pembayaran</th>
                    <th style={styles.tableHeaderCell}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <tr 
                        key={order.id} 
                        style={{
                          ...styles.tableRow,
                          animationDelay: `${index * 0.1}s`
                        }}
                        className="order-row"
                      >
                        <td style={styles.tableCell}>
                          <div style={styles.orderId}>
                            #{order.id.substring(0, 8)}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.orderDate}>
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.orderTotal}>
                            Rp {order.total.toLocaleString()}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div 
                            style={{
                              ...styles.statusBadge,
                              background: statusInfo.bgColor,
                              color: statusInfo.textColor,
                              boxShadow: statusInfo.shadow
                            }}
                            className="status-badge"
                          >
                            <span style={styles.statusIcon}>
                              {statusInfo.icon}
                            </span>
                            <span style={styles.statusLabel}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.paymentMethod}>
                            <CreditCard size={14} style={{ marginRight: '6px' }} />
                            {order.payment}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <button
                            onClick={() => viewOrderDetails(order)}
                            style={styles.viewButton}
                            className="view-btn"
                            title="Lihat Detail"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIllustration}>
              <Package size={80} style={styles.emptyIcon} />
              <div style={styles.bagIcon}>
                <ShoppingBag size={40} style={styles.bagIconInner} />
              </div>
            </div>
            <div style={styles.emptyContent}>
              <h3 style={styles.emptyTitle}>Belum ada pesanan</h3>
              <p style={styles.emptyText}>
                Yuk mulai belanja dan buat pesanan pertamamu!
              </p>
              <button
                onClick={() => window.location.href = "/user"}
                style={styles.emptyButton}
                className="shop-btn"
              >
                <ShoppingBag size={18} style={{ marginRight: '10px' }} />
                Mulai Belanja
              </button>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div 
            style={styles.modalOverlay} 
            onClick={() => setShowDetailModal(false)}
          >
            <div 
              style={styles.modalContainer} 
              onClick={(e) => e.stopPropagation()}  
            >
              {/* Modal Header */}
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>Detail Pesanan</h2>
                  <p style={styles.modalSubtitle}>ID: #{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={styles.closeButton}
                >
                  ✕
                </button>
              </div>

              <div style={styles.modalContent}>
                {/* Order Info */}
                <div style={styles.infoGrid}>
                  <div style={styles.infoCard}>
                    <div style={styles.infoCardHeader}>
                      <Calendar size={20} style={styles.infoCardIcon} />
                      <h3 style={styles.infoCardTitle}>Informasi Pesanan</h3>
                    </div>
                    <div style={styles.infoCardContent}>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Tanggal:</span>
                        <span style={styles.infoValue}>{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Pembayaran:</span>
                        <span style={styles.infoValue}>{selectedOrder.payment}</span>
                      </div>
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Status:</span>
                        <span style={{
                          ...styles.statusBadge,
                          background: getStatusInfo(selectedOrder.status).bgColor,
                          color: getStatusInfo(selectedOrder.status).textColor,
                          boxShadow: getStatusInfo(selectedOrder.status).shadow
                        }}>
                          {getStatusInfo(selectedOrder.status).icon}
                          <span style={{ marginLeft: '6px' }}>
                            {getStatusInfo(selectedOrder.status).label}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.infoCard}>
                    <div style={styles.infoCardHeader}>
                      <MapPin size={20} style={styles.infoCardIcon} />
                      <h3 style={styles.infoCardTitle}>Alamat Pengiriman</h3>
                    </div>
                    <div style={styles.infoCardContent}>
                      <p style={styles.addressText}>{selectedOrder.address}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <h3 style={styles.sectionTitle}>Items Pesanan</h3>
                <div style={styles.itemsContainer}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={styles.itemsTable}>
                      <thead>
                        <tr style={styles.itemsTableHeader}>
                          <th style={styles.itemsTableHeaderCell}>Produk</th>
                          <th style={styles.itemsTableHeaderCell}>Harga</th>
                          <th style={styles.itemsTableHeaderCell}>Qty</th>
                          <th style={styles.itemsTableHeaderCell}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index} style={styles.itemsTableRow}>
                            <td style={styles.itemsTableCell}>
                              <div style={styles.productInfo}>
                                <div style={styles.productImageContainer}>
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    style={styles.productImage}
                                  />
                                </div>
                                <div style={styles.productName}>
                                  {item.product.name}
                                </div>
                              </div>
                            </td>
                            <td style={styles.itemsTableCell}>
                              <div style={styles.productPrice}>
                                Rp {item.product.price.toLocaleString()}
                              </div>
                            </td>
                            <td style={styles.itemsTableCell}>
                              <div style={styles.productQuantity}>
                                {item.quantity}
                              </div>
                            </td>
                            <td style={styles.itemsTableCell}>
                              <div style={styles.productSubtotal}>
                                Rp {(item.product.price * item.quantity).toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total */}
                <div style={styles.totalContainer}>
                  <div style={styles.totalRow}>
                    <span style={styles.totalLabel}>Total Pembayaran</span>
                    <div style={styles.totalAmount}>
                      <span style={styles.totalCurrency}>Rp</span>
                      <span style={styles.totalNumber}>{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div style={styles.modalActions}>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    style={styles.closeModalButton}
                  >
                    Tutup Detail
                  </button>
                  <button
                    onClick={() => window.location.href = "/user"}
                    style={styles.shopMoreButton}
                  >
                    <ShoppingBag size={18} style={{ marginRight: '8px' }} />
                    Belanja Lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
  
  // Header
  header: {
    marginBottom: '40px'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as 'wrap',
    gap: '20px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  headerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #800000, #a62626)',
    borderRadius: '14px',
    boxShadow: '0 10px 25px rgba(128, 0, 0, 0.3)'
  },
  title: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#111827',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#4b5563',
    fontWeight: '500',
    marginTop: '4px'
  },
  shopButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #800000, #a62626)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px rgba(128, 0, 0, 0.3)'
  },
  
  // Table
  tableContainer: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as 'collapse'
  },
  tableHeader: {
    background: 'linear-gradient(135deg, #5a0000, #800000)'
  },
  tableHeaderCell: {
    padding: '20px',
    textAlign: 'left' as 'left',
    fontSize: '11px',
    fontWeight: '900',
    color: 'white',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '1px',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background 0.3s ease'
  },
  tableCell: {
    padding: '20px'
  },
  orderId: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'monospace'
  },
  orderDate: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500'
  },
  orderTotal: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#800000'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '900',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.5px',
    border: 'none'
  },
  statusIcon: {
    marginRight: '6px'
  },
  statusLabel: {
    
  },
  paymentMethod: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500'
  },
  viewButton: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
  },
  
  // Empty State
  emptyState: {
    background: 'white',
    borderRadius: '20px',
    padding: '60px',
    textAlign: 'center' as 'center',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb',
    maxWidth: '500px',
    margin: '0 auto'
  },
  emptyIllustration: {
    position: 'relative' as 'relative',
    marginBottom: '40px'
  },
  emptyIcon: {
    color: '#f3f4f6',
    margin: '0 auto'
  },
  bagIcon: {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80px',
    height: '80px',
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(128, 0, 0, 0.15)'
  },
  bagIconInner: {
    color: '#800000'
  },
  emptyContent: {
    
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#111827',
    marginBottom: '12px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px',
    lineHeight: 1.5
  },
  emptyButton: {
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #800000, #a62626)',
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
    justifyContent: 'center',
    margin: '0 auto'
  },
  
  // Modal
  modalOverlay: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContainer: {
    background: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)'
  },
  modalHeader: {
    padding: '28px',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(135deg, #5a0000, #800000)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: 'white',
    margin: 0
  },
  modalSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    marginTop: '4px'
  },
  closeButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: 'white',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s ease'
  },
  modalContent: {
    padding: '28px'
  },
  
  // Info Grid
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
    marginBottom: '32px'
  },
  infoCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px'
  },
  infoCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  infoCardIcon: {
    color: '#800000'
  },
  infoCardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: 0
  },
  infoCardContent: {
    
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f6'
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  infoValue: {
    fontSize: '14px',
    color: '#111827'
  },
  addressText: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: 1.5
  },
  
  // Section Title
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '20px'
  },
  
  // Items Table
  itemsContainer: {
    marginBottom: '32px'
  },
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse' as 'collapse',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  itemsTableHeader: {
    background: '#f3f4f6'
  },
  itemsTableHeaderCell: {
    padding: '16px',
    textAlign: 'left' as 'left',
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e5e7eb'
  },
  itemsTableRow: {
    borderBottom: '1px solid #e5e7eb'
  },
  itemsTableCell: {
    padding: '16px'
  },
  productInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  productImageContainer: {
    width: '60px',
    height: '60px',
    background: '#f3f4f6',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as 'cover'
  },
  productName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827'
  },
  productPrice: {
    fontSize: '14px',
    color: '#374151'
  },
  productQuantity: {
    fontSize: '14px',
    color: '#111827',
    fontWeight: '600'
  },
  productSubtotal: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#800000'
  },
  
  // Total
  totalContainer: {
    borderTop: '2px solid #e5e7eb',
    paddingTop: '24px',
    marginBottom: '32px'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: '20px',
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
    fontSize: '32px',
    fontWeight: '900',
    color: '#800000',
    letterSpacing: '-0.5px'
  },
  
  // Modal Actions
  modalActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as 'wrap',
    gap: '16px'
  },
  closeModalButton: {
    padding: '14px 28px',
    border: '2px solid #d1d5db',
    background: 'transparent',
    color: '#374151',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  shopMoreButton: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #800000, #a62626)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px rgba(128, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

// Responsive styles
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (min-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr 1fr !important;
      }
    }
    
    @media (max-width: 767px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .table {
        display: block;
        overflow-x: auto;
      }
      
      .table-header-cell,
      .table-cell {
        padding: 16px 12px;
        font-size: 12px;
      }
      
      .order-id {
        font-size: 12px;
      }
      
      .status-badge {
        font-size: 10px;
        padding: 6px 12px;
      }
      
      .modal-container {
        margin: 20px;
      }
      
      .modal-actions {
        flex-direction: column;
      }
      
      .close-modal-button,
      .shop-more-button {
        width: 100%;
        text-align: center;
      }
    }
    
    .table-row:hover {
      background: #fdf2f2;
    }
    
    .shop-button:hover,
    .shop-more-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(128, 0, 0, 0.4);
    }
    
    .close-modal-button:hover {
      background: #f3f4f6;
      border-color: #800000;
      color: #800000;
    }
  `;
  document.head.appendChild(style);
}