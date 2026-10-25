'use client';

import { Download, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ExportControlsProps {
  calendarElementId?: string;
}

export function ExportControls({ calendarElementId = 'calendar-export' }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'image' | 'pdf' | null>(null);

  const handleExportImage = async () => {
    setIsExporting(true);
    setExportType('image');
    try {
      const { exportAsImage } = await import('@/lib/export-utils');
      await exportAsImage(calendarElementId);
    } catch (error) {
      console.error('Export image error:', error);
      alert('Gagal memuat fitur ekspor gambar. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    try {
      const { exportAsPDF } = await import('@/lib/export-utils');
      await exportAsPDF(calendarElementId);
    } catch (error) {
      console.error('Export PDF error:', error);
      alert('Gagal memuat fitur ekspor PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-4" aria-labelledby="export-title">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-info text-white dark:text-ink">
          <Download size={16} aria-hidden="true" />
        </span>
        <h2 id="export-title" className="font-extrabold text-foreground">Simpan Kalender</h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="focus-ring surface-transition flex min-h-11 items-center justify-center gap-2 rounded-xl border border-info/25 bg-info-soft px-3 py-2 text-sm font-bold text-info hover:-translate-y-0.5 hover:border-info disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting && exportType === 'image' ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <ImageIcon size={16} aria-hidden="true" />}
          <span>Unduh PNG</span>
        </button>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="focus-ring surface-transition flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-bold text-primary hover:-translate-y-0.5 hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting && exportType === 'pdf' ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <FileText size={16} aria-hidden="true" />}
          <span>Unduh PDF</span>
        </button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        Bagikan kalender dengan teman dan keluarga
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {isExporting
          ? `Sedang menyiapkan ${exportType === 'image' ? 'PNG' : 'PDF'}…`
          : 'Kalender siap diunduh.'}
      </p>
    </section>
  );
}
