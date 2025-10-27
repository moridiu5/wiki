'use client';

import { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, Edit2, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function Sidebar({ sections, onAddSection, onAddPage, onSelectPage, onDeletePage, onDeleteSection, selectedPageId, onEditSection, onReorderSections, onReorderPages, isAuthenticated }) {
  const [hoveredSection, setHoveredSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState(sections.map(s => s.id));

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'section') {
      // Reorder sections
      if (source.index === destination.index) return;
      onReorderSections(source.index, destination.index);
    } else if (type.startsWith('page-')) {
      // Reorder pages within a section
      const sectionId = type.split('-')[1];
      if (source.index === destination.index) return;
      onReorderPages(sectionId, source.index, destination.index);
    }
  };

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 h-screen overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="px-6 border-b border-slate-700 flex items-center h-16">
        <img
          src="/colxgroup.svg"
          alt="ColX Group"
          className="h-[1.8rem] w-auto"
        />
      </div>

      {/* Contents */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase">Contents</h3>
            <button
              onClick={onAddSection}
              className="p-1 hover:bg-slate-700 rounded cursor-pointer"
              title="Add section"
            >
              <Plus className="w-4 h-4 text-zinc-300" />
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections" type="section">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-1"
                >
                  {sections.map((section, sectionIndex) => (
                    <Draggable key={section.id} draggableId={`section-${section.id}`} index={sectionIndex}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          onMouseEnter={() => setHoveredSection(section.id)}
                          onMouseLeave={() => setHoveredSection(null)}
                          className={snapshot.isDragging ? 'bg-slate-700 rounded' : ''}
                        >
                          <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-1 flex-1">
                              <div
                                {...provided.dragHandleProps}
                                className={`cursor-grab active:cursor-grabbing ${!isAuthenticated ? 'hidden' : ''}`}
                              >
                                <GripVertical className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
                              </div>
                              <button
                                onClick={() => toggleSection(section.id)}
                                className="flex items-center gap-2 text-sm py-1 px-2 hover:bg-slate-700 rounded flex-1 text-left cursor-pointer text-white font-semibold"
                              >
                                {expandedSections.includes(section.id) ? (
                                  <ChevronDown className="w-4 h-4 text-teal-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-teal-400" />
                                )}
                                <span>{section.title}</span>
                              </button>
                            </div>

                            {hoveredSection === section.id && (
                              <div className="flex items-center gap-1 mr-2">
                                <button
                                  onClick={() => onAddPage(section.id)}
                                  className="p-1 hover:bg-slate-600 rounded cursor-pointer"
                                  title="Add page to this section"
                                >
                                  <Plus className="w-3 h-3 text-zinc-300" />
                                </button>
                                <button
                                  onClick={() => onEditSection(section.id)}
                                  className="p-1 hover:bg-slate-600 rounded cursor-pointer"
                                  title="Edit section"
                                >
                                  <Edit2 className="w-3 h-3 text-zinc-300" />
                                </button>
                                <button
                                  onClick={() => onDeleteSection(section.id)}
                                  className="p-1 hover:bg-slate-600 rounded cursor-pointer"
                                  title="Delete section"
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                              </div>
                            )}
                          </div>

                          {expandedSections.includes(section.id) && (
                            <Droppable droppableId={`pages-${section.id}`} type={`page-${section.id}`}>
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="ml-6 space-y-1"
                                >
                                  {section.pages.map((page, pageIndex) => (
                                    <Draggable key={page.id} draggableId={`page-${page.id}`} index={pageIndex}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`flex items-center justify-between group ${snapshot.isDragging ? 'bg-slate-700 rounded' : ''}`}
                                        >
                                          <div className="flex items-center gap-1 flex-1">
                                            <div
                                              {...provided.dragHandleProps}
                                              className={`cursor-grab active:cursor-grabbing ${!isAuthenticated ? 'hidden' : ''}`}
                                            >
                                              <GripVertical className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                                            </div>
                                            <button
                                              onClick={() => onSelectPage(page.id)}
                                              className={`text-sm py-1 px-2 hover:bg-slate-700 rounded flex-1 text-left cursor-pointer ${
                                                selectedPageId === page.id ? 'bg-teal-500/20 text-teal-400' : 'text-zinc-300'
                                              }`}
                                            >
                                              {page.title}
                                            </button>
                                          </div>
                                          {selectedPageId === page.id && (
                                            <button
                                              onClick={() => onDeletePage(page.id, section.id)}
                                              className="p-1 hover:bg-slate-600 rounded mr-2 opacity-0 group-hover:opacity-100 cursor-pointer"
                                              title="Delete page"
                                            >
                                              <Trash2 className="w-3 h-3 text-red-400" />
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
