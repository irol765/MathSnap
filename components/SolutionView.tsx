import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Icons } from './Icon';
import { Language } from '../types';

interface SolutionViewProps {
  markdown: string;
  onReset: () => void;
  lang: Language;
}

export const SolutionView: React.FC<SolutionViewProps> = ({ markdown, onReset, lang }) => {
  const t = {
    en: {
      header: "Tutor Solution",
      refreshLabel: "Solve another problem",
      promptNext: "Ready to try another one?",
      buttonNext: "Scan Next Problem"
    },
    zh: {
      header: "AI 导师解答",
      refreshLabel: "解答下一题",
      promptNext: "准备好尝试下一题了吗？",
      buttonNext: "拍摄下一题"
    }
  };

  const text = t[lang];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in-up">
      <div className="bg-indigo-600 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center text-white">
          <Icons.Book className="w-6 h-6 mr-2" />
          <h2 className="text-lg font-bold">{text.header}</h2>
        </div>
        <button
          onClick={onReset}
          className="text-white/80 hover:text-white hover:bg-indigo-700 p-2 rounded-full transition-colors"
          aria-label={text.refreshLabel}
        >
          <Icons.Refresh className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh]">
        <div className="markdown-body text-slate-800">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {markdown}
          </ReactMarkdown>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col items-center">
          <p className="text-slate-500 mb-4 text-sm text-center">
            {text.promptNext}
          </p>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 shadow-md"
          >
            <Icons.Camera className="w-5 h-5" />
            <span>{text.buttonNext}</span>
          </button>
        </div>
      </div>
    </div>
  );
};