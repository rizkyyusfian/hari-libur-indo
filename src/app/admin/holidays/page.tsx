'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Loader2, Check, Upload, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getHolidays, deleteHoliday, Holiday, createHoliday, getRegions, Region } from '@/lib/supabase-queries';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface BatchHolidayInput {
  date: string;
  name: string;
  type: 'national' | 'regional';
  region_id?: string;
  description?: string;
  is_cuti_bersama?: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchJson, setBatchJson] = useState('');
  const [batchErrors, setBatchErrors] = useState<string[]>([]);
  const [batchParsed, setBatchParsed] = useState<BatchHolidayInput[]>([]);
  const [batchInserting, setBatchInserting] = useState(false);
  const { showToast } = useToast();

  const loadHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHolidays(yearFilter);
      setHolidays(data);
    } catch (error) {
      console.error('Error loading holidays:', error);
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, yearFilter]);

  const loadRegions = useCallback(async () => {
    try {
      const data = await getRegions();
      setRegions(data);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  }, []);

  useEffect(() => {
    loadHolidays();
    loadRegions();
  }, [loadHolidays, loadRegions]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteHoliday(deleteId);
      setHolidays(holidays.filter(h => h.id !== deleteId));
      showToast('Hari libur berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error deleting holiday:', error);
      showToast('Gagal menghapus data', 'error');
    } finally {
      setDeleteId(null);
      setDeleting(false);
    }
  };

  const validateBatchJson = (json: string): { valid: boolean; data?: BatchHolidayInput[]; errors: string[] } => {
    const errors: string[] = [];
    
    if (!json.trim()) {
      return { valid: false, errors: ['JSON tidak boleh kosong'] };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      return { valid: false, errors: ['Format JSON tidak valid'] };
    }

    if (!Array.isArray(parsed)) {
      return { valid: false, errors: ['JSON harus berupa array'] };
    }

    const validData: BatchHolidayInput[] = [];
    
    parsed.forEach((item, index) => {
      const itemErrors: string[] = [];
      const itemRecord = isRecord(item) ? item : {};
      const date = itemRecord.date;
      const name = itemRecord.name;
      const type = itemRecord.type;
      const regionId = itemRecord.region_id;
      const description = itemRecord.description;
      const isCutiBersama = itemRecord.is_cuti_bersama;
      
      // Validate date
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        itemErrors.push('Format tanggal harus YYYY-MM-DD');
      }
      
      // Validate name
      if (typeof name !== 'string' || name.trim() === '') {
        itemErrors.push('Nama tidak boleh kosong');
      }
      
      // Validate type
      if (type !== 'national' && type !== 'regional') {
        itemErrors.push('Tipe harus "national" atau "regional"');
      }
      
      // Validate region_id for regional type
      if (type === 'regional' && typeof regionId !== 'string') {
        itemErrors.push('region_id diperlukan untuk tipe regional');
      }
      
      if (itemErrors.length > 0) {
        errors.push(`Baris ${index + 1}: ${itemErrors.join(', ')}`);
      } else {
        validData.push({
          date: date as string,
          name: (name as string).trim(),
          type: type as 'national' | 'regional',
          region_id: typeof regionId === 'string' ? regionId : undefined,
          description: typeof description === 'string' ? description : undefined,
          is_cuti_bersama: typeof isCutiBersama === 'boolean' ? isCutiBersama : false,
        });
      }
    });

    return {
      valid: errors.length === 0,
      data: validData,
      errors,
    };
  };

  const handleBatchValidate = () => {
    const result = validateBatchJson(batchJson);
    setBatchErrors(result.errors);
    if (result.valid && result.data) {
      setBatchParsed(result.data);
    } else {
      setBatchParsed([]);
    }
  };

  const handleBatchInsert = async () => {
    if (batchParsed.length === 0) return;
    
    setBatchInserting(true);
    let successCount = 0;
    let failCount = 0;
    
    for (const item of batchParsed) {
      try {
        await createHoliday({
          date: item.date,
          name: item.name,
          type: item.type,
          region_id: item.region_id,
          description: item.description,
          is_cuti_bersama: item.is_cuti_bersama ?? false,
        });
        successCount++;
      } catch (error) {
        console.error('Error inserting holiday:', error);
        failCount++;
      }
    }
    
    setBatchInserting(false);
    
    if (successCount > 0) {
      showToast(`${successCount} hari libur berhasil ditambahkan${failCount > 0 ? `, ${failCount} gagal` : ''}`, 'success');
      setShowBatchForm(false);
      setBatchJson('');
      setBatchParsed([]);
      setBatchErrors([]);
      loadHolidays();
    } else {
      showToast('Gagal menambahkan data', 'error');
    }
  };

  const filteredHolidays = holidays.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || h.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const holidayToDelete = deleteId ? holidays.find(h => h.id === deleteId) : null;

  // Sample JSON template
  const sampleJson = JSON.stringify([
    {
      date: "2026-01-01",
      name: "Tahun Baru 2026",
      type: "national",
      is_cuti_bersama: false
    },
    {
      date: "2026-05-01",
      name: "Hari Buruh Internasional",
      type: "national",
      is_cuti_bersama: false
    }
  ], null, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003049] dark:text-[#669bbc]">
            Kelola Hari Libur
          </h1>
          <p className="text-[#003049]/60 dark:text-gray-400 mt-1">
            {filteredHolidays.length} hari libur ditemukan
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBatchForm(!showBatchForm)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#003049]/30 dark:border-slate-600 text-[#003049] dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <Upload size={18} />
            <span>Batch Insert</span>
          </button>
          <Link
            href="/admin/holidays/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#003049] dark:bg-[#669bbc] text-white rounded-lg hover:bg-[#003049]/90 dark:hover:bg-[#669bbc]/90 transition"
          >
            <Plus size={20} />
            <span>Tambah Libur</span>
          </Link>
        </div>
      </div>

      {/* Batch Insert Form */}
      {showBatchForm && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#003049] dark:text-gray-100">
              Batch Insert Hari Libur
            </h2>
            <button
              onClick={() => {
                setShowBatchForm(false);
                setBatchJson('');
                setBatchParsed([]);
                setBatchErrors([]);
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X size={20} className="text-[#003049]/60 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
                Format JSON
              </label>
              <textarea
                value={batchJson}
                onChange={(e) => setBatchJson(e.target.value)}
                rows={10}
                placeholder={sampleJson}
                className="w-full px-4 py-3 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#669bbc] resize-y"
              />
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 text-sm">
              <p className="font-medium text-[#003049] dark:text-gray-300 mb-2">Format yang diterima:</p>
              <ul className="text-[#003049]/70 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li><code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">date</code> (wajib): YYYY-MM-DD</li>
                <li><code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">name</code> (wajib): Nama hari libur</li>
                <li><code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">type</code> (wajib): &quot;national&quot; atau &quot;regional&quot;</li>
                <li><code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">region_id</code> (untuk regional): UUID wilayah</li>
                <li><code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">description</code> (opsional): Keterangan</li>
                <li><code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">is_cuti_bersama</code> (opsional): true/false</li>
              </ul>
              {regions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#003049]/10 dark:border-slate-700">
                  <p className="font-medium text-[#003049] dark:text-gray-300 mb-1">Region IDs:</p>
                  {regions.map(r => (
                    <p key={r.id} className="text-xs text-[#003049]/60 dark:text-gray-500">
                      {r.name}: <code className="bg-gray-200 dark:bg-slate-700 px-1 rounded">{r.id}</code>
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Validation Errors */}
            {batchErrors.length > 0 && (
              <div className="bg-[#c1121f]/10 border border-[#c1121f]/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-[#c1121f] flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-[#c1121f] mb-1">Validasi gagal:</p>
                    <ul className="text-sm text-[#c1121f]/80 space-y-1">
                      {batchErrors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {batchParsed.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="font-medium text-green-700 dark:text-green-400 mb-2">
                  {batchParsed.length} data siap dimasukkan:
                </p>
                <div className="max-h-40 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-green-600 dark:text-green-400">
                        <th className="pr-4">Tanggal</th>
                        <th className="pr-4">Nama</th>
                        <th>Tipe</th>
                      </tr>
                    </thead>
                    <tbody className="text-green-700 dark:text-green-300">
                      {batchParsed.map((item, idx) => (
                        <tr key={idx}>
                          <td className="pr-4">{item.date}</td>
                          <td className="pr-4">{item.name}</td>
                          <td>{item.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleBatchValidate}
                className="px-4 py-2 border border-[#003049]/30 dark:border-slate-600 text-[#003049] dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                Validasi
              </button>
              <button
                onClick={handleBatchInsert}
                disabled={batchParsed.length === 0 || batchInserting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#003049] dark:bg-[#669bbc] text-white rounded-lg hover:bg-[#003049]/90 dark:hover:bg-[#669bbc]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {batchInserting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Insert {batchParsed.length > 0 ? `(${batchParsed.length})` : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#003049]/40" size={20} />
            <input
              type="text"
              placeholder="Cari hari libur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
            />
          </div>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>Tahun {year}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
          >
            <option value="all">Semua Tipe</option>
            <option value="national">Nasional</option>
            <option value="regional">Regional</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="animate-spin text-[#003049] dark:text-[#669bbc] mx-auto mb-4" size={32} />
            <p className="text-[#003049]/60 dark:text-gray-400">Memuat data...</p>
          </div>
        ) : filteredHolidays.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#003049]/60 dark:text-gray-400">
              Belum ada data hari libur untuk tahun {yearFilter}
            </p>
            <Link
              href="/admin/holidays/new"
              className="inline-flex items-center gap-2 mt-4 text-[#669bbc] hover:underline"
            >
              <Plus size={16} />
              Tambah hari libur pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#003049] dark:text-gray-300">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#003049] dark:text-gray-300">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#003049] dark:text-gray-300">
                    Tipe
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#003049] dark:text-gray-300">
                    Cuti Bersama
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#003049] dark:text-gray-300">
                    Sumber
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[#003049] dark:text-gray-300">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#003049]/10 dark:divide-slate-700">
                {filteredHolidays.map((holiday) => (
                  <tr key={holiday.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm text-[#003049] dark:text-gray-100">
                      {formatDate(holiday.date)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#003049] dark:text-gray-100">
                      {holiday.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        holiday.type === 'national'
                          ? 'bg-[#003049]/10 text-[#003049] dark:bg-[#669bbc]/20 dark:text-[#669bbc]'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                      }`}>
                        {holiday.type === 'national' ? 'Nasional' : 'Regional'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#003049]/70 dark:text-gray-400">
                      {holiday.is_cuti_bersama ? (
                        <Check size={18} className="text-green-600 dark:text-green-400" />
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#003049]/70 dark:text-gray-400">
                      {holiday.holiday_documents && holiday.holiday_documents.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {holiday.holiday_documents.map((link) => (
                            <span
                              key={link.document_id}
                              className="inline-flex px-2 py-1 text-xs rounded-full bg-[#669bbc]/15 text-[#003049] dark:text-[#669bbc]"
                              title={link.document?.title}
                            >
                              {link.document?.document_kind === 'addendum'
                                ? 'Tambahan'
                                : link.document?.document_kind === 'revision'
                                  ? 'Revisi'
                                  : 'Sumber'}
                            </span>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/holidays/${holiday.id}/edit`}
                          className="p-2 rounded-lg hover:bg-[#669bbc]/20 dark:hover:bg-slate-700 text-[#003049] dark:text-gray-300 transition"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteId(holiday.id)}
                          className="p-2 rounded-lg hover:bg-[#c1121f]/10 text-[#c1121f] transition"
                        >
                          <Trash2 size={16} />
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Hari Libur"
        message={`Apakah Anda yakin ingin menghapus "${holidayToDelete?.name || ''}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText={deleting ? 'Menghapus...' : 'Hapus'}
        cancelText="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
