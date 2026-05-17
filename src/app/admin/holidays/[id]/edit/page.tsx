'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Document, getDocuments, getHolidayById, updateHoliday, getRegions, Region } from '@/lib/supabase-queries';
import { useToast } from '@/components/ui/toast';

export default function EditHolidayPage() {
  const router = useRouter();
  const params = useParams();
  const holidayId = params.id as string;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    type: 'national' as 'national' | 'regional',
    region_id: '',
    description: '',
    is_cuti_bersama: false,
    document_ids: [] as string[],
  });

  const loadData = useCallback(async () => {
    try {
      const [holiday, regionsData, documentsData] = await Promise.all([
        getHolidayById(holidayId),
        getRegions(),
        getDocuments(),
      ]);

      if (!holiday) {
        showToast('Hari libur tidak ditemukan', 'error');
        router.push('/admin/holidays');
        return;
      }

      setRegions(regionsData);
      setDocuments(documentsData.filter(doc => doc.status === 'published' && doc.is_active));
      setFormData({
        date: holiday.date,
        name: holiday.name,
        type: holiday.type,
        region_id: holiday.region_id || '',
        description: holiday.description || '',
        is_cuti_bersama: holiday.is_cuti_bersama,
        document_ids: holiday.holiday_documents?.map(link => link.document_id) || [],
      });
    } catch (error) {
      console.error('Error loading holiday:', error);
      showToast('Gagal memuat data', 'error');
      router.push('/admin/holidays');
    } finally {
      setLoading(false);
    }
  }, [holidayId, router, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedYear = formData.date ? new Date(formData.date).getFullYear() : new Date().getFullYear();
  const sourceDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesYear = document.year === selectedYear;
      const matchesType = document.type === formData.type;
      const matchesRegion = formData.type === 'national' || document.region_id === formData.region_id;
      return matchesYear && matchesType && matchesRegion;
    });
  }, [documents, formData.region_id, formData.type, selectedYear]);

  const toggleDocument = (documentId: string) => {
    setFormData((current) => ({
      ...current,
      document_ids: current.document_ids.includes(documentId)
        ? current.document_ids.filter(id => id !== documentId)
        : [...current.document_ids, documentId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateHoliday(holidayId, {
        date: formData.date,
        name: formData.name,
        type: formData.type,
        region_id: formData.type === 'regional' && formData.region_id ? formData.region_id : undefined,
        description: formData.description || undefined,
        is_cuti_bersama: formData.is_cuti_bersama,
        document_ids: formData.document_ids,
      });
      showToast('Hari libur berhasil diperbarui', 'success');
      router.push('/admin/holidays');
    } catch (error) {
      console.error('Error updating holiday:', error);
      showToast('Gagal menyimpan data', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#003049] dark:text-[#669bbc] mx-auto mb-4" size={32} />
          <p className="text-[#003049]/60 dark:text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/holidays"
          className="p-2 rounded-lg hover:bg-[#669bbc]/20 dark:hover:bg-slate-800 text-[#003049] dark:text-gray-300 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#003049] dark:text-[#669bbc]">
            Edit Hari Libur
          </h1>
          <p className="text-[#003049]/60 dark:text-gray-400 mt-1">
            Perbarui data hari libur
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-6 space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
            Tanggal <span className="text-[#c1121f]">*</span>
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
            Nama Hari Libur <span className="text-[#c1121f]">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Tahun Baru 2026"
            className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
            Tipe <span className="text-[#c1121f]">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="national"
                checked={formData.type === 'national'}
                onChange={() => setFormData({ ...formData, type: 'national', region_id: '', document_ids: [] })}
                className="w-4 h-4 text-[#003049] focus:ring-[#669bbc]"
              />
              <span className="text-[#003049] dark:text-gray-100">Nasional</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="regional"
                checked={formData.type === 'regional'}
                onChange={() => setFormData({ ...formData, type: 'regional', document_ids: [] })}
                className="w-4 h-4 text-[#003049] focus:ring-[#669bbc]"
              />
              <span className="text-[#003049] dark:text-gray-100">Regional</span>
            </label>
          </div>
        </div>

        {/* Region (conditional) */}
        {formData.type === 'regional' && (
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Wilayah <span className="text-[#c1121f]">*</span>
            </label>
            <select
              required
              value={formData.region_id}
              onChange={(e) => setFormData({ ...formData, region_id: e.target.value, document_ids: [] })}
              className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
            >
              <option value="">Pilih Wilayah</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
            Deskripsi (Opsional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Keterangan tambahan..."
            className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc] resize-none"
          />
        </div>

        {/* Cuti Bersama */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_cuti_bersama}
              onChange={(e) => setFormData({ ...formData, is_cuti_bersama: e.target.checked })}
              className="w-5 h-5 rounded border-[#003049]/30 text-[#003049] focus:ring-[#669bbc]"
            />
            <span className="text-[#003049] dark:text-gray-100">
              Cuti Bersama
            </span>
          </label>
          <p className="text-xs text-[#003049]/60 dark:text-gray-400 mt-1 ml-8">
            Tandai jika ini adalah cuti bersama yang ditetapkan pemerintah
          </p>
        </div>

        {/* Source Documents */}
        <div>
          <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
            Dokumen Sumber
          </label>
          {sourceDocuments.length > 0 ? (
            <div className="space-y-2 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-3">
              {sourceDocuments.map((document) => (
                <label key={document.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.document_ids.includes(document.id)}
                    onChange={() => toggleDocument(document.id)}
                    className="mt-1 w-4 h-4 rounded border-[#003049]/30 text-[#003049] focus:ring-[#669bbc]"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[#003049] dark:text-gray-100">
                      {document.title}
                    </span>
                    <span className="block text-xs text-[#003049]/60 dark:text-gray-400">
                      {document.document_kind} {document.published_date ? `• ${document.published_date}` : ''}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#003049]/60 dark:text-gray-400 rounded-lg border border-dashed border-[#003049]/20 dark:border-slate-700 p-3">
              Belum ada dokumen publik yang cocok untuk tahun, tipe, dan wilayah ini.
            </p>
          )}
          <p className="text-xs text-[#003049]/60 dark:text-gray-400 mt-1">
            Pilih dokumen yang menjadi dasar tanggal libur ini, termasuk revisi atau tambahan.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#003049]/10 dark:border-slate-700">
          <Link
            href="/admin/holidays"
            className="px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 text-[#003049] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#003049] dark:bg-[#669bbc] text-white rounded-lg hover:bg-[#003049]/90 dark:hover:bg-[#669bbc]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
