import { BrainCircuit } from 'lucide-react';

const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const textSizeClass = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl';
  const iconSize = size === 'lg' ? 30 : size === 'md' ? 24 : 20;

  return (
    <div className="flex items-center gap-2">
      <BrainCircuit className="text-primary" size={iconSize} />
      <h1 className={`font-headline font-bold ${textSizeClass} text-foreground`}>
        Rift AI <span className="text-primary">Assistant</span>
      </h1>
    </div>
  );
};

export default Logo;
