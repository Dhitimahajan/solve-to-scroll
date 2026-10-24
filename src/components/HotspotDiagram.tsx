import React from 'react';

interface HotspotDiagramProps {
  questionId: string;
  selectedHotspot: string | null;
  correctHotspot: string | null;
  isEvaluated: boolean;
  onSelectHotspot: (hotspotId: string) => void;
}

export const HotspotDiagram: React.FC<HotspotDiagramProps> = ({
  questionId,
  selectedHotspot,
  correctHotspot,
  isEvaluated,
  onSelectHotspot,
}) => {
  const getHotspotState = (id: string) => {
    if (!isEvaluated) {
      return selectedHotspot === id ? 'selected' : 'idle';
    }
    if (correctHotspot === id) {
      return 'correct';
    }
    if (selectedHotspot === id && selectedHotspot !== correctHotspot) {
      return 'wrong';
    }
    return 'idle';
  };

  const getStyleForState = (state: string) => {
    switch (state) {
      case 'selected':
        return 'stroke-[#7C5CFF] stroke-[3] filter drop-shadow(0 0 10px #7C5CFF)';
      case 'correct':
        return 'stroke-[#3DDC97] stroke-[3.5] filter drop-shadow(0 0 15px #3DDC97)';
      case 'wrong':
        return 'stroke-[#FF5C7A] stroke-[3.5] filter drop-shadow(0 0 15px #FF5C7A)';
      default:
        return 'stroke-[#9A9AB0] hover:stroke-white stroke-[2]';
    }
  };

  const getNodeFill = (state: string) => {
    switch (state) {
      case 'selected':
        return '#25253A';
      case 'correct':
        return 'rgba(61, 220, 151, 0.25)';
      case 'wrong':
        return 'rgba(255, 92, 122, 0.25)';
      default:
        return '#14141F';
    }
  };

  return (
    <div className="w-full my-4 p-6 rounded-2xl bg-[#0E0E18] border border-white/10 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Soft Dotted Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #7C5CFF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 w-full max-w-[560px]">
        {questionId === 'll-020' ? (
          /* Linked List Deletion Diagram */
          <svg viewBox="0 0 560 140" className="w-full h-auto select-none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#9A9AB0" />
              </marker>
              <marker id="arrow-selected" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#7C5CFF" />
              </marker>
              <marker id="arrow-correct" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#3DDC97" />
              </marker>
              <marker id="arrow-wrong" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#FF5C7A" />
              </marker>
            </defs>

            {/* Node 1 */}
            <rect x="20" y="45" width="70" height="50" rx="10" fill="#14141F" stroke="#3D3D58" strokeWidth="2" />
            <text x="55" y="75" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="16">Node 1</text>

            {/* Pointer 1 -> 2 */}
            <g
              data-hotspot="ptr-1-2"
              tabIndex={0}
              role="button"
              onClick={() => onSelectHotspot('ptr-1-2')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHotspot('ptr-1-2')}
              className="cursor-pointer group outline-none"
            >
              <line x1="90" y1="70" x2="145" y2="70" className={getStyleForState(getHotspotState('ptr-1-2'))} markerEnd="url(#arrow)" />
              <rect x="90" y="50" width="55" height="40" fill="transparent" />
            </g>

            {/* Node 2 */}
            <rect x="150" y="45" width="70" height="50" rx="10" fill="#14141F" stroke="#3D3D58" strokeWidth="2" />
            <text x="185" y="75" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="16">Node 2</text>

            {/* Pointer 2 -> 3 (The Bug!) */}
            <g
              data-hotspot="ptr-2-3"
              tabIndex={0}
              role="button"
              onClick={() => onSelectHotspot('ptr-2-3')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHotspot('ptr-2-3')}
              className="cursor-pointer group outline-none"
            >
              <line x1="220" y1="70" x2="275" y2="70" className={getStyleForState(getHotspotState('ptr-2-3'))} markerEnd="url(#arrow)" />
              <rect x="220" y="50" width="55" height="40" fill="transparent" />
            </g>

            {/* Node 3 (Marked for deletion) */}
            <rect x="280" y="45" width="70" height="50" rx="10" fill="#1C1C2B" stroke="#FF5C7A" strokeDasharray="4 4" strokeWidth="2" />
            <text x="315" y="75" textAnchor="middle" fill="#FF5C7A" fontWeight="bold" fontSize="16">Node 3 ✕</text>

            {/* Pointer 3 -> 4 */}
            <g
              data-hotspot="ptr-3-4"
              tabIndex={0}
              role="button"
              onClick={() => onSelectHotspot('ptr-3-4')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHotspot('ptr-3-4')}
              className="cursor-pointer group outline-none"
            >
              <line x1="350" y1="70" x2="405" y2="70" className={getStyleForState(getHotspotState('ptr-3-4'))} markerEnd="url(#arrow)" />
              <rect x="350" y="50" width="55" height="40" fill="transparent" />
            </g>

            {/* Node 4 */}
            <rect x="410" y="45" width="70" height="50" rx="10" fill="#14141F" stroke="#3D3D58" strokeWidth="2" />
            <text x="445" y="75" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="16">Node 4</text>

            {/* Pointer 4 -> NULL */}
            <g
              data-hotspot="ptr-4-null"
              tabIndex={0}
              role="button"
              onClick={() => onSelectHotspot('ptr-4-null')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHotspot('ptr-4-null')}
              className="cursor-pointer group outline-none"
            >
              <line x1="480" y1="70" x2="520" y2="70" className={getStyleForState(getHotspotState('ptr-4-null'))} markerEnd="url(#arrow)" />
              <rect x="480" y="50" width="45" height="40" fill="transparent" />
            </g>
            <text x="540" y="75" textAnchor="middle" fill="#6C7086" fontSize="14" fontFamily="monospace">∅</text>
          </svg>
        ) : (
          /* Binary Search Tree Violation Diagram */
          <svg viewBox="0 0 460 220" className="w-full h-auto select-none">
            {/* Tree Branch Lines */}
            <line x1="230" y1="40" x2="130" y2="110" stroke="#3D3D58" strokeWidth="2" />
            <line x1="230" y1="40" x2="330" y2="110" stroke="#3D3D58" strokeWidth="2" />
            <line x1="330" y1="110" x2="270" y2="180" stroke="#3D3D58" strokeWidth="2" />
            <line x1="330" y1="110" x2="390" y2="180" stroke="#3D3D58" strokeWidth="2" />

            {/* Root Node: 20 */}
            <g
              data-hotspot="node-20"
              tabIndex={0}
              role="button"
              onClick={() => onSelectHotspot('node-20')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHotspot('node-20')}
              className="cursor-pointer outline-none"
            >
              <circle cx="230" cy="40" r="24" fill={getNodeFill(getHotspotState('node-20'))} className={getStyleForState(getHotspotState('node-20'))} />
              <text x="230" y="46" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="16">20</text>
            </g>

            {/* Left Child: 10 */}
            <g
              data-hotspot="node-10"
              tabIndex={0}
              role="button"
              onClick={() => onSelectHotspot('node-10')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHotspot('node-10')}
              className="cursor-pointer outline-none"
            >
              <circle cx="130" cy="110" r="24" fill={getNodeFill(getHotspotState('node-10'))} className={getStyleForState(getHotspotState('node-10'))} />
              <text x="130" y="116" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="16">10</text>
            </g>

            {/* Right Child: 30 */}
            <g
              data-hotspot="node-30"
              tabIndex={0}
              role="button"
              onClick={() => onSelectHotspot('node-30')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHotspot('node-30')}
              className="cursor-pointer outline-none"
            >
              <circle cx="330" cy="110" r="24" fill={getNodeFill(getHotspotState('node-30'))} className={getStyleForState(getHotspotState('node-30'))} />
              <text x="330" y="116" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="16">30</text>
            </g>

            {/* Right-Left: 15 (VIOLATION! In right subtree of 20, cannot be 15) */}
            <g
              data-hotspot="node-15"
              tabIndex={0}
              role="button"
              onClick={() => onSelectHotspot('node-15')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHotspot('node-15')}
              className="cursor-pointer outline-none"
            >
              <circle cx="270" cy="180" r="24" fill={getNodeFill(getHotspotState('node-15'))} className={getStyleForState(getHotspotState('node-15'))} />
              <text x="270" y="186" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="16">15</text>
            </g>

            {/* Right-Right: 35 */}
            <g
              data-hotspot="node-25"
              tabIndex={0}
              role="button"
              onClick={() => onSelectHotspot('node-25')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectHotspot('node-25')}
              className="cursor-pointer outline-none"
            >
              <circle cx="390" cy="180" r="24" fill={getNodeFill(getHotspotState('node-25'))} className={getStyleForState(getHotspotState('node-25'))} />
              <text x="390" y="186" textAnchor="middle" fill="#F4F4F8" fontWeight="bold" fontSize="16">35</text>
            </g>
          </svg>
        )}
      </div>

      <div className="mt-3 text-xs text-muted font-medium flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-accent-purple animate-ping" />
        <span>Click or tap the diagram to select</span>
      </div>
    </div>
  );
};
