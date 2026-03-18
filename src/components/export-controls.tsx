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
    <div className="bg-white dark:bg-slate-800/50 rounded-lg border-2 border-purple-200 dark:border-purple-700/50 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Download size={18} className="text-purple-500 dark:text-purple-400" />
        <h3 className="font-bold text-purple-700 dark:text-purple-300">Ekspor</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleExportImage}
          disabled={isExporting}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-900/40 dark:to-orange-900/40 hover:shadow-lg text-yellow-700 dark:text-yellow-300 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed border border-yellow-300 dark:border-yellow-700/50"
        >
          {isExporting ? '⏳ Proses...' : '🖼️ Gambar'}
        </button>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-200 to-pink-200 dark:from-red-900/40 dark:to-pink-900/40 hover:shadow-lg text-red-700 dark:text-red-300 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed border border-red-300 dark:border-red-700/50"
        >
          {isExporting ? '⏳ Proses...' : '📄 PDF'}
        </button>
      </div>

      <p className="text-xs text-purple-600 dark:text-purple-400 mt-3 font-medium">
        💾 Bagikan kalender dengan teman dan keluarga
      </p>
    </div>
  );
}
