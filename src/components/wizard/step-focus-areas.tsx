'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

interface FocusArea {
  id: string;
  title: string;
  description: string;
  selected: boolean;
}

interface StepFocusAreasProps {
  focusAreas: FocusArea[];
  onFocusAreasChange: (areas: FocusArea[]) => void;
  additionalFocus: string;
  onAdditionalFocusChange: (focus: string) => void;
}

// This special area is always available across all functions
const GENERAL_CFO_AREA: FocusArea = {
  id: 'jim-general',
  title: "Jim's Overall Assessment",
  description: 'Big-picture CFO feedback — Jim reviews everything holistically and tells you what matters most',
  selected: false,
};

export function StepFocusAreas({
  focusAreas,
  onFocusAreasChange,
  additionalFocus,
  onAdditionalFocusChange,
}: StepFocusAreasProps) {
  // Check if the general area is already in the list (shouldn't be, but be safe)
  const hasGeneral = focusAreas.some((a) => a.id === 'jim-general');
  const allAreas = hasGeneral ? focusAreas : [{ ...GENERAL_CFO_AREA }, ...focusAreas];

  const handleToggle = (areaId: string) => {
    onFocusAreasChange(
      // Filter out the general area before passing back — we manage it internally
      allAreas
        .map((area) => (area.id === areaId ? { ...area, selected: !area.selected } : area))
        .filter((a) => a.id !== 'jim-general' || a.selected !== GENERAL_CFO_AREA.selected || focusAreas.some((f) => f.id === 'jim-general'))
    );
  };

  // We need to handle state for the general area separately since it's injected
  const [generalSelected, setGeneralSelected] = React.useState(false);

  const handleToggleArea = (areaId: string) => {
    if (areaId === 'jim-general') {
      setGeneralSelected((prev) => !prev);
      return;
    }
    onFocusAreasChange(
      focusAreas.map((area) =>
        area.id === areaId ? { ...area, selected: !area.selected } : area
      )
    );
  };

  const handleSelectAll = () => {
    setGeneralSelected(true);
    onFocusAreasChange(focusAreas.map((area) => ({ ...area, selected: true })));
  };

  const handleDeselectAll = () => {
    setGeneralSelected(false);
    onFocusAreasChange(focusAreas.map((area) => ({ ...area, selected: false })));
  };

  const selectedCount = focusAreas.filter((area) => area.selected).length + (generalSelected ? 1 : 0);
  const totalCount = focusAreas.length + 1;

  // Expose the general area selection to the parent via additionalFocus
  // (The parent reads additionalFocus for the prompt — we'll prepend Jim's general directive)
  React.useEffect(() => {
    if (generalSelected && !additionalFocus.includes('[JIM_GENERAL]')) {
      // We tag it so the parent prompt builder knows to include holistic analysis
      onAdditionalFocusChange(
        additionalFocus ? `[JIM_GENERAL] ${additionalFocus}` : '[JIM_GENERAL]'
      );
    } else if (!generalSelected && additionalFocus.includes('[JIM_GENERAL]')) {
      onAdditionalFocusChange(additionalFocus.replace(/\[JIM_GENERAL\]\s*/g, '').trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalSelected]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Focus Areas for Analysis
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCount} of {totalCount} areas selected
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
              disabled={selectedCount === totalCount}
            >
              Select All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeselectAll}
              disabled={selectedCount === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Jim's General Assessment — full width, visually distinct */}
        <div
          className={`p-4 border-2 rounded-lg transition-all cursor-pointer mb-4 ${
            generalSelected
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10'
          }`}
          onClick={() => handleToggleArea('jim-general')}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={generalSelected}
              onCheckedChange={() => handleToggleArea('jim-general')}
              className="mt-1"
            />
            <div className="flex-1 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <Label className="font-semibold text-foreground cursor-pointer text-base">
                  Jim&apos;s Overall Assessment
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Big-picture CFO feedback — Jim reviews everything holistically and tells you what matters most, what&apos;s working, and what needs attention right now
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Function-specific focus areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {focusAreas.map((area) => (
            <div
              key={area.id}
              className={`p-4 border rounded-lg transition-all cursor-pointer ${
                area.selected
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-background hover:bg-muted/50'
              }`}
              onClick={() => handleToggleArea(area.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={area.selected}
                  onCheckedChange={() => handleToggleArea(area.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label className="font-medium text-foreground cursor-pointer">
                    {area.title}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{area.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Additional Focus */}
      <Card className="p-6">
        <Label htmlFor="additional-focus" className="text-lg font-semibold">
          Additional Concerns or Focus Areas
        </Label>
        <Textarea
          id="additional-focus"
          value={additionalFocus.replace(/\[JIM_GENERAL\]\s*/g, '')}
          onChange={(e) => {
            const val = e.target.value;
            onAdditionalFocusChange(generalSelected ? `[JIM_GENERAL] ${val}` : val);
          }}
          placeholder="Any specific concerns or areas you'd like us to pay special attention to?"
          className="mt-4 min-h-24"
        />
        <p className="text-xs text-muted-foreground mt-2">
          This helps us tailor the analysis to what matters most to you
        </p>
      </Card>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <p className="text-sm text-green-900 dark:text-green-100">
            {selectedCount === totalCount
              ? 'All focus areas selected — Jim will provide comprehensive analysis across all dimensions.'
              : generalSelected && selectedCount === 1
                ? "Jim's Overall Assessment selected — you'll get a holistic big-picture CFO review."
                : `${selectedCount} focus area${selectedCount !== 1 ? 's' : ''} selected. ${generalSelected ? "Includes Jim's holistic overview. " : ''}We will concentrate our analysis on these key areas.`}
          </p>
        </Card>
      )}
    </div>
  );
}
