import { useCallback, useRef, useState } from 'react';
import {
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { getConditionColor } from './DecisionNode';

/* ------------------------------------------------------------------ */
/*  Edge tier classification                                          */
/* ------------------------------------------------------------------ */

type EdgeTier = 'explicit' | 'condition' | 'implicit';

function classifyEdge(
  data: Record<string, unknown> | undefined,
  sourceHandleId: string | null | undefined,
): EdgeTier {
  if (data?.implicit) return 'implicit';
  const isCondition =
    sourceHandleId?.startsWith('condition-') ||
    data?.conditionIndex != null;
  if (isCondition) return 'condition';
  return 'explicit';
}

/* ------------------------------------------------------------------ */
/*  Smooth cubic bezier through waypoints                             */
/* ------------------------------------------------------------------ */

/**
 * Build a smooth cubic bezier SVG path through source -> bends -> target.
 * Uses Catmull-Rom to cubic-bezier conversion so the curve passes through
 * every waypoint.
 */
function buildSmoothBendPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  bends: { x: number; y: number }[],
): string {
  const pts = [{ x: sx, y: sy }, ...bends, { x: tx, y: ty }];

  if (pts.length === 2) {
    // No bends — should not reach here (we use getBezierPath for that case)
    return `M ${sx} ${sy} L ${tx} ${ty}`;
  }

  // Catmull-Rom with virtual endpoints
  const all = [
    { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y },
    ...pts,
    {
      x: 2 * pts[pts.length - 1].x - pts[pts.length - 2].x,
      y: 2 * pts[pts.length - 1].y - pts[pts.length - 2].y,
    },
  ];

  const tension = 0.35;
  let d = `M ${pts[0].x} ${pts[0].y}`;

  for (let i = 1; i < all.length - 2; i++) {
    const p0 = all[i - 1];
    const p1 = all[i];
    const p2 = all[i + 1];
    const p3 = all[i + 2];

    const cp1x = p1.x + ((p2.x - p0.x) * tension);
    const cp1y = p1.y + ((p2.y - p0.y) * tension);
    const cp2x = p2.x - ((p3.x - p1.x) * tension);
    const cp2y = p2.y - ((p3.y - p1.y) * tension);

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

/* ------------------------------------------------------------------ */
/*  Midpoints helper                                                  */
/* ------------------------------------------------------------------ */

function getMidpoints(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  bends: { x: number; y: number }[],
) {
  const points = [{ x: sx, y: sy }, ...bends, { x: tx, y: ty }];
  const mids: { x: number; y: number; insertIndex: number }[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    mids.push({
      x: (points[i].x + points[i + 1].x) / 2,
      y: (points[i].y + points[i + 1].y) / 2,
      insertIndex: i,
    });
  }

  return mids;
}

/* ------------------------------------------------------------------ */
/*  Custom SVG marker definitions (rendered inside the <svg> via      */
/*  a hidden BaseEdge overlay)                                        */
/* ------------------------------------------------------------------ */

/** Unique marker IDs per edge to support per-edge colors */
export const MARKER_EXPLICIT = 'orchestra-arrow-explicit';
export const MARKER_CONDITION = (idx: number) => `orchestra-arrow-cond-${idx}`;
export const MARKER_IMPLICIT = 'orchestra-arrow-implicit';

/* ------------------------------------------------------------------ */
/*  LabeledEdge component                                             */
/* ------------------------------------------------------------------ */

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  sourceHandleId,
  selected,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const dragRef = useRef<{
    type: 'bend' | 'mid';
    index: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const edgeData = data as Record<string, unknown> | undefined;
  const bends: { x: number; y: number }[] =
    (edgeData?.bends as { x: number; y: number }[]) || [];
  const label = edgeData?.label as string | undefined;
  const tier = classifyEdge(edgeData, sourceHandleId);

  // Condition color
  const isConditionEdge = sourceHandleId?.startsWith('condition-');
  const condIdx = isConditionEdge
    ? parseInt(sourceHandleId!.split('-')[1])
    : (edgeData?.conditionIndex as number | undefined);
  const conditionColor = condIdx != null ? getConditionColor(condIdx) : undefined;

  /* ---- Path computation ---- */
  let edgePath: string;
  let labelX: number;
  let labelY: number;

  if (bends.length === 0) {
    // No bends: use proper bezier path from xyflow
    const [path, lx, ly] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    edgePath = path;
    labelX = lx;
    labelY = ly;
  } else {
    // Has bends: smooth cubic bezier through waypoints
    edgePath = buildSmoothBendPath(sourceX, sourceY, targetX, targetY, bends);

    // Label position: midpoint of all waypoints
    const allPoints = [
      { x: sourceX, y: sourceY },
      ...bends,
      { x: targetX, y: targetY },
    ];
    const midIdx = Math.floor(allPoints.length / 2);
    labelX =
      allPoints.length % 2 === 0
        ? (allPoints[midIdx - 1].x + allPoints[midIdx].x) / 2
        : allPoints[midIdx].x;
    labelY =
      allPoints.length % 2 === 0
        ? (allPoints[midIdx - 1].y + allPoints[midIdx].y) / 2
        : allPoints[midIdx].y;
  }

  /* ---- Tier-based styling ---- */
  let strokeColor: string;
  let strokeWidth: number;
  let dashArray: string | undefined;
  let markerId: string;

  switch (tier) {
    case 'condition':
      strokeColor = conditionColor || 'hsl(var(--primary))';
      strokeWidth = 2.5;
      dashArray = undefined;
      markerId = condIdx != null ? MARKER_CONDITION(condIdx) : MARKER_EXPLICIT;
      break;
    case 'implicit':
      strokeColor = 'hsl(var(--muted-foreground) / 0.4)';
      strokeWidth = 1.5;
      dashArray = '5 3';
      markerId = MARKER_IMPLICIT;
      break;
    default: // explicit
      strokeColor = 'hsl(var(--primary))';
      strokeWidth = 2;
      dashArray = undefined;
      markerId = MARKER_EXPLICIT;
      break;
  }

  // Hover effect: brighten + thicken
  const effectiveStrokeWidth = hovered ? strokeWidth + 1 : strokeWidth;

  const pathStyle: React.CSSProperties = {
    stroke: strokeColor,
    strokeWidth: effectiveStrokeWidth,
    strokeDasharray: dashArray,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
    transition: 'stroke-width 0.15s ease, stroke 0.15s ease',
    filter: hovered ? 'brightness(1.25)' : undefined,
  };

  /* ---- Bend / midpoint callbacks (unchanged logic) ---- */
  const updateBends = useCallback(
    (newBends: { x: number; y: number }[]) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === id
            ? { ...e, data: { ...((e.data as Record<string, unknown>) || {}), bends: newBends } }
            : e,
        ),
      );
    },
    [id, setEdges],
  );

  const handlePointerDown = useCallback(
    (
      e: React.PointerEvent,
      type: 'bend' | 'mid',
      index: number,
      origX: number,
      origY: number,
    ) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        type,
        index,
        startX: e.clientX,
        startY: e.clientY,
        origX,
        origY,
      };
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      e.stopPropagation();

      const { type, index, startX, startY, origX, origY } = dragRef.current;
      const el = (e.target as HTMLElement).closest('.react-flow');
      const viewport = el?.querySelector('.react-flow__viewport');
      let scale = 1;
      if (viewport) {
        const transform = getComputedStyle(viewport).transform;
        const match = transform.match(/matrix\(([^,]+)/);
        if (match) scale = parseFloat(match[1]);
      }

      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;
      const newX = origX + dx;
      const newY = origY + dy;

      if (type === 'bend') {
        const newBends = [...bends];
        newBends[index] = { x: newX, y: newY };
        updateBends(newBends);
      } else {
        const newBends = [...bends];
        newBends.splice(index, 0, { x: newX, y: newY });
        updateBends(newBends);
        dragRef.current = {
          type: 'bend',
          index,
          startX: e.clientX,
          startY: e.clientY,
          origX: newX,
          origY: newY,
        };
      }
    },
    [bends, updateBends],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      const newBends = bends.filter((_, i) => i !== index);
      updateBends(newBends);
    },
    [bends, updateBends],
  );

  const midpoints = getMidpoints(sourceX, sourceY, targetX, targetY, bends);

  /* ---- Label pill styling ---- */
  const labelPillStyle: React.CSSProperties = {
    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
    ...(conditionColor
      ? { borderColor: conditionColor, color: conditionColor }
      : { borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }),
  };

  /* ---- Bend handle color ---- */
  const handleColor = conditionColor || 'hsl(var(--primary))';

  return (
    <>
      {/* Transparent wide hit area for easier hover targeting */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* Animated flow overlay for explicit edges */}
      {tier === 'explicit' && (
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={effectiveStrokeWidth}
          strokeDasharray="8 6"
          strokeLinecap="round"
          opacity={0.3}
          className="orchestra-edge-flow-anim"
        />
      )}

      {/* Main edge path */}
      <path
        d={edgePath}
        fill="none"
        style={pathStyle}
        markerEnd={`url(#${markerId})`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* Label pill */}
      {label && (
        <EdgeLabelRenderer>
          <div
            className="
              absolute pointer-events-all nodrag nopan
              px-2.5 py-1 rounded-full text-[10px] font-semibold leading-none
              shadow-sm border
              bg-card backdrop-blur-sm
            "
            style={labelPillStyle}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Draggable bend points & midpoint insert handles */}
      {!edgeData?.implicit && selected && (
        <EdgeLabelRenderer>
          {/* Existing bend point handles */}
          {bends.map((bend, i) => (
            <div
              key={`bend-${i}`}
              className="absolute pointer-events-all nodrag nopan cursor-grab active:cursor-grabbing"
              style={{
                transform: `translate(-50%, -50%) translate(${bend.x}px, ${bend.y}px)`,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: handleColor,
                border: '2px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)',
                zIndex: 10,
              }}
              onPointerDown={(e) =>
                handlePointerDown(e, 'bend', i, bend.x, bend.y)
              }
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={(e) => handleDoubleClick(e, i)}
              title="Drag to move, double-click to remove"
            />
          ))}

          {/* Midpoint insert handles with + icon */}
          {midpoints.map((mp, i) => (
            <div
              key={`mid-${i}`}
              className="absolute pointer-events-all nodrag nopan cursor-crosshair opacity-40 hover:opacity-100 transition-opacity"
              style={{
                transform: `translate(-50%, -50%) translate(${mp.x}px, ${mp.y}px)`,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: handleColor,
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                zIndex: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                fontWeight: 700,
                lineHeight: 1,
                color: 'white',
              }}
              onPointerDown={(e) =>
                handlePointerDown(e, 'mid', mp.insertIndex, mp.x, mp.y)
              }
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              title="Drag to add bend point"
            >
              +
            </div>
          ))}
        </EdgeLabelRenderer>
      )}
    </>
  );
}
