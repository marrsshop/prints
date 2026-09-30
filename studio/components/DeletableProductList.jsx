import { useState, useEffect, useCallback } from 'react'
import { useClient } from 'sanity'

function DeletableProductList() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const query = `*[_type == "product"] | order(orderRank) { _id, name, "image": images[0].asset->url }`

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const data = await client.fetch(query)
    setProducts(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?\n\nThis cannot be undone.`)) return
    setDeleting(id)
    await client.delete(id).catch(() => {})
    await client.delete(`drafts.${id}`).catch(() => {})
    setProducts(prev => prev.filter(p => p._id !== id))
    setDeleting(null)
  }

  if (loading) return <div style={{ padding: 24, color: '#888', fontSize: 13 }}>Loading…</div>
  if (!products.length) return <div style={{ padding: 24, color: '#888', fontSize: 13 }}>No products found.</div>

  return (
    <div style={{ paddingBottom: 40 }}>
      {products.map(product => (
        <div
          key={product._id}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderBottom: '1px solid #e5e5e5',
            gap: 10,
            opacity: deleting === product._id ? 0.4 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          {product.image ? (
            <img
              src={`${product.image}?w=48&h=48&fit=crop`}
              style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
              alt=""
            />
          ) : (
            <div style={{ width: 32, height: 32, background: '#eee', borderRadius: 2, flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {product.name}
            </div>
          </div>
          <button
            onClick={() => handleDelete(product._id, product.name)}
            disabled={deleting === product._id}
            style={{
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: 3,
              padding: '3px 10px',
              fontSize: 11,
              color: '#c00',
              cursor: deleting === product._id ? 'default' : 'pointer',
              flexShrink: 0,
              letterSpacing: '0.02em'
            }}
          >
            {deleting === product._id ? '…' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  )
}

export function ProductDeleteList() { return <DeletableProductList /> }
