import { Link } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { JobDescriptionInputProps } from '@/types';
import DOMPurify from 'dompurify';
import { useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';

/**
 * Job Description Input component
 * @param jobDescription - The job description
 * @param setJobDescription - The function to set the job description
 */

export const JobDescriptionInput = ({
  jobDescription,
  setJobDescription,
}: JobDescriptionInputProps) => {
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link className="h-4 w-4 text-gray-400" />
        <label className="text-sm font-medium text-gray-800">
          Paste job description
        </label>
      </div>
      <Textarea
        placeholder="Paste job description or link here..."
        className="min-h-[100px] resize-none rounded-none"
        value={jobDescription}
        onChange={(e) => debouncedOnChange(e.target.value)}
      />
    </div>
  );
};
