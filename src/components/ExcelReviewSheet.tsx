import React from 'react';
import { 
  ReviewComment, 
  AddressabilityType, 
  ReviewerLevel, 
  SeverityLevel 
} from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Bot,
  UserCheck,
  Building,
  Quote
} from 'lucide-react';

interface ExcelReviewSheetProps {
  comments: ReviewComment[];
  onSelectComment: (comment: ReviewComment) => void;
  onUpdateStatus: (id: string, status: ReviewComment['userStatus']) => void;
  onRateBlind: (id: string, rating: number) => void;
}

export const ExcelReviewSheet: React.FC<ExcelReviewSheetProps> = ({
  comments,
  onSelectComment,
  onUpdateStatus,
  onRateBlind,
}) => {
  const getAddressabilityBadge = (type: AddressabilityType) => {
    if (type === 'DOC_ADDRESSABLE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          DOC 도출가능
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
        절차/조서 지시
      </span>
    );
  };

  const getReviewerBadge = (level: ReviewerLevel) => {
    switch (level) {
      case 'SENIOR_EM_EP':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30" title="EM·EP 파트너: 극단적 축약, 고밀도 질문/명령형">
            EP·EM 파트너
          </span>
        );
      case 'MANAGER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30" title="매니저: Q. 질문형, 계정·변동 분석">
            매니저 (Manager)
          </span>
        );
      case 'JUNIOR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30" title="주니어: 경어체 제안형, 표기·서식 중심">
            주니어 (Staff)
          </span>
        );
    }
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 'BLOCKER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
            <AlertOctagon className="w-3.5 h-3.5" />
            발행 저지
          </span>
        );
      case 'REWORK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            재작업 필요
          </span>
        );
      case 'TRIVIAL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
            단순 수정
          </span>
        );
    }
  };

  const getDefectTypeLabel = (defect: string) => {
    const map: Record<string, string> = {
      TIE_CROSSDOC: '별도-연결 대사',
      TIE_INTRADOC: '문서 내 대사',
      TIE_SOURCE: '조서·TB 대사',
      LOGIC_EVIDENCE_GAP: '변동 미설명(AR)',
      NORM_COMPLIANCE: '기준서·공시서식',
      JUDGMENT_TREAT: '회계처리 판단',
      SCOPE_REDUCTION: '공시범위 축소',
      EDITORIAL: '표기 일관성',
      RISK_EXPOSURE: '규제·리스크',
    };
    return map[defect] || defect;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
            <th className="py-3 px-3 w-12 text-center">No.</th>
            <th className="py-3 px-3 w-28">최상위 분기</th>
            <th className="py-3 px-3 w-28">결함 유형</th>
            <th className="py-3 px-3 w-28">주제 / 계정</th>
            <th className="py-3 px-3 w-28">추정 계층</th>
            <th className="py-3 px-3 w-24">심각도</th>
            <th className="py-3 px-4 min-w-[340px]">
              예측 리뷰 질문 / 코멘트 (원문 인용 포함)
            </th>
            <th className="py-3 px-3 min-w-[200px]">작성자 사전 대응 가이드</th>
            <th className="py-3 px-3 w-24 text-center">확신도</th>
            <th className="py-3 px-3 w-28 text-center">FU 시뮬레이션</th>
            <th className="py-3 px-3 w-24 text-center">상태</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-800/80 font-sans">
          {comments.map((comment, index) => {
            const isBlocker = comment.severity === 'BLOCKER';
            return (
              <tr
                key={comment.id}
                className={`hover:bg-slate-900/80 transition cursor-pointer group ${
                  comment.userStatus === 'RESOLVED'
                    ? 'opacity-60 bg-slate-950'
                    : isBlocker
                    ? 'bg-rose-950/10'
                    : ''
                }`}
                onClick={() => onSelectComment(comment)}
              >
                {/* Index No. */}
                <td className="py-3.5 px-3 text-center font-mono text-slate-500 font-semibold">
                  {String(index + 1).padStart(2, '0')}
                </td>

                {/* Top Partition (DOC vs PROCEDURE) */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {getAddressabilityBadge(comment.addressability)}
                </td>

                {/* Defect Type */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className="font-semibold text-slate-200">
                    {getDefectTypeLabel(comment.defectType)}
                  </span>
                  <div className="text-[10px] font-mono text-indigo-400/80">
                    {comment.detector}
                  </div>
                </td>

                {/* Topic */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                    {comment.topic}
                  </span>
                </td>

                {/* Reviewer Level / Tone */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {getReviewerBadge(comment.reviewerLevel)}
                </td>

                {/* Severity */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  {getSeverityBadge(comment.severity)}
                </td>

                {/* Predicted Review Question & Quoted Text */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-slate-100 group-hover:text-indigo-300 transition text-[13px] leading-snug">
                      {comment.predictedComment}
                    </p>
                    
                    {/* Mandatory Quoted Anchor */}
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-400 bg-slate-900/90 rounded p-1.5 border border-slate-800">
                      <Quote className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                      <span className="font-mono text-slate-300 italic truncate max-w-[420px]" title={comment.quotedAnchor}>
                        {comment.quotedAnchor}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>위치: <strong className="text-slate-400">{comment.sourceLocation}</strong></span>
                    </div>
                  </div>
                </td>

                {/* Drafter Prep Guide */}
                <td className="py-3.5 px-3 text-slate-300 text-[11px] leading-relaxed">
                  <div className="line-clamp-2" title={comment.drafterActionGuide}>
                    {comment.drafterActionGuide}
                  </div>
                </td>

                {/* Confidence */}
                <td className="py-3.5 px-3 text-center font-mono">
                  <span className="font-bold text-indigo-400">
                    {Math.round(comment.confidence * 100)}%
                  </span>
                </td>

                {/* FU Dialog Trigger */}
                <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectComment(comment)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>대화 검증</span>
                  </button>
                </td>

                {/* Status Dropdown */}
                <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={comment.userStatus || 'PENDING'}
                    onChange={(e) =>
                      onUpdateStatus(comment.id, e.target.value as ReviewComment['userStatus'])
                    }
                    className={`text-[11px] font-bold rounded px-2 py-1 focus:outline-none border cursor-pointer ${
                      comment.userStatus === 'RESOLVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : comment.userStatus === 'ACCEPTED'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : comment.userStatus === 'REJECTED'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    <option value="PENDING" className="bg-slate-900 text-amber-300">대기 (Pending)</option>
                    <option value="ACCEPTED" className="bg-slate-900 text-blue-300">반영 (Accepted)</option>
                    <option value="RESOLVED" className="bg-slate-900 text-emerald-300">해결 (Resolved)</option>
                    <option value="REJECTED" className="bg-slate-900 text-slate-400">기각 (Rejected)</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
