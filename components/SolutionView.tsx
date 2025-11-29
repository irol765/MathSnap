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
      header: "Tutor Solution",
      refreshLabel: "Solve another problem",
      promptNext: "Ready to try another one?",
      buttonNext: "Scan Next Problem",
      quizTitle: "Test Your Knowledge",
      quizSubtitle: "Try this similar problem to see if you understood!",
      correct: "Correct!",
      incorrect: "Not quite. The correct answer is:",
      explanation: "Explanation:",
      selectOption: "Select an option:"
    },
    zh: {
      header: "AI 导师解答",
      refreshLabel: "解答下一题",
      promptNext: "准备好尝试下一题了吗？",
      buttonNext: "拍摄下一题",
      quizTitle: "互动测验",
      quizSubtitle: "尝试解答这道相似的题目，看看你学会了吗！",
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      
      {/* 1. Main Solution Card */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in-up">
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
        
        <div className="p-6 md:p-8 overflow-y-auto max-h-[60vh]">
          <div className="markdown-body text-slate-800">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {response.explanation}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* 2. Interactive Quiz Card */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
           <div className="flex items-center text-white">
             <div className="bg-white/20 p-1.5 rounded-lg mr-2">
                <Icons.Check className="w-5 h-5 text-white" />
             </div>
             <div>
               <h3 className="font-bold text-lg leading-tight">{text.quizTitle}</h3>
               <p className="text-indigo-100 text-xs opacity-90">{text.quizSubtitle}</p>
             </div>
           </div>
        </div>

        <div className="p-6">
          {/* Question */}
          <div className="markdown-body text-slate-800 mb-6 font-medium">
             <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
             >
               {response.quiz.question}
             </ReactMarkdown>
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
                btnClass += "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer";
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
                       ? "bg-slate-100 text-slate-500 border-slate-200 group-hover:bg-indigo-200 group-hover:text-indigo-700" 
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
                     {/* Render option with Markdown in case it has math */}
                     <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{p: ({children}) => <span>{children}</span>}}>
                       {option}
                     </ReactMarkdown>
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
            <div className={`rounded-xl p-5 border ${isCorrect ? "bg-green-50 border-green-200" : "bg-indigo-50 border-indigo-200"} animate-fade-in`}>
               <div className="flex items-start mb-2">
                 {isCorrect ? (
                   <div className="bg-green-100 p-1 rounded-full mr-2">
                     <Icons.Check className="w-4 h-4 text-green-700" />
                   </div>
                 ) : (
                   <div className="bg-indigo-100 p-1 rounded-full mr-2">
                     <Icons.Book className="w-4 h-4 text-indigo-700" />
                   </div>
                 )}
                 <div>
                   <h4 className={`font-bold ${isCorrect ? "text-green-800" : "text-indigo-900"}`}>
                     {isCorrect ? text.correct : `${text.incorrect} ${String.fromCharCode(65 + response.quiz.correctIndex)}`}
                   </h4>
                   <div className="text-slate-700 mt-2 text-sm leading-relaxed markdown-body">
                      <span className="font-bold text-slate-900 mr-1">{text.explanation}</span>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {response.quiz.explanation}
                      </ReactMarkdown>
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