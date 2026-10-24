// Generates a 1200x630 premium share card PNG via HTML5 Canvas

export interface ShareCardStats {
  streak: number;
  totalSolved: number;
  accuracy: number;
  topTopic: string;
  level: string;
}

export function generateShareCard(stats: ShareCardStats): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Dark Background
  ctx.fillStyle = '#0A0A12';
  ctx.fillRect(0, 0, 1200, 630);

  // 2. Ambient Gradient Blobs
  const grad1 = ctx.createRadialGradient(200, 100, 10, 200, 100, 450);
  grad1.addColorStop(0, 'rgba(124, 92, 255, 0.35)');
  grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, 1200, 630);

  const grad2 = ctx.createRadialGradient(1000, 500, 10, 1000, 500, 450);
  grad2.addColorStop(0, 'rgba(255, 92, 170, 0.28)');
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, 1200, 630);

  // 3. Main Glass Card
  ctx.save();
  ctx.fillStyle = '#14141F';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  roundRect(ctx, 80, 70, 1040, 490, 32);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. Brand Header
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#F4F4F8';
  ctx.fillText('Solve-to-Scroll', 140, 145);

  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.fillStyle = '#FFB45C';
  ctx.fillText('// EARN YOUR SCROLL', 140, 180);

  // Level Badge
  ctx.save();
  ctx.fillStyle = 'rgba(124, 92, 255, 0.2)';
  ctx.strokeStyle = '#7C5CFF';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 920, 115, 140, 44, 22);
  ctx.fill();
  ctx.stroke();
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#F4F4F8';
  ctx.textAlign = 'center';
  ctx.fillText(stats.level.toUpperCase(), 990, 143);
  ctx.restore();

  // 5. Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(140, 215);
  ctx.lineTo(1060, 215);
  ctx.stroke();

  // 6. Metrics Grid (4 Stat Blocks)
  const metrics = [
    { label: 'DAY STREAK', value: `${stats.streak} 🔥`, color: '#FFB45C' },
    { label: 'SOLVED TODAY / TOTAL', value: `${stats.totalSolved}`, color: '#7C5CFF' },
    { label: 'ACCURACY', value: `${stats.accuracy}%`, color: '#3DDC97' },
    { label: 'TOP MASTERY', value: stats.topTopic.toUpperCase(), color: '#FF5CAA' },
  ];

  metrics.forEach((m, idx) => {
    const x = 140 + idx * 235;
    const y = 300;

    // Stat card background
    ctx.save();
    ctx.fillStyle = '#1C1C2B';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, 215, 140, 20);
    ctx.fill();
    ctx.stroke();

    // Value
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = m.color;
    ctx.textAlign = 'left';
    ctx.fillText(m.value, x + 24, y + 68);

    // Label
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#9A9AB0';
    ctx.fillText(m.label, x + 24, y + 105);
    ctx.restore();
  });

  // 7. Footer
  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#9A9AB0';
  ctx.fillText('Transforming social scrolling into algorithmic mastery.', 140, 505);

  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillStyle = '#7C5CFF';
  ctx.textAlign = 'right';
  ctx.fillText('chrome://extensions • Solve-to-Scroll', 1060, 505);

  return canvas.toDataURL('image/png');
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
