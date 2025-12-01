import React, { useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { UIContent, Language } from '../types';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  content: UIContent;
  lang: Language;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, content, lang }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g. "data:image/jpeg;base64,") to get raw base64
      const base64Data = base64String.split(',')[1];
      onImageSelected(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const triggerGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={triggerCamera}
          className="flex flex-col items-center justify-center p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all active:scale-95 text-emerald-800"
        >
          <Camera className="w-10 h-10 mb-3 text-emerald-600" />
          <span className={`font-semibold ${lang === Language.ODIA ? 'font-odia text-lg' : ''}`}>
            {content.takePhoto}
          </span>
        </button>

        <button
          onClick={triggerGallery}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-95 text-slate-700"
        >
          <ImageIcon className="w-10 h-10 mb-3 text-slate-500" />
          <span className={`font-semibold ${lang === Language.ODIA ? 'font-odia text-lg' : ''}`}>
            {content.selectImage}
          </span>
        </button>
      </div>

      <div className="mt-8 text-center p-6 bg-yellow-50 rounded-lg border border-yellow-100">
        <h3 className={`text-yellow-800 font-medium mb-2 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
          {lang === Language.ENGLISH ? 'Tips for best results:' : 'ଭଲ ଫଳାଫଳ ପାଇଁ ପରାମର୍ଶ:'}
        </h3>
        <ul className={`text-sm text-yellow-700 space-y-1 ${lang === Language.ODIA ? 'font-odia' : ''}`}>
          <li>{lang === Language.ENGLISH ? '• Ensure good lighting' : '• ପର୍ଯ୍ୟାପ୍ତ ଆଲୋକରେ ଫଟୋ ନିଅନ୍ତୁ'}</li>
          <li>{lang === Language.ENGLISH ? '• Focus on the affected leaf area' : '• ରୋଗାକ୍ରାନ୍ତ ଅଂଶ ଉପରେ ଧ୍ୟାନ ଦିଅନ୍ତୁ'}</li>
          <li>{lang === Language.ENGLISH ? '• Hold the camera steady' : '• କ୍ୟାମେରା ସ୍ଥିର ରଖନ୍ତୁ'}</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploader;