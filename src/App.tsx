/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import React, {useMemo, useEffect, useState} from 'react';
import DevPersistedNavigationContainer from 'navigation/DevPersistedNavigationContainer';
import MainNavigator from 'navigation/MainNavigator';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StorageServiceProvider, useStorageService} from 'services/StorageService';
import Reactotron from 'reactotron-react-native';
import {NativeModules, StatusBar} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import {DemoMode} from 'testMode';
import {TEST_MODE, SUBMIT_URL, RETRIEVE_URL, HMAC_KEY} from 'env';
import {ExposureNotificationServiceProvider} from 'services/ExposureNotificationService';
import {BackendService} from 'services/BackendService';
import {I18nProvider} from 'locale';
import {ThemeProvider} from 'shared/theme';
import {AccessibilityServiceProvider} from 'services/AccessibilityService';
import {captureMessage, captureException} from 'shared/log';
import { catch } from '../metro.config';

// grabs the ip address
if (__DEV__) {
  const host = NativeModules.SourceCode.scriptURL.split('://')[1].split(':')[0];
  Reactotron.configure({host})
    .useReactNative()
    .connect();
}

export interface IFetchData {
  payload: any;
  isFetching: boolean;
}

const appInit = async () => {
  captureMessage('App.appInit()');
  SplashScreen.hide();
};

const App = () => {
  const [regionContent, setRegionContent] = useState<IFetchData>({payload: {en: '', fr: ''}, isFetching: false});

  useEffect(() => {
    setRegionContent({payload: regionContent.payload, isFetching: true});

    const fetchData = async () => {
      try {
        setRegionContent({payload: await backendService.getRegionContent(), isFetching: true});
        appInit();
      } catch (e) {
        setRegionContent({payload: {error: e.message}, isFetching: false});
        appInit();
        captureException(e.message, e);
      }
    };

    fetchData();
  }, []);

  const storageService = useStorageService();
  const backendService = useMemo(() => new BackendService(RETRIEVE_URL, SUBMIT_URL, HMAC_KEY, storageService?.region), [
    storageService,
  ]);

  console.log('*************  regionContent *************');
  try{
    console.log(regionContent.payload.en.RegionContent.ExposureView.Active.NL.CTA);
  }catch(e){
    console.log("not yet");
  }
  console.log('*******************************************');

  return (
    <I18nProvider regionContent={regionContent.payload}>
      <ExposureNotificationServiceProvider backendInterface={backendService}>
        <DevPersistedNavigationContainer persistKey="navigationState">
          <AccessibilityServiceProvider>
            {TEST_MODE ? (
              <DemoMode>
                <MainNavigator />
              </DemoMode>
            ) : (
              <MainNavigator />
            )}
          </AccessibilityServiceProvider>
        </DevPersistedNavigationContainer>
      </ExposureNotificationServiceProvider>
    </I18nProvider>
  );
};

const AppProvider = () => {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="transparent" translucent />
      <StorageServiceProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </StorageServiceProvider>
    </SafeAreaProvider>
  );
};

export default AppProvider;
