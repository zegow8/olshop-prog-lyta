"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Image as ImageIcon,
  Instagram
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image: string;
  stock: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
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

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran file maksimal 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        setErrorMessage("File harus berupa gambar");
        return;
      }
      
      setImageFile(file);
      setErrorMessage("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setName("");
    setPrice("");
    setDescription("");
    setStock("");
    setImageFile(null);
    setImagePreview("");
    setCurrentProduct(null);
    setEditMode(false);
    setErrorMessage("");
  };

  // Open modal for create/edit
  const openModal = (product?: Product) => {
    if (product) {
      setEditMode(true);
      setCurrentProduct(product);
      setName(product.name);
      setPrice(product.price.toString());
      setDescription(product.description || "");
      setStock(product.stock.toString());
      setImagePreview(product.image);
    } else {
      setEditMode(false);
      resetForm();
    }
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setErrorMessage("");

    if (!editMode && !imageFile) {
      setErrorMessage("Gambar produk wajib diupload");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("stock", stock);
    
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (editMode && currentProduct) {
      formData.append("id", currentProduct.id);
    }

    try {
      const url = editMode 
        ? "/api/admin/products/update" 
        : "/api/admin/products/create";
      
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchProducts();
        alert(editMode ? "Produk berhasil diupdate!" : "Produk berhasil dibuat!");
      } else {
        setErrorMessage(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("Terjadi kesalahan");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/products/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        fetchProducts();
        alert("Produk berhasil dihapus!");
      } else {
        alert(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Terjadi kesalahan");
    }
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
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Kelola Produk</h1>
            <p style={styles.subtitle}>Total {filteredProducts.length} produk ditemukan</p>
          </div>
          <button
            onClick={() => openModal()}
            style={styles.addButton}
          >
            <Plus size={20} style={{ marginRight: '8px' }} />
            Tambah Produk
          </button>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <Search style={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Products Table */}
        <div style={styles.tableContainer}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableHeaderCell}>Gambar</th>
                  <th style={styles.tableHeaderCell}>Nama Produk</th>
                  <th style={styles.tableHeaderCell}>Harga</th>
                  <th style={styles.tableHeaderCell}>Stok</th>
                  <th style={styles.tableHeaderCell}>Deskripsi</th>
                  <th style={styles.tableHeaderCell}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.imageContainer}>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            style={styles.productImage}
                          />
                        ) : (
                          <ImageIcon size={24} style={styles.imagePlaceholder} />
                        )}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.productName}>{product.name}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.productPrice}>Rp {product.price.toLocaleString()}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={getStockStyle(product.stock)}>
                        {product.stock} pcs
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.productDescription}>
                        {product.description || "-"}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => openModal(product)}
                        style={styles.editButton}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={styles.deleteButton}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>Tidak ada produk ditemukan</p>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div style={styles.modalOverlay} onClick={() => {
            setShowModal(false);
            resetForm();
          }}>
            <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalContent}>
                <h2 style={styles.modalTitle}>
                  {editMode ? "Edit Produk" : "Tambah Produk Baru"}
                </h2>

                {errorMessage && (
                  <div style={styles.errorAlert}>
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Image Upload */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Gambar Produk {!editMode && <span style={styles.required}>*</span>}
                    </label>
                    {!editMode && !imagePreview && (
                      <p style={styles.requiredText}>Gambar wajib diupload</p>
                    )}
                    <div style={styles.uploadContainer}>
                      <label style={imagePreview ? styles.uploadLabelWithImage : styles.uploadLabel}>
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={styles.uploadPreview}
                          />
                        ) : (
                          <div style={styles.uploadPlaceholder}>
                            <ImageIcon style={styles.uploadIcon} />
                            <p style={styles.uploadText}>
                              <span style={{ fontWeight: '600' }}>Klik untuk upload</span> atau drag & drop
                            </p>
                            <p style={styles.uploadSubtext}>
                              PNG, JPG, GIF (MAX. 5MB)
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Name */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Nama Produk</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={styles.formInput}
                      required
                    />
                  </div>

                  {/* Price */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Harga (Rp)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      style={styles.formInput}
                      required
                      min="0"
                    />
                  </div>

                  {/* Stock */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Stok</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      style={styles.formInput}
                      required
                      min="0"
                    />
                  </div>

                  {/* Description */}
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Deskripsi</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ ...styles.formInput, ...styles.textarea }}
                      rows={3}
                    />
                  </div>

                  {/* Buttons */}
                  <div style={styles.modalActions}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      style={styles.cancelButton}
                      disabled={uploading}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      style={uploading ? styles.submitButtonDisabled : styles.submitButton}
                    >
                      {uploading ? "Menyimpan..." : editMode ? "Update Produk" : "Simpan Produk"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Admin */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <h3 style={styles.footerTitle}>Admin Panel E - Commerce Lyta</h3>
            <p style={styles.footerCopyright}>@2026 Earlyta Dwi A (11) XI-PPLG</p>
          </div>
          
          <div style={styles.footerRight}>
            <div style={styles.developerContact}>
              <span style={styles.contactLabel}>System Issue? </span>
              <a 
                href="https://instagram.com/eddlyaa__" 
                target="_blank"
                rel="noopener noreferrer"
                style={styles.contactLink}
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

// === PURE CSS STYLING SAJA ===
const styles = {
  container: {
    padding: '30px',
    background: 'linear-gradient(135deg, #fdf2f2 0%, #f9fafb 100%)',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#111827',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
    position: 'relative' as 'relative',
    display: 'inline-block'
  },
  subtitle: {
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '500'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 24px',
    background: 'linear-gradient(to right, #800000, #a62626)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '11px 10px 22px -5px rgba(128, 0, 0, 0.3)'
  },
  searchContainer: {
    marginBottom: '30px'
  },
  searchWrapper: {
    position: 'relative' as 'relative',
    maxWidth: '500px'
  },
  searchIcon: {
    position: 'absolute' as 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  searchInput: {
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
  },
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
  imageContainer: {
    height: '64px',
    width: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as 'cover'
  },
  imagePlaceholder: {
    color: '#9ca3af'
  },
  productName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827'
  },
  productPrice: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#800000'
  },
  productDescription: {
    fontSize: '14px',
    color: '#4b5563',
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as 'nowrap'
  },
  editButton: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    marginRight: '16px'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center' as 'center',
    padding: '60px'
  },
  emptyText: {
    color: '#6b7280'
  },
  // Modal Styles
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
    padding: '20px',
    animation: 'fadeIn 0.3s ease-out'
  },
  modalContainer: {
    background: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto' as 'auto',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  modalContent: {
    padding: '28px'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#111827',
    marginBottom: '24px'
  },
  errorAlert: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderLeft: '4px solid #ef4444',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    fontSize: '14px',
    color: '#dc2626',
    fontWeight: '500'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '8px',
    textTransform: 'uppercase' as 'uppercase',
    letterSpacing: '0.5px'
  },
  required: {
    color: '#ef4444'
  },
  requiredText: {
    fontSize: '12px',
    color: '#ef4444',
    marginBottom: '8px'
  },
  uploadContainer: {
    marginBottom: '16px'
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '200px',
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    cursor: 'pointer',
    background: '#f9fafb',
    transition: 'all 0.3s ease'
  },
  uploadLabelWithImage: {
    display: 'block',
    width: '100%',
    cursor: 'pointer'
  },
  uploadPreview: {
    width: '100%',
    height: '200px',
    objectFit: 'cover' as 'cover',
    borderRadius: '12px'
  },
  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  uploadIcon: {
    width: '48px',
    height: '48px',
    color: '#9ca3af',
    marginBottom: '16px'
  },
  uploadText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  uploadSubtext: {
    fontSize: '12px',
    color: '#6b7280'
  },
  formInput: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    color: '#111827',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  textarea: {
    minHeight: '100px',
    resize: 'vertical' as 'vertical'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '32px'
  },
  cancelButton: {
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
  submitButton: {
    padding: '14px 28px',
    background: 'linear-gradient(to right, #800000, #a62626)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px rgba(128, 0, 0, 0.2)'
  },
  submitButtonDisabled: {
    padding: '14px 28px',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '256px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #800000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  // Footer Admin Styles
  footer: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb',
    margin: '30px'
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '20px'
  },
  footerLeft: {
    
  },
  footerTitle: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#111827',
    margin: '0 0 8px 0'
  },
  footerCopyright: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  footerRight: {
    
  },
  developerContact: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  contactLabel: {
    fontSize: '14px',
    color: '#4b5563',
    fontWeight: '500'
  },
  contactLink: {
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
  }
};

// Helper function untuk styling stock
const getStockStyle = (stock: number) => {
  if (stock > 10) {
    return {
      display: 'inline-block',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '900',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.5px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
    };
  } else if (stock > 0) {
    return {
      display: 'inline-block',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '900',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.5px',
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
    };
  } else {
    return {
      display: 'inline-block',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '900',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.5px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
    };
  }
};

// Tambahkan style untuk hover effect
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .add-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(128, 0, 0, 0.4);
    }
    
    .table-row:hover {
      background: #fdf2f2;
    }
    
    .edit-button:hover {
      color: #1d4ed8;
    }
    
    .delete-button:hover {
      color: #dc2626;
    }
    
    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(128, 0, 0, 0.4);
    }
    
    .cancel-button:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #800000;
      color: #800000;
    }
    
    .upload-label:hover {
      border-color: #800000;
      background: #fdf2f2;
    }
    
    .contact-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(128, 0, 0, 0.4);
    }
    
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }
      
      .contact-link {
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(style);
}