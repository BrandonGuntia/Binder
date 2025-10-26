import { Stack } from "expo-router";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

export default function RootLayout() {
  return (
    <DarkModeProvider>
      <Stack />
    </DarkModeProvider>
  );
}
