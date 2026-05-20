import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const config = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'))
const client = createClient({ projectId: 'k5wutx18', dataset: 'production', apiVersion: '2024-01-01', token: config.authToken, useCdn: false })

const products = await client.fetch(`*[_type == "product" && category == "prints" && description match "Please*"]{ _id, name, description }`)

for (const p of products) {
  // Remove any line containing "Please" (the leftover stub)
  const cleaned = p.description
    .split('\n')
    .filter(line => !line.trim().startsWith('Please'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  console.log(`Fixing: ${p.name}`)
  await client.patch(p._id).set({ description: cleaned }).commit()
}

console.log(`Done — ${products.length} products cleaned.`)
