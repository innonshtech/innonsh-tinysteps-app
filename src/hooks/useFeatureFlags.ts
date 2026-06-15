import { useState, useEffect } from 'react';
import { SettingsService } from '../services/settings.service';

const DEFAULT_FLAGS = {
    dashboard: true,
    attendance: true,
    events: true,
    communications: true,
    fees: true,
    enquiries: true,
    admissions: false,
    classes: true,
    students: true,
    teachers: true,
    timetable: false,
    exams: false,
    leaves: false,
    transport: false,
    gallery: true,
    settings: true,
};

export const useFeatureFlags = () => {
    const [flags, setFlags] = useState<Record<string, boolean>>(DEFAULT_FLAGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlags = async () => {
            try {
                const res = await SettingsService.getSettings();
                if (res.success && res.settings.featureFlags) {
                    setFlags((prev) => ({ ...prev, ...res.settings.featureFlags }));
                }
            } catch (error) {
                console.error("Failed to fetch feature flags, using defaults", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFlags();
    }, []);

    const isModuleEnabled = (moduleName: string): boolean => {
        return flags[moduleName] ?? false;
    };

    return { flags, loading, isModuleEnabled };
};

