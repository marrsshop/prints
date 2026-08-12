// Sets default A3/A2 size variants on all existing prints that don't have sizeVariants set
// Run with: node set-default-variants.js

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
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
  useCdn: false,
})

const prints = await client.fetch(`*[_type == "product" && category == "prints"] { _id, name, sizeVariants }`)

console.log(`Found ${prints.length} prints`)

let updated = 0
for (const print of prints) {
  const sv = print.sizeVariants || {}
  // Only set defaults if a3 and a2 are not already configured
  if (sv.a3Enabled || sv.a2Enabled) {
    console.log(`  skipping "${print.name}" — already has variants set`)
    continue
  }
  await client.patch(print._id).set({
    sizeVariants: {
      ...sv,
      a3Enabled: true,
      a3Price: 40,
      a2Enabled: true,
      a2Price: 80,
    }
  }).commit()
  console.log(`  ✓ set A3/A2 defaults on "${print.name}"`)
  updated++
}

console.log(`\nDone — updated ${updated} prints`)
