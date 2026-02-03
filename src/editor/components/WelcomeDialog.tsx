import React, { useState } from 'react';

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
  onOpenSampleDialog?: () => void;
}

export function WelcomeDialog({ isOpen, onClose, onDontShowAgain, onOpenSampleDialog }: WelcomeDialogProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!isOpen) return null;

  const pages = [
    {
      title: 'FF14 レイドギミックビジュアライザーへようこそ！',
      content: (
        <>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            このツールを使えば、FF14のレイドギミックを簡単に視覚化できます。
          </p>
          <div style={{ 
            background: '#2a2a4a', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px', color: '#ffcc00' }}>主な機能</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>8人パーティの配置と移動</li>
              <li>AoE（範囲攻撃）の設置</li>
              <li>デバフの付与と管理</li>
              <li>テキスト注釈の追加</li>
              <li>動画としてエクスポート</li>
            </ul>
          </div>
        </>
      )
    },
    {
      title: '基本操作',
      content: (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              background: '#2a2a4a', 
              padding: '12px', 
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#51cf66' }}>1. プレイヤーの移動</h4>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                プレイヤーをドラッグ＆ドロップで移動、または選択して矢印キーで微調整できます。<br/>
                <kbd style={{ background: '#444', padding: '2px 6px', borderRadius: '3px' }}>Shift</kbd> + 矢印キーで大きく移動
              </p>
            </div>

            <div style={{ 
              background: '#2a2a4a', 
              padding: '12px', 
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#339af0' }}>2. 移動イベント</h4>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                左パネルの「移動」ボタンまたは「移動イベント追加」ツールで、<br/>
                時間経過とともにプレイヤーを移動させるアニメーションを作成できます。
              </p>
            </div>

            <div style={{ 
              background: '#2a2a4a', 
              padding: '12px', 
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#ff6b6b' }}>3. AoE（範囲攻撃）</h4>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                「AoE追加」ツールで円形・扇形・直線・ドーナツ・十字の攻撃範囲を設置できます。
              </p>
            </div>
          </div>
        </>
      )
    },
    {
      title: '便利なショートカット',
      content: (
        <>
          <p style={{ marginBottom: '16px' }}>
            よく使う操作はキーボードショートカットで素早く実行できます。
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
            <span>データをエクスポート</span>
            
            <kbd style={{ background: '#444', padding: '4px 8px', borderRadius: '3px', textAlign: 'center' }}>Space</kbd>
            <span>プレビュー再生/停止</span>
            
            <kbd style={{ background: '#444', padding: '4px 8px', borderRadius: '3px', textAlign: 'center' }}>←→</kbd>
            <span>1フレーム移動</span>
            
            <kbd style={{ background: '#444', padding: '4px 8px', borderRadius: '3px', textAlign: 'center' }}>↑↓</kbd>
            <span>10フレーム移動</span>
            
            <kbd style={{ background: '#444', padding: '4px 8px', borderRadius: '3px', textAlign: 'center' }}>Esc</kbd>
            <span>操作キャンセル</span>
          </div>
          <p style={{ marginTop: '16px', fontSize: '13px', color: '#aaa' }}>
            ※ 詳細なショートカット一覧は右上の「?」ボタンからいつでも確認できます
          </p>
        </>
      )
    },
    {
      title: 'さあ、始めましょう！',
      content: (
        <>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
            準備はできましたか？サンプルデータで試してみたり、<br/>
            新規にギミックを作成したりできます。
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
              サンプルギミックを試す
            </button>
          )}
          <div style={{
            background: '#2a2a4a',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 12px', color: '#ffcc00' }}>ヒント</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>右上の「?」ボタンでショートカット一覧を表示</li>
              <li>「動画プレビュー」で実際の動きを確認</li>
              <li>「動画出力」でMP4として保存</li>
              <li>データは自動保存されます（ブラウザを閉じても復元）</li>
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
            次回からこのガイドを表示しない
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
            前へ
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
              始める！
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
              次へ →
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
            ガイドをスキップ
          </button>
        </div>
      </div>
    </div>
  );
}
