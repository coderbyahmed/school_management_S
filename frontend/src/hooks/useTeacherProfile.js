import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const useTeacherProfile = () => {
  const { user } = useAuth();
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'teacher') return;

    let cancelled = false;
    api.get('/auth/teacher-profile')
      .then((res) => {
        if (!cancelled) setTeacherProfile(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setTeacherProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  return { teacherProfile, loading };
};

export default useTeacherProfile;
