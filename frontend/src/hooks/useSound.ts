import { useCallback } from 'react';

let globalIsMuted = false;
if (typeof window !== 'undefined') {
  globalIsMuted = localStorage.getItem('zypher_muted') === 'true';
}

export const toggleGlobalMute = () => {
  globalIsMuted = !globalIsMuted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('zypher_muted', String(globalIsMuted));
    window.dispatchEvent(new Event('zypher_mute_toggled'));
  }
  return globalIsMuted;
};

export const getGlobalIsMuted = () => globalIsMuted;

// Preload audio files
let hoverAudio: HTMLAudioElement | null = null;
let clickAudio: HTMLAudioElement | null = null;
let successAudio: HTMLAudioElement | null = null;
let errorAudio: HTMLAudioElement | null = null;
let executionAudio: HTMLAudioElement | null = null;
let emergencyAudio: HTMLAudioElement | null = null;

if (typeof window !== 'undefined') {
  hoverAudio = new Audio('/sounds/hover.wav');
  clickAudio = new Audio('/sounds/click.wav');
  successAudio = new Audio('/sounds/success.wav');
  errorAudio = new Audio('/sounds/error.wav');
  executionAudio = new Audio('/sounds/execution.wav');
  emergencyAudio = new Audio('/sounds/emergency.wav');
}

export const useSound = () => {
  const playHover = useCallback(() => {
    if (globalIsMuted || !hoverAudio) return;
    try {
      hoverAudio.currentTime = 0;
      hoverAudio.play().catch((e) => console.error('Hover audio error:', e));
    } catch (e) {}
  }, []);

  const playClick = useCallback(() => {
    if (globalIsMuted || !clickAudio) return;
    try {
      clickAudio.currentTime = 0;
      clickAudio.play().catch((e) => console.error('Click audio error:', e));
    } catch (e) {}
  }, []);

  const playSuccess = useCallback(() => {
    if (globalIsMuted || !successAudio) return;
    try {
      successAudio.currentTime = 0;
      successAudio.play().catch((e) => console.error('Success audio error:', e));
    } catch (e) {}
  }, []);

  const playError = useCallback(() => {
    if (globalIsMuted || !errorAudio) return;
    try {
      errorAudio.currentTime = 0;
      errorAudio.play().catch((e) => console.error('Error audio error:', e));
    } catch (e) {}
  }, []);

  const playExecution = useCallback(() => {
    if (globalIsMuted || !executionAudio) return;
    try {
      executionAudio.currentTime = 0;
      executionAudio.play().catch((e) => console.error('Execution audio error:', e));
    } catch (e) {}
  }, []);

  const playEmergency = useCallback(() => {
    if (globalIsMuted || !emergencyAudio) return;
    try {
      emergencyAudio.currentTime = 0;
      emergencyAudio.play().catch((e) => console.error('Emergency audio error:', e));
    } catch (e) {}
  }, []);

  return { playHover, playClick, playSuccess, playError, playExecution, playEmergency };
};
