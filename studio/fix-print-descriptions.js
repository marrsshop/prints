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

const products = await client.fetch(`*[_type == "product" && category == "prints" && defined(description)]{ _id, name, description }`)

let fixed = 0
for (const p of products) {
  // Remove any sentence referencing A2 contact/order
  const cleaned = p.description
    .replace(/please contact[^.]*to order[^.\n]*/gi, '')
    .replace(/contact[^.]*scott@garrettworld\.co\.uk[^.\n]*/gi, '')
    .replace(/scott@garrettworld\.co\.uk[^.\n]*/gi, '')
    .replace(/\n{3,}/g, '\n\n')  // collapse extra blank lines
    .trim()

  if (cleaned !== p.description) {
    console.log(`Fixing: ${p.name}`)
    console.log(`  Before: ${p.description.substring(0, 100)}...`)
    console.log(`  After:  ${cleaned.substring(0, 100)}...`)
    await client.patch(p._id).set({ description: cleaned }).commit()
    fixed++
  }
}

console.log(`\nDone — ${fixed} products updated.`)
