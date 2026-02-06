import React from 'react';
import type { FieldOverride } from '../../../data/types';
import { useLanguage } from '../../context/LanguageContext';

interface FieldChangePropertiesProps {
  fieldChangeId: string;
  override: FieldOverride;
  changeFrame: number;
  revertFrame: number | null;
  fadeInDuration: number;
  fadeOutDuration: number;
  fps: number;
  onUpdateOverride: (updates: Partial<FieldOverride>) => void;
  onUpdateTiming: (changeFrame: number, revertFrame: number | null) => void;
  onUpdateFade: (fadeInDuration: number, fadeOutDuration: number) => void;
  onDelete: () => void;
}

export function FieldChangeProperties({
  fieldChangeId,
  override,
  changeFrame,
  revertFrame,
  fadeInDuration,
  fadeOutDuration,
  fps,
  onUpdateOverride,
  onUpdateTiming,
  onUpdateFade,
  onDelete,
}: FieldChangePropertiesProps) {
  const { t } = useLanguage();
  const [editingChangeFrame, setEditingChangeFrame] = React.useState(changeFrame);
  const [editingRevertFrame, setEditingRevertFrame] = React.useState<number | string>(revertFrame ?? '');

  React.useEffect(() => {
    setEditingChangeFrame(changeFrame);
    setEditingRevertFrame(revertFrame ?? '');
  }, [changeFrame, revertFrame]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateOverride({ backgroundImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const inputStyle = {
    width: '100%',
    marginTop: '4px',
    padding: '6px 8px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: '12px',
    color: '#888',
    marginBottom: '12px',
  };

  const sectionStyle = {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #3a3a5a',
  };

  return (
    <div>
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#fff' }}>
          {t('property.fieldChange')}
        </h3>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
          ID: {fieldChangeId}
        </div>
      </div>

      {/* Background Image */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          {t('fieldChangeDialog.backgroundImage')}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
            <input
              type="text"
              value={override.backgroundImage || ''}
              onChange={(e) => onUpdateOverride({ backgroundImage: e.target.value || undefined })}
              placeholder="URL / Base64..."
              style={{ ...inputStyle, flex: 1 }}
            />
            <label
              style={{
                padding: '6px 12px',
                background: '#4a4a7a',
                border: '1px solid #3a3a5a',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {t('fieldChangeDialog.selectImage')}
            </label>
          </div>
          {override.backgroundImage && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={override.backgroundImage}
                alt="Preview"
                style={{ maxWidth: '40px', maxHeight: '40px', borderRadius: '4px', border: '1px solid #3a3a5a' }}
              />
              <button
                onClick={() => onUpdateOverride({ backgroundImage: undefined })}
                style={{
                  padding: '4px 8px',
                  background: '#6b2020',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {t('fieldChangeDialog.deleteImage')}
              </button>
            </div>
          )}
        </label>
      </div>

      {/* Background Color */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          {t('fieldChangeDialog.backgroundColor')}
          <input
            type="color"
            value={override.backgroundColor || '#1a1a3e'}
            onChange={(e) => onUpdateOverride({ backgroundColor: e.target.value })}
            style={{ ...inputStyle, padding: '2px', height: '36px' }}
          />
        </label>

        <label style={labelStyle}>
          {t('fieldChangeDialog.opacity')}
          <input
            type="range"
            value={override.backgroundOpacity ?? 1}
            onChange={(e) => onUpdateOverride({ backgroundOpacity: parseFloat(e.target.value) })}
            min={0}
            max={1}
            step={0.1}
            style={{ ...inputStyle, padding: 0 }}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>
            {((override.backgroundOpacity ?? 1) * 100).toFixed(0)}%
          </span>
        </label>
      </div>

      {/* Timing */}
      <div style={sectionStyle}>
        <h4 style={{ margin: '0 0 8px', fontSize: '12px', color: '#aaa' }}>
          {t('fieldChangeDialog.timing')}
        </h4>

        <label style={labelStyle}>
          {t('fieldChangeDialog.startFrame')}
          <input
            type="number"
            value={editingChangeFrame}
            onChange={(e) => setEditingChangeFrame(parseInt(e.target.value) || 0)}
            onBlur={() => onUpdateTiming(editingChangeFrame, revertFrame)}
            min={0}
            step={1}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>
            {(editingChangeFrame / fps).toFixed(2)}秒
          </span>
        </label>

        <label style={labelStyle}>
          {t('fieldChangeDialog.endFrame')}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              value={editingRevertFrame}
              onChange={(e) => setEditingRevertFrame(e.target.value)}
              onBlur={() => {
                const val = editingRevertFrame === '' ? null : parseInt(editingRevertFrame as string) || null;
                onUpdateTiming(changeFrame, val);
              }}
              min={changeFrame + 1}
              step={1}
              placeholder="永続"
              style={{ ...inputStyle, flex: 1 }}
            />
            {revertFrame !== null && (
              <button
                onClick={() => onUpdateTiming(changeFrame, null)}
                style={{
                  padding: '6px 12px',
                  background: '#4a4a7a',
                  border: '1px solid #3a3a5a',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {t('common.delete')}
              </button>
            )}
          </div>
          <span style={{ fontSize: '11px', color: '#888' }}>
            {editingRevertFrame !== '' ? `${(parseInt(editingRevertFrame as string) / fps).toFixed(2)}秒` : '永続'}
          </span>
        </label>

        {revertFrame !== null && (
          <div style={{ fontSize: '12px', color: '#ccc', marginTop: '8px' }}>
            変更時間: {((revertFrame - changeFrame) / fps).toFixed(2)}秒
          </div>
        )}
      </div>

      {/* Fade */}
      <div style={sectionStyle}>
        <label style={labelStyle}>
          {t('fieldChangeDialog.fadeIn')}
          <input
            type="number"
            value={fadeInDuration}
            onChange={(e) => onUpdateFade(parseInt(e.target.value) || 0, fadeOutDuration)}
            min={0}
            step={1}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>
            {(fadeInDuration / fps).toFixed(2)}秒
          </span>
        </label>

        <label style={labelStyle}>
          {t('fieldChangeDialog.fadeOut')}
          <input
            type="number"
            value={fadeOutDuration}
            onChange={(e) => onUpdateFade(fadeInDuration, parseInt(e.target.value) || 0)}
            min={0}
            step={1}
            style={inputStyle}
          />
          <span style={{ fontSize: '11px', color: '#888' }}>
            {(fadeOutDuration / fps).toFixed(2)}秒
          </span>
        </label>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{
          width: '100%',
          padding: '8px',
          background: '#6b2020',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        {t('common.delete')}
      </button>
    </div>
  );
}
