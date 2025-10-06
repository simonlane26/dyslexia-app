declare global {
  interface Window {
    __dwSpeak?: (t: string) => Promise<void>;
    __dw_playWithEleven?: (t: string) => Promise<void>;
  }
}

export {};

