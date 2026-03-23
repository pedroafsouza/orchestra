import { useCallback, useRef } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  useReactFlow,
} from '@xyflow/react';
import { getConditionColor } from './DecisionNode';

/**
 * Build an SVG path through source → bend points → target using smooth step-like segments.
 * Each segment is a right-angled path with rounded corners.
 */
function buildBendPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  bends: { x: number; y: number }[],
): string {
  const points = [{ x: sx, y: sy }, ...bends, { x: tx, y: ty }];
  const r = 8; // corner radius
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const mid = i < points.length - 2 ? points[i + 1] : null;

    if (!mid || i === points.length - 2) {
      // Last segment: go horizontal then vertical (or direct if aligned)
      const dx = to.x - from.x;
      const dy = to.y - from.y;

      if (i === 0 && bends.length === 0) {
        // No bends: use step path (horizontal to midpoint, then vertical)
        const midX = from.x + dx / 2;
        const ry = Math.min(r, Math.abs(dy) / 2, Math.abs(dx) / 4);

        if (Math.abs(dx) < 1) {
          d += ` L ${to.x} ${to.y}`;
        } else if (Math.abs(dy) < 1) {
          d += ` L ${to.x} ${to.y}`;
        } else {
          const sx1 = dx > 0 ? 1 : -1;
          const sy1 = dy > 0 ? 1 : -1;
          d += ` L ${midX - sx1 * ry} ${from.y}`;
          d += ` Q ${midX} ${from.y} ${midX} ${from.y + sy1 * ry}`;
          d += ` L ${midX} ${to.y - sy1 * ry}`;
          d += ` Q ${midX} ${to.y} ${midX + sx1 * ry} ${to.y}`;
          d += ` L ${to.x} ${to.y}`;
        }
      } else {
        d += ` L ${to.x} ${to.y}`;
      }
    } else {
      // Segment to a bend point: straight line
      d += ` L ${to.x} ${to.y}`;
    }
  }

  return d;
}

/**
 * Compute midpoints between consecutive path points for drag handles.
 */
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
      insertIndex: i, // insert a new bend at this index
    });
  }

  return mids;
}

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  sourceHandleId,
  selected,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const dragRef = useRef<{
    type: 'bend' | 'mid';
    index: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const bends: { x: number; y: number }[] = (data as any)?.bends || [];

  // Build path
  const edgePath = buildBendPath(sourceX, sourceY, targetX, targetY, bends);

  // Label position: midpoint of the full path
  const allPoints = [{ x: sourceX, y: sourceY }, ...bends, { x: targetX, y: targetY }];
  const midIdx = Math.floor(allPoints.length / 2);
  const labelX =
    allPoints.length % 2 === 0
      ? (allPoints[midIdx - 1].x + allPoints[midIdx].x) / 2
      : allPoints[midIdx].x;
  const labelY =
    allPoints.length % 2 === 0
      ? (allPoints[midIdx - 1].y + allPoints[midIdx].y) / 2
      : allPoints[midIdx].y;

  const label = (data as any)?.label as string | undefined;
  const conditionIndex = (data as any)?.conditionIndex as number | undefined;

  const isConditionEdge = sourceHandleId?.startsWith('condition-');
  const condIdx = isConditionEdge
    ? parseInt(sourceHandleId!.split('-')[1])
    : conditionIndex;
  const edgeColor = condIdx != null ? getConditionColor(condIdx) : undefined;

  const mergedStyle = {
    ...style,
    ...(edgeColor
      ? { stroke: edgeColor, strokeWidth: 2, strokeDasharray: 'none' }
      : {}),
  };

  const mergedMarker = edgeColor
    ? { ...((markerEnd as any) || {}), color: edgeColor }
    : markerEnd;

  const updateBends = useCallback(
    (newBends: { x: number; y: number }[]) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === id
            ? { ...e, data: { ...((e.data as any) || {}), bends: newBends } }
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
      // We need to account for the zoom/pan of the ReactFlow viewport
      // Get the delta in screen coords and apply to the flow coords
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
        // 'mid' — insert a new bend point
        const newBends = [...bends];
        newBends.splice(index, 0, { x: newX, y: newY });
        updateBends(newBends);
        // Switch to bend drag mode for the newly inserted point
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
      // Remove bend point on double-click
      const newBends = bends.filter((_, i) => i !== index);
      updateBends(newBends);
    },
    [bends, updateBends],
  );

  const midpoints = getMidpoints(sourceX, sourceY, targetX, targetY, bends);
  const isImplicit = (data as any)?.implicit;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={mergedStyle}
        markerEnd={mergedMarker as any}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="
              absolute pointer-events-all nodrag nopan
              px-2 py-0.5 rounded-full text-[10px] font-semibold
              shadow-sm border border-border
              bg-card text-foreground
            "
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              ...(edgeColor
                ? { borderColor: edgeColor, color: edgeColor }
                : {}),
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Draggable bend points */}
      {!isImplicit && selected && (
        <EdgeLabelRenderer>
          {bends.map((bend, i) => (
            <div
              key={`bend-${i}`}
              className="absolute pointer-events-all nodrag nopan cursor-grab active:cursor-grabbing"
              style={{
                transform: `translate(-50%, -50%) translate(${bend.x}px, ${bend.y}px)`,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: edgeColor || 'hsl(var(--primary))',
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
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

          {/* Midpoint handles — appear as smaller dots for adding new bends */}
          {midpoints.map((mp, i) => (
            <div
              key={`mid-${i}`}
              className="absolute pointer-events-all nodrag nopan cursor-crosshair opacity-40 hover:opacity-100 transition-opacity"
              style={{
                transform: `translate(-50%, -50%) translate(${mp.x}px, ${mp.y}px)`,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: edgeColor || 'hsl(var(--primary))',
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                zIndex: 9,
              }}
              onPointerDown={(e) =>
                handlePointerDown(e, 'mid', mp.insertIndex, mp.x, mp.y)
              }
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              title="Drag to add bend point"
            />
          ))}
        </EdgeLabelRenderer>
      )}
    </>
  );
}
