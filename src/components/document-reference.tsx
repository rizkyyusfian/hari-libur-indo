'use client';

import { useState, useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { getActiveDocument, Document } from '@/lib/supabase-queries';

interface DocumentReferenceProps {
  year?: number;
}

export default function DocumentReference({ year }: DocumentReferenceProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const loadDocument = async () => {
    try {
      const doc = await getActiveDocument(year);
      setDocument(doc);
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!document) {
    return null;
  }

  return (
    <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-[#003049]/10 dark:border-slate-700">
      <div className="flex items-start gap-3">
        <FileText className="text-[#c1121f] dark:text-[#c1121f] flex-shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-[#003049] dark:text-gray-300">
          <span>Berdasarkan </span>
          {document.file_url ? (
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#003049] dark:text-[#669bbc] font-medium hover:underline inline-flex items-center gap-1"
            >
              {document.title}
              <ExternalLink size={14} />
            </a>
          ) : (
            <span className="font-medium">{document.title}</span>
          )}
        </div>
      </div>
    </div>
  );
}
