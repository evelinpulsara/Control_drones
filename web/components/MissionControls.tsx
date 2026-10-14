interface MissionControlsProps {
  isStreaming: boolean;
  onToggleStream: () => void;
  droneCount: number;
}

export function MissionControls({ isStreaming, onToggleStream, droneCount }: MissionControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onToggleStream}
        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
          isStreaming
            ? "bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20"
            : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isStreaming ? "bg-slate-900 animate-pulse-soft" : "bg-white"
          }`}
        />
        {isStreaming ? "Detener Misión" : "Iniciar Misión"}
      </button>

      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-2.5 text-sm text-slate-300 backdrop-blur-sm">
        <svg
          className="h-4 w-4 text-emerald-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span>
          {droneCount} {droneCount === 1 ? "dron conectado" : "drones conectados"}
        </span>
      </div>
    </div>
  );
}
