'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit, Copy } from 'lucide-react';

export default function PageContent({ page, onEdit, onDuplicate }) {
  if (!page) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-900">
        {/* Content */}
        <div className="flex items-center justify-center h-96 text-zinc-400">
          <p>Select a page to view its content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900">
      {/* Content */}
      <div className="px-8 py-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-serif text-white">{page.title}</h1>
          <div className="flex gap-2">
            <button
              onClick={onDuplicate}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-600 rounded hover:bg-slate-700 cursor-pointer text-white"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-600 rounded hover:bg-teal-600 cursor-pointer bg-teal-500 text-white"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
        <div className="border-b border-slate-700 mb-6 mt-3"></div>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-slate-700 text-white" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 text-white" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2 text-white" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-zinc-300" {...props} />,
              a: ({node, ...props}) => <a className="text-teal-400 hover:underline" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-4 text-zinc-300" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-4 text-zinc-300" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-teal-500 pl-4 italic my-4 text-zinc-400" {...props} />,
              code: ({node, inline, ...props}) =>
                inline
                  ? <code className="bg-slate-800 px-1 py-0.5 rounded text-sm font-mono text-teal-400" {...props} />
                  : <code className="block bg-slate-800 p-4 rounded my-4 overflow-x-auto font-mono text-sm text-zinc-300" {...props} />
            }}
          >
            {page.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
