import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, ExternalLink, Star, Trash2, Check } from 'lucide-react';
import { UIContent, Language } from '../types';
import { ODISHA_KVKS, KVK } from '../data/kvkOdisha';

interface KVKFinderProps {
  content: UIContent;
  lang: Language;
}

const KVKFinder: React.FC<KVKFinderProps> = ({ content, lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [savedDistrict, setSavedDistrict] = useState<string | null>(null);
  
  const isOdia = lang === Language.ODIA;

  useEffect(() => {
    const saved = localStorage.getItem('shasya_kvk_district');
    if (saved) {
      setSavedDistrict(saved);
    }
  }, []);

  const handleSave = (district: string) => {
    setSavedDistrict(district);
    localStorage.setItem('shasya_kvk_district', district);
  };

  const handleRemove = () => {
    setSavedDistrict(null);
    localStorage.removeItem('shasya_kvk_district');
  };

  const savedKVKData = savedDistrict ? ODISHA_KVKS.find(k => k.district === savedDistrict) : null;

  const filteredKVKs = ODISHA_KVKS.filter((kvk) => {
    const searchLower = searchTerm.toLowerCase();
    // Search by English district or Odia district
    return (
      kvk.district.toLowerCase().includes(searchLower) ||
      kvk.districtOdia.includes(searchTerm)
    );
  });

  const renderKVKCard = (kvk: KVK, isSavedView: boolean) => (
    <div key={kvk.district} className={`p-4 rounded-xl border shadow-sm transition-shadow ${isSavedView ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-yellow-100 hover:shadow-md'}`}>
        <div className="flex justify-between items-start">
            <h4 className={`font-bold text-lg text-emerald-900 mb-1 ${isOdia ? 'font-odia' : ''}`}>
                {kvk.name} ({isOdia ? kvk.districtOdia : kvk.district})
            </h4>
            {isSavedView ? (
                 <button 
                    onClick={handleRemove}
                    className="text-red-500 p-1 hover:bg-red-50 rounded"
                    title={content.remove}
                 >
                    <Trash2 className="w-5 h-5" />
                 </button>
            ) : (
                <button 
                    onClick={() => handleSave(kvk.district)}
                    className={`p-1 rounded transition-colors ${savedDistrict === kvk.district ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-500'}`}
                    title={content.save}
                    disabled={savedDistrict === kvk.district}
                >
                    <Star className={`w-6 h-6 ${savedDistrict === kvk.district ? 'fill-yellow-500' : ''}`} />
                </button>
            )}
        </div>
        
        <div className="space-y-2 text-sm text-slate-600 mt-2">
            <div className={`flex items-start gap-2 ${isOdia ? 'font-odia' : ''}`}>
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span>{isOdia ? kvk.addressOdia : kvk.address}</span>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-2">
                <a href={`tel:${kvk.phone}`} className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className={`font-semibold ${isOdia ? 'font-odia' : ''}`}>{content.callNow}: {kvk.phone}</span>
                </a>
                
                <a href={`mailto:${kvk.email}`} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>{kvk.email}</span>
                </a>
            </div>
        </div>
    </div>
  );

  return (
    <div className="bg-yellow-50 dark:bg-slate-800 p-6 rounded-2xl border border-yellow-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-6 h-6 text-yellow-700" />
        <h3 className={`text-xl font-bold text-yellow-800 ${isOdia ? 'font-odia' : ''}`}>
          {content.kvkContact}
        </h3>
      </div>

      {/* Saved Center Section */}
      {savedKVKData && (
          <div className="mb-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-2 text-emerald-800 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-emerald-800" />
                  <span className={isOdia ? 'font-odia' : ''}>{content.savedCenter}</span>
              </div>
              {renderKVKCard(savedKVKData, true)}
          </div>
      )}

      {/* Search Section */}
      <p className={`text-sm text-yellow-800 mb-4 ${isOdia ? 'font-odia' : ''}`}>
        {content.kvkSearchLabel}
      </p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-600" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={content.kvkSearchPlaceholder}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border border-yellow-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder:text-yellow-400 text-slate-800 ${isOdia ? 'font-odia' : ''}`}
        />
      </div>

      {/* Results List */}
      <div className="space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        {searchTerm.length > 0 ? (
          filteredKVKs.length > 0 ? (
            filteredKVKs.map((kvk) => {
                // Don't show the saved card again in the search list if it matches exactly? 
                // Actually, keep it but show it's selected.
                return renderKVKCard(kvk, false);
            })
          ) : (
            <div className={`text-center py-4 text-yellow-800 ${isOdia ? 'font-odia' : ''}`}>
              {content.noResults}
            </div>
          )
        ) : (
          <div className="text-center py-2 text-yellow-700/60 italic text-sm">
            {isOdia ? 'ସନ୍ଧାନ କରିବା ପାଇଁ ଟାଇପ୍ କରନ୍ତୁ...' : 'Type to search for centers...'}
          </div>
        )}
      </div>

      {/* External Link Fallback */}
      <div className="mt-4 pt-4 border-t border-yellow-200">
         <a 
            href="https://kvk.icar.gov.in/" 
            target="_blank" 
            rel="noreferrer"
            className={`flex items-center justify-center gap-2 text-yellow-800 hover:text-yellow-900 font-medium text-sm transition-colors ${isOdia ? 'font-odia' : ''}`}
        >
            <span>{content.kvkLinkText}</span>
            <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default KVKFinder;