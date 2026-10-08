import confetti from 'canvas-confetti';

// Synthesize pleasant celebratory fanfare using Web Audio API
export function playGoalCelebrationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.15 },
      { freq: 659.25, time: 0.15, duration: 0.15 },
      { freq: 783.99, time: 0.30, duration: 0.18 },
      { freq: 1046.5, time: 0.48, duration: 0.5 },
      { freq: 1318.51, time: 0.65, duration: 0.6 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration + 0.05);
    });
  } catch (err) {
    console.warn('Audio synthesis not allowed or supported:', err);
  }
}

// Trigger festive confetti explosion
export function triggerFullscreenConfetti() {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 99999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#ec4899'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#10b981', '#34d399', '#6ee7b7', '#facc15'],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  } catch (err) {
    console.warn('Confetti error:', err);
  }
}
