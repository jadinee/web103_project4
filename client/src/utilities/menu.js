export const prices = {
  tea_base: {
    'Black milk tea': 450,
    Matcha: 525,
    Taro: 500
  },
  size: {
    Regular: 0,
    Large: 75
  },
  temperature: {
    Iced: 0,
    Hot: 0
  },
  ice_level: {
    None: 0,
    Light: 0,
    Regular: 0
  },
  toppings: {
    Pearls: 60,
    'Coconut jelly': 75,
    'Red bean': 65
  }
}

export function validate(drink) {
  if (!drink || typeof drink.name !== 'string') {
    return 'Give your drink a name.'
  }

  const name = drink.name.trim()
  if (name.length === 0 || name.length > 80) {
    return 'Give your drink a name of 1–80 characters.'
  }

  for (const field of ['tea_base', 'size', 'temperature', 'ice_level']) {
    const choice = drink[field]
    if (typeof choice !== 'string' || !Object.hasOwn(prices[field], choice)) {
      return 'Choose a valid option for each feature.'
    }
  }

  if (!Array.isArray(drink.toppings)) {
    return 'Choose valid toppings.'
  }

  for (const topping of drink.toppings) {
    if (typeof topping !== 'string' || !Object.hasOwn(prices.toppings, topping)) {
      return 'Choose a topping from the menu.'
    }
  }

  if (new Set(drink.toppings).size !== drink.toppings.length) {
    return 'Choose each topping only once.'
  }

  if (drink.temperature === 'Hot' && drink.ice_level !== 'None') {
    return 'Hot tea cannot include ice.'
  }
}

export function total(drink) {
  const toppingCost = drink.toppings.reduce(
    (sum, topping) => sum + prices.toppings[topping],
    0
  )

  return prices.tea_base[drink.tea_base] + prices.size[drink.size] + toppingCost
}

export function money(cents) {
  return '$' + (cents / 100).toFixed(2)
}