"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Search, Package, Loader } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string;
  stock: number;
}

export default function UserHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/user/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Add to cart
  const addToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      const res = await fetch("/api/user/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Produk berhasil ditambahkan ke keranjang!");
      } else {
        alert(data.error || "Gagal menambahkan ke keranjang");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Terjadi kesalahan");
    } finally {
      setAddingToCart(null);
    }
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
    <div style={{
      padding: '30px',
      background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
      minHeight: '100vh'
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.95);
        }
        .search-input:focus {
          border-color: #800000;
          box-shadow: 0 0 0 4px rgba(128, 0, 0, 0.1);
        }
        .add-to-cart:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(128, 0, 0, 0.3);
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
          Selamat Berbelanja!
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
          Temukan produk terbaik dengan harga terbaik
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <Search style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} size={20} />
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama atau deskripsi..."
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
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              className="product-card"
            >
              {/* Product Image */}
              <div style={{
                height: '220px',
                overflow: 'hidden',
                background: '#f3f4f6',
                position: 'relative'
              }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease'
                  }}
                />
                {/* Stock Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: product.stock > 0 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}>
                    {product.stock > 0 ? `STOK: ${product.stock}` : 'HABIS'}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '900',
                  color: '#111827',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  {product.name}
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  marginBottom: '20px',
                  lineHeight: '1.5',
                  height: '42px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {product.description || "Tidak ada deskripsi"}
                </p>

                {/* Price */}
                <div style={{
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '900',
                    color: '#800000'
                  }}>
                    Rp {product.price.toLocaleString()}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0 || addingToCart === product.id}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: product.stock === 0 
                      ? '#9ca3af' 
                      : addingToCart === product.id
                      ? '#a62626'
                      : 'linear-gradient(to right, #800000, #a62626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '900',
                    cursor: product.stock === 0 || addingToCart === product.id ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(128, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  className="add-to-cart"
                >
                  {addingToCart === product.id ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span>Menambahkan...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>{product.stock === 0 ? 'Stock Habis' : 'Tambah ke Keranjang'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px'
        }}>
          <Package size={64} style={{
            color: '#9ca3af',
            marginBottom: '20px'
          }} />
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Produk tidak ditemukan
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Coba kata kunci pencarian lain
          </p>
        </div>
      )}
    </div>
  );
}