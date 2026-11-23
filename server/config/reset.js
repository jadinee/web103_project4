import { pool } from './database.js'

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drinks (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      tea_base TEXT NOT NULL,
      size TEXT NOT NULL,
      temperature TEXT NOT NULL,
      ice_level TEXT NOT NULL,
      toppings TEXT[] NOT NULL DEFAULT '{}',
      total_cents INTEGER NOT NULL CHECK (total_cents >= 0)
    )
  `)
  console.log('Drinks table is ready.')
} finally {
  await pool.end()
}