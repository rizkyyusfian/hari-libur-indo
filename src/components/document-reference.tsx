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
    <aside className="rounded-2xl border border-line bg-surface-subtle p-4" aria-label="Dokumen sumber kalender">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <FileText size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-3 text-sm text-muted">
          <div>
            <p className="font-semibold text-foreground">
              Berdasarkan{' '}
              {nationalDocs.length > 0 && <DocumentGroup title="" documents={nationalDocs} inline />}
            </p>
          </div>
          
          {regionalDocs.length > 0 && (
            <DocumentGroup title="Papua Barat Daya" documents={regionalDocs} />
          )}
        </div>
      </div>
    </aside>
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
              className="focus-ring inline-flex items-center gap-1 rounded font-bold text-info hover:underline"
            >
              <span>{document.title}</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </span>
        ))}
      </span>
    );
  }

  return (
    <div>
      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-muted">
        {title}
      </p>
      <div className="space-y-1.5">
        {documents.map((document) => (
          <div key={document.id}>
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1 rounded font-bold text-info hover:underline"
            >
              {/* <span>{getDocumentKindLabel(document.document_kind)}: {document.title}</span> */}
              <span>{document.title}</span>
              <ExternalLink size={14} aria-hidden="true" />
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
