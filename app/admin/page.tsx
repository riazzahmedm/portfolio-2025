'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { LayoutDashboard, ShoppingBag, Film, FileText, LogOut } from 'lucide-react'
import PasswordGate  from '@/components/admin/PasswordGate'
import OverviewAdmin from '@/components/admin/OverviewAdmin'
import BlogAdmin     from '@/components/admin/blog/BlogAdmin'
import MoviesAdmin   from '@/components/admin/movies/MoviesAdmin'
import ShopAdmin     from '@/components/admin/shop/ShopAdmin'

type Tab = 'overview' | 'shop' | 'movies' | 'blog'

const NAV: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { key: 'shop',     label: 'Shop',     Icon: ShoppingBag },
  { key: 'movies',   label: 'Movies',   Icon: Film },
  { key: 'blog',     label: 'Blog',     Icon: FileText },
]

export default function AdminPage() {
  const [authed,      setAuthed]      = useState(false)
  const [tab,         setTab]         = useState<Tab>('overview')
  const [shopSection, setShopSection] = useState<string | undefined>(undefined)

  function goToShopOrders() {
    setShopSection('orders')
    setTab('shop')
  }

  useEffect(() => {
    fetch('/api/auth/admin').then(r => r.json()).then(d => {
      if (d.authed) setAuthed(true)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/admin', { method: 'DELETE' })
    setAuthed(false)
    toast.success('Logged out')
  }

  if (!authed) return <PasswordGate endpoint="/api/auth/admin" onAuthed={() => setAuthed(true)} label="Admin portal" />

  return (
    <>
      <style>{`
        .admin-shell {
          min-height: 100dvh;
          background: var(--bg);
          font-family: var(--ff-body);
          display: flex;
          flex-direction: column;
        }
        .admin-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 52px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .admin-body {
          display: flex;
          flex: 1;
        }
        .admin-sidebar {
          display: none;
        }
        .admin-main {
          flex: 1;
          min-width: 0;
          padding: 24px 16px 100px;
        }
        .admin-bottom-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 50;
          background: var(--bg);
          border-top: 1px solid var(--border);
          display: flex;
          align-items: stretch;
          height: 64px;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .admin-bottom-nav button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-dim);
          font-family: var(--ff-mono);
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 8px 4px;
          transition: color 0.15s;
        }
        .admin-bottom-nav button.active {
          color: var(--lavender);
        }
        .admin-sidebar-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          color: var(--text-secondary);
          font-size: 14px;
          font-family: var(--ff-body);
          font-weight: 400;
          text-align: left;
          transition: all 0.15s;
        }
        .admin-sidebar-btn:hover {
          background: rgba(255,255,255,0.04);
        }
        .admin-sidebar-btn.active {
          background: rgba(184,160,255,0.12);
          color: var(--lavender);
          font-weight: 600;
        }
        @media (min-width: 768px) {
          .admin-topbar    { display: none; }
          .admin-sidebar   { display: flex; }
          .admin-bottom-nav { display: none; }
          .admin-main { padding: 32px 40px 60px; }
        }
      `}</style>

      <div className="admin-shell">

        {/* Mobile top bar */}
        <div className="admin-topbar">
          <span style={{ fontFamily: 'var(--ff-display)', fontSize: '15px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            Admin
          </span>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--ff-body)', padding: '6px 10px', borderRadius: '8px' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>

        <div className="admin-body">

          {/* Desktop sidebar */}
          <aside className="admin-sidebar" style={{ width: '220px', flexShrink: 0, flexDirection: 'column', borderRight: '1px solid var(--border)', position: 'sticky', top: 0, height: '100dvh' }}>
            <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--ff-display)', fontSize: '16px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Admin</span>
            </div>

            <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {NAV.map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setTab(key)} className={`admin-sidebar-btn${tab === key ? ' active' : ''}`}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>

            <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
              <button onClick={logout} className="admin-sidebar-btn">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="admin-main">
            <div style={{ maxWidth: '960px' }}>
              {tab === 'overview' && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'var(--ff-mono)' }}>Overview</p>
                  <h1 style={{ margin: 0, fontFamily: 'var(--ff-display)', fontSize: '24px', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Dashboard</h1>
                </div>
              )}

              {tab === 'overview' && <OverviewAdmin onViewAllOrders={goToShopOrders} />}
              {tab === 'shop'     && <ShopAdmin initialSection={shopSection} />}
              {tab === 'movies'   && <MoviesAdmin />}
              {tab === 'blog'     && <BlogAdmin />}
            </div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="admin-bottom-nav">
          {NAV.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={tab === key ? 'active' : ''}>
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>

      </div>
    </>
  )
}
