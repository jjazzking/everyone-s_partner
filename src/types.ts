export type AddressabilityType = 'DOC_ADDRESSABLE' | 'PROCEDURE_DIRECTIVE';

export type DetectorType = 
  | 'D1_CROSSDOC' 
  | 'D2_VARIANCE_GAP' 
  | 'D3_EDITORIAL' 
  | 'D4_RECURRING' 
  | 'RULE_CHECK';

export type DefectType = 
  | 'TIE_CROSSDOC'      // 별도-연결 대사 (최빈)
  | 'TIE_INTRADOC'      // 문서 내 대사
  | 'TIE_SOURCE'        // 조서·TB 대사
  | 'LOGIC_EVIDENCE_GAP'// 변동 미설명 / AR 질의
  | 'NORM_COMPLIANCE'   // 기준서·서식
  | 'JUDGMENT_TREAT'    // 분류·회계처리 판단
  | 'LOGIC_INCOHERENCE' // 서술 간 모순
  | 'SCOPE_REDUCTION'   // 여기까진 안 해도 됨 (시니어 암묵지)
  | 'EDITORIAL'         // 표기·가독성
  | 'RISK_EXPOSURE';    // 표현 강도·규제 노출

export type ReviewerLevel = 'JUNIOR' | 'MANAGER' | 'SENIOR_EM_EP';

export type SeverityLevel = 'BLOCKER' | 'REWORK' | 'TRIVIAL';

export type CommentStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESOLVED';

export interface SimulatedFollowUp {
  drafterResponse: string;
  seniorVerdict: string;
}

export interface ReviewComment {
  id: string;
  addressability: AddressabilityType;
  detector: DetectorType;
  defectType: DefectType;
  topic: string;
  severity: SeverityLevel;
  reviewerLevel: ReviewerLevel;
  predictedComment: string;
  quotedAnchor: string;
  sourceLocation: string;
  explanation: string;
  drafterActionGuide: string;
  simulatedFollowUp: SimulatedFollowUp;
  confidence: number;
  userStatus?: CommentStatus;
  blindRating?: number; // 1: 불필요/오탐, 2: 보통/참고, 3: 실제 내가 낼 질문!
  isBlindRevealed?: boolean;
  actualSource?: 'HUMAN_EXCEL' | 'AGENT_PREDICTED' | 'COUNTERFACTUAL';
}

export interface DraftInputs {
  reviewReportDraft: string;
  separateNotesDraft: string;
  consolidatedNotesDraft: string;
  priorQuarterNotes: string;
  engagementInfo: {
    clientName: string;
    period: string;
    auditType: string;
    industry: string;
    drafterSeniority: string;
    riskTier: string;
  };
}

export interface SamplePreset {
  id: string;
  name: string;
  tag: string;
  description: string;
  data: DraftInputs;
}
