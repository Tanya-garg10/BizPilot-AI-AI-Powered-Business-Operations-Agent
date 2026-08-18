import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Trash2, HelpCircle, BookOpen, RefreshCw } from 'lucide-react';
import { BusinessSettings, CourseService, FAQItem } from '../types';

interface SettingsTabProps {
  settings: BusinessSettings;
  onSaveSettings: (newSettings: BusinessSettings) => void;
  isLoading: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSaveSettings,
  isLoading
}) => {
  const [formData, setFormData] = useState<BusinessSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleServiceChange = (index: number, field: keyof CourseService, value: any) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setFormData({ ...formData, services: updatedServices });
  };

  const handleFAQChange = (index: number, field: keyof FAQItem, value: string) => {
    const updatedFAQs = [...formData.faqs];
    updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
    setFormData({ ...formData, faqs: updatedFAQs });
  };

  const addFAQ = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: "New FAQ Question?", answer: "FAQ answer details..." }]
    });
  };

  const removeFAQ = (index: number) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>Business Configuration & Knowledge Base</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize course pricing, duration, and AI FAQ knowledge base stored in Firestore.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* General Information */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-base">General Business Profile</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Business Name</label>
            <input
              type="text"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Email</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">Business Overview / Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Services & Courses */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-base flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Course Services & Pricing</span>
        </h3>

        <div className="space-y-4">
          {formData.services.map((service, idx) => (
            <div key={service.id || idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Course Title</label>
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Price (INR ₹)</label>
                  <input
                    type="number"
                    value={service.price}
                    onChange={(e) => handleServiceChange(idx, 'price', Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Duration & Schedule</label>
                  <input
                    type="text"
                    value={service.duration}
                    onChange={(e) => handleServiceChange(idx, 'duration', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Course Description</label>
                <input
                  type="text"
                  value={service.description}
                  onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs Knowledge Base */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>AI Knowledge Base & FAQs</span>
          </h3>

          <button
            type="button"
            onClick={addFAQ}
            className="flex items-center space-x-1.5 text-xs text-indigo-300 hover:text-white bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add FAQ</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.faqs.map((faq, idx) => (
            <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 relative group">
              <button
                type="button"
                onClick={() => removeFAQ(idx)}
                className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1 transition-colors"
                title="Delete FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div>
                <label className="text-[11px] font-semibold text-indigo-300 block mb-1">Q{idx + 1}: Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleFAQChange(idx, 'question', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">A{idx + 1}: Knowledge Base Answer</label>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleFAQChange(idx, 'answer', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
