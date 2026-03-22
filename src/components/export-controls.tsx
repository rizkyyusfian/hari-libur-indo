'use client';

import { Download, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { exportAsImage, exportAsPDF } from '@/lib/export-utils';

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
      await exportAsImage(calendarElementId);
    } catch (error) {
      console.error('Export image error:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    try {
      await exportAsPDF(calendarElementId);
    } catch (error) {
      console.error('Export PDF error:', error);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Download size={18} className="text-[#003049] dark:text-[#669bbc]" />
        <h3 className="font-semibold text-[#003049] dark:text-gray-100">Download</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#669bbc]/20 hover:bg-[#669bbc]/40 dark:bg-[#669bbc]/20 dark:hover:bg-[#669bbc]/30 text-[#003049] dark:text-[#669bbc] text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting && exportType === 'image' ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
          <span>Gambar</span>
        </button>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#c1121f]/10 hover:bg-[#c1121f]/20 dark:bg-[#c1121f]/20 dark:hover:bg-[#c1121f]/30 text-[#c1121f] dark:text-[#c1121f] text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting && exportType === 'pdf' ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
          <span>PDF</span>
        </button>
      </div>

      <p className="text-xs text-[#003049]/70 dark:text-gray-400 mt-3">
        Bagikan kalender dengan teman dan keluarga
      </p>
    </div>
  );
}
