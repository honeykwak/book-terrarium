import React, { useRef, useEffect } from 'react';
import { PlusIcon, SendIcon, MicIcon, StopIcon } from './Icon';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onStop?: () => void;
  isStreaming?: boolean;
}

const InputArea: React.FC<Props> = ({ value, onChange, onSend, isLoading, onStop, isStreaming }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return; // Prevent double firing during IME composition
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <div className="relative flex items-end gap-2 bg-white rounded-[2rem] shadow-lg shadow-sage-200/50 p-2 border border-sage-100 transition-all focus-within:ring-2 focus-within:ring-sage-400/50 focus-within:border-sage-400">

        {/* Plus Button (Attachments) */}
        <button
          className="p-3 text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-full transition-colors flex-shrink-0"
          aria-label="Add attachment"
        >
          <PlusIcon className="w-6 h-6" />
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="마음 속 이야기를 들려주세요..."
          disabled={isLoading}
          rows={1}
          className="w-full py-3.5 px-2 bg-transparent border-none focus:ring-0 resize-none text-sage-800 placeholder-sage-400 max-h-[150px] overflow-y-auto outline-none"
        />

        {/* Send, Stop, or Mic Button */}
        {isStreaming && onStop ? (
          <button
            onClick={onStop}
            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors flex-shrink-0 mb-0.5 animate-pulse shadow-md"
            title="생성 중단"
          >
            <StopIcon className="w-5 h-5 fill-current" />
          </button>
        ) : value.trim() ? (
          <button
            onClick={onSend}
            disabled={isLoading}
            className={`
               p-3 rounded-full flex-shrink-0 mb-0.5 transition-all duration-200
               ${isLoading
                ? 'bg-sage-200 text-white cursor-not-allowed'
                : 'bg-sage-700 text-white hover:bg-sage-800 shadow-md'
              }
             `}
          >
            <SendIcon className="w-5 h-5" />
          </button>
        ) : (
          <button className="p-3 text-sage-400 hover:text-sage-600 hover:bg-sage-50 rounded-full transition-colors flex-shrink-0 mb-0.5">
            <MicIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="text-center mt-2 text-xs text-sage-400 font-sans">
        소원은 때로 실수할 수 있습니다. 중요한 내용은 다시 확인해 주세요.
      </div>
    </div>
  );
};

export default InputArea;