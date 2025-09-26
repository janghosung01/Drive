import React from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from "./navigation/rootNavigation";
import { StatusBar }  from "react-native";
export default function App() {
  return (
    <SafeAreaProvider>
        <StatusBar barStyle="dark-content" /> 
      <RootNavigation />
    </SafeAreaProvider>
  );
}