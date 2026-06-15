import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../ui/Typography';

export interface TabItem {
    key: string;
    title: string;
}

interface CustomTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (key: string) => void;
    useWhiteText?: boolean;
}

export const CustomTabs: React.FC<CustomTabsProps> = ({ tabs, activeTab, onTabChange, useWhiteText = false }) => {
    return (
        <View style={useWhiteText ? styles.containerTransparent : styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {tabs.map((tab) => {
                    const isActive = tab.key === activeTab;

                    let textColor = isActive ? Colors.primary : Colors.textSecondary;
                    if (useWhiteText) {
                        textColor = isActive ? Colors.white : 'rgba(255,255,255,0.6)';
                    }

                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tab,
                                isActive && styles.activeTab,
                                useWhiteText && isActive && { borderBottomColor: Colors.white }
                            ]}
                            onPress={() => onTabChange(tab.key)}
                        >
                            <Typography
                                variant="body"
                                weight={isActive ? 'bold' : 'medium'}
                                color={textColor as any}
                            >
                                {tab.title}
                            </Typography>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    containerTransparent: {
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingHorizontal: 16,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: Colors.primary,
    },
});

