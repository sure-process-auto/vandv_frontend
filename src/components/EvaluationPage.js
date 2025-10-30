import React, { useState } from 'react';
import { saveEvaluation } from '../services/evaluationService';
import './EvaluationPage.css';

function EvaluationPage() {
  const [evaluationItems, setEvaluationItems] = useState([
    { id: 1, name: '코드 품질', ratio: 30, score: 0, bonus: 0 },
    { id: 2, name: '기능 완성도', ratio: 25, score: 0, bonus: 0 },
    { id: 3, name: '사용자 경험', ratio: 20, score: 0, bonus: 0 },
    { id: 4, name: '성능 최적화', ratio: 15, score: 0, bonus: 0 },
    { id: 5, name: '문서화', ratio: 10, score: 0, bonus: 0 }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // 항목 값 변경 핸들러
  const handleChange = (id, field, value) => {
    setEvaluationItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: parseFloat(value) || 0 } : item
      )
    );
  };

  // 총 비율 계산
  const getTotalRatio = () => {
    return evaluationItems.reduce((sum, item) => sum + item.ratio, 0);
  };

  // 총 점수 계산 (가중치 적용)
  const getTotalScore = () => {
    return evaluationItems.reduce((sum, item) => {
      const weightedScore = (item.score * item.ratio) / 100;
      return sum + weightedScore + item.bonus;
    }, 0);
  };

  // 저장 핸들러
  const handleSave = async () => {
    // 비율 합계 검증
    const totalRatio = getTotalRatio();
    if (totalRatio !== 100) {
      setSaveMessage(`⚠️ 비율의 합계는 100%여야 합니다. (현재: ${totalRatio}%)`);
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const evaluationData = {
        items: evaluationItems,
        totalScore: getTotalScore(),
        evaluatedAt: new Date().toISOString()
      };

      await saveEvaluation(evaluationData);
      setSaveMessage('✅ 평가가 성공적으로 저장되었습니다!');
    } catch (error) {
      setSaveMessage(`❌ 저장 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="evaluation-page">
      <div className="evaluation-container">
        <h1>평가 시스템</h1>
        
        <div className="evaluation-summary">
          <div className="summary-item">
            <span className="summary-label">총 비율:</span>
            <span className={`summary-value ${getTotalRatio() === 100 ? 'valid' : 'invalid'}`}>
              {getTotalRatio()}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">총 점수:</span>
            <span className="summary-value">{getTotalScore().toFixed(2)}점</span>
          </div>
        </div>

        <div className="table-container">
          <table className="evaluation-table">
            <thead>
              <tr>
                <th>항목</th>
                <th>비율 (%)</th>
                <th>점수 (0-100)</th>
                <th>가산점</th>
                <th>가중 점수</th>
              </tr>
            </thead>
            <tbody>
              {evaluationItems.map(item => {
                const weightedScore = (item.score * item.ratio) / 100;
                const finalScore = weightedScore + item.bonus;

                return (
                  <tr key={item.id}>
                    <td className="item-name">{item.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.ratio}
                        onChange={(e) => handleChange(item.id, 'ratio', e.target.value)}
                        className="input-field"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.score}
                        onChange={(e) => handleChange(item.id, 'score', e.target.value)}
                        className="input-field"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.bonus}
                        onChange={(e) => handleChange(item.id, 'bonus', e.target.value)}
                        className="input-field"
                      />
                    </td>
                    <td className="weighted-score">{finalScore.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="action-section">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="save-button"
          >
            {isSaving ? '저장 중...' : '평가 저장'}
          </button>
          
          {saveMessage && (
            <div className={`save-message ${saveMessage.includes('성공') ? 'success' : 'error'}`}>
              {saveMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EvaluationPage;




