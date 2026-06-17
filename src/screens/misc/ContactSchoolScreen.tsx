import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import { AppHeader } from '../../components/layout/AppHeader';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { InnonshColors } from '../../theme/colors';
import { InnonshSpacing, InnonshRadius } from '../../theme/spacing';
import { InnonshShadows } from '../../theme/shadows';
import { apiClient } from '../../api/client';

export default function ContactSchoolScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const [form, setForm] = useState({
        parentName: '',
        email: '',
        phoneNumber: '',
        childName: '',
        age: '',
        interestedClass: '',
        branch: '',
        address: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!form.parentName.trim()) return 'Parent Name is required.';
        if (!form.phoneNumber.trim() || form.phoneNumber.length < 10) return 'Valid Mobile Number is required.';
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return 'Valid Email Address is required.';
        if (!form.childName.trim()) return 'Student Name is required.';
        if (!form.age.trim() || isNaN(Number(form.age))) return 'Valid Student Age is required.';
        if (!form.interestedClass.trim()) return 'Interested Class is required.';
        return null;
    };

    const handleSubmit = async () => {
        const errorMsg = validateForm();
        if (errorMsg) {
            Alert.alert('Validation Error', errorMsg);
            return;
        }

        try {
            setLoading(true);

            const additionalDetails = [
                form.email ? `Email: ${form.email}` : '',
                form.branch ? `Branch Interested: ${form.branch}` : '',
                form.address ? `Address: ${form.address}` : '',
                form.message ? `Message: ${form.message}` : ''
            ].filter(Boolean).join('\n');

            const payload = {
                parentName: form.parentName.trim(),
                childName: form.childName.trim(),
                age: Number(form.age),
                phoneNumber: form.phoneNumber.trim(),
                interestedClass: form.interestedClass.trim(),
                notes: additionalDetails
            };

            await apiClient.post('/enquiries', payload);
            
            Alert.alert(
                'Success',
                'Thank you for your enquiry. Our school team will contact you shortly.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            console.error('Enquiry submission error', error);
            const msg = error.response?.data?.message || 'Failed to submit enquiry. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={[styles.headerBg, { height: insets.top + 100 }]}>
                <LinearGradient
                    colors={[InnonshColors.primary, InnonshColors.primaryDark]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </View>

            <AppHeader title="Enquiry Form" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formCard}>
                    <Typography variant="h3" color={InnonshColors.primary} style={styles.title}>
                        Get in Touch
                    </Typography>
                    <Typography variant="body" color={InnonshColors.textSecondary} style={styles.subtitle}>
                        Fill out the form below and we will contact you shortly.
                    </Typography>

                    <View style={styles.inputGroup}>
                        <Typography variant="caption" style={styles.label}>Parent Name *</Typography>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter parent name"
                            placeholderTextColor={InnonshColors.textSecondary}
                            value={form.parentName}
                            onChangeText={(text) => handleChange('parentName', text)}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Typography variant="caption" style={styles.label}>Mobile Number *</Typography>
                            <TextInput
                                style={styles.input}
                                placeholder="Mobile number"
                                placeholderTextColor={InnonshColors.textSecondary}
                                keyboardType="phone-pad"
                                value={form.phoneNumber}
                                onChangeText={(text) => handleChange('phoneNumber', text)}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Typography variant="caption" style={styles.label}>Email Address</Typography>
                            <TextInput
                                style={styles.input}
                                placeholder="Optional"
                                placeholderTextColor={InnonshColors.textSecondary}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={form.email}
                                onChangeText={(text) => handleChange('email', text)}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="caption" style={styles.label}>Student Name *</Typography>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter student name"
                            placeholderTextColor={InnonshColors.textSecondary}
                            value={form.childName}
                            onChangeText={(text) => handleChange('childName', text)}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Typography variant="caption" style={styles.label}>Student Age *</Typography>
                            <TextInput
                                style={styles.input}
                                placeholder="Age"
                                placeholderTextColor={InnonshColors.textSecondary}
                                keyboardType="numeric"
                                value={form.age}
                                onChangeText={(text) => handleChange('age', text)}
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Typography variant="caption" style={styles.label}>Class *</Typography>
                            <TextInput
                                style={styles.input}
                                placeholder="E.g. Nursery"
                                placeholderTextColor={InnonshColors.textSecondary}
                                value={form.interestedClass}
                                onChangeText={(text) => handleChange('interestedClass', text)}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="caption" style={styles.label}>Branch Interested</Typography>
                        <TextInput
                            style={styles.input}
                            placeholder="Optional branch name"
                            placeholderTextColor={InnonshColors.textSecondary}
                            value={form.branch}
                            onChangeText={(text) => handleChange('branch', text)}
                        />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Typography variant="caption" style={styles.label}>Address</Typography>
                        <TextInput
                            style={styles.input}
                            placeholder="Optional address"
                            placeholderTextColor={InnonshColors.textSecondary}
                            value={form.address}
                            onChangeText={(text) => handleChange('address', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Typography variant="caption" style={styles.label}>Message</Typography>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Any specific questions?"
                            placeholderTextColor={InnonshColors.textSecondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={form.message}
                            onChangeText={(text) => handleChange('message', text)}
                        />
                    </View>

                    <Button
                        title="Submit Enquiry"
                        onPress={handleSubmit}
                        loading={loading}
                        style={styles.submitBtn}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: InnonshColors.background,
    },
    headerBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        overflow: 'hidden',
    },
    scrollContent: {
        padding: InnonshSpacing.lg,
        paddingBottom: 40,
    },
    formCard: {
        backgroundColor: InnonshColors.surface,
        borderRadius: InnonshRadius.xl,
        padding: InnonshSpacing.lg,
        ...InnonshShadows.lg,
    },
    title: {
        marginBottom: InnonshSpacing.sm,
    },
    subtitle: {
        marginBottom: InnonshSpacing.lg,
    },
    inputGroup: {
        marginBottom: InnonshSpacing.md,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        marginBottom: InnonshSpacing.xs,
        color: InnonshColors.textSecondary,
        marginLeft: 4,
    },
    input: {
        backgroundColor: InnonshColors.background,
        borderWidth: 1,
        borderColor: InnonshColors.border,
        borderRadius: InnonshRadius.md,
        paddingHorizontal: InnonshSpacing.md,
        height: 50,
        fontSize: 16,
        color: InnonshColors.textPrimary,
        fontFamily: 'GoogleSans-Medium',
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },
    submitBtn: {
        marginTop: 8,
        borderRadius: InnonshRadius.md,
        height: 56,
    }
});

