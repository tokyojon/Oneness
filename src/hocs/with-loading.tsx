import React from 'react';
import { LoadingState } from '@/components/common/loading-state';

interface WithLoadingProps {
  loading?: boolean;
  loadingText?: string;
}

function withLoading<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  LoadingComponent: React.ComponentType<{ text?: string }> = LoadingState
) {
  return function WithLoadingComponent({
    loading = false,
    loadingText,
    ...props
  }: T & WithLoadingProps) {
    if (loading) {
      return <LoadingComponent text={loadingText} />;
    }
    return <WrappedComponent {...(props as T)} />;
  };
}

export default withLoading;
