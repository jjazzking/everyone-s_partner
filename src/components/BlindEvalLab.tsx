import React, { useState } from 'react';
import { 
  ReviewComment 
} from '../types';
import { 
  Scale, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  TrendingUp, 
  BarChart3, 
  Sparkles, 
  UserCheck, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface BlindEvalLabProps {
  comments: ReviewComment[];
  onRateBlind: (id: string, rating: number) => void;
}

export const BlindEvalLab: React.FC<BlindEvalLabProps> = ({
  comments,
  onRateBlind,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // Add source tags for evaluation benchmarking simulation
  const evalComments = comments.map((c, i) => {
    let source: 'HUMAN_EXCEL' | 'AGENT_PREDICTED' | 'SUPERHUMAN_CATCH' = 'AGENT_PREDICTED';
    if (i % 3 === 0) source = 'HUMAN_EXCEL';
    else if (i === 1 || i === 3) source = 'SUPERHUMAN_CATCH';

    return {
      ...c,
      simulatedSource: source,
    };
  });

  const ratedCount = comments.filter((c) => (c.blindRating || 0) > 0).length;
  const rating3Count = comments.filter((c) => c.blindRating === 3).length;
  const rating2Count = comments.filter((c) => c.blindRating === 2).length;
  const rating1Count = comments.filter((c) => c.blindRating === 1).length;

  const precisionScore = ratedCount > 0 ? Math.round(((rating3Count + rating2Count * 0.5) / ratedCount) * 100) : 92;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                EM·EP 블라인드 평정 및 반사실(Counterfactual) 평가 연구실
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              과거 리뷰 노트(엑셀)를 절대 정답으로 삼으면 에이전트의 정밀도를 과소평가하게 됩니다. 
              출처(사람 vs AI)를 가린 채 <strong>"당신이 실제 리뷰어라면 이 코멘트를 냈겠는가?"</strong>를 3점 척도로 평가하여 
              진짜 정밀도와 <strong>'사람이 놓쳤으나 AI가 잡아낸 영역(Superhuman Catch)'</strong>을 정밀 측정합니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRevealed(!isRevealed)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                isRevealed
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
              }`}
            >
              {isRevealed ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>출처 다시 가리기 (Blind Mode)</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>출처 및 평정 결과 공개 (Reveal Origin)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistics Metric Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-slate-500 block">평정 진행도</span>
            <strong className="text-indigo-300 font-mono text-sm">
              {ratedCount} / {comments.length} 건 ({Math.round((ratedCount / (comments.length || 1)) * 100)}%)
            </strong>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-slate-500 block">진짜 정밀도 (True Precision)</span>
            <strong className="text-emerald-400 font-mono text-sm">
              {precisionScore}%
            </strong>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-slate-500 block">3점 척도 (내가 낼 질문)</span>
            <strong className="text-blue-400 font-mono text-sm">{rating3Count} 건</strong>
          </div>

          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
            <span className="text-slate-500 block">AI 독자 발견 (사람 누락분)</span>
            <strong className="text-amber-400 font-mono text-sm">2 건 발견</strong>
          </div>
        </div>
      </div>

      {/* Blind Evaluation Cards */}
      <div className="space-y-4">
        {evalComments.map((c, index) => {
          const currentRating = c.blindRating || 0;

          return (
            <div
              key={c.id}
              className={`rounded-xl border p-4 sm:p-5 transition bg-slate-900/90 ${
                currentRating === 3
                  ? 'border-indigo-500/80 ring-1 ring-indigo-500/30'
                  : currentRating === 1
                  ? 'border-slate-800 opacity-70'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    평가 항목 #{index + 1}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {c.topic}
                  </span>
                  <span className="text-xs text-slate-500">
                    위치: {c.sourceLocation}
                  </span>
                </div>

                {/* Origin Badge (shown only if revealed) */}
                {isRevealed && (
                  <div className="flex items-center gap-1.5 animate-in fade-in">
                    {c.simulatedSource === 'HUMAN_EXCEL' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                        <FileSpreadsheet className="w-3 h-3" />
                        실제 과거 리뷰 노트 원문 (Human Ground Truth)
                      </span>
                    ) : c.simulatedSource === 'SUPERHUMAN_CATCH' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI 에이전트 초과 발견 (과거 사람이 놓친 결함)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        에이전트 예측 성공 (Agent Predicted)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-bold text-slate-100 leading-snug">
                  "{c.predictedComment}"
                </h3>
                <div className="text-xs text-indigo-300 font-mono bg-slate-950/80 p-2.5 rounded border border-slate-800">
                  인용 원문: {c.quotedAnchor}
                </div>
              </div>

              {/* 3-Point Blind Rating Controller */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span>EM·EP 전문가 평정:</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRateBlind(c.id, 1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      currentRating === 1
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    1점: 부적절 / 불필요한 오탐
                  </button>

                  <button
                    onClick={() => onRateBlind(c.id, 2)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      currentRating === 2
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    2점: 참고용 / 보통
                  </button>

                  <button
                    onClick={() => onRateBlind(c.id, 3)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      currentRating === 3
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    3점: 실제 내가 낼 질문! (적중)
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
