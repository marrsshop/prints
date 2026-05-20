import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const config = JSON.parse(readFileSync(join(process.env.HOME, '.config/sanity/config.json'), 'utf8'))
const client = createClient({ projectId: 'k5wutx18', dataset: 'production', apiVersion: '2024-01-01', token: config.authToken, useCdn: false })

const products = await client.fetch(`*[_type == "product" && category == "prints" && description match "Please*"]{ name, description }`)
products.forEach(p => {
  console.log(`\n--- ${p.name} ---`)
  console.log(p.description)
})
