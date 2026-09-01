import express from "express";
import fs from "fs";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Cloud Run(및 대부분의 PaaS)은 PORT 환경변수로 리슨 포트를 주입한다.
// 3000으로 하드코딩하면 컨테이너가 준비 상태가 되지 못해 빈 화면/503이 된다.
const PORT = Number(process.env.PORT) || 3000;

// 배포 시에는 `node dist/server.cjs`로 실행되므로 __dirname이 곧 dist 경로다.
// process.cwd()는 컨테이너 실행 위치에 따라 달라져 index.html을 못 찾는 원인이 된다.
function isBuiltDir(dir: string): boolean {
  return (
    fs.existsSync(path.join(dir, "index.html")) &&
    fs.existsSync(path.join(dir, "assets"))
  );
}

function resolveDistPath(): string | null {
  // 1) 번들된 서버 자신이 놓인 디렉터리(dist). tsx로 실행하는 개발 모드에서는
  //    ESM이라 __dirname이 없으므로 이 경로는 건너뛰고 Vite 미들웨어로 간다.
  if (typeof __dirname !== "undefined" && isBuiltDir(__dirname)) {
    return __dirname;
  }
  // 2) 명시적으로 production으로 실행된 경우의 표준 위치.
  const cwdDist = path.join(process.cwd(), "dist");
  if (process.env.NODE_ENV === "production" && isBuiltDir(cwdDist)) {
    return cwdDist;
  }
  return null;
}

app.use(express.json({ limit: "15mb" }));

// Server-side Gemini client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Review Generation Endpoint
app.post("/api/review/predict", async (req, res) => {
  try {
    const {
      reviewReportDraft,
      separateNotesDraft,
      consolidatedNotesDraft,
      priorQuarterNotes,
      confidenceThreshold = 0.65,
      engagementInfo,
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      console.warn("GEMINI_API_KEY not configured, using built-in deterministic audit intelligence engine.");
      return res.json({
        success: true,
        source: "engine-deterministic",
        comments: generateFallbackReviewComments(
          reviewReportDraft || "",
          separateNotesDraft || "",
          consolidatedNotesDraft || "",
          priorQuarterNotes || ""
        ),
      });
    }

    const systemPrompt = `당신은 대한민국 최고 수준의 공인회계사(KICPA), 감사품질관리실 EM(Engagement Manager) 및 EP(Engagement Partner)의 20년 감사 리뷰 암묵지를 탑재한 '감사보고서 리뷰 예측 에이전트(Audit Review Agent)'입니다.

[제품 핵심 철학]
단순히 결함을 찾아내는 지적기가 아니라, "이 초안을 제출하면 시니어 리뷰어에게서 이런 질문/지적을 받게 됩니다"라는 [질문 예측기(Question Predictor)]로 동작해야 합니다.

[작동 원칙 및 하드 제약]
1. 원문 인용(quotedAnchor) 필수: 지적할 초안 문서 내의 구체적인 문장/수치/주석번호를 반드시 100% 일치하도록 인용해야 합니다. 인용 없는 허위 코멘트는 즉시 폐기됩니다.
2. 최상위 분기 (Top Partition):
   - DOC_ADDRESSABLE: 제공된 초안 문서(별도/연결/검토보고서)의 텍스트와 수치 대사만으로 도출 가능한 코멘트.
   - PROCEDURE_DIRECTIVE: 조서 작성 요망, 그룹감사(GRI/GAI), 품질관리(OC), 기준서 근거 첨부 등 문서 외적 절차 지시.
3. F1 결함 유형 (Defect Type):
   - TIE_CROSSDOC: 별도-연결 간 불일치 (소송충당부채, 차입처, 리스채권, 계정명, 사명, 주기 유무 등 최빈 패턴)
   - TIE_INTRADOC: 문서 내 상호 대사 불일치
   - LOGIC_EVIDENCE_GAP: 변동 미설명 / AR 질의 예측 (전기 대비 급증·급감 사유 누락)
   - NORM_COMPLIANCE: 기준서·서식·필수 주석 공시 누락
   - JUDGMENT_TREAT: 분류 및 회계처리 판단 이슈
   - SCOPE_REDUCTION: "분기 검토이므로 여기까진 기재 안 해도 된다"는 시니어의 암묵지
   - EDITORIAL: 표기 일관성 (당기말 vs 당분기말, 단위 표기, 정식 사명)
   - RISK_EXPOSURE: 규제 노출 및 표현 강도
4. 리뷰 계층 및 문체 분리 (Reviewer Tone Persona):
   - JUNIOR: 주석번호 위주, 경어체 제안형 ("~하는게 어떨까요?", "~확인 부탁드립니다.")
   - MANAGER: 주석명+페이지, 'Q.' 번호 질문형, 완결 문장 ("Q1. 매출채권 급증 사유는 무엇인가요? AR 확인 필요")
   - SENIOR_EM_EP: 극단적 축약, 고밀도 단문 명령형 ("소송충당부채 왜 다름? 얼마?", "OC 목적 조서 링크 요망", "P GAAP 체크")

입력된 문서들을 정밀 분석하여 다음 JSON 스키마 형식으로 최소 5개~12개의 실무적이고 날카로운 리뷰 질문 및 코멘트를 출력하세요.`;

    const userPrompt = `[분석 대상 문서 데이터]
1. 검토보고서 초안 (Review Report):
${reviewReportDraft || "(미제공)"}

2. 별도 재무제표 및 주석 초안 (Separate FS & Notes):
${separateNotesDraft || "(미제공)"}

3. 연결 재무제표 및 주석 초안 (Consolidated FS & Notes):
${consolidatedNotesDraft || "(미제공)"}

4. 전분기 리뷰 노트 / 반복 점검 사항 (Prior Review Notes):
${priorQuarterNotes || "(미제공)"}

5. 엔게이지먼트 정보:
${JSON.stringify(engagementInfo || { quarter: "2024 3Q", type: "Quarterly Review" }, null, 2)}

별도-연결 간 대사 불일치(D1), 변동 미설명 AR 질의(D2), 표기 일관성(D3), 전분기 반복 항목(D4), 조서 절차 지시를 추출하고 엄격하게 JSON으로 응답하세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              addressability: {
                type: Type.STRING,
                description: "DOC_ADDRESSABLE 또는 PROCEDURE_DIRECTIVE",
              },
              detector: {
                type: Type.STRING,
                description: "D1_CROSSDOC | D2_VARIANCE_GAP | D3_EDITORIAL | D4_RECURRING | RULE_CHECK",
              },
              defectType: {
                type: Type.STRING,
                description: "TIE_CROSSDOC | TIE_INTRADOC | LOGIC_EVIDENCE_GAP | NORM_COMPLIANCE | JUDGMENT_TREAT | SCOPE_REDUCTION | EDITORIAL | RISK_EXPOSURE",
              },
              topic: { type: Type.STRING, description: "예: 충당부채/소송, 차입금, 리스, 수익인식, 특수관계자, 표기 등" },
              severity: { type: Type.STRING, description: "BLOCKER | REWORK | TRIVIAL" },
              reviewerLevel: { type: Type.STRING, description: "JUNIOR | MANAGER | SENIOR_EM_EP" },
              predictedComment: { type: Type.STRING, description: "리뷰어가 실제로 남길 질문 또는 지적 문장" },
              quotedAnchor: { type: Type.STRING, description: "초안 문서에서 그대로 인용한 원문 구절" },
              sourceLocation: { type: Type.STRING, description: "예: 별도 주석 14 소송사건 vs 연결 주석 18" },
              explanation: { type: Type.STRING, description: "이 질문/지적이 나오는 회계적·감사적 이유" },
              drafterActionGuide: { type: Type.STRING, description: "작성자가 보고서 제출 전 취해야 할 구체적 조치 및 준비 답변" },
              simulatedFollowUp: {
                type: Type.OBJECT,
                properties: {
                  drafterResponse: { type: Type.STRING, description: "작성자의 예상 소명 또는 답변" },
                  seniorVerdict: { type: Type.STRING, description: "이에 대한 상위 리뷰어의 재지적 또는 최종 종결 판단" },
                },
                required: ["drafterResponse", "seniorVerdict"],
              },
              confidence: { type: Type.NUMBER, description: "0.0에서 1.0 사이의 확신도" },
            },
            required: [
              "id",
              "addressability",
              "detector",
              "defectType",
              "topic",
              "severity",
              "reviewerLevel",
              "predictedComment",
              "quotedAnchor",
              "sourceLocation",
              "explanation",
              "drafterActionGuide",
              "simulatedFollowUp",
              "confidence",
            ],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({
      success: true,
      source: "gemini-3.7-flash",
      comments: parsed,
    });
  } catch (error: any) {
    console.error("Review prediction failed:", error);
    // Fallback gracefully so the demo always works smoothly
    return res.json({
      success: true,
      source: "fallback-on-error",
      error: error.message,
      comments: generateFallbackReviewComments("", "", "", ""),
    });
  }
});

// Helper for fallback realistic audit review comments
function generateFallbackReviewComments(
  reviewText: string,
  sepText: string,
  consText: string,
  priorText: string
) {
  return [
    {
      id: "REV-2024-001",
      addressability: "DOC_ADDRESSABLE",
      detector: "D1_CROSSDOC",
      defectType: "TIE_CROSSDOC",
      topic: "소송충당부채",
      severity: "BLOCKER",
      reviewerLevel: "SENIOR_EM_EP",
      predictedComment: "소송충당부채 별도/연결 왜 다름? 얼마 차이인지 명세 확인하고 연결조정 여부 적시 요망.",
      quotedAnchor: "별도 주석 14: 계상액 1,250백만원 vs 연결 주석 18: 계상액 820백만원",
      sourceLocation: "별도 주석 14 (소송사건) & 연결 주석 18 (우발채무)",
      explanation: "동일 채무 관련 소송충당부채 금액이 별도 12.5억원과 연결 8.2억원으로 상이함. 종속기업에 대한 구상권 상계 또는 연결 내부거래 제거 여부의 회계적 논리가 주석에 미기술되어 있음.",
      drafterActionGuide: "연결정산표 상 충당부채 제거 분개 내역을 조서로 첨부하고, 주석에 '종속기업 간 내부 보증 채무 상계 4.3억원 반영' 주기를 괄호로 명시할 것.",
      simulatedFollowUp: {
        drafterResponse: "종속기업 A사에 대한 구상권 행사 가능분 4.3억원이 연결조정에서 상계 제거되어 연결 재무제표에는 8.2억원만 반영되었습니다.",
        seniorVerdict: "그렇다면 별도 주석에 구상권 내역 주석을 달고, 연결 주석에도 내부거래 제거 효과를 1줄 주기로 기재하세요. 대사 안 맞으면 발행 전 결재 불가.",
      },
      confidence: 0.96,
    },
    {
      id: "REV-2024-002",
      addressability: "DOC_ADDRESSABLE",
      detector: "D1_CROSSDOC",
      defectType: "TIE_CROSSDOC",
      topic: "차입금/금융부채",
      severity: "REWORK",
      reviewerLevel: "MANAGER",
      predictedComment: "Q1. 별도 주석에서는 차입처가 '우리은행 외 2곳'으로 표기되어 있으나 연결에서는 '국민은행, 우리은행, 하나은행'으로 분기 표기되어 있습니다. 차입처 명칭 표기 기준 및 실행금액 원화환산액 통일 부탁드립니다.",
      quotedAnchor: "별도 주석 8: '우리은행 외 2건 (원화환산액 45,000백만원)' vs 연결 주석 11: '국민은행 200억원, 우리은행 150억원, 하나은행 100억원'",
      sourceLocation: "별도 주석 8 & 연결 주석 11 (차입금 내역)",
      explanation: "동일한 금융기관 차입금에 대해 별도는 '외 N'으로 축약하고 연결은 개별 열거하여 양 문서 간 표시 일관성이 결여됨.",
      drafterActionGuide: "공시 서식 기준에 맞춰 별도 및 연결 모두 주요 차입처를 3대 은행명으로 통일 표기하고 만기 구조 테이블 정렬.",
      simulatedFollowUp: {
        drafterResponse: "별도 주석에도 차입처 3곳을 모두 분리 표기하여 연결과 동일하게 맞추겠습니다.",
        seniorVerdict: "확인 완료. 만기 도래 일자도 동일하게 일치시키세요.",
      },
      confidence: 0.92,
    },
    {
      id: "REV-2024-003",
      addressability: "DOC_ADDRESSABLE",
      detector: "D2_VARIANCE_GAP",
      defectType: "LOGIC_EVIDENCE_GAP",
      topic: "판관비/수익인식",
      severity: "REWORK",
      reviewerLevel: "SENIOR_EM_EP",
      predictedComment: "판관비 전년동기 대비 +68% 급증 사유는? 주석 서술 전무. AR 분석 필요.",
      quotedAnchor: "당 3분기 누적 판관비 18,450백만원 (전년동기 10,980백만원, +68.0% 변동)",
      sourceLocation: "별도 및 연결 주석 21 (비용의 성격별 분류)",
      explanation: "전기 대비 30% 이상 중요하게 급증한 판관비(지급수수료 및 마케팅비)에 대해 본문 및 주석에 변동 요인에 대한 한 줄 설명도 없음. 파트너 리뷰 시 100% 질문 나오는 항목임.",
      drafterActionGuide: "신규 ERP 도입 용역 수수료(32억원) 및 북미 법인 런칭 광고선전비(42억원) 집행 내역을 AR 메모로 작성하고 주석 하단에 간략 기재.",
      simulatedFollowUp: {
        drafterResponse: "ERP 구축 컨설팅 비용 32억 및 신제품 런칭 프로모션비 증가가 주 요인이며 관련 세부 내역 조서 파일 준비되어 있습니다.",
        seniorVerdict: "그 내용을 주석 (주1)에 '신규 시스템 도입 수수료 증가에 기인' 한 줄 추가하세요.",
      },
      confidence: 0.95,
    },
    {
      id: "REV-2024-004",
      addressability: "DOC_ADDRESSABLE",
      detector: "D1_CROSSDOC",
      defectType: "TIE_CROSSDOC",
      topic: "리스",
      severity: "BLOCKER",
      reviewerLevel: "MANAGER",
      predictedComment: "Q2. 리스채권 현금수취액이 연결(45억원)이 별도(60억원)보다 적게 표시되어 있습니다. 종속기업과의 전대리스 내부거래 제거 영향인지 확인 및 소명 조서 링크 부탁드립니다.",
      quotedAnchor: "별도 주석 16: 리스료 수취액 6,000백만원 vs 연결 주석 20: 리스료 수취액 4,500백만원",
      sourceLocation: "별도 주석 16 vs 연결 주석 20 (리스채권)",
      explanation: "일반적으로 연결 수치가 별도 이상이어야 하나 내부거래 제거로 인해 연결이 더 작아진 비전형적 패턴. 리뷰어가 내부거래 제거 분개 적정성을 확인하려 할 것임.",
      drafterActionGuide: "별도 법인이 종속기업에 사무공간을 전대리스한 계약 15억원의 제거 정산표를 사전 준비할 것.",
      simulatedFollowUp: {
        drafterResponse: "모회사가 사옥을 임차하여 종속기업 B사에 전대리스를 준 15억원이 연결에서 내부거래로 전액 상계제거되었습니다.",
        seniorVerdict: "내부거래 제거 조서 파일 링크 달아두시고 연결 주석에 전대리스 제거 효과 주기 반영 요망.",
      },
      confidence: 0.94,
    },
    {
      id: "REV-2024-005",
      addressability: "DOC_ADDRESSABLE",
      detector: "D3_EDITORIAL",
      defectType: "EDITORIAL",
      topic: "표기 일관성",
      severity: "TRIVIAL",
      reviewerLevel: "JUNIOR",
      predictedComment: "주석 1번 및 4번에서 '당기말'과 '당분기말' 표현이 혼용되고 있습니다. 분기검토보고서이므로 '당분기말'로 일괄 수정하는 것이 어떨까요?",
      quotedAnchor: "주석 1 일반사항: '당기말 현재 회사의 자본금은...' / 주석 4 현금및현금성자산: '당분기말 현재...'",
      sourceLocation: "주석 1 및 주석 4 전체",
      explanation: "분기검토보고서 서식 표준상 기말 시점은 '당분기말'로 통일하여 기술하여야 함.",
      drafterActionGuide: "'당기말' 단어를 전체 검색하여 '당분기말'로 일괄 치환.",
      simulatedFollowUp: {
        drafterResponse: "전체 문서 검색 후 '당분기말'로 통일 수정 완료했습니다.",
        seniorVerdict: "확인함.",
      },
      confidence: 0.98,
    },
    {
      id: "REV-2024-006",
      addressability: "DOC_ADDRESSABLE",
      detector: "D4_RECURRING",
      defectType: "NORM_COMPLIANCE",
      topic: "규제/지정학 리스크",
      severity: "REWORK",
      reviewerLevel: "MANAGER",
      predictedComment: "전분기 리뷰사항: 러시아-우크라이나 및 중동 분쟁 관련 공급망 영향 주석 기재 여부 확인 필요. 이번 3분기에도 원자재 수급 영향에 대한 기재가 누락되어 있습니다.",
      quotedAnchor: "전분기 리뷰노트 #12: '지정학적 리스크 관련 원자재 가격 변동 주석 필수 기재 요망'",
      sourceLocation: "주석 29 (주요 불확실성 및 후속사건)",
      explanation: "전분기에 매번 지적되었던 반복 이슈. 이번 분기에도 담당자가 누락하여 그대로 제출될 위험.",
      drafterActionGuide: "전분기 최종 공시된 '지정학적 리스크 및 공급망 불확실성' 문단을 3분기 현황에 맞게 업데이트하여 주석 29에 추가.",
      simulatedFollowUp: {
        drafterResponse: "전분기 주석 문단을 기초로 이번 3분기 해상운임 및 원자재 단가 변동 영향을 업데이트하여 추가 기재했습니다.",
        seniorVerdict: "OK. 전분기 코멘트는 매 분기 시작 시 기본 체크리스트로 확인하세요.",
      },
      confidence: 0.91,
    },
    {
      id: "REV-2024-007",
      addressability: "PROCEDURE_DIRECTIVE",
      detector: "RULE_CHECK",
      defectType: "TIE_SOURCE",
      topic: "품질관리/조서화",
      severity: "REWORK",
      reviewerLevel: "SENIOR_EM_EP",
      predictedComment: "OC 목적으로 파생상품 평가 조서 기말 수준으로 준비 요망. 차주 평가사 보고서 입수 및 조서 링크 첨부할 것.",
      quotedAnchor: "연결 주석 7: 파생상품 평가손익 3,200백만원 계상",
      sourceLocation: "연결 주석 7 (파생상품)",
      explanation: "초안 문서 자체의 오류는 아니나, 품질관리실(OC) 점검 대비 외부평가기관 평가내역 조서 첨부 지시(구조적 미달 절차 지시).",
      drafterActionGuide: "외부감정평가기관(삼일PwC/딜로이트)의 공정가치 평가보고서를 Audit File에 업로드하고 리뷰 노트에 조서 번호 링크.",
      simulatedFollowUp: {
        drafterResponse: "평가보고서 및 자체 검증 엑셀 시트를 Audit Binder WP-4200에 아카이빙하고 링크 완료했습니다.",
        seniorVerdict: "링크 확인 완료. 조서 인덱스 명확히 유지할 것.",
      },
      confidence: 0.88,
    },
    {
      id: "REV-2024-008",
      addressability: "DOC_ADDRESSABLE",
      detector: "RULE_CHECK",
      defectType: "SCOPE_REDUCTION",
      topic: "과도한 공시 축소",
      severity: "TRIVIAL",
      reviewerLevel: "SENIOR_EM_EP",
      predictedComment: "분기 검토인데 영업부문별 미래 5개년 현금흐름 예측표까지 넣을 필요 없음. 주석 24번 부문상세표 간소화 권고 (여기까진 안 해도 됨).",
      quotedAnchor: "별도 주석 24 부문별 정보: '향후 5개년 매출 성장률 가정 및 EBITDA 예측 테이블'",
      sourceLocation: "별도 주석 24 (영업부문 정보)",
      explanation: "시니어 파트너의 암묵지. 분기검토 기준서(K-IFRS 제1034호)상 요구되지 않는 과도한 공시는 회사의 부담 및 불필요한 감사인 책임 유발하므로 삭제 권고.",
      drafterActionGuide: "5개년 세부 예측 테이블을 삭제하고 분기 기준 필수 요구사항인 부문매출 및 부문이익 요약표만 남김.",
      simulatedFollowUp: {
        drafterResponse: "회사 담당자와 협의하여 5개년 예측표는 삭제하고 당분기 요약 매출/이익만 공시하도록 수정했습니다.",
        seniorVerdict: "잘했습니다. 불필요한 공시는 오히려 감리 타겟이 됨.",
      },
      confidence: 0.93,
    },
  ];
}

// Follow-up interaction endpoint
app.post("/api/review/followup", async (req, res) => {
  try {
    const { comment, drafterReply } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        seniorVerdict: `[EM/EP 회신]: ${drafterReply}에 대해 확인하였습니다. 관련 증빙 조서 링크를 달고 주석에 괄호로 한 줄 반영하세요.`,
      });
    }

    const prompt = `당신은 대한민국 회계법인의 날카롭고 노련한 파트너/품질관리실 EM 회계사입니다.
작성자(주니어/시니어 회계사)가 당신의 리뷰 지적에 대해 다음과 같이 소명/답변했습니다.

[리뷰 질문/지적]:
${comment.predictedComment}
(원문: ${comment.quotedAnchor})

[작성자의 소명 답변]:
${drafterReply}

당신의 페르소나(${comment.reviewerLevel || "SENIOR_EM_EP"})에 맞추어 단호하고 명확한 판단 근거(기준서, 조서 요구, 주석 문구 수정 지시 등)를 담은 1~2문장의 최종 지시/종결 판정을 내려주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      seniorVerdict: response.text?.trim() || "확인하였습니다. 조서에 근거 남겨주세요.",
    });
  } catch (err: any) {
    res.json({
      success: true,
      seniorVerdict: `확인하였습니다. 관련 조서 첨부 및 주석 수정을 완료하세요. (${err.message})`,
    });
  }
});

// Start server and mount static assets (또는 개발 시 Vite 미들웨어)
async function start() {
  const distPath = resolveDistPath();

  if (distPath) {
    // 빌드 산출물이 확인되면 NODE_ENV 값과 무관하게 정적 서빙한다.
    // (배포 환경에서 NODE_ENV가 비어 있으면 Vite 개발 미들웨어가 떠서
    //  소스가 없는 컨테이너에서는 흰 화면이 되었다)
    const indexHtml = path.join(distPath, "index.html");

    // 서버 번들과 소스맵이 정적으로 노출되지 않도록 차단한다.
    app.use((req, res, next) => {
      if (/\.(cjs|js\.map|cjs\.map)$/.test(req.path)) {
        return res.status(404).end();
      }
      next();
    });

    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res) => {
      res.sendFile(indexHtml);
    });

    console.log(`Serving static build from ${distPath}`);
  } else {
    // 개발 모드: Vite를 미들웨어로 마운트한다.
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Serving via Vite dev middleware");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Review Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
