import React from 'react';
import { Leaf } from 'lucide-react';

const Loader = ({ fullPage = false, message = 'جاري التحميل...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      {/* Nature-themed pulsing/spinning loader */}
      <div className="relative flex items-center justify-center h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        {/* Leaf icon spinning inside */}
        <Leaf className="h-7 w-7 text-primary animate-pulse" />
      </div>
      <p className="text-stone-600 font-medium text-lg animate-pulse font-cairo">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-stone-50/90 z-50 flex items-center justify-center backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center w-full">{content}</div>;
};

export default Loader;
