'use client';

<<<<<<< HEAD
import { Download, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
=======
import { Download, Image } from 'lucide-react';
>>>>>>> main
import { useState } from 'react';

interface ExportControlsProps {
  onExportPDF?: () => void;
  onExportJPG?: () => void;
  disabled?: boolean;
}

<<<<<<< HEAD
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
=======
export function ExportControls({ onExportPDF, onExportJPG, disabled }: ExportControlsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (exporter: (() => void) | undefined) => {
    if (!exporter) return;
    setIsLoading(true);
    try {
      exporter();
    } finally {
      setIsLoading(false);
>>>>>>> main
    }
  };

  return (
<<<<<<< HEAD
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-[#003049]/20 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Download size={18} className="text-[#003049] dark:text-[#669bbc]" />
        <h3 className="font-semibold text-[#003049] dark:text-gray-100">Download</h3>
=======
    <div className="bg-cream dark:bg-darkblue/30 rounded-lg border-4 border-burgundy dark:border-darkred p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Download size={18} className="text-darkred dark:text-lightblue" />
        <h3 className="font-bold text-burgundy dark:text-cream text-lg">Ekspor Kalender</h3>
>>>>>>> main
      </div>

      <div className="space-y-2">
        <button
<<<<<<< HEAD
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
=======
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
>>>>>>> main
      </p>
    </div>
  );
}
