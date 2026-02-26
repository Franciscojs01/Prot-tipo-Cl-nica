import React, { createContext, useContext, useReducer, useEffect } from 'react'

const STORAGE_KEYS = {
  PATIENTS: 'espacoReabilita_patients',
  APPOINTMENTS: 'espacoReabilita_appointments',
  SETTINGS: 'espacoReabilita_settings',
  USERS: 'espacoReabilita_users',
  SERVICES: 'espacoReabilita_services'
}

const defaultState = {
  userRole: 'guest',
  currentUser: null,
  users: [],
  patients: [],
  appointments: [],
  services: [],
  settings: { lastView: 'agenda' }
}

function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback } catch(e){ return fallback }
}

function save(key, v){ try { localStorage.setItem(key, JSON.stringify(v)) } catch(e){} }

function reducer(state, action){
  switch(action.type){
    case 'init':
      return { ...state, ...action.payload }
    case 'setRole':
      return { ...state, userRole: action.role }
    case 'setCurrentUser':
      return { ...state, currentUser: action.user }
    case 'addPatient':
      return { ...state, patients: [...state.patients, action.patient] }
    case 'updatePatient':
      return { ...state, patients: state.patients.map(p => p.id === action.id ? { ...p, ...action.changes } : p) }
    case 'removePatient':
      return { ...state, patients: state.patients.filter(p => p.id !== action.id), appointments: state.appointments.filter(a => a.patientId !== action.id) }
    case 'addAppointment':
      return { ...state, appointments: [...state.appointments, action.appt] }
    case 'updateAppointment':
      return { ...state, appointments: state.appointments.map(a => a.id === action.id ? { ...a, ...action.changes } : a) }
    case 'removeAppointment':
      return { ...state, appointments: state.appointments.filter(a => a.id !== action.id) }
    case 'addUser':
      return { ...state, users: [...state.users, action.user] }
    case 'addService':
      return { ...state, services: [...state.services, action.service] }
    case 'setServices':
      return { ...state, services: action.services }
    default:
      return state
  }
}

const StateContext = createContext(null)

export default function StateProvider({ children }){
  const [s, dispatch] = useReducer(reducer, defaultState)

  // init from localStorage
  useEffect(()=>{
    const patients = load(STORAGE_KEYS.PATIENTS, [])
    const appointments = load(STORAGE_KEYS.APPOINTMENTS, [])
    const settings = load(STORAGE_KEYS.SETTINGS, { lastView: 'agenda' })
    const users = load(STORAGE_KEYS.USERS, [])
    const services = load(STORAGE_KEYS.SERVICES, [])

    // Seed default services if none
    const defaultServices = [
      { id: 's_consulta', name: 'Consulta', price: 120.00 },
      { id: 's_fisio', name: 'Fisioterapia', price: 150.00 },
      { id: 's_avaliacao', name: 'Avaliação', price: 200.00 }
    ]

    // If there are no users, create admin and seed data for demo
    if (!users || users.length === 0) {
      const admin = { id: 'u_admin', name: 'Admin', email: 'admin@example.com', password: 'admin', role: 'gestor' }
      const svc = (services && services.length) ? services : defaultServices
      // Seed sample patient/appointment if none
      if ((!patients || patients.length === 0) && (!appointments || appointments.length === 0)) {
        const samplePatient = { id: 'p_sample', fullName: 'João Silva', phone: '11999990000', email: 'joao@example.com', notes: 'Paciente demo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        const sampleAppointment = { id: 'a_sample', patientId: 'p_sample', date: new Date().toISOString().slice(0,10), time: '10:00', service: svc[0].name, value: svc[0].price, status: 'scheduled', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        dispatch({ type: 'init', payload: { patients: [samplePatient], appointments: [sampleAppointment], settings, users: [admin], services: svc, currentUser: admin, userRole: admin.role } })
        return
      }
      dispatch({ type: 'init', payload: { patients, appointments, settings, users: [admin], services: svc, currentUser: admin, userRole: admin.role } })
      return
    }

    // If users exist but services empty, seed default services
    const svc = (services && services.length) ? services : defaultServices
    // If patients/appointments empty, seed sample data
    if ((patients || []).length === 0 && (appointments || []).length === 0) {
      const samplePatient = { id: 'p_sample', fullName: 'João Silva', phone: '11999990000', email: 'joao@example.com', notes: 'Paciente demo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const sampleAppointment = { id: 'a_sample', patientId: 'p_sample', date: new Date().toISOString().slice(0,10), time: '10:00', service: svc[0].name, value: svc[0].price, status: 'scheduled', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      dispatch({ type: 'init', payload: { patients: [samplePatient], appointments: [sampleAppointment], settings, users, services: svc } })
      return
    }

    dispatch({ type: 'init', payload: { patients, appointments, settings, users, services: svc } })
  }, [])

  // persist changes
  useEffect(()=>{
    save(STORAGE_KEYS.PATIENTS, s.patients)
    save(STORAGE_KEYS.APPOINTMENTS, s.appointments)
    save(STORAGE_KEYS.SETTINGS, s.settings)
    save(STORAGE_KEYS.USERS, s.users)
    save(STORAGE_KEYS.SERVICES, s.services)
    window.userRole = s.userRole
  }, [s.patients, s.appointments, s.settings, s.users, s.services, s.userRole])

  const api = {
    state: s,
    setUserRole: (role) => dispatch({ type: 'setRole', role }),
    addPatient: (p) => dispatch({ type: 'addPatient', patient: p }),
    updatePatient: (id, changes) => dispatch({ type: 'updatePatient', id, changes }),
    removePatient: (id) => dispatch({ type: 'removePatient', id }),
    addAppointment: (a) => dispatch({ type: 'addAppointment', appt: a }),
    updateAppointment: (id, changes) => dispatch({ type: 'updateAppointment', id, changes }),
    removeAppointment: (id) => dispatch({ type: 'removeAppointment', id }),
    registerUser: (u) => {
      const exists = s.users.find(x => x.email === u.email)
      if (exists) return { ok: false, message: 'Email já cadastrado' }
      const user = { id: u.id || `u_${Date.now()}`, name: u.name || u.name, email: u.email, password: u.password, role: u.role || 'recepcao' }
      dispatch({ type: 'addUser', user })
      dispatch({ type: 'setCurrentUser', user })
      dispatch({ type: 'setRole', role: user.role })
      return { ok: true, user }
    },
    loginUser: (email, password) => {
      const user = s.users.find(x => x.email === email && x.password === password)
      if (!user) return { ok: false, message: 'Credenciais inválidas' }
      dispatch({ type: 'setCurrentUser', user })
      dispatch({ type: 'setRole', role: user.role })
      return { ok: true, user }
    },
    logout: () => { dispatch({ type: 'setCurrentUser', user: null }); dispatch({ type: 'setRole', role: 'guest' }) },
    getServices: () => s.services,
    addService: (svc) => dispatch({ type: 'addService', service: svc }),
    setServices: (services) => dispatch({ type: 'setServices', services })
  }

  return <StateContext.Provider value={api}>{children}</StateContext.Provider>
}

export function useAppState(){
  const c = useContext(StateContext)
  if (!c) throw new Error('useAppState must be used within StateProvider')
  return c
}
