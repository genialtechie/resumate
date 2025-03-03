# Diff Implementation Guide for Resume Editor

This guide explains how the diff functionality is implemented in our resume editor application. The diff system allows users to see word-level differences between the original resume and the edited version after applying AI suggestions or tailoring.

## Component Architecture

Our diff implementation uses the following components:

1. **InlineDiffEditor**: The main unified component for displaying and editing diffs
2. **diff-utils.ts**: Utility functions for calculating word-level diffs and checking for differences
3. **Dashboard**: Manages the overall state and controls for diff functionality
4. **PDFEditor**: Implements the diff visuals for specific resume sections

## Key Features

- Word-level difference highlighting (additions in green, deletions in red)
- Accept/reject controls for individual sections
- Section-specific accept/reject functionality
- Accept/reject all changes functionality
- Inline editing capability while viewing differences
- Optimized performance for large text blocks

## Implementation Flow

### 1. Initializing the Original Resume

When the user applies AI-suggested changes to their resume (through tailoring or other optimization features), we save a copy of the original resume:

```tsx
// In Dashboard component
const handleApplyTailoredChanges = useCallback(() => {
  if (!editedResume || !tailoringData?.tailoringResult?.suggestedUpdates)
    return;

  // Save the original resume before applying changes
  setOriginalResume(structuredClone(editedResume));

  // Apply the suggested updates
  const updatedResume = mergeResumeUpdates(
    editedResume,
    tailoringData.tailoringResult.suggestedUpdates
  );

  setEditedResume(updatedResume);
  setShowTailorSheet(false);
  setActiveView('editor');

  toast({
    title: 'Resume Updated',
    description: 'Your resume has been tailored with the suggested changes',
  });
}, [editedResume, tailoringData, setEditedResume, setActiveView, toast]);
```

### 2. Passing Diff Data to the Editor

The Dashboard passes the original and edited resume objects along with a flag to show diffs:

```tsx
<PDFEditor
  editedResume={editedResume}
  setEditedResume={setEditedResume}
  originalResume={originalResume}
  showDiffs={originalResume !== null}
  onAcceptSection={handleAcceptSectionDiff}
  onRejectSection={handleRejectSectionDiff}
/>
```

### 3. Rendering Diffs in PDFEditor

The PDFEditor component implements conditional rendering for each editable section:

```tsx
{
  /* Example for Summary Section */
}
<div className="mb-8">
  <h2 className="text-xl font-semibold mb-2 border-b-2 border-black">
    Summary
  </h2>
  {showDiffs &&
  originalResume &&
  hasTextDifferences(originalResume.summary, editedResume.summary) ? (
    <InlineDiffEditor
      oldText={originalResume.summary}
      newText={editedResume.summary}
      onSave={(value) => handleFieldBlur('summary', value)}
      onAccept={() => onAcceptSection?.('summary')}
      onReject={() => onRejectSection?.('summary')}
      className="p-3 w-full min-h-[100px]"
    />
  ) : (
    <div
      className="p-3 outline-none"
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => handleFieldBlur('summary', e.currentTarget.innerText)}
    >
      {editedResume.summary}
    </div>
  )}
</div>;
```

For sections with array data (like skills, experience, education), we use special handling:

```tsx
{
  /* Skills Section */
}
{
  showDiffs &&
  originalResume &&
  hasTextDifferences(
    originalResume.skills.join(', '),
    editedResume.skills.join(', ')
  ) ? (
    <InlineDiffEditor
      oldText={originalResume.skills.join(', ')}
      newText={editedResume.skills.join(', ')}
      onSave={(value) => handleSkillsBlur(value)}
      onAccept={() => onAcceptSection?.('skills')}
      onReject={() => onRejectSection?.('skills')}
      className="p-3 w-full"
    />
  ) : (
    <div
      className="p-3 outline-none"
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => handleSkillsBlur(e.currentTarget.innerText)}
    >
      {editedResume.skills.join(', ')}
    </div>
  );
}
```

### 4. InlineDiffEditor Component

The core of our diff system is the `InlineDiffEditor` component that:

- Calculates word-level diffs
- Renders colored highlights for changes
- Provides accept/reject buttons
- Maintains editability with contentEditable divs

```tsx
const InlineDiffEditor: React.FC<InlineDiffEditorProps> = ({
  oldText,
  newText,
  className,
  onSave,
  onAccept,
  onReject,
  placeholder = '',
  minHeight,
  readOnly = false,
  showTooltips = true,
}) => {
  const [diffParts, setDiffParts] = useState<DiffPart[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasDifferences = hasTextDifferences(oldText, newText);

  // Calculate diff when texts change
  useEffect(() => {
    if (hasDifferences) {
      generateOptimizedDiff(oldText, newText, setDiffParts);
    } else {
      setDiffParts([{ value: newText || '' }]);
    }
  }, [oldText, newText, hasDifferences]);

  // Individual accept/reject handlers
  const handleAcceptChanges = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(newText);
    }
    if (onAccept) {
      onAccept();
    }
  };

  const handleRejectChanges = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(oldText);
    }
    if (onReject) {
      onReject();
    }
  };

  // Main rendering logic
  // ...
};
```

### 5. Section-Level Accept/Reject Functionality

The Dashboard component implements handlers for section-specific accept and reject actions:

```tsx
// Add a handler for section-specific diff acceptance
const handleAcceptSectionDiff = useCallback(
  (sectionPath: string) => {
    if (!originalResume || !editedResume) return;

    // Create a deep copy of the original resume
    const updatedOriginalResume = structuredClone(originalResume);

    // Update the specific section in the originalResume to match editedResume
    // This effectively "accepts" the change for just that section
    const pathParts = sectionPath.split('.');
    let originalSection: Record<string, unknown> =
      updatedOriginalResume as unknown as Record<string, unknown>;
    let editedSection: Record<string, unknown> =
      editedResume as unknown as Record<string, unknown>;

    // Navigate to the nested property except the last part
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      originalSection = originalSection[part] as Record<string, unknown>;
      editedSection = editedSection[part] as Record<string, unknown>;
      if (!originalSection || !editedSection) return;
    }

    // Update the specific property
    const lastPath = pathParts[pathParts.length - 1];
    originalSection[lastPath] = editedSection[lastPath];

    // Set the updated originalResume
    setOriginalResume(updatedOriginalResume);

    toast({
      title: 'Section Updated',
      description: 'Changes for this section have been accepted',
    });
  },
  [originalResume, editedResume, toast]
);

// Add a handler for rejecting section-specific diff
const handleRejectSectionDiff = useCallback(
  (sectionPath: string) => {
    if (!originalResume || !editedResume) return;

    // Create a deep copy of the edited resume
    const updatedEditedResume = structuredClone(editedResume);

    // Update the specific section in editedResume to match originalResume
    // This effectively "rejects" the change for just that section
    const pathParts = sectionPath.split('.');
    let originalSection: Record<string, unknown> =
      originalResume as unknown as Record<string, unknown>;
    let editedSection: Record<string, unknown> =
      updatedEditedResume as unknown as Record<string, unknown>;

    // Navigate to the nested property except the last part
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      originalSection = originalSection[part] as Record<string, unknown>;
      editedSection = editedSection[part] as Record<string, unknown>;
      if (!originalSection || !editedSection) return;
    }

    // Update the specific property
    const lastPath = pathParts[pathParts.length - 1];
    editedSection[lastPath] = originalSection[lastPath];

    // Set the updated editedResume
    setEditedResume(updatedEditedResume);

    toast({
      title: 'Changes Rejected',
      description: 'Changes for this section have been rejected',
    });
  },
  [originalResume, editedResume, setEditedResume, toast]
);
```

### 6. Global Accept/Reject Controls

In the Dashboard, we provide controls to accept or reject all changes at once:

```tsx
{
  originalResume && (
    <>
      <Button
        onClick={handleAcceptAllChanges}
        variant="outline"
        title="Accept All Changes"
        className="rounded-none hover:text-green-600 hover:border-green-600"
      >
        <Check className="h-4 w-4 mr-2" />
        Accept All
      </Button>
      <Button
        onClick={handleRejectAllChanges}
        variant="outline"
        title="Reject All Changes"
        className="rounded-none hover:text-red-600 hover:border-red-600"
      >
        <X className="h-4 w-4 mr-2" />
        Reject All
      </Button>
    </>
  );
}
```

The handlers for these buttons:

```tsx
// Handle accepting all changes
const handleAcceptAllChanges = useCallback(() => {
  if (originalResume && editedResume) {
    // Keep the current edits (already applied)
    setOriginalResume(null);

    toast({
      title: 'Changes Accepted',
      description: 'All suggested changes have been accepted',
    });
  }
}, [originalResume, editedResume, toast]);

// Handle rejecting all changes
const handleRejectAllChanges = useCallback(() => {
  if (originalResume && editedResume) {
    // Revert to the original resume
    setEditedResume(structuredClone(originalResume));
    setOriginalResume(null);

    toast({
      title: 'Changes Rejected',
      description: 'All suggested changes have been rejected',
    });
  }
}, [originalResume, editedResume, setEditedResume, toast]);
```

## Auto-Cleanup

For better UX, we clear the diff view in certain situations:

```tsx
// Clear originalResume when view changes away from editor
useEffect(() => {
  if (activeView !== 'editor') {
    setOriginalResume(null);
  }
}, [activeView]);
```

## Performance Considerations

For large text blocks, we use debouncing to prevent performance issues:

```tsx
// In diff-utils.ts
export function generateOptimizedDiff(
  oldText: string,
  newText: string,
  callback: (diff: DiffPart[]) => void,
  delay = 300
): void {
  // If texts are identical or both empty, return simple diff immediately
  if (oldText === newText || (!oldText && !newText)) {
    callback([{ value: newText || '' }]);
    return;
  }

  // For longer texts, use debouncing
  if ((oldText?.length || 0) + (newText?.length || 0) > 1000) {
    const debouncedDiff = debounce(() => {
      const diff = diffWords(oldText || '', newText || '');
      callback(diff);
    }, delay);

    debouncedDiff();
    return;
  }

  // For shorter texts, calculate immediately
  const diff = diffWords(oldText || '', newText || '');
  callback(diff);
}
```

## Extending the Diff System

To add diff functionality to a new section:

1. Make sure the component receives `originalResume`, `showDiffs`, `onAcceptSection` and `onRejectSection` props
2. Use `hasTextDifferences()` to check if diffs should be shown
3. Conditionally render `InlineDiffEditor` with proper old/new text values and callback handlers
4. Use the section path format for nested properties (e.g., 'experience.0.company' for the first experience item's company)
5. Handle the `onSave` callback to update the resume data

This approach can be applied to any feature that modifies resume content with AI suggestions, such as optimization, enhancement, or tailoring.
