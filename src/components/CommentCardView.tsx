import React from 'react';
import { 
  ReviewComment, 
  AddressabilityType, 
  ReviewerLevel, 
  SeverityLevel 
} from '../types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  MessageSquare, 
  Quote, 
  CheckCircle, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CommentCardViewProps {
  comments: ReviewComment[];
  onSelectComment: (comment: ReviewComment) => void;
  onUpdateStatus: (id: string, status: ReviewComment['userStatus']) => void;
}

export const CommentCardView: React.FC<CommentCardViewProps> = ({
  comments,
  onSelectComment,
  onUpdateStatus,
}) => {
  const getReviewerBadge = (level: ReviewerLevel) => {
    switch (level) {
      case 'SENIOR_EM_EP':
        return {
          label: 'EP·EM 파트너',
          class: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        };
      case 'MANAGER':
        return {
          label: '매니저 (Manager)',
          class: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      case 'JUNIOR':
        return {
          label: '주니어 (Staff)',
          class: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        };
    }
  };

  const getDefectLabel = (defect: string) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {comments.map((c) => {
        const reviewer = getReviewerBadge(c.reviewerLevel);
        const isBlocker = c.severity === 'BLOCKER';
        const isAddressable = c.addressability === 'DOC_ADDRESSABLE';

        return (
          <div
            key={c.id}
            onClick={() => onSelectComment(c)}
            className={`rounded-xl border p-4 flex flex-col justify-between transition hover:shadow-xl hover:border-indigo-500/80 cursor-pointer bg-slate-900/80 ${
              isBlocker
                ? 'border-rose-900/60 ring-1 ring-rose-500/20'
                : 'border-slate-800'
            }`}
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isAddressable
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    {isAddressable ? 'DOC 도출가능' : '절차/조서 지시'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${reviewer.class}`}
                  >
                    {reviewer.label}
                  </span>
                </div>

                <span className="text-xs font-mono font-bold text-indigo-400">
                  {Math.round(c.confidence * 100)}%
                </span>
              </div>

              {/* Defect Type and Topic */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold text-slate-200">
                  {getDefectLabel(c.defectType)}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[11px] text-slate-300">
                  {c.topic}
                </span>
              </div>

              {/* Predicted Comment Headline */}
              <h4 className="text-sm font-bold text-slate-100 mb-3 leading-snug group-hover:text-indigo-300">
                {c.predictedComment}
              </h4>

              {/* Quoted Anchor */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 mb-3 text-xs flex items-start gap-1.5 text-slate-300 font-mono">
                <Quote className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2 italic text-[11px] leading-relaxed">
                  {c.quotedAnchor}
                </span>
              </div>

              {/* Drafter Prep Action Guide */}
              <div className="text-xs text-slate-300 bg-indigo-950/30 border border-indigo-900/40 rounded-lg p-2.5 mb-3">
                <strong className="text-indigo-300 block mb-1 text-[11px]">
                  💡 작성자 사전 대응 가이드:
                </strong>
                <p className="line-clamp-2 text-[11px] leading-relaxed">
                  {c.drafterActionGuide}
                </p>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                {c.sourceLocation}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComment(c);
                }}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <span>상세 & FU 대화</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
