import { create } from 'zustand';

export interface Child {
    _id: string; // Updated from 'id' to '_id' to match backend requirements from Prompt
    name: string;
    avatarUrl?: string;
    admissionNo: string;
    classId: string;
    className: string;
    dob?: string;
    gender?: string;
    medicalInfo?: string;
    pickupPerson?: string;
}

interface ChildState {
    children: Child[];
    selectedChild: Child | null;
    isLoading: boolean;
    setChildren: (children: Child[]) => void;
    setSelectedChild: (child: Child) => void;
    clearChildren: () => void;
    fetchChildren: () => Promise<void>; // To be implemented with API
}

import { apiClient } from '../api/client';
import { mapStudentToChild } from '../utils/formatName';

export const useChildStore = create<ChildState>((set) => ({
    children: [],
    selectedChild: null,
    isLoading: false,

    setChildren: (children) => set({ children, selectedChild: children[0] || null }),

    setSelectedChild: (child) => set({ selectedChild: child }),

    clearChildren: () => set({ children: [], selectedChild: null }),

    fetchChildren: async () => {
        set({ isLoading: true });
        try {
            const response = await apiClient.get('/parent/students');
            const payload = response.data || {};
            const students =
                payload.students ||
                payload.data?.students ||
                (Array.isArray(payload.data) ? payload.data : []);

            const mappedStudents: Child[] = (students as Record<string, unknown>[]).map((student) =>
                mapStudentToChild(student)
            );

            set({ children: mappedStudents, selectedChild: mappedStudents[0] || null });
        } catch (e) {
            console.error('Failed to fetch children', e);
        } finally {
            set({ isLoading: false });
        }
    }
}));

