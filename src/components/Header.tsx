import React from 'react';
import { 
  FileCheck2, 
  Sparkles, 
  SlidersHorizontal, 
  HelpCircle, 
  Download, 
  RefreshCw,
  FolderOpen,
  Scale,
  BrainCircuit,
  Lightbulb
} from 'lucide-react';
import { SamplePreset } from '../types';

interface HeaderProps {
  activeTab: 'workspace' | 'results' | 'blindEval' | 'insights';
  setActiveTab: (tab: 'workspace' | 'results' | 'blindEval' | 'insights') => void;
  confidenceThreshold: number;
  setConfidenceThreshold: (val: number) => void;
  presets: SamplePreset[];
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  isAnalyzing: boolean;
  onExport: () => void;
  resultCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  confidenceThreshold,
  setConfidenceThreshold,
  presets,
  selectedPresetId,
  onSelectPreset,
  isAnalyzing,
  onExport,
  resultCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <FileCheck2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                감사보고서 리뷰 에이전트
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  AI TFT PoC
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              "결함 탐지기가 아닌 질문 예측기" — EM·EP·매니저 리뷰 암묵지 모델링
            </p>
          </div>
        </div>

        {/* Preset Selector & Confidence Tuning */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium">실무 샘플:</span>
            <select
              value={selectedPresetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">민감도:</span>
            <span className="font-semibold text-indigo-400">{Math.round(confidenceThreshold * 100)}%</span>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-16 accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              title="리뷰 코멘트 확신도(Confidence) 임계값 조정"
            />
          </div>

          {resultCount > 0 && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="리뷰 노트 엑셀 양식 내보내기"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>엑셀 내보내기</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between border-t border-slate-800/80 bg-slate-950/40">
        <nav className="flex space-x-1 sm:space-x-4">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'workspace'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>1. 초안 문서 입력 및 디텍터</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition relative ${
              activeTab === 'results'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. 예상 리뷰 코멘트 시트</span>
            {resultCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-indigo-600 text-white">
                {resultCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('blindEval')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'blindEval'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>3. 블라인드 평정 & 평가셋 연구실</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 flex items-center gap-2 transition ${
              activeTab === 'insights'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>4. PoC 관찰 결과 & 데이터 표준 제안</span>
          </button>
        </nav>

        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            D1~D4 병렬 디텍터 파이프라인 가동
          </span>
        </div>
      </div>
    </header>
  );
};
