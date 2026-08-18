import React, { useState, useEffect } from 'react';
import { CreditCard, ExternalLink, CheckCircle2, Clock, AlertCircle, Sparkles, Plus, RefreshCw } from 'lucide-react';
import { Payment } from '../types';

interface PaymentsTabProps {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ showToast }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isStripeConfigured, setIsStripeConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Link Generator State
  const [serviceName, setServiceName] = useState('Python Development Course');
  const [amount, setAmount] = useState<number>(999);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
        setIsStripeConfigured(data.stripe_configured || false);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedUrl(null);

    try {
      const res = await fetch('/api/payment/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_name: serviceName,
          amount,
          customer_id: 'cust_manual',
          lead_id: 'lead_manual',
        })
      });

      const data = await res.json();
      if (res.ok && data.payment_url) {
        setGeneratedUrl(data.payment_url);
        showToast('Stripe Payment Link created successfully!', 'success');
      } else {
        showToast(data.error || 'Payment integration not configured', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create payment link', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <span>Payments & Stripe Gateway</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real Stripe payment events and payment link generator.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Stripe Configuration Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
        isStripeConfigured
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
          : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
      }`}>
        <div className="flex items-center space-x-3">
          {isStripeConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          )}
          <div>
            <h4 className="font-bold text-xs">
              {isStripeConfigured ? 'Stripe Gateway Active' : 'Payment Integration Notice'}
            </h4>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isStripeConfigured
                ? 'Stripe secret key configured. Webhooks will automatically record paid enrollments in Firestore.'
                : 'Payment integration not configured. Provide STRIPE_SECRET_KEY in environment variables to generate live links.'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Link Generator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-base">Generate Direct Stripe Payment Link</h3>

        <form onSubmit={handleCreatePaymentLink} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Course / Service</label>
            <select
              value={serviceName}
              onChange={(e) => {
                setServiceName(e.target.value);
                if (e.target.value.includes('Python')) setAmount(999);
                else if (e.target.value.includes('Web')) setAmount(1499);
                else setAmount(1999);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Python Development Course">Python Development Course (₹999)</option>
              <option value="Web Development Course">Web Development Course (₹1,499)</option>
              <option value="Data Analytics Course">Data Analytics Course (₹1,999)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Amount (INR ₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isGenerating ? 'Generating Link...' : 'Create Stripe Link'}</span>
          </button>
        </form>

        {generatedUrl && (
          <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl flex items-center justify-between">
            <div className="truncate pr-4 text-xs font-mono text-indigo-300">{generatedUrl}</div>
            <a
              href={generatedUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1.5 whitespace-nowrap transition-colors"
            >
              <span>Open Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Payment Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 font-bold text-white text-sm">
          Firestore Recorded Payments
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Customer ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Stripe Ref</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No payment records recorded yet. Payments require real Stripe checkout completion.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                    <td className="px-6 py-4 font-semibold text-white">{p.id}</td>
                    <td className="px-6 py-4 text-slate-300">{p.customer_id}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">
                      ₹{p.amount.toLocaleString('en-IN')} {p.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                        p.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{p.stripe_payment_id || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-500 font-sans">
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
