import { useState, useRef, useEffect } from "react";
import {
  CircleDot,
  MapPin,
  Crosshair,
  Plus,
  Minus,
  ArrowRight,
  Check,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocations, useDeliveryRoute } from "@/api/hooks/useDeliveryData";

export default function DeliveryPrices() {
  const [selectedOrigin, setSelectedOrigin] = useState<string>("");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Custom searchable select state
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [originSearchQuery, setOriginSearchQuery] = useState("");
  const originDropdownRef = useRef<HTMLDivElement>(null);
  const originSearchInputRef = useRef<HTMLInputElement>(null);

  const distance = "0.0";

  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  // Fetch all locations for origin dropdown
  const { data: locations, isLoading: isLoadingLocations } = useLocations();

  // Fetch delivery route details when origin is selected
  const { data: routes, isLoading: isLoadingRoute } =
    useDeliveryRoute(selectedOrigin);
  const selectedRoute = routes?.find(
    (r) => r.id.toString() === selectedRouteId,
  );
  console.log("&&", routes);
  // Mock Map Initialization
  useEffect(() => {
    if (mapRef.current && !map) {
      setMap(null);
    }
  }, [mapRef, map]);

  // Click outside to close origin dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        originDropdownRef.current &&
        !originDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOriginOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOriginOpen && originSearchInputRef.current) {
      originSearchInputRef.current.focus();
    }
  }, [isOriginOpen]);

  const handleOriginChange = (val: string) => {
    setSelectedOrigin(val);
    setSelectedRouteId(null); // Reset selected route when origin changes
    setSearchQuery("");
  };

  const filteredRoutes =
    routes?.filter((route) =>
      route.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <AppLayout title="حاسبة التوصيل">
      {/* ... existing map code ... */}
      <div
        ref={mapRef}
        id="map"
        className="w-full h-full bg-[#E0E0E0] flex items-center justify-center text-[#666]"
      >
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

      <Card
        className="
        absolute bottom-0 start-0 end-0 
        bg-white border-none shadow-[0_-4px_20px_rgba(0,0,0,0.1)] 
        rounded-t-3xl !p-4 z-20 max-h-[80vh] overflow-y-auto
        md:top-6 md:start-6 md:bottom-6 md:end-auto md:w-[420px] md:rounded-3xl md:max-h-none
      "
      >
        <div className="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto -mt-2 mb-5 md:hidden" />

        <h2 className="text-xl font-bold mb-5 text-[#333]">
          احسب تكلفة التوصيل
        </h2>

        <div className="!space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-[#666]">من (المصدر)</Label>
            <div className="relative" ref={originDropdownRef}>
              <CircleDot
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#2196F3] z-10 pointer-events-none"
                size={18}
              />

              <button
                onClick={() => setIsOriginOpen(!isOriginOpen)}
                className="w-full flex items-center justify-between px-3 py-2 pe-11 h-[52px] rounded-xl border border-[#E0E0E0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                dir="rtl"
              >
                <span
                  className={!selectedOrigin ? "text-gray-500" : "text-[#333]"}
                >
                  {selectedOrigin
                    ? locations?.find((l) => l.id.toString() === selectedOrigin)
                        ?.name
                    : isLoadingLocations
                      ? "جاري تحميل المواقع..."
                      : "اختر موقع المصدر"}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 absolute left-3" />
              </button>

              {isOriginOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[#E0E0E0] rounded-xl shadow-lg max-h-[300px] flex flex-col overflow-hidden">
                  <div className="p-2 border-b border-[#eee]">
                    <div className="relative">
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        ref={originSearchInputRef}
                        type="text"
                        className="w-full pl-3 pr-8 py-2 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2196F3] text-right"
                        placeholder="بحث..."
                        value={originSearchQuery}
                        onChange={(e) => setOriginSearchQuery(e.target.value)}
                        dir="rtl"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {locations?.filter((loc) =>
                      loc.name
                        .toLowerCase()
                        .includes(originSearchQuery.toLowerCase()),
                    ).length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        لا توجد نتائج
                      </div>
                    ) : (
                      locations
                        ?.filter((loc) =>
                          loc.name
                            .toLowerCase()
                            .includes(originSearchQuery.toLowerCase()),
                        )
                        .map((loc) => (
                          <div
                            key={loc.id}
                            className={`
                                px-4 py-3 text-sm cursor-pointer text-right hover:bg-gray-50 transition-colors
                                ${selectedOrigin === loc.id.toString() ? "bg-blue-50 text-blue-600 font-medium" : "text-[#333]"}
                              `}
                            onClick={() => {
                              handleOriginChange(loc.id.toString());
                              setIsOriginOpen(false);
                              setOriginSearchQuery("");
                            }}
                          >
                            {loc.name}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Box */}
          {selectedOrigin && routes && (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-[#666]">بحث عن وجهة</Label>
                <div className="relative">
                  <Search
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    placeholder="ابحث عن اسم الوجهة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pe-10 h-[44px] rounded-xl border-[#E0E0E0] text-end bg-white"
                    dir="rtl"
                  />
                </div>
              </div>
              {/* Route Details Table */}
              <div className="space-y-2 mt-4">
                <Label className="text-sm text-[#666]">تفاصيل خط التوصيل</Label>
                <div className="border rounded-xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                  <table className="w-full text-sm text-right" dir="rtl">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-3 py-3 font-medium text-[#333]">
                          الانطلاق
                        </th>
                        <th className="px-3 py-3 font-medium text-[#333]">
                          الوجهة
                        </th>
                        <th className="px-3 py-3 font-medium text-[#333] text-center">
                          متاح
                        </th>
                        {/* <th className="px-3 py-3 font-medium text-[#333]">الوصف</th> */}
                        {/* <th className="px-3 py-3 font-medium text-[#333] text-center">السعر</th> */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {!selectedOrigin ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-gray-400"
                          >
                            يرجى اختيار موقع المصدر أولاً
                          </td>
                        </tr>
                      ) : isLoadingRoute ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            جاري تحميل المعلومات...
                          </td>
                        </tr>
                      ) : filteredRoutes.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-gray-400"
                          >
                            {searchQuery
                              ? "لم يتم العثور على نتائج للبحث"
                              : "لا توجد وجهات متاحة لهذا الموقع"}
                          </td>
                        </tr>
                      ) : (
                        filteredRoutes.map((route) => (
                          <tr
                            key={route.id}
                            className={`
                          cursor-pointer transition-colors
                          ${selectedRouteId === route.id.toString() ? "bg-blue-50/80 shadow-inner" : "hover:bg-gray-50/50"}
                        `}
                            onClick={() =>
                              setSelectedRouteId(route.id.toString())
                            }
                          >
                            <td className="px-3 py-3 align-middle text-[#333] font-medium">
                              {route.locations?.[0]?.name}
                            </td>
                            <td className="px-3 py-3 align-middle">
                              <span
                                className={`
                            inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                            ${
                              selectedRouteId === route.id.toString()
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-blue-50 text-blue-700 border-blue-100"
                            }
                          `}
                              >
                                {route.locations?.[1]?.name}
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
            </>
          )}

          {/* Cost Box */}
          <div className="bg-[#EBF5FF] rounded-xl p-5 mt-6 md:p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[#2196F3] text-xs font-bold uppercase tracking-wider block mb-1">
                  مبلغ التوصيل
                </span>
                <div className="flex items-baseline">
                  <span className="text-[40px] md:text-[48px] font-bold text-[#333] leading-none">
                    $
                    {isLoadingRoute
                      ? "..."
                      : selectedRoute?.deliveryPrice?.toFixed(2) || "0.00"}
                  </span>
                  <span className="text-sm text-[#666] ms-2 font-medium">
                    ريال يمني
                  </span>
                </div>
              </div>
              <div className="text-start">
                <span className="text-[11px] text-[#666] block">المسافة</span>
                <span className="text-base font-bold text-[#333]">
                  {distance} كم
                </span>
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
  );
}
