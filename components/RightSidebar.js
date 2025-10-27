'use client';

import Image from 'next/image';

export default function RightSidebar({ metadata, title }) {
  return (
    <div className="w-96 bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto">
      {!metadata ? null : (
      <div className="bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-700">
        {/* Image */}
        {metadata.image && (
          <div className="relative w-full h-48 bg-slate-900">
            <Image
              src={metadata.image}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Metadata Fields */}
        {metadata.fields && metadata.fields.length > 0 && (
          <div className="divide-y divide-slate-700">
            {metadata.fields.map((field, index) => (
              <div key={index} className="px-4 py-3">
                <div className="text-xs font-semibold text-white uppercase mb-1">
                  {field.key}
                </div>
                <div className="text-sm text-zinc-300">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
