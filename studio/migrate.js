// Migration script: imports products from products.json into Sanity
// Run with: node migrate.js
// Requires: sanity auth token stored (run `npx sanity login` first)

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = path.join(__dirname, '..', 'images')
const PRODUCTS_FILE = path.join(__dirname, '..', 'products.json')

// Read auth token from sanity config
const configPath = path.join(process.env.HOME, '.config', 'sanity', 'config.json')
let token
try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  token = config.authToken
  if (!token) throw new Error('No authToken in config')
} catch (e) {
  console.error('No auth token found. Run: npx sanity login')
  process.exit(1)
}

const client = createClient({
  projectId: 'k5wutx18',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false
})

const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'))
const products = data.products.filter(p => p.id && p.name)

console.log(`Found ${products.length} products to migrate`)

// Cache of uploaded image refs so we don't re-upload the same file
const imageCache = {}

async function uploadImage(imagePath) {
  // imagePath is like "images/soul-searcher.jpg"
  const filename = path.basename(imagePath)

  if (imageCache[filename]) {
    return imageCache[filename]
  }

  const fullPath = path.join(__dirname, '..', imagePath)

  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠ Image not found: ${fullPath}`)
    return null
  }

  const fileBuffer = fs.readFileSync(fullPath)
  const asset = await client.assets.upload('image', fileBuffer, {
    filename,
    contentType: 'image/jpeg'
  })

  imageCache[filename] = { _type: 'reference', _ref: asset._id }
  return imageCache[filename]
}

async function migrate() {
  let success = 0
  let failed = 0

  for (const product of products) {
    try {
      process.stdout.write(`Migrating: ${product.name}... `)

      // Upload all images
      const imageRefs = []
      for (const imgPath of (product.images || [])) {
        const ref = await uploadImage(imgPath)
        if (ref) {
          imageRefs.push({
            _type: 'image',
            _key: path.basename(imgPath, path.extname(imgPath)),
            asset: ref
          })
        }
      }

      // Build the Sanity document
      const doc = {
        _type: 'product',
        _id: `product-${product.id}`,
        id: { _type: 'slug', current: product.id },
        name: product.name,
        category: product.category || 'ceramics',
        price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
        available: product.available !== false,
        hidden: product.hidden === true,
        description: product.description || '',
        images: imageRefs
      }

      // Add variants if present
      if (product.variants && product.variants.length > 0) {
        doc.variants = product.variants.map((v, i) => ({
          _type: 'object',
          _key: `variant-${i}`,
          size: v.size,
          price: v.price
        }))
      }

      await client.createOrReplace(doc)
      process.stdout.write(`✓ (${imageRefs.length} images)\n`)
      success++

    } catch (err) {
      process.stdout.write(`✗ ERROR: ${err.message}\n`)
      failed++
    }
  }

  console.log(`\nDone! ${success} succeeded, ${failed} failed.`)
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
