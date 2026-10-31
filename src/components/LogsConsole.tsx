import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Copy, X, Check, Filter } from 'lucide-react';
import { LogEntry } from '../types';

interface LogsConsoleProps {
  logs: LogEntry[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export const LogsConsole: React.FC<LogsConsoleProps> = ({
  logs,
  isOpen,
  onClose,
  onClear,
}) => {
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'INFO' | 'DEBUG' | 'WARN' | 'ERROR'>('ALL');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && isOpen) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (levelFilter === 'ALL') return true;
    return log.level === levelFilter;
  });

  const handleCopy = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.tag}]: ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#161616] border-t border-[#333] shadow-2xl flex flex-col h-72 sm:h-80 transition-all">
      {/* Console Header */}
      <div className="bg-[#1F1F1F] px-4 py-2 flex items-center justify-between border-b border-[#2C2C2C] select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#BB86FC]" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            Logcat Console ({filteredLogs.length})
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {/* Level Filter */}
          <div className="flex items-center space-x-1 bg-[#121212] px-2 py-0.5 rounded border border-[#333]">
            <Filter className="w-3 h-3 text-gray-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="bg-transparent text-gray-200 text-[11px] outline-none cursor-pointer"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="DEBUG">DEBUG</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>

          <label className="flex items-center space-x-1 text-[11px] text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-[#121212] border-[#333] text-[#03DAC5]"
            />
            <span>Auto-scroll</span>
          </label>

          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[#2F2F2F] text-gray-300 hover:text-white transition"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#03DAC5]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-[#2F2F2F] text-gray-300 hover:text-rose-400 transition"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#2F2F2F] text-gray-300 hover:text-white transition"
            title="Close Console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Output Stream */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1 bg-[#0E0E0E]">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 italic p-2">No logs captured yet. Connect to start tunnel stream...</div>
        ) : (
          filteredLogs.map((log) => {
            const levelColor =
              log.level === 'ERROR'
                ? 'text-rose-400'
                : log.level === 'WARN'
                ? 'text-amber-300'
                : log.level === 'DEBUG'
                ? 'text-blue-300'
                : 'text-gray-300';

            return (
              <div key={log.id} className="flex items-start space-x-2 leading-relaxed hover:bg-white/[0.03] px-1 rounded">
                <span className="text-gray-500 shrink-0 select-none">{log.timestamp}</span>
                <span
                  className={`px-1 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                    log.level === 'ERROR'
                      ? 'bg-rose-950 text-rose-300'
                      : log.level === 'WARN'
                      ? 'bg-amber-950 text-amber-300'
                      : log.level === 'DEBUG'
                      ? 'bg-blue-950 text-blue-300'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-[#BB86FC] shrink-0">{log.tag}:</span>
                <span className={`${levelColor} break-all flex-1`}>{log.message}</span>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
