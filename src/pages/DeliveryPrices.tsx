

import { useState, useRef, useEffect } from "react"
import { CircleDot, MapPin, Crosshair, Plus, Minus, ArrowRight, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AppLayout } from "@/components/layout/AppLayout"
import { useLocations, useDeliveryRoute } from "@/hooks/useDeliveryData"

export default function DeliveryPrices() {
  const [selectedOrigin, setSelectedOrigin] = useState<string>("")
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const distance = "0.0"
  
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)

  // Fetch all locations for origin dropdown
  const { data: locations, isLoading: isLoadingLocations } = useLocations()
  
  // Fetch delivery route details when origin is selected
  // Fetch delivery route details when a route is selected from the table
  const { data: routeDetails, isLoading: isLoadingRoute } = useDeliveryRoute(selectedRouteId)

  // Mock Map Initialization
  useEffect(() => {
    if (mapRef.current && !map) {
      console.log("Map would be initialized here")
      setMap(null)
    }
  }, [mapRef, map])

  const handleOriginChange = (val: string) => {
    setSelectedOrigin(val)
    setSelectedRouteId(null) // Reset selected route when origin changes
    setSearchQuery("")
  }

  // Find current origin object to get its routeLocations
  const originLocationObj = locations?.find(loc => loc.id.toString() === selectedOrigin)
  const routeLocations = originLocationObj?.routeLocations || []
  
  console.log("Debug - locations:", locations)
  console.log("Debug - selectedOrigin:", selectedOrigin)
  console.log("Debug - originLocationObj:", originLocationObj)
  console.log("Debug - routeLocations:", routeLocations)

  const filteredRoutes = routeLocations.filter(rl => 
    rl.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AppLayout title="حاسبة التوصيل">
      {/* ... existing map code ... */}
      <div ref={mapRef} id="map" className="w-full h-full bg-[#E0E0E0] flex items-center justify-center text-[#666]">
        <div className="text-center">
          <MapPin size={48} className="mx-auto mb-2 opacity-30" />
          <p>خريطة جوجل ستظهر هنا</p>
        </div>
      </div>

      <div className="absolute top-5 end-5 flex flex-col gap-3 z-10 md:start-[468px] md:end-auto md:top-6">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none h-11 w-11 rounded-lg text-[#333] hover:bg-gray-50"
        >
          <Crosshair size={20} />
        </Button>
        <div className="flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-white border-none border-b border-[#eee] rounded-t-lg rounded-b-none h-11 w-11 text-[#333] hover:bg-gray-50"
          >
            <Plus size={20} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-white border-none rounded-b-lg rounded-t-none h-11 w-11 text-[#333] hover:bg-gray-50"
          >
            <Minus size={20} />
          </Button>
        </div>
      </div>

      <Card className="
        absolute bottom-0 start-0 end-0 
        bg-white border-none shadow-[0_-4px_20px_rgba(0,0,0,0.1)] 
        rounded-t-3xl !p-4 z-20 max-h-[80vh] overflow-y-auto
        md:top-6 md:start-6 md:bottom-6 md:end-auto md:w-[420px] md:rounded-3xl md:max-h-none
      ">
        <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto -mt-2 mb-5 md:hidden" />
        
        <h2 className="text-xl font-bold mb-5 text-[#333]">احسب تكلفة التوصيل</h2>

        <div className="!space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-[#666]">من (المصدر)</Label>
            <div className="relative">
              <CircleDot className="absolute end-3 top-1/2 -translate-y-1/2 text-[#2196F3] z-10" size={18} />
              <Select value={selectedOrigin} onValueChange={handleOriginChange} dir="rtl">
                <SelectTrigger className="pe-11 h-[52px] rounded-xl border-[#E0E0E0] focus:ring-[#2196F3] text-end text-base bg-white">
                  <SelectValue placeholder={isLoadingLocations ? "جاري تحميل المواقع..." : "اختر موقع المصدر"} />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()} className="text-end">
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Box */}
          {selectedOrigin && (
            <div className="space-y-2">
              <Label className="text-sm text-[#666]">بحث عن وجهة</Label>
              <div className="relative">
                <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input 
                  placeholder="ابحث عن اسم الوجهة..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pe-10 h-[44px] rounded-xl border-[#E0E0E0] text-end bg-white"
                  dir="rtl"
                />
              </div>
            </div>
          )}

          {/* Route Details Table */}
          <div className="space-y-2 mt-4">
            <Label className="text-sm text-[#666]">تفاصيل خط التوصيل</Label>
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-right" dir="rtl">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-3 font-medium text-[#333]">الانطلاق</th>
                    <th className="px-3 py-3 font-medium text-[#333]">الوجهة</th>
                    <th className="px-3 py-3 font-medium text-[#333] text-center">متاح</th>
                    {/* <th className="px-3 py-3 font-medium text-[#333]">الوصف</th> */}
                    {/* <th className="px-3 py-3 font-medium text-[#333] text-center">السعر</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!selectedOrigin ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        يرجى اختيار موقع المصدر أولاً
                      </td>
                    </tr>
                  ) : isLoadingRoute ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        جاري تحميل المعلومات...
                      </td>
                    </tr>
                  ) : filteredRoutes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        {searchQuery ? "لم يتم العثور على نتائج للبحث" : "لا توجد وجهات متاحة لهذا الموقع"}
                      </td>
                    </tr>
                  ) : (
                    filteredRoutes.map((rl) => (
                      <tr 
                        key={`${rl.deliveryRouteId}-${rl.name}`} 
                        className={`
                          cursor-pointer transition-colors
                          ${selectedRouteId === rl.deliveryRouteId.toString() ? 'bg-blue-50/80 shadow-inner' : 'hover:bg-gray-50/50'}
                        `}
                        onClick={() => setSelectedRouteId(rl.deliveryRouteId.toString())}
                      >
                        <td className="px-3 py-3 align-middle text-[#333] font-medium">
                          {originLocationObj?.name}
                        </td>
                        <td className="px-3 py-3 align-middle">
                          <span className={`
                            inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                            ${selectedRouteId === rl.deliveryRouteId.toString() 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-blue-50 text-blue-700 border-blue-100'}
                          `}>
                            {rl.name}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-middle text-center">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <Check size={14} />
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>


          {/* Cost Box */}
          <div className="bg-[#EBF5FF] rounded-xl p-5 mt-6 md:p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[#2196F3] text-xs font-bold uppercase tracking-wider block mb-1">مبلغ التوصيل</span>
                <div className="flex items-baseline">
                  <span className="text-[40px] md:text-[48px] font-bold text-[#333] leading-none">
                    ${isLoadingRoute ? "..." : (routeDetails?.deliveryPrice?.toFixed(2) || "0.00")}
                  </span>
                  <span className="text-sm text-[#666] ms-2 font-medium">ريال يمني</span>
                </div>
              </div>
              <div className="text-start">
                <span className="text-[11px] text-[#666] block">المسافة</span>
                <span className="text-base font-bold text-[#333]">{distance} كم</span>
              </div>
            </div>
            
            <div className="h-px bg-[#2196F3]/20 my-4" />

            {/* <div className="flex justify-between text-[13px] text-[#666]">
              <span className="flex items-center gap-1">رسوم التوصيل الأساسية</span>
              <span>$0.00 (شاملة)</span>
            </div> */}
          </div>

          {/* Book Button */}
          <Button 
            className="w-full h-[56px] rounded-xl bg-[#2196F3] hover:bg-[#1976D2] text-lg font-semibold gap-3 transition-colors"
            onClick={() => console.log("Book delivery")}
          >
            اطلب التوصيل الآن
            <ArrowRight size={20} className="-scale-x-100" />
          </Button>
        </div>
      </Card>
    </AppLayout>
  )

}
