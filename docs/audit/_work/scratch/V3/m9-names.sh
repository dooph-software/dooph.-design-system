#!/bin/sh
# count whole-word mentions of each name across shipped consumer docs + README
cd /c/Users/stick/Github/dooph/dooph-Design-System
DOCS="skills/dooph-design-system-usage/SKILL.md skills/dooph-design-system-usage/references/responsive-sheet-modal.md skills/dooph-design-system-theming/SKILL.md skills/dooph-design-system-theming/references/token-contract.md README.md"
for n in AITextPart AIToolPart AIThinkingPart AITurnSummary UserMessageHeader ChatDivider AIContextGauge AIPromptInput AIPromptInputSubmit AIPromptInputTextarea AIPromptInputToolbar AIPromptInputToolbarEnd AIPromptInputToolbarStart AIModelSelectItem AIModelSelectTrigger AIModelTooltipContent AIThinkingEffortSelector AIThinkingPartState AIToolPartState AIToolPartVariant TooltipProvider ToastProvider useToast TooltipTypes ToastTypes TabVariant TabSize ToggleVariant ToggleSize SegmentedVariant SegmentedSize InputVariant; do
  c=$(cat $DOCS | grep -oE "(^|[^A-Za-z0-9_\$])$n([^A-Za-z0-9_\$]|$)" | wc -l); echo "$n $c"; done
echo "--- any 'AI' word in usage skill: $(grep -cE '\bAI' skills/dooph-design-system-usage/SKILL.md)"
