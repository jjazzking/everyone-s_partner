import React, { useState } from 'react';
import { 
  ReviewComment, 
  AddressabilityType, 
  ReviewerLevel, 
  SeverityLevel 
} from '../types';
import { ExcelReviewSheet } from './ExcelReviewSheet';
import { CommentCardView } from './CommentCardView';
import { 
  Sparkles, 
  Table, 
  LayoutGrid, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Layers,
  ArrowUpDown,
  Download,
  Info
} from 'lucide-react';

interface ReviewResultsDashboardProps {
  comments: ReviewComment[];
  onSelectComment: (comment: ReviewComment) => void;
  onUpdateStatus: (id: string, status: ReviewComment['userStatus']) => void;
  onRateBlind: (id: string, rating: number) => void;
  onExport: () => void;
}

export const ReviewResultsDashboard: React.FC<ReviewResultsDashboardProps> = ({
  comments,
  onSelectComment,
  onUpdateStatus,
  onRateBlind,
  onExport,
}) => {
  const [viewMode, setViewMode] = useState<'excel' | 'cards'>('excel');
  const [searchQuery, setSearchQuery] = useState('');
  const [addressabilityFilter, setAddressabilityFilter] = useState<string>('ALL');
  const [reviewerFilter, setReviewerFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  // Filtered comments
  const filteredComments = comments.filter((c) => {
    if (addressabilityFilter !== 'ALL' && c.addressability !== addressabilityFilter) {
      return false;
    }
    if (reviewerFilter !== 'ALL' && c.reviewerLevel !== reviewerFilter) {
      return false;
    }
    if (severityFilter !== 'ALL' && c.severity !== severityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.predictedComment.toLowerCase().includes(q) ||
        c.quotedAnchor.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        c.sourceLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Metrics
  const totalCount = comments.length;
  const docAddressableCount = comments.filter((c) => c.addressability === 'DOC_ADDRESSABLE').length;
  const procedureDirectiveCount = comments.filter((c) => c.addressability === 'PROCEDURE_DIRECTIVE').length;
  const blockerCount = comments.filter((c) => c.severity === 'BLOCKER').length;
  const seniorCount = comments.filter((c) => c.reviewerLevel === 'SENIOR_EM_EP').length;
  const managerCount = comments.filter((c) => c.reviewerLevel === 'MANAGER').length;
  const juniorCount = comments.filter((c) => c.reviewerLevel === 'JUNIOR').length;

  const crossDocCount = comments.filter((c) => c.defectType === 'TIE_CROSSDOC').length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Total Predicted */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">총 예상 리뷰 질문</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalCount}</span>
            <span className="text-xs text-slate-400">건 예측됨</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>최빈 패턴: 별도-연결 대사 ({crossDocCount}건)</span>
          </div>
        </div>

        {/* Metric 2: DOC_ADDRESSABLE Ratio */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">DOC 도출가능 (재현율 모수)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {totalCount > 0 ? Math.round((docAddressableCount / totalCount) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-400">
              ({docAddressableCount}/{totalCount}건)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            초안 텍스트·수치로 100% 도달 가능
          </div>
        </div>

        {/* Metric 3: PROCEDURE_DIRECTIVE Ratio */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">조서/절차 지시 (구조적 한계)</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-400 font-mono">
              {procedureDirectiveCount}
            </span>
            <span className="text-xs text-slate-400">건 (상한선 영역)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            품질관리(OC)·그룹감사·조서 요구
          </div>
        </div>

        {/* Metric 4: Blocker Severity */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">발행 저지 (Blocker)</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-mono">{blockerCount}</span>
            <span className="text-xs text-slate-400">건 중요 지적</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-400/80 font-medium">
            미해결 시 결재 불가 사항
          </div>
        </div>

        {/* Metric 5: Senior Persona */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">직급 계층별 분포</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <div className="text-rose-300 font-bold">EP: {seniorCount}</div>
            <div className="text-amber-300 font-bold">M: {managerCount}</div>
            <div className="text-blue-300 font-bold">Jr: {juniorCount}</div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            문체 기반 자동 분리 완료
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & View Switcher */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="코멘트, 인용 원문, 계정명 검색..."
            className="bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Addressability */}
          <select
            value={addressabilityFilter}
            onChange={(e) => setAddressabilityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">전체 최상위 분기</option>
            <option value="DOC_ADDRESSABLE">DOC 도출가능만</option>
            <option value="PROCEDURE_DIRECTIVE">절차/조서 지시만</option>
          </select>

          {/* Reviewer Level */}
          <select
            value={reviewerFilter}
            onChange={(e) => setReviewerFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">전체 리뷰 계층</option>
            <option value="SENIOR_EM_EP">EP·EM 파트너 (축약 명령형)</option>
            <option value="MANAGER">매니저 (Q. 질문형)</option>
            <option value="JUNIOR">주니어 (경어체 제안형)</option>
          </select>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">전체 심각도</option>
            <option value="BLOCKER">발행 저지 (Blocker)</option>
            <option value="REWORK">재작업 필요 (Rework)</option>
            <option value="TRIVIAL">단순 수정 (Trivial)</option>
          </select>

          {/* View Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 ml-1">
            <button
              onClick={() => setViewMode('excel')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold transition ${
                viewMode === 'excel'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="감사필드 엑셀 시트 뷰"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">엑셀 시트</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 font-semibold transition ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="카드 뷰"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">카드 뷰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Results View */}
      {filteredComments.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Info className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-300 mb-1">
            조건에 일치하는 리뷰 질문이 없습니다
          </h4>
          <p className="text-xs text-slate-500">
            필터 조건을 변경하거나 상단에서 리뷰 예측을 다시 실행해주세요.
          </p>
        </div>
      ) : viewMode === 'excel' ? (
        <ExcelReviewSheet
          comments={filteredComments}
          onSelectComment={onSelectComment}
          onUpdateStatus={onUpdateStatus}
          onRateBlind={onRateBlind}
        />
      ) : (
        <CommentCardView
          comments={filteredComments}
          onSelectComment={onSelectComment}
          onUpdateStatus={onUpdateStatus}
        />
      )}
    </div>
  );
};
