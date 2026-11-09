import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Bed,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Check,
  X,
  Loader2,
  Users,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';

const ROOM_TYPES = ['Standard', 'Deluxe', 'Executive Suite', 'Presidential Suite'];

export default function ManageRooms() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [formData, setFormData] = useState({
    hotel: '',
    roomType: 'Deluxe',
    roomNumber: '',
    pricePerNight: '8500',
    maxGuests: '2',
    bedType: 'King Size',
    description: '',
    amenities: 'High-Speed WiFi, Marble Bath, Espresso Bar',
    images: '',
    isAvailable: true,
  });

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Fetch all hotels for the selector
  const fetchHotels = async () => {
    try {
      const res = await api.get('/hotels?limit=50');
      if (res.data?.success && res.data.hotels?.length > 0) {
        setHotels(res.data.hotels);
        setSelectedHotelId(res.data.hotels[0]._id);
      }
    } catch (err) {
      addToast('Failed to fetch hotels.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch rooms for currently selected hotel
  const fetchRoomsForHotel = async (hotelId) => {
    if (!hotelId) return;
    setRoomsLoading(true);
    try {
      const res = await api.get(`/rooms/hotel/${hotelId}`);
      if (res.data?.success) {
        setRooms(res.data.rooms || []);
      }
    } catch (err) {
      addToast('Failed to load rooms for this hotel.', 'error');
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotelId) {
      fetchRoomsForHotel(selectedHotelId);
    }
  }, [selectedHotelId]);

  const handleOpenAddModal = () => {
    setEditingRoomId(null);
    setFormData({
      hotel: selectedHotelId,
      roomType: 'Deluxe',
      roomNumber: '',
      pricePerNight: '8500',
      maxGuests: '2',
      bedType: 'King Size',
      description: '',
      amenities: 'High-Speed WiFi, Marble Bath, Espresso Bar, Rain Shower',
      images: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoomId(room._id);
    setFormData({
      hotel: room.hotel,
      roomType: room.roomType,
      roomNumber: room.roomNumber,
      pricePerNight: String(room.pricePerNight),
      maxGuests: String(room.maxGuests),
      bedType: room.bedType || 'King Size',
      description: room.description || '',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      images: Array.isArray(room.images) ? room.images.join('\n') : '',
      isAvailable: Boolean(room.isAvailable),
    });
    setIsModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();

    if (!formData.hotel || !formData.roomNumber.trim() || !formData.pricePerNight) {
      addToast('Please fill in all mandatory fields.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        hotel: formData.hotel,
        roomType: formData.roomType,
        roomNumber: formData.roomNumber.trim(),
        pricePerNight: parseFloat(formData.pricePerNight),
        maxGuests: parseInt(formData.maxGuests, 10) || 2,
        bedType: formData.bedType.trim(),
        description: formData.description.trim(),
        amenities: formData.amenities
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        images: formData.images
          .split('\n')
          .map((img) => img.trim())
          .filter(Boolean),
        isAvailable: formData.isAvailable,
      };

      if (editingRoomId) {
        const res = await api.put(`/rooms/${editingRoomId}`, payload);
        if (res.data?.success) {
          addToast('Room updated successfully!', 'success');
          setIsModalOpen(false);
          fetchRoomsForHotel(selectedHotelId);
        }
      } else {
        const res = await api.post('/rooms', payload);
        if (res.data?.success) {
          addToast('Room created successfully!', 'success');
          setIsModalOpen(false);
          fetchRoomsForHotel(selectedHotelId);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save room.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle availability inline
  const handleToggleAvailability = async (room) => {
    try {
      const res = await api.put(`/rooms/${room._id}`, {
        isAvailable: !room.isAvailable,
      });
      if (res.data?.success) {
        addToast(
          `Room ${room.roomNumber} marked as ${!room.isAvailable ? 'Available' : 'Unavailable'}.`,
          'info'
        );
        fetchRoomsForHotel(selectedHotelId);
      }
    } catch (err) {
      addToast('Failed to toggle room availability.', 'error');
    }
  };

  const handleDeletePrompt = (room) => {
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/rooms/${roomToDelete._id}`);
      if (res.data?.success) {
        addToast(res.data.message || 'Room deleted successfully.', 'success');
        setDeleteModalOpen(false);
        setRoomToDelete(null);
        fetchRoomsForHotel(selectedHotelId);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete room.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
            <Bed className="w-4 h-4" />
            <span>Suite Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Hotel Rooms
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure room types, assign room numbers, adjust pricing, and toggle room availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/hotels"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            Manage Hotels
          </Link>
          <button
            onClick={handleOpenAddModal}
            disabled={hotels.length === 0}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New Room
          </button>
        </div>
      </div>

      {/* Hotel Selector Bar */}
      <div className="mt-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 shrink-0">
            Selected Hotel:
          </label>
          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition cursor-pointer"
          >
            {hotels.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.city}, {h.country})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total suites configured:{' '}
          <strong className="text-slate-900">{rooms.length}</strong>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="mt-6 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {roomsLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading suites...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Bed className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Rooms for This Hotel</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click "Add New Room" above to configure your first room suite for this hotel property.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Room Number</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Nightly Rate</th>
                  <th className="py-4 px-6">Capacity</th>
                  <th className="py-4 px-6">Bedding</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                      Room {room.roomNumber}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold px-2.5 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700">
                        {room.roomType}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-900 text-sm">
                      {formatCurrency(room.pricePerNight, room.currency || 'INR')}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {room.maxGuests} Guests
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {room.bedType}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleAvailability(room)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition border ${
                          room.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle availability"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            room.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        ></span>
                        {room.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(room)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-600 transition"
                          title="Edit room"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(room)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                          title="Delete room"
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

      {/* Add / Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRoomId ? 'Edit Room Suite' : 'Add New Room Suite'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Assign to Hotel *
                </label>
                <select
                  required
                  value={formData.hotel}
                  onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                >
                  {hotels.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g. 101 or 302-A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  >
                    {ROOM_TYPES.map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Price per Night (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Max Capacity (Guests) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Bedding Configuration
                  </label>
                  <input
                    type="text"
                    value={formData.bedType}
                    onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                    placeholder="e.g. King Size"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Spacious room with marble bathroom, balcony overlooking gardens..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Marble Bath, Balcony, Espresso Machine, Rain Shower"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Image URLs (one URL per line)
                </label>
                <textarea
                  rows="2"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                ></textarea>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                  />
                  <span>Room is Active & Available for Booking</span>
                </label>
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
                      Save Suite
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Room Suite"
        message={`Are you sure you want to delete Room "${roomToDelete?.roomNumber}" (${roomToDelete?.roomType})? This action cannot be undone.`}
        confirmText="Confirm Delete"
        isLoading={submitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
