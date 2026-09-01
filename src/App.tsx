import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DraftInputWorkspace } from './components/DraftInputWorkspace';
import { ReviewResultsDashboard } from './components/ReviewResultsDashboard';
import { CommentDetailModal } from './components/CommentDetailModal';
import { BlindEvalLab } from './components/BlindEvalLab';
import { PocInsightsTab } from './components/PocInsightsTab';
import { SAMPLE_PRESETS } from './data/samplePresets';
import { DraftInputs, ReviewComment } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'results' | 'blindEval' | 'insights'>('workspace');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SAMPLE_PRESETS[0].id);
  const [draftInputs, setDraftInputs] = useState<DraftInputs>(SAMPLE_PRESETS[0].data);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [selectedComment, setSelectedComment] = useState<ReviewComment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Initial load of sample preset
  useEffect(() => {
    handleRunAnalysis(true);
  }, []);

  const handleSelectPreset = (presetId: string) => {
    const found = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setDraftInputs(found.data);
    }
  };

  const handleRunAnalysis = async (isInitial = false) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/review/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewReportDraft: draftInputs.reviewReportDraft,
          separateNotesDraft: draftInputs.separateNotesDraft,
          consolidatedNotesDraft: draftInputs.consolidatedNotesDraft,
          priorQuarterNotes: draftInputs.priorQuarterNotes,
          confidenceThreshold,
          engagementInfo: draftInputs.engagementInfo,
        }),
      });

      const data = await response.json();
      if (data.comments && Array.isArray(data.comments)) {
        setComments(data.comments);
        if (!isInitial) {
          setActiveTab('results');
        }
      }
    } catch (err) {
      console.error('Failed to run analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateStatus = (id: string, status: ReviewComment['userStatus']) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, userStatus: status } : c))
    );
    if (selectedComment && selectedComment.id === id) {
      setSelectedComment((prev) => (prev ? { ...prev, userStatus: status } : null));
    }
  };

  const handleRateBlind = (id: string, rating: number) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, blindRating: rating } : c))
    );
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      '최상위분기',
      '디텍터',
      '결함유형',
      '주제',
      '심각도',
      '리뷰어계층',
      '예측질문및코멘트',
      '인용원문',
      '위치',
      '작성자대응가이드',
      '확신도',
      '상태',
    ];

    const rows = comments.map((c, i) => [
      i + 1,
      c.addressability,
      c.detector,
      c.defectType,
      `"${c.topic}"`,
      c.severity,
      c.reviewerLevel,
      `"${c.predictedComment.replace(/"/g, '""')}"`,
      `"${c.quotedAnchor.replace(/"/g, '""')}"`,
      `"${c.sourceLocation.replace(/"/g, '""')}"`,
      `"${c.drafterActionGuide.replace(/"/g, '""')}"`,
      `${Math.round(c.confidence * 100)}%`,
      c.userStatus || 'PENDING',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `감사리뷰노트_${draftInputs.engagementInfo.clientName || 'Export'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        confidenceThreshold={confidenceThreshold}
        setConfidenceThreshold={setConfidenceThreshold}
        presets={SAMPLE_PRESETS}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        isAnalyzing={isAnalyzing}
        onExport={handleExportCSV}
        resultCount={comments.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'workspace' && (
          <DraftInputWorkspace
            draftInputs={draftInputs}
            setDraftInputs={setDraftInputs}
            onRunAnalysis={() => handleRunAnalysis(false)}
            isAnalyzing={isAnalyzing}
          />
        )}

        {activeTab === 'results' && (
          <ReviewResultsDashboard
            comments={comments}
            onSelectComment={setSelectedComment}
            onUpdateStatus={handleUpdateStatus}
            onRateBlind={handleRateBlind}
            onExport={handleExportCSV}
          />
        )}

        {activeTab === 'blindEval' && (
          <BlindEvalLab
            comments={comments}
            onRateBlind={handleRateBlind}
          />
        )}

        {activeTab === 'insights' && <PocInsightsTab />}
      </main>

      {/* Modal Deep Inspector */}
      <CommentDetailModal
        comment={selectedComment}
        onClose={() => setSelectedComment(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
