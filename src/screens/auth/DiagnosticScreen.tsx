import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { API_CONFIG } from '../../config/api';

export default function DiagnosticScreen({ navigation }: any) {
    const [healthStatus, setHealthStatus] = useState<string>('Checking...');
    const [networkReachable, setNetworkReachable] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    const checkHealth = async () => {
        setLoading(true);
        setHealthStatus('Checking...');
        setNetworkReachable(null);
        try {
            // Force a fetch to the health endpoint, stripping the trailing /api if needed
            const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
            const url = `${baseUrl}/api/health`;
            
            console.log('[Diagnostics] Fetching:', url);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, { 
                method: 'GET',
                signal: controller.signal 
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                setHealthStatus(`OK (${JSON.stringify(data)})`);
                setNetworkReachable(true);
            } else {
                setHealthStatus(`Failed (HTTP ${response.status})`);
                setNetworkReachable(true); // Reached server, but error
            }
        } catch (error: any) {
            console.error('[Diagnostics] Health check error:', error.message);
            if (error.name === 'AbortError') {
                setHealthStatus('Timeout (Server unreachable)');
            } else {
                setHealthStatus(`Error: ${error.message}`);
            }
            setNetworkReachable(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkHealth();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Network Diagnostics</Text>
            
            <View style={styles.card}>
                <Text style={styles.label}>Configured API URL:</Text>
                <Text style={styles.value}>{API_CONFIG.BASE_URL}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Localhost Warning:</Text>
                <Text style={[styles.value, (API_CONFIG.BASE_URL.includes('localhost') || API_CONFIG.BASE_URL.includes('127.0.0.1')) ? styles.error : styles.success]}>
                    {(API_CONFIG.BASE_URL.includes('localhost') || API_CONFIG.BASE_URL.includes('127.0.0.1')) 
                        ? 'YES (This will fail on real devices/Expo Go!)' 
                        : 'No (Good)'}
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Backend Health (Reachability):</Text>
                {loading ? (
                    <ActivityIndicator size="small" color={Colors.primary} style={{ alignSelf: 'flex-start', marginTop: 8 }} />
                ) : (
                    <Text style={[styles.value, networkReachable ? styles.success : styles.error]}>
                        {healthStatus}
                    </Text>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={checkHealth}>
                    <Text style={styles.buttonText}>Retry Check</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => navigation.goBack()}>
                    <Text style={styles.secondaryButtonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    error: {
        color: '#d32f2f',
        fontWeight: 'bold',
    },
    success: {
        color: '#2e7d32',
        fontWeight: 'bold',
    },
    buttonContainer: {
        marginTop: 20,
        gap: 10,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    secondaryButtonText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
