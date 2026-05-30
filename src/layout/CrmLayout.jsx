import { Outlet } from 'react-router-dom'
import BotTokenAlert from '../components/BotTokenAlert.jsx'
import Sidebar from './Sidebar.jsx'

export default function CrmLayout() {
  return (
    <div
      className="flex h-svh overflow-hidden bg-[#f4f6f9]"
      style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}
    >
      <Sidebar />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <BotTokenAlert />
        <Outlet />
      </main>
    </div>
  )
}
