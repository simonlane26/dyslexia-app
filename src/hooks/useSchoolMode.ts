'use client';

import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

export type SchoolPlan = 'school_starter' | 'school_mid' | 'school_full';
export type SchoolRole = 'teacher' | 'student';

export interface SchoolModeContext {
  isSchoolMode: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  schoolPlan: SchoolPlan | null;
  schoolId: string | null;
  schoolCode: string | null;
}

const SCHOOL_PLANS: SchoolPlan[] = ['school_starter', 'school_mid', 'school_full'];

export function useSchoolMode(): SchoolModeContext {
  const { user, isLoaded } = useUser();

  return useMemo(() => {
    if (!isLoaded || !user) {
      return {
        isSchoolMode: false,
        isTeacher: false,
        isStudent: false,
        schoolPlan: null,
        schoolId: null,
        schoolCode: null,
      };
    }

    const meta = user.publicMetadata as {
      plan?: string;
      schoolId?: string;
      schoolRole?: SchoolRole;
      schoolCode?: string;
    };

    const plan = meta.plan as SchoolPlan | undefined;
    const isSchoolMode = SCHOOL_PLANS.includes(plan as SchoolPlan);

    return {
      isSchoolMode,
      isTeacher: isSchoolMode && meta.schoolRole === 'teacher',
      isStudent: isSchoolMode && meta.schoolRole === 'student',
      schoolPlan: isSchoolMode ? plan! : null,
      schoolId: meta.schoolId ?? null,
      schoolCode: meta.schoolCode ?? null,
    };
  }, [user, isLoaded]);
}
