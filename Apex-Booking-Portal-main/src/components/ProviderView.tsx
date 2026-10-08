import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  TrendingUp,
  Trash2,
  Plus,
  Pencil,
  Users,
  Briefcase,
  Loader2,
  Paperclip,
} from 'lucide-react';
import { supabase, type Booking, type Service, type Consultant } from '@/lib/supabase';
import {
  fetchBookings,
  fetchAllServices,
  fetchAllConsultants,
  updateBookingStatus,
  deleteBooking,
  createService,
  updateService,
  deleteService,
  createConsultant,
  updateConsultant,
  deleteConsultant,
} from '@/lib/api';
import { useToast } from '@/components/Toast';

interface ProviderViewProps {
  open: boolean;
  onClose: () => void;
}

type Tab = 'bookings' | 'services' | 'consultants';

export function ProviderView({ open, onClose }: ProviderViewProps) {
  const [tab, setTab] = useState<Tab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const { notify } = useToast();

  useEffect(() => {
    if (!open) return;
    loadAll();
  }, [open]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [b, s, c] = await Promise.all([fetchBookings(), fetchAllServices(), fetchAllConsultants()]);
      setBookings(b);
      setServices(s);
      setConsultants(c);
    } catch {
      notify('Failed to load dashboard data', 'error');
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status);
      notify(`Booking ${status}`, 'success');
      loadAll();
    } catch {
      notify('Update failed', 'error');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBooking(id);
      notify('Booking deleted', 'success');
      loadAll();
    } catch {
      notify('Delete failed', 'error');
    }
  };

  if (!open) return null;

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    revenue: bookings.filter((b) => b.status === 'confirmed').reduce((sum, b) => sum + Number(b.price), 0),
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-cyan-500/20 bg-[#0A1411]/95 backdrop-blur-2xl shadow-2xl animate-modal-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0A1411]/90 backdrop-blur-xl px-6 py-4 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Provider Dashboard</h2>
              <p className="text-xs text-white/40">Manage bookings, services & consultants</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              className="rounded-lg border border-white/10 p-2 text-white/60 hover:text-white hover:border-cyan-500/30 transition-all"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 p-2 text-white/60 hover:text-white hover:border-cyan-500/30 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 pt-6">
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<Calendar className="h-4 w-4" />} label="Total Bookings" value={stats.total.toString()} accent="emerald" />
            <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Confirmed" value={stats.confirmed.toString()} accent="cyan" />
            <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Revenue" value={`$${stats.revenue.toLocaleString()}`} accent="teal" />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-5">
          <div className="flex gap-2">
            <TabButton active={tab === 'bookings'} onClick={() => setTab('bookings')} icon={<Calendar className="h-3.5 w-3.5" />} label="Bookings" />
            <TabButton active={tab === 'services'} onClick={() => setTab('services')} icon={<Briefcase className="h-3.5 w-3.5" />} label="Services" />
            <TabButton active={tab === 'consultants'} onClick={() => setTab('consultants')} icon={<Users className="h-3.5 w-3.5" />} label="Consultants" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-white/30 animate-spin" />
            </div>
          ) : tab === 'bookings' ? (
            <BookingsTab
              bookings={filtered}
              filter={filter}
              setFilter={setFilter}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteBooking}
            />
          ) : tab === 'services' ? (
            <ServicesTab services={services} onChanged={loadAll} notify={notify} />
          ) : (
            <ConsultantsTab consultants={consultants} onChanged={loadAll} notify={notify} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────

function BookingsTab({
  bookings,
  filter,
  setFilter,
  onStatusChange,
  onDelete,
}: {
  bookings: Booking[];
  filter: 'all' | 'confirmed' | 'pending' | 'cancelled';
  setFilter: (f: 'all' | 'confirmed' | 'pending' | 'cancelled') => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <div className="flex gap-2 mb-4">
        {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
              filter === f
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-white/50 border border-white/10 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-sm text-white/40">No bookings yet. Create one to see it here!</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-400">#{booking.reference_id}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="text-sm font-semibold text-white truncate">{booking.service_name}</div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {booking.time_slot} · {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span>{booking.consultant}</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {booking.client_email}
                    </span>
                    {booking.client_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.client_phone}
                      </span>
                    )}
                    {booking.file_url && (
                      <span className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        <a href={booking.file_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                          View attachment
                        </a>
                      </span>
                    )}
                  </div>
                  {booking.project_requirements && (
                    <p className="text-xs text-white/30 mt-2 line-clamp-2">{booking.project_requirements}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-emerald-400">${Number(booking.price).toFixed(0)}</span>
                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => onStatusChange(booking.id, 'cancelled')}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => onStatusChange(booking.id, 'confirmed')}
                      className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all"
                    >
                      Confirm
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(booking.id)}
                    className="rounded-lg border border-white/10 p-1.5 text-white/30 hover:text-red-400 hover:border-red-500/20 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ─── Services Tab ─────────────────────────────────────────────────────────

function ServicesTab({
  services,
  onChanged,
  notify,
}: {
  services: Service[];
  onChanged: () => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}) {
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = async (data: Partial<Service>) => {
    try {
      if (editing) {
        await updateService(editing.id, data);
        notify('Service updated', 'success');
      } else {
        await createService({
          name: data.name!,
          description: data.description!,
          duration: data.duration!,
          price: data.price!,
          category: data.category!,
          features: data.features || [],
          active: data.active ?? true,
        });
        notify('Service created', 'success');
      }
      setShowForm(false);
      setEditing(null);
      onChanged();
    } catch {
      notify('Save failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      notify('Service deleted', 'success');
      onChanged();
    } catch {
      notify('Delete failed', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Manage Services</h3>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-3 py-1.5 text-xs font-semibold text-[#060D0B]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Service
        </button>
      </div>

      {showForm && (
        <ServiceForm
          service={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
                    {service.category}
                  </span>
                  {!service.active && (
                    <span className="text-xs text-white/30">Inactive</span>
                  )}
                </div>
                <div className="text-sm font-bold text-white">{service.name}</div>
                <p className="text-xs text-white/40 mt-1 line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-white/50">
                    <Clock className="h-3 w-3" /> {service.duration} min
                  </span>
                  <span className="text-xs font-bold text-emerald-400">${service.price}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => { setEditing(service); setShowForm(true); }}
                  className="rounded-lg border border-white/10 p-1.5 text-white/50 hover:text-white hover:border-emerald-500/30 transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="rounded-lg border border-white/10 p-1.5 text-white/30 hover:text-red-400 hover:border-red-500/20 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-sm text-white/40 text-center py-8">No services yet. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}

function ServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: Service | null;
  onSave: (data: Partial<Service>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(service?.name || '');
  const [description, setDescription] = useState(service?.description || '');
  const [duration, setDuration] = useState(service?.duration?.toString() || '45');
  const [price, setPrice] = useState(service?.price?.toString() || '250');
  const [category, setCategory] = useState(service?.category || 'Strategy');
  const [features, setFeatures] = useState((service?.features || []).join(', '));

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-4">
      <h4 className="text-sm font-bold text-white mb-3">{service ? 'Edit Service' : 'New Service'}</h4>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Service name"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none mb-3 resize-none"
      />
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-xs text-white/40 mb-1 block">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Price ($)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => onSave({
              name,
              description,
              duration: parseInt(duration) || 45,
              price: parseFloat(price) || 0,
              category,
              features: features.split(',').map((f) => f.trim()).filter(Boolean),
              active: service?.active ?? true,
            })}
            className="flex-1 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-3 py-2 text-sm font-semibold text-[#060D0B]"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
      <input
        type="text"
        value={features}
        onChange={(e) => setFeatures(e.target.value)}
        placeholder="Features (comma-separated)"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none"
      />
    </div>
  );
}

// ─── Consultants Tab ──────────────────────────────────────────────────────

function ConsultantsTab({
  consultants,
  onChanged,
  notify,
}: {
  consultants: Consultant[];
  onChanged: () => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}) {
  const [editing, setEditing] = useState<Consultant | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = async (data: Partial<Consultant>) => {
    try {
      if (editing) {
        await updateConsultant(editing.id, data);
        notify('Consultant updated', 'success');
      } else {
        await createConsultant({
          name: data.name!,
          title: data.title!,
          avatar_gradient: data.avatar_gradient || 'from-emerald-400 to-teal-600',
          initials: data.initials || 'XX',
          specialties: data.specialties || [],
          available: data.available ?? true,
          rating: data.rating ?? 5.0,
        });
        notify('Consultant added', 'success');
      }
      setShowForm(false);
      setEditing(null);
      onChanged();
    } catch {
      notify('Save failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConsultant(id);
      notify('Consultant removed', 'success');
      onChanged();
    } catch {
      notify('Delete failed', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Manage Consultants</h3>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-3 py-1.5 text-xs font-semibold text-[#060D0B]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Consultant
        </button>
      </div>

      {showForm && (
        <ConsultantForm
          consultant={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div className="space-y-3">
        {consultants.map((consultant) => (
          <div key={consultant.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${consultant.avatar_gradient} text-sm font-bold text-white shrink-0`}>
                {consultant.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{consultant.name}</div>
                <div className="text-xs text-white/40">{consultant.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-amber-400 text-xs">★ {consultant.rating}</span>
                  <span className={`text-xs ${consultant.available ? 'text-emerald-400' : 'text-white/30'}`}>
                    {consultant.available ? 'Available' : 'Unavailable'}
                  </span>
                  <div className="flex gap-1">
                    {consultant.specialties.map((spec) => (
                      <span key={spec} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => { setEditing(consultant); setShowForm(true); }}
                  className="rounded-lg border border-white/10 p-1.5 text-white/50 hover:text-white hover:border-emerald-500/30 transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(consultant.id)}
                  className="rounded-lg border border-white/10 p-1.5 text-white/30 hover:text-red-400 hover:border-red-500/20 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {consultants.length === 0 && (
          <p className="text-sm text-white/40 text-center py-8">No consultants yet. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}

function ConsultantForm({
  consultant,
  onSave,
  onCancel,
}: {
  consultant: Consultant | null;
  onSave: (data: Partial<Consultant>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(consultant?.name || '');
  const [title, setTitle] = useState(consultant?.title || '');
  const [initials, setInitials] = useState(consultant?.initials || '');
  const [specialties, setSpecialties] = useState((consultant?.specialties || []).join(', '));
  const [available, setAvailable] = useState(consultant?.available ?? true);
  const [rating, setRating] = useState(consultant?.rating?.toString() || '5.0');
  const [gradient, setGradient] = useState(consultant?.avatar_gradient || 'from-emerald-400 to-teal-600');

  const gradients = [
    'from-emerald-400 to-teal-600',
    'from-cyan-400 to-blue-600',
    'from-teal-400 to-emerald-700',
    'from-green-400 to-cyan-600',
    'from-emerald-500 to-green-700',
    'from-cyan-500 to-teal-700',
  ];

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-4">
      <h4 className="text-sm font-bold text-white mb-3">{consultant ? 'Edit Consultant' : 'New Consultant'}</h4>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Job title"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none"
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <input
          type="text"
          value={initials}
          onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 2))}
          placeholder="Initials (e.g. MC)"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none"
        />
        <input
          type="text"
          value={specialties}
          onChange={(e) => setSpecialties(e.target.value)}
          placeholder="Specialties (comma-separated)"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none sm:col-span-2"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-white/40 mb-1 block">Rating</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 mb-1 block">Avatar Color</label>
          <select
            value={gradient}
            onChange={(e) => setGradient(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0A1411] px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
          >
            {gradients.map((g) => (
              <option key={g} value={g}>{g.replace(/from-|to-/g, '').replace(/-\d00/g, '')}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="h-4 w-4 rounded accent-emerald-500"
          />
          Available for booking
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onSave({
              name,
              title,
              initials: initials || name.slice(0, 2).toUpperCase(),
              specialties: specialties.split(',').map((s) => s.trim()).filter(Boolean),
              available,
              rating: parseFloat(rating) || 5.0,
              avatar_gradient: gradient,
            })}
            className="rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-2 text-sm font-semibold text-[#060D0B]"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: 'emerald' | 'cyan' | 'teal' }) {
  const colors = {
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
    teal: 'border-teal-500/20 bg-teal-500/5 text-teal-400',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[accent]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-white/50">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    confirmed: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 className="h-3 w-3" /> },
    pending: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <AlertCircle className="h-3 w-3" /> },
    cancelled: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <X className="h-3 w-3" /> },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${c.color}`}>
      {c.icon}
      {status}
    </span>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
          : 'text-white/50 border border-white/10 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
