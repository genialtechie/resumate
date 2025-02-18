import { Link } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { JobDescriptionInputProps } from '@/types';

export const JobDescriptionInput = ({
  jobDescription,
  setJobDescription,
}: JobDescriptionInputProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link className="h-4 w-4 text-gray-400" />
        <label className="text-sm font-medium text-gray-800">
          Paste job description or URL
        </label>
      </div>
      <Textarea
        placeholder="Paste job description or link here..."
        className="min-h-[100px] resize-none rounded-none"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
    </div>
  );
};
