import React, { useState } from 'react';
import { 
  RefreshCw, 
  Edit, 
  Download, 
  Copy, 
  Share2, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  ArrowRight, 
  Upload, 
  Settings, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Star,
  Bookmark,
  Loader2,
  FileText,
  Mail,
  Phone
} from 'lucide-react';
import { 
  Button, 
  AIRedoButton, 
  EditButton, 
  DownloadButton, 
  CopyButton, 
  ExportButton 
} from '@/components/ui/button';

/**
 * COMPREHENSIVE BUTTON SHOWCASE
 * 
 * Demonstrates all design guidelines implementation:
 * ✅ Always visible borders
 * ✅ High contrast colors (no gray-on-gray)
 * ✅ Shadows and depth effects
 * ✅ Smooth hover transitions
 * ✅ 44px minimum touch targets
 * ✅ Mobile-first design
 * ✅ Proper button hierarchy
 */
export const ButtonShowcase = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleLoading = (id: string) => {
    setLoading(prev => ({ ...prev, [id]: !prev[id] }));
    setTimeout(() => {
      setLoading(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-normal text-slate-900">
            Design System Button Showcase
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Every button follows the design guidelines to the letter: visible borders, 
            high contrast colors, shadows, hover effects, and proper hierarchy.
          </p>
        </div>

        {/* Button Hierarchy Logic */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">
            Button Hierarchy Logic
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-3">🔵 PRIMARY BUTTONS</h3>
              <p className="text-sm text-blue-800 mb-4">
                Main actions, most important CTAs - Royal Blue background with white text
              </p>
              <div className="space-y-3">
                <Button variant="default">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                </Button>
                <Button variant="default">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continue
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">⚪ SECONDARY BUTTONS</h3>
              <p className="text-sm text-gray-800 mb-4">
                AI actions, editing - Light background with DARK GRAY text (NOT colored!)
              </p>
              <div className="space-y-3">
                <AIRedoButton>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  AI REDO
                </AIRedoButton>
                <EditButton>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </EditButton>
                <Button variant="secondary">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
              <h3 className="font-medium text-blue-900 mb-3">🔲 OUTLINE BUTTONS</h3>
              <p className="text-sm text-blue-800 mb-4">
                Export/external actions - White background with blue border and text
              </p>
              <div className="space-y-3">
                <DownloadButton>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DownloadButton>
                <CopyButton>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </CopyButton>
                <ExportButton>
                  <Share2 className="mr-2 h-4 w-4" />
                  Export
                </ExportButton>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">👻 GHOST BUTTONS</h3>
              <p className="text-sm text-slate-800 mb-4">
                Navigation, tertiary actions - Subtle with visible borders on hover
              </p>
              <div className="space-y-3">
                <Button variant="ghost">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="ghost">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button variant="ghost">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Real-World Example: AI Writing Interface */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">
            Real-World Example: AI Writing Interface
          </h2>
          
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              {/* Content Area */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200 min-h-32">
                <p className="text-slate-600 text-sm">
                  Generated content appears here...
                </p>
              </div>
              
              {/* Action Buttons - Following Proper Hierarchy */}
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <div className="flex gap-2">
                  {/* Secondary Actions: AI & Editing */}
                  <AIRedoButton 
                    loading={loading.aiRedo}
                    onClick={() => toggleLoading('aiRedo')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {loading.aiRedo ? 'Regenerating...' : 'AI REDO'}
                  </AIRedoButton>
                  
                  <EditButton>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </EditButton>
                </div>
                
                <div className="flex gap-2">
                  {/* Export Actions: Outline Buttons */}
                  <DownloadButton>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DownloadButton>
                  
                  <CopyButton>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </CopyButton>
                  
                  {/* Primary Action: Most Important */}
                  <Button variant="default">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Button Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">
            All Button Variants
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Primary Actions */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Primary Actions</h3>
              <Button variant="default">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="default">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Secondary Actions</h3>
              <Button variant="secondary">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="secondary">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="secondary">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>

            {/* Export Actions */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Export Actions</h3>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Status Actions */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Status Actions</h3>
              <Button variant="success">
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button variant="warning">
                <RefreshCw className="mr-2 h-4 w-4" />
                Override
              </Button>
            </div>
          </div>
        </section>

        {/* Button Sizes & Touch Targets */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">
            Button Sizes (44px Minimum Touch Targets)
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <Button variant="default" size="sm">
                <Plus className="mr-2 h-3 w-3" />
                Small
              </Button>
              <Button variant="default" size="default">
                <Save className="mr-2 h-4 w-4" />
                Default
              </Button>
              <Button variant="default" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Large
              </Button>
              <Button variant="default" size="icon" title="Settings">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Mobile-First:</strong> All buttons meet the 44px minimum touch target requirement. 
                Even small buttons have sufficient padding to reach this threshold.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Features */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">
            Interactive Features
          </h2>
          
          <div className="space-y-6">
            {/* Loading States */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Loading States</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="default" 
                  loading={loading.save}
                  onClick={() => toggleLoading('save')}
                >
                  {loading.save ? 'Saving...' : 'Save Document'}
                </Button>
                <Button 
                  variant="secondary" 
                  loading={loading.edit}
                  onClick={() => toggleLoading('edit')}
                >
                  {loading.edit ? 'Processing...' : 'Edit Content'}
                </Button>
                <Button 
                  variant="outline" 
                  loading={loading.export}
                  onClick={() => toggleLoading('export')}
                >
                  {loading.export ? 'Exporting...' : 'Export File'}
                </Button>
              </div>
            </div>

            {/* Interactive Toggles */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Interactive Toggles</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant={favorites.heart ? "accent" : "ghost"} 
                  onClick={() => toggleFavorite('heart')}
                >
                  <Heart className={`mr-2 h-4 w-4 ${favorites.heart ? 'fill-current' : ''}`} />
                  {favorites.heart ? 'Favorited' : 'Add to Favorites'}
                </Button>
                <Button 
                  variant={favorites.star ? "warning" : "ghost"} 
                  onClick={() => toggleFavorite('star')}
                >
                  <Star className={`mr-2 h-4 w-4 ${favorites.star ? 'fill-current' : ''}`} />
                  {favorites.star ? 'Starred' : 'Add Star'}
                </Button>
                <Button 
                  variant={favorites.bookmark ? "accent" : "ghost"} 
                  onClick={() => toggleFavorite('bookmark')}
                >
                  <Bookmark className={`mr-2 h-4 w-4 ${favorites.bookmark ? 'fill-current' : ''}`} />
                  {favorites.bookmark ? 'Bookmarked' : 'Bookmark'}
                </Button>
              </div>
            </div>

            {/* Disabled States */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Disabled States</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default" disabled>
                  <Save className="mr-2 h-4 w-4" />
                  Save (Disabled)
                </Button>
                <Button variant="secondary" disabled>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit (Disabled)
                </Button>
                <Button variant="outline" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Download (Disabled)
                </Button>
                <Button variant="destructive" disabled>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete (Disabled)
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Button Groups & Combinations */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">
            Button Groups & Combinations
          </h2>
          
          <div className="space-y-6">
            {/* Form Actions */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Form Actions</h3>
              <div className="flex gap-3">
                <Button variant="default">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="secondary">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>

            {/* Confirmation Dialog */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Confirmation Dialog</h3>
              <div className="flex gap-3">
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Forever
                </Button>
                <Button variant="ghost">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Export Options</h3>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Text
                </Button>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Design Features Summary */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">
            Design Guidelines Implementation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-3">✅ Always Visible Borders</h3>
              <p className="text-sm text-green-800">
                Every button has a visible border at all times, essential for mobile usability.
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-3">✅ High Contrast Colors</h3>
              <p className="text-sm text-green-800">
                No gray-on-gray combinations. Secondary buttons use dark gray text (#374151).
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-3">✅ Shadows & Depth</h3>
              <p className="text-sm text-green-800">
                Primary buttons have shadow-md, increased to shadow-lg on hover.
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-3">✅ 44px Touch Targets</h3>
              <p className="text-sm text-green-800">
                All buttons meet mobile accessibility requirements with proper sizing.
              </p>
            </div>
          </div>
        </section>

        {/* Color Reference */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">
            Color Reference
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Primary Blue</div>
              <div className="text-xs opacity-75">#2563EB</div>
            </div>
            <div className="bg-gray-700 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Secondary Text</div>
              <div className="text-xs opacity-75">#374151</div>
            </div>
            <div className="bg-emerald-500 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Success Green</div>
              <div className="text-xs opacity-75">#10B981</div>
            </div>
            <div className="bg-red-500 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Destructive Red</div>
              <div className="text-xs opacity-75">#EF4444</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}; 