import { Link } from "react-router"
import { Menu, PlusCircle } from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AppLayout({ children, title = "حاسبة التوصيل" }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F9FA] font-['Inter',sans-serif]" dir="rtl">
      {/* Header */}
      <header className="flex items-center px-4 py-4 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.05)] z-10 md:px-10 md:py-5">
        <Menu className="me-4 cursor-pointer text-[#333]" size={24} />
        <h1 className="text-lg font-semibold flex-1 text-center ms-10 md:text-start md:text-[22px] md:ms-3">{title}</h1>
        <Link 
          to="/add-route" 
          className="flex items-center gap-2 text-[#2196F3] font-medium text-sm no-underline"
        >
          <PlusCircle size={18} />
          إضافة مسار
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  )
}
