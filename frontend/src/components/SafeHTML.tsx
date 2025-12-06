'use client';

import { forwardRef } from 'react';

export const SafeInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    return <input {...props} ref={ref} />;
  }
);
SafeInput.displayName = 'SafeInput';

export const SafeTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => {
    return <textarea {...props} ref={ref} />;
  }
);
SafeTextarea.displayName = 'SafeTextarea';

const SafeHTML = ({ children, content, ...props }: { children?: React.ReactNode; content?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{content || children}</div>;
};

export default SafeHTML;