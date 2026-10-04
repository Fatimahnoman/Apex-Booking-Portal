import { useEffect, useState } from 'react';
import { Calendar, Clock, Mail, Phone, RefreshCw, X, CheckCircle2, AlertCircle, LayoutDashboard, TrendingUp } from 'lucide-react';
import { supabase, type Booking } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

interface ProviderViewProps {
  open: boolean;
  onClose: () => void;
}

export function ProviderView({ open, onClose }: ProviderViewProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const { notify } = useToast();

  useEffect(() => {
    if (!open) return;
    fetchBookings();
  }, [open]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      notify('Failed to load bookings', 'error');
    } else {
      setBookings((data as Booking[]) || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      notify('Update failed', 'error');
    } else {
      notify(`Booking ${status}`, 'success');
      fetchBookings();
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
              <p className="text-xs text-white/40">Manage incoming bookings in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
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

        {/* Filter tabs */}
        <div className="px-6 pt-5">
          <div className="flex gap-2">
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
        </div>

        {/* Bookings list */}
        <div className="px-6 py-5 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 text-white/30 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-10 w-10 text-white/20 mb-3" />
              <p className="text-sm text-white/40">No bookings yet. Create one to see it here!</p>
            </div>
          ) : (
            filtered.map((booking) => (
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
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-emerald-400">${Number(booking.price).toFixed(0)}</span>
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all"
                      >
                        Confirm
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

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
