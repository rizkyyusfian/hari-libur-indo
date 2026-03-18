'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import { exportAsImage, exportAsPDF } from '@/lib/export-utils';

interface ExportControlsProps {
  calendarElementId?: string;
}

export function ExportControls({ calendarElementId = 'calendar-export' }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      await exportAsImage(calendarElementId);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportAsPDF(calendarElementId);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Download size={18} className="text-green-500" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Ekspor</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="px-3 py-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? '⏳ Proses...' : '🖼️ Gambar'}
        </button>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? '⏳ Proses...' : '📄 PDF'}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        💾 Bagikan kalender dengan teman dan keluarga
      </p>
    </div>
  );
}
