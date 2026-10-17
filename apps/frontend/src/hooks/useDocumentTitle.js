import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | CareerOS` : 'CareerOS — AI-Powered Job Search';
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

export default useDocumentTitle;
