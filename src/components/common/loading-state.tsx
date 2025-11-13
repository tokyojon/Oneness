import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({
  text = 'Loading...',
  className = '',
  size = 'md',
}: LoadingStateProps) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {text && (
        <span className={`ml-2 ${textSizeMap[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
}

export default LoadingState;
