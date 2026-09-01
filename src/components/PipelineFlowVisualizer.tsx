import React from 'react';
import { 
  FileText, 
  Split, 
  Cpu, 
  ShieldCheck, 
  Sliders, 
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface PipelineFlowVisualizerProps {
  isAnalyzing: boolean;
  currentStep?: number;
}

export const PipelineFlowVisualizer: React.FC<PipelineFlowVisualizerProps> = ({
  isAnalyzing,
  currentStep = 3,
}) => {
  const steps = [
    {
      id: 1,
      title: '1. 문서 정규화 & 파싱',
      desc: '별도/연결/보고서 텍스트 정제',
      icon: FileText,
      badge: 'ETL',
    },
    {
      id: 2,
      title: '2. 섹션 & 주석 분할',
      desc: '주석 번호 및 계정별 매핑',
      icon: Split,
      badge: 'Sectioning',
    },
    {
      id: 3,
      title: '3. D1~D4 병렬 디텍터',
      desc: '별도-연결 대사 / AR 질의 / 표기',
      icon: Cpu,
      badge: 'Multi-Agent',
      subDetectors: ['D1 별도-연결 대사', 'D2 변동 미설명', 'D3 표기 일관성', 'D4 전분기 반복'],
    },
    {
      id: 4,
      title: '4. 원문 인용 하드 필터',
      desc: '인용 불가 환각 코멘트 100% 폐기',
      icon: ShieldCheck,
      badge: 'Hallucination Gate',
    },
    {
      id: 5,
      title: '5. 직급별 톤 & 질문 예측',
      desc: 'Junior / Manager / EP 톤 분리',
      icon: Sparkles,
      badge: 'Persona Tone',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 sm:p-5 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            아키텍처 원칙: 멀티 디텍터 파이프라인 (단일 프롬프트 한계 극복)
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          단일 프롬프트 방지 • 원문 인용 강제 • 디텍터 분할 구조
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = isAnalyzing && currentStep === step.id;
          const isDone = !isAnalyzing || currentStep > step.id;

          return (
            <div
              key={step.id}
              className={`rounded-lg p-3 border transition relative ${
                isActive
                  ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {step.badge}
                </span>
                {isActive ? (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <h4 className="text-xs font-bold text-slate-200 truncate">{step.title}</h4>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">{step.desc}</p>

              {step.subDetectors && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                  {step.subDetectors.map((sub, i) => (
                    <span
                      key={i}
                      className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
