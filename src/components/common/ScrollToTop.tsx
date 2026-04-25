import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useParams();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};
