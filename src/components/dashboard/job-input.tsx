import { Textarea } from '@/components/ui/textarea';
import { JobDescriptionInputProps } from '@/types';
import DOMPurify from 'dompurify';
import {
  useCallback,
  useMemo,
  useReducer,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import debounce from 'lodash/debounce';
import {
  LoaderPinwheel,
  LinkIcon,
  ClipboardIcon,
  CheckIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

// Input state interface
interface InputState {
  inputValue: string;
  isLoading: boolean;
  error: string | null;
  isUrl: boolean;
  isInputVisible: boolean;
  previousValue: string;
  copyFeedback: boolean;
}

// Action types
type InputAction =
  | { type: 'SET_INPUT_VALUE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_IS_URL'; payload: boolean }
  | { type: 'SET_IS_INPUT_VISIBLE'; payload: boolean }
  | { type: 'RESET_STATE'; payload: string }
  | { type: 'SUBMIT_SUCCESS'; payload: string }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'SHOW_COPY_FEEDBACK' }
  | { type: 'HIDE_COPY_FEEDBACK' };

// Reducer function
const inputReducer = (state: InputState, action: InputAction): InputState => {
  switch (action.type) {
    case 'SET_INPUT_VALUE':
      return { ...state, inputValue: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_IS_URL':
      return { ...state, isUrl: action.payload };
    case 'SET_IS_INPUT_VISIBLE':
      return { ...state, isInputVisible: action.payload };
    case 'RESET_STATE':
      return {
        inputValue: action.payload,
        isInputVisible: !action.payload,
        isLoading: false,
        error: null,
        isUrl: false,
        previousValue: state.previousValue,
        copyFeedback: false,
      };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null,
        isUrl: true,
        isInputVisible: false,
        previousValue: state.inputValue,
        copyFeedback: false,
      };
    case 'SUBMIT_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'SHOW_COPY_FEEDBACK':
      return {
        ...state,
        copyFeedback: true,
      };
    case 'HIDE_COPY_FEEDBACK':
      return {
        ...state,
        copyFeedback: false,
      };
    default:
      return state;
  }
};

/**
 * Job Description Input component
 * @param jobDescription - The job description
 * @param setJobDescription - The function to set the job description
 * @param children - The generation buttons to render
 */
export const JobDescriptionInput = ({
  jobDescription,
  setJobDescription,
  children,
}: JobDescriptionInputProps & { children?: ReactNode }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  // Memoize the sanitization function
  const sanitizeInput = useMemo(() => {
    return (input: string) => {
      const sanitized = DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });

      return sanitized
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/[^\x20-\x7E\n]/g, '')
        .slice(0, 5000);
    };
  }, []);

  // Use reducer instead of multiple useState calls for better performance
  const [state, dispatch] = useReducer(inputReducer, {
    inputValue: jobDescription,
    isLoading: false,
    error: null,
    isUrl: false,
    isInputVisible: !jobDescription,
    previousValue: '',
    copyFeedback: false,
  });

  // Sync with parent component's jobDescription
  useEffect(() => {
    dispatch({ type: 'RESET_STATE', payload: jobDescription });
  }, [jobDescription]);

  // Handle click outside to close input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        state.isInputVisible &&
        !state.isLoading &&
        inputAreaRef.current &&
        !inputAreaRef.current.contains(event.target as Node)
      ) {
        // If there's input content, save it and close
        if (state.inputValue.trim()) {
          const sanitized = sanitizeInput(state.inputValue);
          setJobDescription(sanitized);
          dispatch({ type: 'SET_IS_INPUT_VISIBLE', payload: false });
        }
        // If empty, keep the input visible
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    state.isInputVisible,
    state.inputValue,
    state.isLoading,
    setJobDescription,
    sanitizeInput,
  ]);

  // Function to check if a string is a URL - memoized to prevent recalculation
  const isValidUrl = useMemo(() => {
    return (text: string): boolean => {
      try {
        const url = new URL(text.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    };
  }, []);

  // Function to fetch job description from URL
  const fetchJobDescription = useCallback(
    async (url: string) => {
      // Don't fetch if we're already loading or if we've already fetched this URL
      if (state.isLoading || url === state.previousValue) {
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const response = await fetch('/api/job-description', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch job description');
        }

        if (data.description) {
          setJobDescription(data.description);
          dispatch({ type: 'SUBMIT_SUCCESS', payload: data.description });
        }
      } catch (err) {
        const errorMessage =
          (err as Error).message || 'Failed to fetch job description';
        dispatch({ type: 'SUBMIT_ERROR', payload: errorMessage });
        console.error('Error fetching job description:', err);
      }
    },
    [setJobDescription, state.isLoading, state.previousValue]
  );

  // Auto-fetch when a URL is detected
  useEffect(() => {
    const trimmedInput = state.inputValue.trim();
    if (
      isValidUrl(trimmedInput) &&
      !state.isLoading &&
      trimmedInput !== state.previousValue
    ) {
      // Use a small delay to allow for more typing if user is still entering the URL
      const timer = setTimeout(() => {
        fetchJobDescription(trimmedInput);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [
    state.inputValue,
    state.isLoading,
    state.previousValue,
    isValidUrl,
    fetchJobDescription,
  ]);

  // Handle input change with proper cleanup
  const handleInputChange = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_INPUT_VALUE', payload: value });

      // Skip setJobDescription for URLs since we'll fetch them automatically
      if (!isValidUrl(value)) {
        const sanitized = sanitizeInput(value);
        if (sanitized !== jobDescription) {
          setJobDescription(sanitized);
        }
      }
    },
    [sanitizeInput, setJobDescription, jobDescription, isValidUrl]
  );

  // Debounce the onChange handler to avoid excessive re-renders
  const debouncedOnChange = useMemo(
    () => debounce(handleInputChange, 300),
    [handleInputChange]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  // Handle form submission (for manually triggering fetch)
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (isValidUrl(state.inputValue)) {
        fetchJobDescription(state.inputValue.trim());
      } else {
        // For non-URLs, just update the job description
        const sanitized = sanitizeInput(state.inputValue);
        setJobDescription(sanitized);
        dispatch({ type: 'SET_IS_INPUT_VISIBLE', payload: false });
      }
    },
    [
      state.inputValue,
      isValidUrl,
      fetchJobDescription,
      sanitizeInput,
      setJobDescription,
    ]
  );

  // Handle copy button click with feedback
  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent edit from triggering
      navigator.clipboard.writeText(jobDescription);

      // Show success feedback
      dispatch({ type: 'SHOW_COPY_FEEDBACK' });

      // Hide after 2 seconds
      setTimeout(() => {
        dispatch({ type: 'HIDE_COPY_FEEDBACK' });
      }, 2000);
    },
    [jobDescription]
  );

  // Handle edit button click
  const handleEdit = useCallback(() => {
    dispatch({ type: 'SET_IS_INPUT_VISIBLE', payload: true });
  }, []);

  // Stop event propagation for action buttons container
  const handleActionContainerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicks in button area from triggering card edit
  }, []);

  // Extract state properties for easier access
  const { inputValue, isLoading, error, isUrl, isInputVisible, copyFeedback } =
    state;

  return (
    <div className="max-w-3xl md:max-w-4xl mx-auto bg-deepBlue/90 shadow-lg rounded-md font-sans text-slate-100">
      <AnimatePresence mode="wait">
        {isInputVisible ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            ref={inputAreaRef}
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
            >
              <Textarea
                placeholder="Paste job description or link here..."
                className="min-h-[100px] p-4 resize-none rounded-none bg-transparent border-none text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={inputValue}
                onChange={(e) => debouncedOnChange(e.target.value)}
                disabled={isLoading}
                autoFocus
              />

              {isValidUrl(inputValue) && (
                <div className="px-4 py-2 bg-slate-800/50 text-xs flex items-center gap-2">
                  <LinkIcon className="h-3 w-3" />
                  <span className="truncate">{inputValue}</span>
                  {isLoading && (
                    <div className="ml-auto flex items-center gap-1">
                      <LoaderPinwheel className="h-3 w-3 animate-spin" />
                      <span>Fetching...</span>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="px-4 py-2 bg-red-800/50 text-xs text-red-200">
                  {error}
                </div>
              )}
            </form>

            {children && (
              <div className="flex flex-row justify-around md:justify-end p-2">
                <div className="flex flex-row w-full md:w-auto">{children}</div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="bg-transparent border-slate-700 hover:border-slate-500 transition-all duration-200 cursor-pointer group"
              onClick={handleEdit}
            >
              <div className="p-4 relative">
                <div className="absolute right-4 top-4 z-10">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 transition-colors duration-200 ${
                        copyFeedback
                          ? 'bg-green-800/20 text-green-400'
                          : 'hover:bg-slate-700/50 hover:text-featureBlue'
                      }`}
                      onClick={handleCopy}
                      title="Copy to clipboard"
                    >
                      {copyFeedback ? (
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <ClipboardIcon className="h-4 w-4" />
                      )}
                    </Button>
                    {copyFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute -bottom-8 right-0 bg-slate-800 text-xs py-1 px-2 rounded shadow-md whitespace-nowrap"
                      >
                        Copied!
                      </motion.div>
                    )}
                  </div>
                </div>
                {isUrl && (
                  <div className="mb-2 flex items-center text-xs text-slate-400">
                    <LinkIcon className="h-3 w-3 mr-1" />
                    <span>Job description extracted from URL</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-12 text-slate-100 text-sm">
                  {jobDescription}
                </div>
                <div className="mt-2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Click to edit
                </div>
              </div>

              {children && (
                <div
                  className="flex flex-row justify-around md:justify-end p-2 border-t border-slate-700"
                  onClick={handleActionContainerClick}
                >
                  <div className="flex flex-row w-full md:w-auto">
                    {children}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
