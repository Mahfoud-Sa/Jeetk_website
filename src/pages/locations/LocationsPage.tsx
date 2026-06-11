import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocations } from '../../hooks/useLocations';
import { useCreateLocation } from '../../hooks/useCreateLocation';
import { useUpdateLocation } from '../../hooks/useUpdateLocation';
import { useDeleteLocation } from '../../hooks/useDeleteLocation';
import { Location } from '../../types/location';
import { LocationTable } from '../../components/locations/LocationTable';
import { LocationFormModal } from '../../components/locations/LocationFormModal';
import { LocationDetailsModal } from '../../components/locations/LocationDetailsModal';
import { AlertCircle, Trash2, X } from 'lucide-react';

export const LocationsPage = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();

  // Pagination & Search Query States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals active states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Delete confirm state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [locationToDeleteId, setLocationToDeleteId] = useState<number | null>(null);

  // Debouncing typed search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // reset to page 1 on search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Loading the Queries and Mutations
  const { 
    data: pagedResponse, 
    isLoading, 
    isError, 
    refetch 
  } = useLocations(currentPage, pageSize, debouncedSearch);

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const locations = pagedResponse?.data || [];
  const totalRecords = pagedResponse?.totalRecords || 0;
  const totalPages = pagedResponse?.totalPages || 1;

  // Language translated strings for local logs/actions
  const t = {
    ar: {
      confirmDeleteTitle: "تأكيد حذف الموقع الجغرافي نهائياً",
      confirmDeleteText: "هل أنت متأكد من رغبتك في حذف هذا الموقع؟ هذا الإجراء غير قابل للتراجع وتترتب عليه إزالة الارتباطات.",
      cancel: "تراجع",
      confirm: "حذف نهائي",
      deleteSuccess: "تم حذف الموقع بنجاح",
      createSuccess: "تم إنشاء الموقع وبدء تفعيله",
      updateSuccess: "تم حفظ التعديلات وإعادة المزامنة",
      saveFail: "عذراً فشل الاتصال بالخادم، يرجى التحقق من المدخلات.",
      deleteFail: "فشل استبعاد وحذف الموقع"
    },
    en: {
      confirmDeleteTitle: "Confirm Location Deletion",
      confirmDeleteText: "Are you sure you want to permanently delete this location node? This action is irreversible and might clear associated records.",
      cancel: "Cancel",
      confirm: "Yes, Delete",
      deleteSuccess: "Location has been deleted successfully",
      createSuccess: "New location node created and activated",
      updateSuccess: "Location details updated successfully",
      saveFail: "Failed to save, please check details or connection parameter.",
      deleteFail: "Failed to de-provision location"
    }
  };

  const currT = language === 'ar' ? t.ar : t.en;

  const handleRefresh = () => {
    refetch();
    showToast(language === 'ar' ? 'تم تحديث قائمة المواقع بنجاح' : 'Location directory updated', 'success');
  };

  const handleView = (location: Location) => {
    setSelectedLocation(location);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsFormModalOpen(true);
  };

  const handleCreateOpen = () => {
    setSelectedLocation(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
    setLocationToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (locationToDeleteId === null) return;
    try {
      await deleteMutation.mutateAsync(locationToDeleteId);
      showToast(currT.deleteSuccess, 'success');
      setIsDeleteConfirmOpen(false);
      setLocationToDeleteId(null);
    } catch (err: any) {
      showToast(err?.message || currT.deleteFail, 'error');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedLocation) {
        // Edit Mode
        await updateMutation.mutateAsync({
          id: selectedLocation.id,
          data: formData
        });
        showToast(currT.updateSuccess, 'success');
      } else {
        // Create Mode
        await createMutation.mutateAsync(formData);
        showToast(currT.createSuccess, 'success');
      }
      setIsFormModalOpen(false);
      setSelectedLocation(null);
    } catch (err: any) {
      showToast(err?.message || currT.saveFail, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Locations Main Table View Grid */}
      <LocationTable
        locations={locations}
        isLoading={isLoading}
        totalRecords={totalRecords}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onCreateOpen={handleCreateOpen}
        isError={isError}
      />

      {/* FORM MODAL (Add / Edit) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <LocationFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            onSubmit={handleFormSubmit}
            location={selectedLocation}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* DETAILS VIEW MODAL */}
      <AnimatePresence>
        {isDetailsModalOpen && (
          <LocationDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            location={selectedLocation}
          />
        )}
      </AnimatePresence>

      {/* PREMIUM TRANSITION MODAL FOR SECURE TERMINATION CONFIRMATION */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 15 }} 
              className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-zinc-100 text-start font-sans"
            >
              <div className="flex items-center gap-3.5 mb-4 pb-2 border-b border-zinc-100">
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-full shrink-0">
                  <AlertCircle className="w-5.5 h-5.5" />
                </div>
                <h3 className="text-lg font-extrabold text-zinc-900 leading-none">{currT.confirmDeleteTitle}</h3>
              </div>

              <p className="text-sm font-semibold text-zinc-500 leading-relaxed font-sans">
                {currT.confirmDeleteText}
              </p>

              <div className="flex justify-end gap-3.5 mt-6 pt-3 border-t border-zinc-100 font-sans">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {currT.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleteMutation.isPending}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {deleteMutation.isPending && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{currT.confirm}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
