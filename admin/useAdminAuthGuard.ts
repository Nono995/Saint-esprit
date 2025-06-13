import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './src/config/firebaseConfig';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useAdminAuthGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);
}
