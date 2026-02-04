import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
  onOpenSampleDialog?: () => void;
}

export function WelcomeDialog({ isOpen, onClose, onDontShowAgain, onOpenSampleDialog }: WelcomeDialogProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useLanguage();

  if (!isOpen) return null;

  const pages = [
    {
      title: t('welcome.title'),
      content: (
        <>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            {t('welcome.description')}
          </p>
          <div style={{
            background: '#2a2a4a',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px', color: '#ffcc00' }}>{t('welcome.mainFeatures')}</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>{t('welcome.feature1')}</li>
              <li>{t('welcome.feature2')}</li>
              <li>{t('welcome.feature3')}</li>
              <li>{t('welcome.feature4')}</li>
              <li>{t('welcome.feature5')}</li>
            </ul>
          </div>
        </>
      )
    },
    {
      title: t('welcome.basicOps'),
      content: (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: '#2a2a4a',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#51cf66' }}>{t('welcome.movePlayerTitle')}</h4>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                {t('welcome.movePlayerDesc')}
                <kbd style={{ background: '#444', padding: '2px 6px', borderRadius: '3px' }}>Shift</kbd> {t('welcome.movePlayerShift')}
              </p>
            </div>

            <div style={{
              background: '#2a2a4a',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#339af0' }}>{t('welcome.moveEventTitle')}</h4>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                {t('welcome.moveEventDesc')}
              </p>
            </div>

            <div style={{
              background: '#2a2a4a',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#ff6b6b' }}>{t('welcome.aoeTitle')}</h4>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                {t('welcome.aoeDesc')}
              </p>
            </div>
          </div>
        </>
      )
    },
    {
      title: t('welcome.shortcutsTitle'),
      content: (
        <>
          <p style={{ marginBottom: '16px' }}>
            {t('welcome.shortcutsDesc')}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '8px 16px',
            background: '#2a2a4a',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <kbd style={{ background: '#444', padding: '4px 8px', borderRadius: '3px', textAlign: 'center' }}>Ctrl+S</kbd>
            <span>{t('welcome.shortcutExport')}</span>

            <kbd style={{ background: '#444', padding: '4px 8px', borderRadius: '3px', textAlign: 'center' }}>Space</kbd>
            <span>{t('welcome.shortcutPlayPause')}</span>

            <kbd style={{ background: '#444', padding: '4px 8px', borderRadius: '3px', textAlign: 'center' }}>←→</kbd>
            <span>{t('welcome.shortcut1Frame')}</span>

            <kbd style={{ background: '#444', padding: '4px 8px', borderRadius: '3px', textAlign: 'center' }}>↑↓</kbd>
            <span>{t('welcome.shortcut10Frame')}</span>

            <kbd style={{ background: '#444', padding: '4px 8px', borderRadius: '3px', textAlign: 'center' }}>Esc</kbd>
            <span>{t('welcome.shortcutCancel')}</span>
          </div>
          <p style={{ marginTop: '16px', fontSize: '13px', color: '#aaa' }}>
            {t('welcome.shortcutNote')}
          </p>
        </>
      )
    },
    {
      title: t('welcome.letsBegin'),
      content: (
        <>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            {t('welcome.ready')}
          </p>
          {onOpenSampleDialog && (
            <button
              onClick={() => {
                onClose();
                onOpenSampleDialog();
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#2c6e49',
                border: '1px solid #3c8e59',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '16px',
                fontWeight: 'bold',
              }}
            >
              {t('welcome.trySample')}
            </button>
          )}
          <div style={{
            background: '#2a2a4a',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px', color: '#ffcc00' }}>{t('welcome.hints')}</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>{t('welcome.hint1')}</li>
              <li>{t('welcome.hint2')}</li>
              <li>{t('welcome.hint3')}</li>
              <li>{t('welcome.hint4')}</li>
            </ul>
          </div>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            color: '#aaa'
          }}>
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  onDontShowAgain();
                }
              }}
            />
            {t('welcome.dontShowAgain')}
          </label>
        </>
      )
    }
  ];

  const totalPages = pages.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          padding: '32px',
          width: '500px',
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {pages.map((_, index) => (
            <div
              key={index}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: index === currentPage ? '#3753c7' : '#3a3a5a',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 20px',
          fontSize: '20px',
          color: '#fff',
          textAlign: 'center'
        }}>
          {pages[currentPage].title}
        </h2>

        {/* Content */}
        <div style={{ color: '#ccc', fontSize: '14px' }}>
          {pages[currentPage].content}
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '24px',
          gap: '12px'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            style={{
              padding: '10px 20px',
              background: currentPage === 0 ? '#2a2a4a' : '#3a3a5a',
              border: 'none',
              borderRadius: '6px',
              color: currentPage === 0 ? '#666' : '#fff',
              fontSize: '14px',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {t('welcome.prev')}
          </button>

          {currentPage === totalPages - 1 ? (
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                background: '#3753c7',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {t('welcome.start')}
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              style={{
                padding: '10px 24px',
                background: '#3753c7',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {t('welcome.next')}
            </button>
          )}
        </div>

        {/* Skip link */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {t('welcome.skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
