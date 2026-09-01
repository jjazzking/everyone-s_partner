import React, { useState } from 'react';
import { 
  ReviewComment, 
  ReviewerLevel 
} from '../types';
import { 
  X, 
  Quote, 
  CheckCircle2, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle, 
  MessageSquare, 
  CheckCheck, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface CommentDetailModalProps {
  comment: ReviewComment | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ReviewComment['userStatus']) => void;
}

export const CommentDetailModal: React.FC<CommentDetailModalProps> = ({
  comment,
  onClose,
  onUpdateStatus,
}) => {
  if (!comment) return null;

  const [drafterInput, setDrafterInput] = useState('');
  const [isSendingFU, setIsSendingFU] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'drafter' | 'senior'; text: string }>>([
    {
      role: 'drafter',
      text: comment.simulatedFollowUp.drafterResponse,
    },
    {
      role: 'senior',
      text: comment.simulatedFollowUp.seniorVerdict,
    },
  ]);

  const handleSendFollowUp = async () => {
    if (!drafterInput.trim()) return;

    const userMsg = drafterInput.trim();
    setConversationHistory((prev) => [...prev, { role: 'drafter', text: userMsg }]);
    setDrafterInput('');
    setIsSendingFU(true);

    try {
      const res = await fetch('/api/review/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment,
          drafterReply: userMsg,
        }),
      });
      const data = await res.json();
      setConversationHistory((prev) => [
        ...prev,
        { role: 'senior', text: data.seniorVerdict || '확인하였습니다. 조서에 근거를 남겨주세요.' },
      ]);
    } catch (e) {
      setConversationHistory((prev) => [
        ...prev,
        { role: 'senior', text: '[EM 파트너]: 확인 완료. 조서 인덱스 링크 첨부 후 결재 올리세요.' },
      ]);
    } finally {
      setIsSendingFU(false);
    }
  };

  const getReviewerPersonaDescription = (level: ReviewerLevel) => {
    switch (level) {
      case 'SENIOR_EM_EP':
        return {
          role: 'EP (Engagement Partner) / EM (Manager)',
          style: '극단적 축약, 고밀도 질문/명령형 ("소송충당부채 왜 다름? 얼마?")',
          focus: '발행 저지 리스크, 감리 노출, 품질관리(OC) 방어 논리, 조서 링크',
        };
      case 'MANAGER':
        return {
          role: 'Manager / In-charge CPA',
          style: '주석명+페이지, Q. 번호 질문형, 완결 문장 ("Q1. 급증 사유는 무엇인가요?")',
          focus: '계정 간 변동 분석(AR), 별도-연결 정합성, 기준서 공시 서식 충족',
        };
      case 'JUNIOR':
        return {
          role: 'Staff / Junior CPA',
          style: '주석번호 위주, 경어체 제안형 ("~하는게 어떨까요?")',
          focus: '표기 일관성, 기간 표현, 단위 표기, 정식 사명',
        };
    }
  };

  const persona = getReviewerPersonaDescription(comment.reviewerLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {comment.id}
            </span>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>리뷰 심층 인스펙터 & FU 시뮬레이터</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Main Predicted Comment Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                예측된 리뷰어 코멘트 / 질문:
              </span>
              <span className="font-mono text-slate-400">
                위치: <strong>{comment.sourceLocation}</strong>
              </span>
            </div>
            <p className="text-base font-bold text-white leading-relaxed">
              "{comment.predictedComment}"
            </p>
          </div>

          {/* Reviewer Persona & Tone Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">리뷰어 계층</span>
              <strong className="text-indigo-300 font-bold">{persona.role}</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">문체 특징 (Tone Signature)</span>
              <span className="text-slate-300">{persona.style}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">주요 관심사 (Implicit Focus)</span>
              <span className="text-slate-300">{persona.focus}</span>
            </div>
          </div>

          {/* Quoted Anchor & Ground Truth Box */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-indigo-400" />
              <span>원문 인용 하이라이트 (Quoted Anchor — 환각 방지 필수)</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200 leading-relaxed">
              {comment.quotedAnchor}
            </div>
          </div>

          {/* Deductive Explanation Logic */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>왜 이 질문/지적이 나오는가? (Reviewer Logic & Background)</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {comment.explanation}
            </div>
          </div>

          {/* Drafter Action Guide */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>작성자 셀프체크 사전 대응 가이드 (Drafter Prep Checklist)</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed font-medium">
              {comment.drafterActionGuide}
            </div>
          </div>

          {/* FU & Additional Review Dialog Simulator (From Section 4 of Hand-off doc) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>FU(Follow-Up) & 추가리뷰 시뮬레이터 (판단 암묵지 발굴)</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                작성자 답변에 따른 상위자의 재지적 논리 시뮬레이션
              </span>
            </div>

            <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
              {conversationHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 text-xs ${
                    msg.role === 'drafter' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'senior' && (
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-xl p-3 leading-relaxed ${
                      msg.role === 'drafter'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-700/80 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="text-[10px] opacity-75 font-semibold mb-1">
                      {msg.role === 'drafter' ? '작성자 (Drafter Response)' : '상위 리뷰어 (Senior Verdict)'}
                    </div>
                    <div>{msg.text}</div>
                  </div>

                  {msg.role === 'drafter' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isSendingFU && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-indigo-400 rounded-full animate-spin" />
                  <span>상위 리뷰어 판단 생성 중...</span>
                </div>
              )}
            </div>

            {/* Quick FU Reply Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={drafterInput}
                onChange={(e) => setDrafterInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendFollowUp()}
                placeholder="작성자 입장에서 소명 답변을 작성해보세요 (예: 연결정산표에서 상계된 내역입니다)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendFollowUp}
                disabled={isSendingFU || !drafterInput.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>답변 전송</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">상태 변경:</span>
            <button
              onClick={() => onUpdateStatus(comment.id, 'ACCEPTED')}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                comment.userStatus === 'ACCEPTED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              반영 (Accepted)
            </button>
            <button
              onClick={() => onUpdateStatus(comment.id, 'RESOLVED')}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                comment.userStatus === 'RESOLVED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              해결 (Resolved)
            </button>
            <button
              onClick={() => onUpdateStatus(comment.id, 'REJECTED')}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                comment.userStatus === 'REJECTED'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              기각 (Rejected)
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
