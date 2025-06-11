import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    const emulatorConfig = {
      useEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR,
      authEmulatorHost: process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST
    };

    const configStatus = {
      hasApiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'demo-api-key',
      hasAuthDomain: !!firebaseConfig.authDomain && firebaseConfig.authDomain !== 'demo.firebaseapp.com',
      hasProjectId: !!firebaseConfig.projectId && firebaseConfig.projectId !== 'demo-project',
      hasStorageBucket: !!firebaseConfig.storageBucket && firebaseConfig.storageBucket !== 'demo.appspot.com',
      hasMessagingSenderId: !!firebaseConfig.messagingSenderId && firebaseConfig.messagingSenderId !== '123456789',
      hasAppId: !!firebaseConfig.appId && firebaseConfig.appId !== 'demo-app-id'
    };

    const allConfigValid = Object.values(configStatus).every(Boolean);
    
    return NextResponse.json({
      success: true,
      message: 'Environment configuration check',
      firebase: {
        config: {
          apiKey: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'missing',
          authDomain: firebaseConfig.authDomain || 'missing',
          projectId: firebaseConfig.projectId || 'missing',
          storageBucket: firebaseConfig.storageBucket || 'missing',
          messagingSenderId: firebaseConfig.messagingSenderId || 'missing',
          appId: firebaseConfig.appId ? firebaseConfig.appId.substring(0, 15) + '...' : 'missing'
        },
        status: configStatus,
        allValid: allConfigValid
      },
      emulator: emulatorConfig,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Environment check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
}