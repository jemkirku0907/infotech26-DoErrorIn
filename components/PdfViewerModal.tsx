'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Download, ZoomIn, ZoomOut, RotateCcw, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface PdfViewerModalProps {
  source: string | null; // e.g. "Source01.pdf"
  initialPage?: number;
  highlightQuote?: string;
  onClose: () => void;
}

const SOURCE_DETAILS: Record<string, { title: string; pages: number; description: string }> = {
  'Source01.pdf': {
    title: 'Source01: Scholarships & Token Fee Exemption',
    pages: 14,
    description: 'Official university policies on entrance grants, Dean’s Lister exemptions, employee dependents, and application steps.',
  },
  'Source02.pdf': {
    title: 'Source02: College Requirements (CCIS & Colleges)',
    pages: 2,
    description: 'Academic grade requirements, GWA standards, and course-specific retention policies for CCIS degrees.',
  },
  'Source03.pdf': {
    title: 'Source03: Campus Map & Building Directory',
    pages: 6,
    description: 'Comprehensive directory of campus buildings (Admin Building, Academic 1-3, HPSB) floor plans and wings.',
  },
  'Source04.pdf': {
    title: 'Source04: Administrative & Academic Offices',
    pages: 14,
    description: 'Directory of University President, Vice Presidents, Directors, office functions, and key performance indicators.',
  },
};

export function PdfViewerModal({ source, initialPage = 1, highlightQuote, onClose }: PdfViewerModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage || 1);
  const [zoom, setZoom] = useState<number>(100);

  if (!source) return null;

  const doc = SOURCE_DETAILS[source] || {
    title: source,
    pages: 14,
    description: 'Official University of Makati document.',
  };

  const pdfUrl = `/sources/${source}`;
  const pdfPageUrl = `${pdfUrl}#page=${currentPage}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 md:p-6 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-5xl h-[92vh] rounded-2xl bg-white dark:bg-[#0B132B] shadow-2xl border border-slate-200 dark:border-[#1C2541] overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#3F56CA] text-white border-b border-blue-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-white/10 shrink-0">
              <FileText className="w-5 h-5 text-[#D1CA25]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-bold truncate leading-tight">{doc.title}</h2>
              <p className="text-[11px] text-blue-100 truncate">{doc.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open original PDF in new tab"
              className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={pdfUrl}
              download={source}
              title="Download official PDF"
              className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              aria-label="Close PDF Viewer"
              className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Page navigation and Zoom */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-100 dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous Page"
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Page {currentPage} of {doc.pages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(doc.pages, p + 1))}
              disabled={currentPage >= doc.pages}
              aria-label="Next Page"
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {highlightQuote && (
            <div className="hidden md:flex items-center gap-1.5 max-w-md bg-amber-50 dark:bg-yellow-950/40 border border-amber-200 dark:border-yellow-900/60 px-2 py-0.5 rounded text-[11px] text-amber-800 dark:text-yellow-200 truncate">
              <span className="font-bold shrink-0">Cited Passage:</span>
              <span className="truncate italic">&quot;{highlightQuote}&quot;</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(75, z - 15))}
              title="Zoom Out"
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 w-10 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 15))}
              title="Zoom In"
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              title="Reset Zoom"
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Embedded Interactive PDF Viewer Frame */}
        <div className="flex-1 bg-slate-200 dark:bg-[#070D1E] overflow-auto flex items-center justify-center relative p-1">
          <iframe
            key={`${source}-${currentPage}`}
            src={pdfPageUrl}
            title={`${doc.title} Page ${currentPage}`}
            className="w-full h-full rounded-b-xl border-0 shadow-inner"
            style={{
              transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none',
              transformOrigin: 'top center',
            }}
          />
        </div>
      </div>
    </div>
  );
}
