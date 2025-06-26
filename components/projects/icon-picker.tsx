"use client"

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import * as lucide from 'lucide-react';
import { toast } from 'sonner';

// A curated list of icons for the user to choose from
const iconList = [
  "Briefcase", "BarChart2", "BookOpen", "Bot", "Building2", "Calendar", "CheckSquare",
  "ClipboardList", "Cloud", "Code", "Compass", "Database", "Flag", "Folder",
  "Globe", "Heart", "Home", "Image", "Layers", "Lightbulb", "Link", "Lock",
  "Mail", "MapPin", "MessageSquare", "Mic", "Music", "Package", "PenSquare",
  "Phone", "PieChart", "Pin", "Rocket", "Settings", "Shield", "ShoppingBag",
  "Star", "Tag", "Target", "TerminalSquare", "ThumbsUp", "Ticket", "Trash",
  "TrendingUp", "Trophy", "User", "Video", "Wallet", "Watch", "Zap",
] as const;

type IconName = (typeof iconList)[number];

interface IconPickerProps {
  currentIcon: string;
  onIconChange: (iconName: IconName) => Promise<void>;
}

// A helper to dynamically render Lucide icons by name
const LucideIcon = ({ name, ...props }: { name: IconName } & lucide.LucideProps) => {
  const IconComponent = lucide[name];
  if (!IconComponent) return <lucide.Briefcase {...props} />; // Fallback icon
  return <IconComponent {...props} />;
};

export const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onIconChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleIconSelect = async (iconName: IconName) => {
    setIsOpen(false);
    toast.promise(onIconChange(iconName), {
      loading: 'Saving icon...',
      success: 'Icon updated!',
      error: 'Failed to update icon.',
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <LucideIcon name={currentIcon as IconName} className="h-8 w-8 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid grid-cols-6 gap-2">
          {iconList.map(iconName => (
            <Button
              key={iconName}
              variant="outline"
              size="icon"
              onClick={() => handleIconSelect(iconName)}
              className={currentIcon === iconName ? "border-primary" : ""}
            >
              <LucideIcon name={iconName} className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}