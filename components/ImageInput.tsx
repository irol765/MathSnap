import React, { useRef, useState } from 'react';
import { Icons } from './Icon';
import { Language } from '../types';

interface ImageInputProps {
  onImageSelected: (file: File) => void;
  isProcessing: boolean;
  lang: Language;
}

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSelected, isProcessing, lang }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const t = {
    en: {
      title: "Add a Math Problem",
      subtitle: "Select from Photo Library or Take Photo",
      dragText: "or drag an image here",
      poweredBy: "Powered by Gemini 3 Pro"
    },
    zh: {
      title: "添加数学题目",
      subtitle: "从相册选择或直接拍照",
      dragText: "或者将图片拖放到此处",
      poweredBy: "由 Gemini 3 Pro 驱动"
    }
  };

  const text = t[lang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  };

  const triggerSelect = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        type="file"
        accept="image/*"
        // Removing 'capture' attribute allows the OS (iOS/Android) to offer both "Take Photo" and "Photo Library" options.
        // This is the standard behavior for modern mobile browsers.
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div 
        className={`
          relative group cursor-pointer 
          bg-white rounded-2xl shadow-lg border-2 border-dashed 
          transition-all duration-300 ease-in-out
          flex flex-col items-center justify-center
          h-72 md:h-80 w-full overflow-hidden select-none tap-highlight-transparent
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 active:bg-slate-100'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerSelect}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        
        <div className="z-10 flex flex-col items-center p-6 text-center transform transition-transform group-hover:scale-105 group-active:scale-95">
          <div className="bg-indigo-100 p-5 rounded-full mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
            <Icons.Camera className="w-10 h-10" />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            {text.title}
          </h3>
          <p className="text-slate-500 text-sm max-w-[220px] mb-2 leading-relaxed">
            {text.subtitle}
          </p>
          <p className="text-slate-400 text-xs hidden md:block mt-1">
            {text.dragText}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 text-slate-300">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
          {text.poweredBy}
        </p>
      </div>
    </div>
  );
};