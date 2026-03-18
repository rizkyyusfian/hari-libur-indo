'use client';

import { Download, Image } from 'lucide-react';
import { useState } from 'react';

interface ExportControlsProps {
  onExportPDF?: () => void;
  onExportJPG?: () => void;
  disabled?: boolean;
}

export function ExportControls({ onExportPDF, onExportJPG, disabled }: ExportControlsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (exporter: (() => void) | undefined) => {
    if (!exporter) return;
    setIsLoading(true);
    try {
      exporter();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-cream dark:bg-darkblue/30 rounded-lg border-4 border-burgundy dark:border-darkred p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Download size={18} className="text-darkred dark:text-lightblue" />
        <h3 className="font-bold text-burgundy dark:text-cream text-lg">Ekspor Kalender</h3>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handleExport(onExportPDF)}
          disabled={disabled || isLoading}
          className="w-full px-4 py-2 rounded-lg border-2 border-darkred dark:border-lightblue bg-darkred dark:bg-darkred/40 text-cream dark:text-cream font-bold hover:bg-darkred/90 dark:hover:bg-darkred/60 disabled:opacity-50 transition"
        >
          📄 PDF
        </button>

        <button
          onClick={() => handleExport(onExportJPG)}
          disabled={disabled || isLoading}
          className="w-full px-4 py-2 rounded-lg border-2 border-lightblue dark:border-lightblue bg-lightblue/50 dark:bg-lightblue/30 text-darkblue dark:text-cream font-bold hover:bg-lightblue/70 dark:hover:bg-lightblue/50 disabled:opacity-50 transition"
        >
          <Image className="inline mr-2" size={16} />
          JPG
        </button>
      </div>

      <p className="text-xs text-burgundy dark:text-lightblue mt-3 pt-3 border-t-2 border-burgundy dark:border-darkred font-semibold">
        💡 Bagikan rencana liburan ke teman dan keluarga!
      </p>
    </div>
  );
}
