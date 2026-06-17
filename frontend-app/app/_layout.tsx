import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { PreviewPerfilProvider } from '@/context/PreviewPerfilContext';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* noop */
});

/** Guard: redirige entre el grupo (auth) y el área autenticada según la sesión. */
function RootNavigator() {
  const { sesion, inicializando } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (inicializando) return;
    SplashScreen.hideAsync().catch(() => {
      /* noop */
    });

    const enAuth = segments[0] === '(auth)';

    if (!sesion && !enAuth) {
      router.replace('/(auth)/login');
    } else if (sesion && enAuth) {
      router.replace('/(tabs)');
    }
  }, [sesion, inicializando, segments, router]);

  if (inicializando) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.brandIndigo,
        }}
      >
        <ActivityIndicator color={colors.white} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="gestion-equipos"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="tienda/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="proximamente" options={{ animation: 'slide_from_right' }} />
      {/* Rutas de perfil CAMPO (placeholders sin backend). */}
      <Stack.Screen name="mi-marcacion" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="mi-rol" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="mis-solicitudes" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="notificaciones" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PreviewPerfilProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </PreviewPerfilProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
