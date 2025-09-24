import React, { useEffect, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import { useCameraPermissions } from "expo-camera";

import Driving from "./Driving/driving";
import requestPermissions from "./accessRequest/accessRequest";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    (async () => {
      if (permission?.granted) {
        setGranted(true);
      } else {
        const result = await requestPermissions();
        setGranted(result);
      }
    })();
  }, [permission]);

  if (!granted) {
    return (
      <View style={styles.permissionContainer}>
        <Button title="권한 허용하기" onPress={requestPermission} />
      </View>
    );
  }

  return <Driving />;
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
