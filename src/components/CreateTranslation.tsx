import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, CheckCircle, X } from 'lucide-react';

interface TranslationData {
  de: string;
  es: string;
  pt: string;
  nl: string;
  fr: string;
  it: string;
  da: string;
  el: string;
  pl: string;
  no: string;
  sv: string;
}

export const CreateTranslation: React.FC = () => {
  const [formData, setFormData] = useState({
    project: '',
    translationKey: '',
    englishText: '',
  });
  const [translations, setTranslations] = useState<TranslationData>({
    de: '',
    es: '',
    pt: '',
    nl: '',
    fr: '',
    it: '',
    da: '',
    el: '',
    pl: '',
    no: '',
    sv: '',
  });
  const [isTranslationsCollapsed, setIsTranslationsCollapsed] = useState(true);
  const [hasGeneratedTranslations, setHasGeneratedTranslations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const projects = [
    'Holidu Web',
    'Mobile',
    'Backend',
    'Admin',
    'API',
    'CMS'
  ];

  // Mock existing translation keys (in real app, this would come from API)
  const existingKeys = [
    { key: 'DETAIL_MULTI_RATE_CANCELLATION_OPTIONS_AVAILABLE', project: 'Holidu Web' },
    { key: 'DETAIL_MULTI_RATE_BOARD_TYPE_OPTIONS_AVAILABLE', project: 'Mobile' },
    { key: 'LIST_SMART_SEARCH_TITLE', project: 'Backend' },
    { key: 'BOOKING_CONFIRMATION_TITLE', project: 'Holidu Web' },
    { key: 'PAYMENT_SUCCESS_MESSAGE', project: 'Mobile' },
  ];

  const languageLabels: Record<keyof TranslationData, string> = {
    de: 'German',
    es: 'Spanish',
    pt: 'Portuguese',
    nl: 'Dutch',
    fr: 'French',
    it: 'Italian',
    da: 'Danish',
    el: 'Greek',
    pl: 'Polish',
    no: 'Norwegian',
    sv: 'Swedish',
  };

  const validateTranslationKey = (key: string, project: string) => {
    if (!key || !project) {
      setKeyError('');
      return;
    }

    const duplicate = existingKeys.find(existing => 
      existing.key.toLowerCase() === key.toLowerCase() && 
      existing.project === project
    );

    if (duplicate) {
      setKeyError(`This key already exists in the ${project} project`);
    } else {
      setKeyError('');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate translation key when it changes or when project changes
    if (field === 'translationKey') {
      validateTranslationKey(value, formData.project);
    } else if (field === 'project') {
      validateTranslationKey(formData.translationKey, value);
    }
  };

  const handleTranslationChange = (lang: keyof TranslationData, value: string) => {
    setTranslations(prev => ({ ...prev, [lang]: value }));
  };

  const generateTranslations = async () => {
    if (!formData.englishText) return;
    
    setIsSubmitting(true);
    
    // Simulate API call for auto-translation
    setTimeout(() => {
      const mockTranslations: TranslationData = {
        de: `[DE] ${formData.englishText}`,
        es: `[ES] ${formData.englishText}`,
        pt: `[PT] ${formData.englishText}`,
        nl: `[NL] ${formData.englishText}`,
        fr: `[FR] ${formData.englishText}`,
        it: `[IT] ${formData.englishText}`,
        da: `[DA] ${formData.englishText}`,
        el: `[EL] ${formData.englishText}`,
        pl: `[PL] ${formData.englishText}`,
        no: `[NO] ${formData.englishText}`,
        sv: `[SV] ${formData.englishText}`,
      };
      
      setTranslations(mockTranslations);
      setHasGeneratedTranslations(true);
      setIsSubmitting(false);
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      project: '',
      translationKey: '',
      englishText: '',
    });
    setTranslations({
      de: '',
      es: '',
      pt: '',
      nl: '',
      fr: '',
      it: '',
      da: '',
      el: '',
      pl: '',
      no: '',
      sv: '',
    });
    setIsTranslationsCollapsed(true);
    setHasGeneratedTranslations(false);
    setKeyError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if there's a key error
    if (keyError) {
      return;
    }
    
    console.log('Submitting translation:', { ...formData, translations });
    
    // Show success modal and reset form
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetForm();
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Create New Translation</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                value={formData.project}
                onChange={(e) => handleInputChange('project', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            {/* Translation Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Translation Key *
              </label>
              <input
                type="text"
                value={formData.translationKey}
                onChange={(e) => handleInputChange('translationKey', e.target.value)}
                placeholder="LIST_SMART_SEARCH_TITLE"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  keyError 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {keyError && (
                <p className="mt-1 text-sm text-red-600">
                  {keyError}
                </p>
              )}
            </div>

            {/* English Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Text *
              </label>
              <textarea
                value={formData.englishText}
                onChange={(e) => handleInputChange('englishText', e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the English text..."
              />
              <button
                type="button"
                onClick={generateTranslations}
                disabled={!formData.englishText || isSubmitting}
                className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Generating...' : 'Auto-generate Translations'}
              </button>
            </div>

            {/* Auto-generated Translations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Translations
                </label>
                {hasGeneratedTranslations && (
                  <button
                    type="button"
                    onClick={() => setIsTranslationsCollapsed(!isTranslationsCollapsed)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    {isTranslationsCollapsed ? (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show Translations
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Hide Translations
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {!isTranslationsCollapsed && hasGeneratedTranslations && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                  {Object.entries(translations).map(([lang, value]) => (
                    <div key={lang}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {languageLabels[lang as keyof TranslationData]} ({lang})
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleTranslationChange(lang as keyof TranslationData, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!!keyError}
                className={`px-6 py-2 rounded-md flex items-center ${
                  keyError
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Translation
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center text-green-700">
                <CheckCircle className="w-6 h-6 mr-2" />
                Success!
              </h3>
              <button onClick={handleSuccessModalClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Translation key "{formData.translationKey}" has been created successfully!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                You can now create another translation key.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleSuccessModalClose}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};