'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Upload, Trash2, ExternalLink, Calendar, CheckCircle, Loader2, MapPin, Archive } from 'lucide-react';
import {
  archiveDocument,
  createDocument,
  deleteDocument,
  Document,
  DocumentKind,
  DocumentStatus,
  getDocuments,
  getRegions,
  publishDocument,
  Region,
  uploadPDF,
} from '@/lib/supabase-queries';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const getInitialFormData = () => ({
  title: '',
  year: new Date().getFullYear(),
  type: 'national' as 'national' | 'regional',
  region_id: '',
  document_kind: 'original' as DocumentKind,
  status: 'published' as DocumentStatus,
  published_date: '',
  supersedes_document_id: '',
  summary: '',
});

const documentKindLabels: Record<DocumentKind, string> = {
  original: 'Dokumen utama',
  revision: 'Revisi',
  addendum: 'Tambahan',
  cancellation: 'Pembatalan',
};

const statusLabels: Record<DocumentStatus, string> = {
  draft: 'Draft',
  published: 'Dipublikasikan',
  archived: 'Diarsipkan',
  superseded: 'Digantikan',
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState(getInitialFormData());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getErrorMessage = (error: unknown): string => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }

    return 'Unknown error';
  };

  const loadData = useCallback(async () => {
    try {
      const [docsData, regionsData] = await Promise.all([
        getDocuments(),
        getRegions()
      ]);
      setDocuments(docsData);
      setRegions(regionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      showToast('Silakan pilih file PDF', 'error');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Silakan pilih file PDF', 'error');
      return;
    }

    if (formData.type === 'regional' && !formData.region_id) {
      showToast('Silakan pilih wilayah untuk dokumen regional', 'error');
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage with unique timestamp
      const timestamp = Date.now();
      const filePath = await uploadPDF(selectedFile, `surat-edaran-${formData.type}-${formData.year}-${timestamp}.pdf`);

      // Create document record
      await createDocument({
        title: formData.title,
        year: formData.year,
        file_path: filePath,
        type: formData.type,
        region_id: formData.type === 'regional' ? formData.region_id : undefined,
        document_kind: formData.document_kind,
        status: formData.status,
        published_date: formData.published_date || undefined,
        supersedes_document_id: formData.supersedes_document_id || undefined,
        summary: formData.summary || undefined,
        is_active: formData.status === 'published',
      });

      // Reset form
      setFormData(getInitialFormData());
      setSelectedFile(null);
      setShowUploadForm(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      showToast('Dokumen berhasil diunggah', 'success');
      await loadData();
    } catch (error) {
      console.error('Error uploading document:', error);
      const message = getErrorMessage(error);

      if (message.toLowerCase().includes('bucket')) {
        showToast('Upload gagal: bucket storage belum siap. Jalankan ulang supabase-schema.sql', 'error');
      } else {
        showToast(`Gagal mengunggah dokumen: ${message}`, 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishDocument(id);
      showToast('Dokumen berhasil dipublikasikan', 'success');
      await loadData();
    } catch (error) {
      console.error('Error publishing document:', error);
      showToast('Gagal mempublikasikan dokumen', 'error');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveDocument(id);
      showToast('Dokumen berhasil diarsipkan', 'success');
      await loadData();
    } catch (error) {
      console.error('Error archiving document:', error);
      showToast('Gagal mengarsipkan dokumen', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDocument(deleteId);
      showToast('Dokumen berhasil dihapus', 'success');
      await loadData();
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast('Gagal menghapus dokumen', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const docToDelete = deleteId ? documents.find(d => d.id === deleteId) : null;
  const supersedesOptions = documents.filter(doc =>
    doc.year === formData.year &&
    doc.type === formData.type &&
    (formData.type === 'national' || doc.region_id === formData.region_id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#003049] dark:text-[#669bbc] mx-auto mb-4" size={32} />
          <p className="text-[#003049]/60 dark:text-gray-400">Memuat dokumen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#003049] dark:text-[#669bbc]">
            Kelola Dokumen
          </h1>
          <p className="text-[#003049]/60 dark:text-gray-400 mt-1">
            Upload Surat Edaran sebagai referensi resmi
          </p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#003049] dark:bg-[#669bbc] text-white rounded-lg hover:bg-[#003049]/90 dark:hover:bg-[#669bbc]/90 transition"
        >
          <Upload size={18} />
          Upload Dokumen
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <form
          onSubmit={handleUpload}
          className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[#003049] dark:text-gray-100 mb-4">
            Upload Surat Edaran Baru
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Judul Dokumen <span className="text-[#c1121f]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: SKB 3 Menteri Tahun 2026"
              className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
                Tahun <span className="text-[#c1121f]">*</span>
              </label>
              <input
                type="number"
                required
                min="2020"
                max="2100"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
                Jenis Dokumen <span className="text-[#c1121f]">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'national' | 'regional', region_id: '', supersedes_document_id: '' })}
                className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
              >
                <option value="national">Nasional (SKB)</option>
                <option value="regional">Regional (Pergub/SE Daerah)</option>
              </select>
            </div>

            {/* Document Kind */}
            <div>
              <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
                Sifat Dokumen <span className="text-[#c1121f]">*</span>
              </label>
              <select
                value={formData.document_kind}
                onChange={(e) => setFormData({ ...formData, document_kind: e.target.value as DocumentKind })}
                className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
              >
                <option value="original">Dokumen utama</option>
                <option value="revision">Revisi</option>
                <option value="addendum">Tambahan</option>
                <option value="cancellation">Pembatalan</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
                Status <span className="text-[#c1121f]">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DocumentStatus })}
                className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
              >
                <option value="draft">Draft</option>
                <option value="published">Dipublikasikan</option>
                <option value="archived">Diarsipkan</option>
                <option value="superseded">Digantikan</option>
              </select>
            </div>

            {/* Region (only for regional) */}
            {formData.type === 'regional' && (
              <div>
                <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
                  Wilayah <span className="text-[#c1121f]">*</span>
                </label>
                <select
                  value={formData.region_id}
                  onChange={(e) => setFormData({ ...formData, region_id: e.target.value, supersedes_document_id: '' })}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Published Date */}
            <div>
              <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
                Tanggal Terbit
              </label>
              <input
                type="date"
                value={formData.published_date}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
              />
            </div>

            {/* Supersedes */}
            <div>
              <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
                Merevisi / Menambah Dokumen
              </label>
              <select
                value={formData.supersedes_document_id}
                onChange={(e) => setFormData({ ...formData, supersedes_document_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc]"
              >
                <option value="">Tidak ada</option>
                {supersedesOptions.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              Ringkasan Dampak
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={3}
              placeholder="Contoh: Menambahkan cuti bersama pada 18 Mei 2026"
              className="w-full px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#003049] dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#669bbc] resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-[#003049] dark:text-gray-300 mb-2">
              File PDF <span className="text-[#c1121f]">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg border border-dashed border-[#003049]/30 dark:border-slate-600 text-[#003049] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition flex items-center gap-2"
              >
                <FileText size={18} />
                Pilih File PDF
              </button>
              {selectedFile && (
                <span className="text-sm text-[#003049] dark:text-gray-300">
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#003049]/10 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setShowUploadForm(false);
                setSelectedFile(null);
                setFormData(getInitialFormData());
              }}
              className="px-4 py-2 rounded-lg border border-[#003049]/30 dark:border-slate-600 text-[#003049] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="flex items-center gap-2 px-4 py-2 bg-[#003049] dark:bg-[#669bbc] text-white rounded-lg hover:bg-[#003049]/90 dark:hover:bg-[#669bbc]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-[#003049]/40 dark:text-gray-600 mb-4" />
          <p className="text-[#003049]/60 dark:text-gray-400">
            Belum ada dokumen. Upload Surat Edaran pertama.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#003049] dark:text-gray-100">
                  Dokumen
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#003049] dark:text-gray-100">
                  Jenis
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#003049] dark:text-gray-100">
                  Tahun
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#003049] dark:text-gray-100">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[#003049] dark:text-gray-100">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#003049]/10 dark:divide-slate-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="text-[#c1121f]" size={20} />
                      <div>
                        <p className="font-medium text-[#003049] dark:text-gray-100">
                          {doc.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#003049]/60 dark:text-gray-400">
                          <span>{documentKindLabels[doc.document_kind]}</span>
                          {doc.published_date && <span>Terbit {doc.published_date}</span>}
                          {doc.supersedes_document && <span>Merevisi: {doc.supersedes_document.title}</span>}
                        </div>
                        {doc.summary && (
                          <p className="text-xs text-[#003049]/60 dark:text-gray-400 mt-1 max-w-md">
                            {doc.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {doc.type === 'national' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        Nasional
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                        <MapPin size={10} />
                        {doc.region?.name || 'Regional'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-[#003049] dark:text-gray-300">
                      <Calendar size={14} />
                      {doc.year}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {doc.status === 'published' && doc.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        <CheckCircle size={12} />
                        Dipublikasikan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {statusLabels[doc.status]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {doc.status !== 'published' || !doc.is_active ? (
                        <button
                          onClick={() => handlePublish(doc.id)}
                          className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition"
                          title="Publikasikan"
                        >
                          <CheckCircle size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchive(doc.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition"
                          title="Arsipkan"
                        >
                          <Archive size={18} />
                        </button>
                      )}
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-[#669bbc]/20 dark:hover:bg-slate-700 text-[#003049] dark:text-gray-300 transition"
                          title="Buka PDF"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                      <button
                        onClick={() => setDeleteId(doc.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-[#c1121f] transition"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="bg-[#669bbc]/10 dark:bg-slate-800 rounded-lg p-4 text-sm text-[#003049] dark:text-gray-300">
        <p className="font-medium mb-2">Tentang Dokumen Resmi</p>
        <ul className="list-disc list-inside space-y-1 text-[#003049]/70 dark:text-gray-400">
          <li><strong>Nasional:</strong> SKB 3 Menteri untuk hari libur nasional</li>
          <li><strong>Regional:</strong> Surat Edaran/Pergub untuk libur daerah (misal Papua Barat Daya)</li>
          <li>Dokumen berstatus dipublikasikan akan tampil sebagai rantai sumber di halaman publik</li>
          <li>Gunakan sifat dokumen Revisi/Tambahan agar perubahan resmi tidak menimpa riwayat lama</li>
        </ul>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Hapus Dokumen"
        message={`Apakah Anda yakin ingin menghapus "${docToDelete?.title || ''}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
