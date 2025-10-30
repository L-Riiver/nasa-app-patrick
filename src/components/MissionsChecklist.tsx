import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MissionsChecklistProps {
  tutorialSteps: {
    key: string;
    completed: boolean;
  }[];
  onSkip: () => void;
}

export const MissionsChecklist: React.FC<MissionsChecklistProps> = ({ tutorialSteps }) => {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);

  // Find the first uncompleted step
  const currentStep = tutorialSteps.find(step => !step.completed);

  if (!currentStep) {
    return null; // All steps completed
  }

  const currentText = t(`game.missions.${currentStep.key}`);
  const pinIndex = currentText.indexOf('📌');

  let messageText = '';
  let missionText = '';

  if (pinIndex !== -1) {
    // Text has both message and mission
    messageText = currentText.substring(0, pinIndex).trim();
    missionText = currentText.substring(pinIndex + "📌".length).trim(); // Remove the separator 📌
  } else {
    // Text is only message
    messageText = currentText;
  }

  return (
    <div className={`tutorial-checklist ${isMinimized ? 'minimized' : ''}`} onClick={isMinimized ? () => setIsMinimized(false) : undefined}>
      <div className="tutorial-header">
        <h3>{t('game.missions.title')}</h3>
        <div className="header-buttons">
          <button className="minimize-btn" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} title="Minimizar panel de misiones">
            {isMinimized ? '📌' : 'Minimizar'}
          </button>
        </div>
      </div>
      <div className="tutorial-steps">
        {messageText && (
          <div className="messages-section">
            <div className="tutorial-message">
              <div className="step-text">{messageText}</div>
            </div>
          </div>
        )}
        {missionText && (
          <div className="missions-section">
            <h4>{t('game.missions.current_mission')}</h4>
            <div className="tutorial-step current">
              <div className="step-check">○</div>
              <div className="step-text">{missionText}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};