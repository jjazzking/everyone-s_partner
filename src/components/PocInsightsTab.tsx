import React from 'react';
import { 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  GitBranch, 
  FileText, 
  Scale, 
  HelpCircle, 
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';

export const PocInsightsTab: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-200">
      {/* Overview Banner */}
      <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              감사보고서 리뷰 에이전트 PoC — 데이터 분석 및 전략적 인사이트
            </h2>
            <p className="text-xs text-slate-400">
              실제 분기검토 리뷰 데이터 분석(약 140개 원자 코멘트)에서 도출된 사실과 사내 표준 제안
            </p>
          </div>
        </div>
      </div>

      {/* 1. The 3 Flipped Realities */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          <span>1. 실제 데이터 검토에서 뒤집힌 3가지 초기 가설</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-rose-400">가설 1 뒤집힘</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 mb-2">
              톤다운·계속기업 코멘트 0건
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              분기검토 데이터에는 서술 분량이 적고 KAM(핵심감사사항)이 없으므로 톤다운 지적이 거의 없음.
              리스크/규제 디텍터는 기말감사 데이터 확보 전까지 평가 정답이 없음을 확인.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/20 p-4 ring-1 ring-indigo-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-400">최빈 핵심 패턴</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 mb-2">
              최빈 결함: "별도-연결 간 불일치"
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              소송충당부채, 차입처 명칭, 리스채권 수취액 역전 등. 
              외형은 대사(L1)이나 연결조정 이해가 필수적인 <strong>논리 판단(L3)</strong> 영역이며, TB/조서 없이 문서 2개만으로 탐지 가능(기밀성 허들 최저).
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-400">성능 상한선</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 mb-2">
              코멘트 20%는 문서로 도달 불가
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              조서 링크 요구, 그룹감사(GRI/GAI), 품질관리(OC) 요구 등은 '보고서 결함'이 아닌 '감사절차 지시'.
              이를 <code className="text-indigo-300">PROCEDURE_DIRECTIVE</code>로 분리해 정직하게 방어 가능한 프레이밍 확립.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Reviewer Level Tone Deconstruction */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>2. 리뷰 계층 문체 분리 (사람 라벨링 없는 자동 태깅 발견)</span>
        </h3>

        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="p-3 w-28">계층 추정</th>
                <th className="p-3 w-32">위치 앵커 방식</th>
                <th className="p-3 min-w-[200px]">문체 특징 (Tone Signature)</th>
                <th className="p-3 min-w-[200px]">핵심 어휘 및 관심사</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-3 font-bold text-blue-400">하위 (Junior/Staff)</td>
                <td className="p-3 font-mono text-slate-400">주석번호만</td>
                <td className="p-3">경어체 제안형 ("~하는게 어떨까요?", "~확인 부탁드립니다")</td>
                <td className="p-3">표기·서식, 기간 표현(당기말/당분기말), 단위 표기, 오탈자</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-400">중위 (Manager)</td>
                <td className="p-3 font-mono text-slate-400">주석명 + 페이지</td>
                <td className="p-3">"Q." 번호 질문형, 완결 문장 ("Q1. 매출 급증 사유는?")</td>
                <td className="p-3">계정·변동 분석(AR), 별도-연결 대사, 공시 서식 적정성</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-rose-400">상위 (EP / EM 파트너)</td>
                <td className="p-3 font-mono text-slate-400">주석명 + 페이지</td>
                <td className="p-3 font-semibold text-rose-300">극단적 축약, 고밀도 질문/명령형 ("뭔가요?", "얼마?")</td>
                <td className="p-3 font-mono text-slate-300">OC, RMP, P GAAP, CMG, 부문감사인, GAI/GRI, 조서화</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Product Framing & Zero-Burden Proposal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Product Framing */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>제품 프레이밍: "결함 탐지기"가 아닌 "질문 예측기"</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            "이 초안을 제출하면 리뷰어에게서 이런 질문을 받게 됩니다."
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>변동 사유의 정답을 생성할 필요 없음</strong>: 물어볼 자리(Hotspot)만 찾으면 되므로 난이도가 획기적으로 감소.</li>
            <li><strong>작성자 셀프체크 도구</strong>로 포지셔닝하여 오탐 허용치 확보.</li>
            <li><strong>조직 저항 최소화</strong>: 리뷰어를 대체하는 것이 아니라 초안의 품질을 올리는 워크플로우 지원.</li>
          </ul>
        </div>

        {/* Right: TFT Data Standard Proposal */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>사내 데이터 표준 제안 (리뷰어 부담 제로 원칙)</span>
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <strong className="text-emerald-300 block mb-0.5">부담 0 — 즉시 추진</strong>
              <p className="text-slate-400 text-[11px]">
                클리어된 리뷰 노트 영구 보존(삭제 금지) • 리뷰 시점 초안 버전 스냅샷 보관 • 리뷰어 필드 추가
              </p>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <strong className="text-amber-300 block mb-0.5">부담 낮음 — FU 발생 건 결론 기록</strong>
              <p className="text-slate-400 text-[11px]">
                "FU(팔로업)가 발생한 코멘트는 최종 결론을 한 줄로 남긴다" — 판단 근거가 보존되는 핵심 지점.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
