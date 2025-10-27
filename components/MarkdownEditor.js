'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

export default function MarkdownEditor({ page, onSave, onClose, sections, currentSectionId }) {
  const [title, setTitle] = useState(page?.title || '');
  const [content, setContent] = useState(page?.content || '');
  const [metadata, setMetadata] = useState(page?.metadata || { image: '', fields: [] });
  const [selectedSection, setSelectedSection] = useState(currentSectionId || '');
  const [activeTab, setActiveTab] = useState('edit');
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mainImageInputRef = useRef(null);

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setContent(page.content);
      setMetadata(page.metadata || { image: '', fields: [] });
    }
  }, [page]);

  const handleAddField = () => {
    setMetadata({
      ...metadata,
      fields: [...metadata.fields, { key: '', value: '' }]
    });
  };

  const handleRemoveField = (index) => {
    setMetadata({
      ...metadata,
      fields: metadata.fields.filter((_, i) => i !== index)
    });
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...metadata.fields];
    newFields[index][field] = value;
    setMetadata({ ...metadata, fields: newFields });
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleImageUpload(file);
    if (url) {
      setMetadata({ ...metadata, image: url });
    }
  };

  const handleContentImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await handleImageUpload(file);
    if (url) {
      // Insert markdown image syntax at cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageMarkdown = `![Image](${url})`;
        const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
        setContent(newContent);

        // Reset cursor position after image
        setTimeout(() => {
          textarea.focus();
          const newPosition = start + imageMarkdown.length;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
      }
    }
  };

  const handleSave = () => {
    onSave({
      ...page,
      title,
      content,
      metadata,
      id: page?.id || 'new'
    }, selectedSection);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {page ? 'Edit Page' : 'New Page'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded cursor-pointer">
            <X className="w-5 h-5 text-zinc-300" />
          </button>
        </div>

        {/* Section Selector */}
        <div className="px-4 py-3 border-b border-slate-700">
          <label className="block text-sm font-medium mb-2 text-zinc-300">Section</label>
          <div className="relative">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full border border-slate-600 rounded px-3 py-2 pr-10 bg-slate-700 text-white appearance-none cursor-pointer"
            >
              <option value="">Select a section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="px-4 py-3 border-b border-slate-700">
          <label className="block text-sm font-medium mb-2 text-zinc-300">Page Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-600 rounded px-3 py-2 bg-slate-700 text-white placeholder-zinc-400"
            placeholder="Enter page title"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 font-medium cursor-pointer ${
              activeTab === 'edit'
                ? 'border-b-2 border-teal-500 text-teal-400'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-medium cursor-pointer ${
              activeTab === 'preview'
                ? 'border-b-2 border-teal-500 text-teal-400'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 font-medium cursor-pointer ${
              activeTab === 'metadata'
                ? 'border-b-2 border-teal-500 text-teal-400'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            Metadata
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'edit' && (
            <>
              <div className="border-b border-slate-700 px-4 py-2 flex items-center gap-2 bg-slate-900">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 border border-slate-600 rounded hover:bg-slate-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  <ImageIcon className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Insert Image'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleContentImageUpload}
                  className="hidden"
                />
                <span className="text-xs text-zinc-400">Click to upload an image to your article</span>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-slate-900 text-zinc-300"
                placeholder="Write your content in Markdown..."
              />
            </>
          )}

          {activeTab === 'preview' && (
            <div className="h-full overflow-y-auto p-8 bg-slate-900">
              <h1 className="text-4xl font-serif mb-6 text-white">{title || 'Untitled'}</h1>
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
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="h-full overflow-y-auto p-4 bg-slate-900">
              <div className="max-w-2xl">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-zinc-300">Page Image</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={metadata.image}
                      onChange={(e) => setMetadata({ ...metadata, image: e.target.value })}
                      className="flex-1 border border-slate-600 rounded px-3 py-2 bg-slate-700 text-white placeholder-zinc-400"
                      placeholder="https://example.com/image.jpg or upload below"
                    />
                    <button
                      onClick={() => mainImageInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <input
                      ref={mainImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                  </div>
                  {metadata.image && (
                    <div className="mt-2">
                      <img
                        src={metadata.image}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded border border-slate-700"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-zinc-300">Metadata Fields</label>
                    <button
                      onClick={handleAddField}
                      className="text-sm text-teal-400 hover:text-teal-300 cursor-pointer"
                    >
                      + Add Field
                    </button>
                  </div>

                  <div className="space-y-3">
                    {metadata.fields.map((field, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                          className="flex-1 border border-slate-600 rounded px-3 py-2 bg-slate-700 text-white placeholder-zinc-400"
                          placeholder="Key (e.g., Country)"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                          className="flex-1 border border-slate-600 rounded px-3 py-2 bg-slate-700 text-white placeholder-zinc-400"
                          placeholder="Value (e.g., France)"
                        />
                        <button
                          onClick={() => handleRemoveField(index)}
                          className="p-2 text-red-400 hover:bg-slate-700 rounded cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-slate-600 rounded hover:bg-slate-700 cursor-pointer text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title || !selectedSection}
            className="px-4 py-2 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 disabled:bg-slate-600 disabled:cursor-not-allowed cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
