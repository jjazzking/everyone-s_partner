import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  GitCompare, 
  History, 
  Play, 
  Sparkles, 
  Upload, 
  Trash2, 
  Info, 
  CheckCircle,
  Building2,
  Calendar,
  UserCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { DraftInputs } from '../types';
import { PipelineFlowVisualizer } from './PipelineFlowVisualizer';

interface DraftInputWorkspaceProps {
  draftInputs: DraftInputs;
  setDraftInputs: React.Dispatch<React.SetStateAction<DraftInputs>>;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export const DraftInputWorkspace: React.FC<DraftInputWorkspaceProps> = ({
  draftInputs,
  setDraftInputs,
  onRunAnalysis,
  isAnalyzing,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sep_cons' | 'review_report' | 'prior_notes'>('sep_cons');

  const handleInputChange = (field: keyof Omit<DraftInputs, 'engagementInfo'>, value: string) => {
    setDraftInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (field: keyof Omit<DraftInputs, 'engagementInfo'>, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleInputChange(field, content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Engagement Context Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">대상 회사:</span>
            <input
              type="text"
              value={draftInputs.engagementInfo.clientName}
              onChange={(e) =>
                setDraftInputs((prev) => ({
                  ...prev,
                  engagementInfo: { ...prev.engagementInfo, clientName: e.target.value },
                }))
              }
              className="bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">보고 기간:</span>
            <input
              type="text"
              value={draftInputs.engagementInfo.period}
              onChange={(e) =>
                setDraftInputs((prev) => ({
                  ...prev,
                  engagementInfo: { ...prev.engagementInfo, period: e.target.value },
                }))
              }
              className="bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">작성자:</span>
            <input
              type="text"
              value={draftInputs.engagementInfo.drafterSeniority}
              onChange={(e) =>
                setDraftInputs((prev) => ({
                  ...prev,
                  engagementInfo: { ...prev.engagementInfo, drafterSeniority: e.target.value },
                }))
              }
              className="bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">감사 구분:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-medium border border-amber-500/20">
              {draftInputs.engagementInfo.auditType}
            </span>
          </div>
        </div>

        {/* Big Action Button */}
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-xl transition transform active:scale-95 ${
            isAnalyzing
              ? 'bg-indigo-600/50 cursor-wait'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-600/30'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>D1~D4 리뷰 에이전트 분석 중...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>예상 리뷰 예측 실행 (Run Review Agent)</span>
            </>
          )}
        </button>
      </div>

      {/* Architecture Pipeline Visualizer */}
      <PipelineFlowVisualizer isAnalyzing={isAnalyzing} />

      {/* Draft Document Sub-navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('sep_cons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSubTab === 'sep_cons'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>별도 vs 연결 주석 대조 입력 (D1 핵심)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('review_report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSubTab === 'review_report'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>검토보고서 본문 초안</span>
          </button>

          <button
            onClick={() => setActiveSubTab('prior_notes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSubTab === 'prior_notes'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>전분기 리뷰 노트 / 체크리스트 (D4)</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>텍스트를 직접 수정하거나 실무 샘플을 불러올 수 있습니다.</span>
        </div>
      </div>

      {/* Main Document Input Area */}
      {activeSubTab === 'sep_cons' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Separate Notes Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  별도 재무제표 및 주석 초안 (Separate Notes)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>로드</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json"
                    onChange={(e) => handleFileUpload('separateNotesDraft', e)}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => handleInputChange('separateNotesDraft', '')}
                  className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-0.5"
                  title="내용 비우기"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <textarea
              value={draftInputs.separateNotesDraft}
              onChange={(e) => handleInputChange('separateNotesDraft', e.target.value)}
              placeholder="별도 재무상태표, 손익계산서 및 주석 텍스트를 입력하세요..."
              className="w-full flex-1 bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed selection:bg-indigo-500/30"
              spellCheck={false}
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>글자수: {draftInputs.separateNotesDraft.length.toLocaleString()} 자</span>
              <span className="text-blue-400/80 font-medium">별도 법인 고유 주석 및 계정</span>
            </div>
          </div>

          {/* Consolidated Notes Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  연결 재무제표 및 주석 초안 (Consolidated Notes)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>로드</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json"
                    onChange={(e) => handleFileUpload('consolidatedNotesDraft', e)}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => handleInputChange('consolidatedNotesDraft', '')}
                  className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-0.5"
                  title="내용 비우기"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <textarea
              value={draftInputs.consolidatedNotesDraft}
              onChange={(e) => handleInputChange('consolidatedNotesDraft', e.target.value)}
              placeholder="연결 재무상태표, 손익계산서 및 연결 주석 텍스트를 입력하세요..."
              className="w-full flex-1 bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed selection:bg-indigo-500/30"
              spellCheck={false}
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>글자수: {draftInputs.consolidatedNotesDraft.length.toLocaleString()} 자</span>
              <span className="text-indigo-400/80 font-medium">연결조정 및 종속기업 통합 주석</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'review_report' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                분기/반기 검토보고서 본문 (Review Report Body)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>로드</span>
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={(e) => handleFileUpload('reviewReportDraft', e)}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => handleInputChange('reviewReportDraft', '')}
                className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-0.5"
                title="내용 비우기"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <textarea
            value={draftInputs.reviewReportDraft}
            onChange={(e) => handleInputChange('reviewReportDraft', e.target.value)}
            placeholder="검토의견, 강조사항, 기준서(K-IFRS 제1034호) 문단 등 검토보고서 본문을 입력하세요..."
            className="w-full flex-1 bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            spellCheck={false}
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>글자수: {draftInputs.reviewReportDraft.length.toLocaleString()} 자</span>
            <span className="text-emerald-400/80 font-medium">감사인 발행 문서 (서술 및 강조사항)</span>
          </div>
        </div>
      )}

      {activeSubTab === 'prior_notes' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                전분기 리뷰 노트 및 반복 점검 체크리스트 (D4 Detector)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>로드</span>
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={(e) => handleFileUpload('priorQuarterNotes', e)}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => handleInputChange('priorQuarterNotes', '')}
                className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-0.5"
                title="내용 비우기"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <textarea
            value={draftInputs.priorQuarterNotes}
            onChange={(e) => handleInputChange('priorQuarterNotes', e.target.value)}
            placeholder="전분기 리뷰 노트 엑셀 내용이나 '매번 반복되는 리뷰 사항'을 입력하세요..."
            className="w-full flex-1 bg-slate-950/90 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            spellCheck={false}
          />
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>글자수: {draftInputs.priorQuarterNotes.length.toLocaleString()} 자</span>
            <span className="text-amber-400/80 font-medium">D4 디텍터 필수 기준선 (반복 코멘트 적중)</span>
          </div>
        </div>
      )}
    </div>
  );
};
