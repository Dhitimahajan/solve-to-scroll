import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#7C5CFF', '#FF5CAA', '#FFB45C', '#3DDC97'],
    });

    // Right burst
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#7C5CFF', '#FF5CAA', '#FFB45C', '#3DDC97'],
    });

    // Center starburst
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#7C5CFF', '#FF5CAA', '#FFB45C', '#3DDC97'],
      });
    }, 200);
  } catch (err) {
    console.warn('Confetti error:', err);
  }
}
