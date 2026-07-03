'use client';

export type StudyCycleStep = 'preview' | 'attend' | 'review' | 'study' | 'check';

export interface StepConfig {
  id: StudyCycleStep;
  label: string;
  emoji: string;
  description: string;
  suggestedMins: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const STUDY_CYCLE_STEPS: StepConfig[] = [
  {
    id: 'preview',
    label: 'Preview',
    emoji: '👁',
    description: 'Skim material before class',
    suggestedMins: 15,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500',
  },
  {
    id: 'attend',
    label: 'Attend',
    emoji: '🎓',
    description: 'Go to class, take notes',
    suggestedMins: 60,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
  },
  {
    id: 'review',
    label: 'Review',
    emoji: '📝',
    description: 'Revisit notes within 24h',
    suggestedMins: 20,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500',
  },
  {
    id: 'study',
    label: 'Study',
    emoji: '📚',
    description: '30–50 min focused session',
    suggestedMins: 45,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500',
  },
  {
    id: 'check',
    label: 'Check',
    emoji: '✅',
    description: 'Test your understanding',
    suggestedMins: 20,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500',
  },
];

interface Props {
  selected: StudyCycleStep | null;
  onChange: (step: StudyCycleStep) => void;
}

export default function StudyCycleStepSelector({ selected, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-3">
        Study Cycle — Etapa
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {STUDY_CYCLE_STEPS.map((step, idx) => {
          const isSelected = selected === step.id;
          return (
            <button
              key={step.id}
              onClick={() => onChange(step.id)}
              title={`${step.label}: ${step.description} (~${step.suggestedMins}min)`}
              className={`
                relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all duration-200 group
                ${isSelected
                  ? `${step.borderColor} ${step.bgColor} ${step.color}`
                  : 'border-slate-700 bg-slate-800/40 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                }
              `}
            >
              {/* Step number */}
              <span className={`absolute top-1 left-1.5 text-[9px] font-bold opacity-50`}>
                {idx + 1}
              </span>
              <span className="text-lg leading-none mt-1">{step.emoji}</span>
              <span className="text-[10px] font-semibold leading-none">{step.label}</span>
              {isSelected && (
                <span className="text-[9px] opacity-70 leading-none">
                  ~{step.suggestedMins}min
                </span>
              )}
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-xs text-slate-500 mt-2 text-center">
          {STUDY_CYCLE_STEPS.find((s) => s.id === selected)?.description}
        </p>
      )}
    </div>
  );
}
