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
            const students = response.data.students || [];

            // Map backend fields to the store requirements if needed
            // The backend returns: _id, firstName, lastName, classId, admissionNo, etc.
            const mappedStudents: Child[] = students.map((s: any) => ({
                _id: s._id,
                name: `${s.firstName} ${s.lastName}`,
                admissionNo: s.admissionNo || '',
                classId: s.classId ? (typeof s.classId === 'object' ? s.classId._id : s.classId) : '',
                className: s.classId && typeof s.classId === 'object' ? s.classId.name : 'Unknown Class',
                avatarUrl: s.profilePicture || undefined,
            }));

            set({ children: mappedStudents, selectedChild: mappedStudents[0] || null });
        } catch (e) {
            console.error('Failed to fetch children', e);
        } finally {
            set({ isLoading: false });
        }
    }
}));

