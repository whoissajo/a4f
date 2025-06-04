
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { cn, SearchGroupId, SearchGroup } from '../../../lib/utils'; // Updated path
import useWindowSize from '../../../hooks/use-window-size';
import { toast } from 'sonner';

interface GroupSelectorProps {
    selectedGroup: SearchGroupId;
    onGroupSelect: (group: SearchGroup) => void; // Changed to pass full SearchGroup object
    status: 'ready' | 'processing' | 'error';
    onExpandChange?: React.Dispatch<React.SetStateAction<boolean>>;
    availableGroups: SearchGroup[]; // New prop for filtered groups
}

interface ToolbarButtonProps {
    group: SearchGroup;
    isSelected: boolean;
    onClick: () => void;
}

interface SelectionContentProps {
    selectedGroup: SearchGroupId;
    onGroupSelect: (group: SearchGroup) => void; // Changed to pass full SearchGroup object
    status: 'ready' | 'processing' | 'error';
    onExpandChange?: React.Dispatch<React.SetStateAction<boolean>>;
    availableGroups: SearchGroup[]; // New prop
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ group, isSelected, onClick }) => {
    const Icon = group.icon;
    const controls = useAnimation();
    
    const commonClassNames = cn(
        "relative flex items-center justify-center",
        "size-8",
        "rounded-full",
        "transition-colors duration-300",
        isSelected ? "bg-neutral-500 dark:bg-neutral-600 text-white dark:text-neutral-300" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
    );
    
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
    };
    
    return (
        <motion.button
            animate={controls}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={commonClassNames}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={group.name}
            data-group-id={group.id}
        >
            <Icon className="size-4" />
        </motion.button>
    );
};

const SelectionContent: React.FC<SelectionContentProps> = ({ selectedGroup, onGroupSelect, status, onExpandChange, availableGroups }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isProcessing = status === 'processing';
    const { width } = useWindowSize();
    const isMobile = width ? width < 768 : false;

    const handleGroupSelectInternal = (group: SearchGroup) => {
        onGroupSelect(group);
        if (isMobile) setIsExpanded(false);
    };

    const handleToggleExpand = () => {
        if (isMobile && !isProcessing) setIsExpanded((prev) => !prev);
    };

    useEffect(() => {
        if (onExpandChange) {
            onExpandChange(isMobile ? isExpanded : false);
        }
    }, [isExpanded, onExpandChange, isMobile]);

    const visibleGroups = useMemo(() => {
        if (isMobile && !isExpanded) {
            return availableGroups.filter(g => g.id === selectedGroup);
        }
        return availableGroups;
    }, [availableGroups, isMobile, isExpanded, selectedGroup]);


    if (availableGroups.length === 0) {
        return (
            <div className="inline-flex items-center justify-center size-9 p-0.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs text-xs text-muted-foreground">
                N/A
            </div>
        );
    }


    return (
        <motion.div
            layout={false}
            initial={false}
            animate={{
                width: isMobile
                    ? (isExpanded ? '100%' : '38px')
                    : (isExpanded && !isProcessing ? 'auto' : '30px'),
                gap: isExpanded && !isProcessing ? '0.5rem' : 0,
                paddingRight: isExpanded && !isProcessing ? '0.4rem' : 0,
            }}
            transition={{
                duration: 0.2,
                ease: 'easeInOut',
            }}
            className={cn(
                'inline-flex items-center min-w-[38px] p-0.5',
                'rounded-full border border-neutral-200 dark:border-neutral-800',
                'bg-white dark:bg-neutral-900 shadow-xs overflow-visible',
                'relative z-10',
                isProcessing && 'opacity-50 pointer-events-none',
                isMobile && isExpanded && 'overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700',
                isMobile && !isExpanded && 'overflow-hidden'
            )}
            onMouseEnter={() => !isMobile && !isProcessing && setIsExpanded(true)}
            onMouseLeave={() => !isMobile && !isProcessing && setIsExpanded(false)}
        >
            <AnimatePresence initial={false}>
                {visibleGroups.map((group, index) => {
                    const showItem = isMobile ? true : (isExpanded && !isProcessing) || selectedGroup === group.id;
                    const isLastItem = index === visibleGroups.length - 1;
                    return (
                        <motion.div
                            key={group.id}
                            layout={false}
                            animate={{
                                width: showItem ? '28px' : 0,
                                opacity: showItem ? 1 : 0,
                                marginRight: (showItem && isLastItem && isExpanded) ? '2px' : 0
                            }}
                            transition={{ duration: 0.15, ease: 'easeInOut' }}
                            className={cn('m-0!', isLastItem && isExpanded && showItem ? 'pr-0.5' : '')}
                        >
                            <ToolbarButton
                                group={group}
                                isSelected={selectedGroup === group.id}
                                onClick={() => isMobile && !isExpanded && visibleGroups.length > 1 // Only toggle if there are other groups to show
                                    ? handleToggleExpand() 
                                    : handleGroupSelectInternal(group)
                                }
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
};

export const GroupSelector: React.FC<GroupSelectorProps> = ({ selectedGroup, onGroupSelect, status, onExpandChange, availableGroups }) => {
    return (
        <SelectionContent
            selectedGroup={selectedGroup}
            onGroupSelect={onGroupSelect}
            status={status}
            onExpandChange={onExpandChange}
            availableGroups={availableGroups}
        />
    );
};
