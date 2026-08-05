'use client'
import { useState, useEffect } from 'react'
import ProductsAdmin   from './ProductsAdmin'
import CategoriesAdmin from './CategoriesAdmin'
import OrdersAdmin     from './OrdersAdmin'
import DiscountsAdmin  from './DiscountsAdmin'
import AnalyticsAdmin  from './AnalyticsAdmin'
import SettingsAdmin   from './SettingsAdmin'

type ShopTab = 'products' | 'categories' | 'orders' | 'discounts' | 'analytics' | 'settings'

const SHOP_TABS: { key: ShopTab; label: string }[] = [
  { key: 'products',   label: 'Products' },
  { key: 'categories', label: 'Categories & Tags' },
  { key: 'orders',     label: 'Orders' },
  { key: 'discounts',  label: 'Discounts' },
  { key: 'analytics',  label: 'Analytics' },
  { key: 'settings',   label: 'Settings' },
]

export default function ShopAdmin({ initialSection }: { initialSection?: string }) {
  const [tab, setTab] = useState<ShopTab>('products')

  useEffect(() => {
    if (initialSection === 'orders' || initialSection === 'categories' || initialSection === 'discounts' || initialSection === 'analytics' || initialSection === 'settings') {
      setTab(initialSection)
    }
  }, [initialSection])

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '32px', overflowX: 'auto', paddingBottom: '0' }}>
        {SHOP_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.06em',
            color: tab === t.key ? 'var(--lavender)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${tab === t.key ? 'var(--lavender)' : 'transparent'}`,
            marginBottom: '-1px', whiteSpace: 'nowrap',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products'   && <ProductsAdmin />}
      {tab === 'categories' && <CategoriesAdmin />}
      {tab === 'orders'     && <OrdersAdmin />}
      {tab === 'discounts'  && <DiscountsAdmin />}
      {tab === 'analytics'  && <AnalyticsAdmin />}
      {tab === 'settings'   && <SettingsAdmin />}
    </div>
  )
}
