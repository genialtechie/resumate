'use client';

import { useReducer, useEffect, memo, useMemo, useRef } from 'react';
import { X, CheckCircle2, XCircle, Check, Clock } from 'lucide-react';

// Animation state machine types
type AnimationState =
  | 'initial'
  | 'analyzing'
  | 'sheet-open'
  | 'diff-view'
  | 'accepted';
type AnimationAction =
  | { type: 'PROGRESS' }
  | { type: 'TAILOR_RESUME' }
  | { type: 'ACCEPT_CHANGES' }
  | { type: 'REJECT_CHANGES' }
  | { type: 'RESET' };

// Resume data
const ORIGINAL_RESUME = {
  summary:
    'Experienced React developer with 5+ years building responsive web applications. Skilled in JavaScript, CSS, and HTML. Focused on creating intuitive user interfaces with attention to performance and accessibility.',
  experience: [
    'Developed and maintained multiple React-based web applications',
    'Implemented responsive UI components using CSS and modern JavaScript',
    'Collaborated with design team to create user-friendly interfaces',
    'Troubleshooted and fixed bugs in existing applications',
  ],
  skills: 'React, JavaScript, CSS, HTML, UI/UX, Responsive Design',
};

const TAILORED_RESUME = {
  summary:
    'Experienced React developer with 5+ years building responsive web applications. Skilled in JavaScript, TypeScript, CSS, and HTML. Proficient in Redux state management and Next.js framework. Focused on creating intuitive user interfaces with attention to performance and accessibility.',
  experience: [
    'Developed and maintained multiple React-based web applications',
    'Implemented responsive UI components using CSS and modern JavaScript',
    'Built advanced state management solutions using Redux',
    'Created server-side rendered applications with Next.js for improved performance',
    'Collaborated with design team to create user-friendly interfaces',
    'Troubleshooted and fixed bugs in existing applications',
  ],
  skills:
    'React, JavaScript, TypeScript, Redux, Next.js, CSS, HTML, UI/UX, Responsive Design, API Integration',
};

const MISSING_SKILLS = ['TypeScript', 'Redux', 'Next.js', 'API Integration'];
const NEW_EXPERIENCE_BULLETS = [
  'Built advanced state management solutions using Redux',
  'Created server-side rendered applications with Next.js for improved performance',
];

// Animation state for each phase
interface AnimationStateModel {
  state: AnimationState;
  progress: number;
  sheetOpen: boolean;
  showDiff: boolean;
  accepted: boolean;
  userInteracted: boolean;
  userDecided: boolean;
  rejected: boolean;
}

const initialState: AnimationStateModel = {
  state: 'initial',
  progress: 0,
  sheetOpen: false,
  showDiff: false,
  accepted: false,
  userInteracted: false,
  userDecided: false,
  rejected: false,
};

// Animation time constants (in ms)
const ANIMATION_TIMES = {
  analyzing: 1500,
  sheetOpen: 2500,
  diffView: 5000, // Increased time for diff view
  resetDelay: 2000,
};

// Reducer to manage all animation state
function animationReducer(
  state: AnimationStateModel,
  action: AnimationAction
): AnimationStateModel {
  switch (action.type) {
    case 'PROGRESS':
      if (state.state === 'initial') {
        return { ...state, state: 'analyzing', progress: 50 };
      } else if (state.state === 'analyzing') {
        return {
          ...state,
          state: 'sheet-open',
          progress: 100,
          sheetOpen: true,
        };
      } else if (state.state === 'sheet-open') {
        // Always auto-proceed after sheet is open (removed userInteracted condition)
        return {
          ...state,
          state: 'diff-view',
          sheetOpen: false,
          showDiff: true,
        };
      } else if (
        state.state === 'diff-view' &&
        !state.accepted &&
        !state.userDecided
      ) {
        // Auto-accept if user hasn't made a decision
        return { ...state, accepted: true };
      } else if (
        state.state === 'diff-view' &&
        (state.accepted || state.userDecided)
      ) {
        // Reset animation after viewing the accepted state or user decision
        return initialState;
      }
      return state;

    case 'ACCEPT_CHANGES':
      return { ...state, accepted: true, userDecided: true };

    case 'REJECT_CHANGES':
      return { ...state, rejected: true, userDecided: true };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Memoized and optimized diff component
const DiffHighlighter = memo(
  ({
    oldText,
    newText,
    accepted,
    rejected,
    highlightWords,
  }: {
    oldText: string;
    newText: string;
    accepted: boolean;
    rejected: boolean;
    highlightWords: string[];
  }) => {
    // Memoize the diff result - must be called unconditionally
    const diffResult = useMemo(() => {
      // Return appropriate content based on state
      if (rejected) return oldText;
      if (accepted) return newText;

      // Calculate diff for normal state
      const words1 = oldText.split(' ');
      const words2 = newText.split(' ');

      return words2.map((word, i) => {
        const isHighlighted =
          !words1.includes(word) &&
          highlightWords.some((skill) => word.includes(skill));

        if (isHighlighted) {
          return (
            <span
              key={i}
              className="text-emerald-500 font-medium bg-emerald-950/30 px-1 py-0.5 rounded"
            >
              {word}{' '}
            </span>
          );
        }
        return <span key={i}>{word} </span>;
      });
    }, [oldText, newText, highlightWords, accepted, rejected]);

    // Result is either a string or React elements array
    return typeof diffResult === 'string' ? (
      <>{diffResult}</>
    ) : (
      <>{diffResult}</>
    );
  }
);

DiffHighlighter.displayName = 'DiffHighlighter';

// Main component
const ResumeAnalysisAnimation = () => {
  const [state, dispatch] = useReducer(animationReducer, initialState);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean controlled animation sequence
  useEffect(() => {
    // Clear any existing timers when effect runs again
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    // Always continue animation unless user has clicked accept/reject buttons but hasn't made a decision
    const shouldContinueAnimation =
      !state.userDecided || state.accepted || state.rejected;

    if (shouldContinueAnimation) {
      let nextTimeout: number;

      switch (state.state) {
        case 'initial':
          nextTimeout = 800;
          break;
        case 'analyzing':
          nextTimeout = ANIMATION_TIMES.analyzing;
          break;
        case 'sheet-open':
          nextTimeout = ANIMATION_TIMES.sheetOpen;
          break;
        case 'diff-view':
          // Use a shorter timeout after any user decision
          nextTimeout =
            state.userDecided || state.accepted
              ? ANIMATION_TIMES.resetDelay
              : ANIMATION_TIMES.diffView;
          break;
        default:
          nextTimeout = 1000;
      }

      animationTimerRef.current = setTimeout(() => {
        dispatch({ type: 'PROGRESS' });
      }, nextTimeout);
    }

    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [state.state, state.userDecided, state.accepted, state.rejected]);

  // Memoize the experience bullets for performance
  const experienceBullets = useMemo(() => {
    if (state.accepted) {
      return TAILORED_RESUME.experience.map((bullet, idx) => (
        <li key={idx}>{bullet}</li>
      ));
    }

    if (state.rejected) {
      return ORIGINAL_RESUME.experience.map((bullet, idx) => (
        <li key={idx}>{bullet}</li>
      ));
    }

    return (
      <>
        {ORIGINAL_RESUME.experience.map((bullet, idx) => (
          <li key={idx}>{bullet}</li>
        ))}
        {NEW_EXPERIENCE_BULLETS.map((bullet, idx) => (
          <li
            key={`new-${idx}`}
            className="text-emerald-500 bg-emerald-950/30 rounded px-1 py-0.5"
          >
            {bullet}
          </li>
        ))}
      </>
    );
  }, [state.accepted, state.rejected]);

  return (
    <div className="w-full h-full flex flex-col relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      {/* Header with analyzing status */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center bg-slate-900">
        <div className="text-white/60 text-sm flex items-center">
          Resume Tailoring - skills matching in progress
          {state.progress < 100 && (
            <div className="ml-2 text-xs text-blue-400 flex items-center">
              <Clock className="h-3 w-3 mr-1 animate-pulse" />
              <span>Analyzing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main app area */}
      <div className="flex-1 flex flex-col relative p-4 pt-0">
        {/* Resume content area - looks like a mid-section crop */}
        <div className="flex-1 bg-slate-800 rounded-b-lg overflow-hidden border-x border-b border-slate-700/70">
          {state.showDiff ? (
            <>
              {/* Diff editor view - to mimic the actual application */}
              <div className="relative h-full flex flex-col">
                {/* Accept/Reject buttons - hide when user decided OR changes auto-accepted */}
                {!state.userDecided && !state.accepted && (
                  <div className="absolute right-2 top-2 z-10 flex items-center gap-1 bg-slate-900/70 backdrop-blur-sm p-1 rounded shadow-sm border border-slate-700">
                    <button
                      className="h-7 w-7 hover:bg-emerald-950 border border-slate-800 rounded flex items-center justify-center"
                      onClick={() => dispatch({ type: 'ACCEPT_CHANGES' })}
                    >
                      <Check className="h-4 w-4 text-emerald-400" />
                    </button>
                    <button
                      className="h-7 w-7 hover:bg-rose-950 border border-slate-800 rounded flex items-center justify-center"
                      onClick={() => dispatch({ type: 'REJECT_CHANGES' })}
                    >
                      <X className="h-4 w-4 text-rose-400" />
                    </button>
                  </div>
                )}

                <div className="flex-1 overflow-hidden space-y-5 p-4">
                  {/* Summary section - looks like a mid-section crop */}
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-slate-300">
                      Summary
                    </h3>
                    <div className="p-3 text-slate-200 bg-slate-800 rounded-md text-sm">
                      <DiffHighlighter
                        oldText={ORIGINAL_RESUME.summary}
                        newText={TAILORED_RESUME.summary}
                        accepted={state.accepted}
                        rejected={state.rejected}
                        highlightWords={MISSING_SKILLS}
                      />
                    </div>
                  </div>

                  {/* Skills section */}
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-slate-300">
                      Skills
                    </h3>
                    <div className="p-3 text-slate-200 bg-slate-800 rounded-md text-sm">
                      {state.accepted ? (
                        TAILORED_RESUME.skills
                      ) : state.rejected ? (
                        ORIGINAL_RESUME.skills
                      ) : (
                        <DiffHighlighter
                          oldText={ORIGINAL_RESUME.skills}
                          newText={TAILORED_RESUME.skills}
                          accepted={state.accepted}
                          rejected={state.rejected}
                          highlightWords={MISSING_SKILLS}
                        />
                      )}
                    </div>
                  </div>

                  {/* Experience section - highlighted with changes */}
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-slate-300">
                      Experience
                    </h3>
                    <div className="p-3 text-slate-200 bg-slate-800 rounded-md">
                      <ul className="list-disc pl-5 text-sm space-y-2">
                        {experienceBullets}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Standard Resume preview - mid-section crop */}
              <div className="h-full flex flex-col space-y-5 p-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">
                    Summary
                  </h4>
                  <div className="p-3 text-slate-200 bg-slate-800 rounded-md text-sm">
                    {ORIGINAL_RESUME.summary}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">
                    Skills
                  </h4>
                  <div className="p-3 text-slate-200 bg-slate-800 rounded-md text-sm">
                    {ORIGINAL_RESUME.skills}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">
                    Experience
                  </h4>
                  <div className="p-3 text-slate-200 bg-slate-800 rounded-md">
                    <ul className="list-disc pl-5 text-sm space-y-2">
                      {ORIGINAL_RESUME.experience.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Slide-in sheet from right - simplified version */}
        <div
          className={`absolute inset-y-0 right-0 w-[350px] max-w-[80%] z-20 bg-background border-l border-border shadow-xl 
            flex flex-col transition-transform duration-300 ease-in-out transform ${
              state.sheetOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Sheet content - no scrolling, mid-section crop */}
          <div className="flex-1 p-5 space-y-6 overflow-hidden">
            {/* Just a few requirement boxes without title */}
            <div className="space-y-2.5">
              <div className="p-2.5 rounded flex items-start gap-3 bg-emerald-950/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-emerald-300">
                  Experience with React and JavaScript
                </span>
              </div>
              <div className="p-2.5 rounded flex items-start gap-3 bg-rose-950/30">
                <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-sm text-rose-300">
                  Proficiency with TypeScript
                </span>
              </div>
              <div className="p-2.5 rounded flex items-start gap-3 bg-rose-950/30">
                <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-sm text-rose-300">
                  Experience with Redux state management
                </span>
              </div>
            </div>

            {/* Missing Skills Section */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">Missing Skills</h4>
              <div className="flex flex-wrap gap-2">
                {MISSING_SKILLS.map((skill, index) => (
                  <div
                    key={skill}
                    className="bg-rose-950/30 text-rose-300 px-2.5 py-1 rounded text-xs animate-fade-up"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisAnimation;
