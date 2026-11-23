import React, { useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { request } from './services/drinks'
import { money, prices, total, validate } from './utilities/menu'

const initialDrink = {
  name: '',
  tea_base: 'Black milk tea',
  size: 'Regular',
  temperature: 'Iced',
  ice_level: 'Regular',
  toppings: []
}

const labels = {
  tea_base: 'Tea base',
  size: 'Cup size',
  temperature: 'Temperature',
  ice_level: 'Ice'
}

const colors = {
  'Black milk tea': '#cf9664',
  Matcha: '#a2b878',
  Taro: '#b398cd'
}

const iceCounts = { None: 0, Light: 2, Regular: 5 }
const toppingStyles = { Pearls: 'pearls', 'Coconut jelly': 'jelly', 'Red bean': 'beans' }

function Preview({ drink }) {
  return (
    <div className="preview" style={{ backgroundColor: colors[drink.tea_base] }}>
      <img src="/boba-up.png" alt="Two Boba Up drinks with pearls on a wooden table" />
      <div className="recipe-icon" role="img"
        aria-label={`${drink.size} ${drink.temperature} ${drink.tea_base}, ice: ${drink.ice_level}, toppings: ${drink.toppings.join(', ') || 'none'}`}>
        <span className="recipe-temperature">{drink.temperature === 'Hot' ? '♨' : '❄'}</span>
        <div className={drink.size === 'Large' ? 'recipe-cup large' : 'recipe-cup'}
          style={{ backgroundColor: colors[drink.tea_base] }}>
          <div className="recipe-ice">
            {Array.from({ length: iceCounts[drink.ice_level] }, (_, i) => <i key={i} />)}
          </div>
          <div className="recipe-toppings">
            {drink.toppings.map(item => <span key={item} className={toppingStyles[item]} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

function Builder({ existing }) {
  const [drink, setDrink] = useState(existing || initialDrink)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  function change(field, value) {
    setDrink(current => {
      const updated = { ...current, [field]: value }
      if (field === 'temperature' && value === 'Hot') {
        updated.ice_level = 'None'
      }
      return updated
    })
  }

  function toggleTopping(item, checked) {
    const toppings = checked
      ? [...drink.toppings, item]
      : drink.toppings.filter(topping => topping !== item)

    change('toppings', toppings)
  }

  async function save(event) {
    event.preventDefault()
    const problem = validate(drink)
    if (problem) {
      setError(problem)
      return
    }

    setBusy(true)
    setError('')
    try {
      const saved = existing
        ? await request(`/${existing.id}`, 'PATCH', drink)
        : await request('', 'POST', drink)

      navigate(`/drinks/${saved.id}`)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <>
      <h1>{existing ? 'Edit your drink' : 'Build your boba'}</h1>
      <div className="layout">
        <Preview drink={drink} />

        <form onSubmit={save}>
          <label>
            Drink name
            <input
              required
              maxLength={80}
              value={drink.name}
              placeholder="My afternoon matcha"
              onChange={event => change('name', event.target.value)}
            />
          </label>

          {Object.entries(labels).map(([field, label]) => (
            <fieldset key={field}>
              <legend>{label}</legend>
              {Object.entries(prices[field]).map(([option, cents]) => (
                <label className="choice" key={option}>
                  <input
                    type="radio"
                    name={field}
                    checked={drink[field] === option}
                    disabled={
                      field === 'ice_level' &&
                      drink.temperature === 'Hot' &&
                      option !== 'None'
                    }
                    onChange={() => change(field, option)}
                  />
                  {option}{cents > 0 && ` · ${money(cents)}`}
                </label>
              ))}
              {field === 'ice_level' && drink.temperature === 'Hot' && (
                <small>Hot drinks come without ice.</small>
              )}
            </fieldset>
          ))}

          <fieldset>
            <legend>Toppings</legend>
            {Object.entries(prices.toppings).map(([item, cents]) => (
              <label className="choice" key={item}>
                <input
                  type="checkbox"
                  checked={drink.toppings.includes(item)}
                  onChange={event => toggleTopping(item, event.target.checked)}
                />
                {item} · {money(cents)}
              </label>
            ))}
          </fieldset>

          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={busy}>
            Save drink · {money(total(drink))}
          </button>
        </form>
      </div>
    </>
  )
}

function Details({ drink }) {
  return (
    <>
      <h1>{drink.name}</h1>
      <div className="layout">
        <Preview drink={drink} />
        <section>
          <h2>{drink.tea_base}</h2>
          <p>{drink.size} · {drink.temperature} · Ice: {drink.ice_level}</p>
          <p>Toppings: {drink.toppings.join(', ') || 'None'}</p>
          <p>{money(drink.total_cents)}</p>
          <Link to={`/drinks/${drink.id}/edit`}>Edit drink</Link>
        </section>
      </div>
    </>
  )
}

function Saved({ items }) {
  const [drinks, setDrinks] = useState(items)
  const [error, setError] = useState('')

  async function remove(drink) {
    if (!window.confirm(`Delete ${drink.name}?`)) return

    try {
      await request(`/${drink.id}`, 'DELETE')
      setDrinks(current => current.filter(item => item.id !== drink.id))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <h1>Saved drinks</h1>
      {error && <p role="alert">{error}</p>}
      {drinks.length === 0 && (
        <p>Your list is empty. <Link to="/">Build your first drink</Link></p>
      )}
      {drinks.map(drink => (
        <article key={drink.id}>
          <div>
            <h2><Link to={`/drinks/${drink.id}`}>{drink.name}</Link></h2>
            <p>{drink.size} · {drink.tea_base} · {money(drink.total_cents)}</p>
          </div>
          <div className="actions">
            <Link to={`/drinks/${drink.id}/edit`}>Edit</Link>
            <button onClick={() => remove(drink)}>Delete</button>
          </div>
        </article>
      ))}
    </>
  )
}

function Load({ id, mode }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    request(id ? `/${id}` : '')
      .then(value => {
        if (active) setData(value)
      })
      .catch(err => {
        if (active) setError(err.message)
      })

    return () => {
      active = false
    }
  }, [id])

  if (error) return <p role="alert">{error}</p>
  if (data === null) return <p>Loading drinks…</p>
  if (mode === 'list') return <Saved items={data} />
  if (mode === 'edit') return <Builder existing={data} />
  return <Details drink={data} />
}

function DrinkPage({ mode }) {
  const { id } = useParams()
  return <Load key={`${mode}-${id || ''}`} id={id} mode={mode} />
}

export default function App() {
  return (
    <>
      <header>
        <strong>Boba Builder</strong>
        <nav>
          <Link to="/">Build a drink</Link>
          <Link to="/drinks">Saved drinks</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Builder />} />
          <Route path="/drinks" element={<DrinkPage mode="list" />} />
          <Route path="/drinks/:id" element={<DrinkPage mode="detail" />} />
          <Route path="/drinks/:id/edit" element={<DrinkPage mode="edit" />} />
          <Route path="*" element={<Link to="/">Return to the boba builder</Link>} />
        </Routes>
      </main>
    </>
  )
}