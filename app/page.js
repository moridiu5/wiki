'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import PageContent from '@/components/PageContent';
import RightSidebar from '@/components/RightSidebar';
import MarkdownEditor from '@/components/MarkdownEditor';
import PinModal from '@/components/PinModal';
import InputModal from '@/components/InputModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import DuplicatePageModal from '@/components/DuplicatePageModal';
import AuthTimer from '@/components/AuthTimer';

export default function Home() {
  const [sections, setSections] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [pinModal, setPinModal] = useState({ isOpen: false, action: '', callback: null });
  const [lastAuthTime, setLastAuthTime] = useState(null);
  const [inputModal, setInputModal] = useState({ isOpen: false, title: '', placeholder: '', defaultValue: '', callback: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, title: '', message: '', itemName: '', callback: null });
  const [duplicateModal, setDuplicateModal] = useState({ isOpen: false, page: null });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const storedAuthTime = localStorage.getItem('lastAuthTime');
    if (storedAuthTime) {
      setLastAuthTime(parseInt(storedAuthTime, 10));
    }
  }, []);

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/sections');
        if (response.ok) {
          const { sections: dbSections } = await response.json();
          // Transform database sections to frontend format
          const transformedSections = dbSections.map(section => ({
            id: section.id.toString(),
            title: section.title,
            pages: section.pages.map(page => ({
              id: page.id.toString(),
              title: page.title,
              content: page.content,
              metadata: {
                image: page.metadataImage || '',
                fields: page.metadataFields.map(field => ({
                  key: field.key,
                  value: field.value
                }))
              }
            }))
          }));
          setSections(transformedSections);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = [];
    const searchLower = query.toLowerCase();

    sections.forEach((section) => {
      section.pages.forEach((page) => {
        const titleMatch = page.title.toLowerCase().includes(searchLower);
        const contentMatch = page.content.toLowerCase().includes(searchLower);

        if (titleMatch || contentMatch) {
          results.push({
            ...page,
            sectionTitle: section.title,
            sectionId: section.id,
          });
        }
      });
    });

    setSearchResults(results);
    setShowResults(true);
  };

  const handleSelectResult = (pageId) => {
    handleSelectPage(pageId);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleAuthTimerClick = () => {
    setPinModal({
      isOpen: true,
      action: 'authenticate',
      callback: () => {
        // Authentication is handled in handlePinSuccess
      }
    });
  };

  // PIN verification wrapper
  const requirePin = (action, callback) => {
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

    // Check if authentication is still valid (within 30 minutes)
    if (lastAuthTime && (now - lastAuthTime) < thirtyMinutes) {
      // Session is still valid, execute callback directly
      callback();
      return;
    }

    // Session expired or no auth, show PIN modal
    setPinModal({
      isOpen: true,
      action,
      callback
    });
  };

  const handlePinSuccess = () => {
    // Update authentication timestamp
    const now = Date.now();
    setLastAuthTime(now);
    localStorage.setItem('lastAuthTime', now.toString());

    if (pinModal.callback) {
      pinModal.callback();
    }
    setPinModal({ isOpen: false, action: '', callback: null });
  };

  // Helper function to reload sections from database
  const reloadSections = async () => {
    try {
      const response = await fetch('/api/sections');
      if (response.ok) {
        const { sections: dbSections } = await response.json();
        const transformedSections = dbSections.map(section => ({
          id: section.id.toString(),
          title: section.title,
          pages: section.pages.map(page => ({
            id: page.id.toString(),
            title: page.title,
            content: page.content,
            metadata: {
              image: page.metadataImage || '',
              fields: page.metadataFields.map(field => ({
                key: field.key,
                value: field.value
              }))
            }
          }))
        }));
        setSections(transformedSections);
      }
    } catch (error) {
      console.error('Error reloading sections:', error);
    }
  };

  const handleAddSection = () => {
    requirePin('add a section', () => {
      setInputModal({
        isOpen: true,
        title: 'Add New Section',
        placeholder: 'Enter section title...',
        defaultValue: '',
        callback: async (title) => {
          try {
            const response = await fetch('/api/sections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title })
            });
            if (response.ok) {
              await reloadSections();
            }
          } catch (error) {
            console.error('Error adding section:', error);
          }
        }
      });
    });
  };

  const handleEditSection = (sectionId) => {
    requirePin('edit this section', () => {
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        setInputModal({
          isOpen: true,
          title: 'Edit Section',
          placeholder: 'Enter section title...',
          defaultValue: section.title,
          callback: async (newTitle) => {
            try {
              const response = await fetch(`/api/sections/${sectionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
              });
              if (response.ok) {
                await reloadSections();
              }
            } catch (error) {
              console.error('Error editing section:', error);
            }
          }
        });
      }
    });
  };

  const handleDeleteSection = (sectionId) => {
    requirePin('delete this section', () => {
      const section = sections.find(s => s.id === sectionId);
      const hasPages = section && section.pages.length > 0;

      setDeleteModal({
        isOpen: true,
        title: 'Delete Section',
        message: hasPages
          ? 'This will delete the section and all its pages. This action cannot be undone.'
          : 'Are you sure you want to delete this section?',
        itemName: section.title,
        callback: async () => {
          try {
            const response = await fetch(`/api/sections/${sectionId}`, {
              method: 'DELETE'
            });
            if (response.ok) {
              if (selectedPageId) {
                const pageInSection = section.pages.find(p => p.id === selectedPageId);
                if (pageInSection) {
                  setSelectedPageId(null);
                }
              }
              await reloadSections();
            }
          } catch (error) {
            console.error('Error deleting section:', error);
          }
        }
      });
    });
  };

  const handleAddPage = (sectionId) => {
    requirePin('add a page', () => {
      setCurrentSectionId(sectionId);
      setEditingPage(null);
      setIsEditing(true);
    });
  };

  const handleSelectPage = (pageId) => {
    setSelectedPageId(pageId);
  };

  const handleEditPage = () => {
    requirePin('edit this page', () => {
      const page = getCurrentPage();
      if (page) {
        const section = sections.find(s => s.pages.some(p => p.id === selectedPageId));
        setCurrentSectionId(section?.id || null);
        setEditingPage(page);
        setIsEditing(true);
      }
    });
  };

  const handleDuplicatePage = () => {
    requirePin('duplicate this page', () => {
      const page = getCurrentPage();
      if (page) {
        setDuplicateModal({ isOpen: true, page });
      }
    });
  };

  const handleDuplicateConfirm = async (targetSectionId) => {
    if (!duplicateModal.page) return;

    try {
      const pageData = {
        title: duplicateModal.page.title + ' (Copy)',
        content: duplicateModal.page.content,
        sectionId: parseInt(targetSectionId),
        metadataImage: duplicateModal.page.metadata?.image || null,
        metadataFields: duplicateModal.page.metadata?.fields || []
      };

      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData)
      });

      if (response.ok) {
        const { page: newPage } = await response.json();
        await reloadSections();
        setSelectedPageId(newPage.id.toString());
      }
    } catch (error) {
      console.error('Error duplicating page:', error);
    }
  };

  const handleReorderSections = async (sourceIndex, destinationIndex) => {
    // Optimistically update UI
    const newSections = Array.from(sections);
    const [removed] = newSections.splice(sourceIndex, 1);
    newSections.splice(destinationIndex, 0, removed);
    setSections(newSections);

    // Send update to server
    try {
      const sectionOrders = newSections.map((section, index) => ({
        id: section.id,
        order: index
      }));

      await fetch('/api/sections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionOrders })
      });
    } catch (error) {
      console.error('Error reordering sections:', error);
      // Reload sections on error to restore correct order
      await reloadSections();
    }
  };

  const handleReorderPages = async (sectionId, sourceIndex, destinationIndex) => {
    // Optimistically update UI
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const newSections = [...sections];
    const newPages = Array.from(newSections[sectionIndex].pages);
    const [removed] = newPages.splice(sourceIndex, 1);
    newPages.splice(destinationIndex, 0, removed);
    newSections[sectionIndex] = { ...newSections[sectionIndex], pages: newPages };
    setSections(newSections);

    // Send update to server
    try {
      const pageOrders = newPages.map((page, index) => ({
        id: page.id,
        order: index
      }));

      await fetch('/api/pages/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, pageOrders })
      });
    } catch (error) {
      console.error('Error reordering pages:', error);
      // Reload sections on error to restore correct order
      await reloadSections();
    }
  };

  const handleDeletePage = (pageId, sectionId) => {
    requirePin('delete this page', () => {
      // Find the page to get its title
      const section = sections.find(s => s.id === sectionId);
      const page = section?.pages.find(p => p.id === pageId);

      setDeleteModal({
        isOpen: true,
        title: 'Delete Page',
        message: 'Are you sure you want to delete this page? This action cannot be undone.',
        itemName: page?.title || 'Unknown Page',
        callback: async () => {
          try {
            const response = await fetch(`/api/pages/${pageId}`, {
              method: 'DELETE'
            });
            if (response.ok) {
              if (selectedPageId === pageId) {
                setSelectedPageId(null);
              }
              await reloadSections();
            }
          } catch (error) {
            console.error('Error deleting page:', error);
          }
        }
      });
    });
  };

  const handleSavePage = async (page, sectionId) => {
    try {
      const pageData = {
        title: page.title,
        content: page.content,
        sectionId: parseInt(sectionId),
        metadataImage: page.metadata?.image || null,
        metadataFields: page.metadata?.fields || []
      };

      let response;
      let createdPageId = page.id;

      if (page.id && page.id !== 'new') {
        // Update existing page
        response = await fetch(`/api/pages/${page.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageData)
        });
      } else {
        // Create new page
        response = await fetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageData)
        });

        if (response.ok) {
          const { page: newPage } = await response.json();
          createdPageId = newPage.id.toString();
        }
      }

      if (response.ok) {
        await reloadSections();
        setSelectedPageId(createdPageId);
        setIsEditing(false);
        setEditingPage(null);
        setCurrentSectionId(null);
      }
    } catch (error) {
      console.error('Error saving page:', error);
    }
  };

  const getCurrentPage = () => {
    if (!selectedPageId) return null;
    for (const section of sections) {
      const page = section.pages.find(p => p.id === selectedPageId);
      if (page) return page;
    }
    return null;
  };

  const currentPage = getCurrentPage();

  // Check if user is authenticated (within 30 minutes)
  const isAuthenticated = () => {
    if (!lastAuthTime) return false;
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    return (now - lastAuthTime) < thirtyMinutes;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="flex flex-col">
        <Sidebar
          sections={sections}
          onAddSection={handleAddSection}
          onAddPage={handleAddPage}
          onSelectPage={handleSelectPage}
          onDeletePage={handleDeletePage}
          onDeleteSection={handleDeleteSection}
          onEditSection={handleEditSection}
          onReorderSections={handleReorderSections}
          onReorderPages={handleReorderPages}
          selectedPageId={selectedPageId}
          isAuthenticated={isAuthenticated()}
        />
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Full Width */}
        <div className="border-b border-slate-700 px-8 flex items-center justify-between bg-slate-800 h-16 z-20">
          {/* Search - Left */}
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              placeholder="Search articles..."
              className="w-96 pl-3 pr-10 py-2 text-sm border border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-text bg-slate-700 text-white placeholder-zinc-400"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-600 rounded cursor-pointer">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                <div className="p-2">
                  <div className="text-xs font-semibold text-zinc-400 uppercase px-2 py-1">
                    {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
                  </div>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result.id)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded flex flex-col gap-1 cursor-pointer"
                    >
                      <div className="font-medium text-sm text-white">{result.title}</div>
                      <div className="text-xs text-zinc-400">{result.sectionTitle}</div>
                      <div className="text-xs text-zinc-400 line-clamp-2">
                        {result.content.substring(0, 150)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showResults && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 z-50">
                <p className="text-sm text-zinc-400">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Auth Timer - Right */}
          <AuthTimer
            isAuthenticated={isAuthenticated()}
            lastAuthTime={lastAuthTime}
            onAuthClick={handleAuthTimerClick}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          <PageContent
            page={currentPage}
            onEdit={handleEditPage}
            onDuplicate={handleDuplicatePage}
          />

          <RightSidebar
            metadata={currentPage?.metadata}
            title={currentPage?.title}
          />
        </div>
      </div>

      {isEditing && (
        <MarkdownEditor
          page={editingPage}
          sections={sections}
          currentSectionId={currentSectionId}
          onSave={handleSavePage}
          onClose={() => {
            setIsEditing(false);
            setEditingPage(null);
            setCurrentSectionId(null);
          }}
        />
      )}

      <PinModal
        isOpen={pinModal.isOpen}
        onClose={() => setPinModal({ isOpen: false, action: '', callback: null })}
        onSuccess={handlePinSuccess}
        action={pinModal.action}
      />

      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal({ isOpen: false, title: '', placeholder: '', defaultValue: '', callback: null })}
        onSubmit={(value) => {
          if (inputModal.callback) {
            inputModal.callback(value);
          }
          setInputModal({ isOpen: false, title: '', placeholder: '', defaultValue: '', callback: null });
        }}
        title={inputModal.title}
        placeholder={inputModal.placeholder}
        defaultValue={inputModal.defaultValue}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, title: '', message: '', itemName: '', callback: null })}
        onConfirm={deleteModal.callback}
        title={deleteModal.title}
        message={deleteModal.message}
        itemName={deleteModal.itemName}
      />

      <DuplicatePageModal
        isOpen={duplicateModal.isOpen}
        onClose={() => setDuplicateModal({ isOpen: false, page: null })}
        onConfirm={handleDuplicateConfirm}
        sections={sections}
        currentPageTitle={duplicateModal.page?.title || ''}
      />
    </div>
  );
}
