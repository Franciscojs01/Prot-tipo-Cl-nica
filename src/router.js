// Simple router based on in-memory and hash
import stateModule from './state.js'

const views = ['dashboard', 'agenda', 'pacientes', 'faturamento']

function navigate(view) {
  if (!views.includes(view)) view = 'agenda'
  window.location.hash = `#${view}`
  stateModule.setLastView(view)
  renderView(view)
}

function current() {
  const hash = (window.location.hash || '').replace('#', '')
  return views.includes(hash) ? hash : stateModule.state.settings.lastView || 'agenda'
}

function renderView(view) {
  const root = document.querySelector('#main-view')
  if (!root) return
  // emit simple event for main to re-render
  root.dataset.view = view
  const event = new CustomEvent('view:change', { detail: { view } })
  window.dispatchEvent(event)
}

window.addEventListener('hashchange', () => renderView(current()))

export default { navigate, current, renderView }
