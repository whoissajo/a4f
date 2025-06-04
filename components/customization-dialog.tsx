
// components/customization-dialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SearchGroupId, searchGroups as allSearchGroupsConfig } from '@/lib/utils'; // Ensure correct path
import { Settings, History, MessageSquareText, Mic, Globe, Book, YoutubeIcon, Code, Bot as BuddyIcon, Image as ImageIcon } from 'lucide-react';

interface CustomizationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isChatHistoryFeatureEnabled: boolean;
  onToggleChatHistoryFeature: (enabled: boolean) => void;
  isTextToSpeechFeatureEnabled: boolean;
  onToggleTextToSpeechFeature: (enabled: boolean) => void;
  enabledSearchGroupIds: SearchGroupId[];
  onToggleSearchGroup: (groupId: SearchGroupId) => void;
}

const getGroupIcon = (groupId: SearchGroupId): React.ElementType => {
    const groupConfig = allSearchGroupsConfig.find(g => g.id === groupId);
    return groupConfig?.icon || Settings; // Default icon if not found
};

export const CustomizationDialog: React.FC<CustomizationDialogProps> = ({
  isOpen,
  onOpenChange,
  isChatHistoryFeatureEnabled,
  onToggleChatHistoryFeature,
  isTextToSpeechFeatureEnabled,
  onToggleTextToSpeechFeature,
  enabledSearchGroupIds,
  onToggleSearchGroup,
}) => {

  const availableGroupsToCustomize = allSearchGroupsConfig.filter(g => g.show);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customization Settings
          </DialogTitle>
          <DialogDescription>
            Tailor your chat experience. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-3 -mr-3 dialog-custom-scrollbar">
          <div className="space-y-6 py-4">
            {/* Chat History Toggle */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <History className="h-4 w-4 text-muted-foreground"/>
                    Chat History
                </h4>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <Label htmlFor="chat-history-toggle" className="text-sm text-card-foreground cursor-pointer">
                        Enable Chat History
                        <p className="text-xs text-muted-foreground mt-0.5">Save and load past conversations.</p>
                    </Label>
                    <Switch
                        id="chat-history-toggle"
                        checked={isChatHistoryFeatureEnabled}
                        onCheckedChange={onToggleChatHistoryFeature}
                        aria-label="Toggle chat history feature"
                    />
                </div>
            </div>

            <Separator />

            {/* Text-to-Speech Toggle */}
             <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mic className="h-4 w-4 text-muted-foreground"/>
                    Accessibility
                </h4>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <Label htmlFor="tts-toggle" className="text-sm text-card-foreground cursor-pointer">
                        Enable Text-to-Speech
                         <p className="text-xs text-muted-foreground mt-0.5">Allow the assistant's messages to be read aloud.</p>
                    </Label>
                    <Switch
                        id="tts-toggle"
                        checked={isTextToSpeechFeatureEnabled}
                        onCheckedChange={onToggleTextToSpeechFeature}
                        aria-label="Toggle text-to-speech feature"
                    />
                </div>
            </div>
            
            <Separator />

            {/* Search Groups Toggles */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-muted-foreground"/>
                Enabled Search Groups
                <p className="text-xs text-muted-foreground">(Select which search modes are available)</p>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableGroupsToCustomize.map((group) => {
                  const Icon = getGroupIcon(group.id);
                  return (
                    <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <Label htmlFor={`group-toggle-${group.id}`} className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer">
                        <Icon className="h-4 w-4 text-muted-foreground"/>
                        {group.name}
                      </Label>
                      <Switch
                        id={`group-toggle-${group.id}`}
                        checked={enabledSearchGroupIds.includes(group.id)}
                        onCheckedChange={() => onToggleSearchGroup(group.id)}
                        aria-label={`Toggle ${group.name} search group`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
