import { Textarea } from '@/components/ui/textarea';
import { JobDescriptionInputProps } from '@/types';
import DOMPurify from 'dompurify';
import { useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';

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
}: JobDescriptionInputProps & { children?: React.ReactNode }) => {
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

  // Debounce the setJobDescription call
  const debouncedSetDescription = useCallback(
    (value: string) => {
      const sanitized = sanitizeInput(value);
      if (sanitized !== jobDescription) {
        setJobDescription(sanitized);
      }
    },
    [sanitizeInput, setJobDescription, jobDescription]
  );

  const debouncedOnChange = useMemo(
    () => debounce(debouncedSetDescription, 300),
    [debouncedSetDescription]
  );

  return (
    <div className="max-w-3xl md:max-w-4xl mx-auto bg-deepBlue/90 shadow-lg rounded-md font-sans text-slate-100">
      <Textarea
        placeholder="Paste job description or link here..."
        className="min-h-[100px] p-4 resize-none rounded-none bg-transparent border-none text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        value={jobDescription}
        onChange={(e) => debouncedOnChange(e.target.value)}
      />

      {children && (
        <div className="flex flex-row justify-around md:justify-end p-2">
          <div className="flex flex-row w-full md:w-auto">{children}</div>
        </div>
      )}
    </div>
  );
};
