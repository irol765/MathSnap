
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Icons } from './Icon';
import { Language, MathResponse } from '../types';

interface SolutionViewProps {
  response: MathResponse;
  onReset: () => void;
  lang: Language;
}

export const SolutionView: React.FC<SolutionViewProps> = ({ response, onReset, lang }) => {
  // State for the interactive quiz
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const t = {
    en: {
      block1Title: "The Answer",
      block2Title: "Detailed Analysis",
      block3Title: "Practice",
      block3Subtitle: "Test your understanding",
      refreshLabel: "Solve another",
      promptNext: "Ready to try another one?",
      buttonNext: "Scan Next Question",
      correct: "Correct!",
      incorrect: "Not quite. The correct answer is:",
      explanation: "Explanation:",
      selectOption: "Select an option:"
    },
    zh: {
      block1Title: "最终答案",
      block2Title: "详细解析",
      block3Title: "练一练",
      block3Subtitle: "巩固知识点",
      refreshLabel: "解答下一题",
      promptNext: "准备好尝试下一题了吗？",
      buttonNext: "拍摄下一题",
      correct: "回答正确！🎉",
      incorrect: "不太对哦。正确答案是：",
      explanation: "解析：",
      selectOption: "请选择一个选项："
    }
  };

  const text = t[lang];

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing after selection
    
    setSelectedOption(index);
    const correct = index === response.quiz.correctIndex;
    setIsCorrect(correct);
  };

  // Helper for rendering Markdown
  const MarkdownContent = ({ content }: { content: string }) => (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Customize styling if needed
        p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-7" {...props} />
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-20">
      
      {/* 1. The Answer Block */}
      <div className="bg-white rounded-2xl shadow-lg border-l-8 border-indigo-500 overflow-hidden animate-fade-in-up">
        <div className="p-5 md:p-6">
          <div className="flex items-center space-x-2 mb-3 text-indigo-600">
            <Icons.Lightbulb className="w-5 h-5" />
            <h2 className="font-bold uppercase tracking-wider text-sm">{text.block1Title}</h2>
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900 markdown-body bg-indigo-50/50 p-4 rounded-xl">
             <MarkdownContent content={response.answer} />
          </div>
        </div>
      </div>

      {/* 2. Detailed Explanation Block */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 flex items-center">
            <Icons.Book className="w-5 h-5 mr-2 text-slate-500" />
            <h2 className="font-bold text-slate-700">{text.block2Title}</h2>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="markdown-body text-slate-800">
            <MarkdownContent content={response.explanation} />
          </div>
        </div>
      </div>

      {/* 3. Practice / Quiz Block */}
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-purple-600 p-4 px-6 flex items-center justify-between text-white">
           <div className="flex items-center">
             <Icons.List className="w-5 h-5 mr-2" />
             <div>
               <h3 className="font-bold text-lg">{text.block3Title}</h3>
             </div>
           </div>
           <span className="text-xs bg-purple-500/50 px-2 py-1 rounded text-purple-100 hidden sm:inline-block">
             {text.block3Subtitle}
           </span>
        </div>

        <div className="p-6 md:p-8">
          {/* Question */}
          <div className="markdown-body text-slate-800 mb-6 font-medium text-lg">
             <MarkdownContent content={response.quiz.question} />
          </div>

          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {text.selectOption}
          </p>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {response.quiz.options.map((option, idx) => {
              let btnClass = "relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center group ";
              
              if (selectedOption === null) {
                // Default state
                btnClass += "border-slate-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer bg-white";
              } else {
                // Result state
                if (idx === response.quiz.correctIndex) {
                  // This is the correct answer
                  btnClass += "border-green-500 bg-green-50 text-green-900";
                } else if (idx === selectedOption) {
                  // This was selected but is wrong
                  btnClass += "border-red-500 bg-red-50 text-red-900";
                } else {
                  // Other unselected options
                  btnClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                  className={btnClass}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 border flex-shrink-0
                    ${selectedOption === null 
                       ? "bg-slate-100 text-slate-500 border-slate-200 group-hover:bg-purple-200 group-hover:text-purple-700" 
                       : idx === response.quiz.correctIndex 
                         ? "bg-green-500 text-white border-green-500"
                         : idx === selectedOption 
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-slate-100 text-slate-300 border-slate-200"
                    }
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1">
                     <MarkdownContent content={option} />
                  </span>
                  
                  {/* Status Icons */}
                  {selectedOption !== null && idx === response.quiz.correctIndex && (
                    <Icons.Check className="w-5 h-5 text-green-600 ml-2" />
                  )}
                  {selectedOption === idx && idx !== response.quiz.correctIndex && (
                    <div className="w-5 h-5 text-red-500 ml-2 font-bold">✕</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Section */}
          {selectedOption !== null && (
            <div className={`rounded-xl p-5 border ${isCorrect ? "bg-green-50 border-green-200" : "bg-purple-50 border-purple-200"} animate-fade-in`}>
               <div className="flex items-start mb-2">
                 {isCorrect ? (
                   <div className="bg-green-100 p-1 rounded-full mr-2 flex-shrink-0">
                     <Icons.Check className="w-4 h-4 text-green-700" />
                   </div>
                 ) : (
                   <div className="bg-purple-100 p-1 rounded-full mr-2 flex-shrink-0">
                     <Icons.Book className="w-4 h-4 text-purple-700" />
                   </div>
                 )}
                 <div>
                   <h4 className={`font-bold ${isCorrect ? "text-green-800" : "text-purple-900"}`}>
                     {isCorrect ? text.correct : `${text.incorrect} ${String.fromCharCode(65 + response.quiz.correctIndex)}`}
                   </h4>
                   <div className="text-slate-700 mt-2 text-sm leading-relaxed markdown-body">
                      <span className="font-bold text-slate-900 mr-1">{text.explanation}</span>
                      <MarkdownContent content={response.quiz.explanation} />
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-6 pb-4 flex flex-col items-center">
        <p className="text-slate-500 mb-4 text-sm text-center">
          {text.promptNext}
        </p>
        <button
          onClick={onReset}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <Icons.Camera className="w-5 h-5" />
          <span>{text.buttonNext}</span>
        </button>
      </div>

    </div>
  );
};
