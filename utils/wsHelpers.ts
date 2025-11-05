// utils/wsHelpers.ts
import * as FileSystem from "expo-file-system";

// 네이티브 모듈(react-native-zip-archive)은 Expo Go에서 바로 동작하지 않습니다.
// dev client 또는 실제 빌드가 필요하므로, 로드 실패 시엔 자동으로 원본 파일로 fallback 합니다.
let RNZipArchive: { zip: (src: string, dest: string) => Promise<string> } | null = null;
try {
  // 런타임에만 require -> 타입은 d.ts로 보완
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  RNZipArchive = require("react-native-zip-archive");
} catch {
  RNZipArchive = null;
}

/** base64 → ArrayBuffer */
export function b64ToArrayBuffer(b64: string): ArrayBuffer {
  // RN/Expo 환경에서 atob가 없을 수 있으므로 base-64 패키지를 권장하지만,
  // expo-file-system에서 이미 base64로 읽어오므로 여기서는 안전하게 변환만 수행.
  const binary = global.atob ? global.atob(b64 ?? "") : Buffer.from(b64 ?? "", "base64").toString("binary");
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/** file:// URI → ArrayBuffer (Expo) */
export async function fileUriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const normalized = decodeURI(uri);
  const b64 = await FileSystem.readAsStringAsync(normalized, {
    // 구버전 타입 경고가 있으면 문자열 리터럴로 캐스팅
        encoding: "base64" as any,  // ✅ ← 여기만 문자열로 수정
  });
  return b64ToArrayBuffer(b64);
}

/** (선택) 단일 파일을 zip으로 감싸기. 모듈 미존재/실패 시 원본 경로 반환 */
export async function zipSingleFileIfAvailable(fileUri: string): Promise<string> {
  if (!RNZipArchive) return fileUri;
  const target = fileUri.replace(/\.mp4$/i, "") + ".zip";
  try {
    await RNZipArchive.zip(fileUri, target);
    return target;
  } catch (e) {
    console.warn("zip 실패, 원본 사용:", e);
    return fileUri;
  }
}
