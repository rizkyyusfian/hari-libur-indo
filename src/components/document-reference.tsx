import { FileText, ExternalLink } from 'lucide-react';
import type { Document } from '@/domain/models';

interface DocumentReferenceProps {
  documents: Document[];
  loading?: boolean;
}

export default function DocumentReference({ documents, loading = false }: DocumentReferenceProps) {
  if (loading) {
    return null;
  }

  if (documents.length === 0) {
    return null;
  }

  const nationalDocs = documents.filter(document => document.type === 'national');
  const regionalDocs = documents.filter(document => document.type === 'regional');

  return (
    <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-[#003049]/10 dark:border-slate-700">
      <div className="flex items-start gap-3">
        <FileText className="text-[#c1121f] dark:text-[#c1121f] flex-shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-[#003049] dark:text-gray-300 space-y-3">
          <div>
            <p className="font-medium text-[#003049] dark:text-gray-100">
              Berdasarkan{' '}
              {nationalDocs.length > 0 && <DocumentGroup title="" documents={nationalDocs} inline />}
            </p>
          </div>
          
          {regionalDocs.length > 0 && (
            <DocumentGroup title="Papua Barat Daya" documents={regionalDocs} />
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentGroup({
  title,
  documents,
  inline = false,
}: {
  title: string;
  documents: Document[];
  inline?: boolean;
}) {
  if (inline) {
    return (
      <span className="inline">
        {documents.map((document, index) => (
          <span key={document.id}>
            {index > 0 && ', '}
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#003049] dark:text-[#669bbc] font-medium hover:underline inline-flex items-center gap-1 align-middle"
            >
              <span>{document.title}</span>
              <ExternalLink size={14} />
            </a>
          </span>
        ))}
      </span>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#003049]/60 dark:text-gray-500 mb-1">
        {title}
      </p>
      <div className="space-y-1.5">
        {documents.map((document) => (
          <div key={document.id}>
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#003049] dark:text-[#669bbc] font-medium hover:underline inline-flex items-center gap-1"
            >
              {/* <span>{getDocumentKindLabel(document.document_kind)}: {document.title}</span> */}
              <span>{document.title}</span>
              <ExternalLink size={14} />
            </a>
            {/* {document.summary && (
              <p className="text-xs text-[#003049]/60 dark:text-gray-400">
                {document.summary}
              </p>
            )} */}
          </div>
        ))}
      </div>
    </div>
  );
}
