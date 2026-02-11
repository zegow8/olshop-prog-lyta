"use client";

import { useState, useEffect } from "react";
import { User, Mail, Calendar, Save, Key, Shield, Edit, X, Check, Lock, Phone, Instagram } from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        setName(data.user.name || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (editing && !name.trim()) {
      newErrors.name = "Nama tidak boleh kosong";
    }

    if (showChangePassword) {
      if (!currentPassword) {
        newErrors.currentPassword = "Password saat ini harus diisi";
      }
      if (!newPassword) {
        newErrors.newPassword = "Password baru harus diisi";
      } else if (newPassword.length < 8) {
        newErrors.newPassword = "Password minimal 8 karakter";
      } else if (!/(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
        newErrors.newPassword = "Harus mengandung huruf besar dan angka";
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Password tidak cocok";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile
  const saveProfile = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const res = await fetch("/api/user/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editing ? name : undefined,
          currentPassword: showChangePassword ? currentPassword : undefined,
          newPassword: showChangePassword ? newPassword : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setEditing(false);
        setShowChangePassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        fetchProfile();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setErrors({ submit: data.error });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors({ submit: "Terjadi kesalahan" });
    } finally {
      setSaving(false);
    }
  };

  const cancelChanges = () => {
    if (profile) setName(profile.name || "");
    setEditing(false);
    setShowChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.emptyState}>
        <h2 style={styles.emptyTitle}>Gagal Memuat Profil</h2>
        <p style={styles.emptyText}>Silakan refresh halaman atau coba lagi nanti</p>
        <button
          onClick={() => window.location.reload()}
          style={styles.retryButton}
        >
          Muat Ulang
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
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .profile-card:hover {
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
          .input-field:focus {
            border-color: #800000;
            background: white;
            box-shadow: 0 0 0 4px rgba(128, 0, 0, 0.1);
          }
          .action-btn:hover {
            transform: translateY(-2px);
          }
          .toggle-btn:hover {
            color: #800000;
          }
        `}</style>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Profil Akun</h1>
            <p style={styles.subtitle}>Kelola informasi dan keamanan akun Anda</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={styles.successAlert} className="slide-in">
            <Check size={20} style={{ marginRight: '12px' }} />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div style={styles.errorAlert}>
            <X size={20} style={{ marginRight: '12px' }} />
            {errors.submit}
          </div>
        )}

        <div style={styles.contentGrid}>
          {/* Left Column - Profile Card */}
          <div style={styles.mainColumn}>
            <div style={styles.profileCard} className="profile-card">
              {/* Profile Header */}
              <div style={styles.profileHeader}>
                <div style={styles.avatarContainer}>
                  <div style={styles.avatar}>
                    <User size={48} />
                  </div>
                  {profile.role && (
                    <div style={styles.roleBadge}>
                      {profile.role}
                    </div>
                  )}
                </div>
                <div style={styles.profileInfo}>
                  <h2 style={styles.profileName}>
                    {profile.name || "Pengguna"}
                  </h2>
                  <p style={styles.profileEmail}>{profile.email}</p>
                  <div style={styles.memberSince}>
                    <Calendar size={16} style={{ marginRight: '8px' }} />
                    <span>Bergabung {formatDate(profile.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div style={styles.formSection}>
                {/* Name Field */}
                <div style={styles.formGroup}>
                  <div style={styles.formLabelRow}>
                    <label style={styles.formLabel}>
                      <User size={18} style={{ marginRight: '10px' }} />
                      Nama Lengkap
                    </label>
                    <button
                      onClick={() => setEditing(!editing)}
                      style={styles.editToggle}
                      className="toggle-btn"
                    >
                      {editing ? (
                        <>
                          <X size={16} style={{ marginRight: '6px' }} />
                          Batal
                        </>
                      ) : (
                        <>
                          <Edit size={16} style={{ marginRight: '6px' }} />
                          Edit
                        </>
                      )}
                    </button>
                  </div>
                  
                  {editing ? (
                    <div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          ...styles.inputField,
                          borderColor: errors.name ? '#ef4444' : '#e5e7eb'
                        }}
                        className="input-field"
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.name && (
                        <p style={styles.errorText}>{errors.name}</p>
                      )}
                    </div>
                  ) : (
                    <div style={styles.displayValue}>
                      {profile.name || (
                        <span style={styles.placeholderText}>Belum diisi</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    <Mail size={18} style={{ marginRight: '10px' }} />
                    Alamat Email
                  </label>
                  <div style={styles.displayValue}>
                    {profile.email}
                  </div>
                  <p style={styles.readonlyHint}>Email tidak dapat diubah</p>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div style={styles.securityCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardIcon}>
                  <Shield size={24} />
                </div>
                <h2 style={styles.cardTitle}>Keamanan Akun</h2>
              </div>

              <div style={styles.securitySection}>
                <div style={styles.securityHeader}>
                  <h3 style={styles.securityTitle}>
                    <Key size={18} style={{ marginRight: '10px' }} />
                    Ubah Password
                  </h3>
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    style={styles.securityToggle}
                    className="toggle-btn"
                  >
                    {showChangePassword ? (
                      <>
                        <X size={16} style={{ marginRight: '6px' }} />
                        Sembunyikan
                      </>
                    ) : (
                      <>
                        <Lock size={16} style={{ marginRight: '6px' }} />
                        Ubah Password
                      </>
                    )}
                  </button>
                </div>

                {showChangePassword && (
                  <div style={styles.passwordForm}>
                    <div style={styles.passwordFields}>
                      <div style={styles.passwordGroup}>
                        <label style={styles.passwordLabel}>
                          Password Saat Ini
                          <span style={styles.required}>*</span>
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          style={{
                            ...styles.passwordInput,
                            borderColor: errors.currentPassword ? '#ef4444' : '#e5e7eb'
                          }}
                          className="input-field"
                          placeholder="Masukkan password saat ini"
                        />
                        {errors.currentPassword && (
                          <p style={styles.errorText}>{errors.currentPassword}</p>
                        )}
                      </div>

                      <div style={styles.passwordGroup}>
                        <label style={styles.passwordLabel}>
                          Password Baru
                          <span style={styles.required}>*</span>
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{
                            ...styles.passwordInput,
                            borderColor: errors.newPassword ? '#ef4444' : '#e5e7eb'
                          }}
                          className="input-field"
                          placeholder="Minimal 8 karakter dengan huruf besar dan angka"
                        />
                        {errors.newPassword && (
                          <p style={styles.errorText}>{errors.newPassword}</p>
                        )}
                        <div style={styles.passwordRules}>
                          <span style={styles.rule}>• Minimal 8 karakter</span>
                          <span style={styles.rule}>• Mengandung huruf besar</span>
                          <span style={styles.rule}>• Mengandung angka</span>
                        </div>
                      </div>

                      <div style={styles.passwordGroup}>
                        <label style={styles.passwordLabel}>
                          Konfirmasi Password Baru
                          <span style={styles.required}>*</span>
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          style={{
                            ...styles.passwordInput,
                            borderColor: errors.confirmPassword ? '#ef4444' : '#e5e7eb'
                          }}
                          className="input-field"
                          placeholder="Masukkan kembali password baru"
                        />
                        {errors.confirmPassword && (
                          <p style={styles.errorText}>{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Action Buttons */}
          <div style={styles.sideColumn}>
            <div style={styles.actionCard}>
              <h3 style={styles.actionTitle}>Aksi</h3>
              
              <div style={styles.actionButtons}>
                {(editing || showChangePassword) ? (
                  <>
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      style={saving ? styles.saveButtonDisabled : styles.saveButton}
                      className="action-btn"
                    >
                      {saving ? (
                        <>
                          <div style={styles.savingSpinner}></div>
                          <span style={{ marginLeft: '12px' }}>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save size={20} style={{ marginRight: '10px' }} />
                          Simpan Perubahan
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={cancelChanges}
                      style={styles.cancelButton}
                      className="action-btn"
                    >
                      <X size={20} style={{ marginRight: '10px' }} />
                      Batalkan Semua
                    </button>
                  </>
                ) : (
                  <div style={styles.noChanges}>
                    <p style={styles.noChangesText}>Tidak ada perubahan</p>
                    <p style={styles.noChangesHint}>
                      Edit profil atau ubah password untuk membuat perubahan
                    </p>
                  </div>
                )}
              </div>

              <div style={styles.securityTips}>
                <h4 style={styles.tipsTitle}>Tips Keamanan</h4>
                <ul style={styles.tipsList}>
                  <li style={styles.tipItem}>• Gunakan password yang unik</li>
                  <li style={styles.tipItem}>• Jangan bagikan password Anda</li>
                  <li style={styles.tipItem}>• Perbarui password secara berkala</li>
                  <li style={styles.tipItem}>• Gunakan 2FA jika tersedia</li>
                </ul>
              </div>
            </div>
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
  retryButton: {
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
  
  // Alerts
  successAlert: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderLeft: '4px solid #10b981',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '30px',
    fontSize: '14px',
    color: '#065f46',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    animation: 'fadeIn 0.5s ease-out'
  },
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
  
  // Main Column
  mainColumn: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '30px'
  },
  
  // Profile Card
  profileCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease'
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
    marginBottom: '40px',
    paddingBottom: '32px',
    borderBottom: '2px solid #f3f4f6'
  },
  avatarContainer: {
    position: 'relative' as 'relative'
  },
  avatar: {
    width: '120px',
    height: '120px',
    background: 'linear-gradient(135deg, #800000, #a62626)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  roleBadge: {
    position: 'absolute' as 'absolute',
    bottom: '0',
    right: '0',
    background: '#1e40af',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase' as 'uppercase'
  },
  profileInfo: {
    
  },
  profileName: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#111827',
    margin: '0 0 8px 0'
  },
  profileEmail: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '16px'
  },
  memberSince: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  
  // Form Section
  formSection: {
    
  },
  formGroup: {
    marginBottom: '28px'
  },
  formLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: '700',
    color: '#374151'
  },
  editToggle: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '8px'
  },
  inputField: {
    width: '100%',
    padding: '16px',
    fontSize: '15px',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    color: '#111827',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  displayValue: {
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    background: '#f9fafb',
    borderRadius: '10px',
    border: '2px solid transparent'
  },
  placeholderText: {
    color: '#9ca3af',
    fontStyle: 'italic'
  },
  readonlyHint: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px'
  },
  errorText: {
    fontSize: '13px',
    color: '#ef4444',
    marginTop: '8px',
    fontWeight: '500'
  },
  
  // Security Card
  securityCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px'
  },
  cardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    borderRadius: '12px',
    color: 'white'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#111827',
    margin: 0
  },
  
  // Security Section
  securitySection: {
    
  },
  securityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  securityTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '700',
    color: '#374151',
    margin: 0
  },
  securityToggle: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '8px'
  },
  
  // Password Form
  passwordForm: {
    animation: 'fadeIn 0.3s ease-out'
  },
  passwordFields: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '20px'
  },
  passwordGroup: {
    
  },
  passwordLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '12px'
  },
  required: {
    color: '#ef4444',
    marginLeft: '4px'
  },
  passwordInput: {
    width: '100%',
    padding: '16px',
    fontSize: '15px',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    color: '#111827',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  passwordRules: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '6px',
    marginTop: '12px'
  },
  rule: {
    fontSize: '12px',
    color: '#6b7280'
  },
  
  // Side Column
  sideColumn: {
    
  },
  actionCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '11px 10px 22px -5px rgba(0,0,0,0.83)',
    border: '1px solid #e5e7eb',
    position: 'sticky' as 'sticky',
    top: '30px'
  },
  actionTitle: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#111827',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '2px solid #f3f4f6'
  },
  
  // Action Buttons
  actionButtons: {
    
  },
  saveButton: {
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
    boxShadow: '0 15px 30px rgba(128, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  saveButtonDisabled: {
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
    justifyContent: 'center',
    marginBottom: '16px'
  },
  cancelButton: {
    width: '100%',
    padding: '18px',
    background: 'white',
    border: '2px solid #e5e7eb',
    color: '#374151',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  savingSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  
  // No Changes
  noChanges: {
    textAlign: 'center' as 'center',
    padding: '40px 20px'
  },
  noChangesText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '8px'
  },
  noChangesHint: {
    fontSize: '13px',
    color: '#9ca3af',
    lineHeight: 1.4
  },
  
  // Security Tips
  securityTips: {
    marginTop: '32px',
    paddingTop: '28px',
    borderTop: '2px solid #f3f4f6'
  },
  tipsTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '16px'
  },
  tipsList: {
    
  },
  tipItem: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px',
    lineHeight: 1.5
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
      
      .profile-card,
      .security-card,
      .action-card {
        padding: 24px !important;
      }
      
      .profile-header {
        flex-direction: column !important;
        text-align: center !important;
        gap: 20px !important;
      }
      
      .avatar {
        width: 100px !important;
        height: 100px !important;
      }
      
      .profile-name {
        font-size: 24px !important;
        text-align: center !important;
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
      
      .form-label-row {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      
      .edit-toggle,
      .security-toggle {
        margin-top: 8px !important;
      }
      
      .save-button,
      .save-button-disabled,
      .cancel-button {
        padding: 16px !important;
        font-size: 15px !important;
      }
    }
    
    .cancel-button:hover {
      background: #f9fafb;
      border-color: #800000;
      color: #800000;
    }
    
    .slide-in {
      animation: slideIn 0.5s ease-out;
    }
  `;
  document.head.appendChild(style);
}