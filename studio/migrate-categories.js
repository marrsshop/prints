import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const config = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'))

const client = createClient({
  projectId: 'k5wutx18',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: config.authToken,
  useCdn: false
})

// Find all collages and drawings, patch to on-paper
const products = await client.fetch(`*[_type == "product" && (category == "collages" || category == "drawings")]{ _id, name, category }`)
console.log(`Found ${products.length} products to migrate:`)
products.forEach(p => console.log(` - ${p.name} (${p.category})`))

for (const p of products) {
  await client.patch(p._id).set({ category: 'on-paper' }).commit()
  console.log(`✓ ${p.name}`)
}

console.log('\nDone!')
