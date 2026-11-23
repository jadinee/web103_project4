import { pool } from '../config/database.js'
import { total, validate } from '../../client/src/utilities/menu.js'

function validId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 && id <= 2147483647
}

export async function getAllDrinks(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM drinks ORDER BY id DESC')
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
}

export async function getDrinkById(req, res, next) {
  const { id } = req.params

  if (!validId(id)) {
    return res.status(400).json({ error: 'Invalid drink ID.' })
  }

  try {
    const result = await pool.query('SELECT * FROM drinks WHERE id = $1', [Number(id)])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Drink not found.' })
    }

    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
}

export async function saveDrink(req, res, next) {
  const { id } = req.params
  const editing = id !== undefined

  if (editing && !validId(id)) {
    return res.status(400).json({ error: 'Invalid drink ID.' })
  }

  const drink = req.body
  const problem = validate(drink)

  if (problem) {
    return res.status(400).json({ error: problem })
  }

  const values = [
    drink.name.trim(),
    drink.tea_base,
    drink.size,
    drink.temperature,
    drink.ice_level,
    drink.toppings,
    total(drink)
  ]

  let sql

  if (editing) {
    values.push(Number(id))
    sql = `
      UPDATE drinks
      SET name = $1, tea_base = $2, size = $3, temperature = $4,
          ice_level = $5, toppings = $6, total_cents = $7
      WHERE id = $8
      RETURNING *
    `
  } else {
    sql = `
      INSERT INTO drinks
        (name, tea_base, size, temperature, ice_level, toppings, total_cents)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
  }

  try {
    const result = await pool.query(sql, values)

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Drink not found.' })
    }

    res.status(editing ? 200 : 201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
}

export async function deleteDrink(req, res, next) {
  const { id } = req.params

  if (!validId(id)) {
    return res.status(400).json({ error: 'Invalid drink ID.' })
  }

  try {
    const result = await pool.query('DELETE FROM drinks WHERE id = $1', [Number(id)])

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Drink not found.' })
    }

    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}