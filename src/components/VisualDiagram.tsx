import React from 'react';

interface VisualDiagramProps {
  diagram: string;
}

export const VisualDiagram: React.FC<VisualDiagramProps> = ({ diagram }) => {
  return (
    <div className="w-full my-4 p-5 rounded-2xl bg-[#0E0E18] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Soft background grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #7C5CFF 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {diagram === 'tree-lca' ? (
          /* Tree LCA Diagram */
          <svg viewBox="0 0 360 210" className="w-full h-auto select-none">
            {/* Edges */}
            <line x1="180" y1="40" x2="100" y2="105" stroke="#3D3D58" strokeWidth="2.5" />
            <line x1="180" y1="40" x2="260" y2="105" stroke="#3D3D58" strokeWidth="2.5" />
            <line x1="100" y1="105" x2="60" y2="175" stroke="#3D3D58" strokeWidth="2.5" />
            <line x1="100" y1="105" x2="140" y2="175" stroke="#3D3D58" strokeWidth="2.5" />

            {/* Root: A */}
            <circle cx="180" cy="40" r="22" fill="#14141F" stroke="#7C5CFF" strokeWidth="2.5" />
            <text x="180" y="46" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="16">A</text>

            {/* Node B (LCA) */}
            <circle cx="100" cy="105" r="22" fill="#14141F" stroke="#3DDC97" strokeWidth="3" />
            <text x="100" y="111" textAnchor="middle" fill="#3DDC97" fontWeight="bold" fontSize="16">B</text>

            {/* Node C */}
            <circle cx="260" cy="105" r="22" fill="#14141F" stroke="#3D3D58" strokeWidth="2.5" />
            <text x="260" y="111" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="16">C</text>

            {/* Node D (Target 1) */}
            <circle cx="60" cy="175" r="22" fill="#1C1C2B" stroke="#FF5CAA" strokeWidth="2.5" />
            <text x="60" y="181" textAnchor="middle" fill="#FF5CAA" fontWeight="bold" fontSize="16">D</text>

            {/* Node E (Target 2) */}
            <circle cx="140" cy="175" r="22" fill="#1C1C2B" stroke="#FF5CAA" strokeWidth="2.5" />
            <text x="140" y="181" textAnchor="middle" fill="#FF5CAA" fontWeight="bold" fontSize="16">E</text>
          </svg>
        ) : (
          /* Graph Components Diagram */
          <svg viewBox="0 0 380 180" className="w-full h-auto select-none">
            {/* Component 1 (Triangle) */}
            <line x1="60" y1="50" x2="150" y2="50" stroke="#7C5CFF" strokeWidth="2.5" />
            <line x1="150" y1="50" x2="105" y2="130" stroke="#7C5CFF" strokeWidth="2.5" />
            <line x1="105" y1="130" x2="60" y2="50" stroke="#7C5CFF" strokeWidth="2.5" />

            <circle cx="60" cy="50" r="18" fill="#14141F" stroke="#7C5CFF" strokeWidth="2" />
            <text x="60" y="55" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="14">1</text>

            <circle cx="150" cy="50" r="18" fill="#14141F" stroke="#7C5CFF" strokeWidth="2" />
            <text x="150" y="55" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="14">2</text>

            <circle cx="105" cy="130" r="18" fill="#14141F" stroke="#7C5CFF" strokeWidth="2" />
            <text x="105" y="135" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="14">3</text>

            {/* Component 2 (Line) */}
            <line x1="250" y1="90" x2="330" y2="90" stroke="#FFB45C" strokeWidth="2.5" />

            <circle cx="250" cy="90" r="18" fill="#14141F" stroke="#FFB45C" strokeWidth="2" />
            <text x="250" y="95" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="14">4</text>

            <circle cx="330" cy="90" r="18" fill="#14141F" stroke="#FFB45C" strokeWidth="2" />
            <text x="330" y="95" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="14">5</text>
          </svg>
        )}
      </div>
    </div>
  );
};
