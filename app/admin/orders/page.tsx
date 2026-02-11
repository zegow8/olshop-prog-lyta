"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Clock,
  AlertCircle,
  Instagram
} from "lucide-react";

interface Order {
  id: string;
  total: number;
  status: string;
  address: string;
  payment: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  items: {
    quantity: number;
    product: {
      name: string;
      price: number;
      image: string;
    };
  }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
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

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.user.email.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return { 
          icon: <Clock size={16} />, 
          bgColor: "#fef3c7",
          textColor: "#92400e",
          borderColor: "#f59e0b",
          label: "Pending" 
        };
      case "PAID":
        return { 
          icon: <CheckCircle size={16} />, 
          bgColor: "#dbeafe",
          textColor: "#1e40af",
          borderColor: "#3b82f6",
          label: "Paid" 
        };
      case "SHIPPED":
        return { 
          icon: <Truck size={16} />, 
          bgColor: "#f3e8ff",
          textColor: "#6b21a8",
          borderColor: "#a855f7",
          label: "Shipped" 
        };
      case "DELIVERED":
        return { 
          icon: <Package size={16} />, 
          bgColor: "#d1fae5",
          textColor: "#065f46",
          borderColor: "#10b981",
          label: "Delivered" 
        };
      case "CANCELLED":
        return { 
          icon: <XCircle size={16} />, 
          bgColor: "#fee2e2",
          textColor: "#991b1b",
          borderColor: "#ef4444",
          label: "Cancelled" 
        };
      default:
        return { 
          icon: <Clock size={16} />, 
          bgColor: "#f3f4f6",
          textColor: "#374151",
          borderColor: "#9ca3af",
          label: status 
        };
    }
  };

  // Get next status options
  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case "PENDING":
        return ["PAID", "CANCELLED"];
      case "PAID":
        return ["SHIPPED", "CANCELLED"];
      case "SHIPPED":
        return ["DELIVERED"];
      case "DELIVERED":
        return [];
      case "CANCELLED":
        return [];
      default:
        return [];
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch("/api/admin/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        alert("Status pesanan berhasil diupdate!");
      } else {
        alert(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #800000',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        padding: '30px',
        background: 'linear-gradient(135deg, #fdf2f2 0%, #f9fafb 100%)',
        minHeight: '100vh'
      }}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .search-input:focus {
            border-color: #800000;
            box-shadow: 0 0 0 3px rgba(128, 0, 0, 0.1);
          }
          .status-select:focus {
            border-color: #800000;
            box-shadow: 0 0 0 3px rgba(128, 0, 0, 0.1);
          }
        `}</style>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#111827',
            marginBottom: '8px',
            position: 'relative',
            display: 'inline-block'
          }}>
            Kelola Pesanan
            <span style={{
              position: 'absolute',
              bottom: '-8px',
              left: 0,
              width: '60px',
              height: '4px',
              background: 'linear-gradient(to right, #800000, #a62626)',
              borderRadius: '2px'
            }}></span>
          </h1>
          <p style={{
            color: '#4b5563',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Total {filteredOrders.length} pesanan ditemukan
          </p>
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af'
            }} size={20} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, atau ID pesanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 56px',
                fontSize: '15px',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                color: '#111827',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}
              className="search-input"
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Filter size={20} style={{ color: '#6b7280' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                flex: 1,
                padding: '16px 20px',
                fontSize: '15px',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                color: '#111827',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}
              className="status-select"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' as 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #5a0000, #800000)'
                }}>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '900',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>ID Pesanan</th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '900',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>Customer</th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '900',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>Tanggal</th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '900',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>Total</th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '900',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>Status</th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '900',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const nextStatusOptions = getNextStatusOptions(order.status);

                  return (
                    <tr key={order.id} style={{
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background 0.3s ease'
                    }}>
                      <td style={{ padding: '20px' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: '#111827',
                          fontFamily: 'monospace'
                        }}>
                          #{order.id.substring(0, 8)}
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#111827',
                            marginBottom: '4px'
                          }}>
                            {order.user.name || "-"}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#6b7280'
                          }}>
                            {order.user.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{
                          fontSize: '14px',
                          color: '#374151',
                          fontWeight: '500'
                        }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '900',
                          color: '#800000'
                        }}>
                          Rp {order.total.toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '900',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: statusInfo.bgColor,
                          color: statusInfo.textColor,
                          border: `1px solid ${statusInfo.borderColor}`,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                        }}>
                          <span style={{ marginRight: '6px' }}>
                            {statusInfo.icon}
                          </span>
                          {statusInfo.label}
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <button
                            onClick={() => viewOrderDetails(order)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '40px',
                              height: '40px',
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                            }}
                            title="Lihat Detail"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {nextStatusOptions.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <select
                                value=""
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                disabled={updatingStatus === order.id}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '13px',
                                  background: updatingStatus === order.id ? '#f3f4f6' : 'white',
                                  border: '2px solid #e5e7eb',
                                  borderRadius: '8px',
                                  color: updatingStatus === order.id ? '#9ca3af' : '#111827',
                                  outline: 'none',
                                  cursor: updatingStatus === order.id ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                <option value="">Ubah Status</option>
                                {nextStatusOptions.map((status) => {
                                  const nextStatusInfo = getStatusInfo(status);
                                  return (
                                    <option key={status} value={status}>
                                      → {nextStatusInfo.label}
                                    </option>
                                  );
                                })}
                              </select>
                              
                              {updatingStatus === order.id && (
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid #e5e7eb',
                                  borderTop: '2px solid #800000',
                                  borderRadius: '50%',
                                  animation: 'spin 1s linear infinite'
                                }}></div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px'
            }}>
              <AlertCircle size={48} style={{
                color: '#9ca3af',
                marginBottom: '16px'
              }} />
              <p style={{
                color: '#6b7280',
                fontSize: '16px'
              }}>
                Tidak ada pesanan ditemukan
              </p>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div style={{
            position: 'fixed',
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
          }} onClick={() => setShowDetailModal(false)}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)'
            }} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={{
                padding: '28px',
                borderBottom: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #5a0000, #800000)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '900',
                    color: 'white',
                    margin: 0
                  }}>
                    Detail Pesanan
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    marginTop: '4px'
                  }}>
                    ID: #{selectedOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
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
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '28px' }}>
                {/* Order Info */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '24px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: '20px'
                    }}>
                      Informasi Customer
                    </h3>
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Nama:
                        </span>
                        <span style={{
                          fontSize: '14px',
                          color: '#111827'
                        }}>
                          {selectedOrder.user.name || "-"}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Email:
                        </span>
                        <span style={{
                          fontSize: '14px',
                          color: '#111827'
                        }}>
                          {selectedOrder.user.email}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Alamat:
                        </span>
                        <span style={{
                          fontSize: '14px',
                          color: '#111827',
                          textAlign: 'right'
                        }}>
                          {selectedOrder.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '24px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: '20px'
                    }}>
                      Informasi Pesanan
                    </h3>
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Tanggal:
                        </span>
                        <span style={{
                          fontSize: '14px',
                          color: '#111827'
                        }}>
                          {formatDate(selectedOrder.createdAt)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Pembayaran:
                        </span>
                        <span style={{
                          fontSize: '14px',
                          color: '#111827'
                        }}>
                          {selectedOrder.payment}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          Status:
                        </span>
                        {(() => {
                          const statusInfo = getStatusInfo(selectedOrder.status);
                          return (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '900',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              background: statusInfo.bgColor,
                              color: statusInfo.textColor,
                              border: `1px solid ${statusInfo.borderColor}`,
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                            }}>
                              <span style={{ marginRight: '6px' }}>
                                {statusInfo.icon}
                              </span>
                              {statusInfo.label}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '20px'
                }}>
                  Items Pesanan
                </h3>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      <thead>
                        <tr style={{ background: '#f3f4f6' }}>
                          <th style={{
                            padding: '16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#374151',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '2px solid #e5e7eb'
                          }}>
                            Produk
                          </th>
                          <th style={{
                            padding: '16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#374151',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '2px solid #e5e7eb'
                          }}>
                            Harga
                          </th>
                          <th style={{
                            padding: '16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#374151',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '2px solid #e5e7eb'
                          }}>
                            Qty
                          </th>
                          <th style={{
                            padding: '16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#374151',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '2px solid #e5e7eb'
                          }}>
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                  width: '60px',
                                  height: '60px',
                                  background: '#f3f4f6',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  border: '1px solid #e5e7eb'
                                }}>
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#111827'
                                }}>
                                  {item.product.name}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{
                                fontSize: '14px',
                                color: '#374151'
                              }}>
                                Rp {item.product.price.toLocaleString()}
                              </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{
                                fontSize: '14px',
                                color: '#111827',
                                fontWeight: '600'
                              }}>
                                {item.quantity}
                              </div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#800000'
                              }}>
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
                <div style={{
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '24px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#111827'
                    }}>
                      Total
                    </span>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: '900',
                      color: '#800000'
                    }}>
                      Rp {selectedOrder.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    style={{
                      padding: '14px 28px',
                      border: '2px solid #d1d5db',
                      background: 'transparent',
                      color: '#374151',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Tutup
                  </button>
                  {getNextStatusOptions(selectedOrder.status).length > 0 && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {getNextStatusOptions(selectedOrder.status).map((status) => {
                        const nextStatusInfo = getStatusInfo(status);
                        return (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(selectedOrder.id, status)}
                            disabled={updatingStatus === selectedOrder.id}
                            style={{
                              padding: '14px 28px',
                              background: updatingStatus === selectedOrder.id ? '#9ca3af' : 'linear-gradient(to right, #800000, #a62626)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: '700',
                              cursor: updatingStatus === selectedOrder.id ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 10px 25px rgba(128, 0, 0, 0.2)',
                              opacity: updatingStatus === selectedOrder.id ? 0.6 : 1
                            }}
                          >
                            {updatingStatus === selectedOrder.id ? "Memproses..." : `Tandai sebagai ${nextStatusInfo.label}`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Admin */}
      <footer style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
        border: '1px solid #e5e7eb',
        margin: '30px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '900',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              Admin Panel E - Commerce Lyta
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              @2026 Earlyta Dwi A (11) XI-PPLG
            </p>
          </div>
          
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#4b5563',
                fontWeight: '500'
              }}>
                System Issue? 
              </span>
              <a 
                href="https://instagram.com/eddlyaa__" 
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #800000, #a62626)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '700',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(128, 0, 0, 0.2)'
                }}
              >
                <Instagram size={16} style={{ marginRight: '8px' }} />
                Contact Developer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}