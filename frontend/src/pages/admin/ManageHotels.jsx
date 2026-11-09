import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { formatINR } from '../../utils/formatCurrency';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Bed,
  MapPin,
  Star,
  Sparkles,
  ExternalLink,
  X,
  Loader2,
  Check,
} from 'lucide-react';

export default function ManageHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    rating: '4.5',
    amenities: '',
    images: '',
    featured: false,
  });

  // Modal State for Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState(null);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hotels?limit=50');
      if (res.data?.success) {
        setHotels(res.data.hotels || []);
      }
    } catch (err) {
      addToast('Failed to load hotels list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleOpenAddModal = () => {
    setEditingHotelId(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      country: '',
      rating: '4.5',
      amenities: 'High-Speed WiFi, Pool, Spa, Gym, Valet Parking',
      images: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (hotel) => {
    setEditingHotelId(hotel._id);
    setFormData({
      name: hotel.name,
      description: hotel.description,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      rating: String(hotel.rating),
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : '',
      images: Array.isArray(hotel.images) ? hotel.images.join('\n') : '',
      featured: Boolean(hotel.featured),
    });
    setIsModalOpen(true);
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.city.trim() || !formData.country.trim()) {
      addToast('Please provide all mandatory fields.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(),
        rating: parseFloat(formData.rating) || 4.5,
        amenities: formData.amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        images: formData.images
          .split('\n')
          .map((img) => img.trim())
          .filter(Boolean),
        featured: formData.featured,
      };

      if (editingHotelId) {
        const res = await api.put(`/hotels/${editingHotelId}`, payload);
        if (res.data?.success) {
          addToast('Hotel updated successfully!', 'success');
          setIsModalOpen(false);
          fetchHotels();
        }
      } else {
        const res = await api.post('/hotels', payload);
        if (res.data?.success) {
          addToast('Hotel created successfully!', 'success');
          setIsModalOpen(false);
          fetchHotels();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save hotel.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePrompt = (hotel) => {
    setHotelToDelete(hotel);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!hotelToDelete) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/hotels/${hotelToDelete._id}`);
      if (res.data?.success) {
        addToast(res.data.message || 'Hotel deleted successfully.', 'success');
        setDeleteModalOpen(false);
        setHotelToDelete(null);
        fetchHotels();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete hotel.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Inventory Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Hotels
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add new hotel properties, modify descriptions and ratings, or oversee room suites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/rooms"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Bed className="w-4 h-4" />
            Manage Rooms
          </Link>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New Hotel
          </button>
        </div>
      </div>

      {/* Hotels Table / Content */}
      <div className="mt-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading hotel inventory...</p>
          </div>
        ) : hotels.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Hotels in Database</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hotels currently exist. Click "Add New Hotel" above or run the development seed script (`npm run seed:hotels`).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Starting Price</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hotels.map((hotel) => (
                  <tr key={hotel._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80'}
                          alt={hotel.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            {hotel.name}
                            {hotel.featured && (
                              <Sparkles className="w-3.5 h-3.5 text-brand-600" title="Featured" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {hotel.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">
                      {hotel.city}, {hotel.country}
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1 font-bold text-slate-800 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3 h-3 fill-current text-amber-500" />
                        <span>{hotel.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {hotel.startingPrice > 0 ? `${formatINR(hotel.startingPrice)} / nt` : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/hotels/${hotel._id}`}
                          target="_blank"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
                          title="View public details page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(hotel)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-600 transition"
                          title="Edit hotel"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(hotel)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                          title="Delete hotel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Hotel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingHotelId ? 'Edit Hotel Property' : 'Add New Hotel'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotel} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. The Grand Luminary Palace"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Paris"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. France"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Physical Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 14 Avenue Montaigne"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of the property, architecture, ambiance, and location..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Rating (1.0 to 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                    />
                    <span>Highlight as Featured Property</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="High-Speed WiFi, Infinity Pool, Thermal Spa, Valet Parking"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Image URLs (one URL per line)
                </label>
                <textarea
                  rows="3"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Hotel
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Hotel Property"
        message={`Are you sure you want to delete "${hotelToDelete?.name}"? Warning: All associated rooms and future reservations linked to this hotel will also be permanently deleted from the database.`}
        confirmText="Confirm Delete"
        isLoading={submitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
