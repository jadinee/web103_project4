export async function request(path = '', method = 'GET', body) {
  const options = { method }

  if (body !== undefined) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body)
  }

  const response = await fetch('/api/drinks' + path, options)

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Could not complete the request. Please try again.')
  }

  if (response.status !== 204) {
    return response.json()
  }
}