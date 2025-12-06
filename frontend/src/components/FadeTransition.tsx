import { useState } from 'react';

export default function FadeTransition({ children, triggerKey }: { children: React.ReactNode, triggerKey: string }) {
  const [show, setShow] = useState(true);
  const [prevKey, setPrevKey] = useState(triggerKey);

  if (prevKey !== triggerKey) {
    setShow(false);
    setTimeout(() => {
      setPrevKey(triggerKey);
      setShow(true);
    }, 200); // fade out duration
  }

  return (
    <div className={`transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
}
