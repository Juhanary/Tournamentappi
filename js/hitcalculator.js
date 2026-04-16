// hitcalculator.js – plain React (no React Native)
const { useState, useMemo, useRef } = React;

window.HitCalculator = function HitCalculator() {
  const SCREEN_WIDTH = window.innerWidth;

  const [cols, setCols] = useState(5);
  const [rows, setRows] = useState(5);
  const [baseSize, setBaseSize] = useState(25);
  const [templateType, setTemplateType] = useState("circle_small");

  const [template, setTemplate] = useState({
    x: SCREEN_WIDTH / 2,
    y: 200,
  });

  // template radius
  const radius = templateType === "circle_large" ? 100 : 60;

  // grid
  const units = useMemo(() => {
    const arr = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        arr.push({ x: c * baseSize + 100, y: r * baseSize + 100, row: r });
      }
    }
    return arr;
  }, [cols, rows, baseSize]);

  // circle vs square hit detection
  function circleHit(sx, sy, size) {
    const cx = template.x;
    const cy = template.y;
    const corners = [
      [sx, sy],
      [sx + size, sy],
      [sx, sy + size],
      [sx + size, sy + size],
    ];
    const inside = corners.filter(([x, y]) => {
      const dx = x - cx;
      const dy = y - cy;
      return dx * dx + dy * dy <= radius * radius;
    }).length;
    if (inside === 4) return "full";
    if (inside > 0) return "partial";
    const dx = sx + size / 2 - cx;
    const dy = sy + size / 2 - cy;
    if (dx * dx + dy * dy <= radius * radius) return "partial";
    return "none";
  }

  // flame hit detection
  function flameHit(sx, sy, size) {
    const px = sx + size / 2;
    const py = sy + size / 2;
    const length = 200;
    const startW = 20;
    const endW = 60;
    const dx = px - template.x;
    const dy = py - template.y;
    const t = dx / length;
    if (t < 0 || t > 1) return "none";
    const width = startW + (endW - startW) * t;
    if (Math.abs(dy) <= width / 2) return "partial";
    return "none";
  }

  // line hit detection
  function lineHits() {
    const hitRows = new Set();
    units.forEach((u) => {
      if (Math.abs(u.x - template.x) < baseSize / 2) hitRows.add(u.row);
    });
    return hitRows.size;
  }

  // stats
  const stats = useMemo(() => {
    if (templateType === "line") {
      const h = lineHits();
      return { full: h, partial: 0, total: h };
    }
    let full = 0, partial = 0;
    units.forEach((u) => {
      const res = templateType === "flame"
        ? flameHit(u.x, u.y, baseSize)
        : circleHit(u.x, u.y, baseSize);
      if (res === "full") full++;
      if (res === "partial") partial++;
    });
    return { full, partial, total: full + partial };
  }, [units, template, templateType]);

  // drag handling (mouse + touch)
  const dragRef = useRef(null);

  function startDrag(clientX, clientY) {
    dragRef.current = { mx: clientX, my: clientY, tx: template.x, ty: template.y };
  }

  function moveDrag(clientX, clientY) {
    if (!dragRef.current) return;
    setTemplate({
      x: dragRef.current.tx + (clientX - dragRef.current.mx),
      y: dragRef.current.ty + (clientY - dragRef.current.my),
    });
  }

  function endDrag() {
    dragRef.current = null;
  }

  return (
    <div style={hcss.container}>
      <div style={hcss.title}>Template Calculator</div>

      <div style={hcss.stats}>
        Full: {stats.full} | Partial: {stats.partial} | Total: {stats.total}
      </div>

      {/* Controls */}
      <div style={hcss.row}>
        <span>Files</span>
        <button style={hcss.btn} onClick={() => setCols(c => Math.max(1, c - 1))}>-</button>
        <span>{cols}</span>
        <button style={hcss.btn} onClick={() => setCols(c => c + 1)}>+</button>
      </div>

      <div style={hcss.row}>
        <span>Ranks</span>
        <button style={hcss.btn} onClick={() => setRows(r => Math.max(1, r - 1))}>-</button>
        <span>{rows}</span>
        <button style={hcss.btn} onClick={() => setRows(r => r + 1)}>+</button>
      </div>

      <select style={hcss.select} value={baseSize} onChange={e => setBaseSize(+e.target.value)}>
        <option value={20}>20mm</option>
        <option value={25}>25mm</option>
        <option value={40}>40mm</option>
      </select>

      <select style={hcss.select} value={templateType} onChange={e => setTemplateType(e.target.value)}>
        <option value="circle_small">3" Blast</option>
        <option value="circle_large">5" Blast</option>
        <option value="flame">Flame</option>
        <option value="line">Line</option>
      </select>

      {/* Canvas */}
      <svg
        width={SCREEN_WIDTH}
        height={400}
        style={{ display: "block", cursor: "crosshair", touchAction: "none" }}
        onMouseDown={e => startDrag(e.clientX, e.clientY)}
        onMouseMove={e => moveDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={e => { e.preventDefault(); const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
        onTouchMove={e => { e.preventDefault(); const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
        onTouchEnd={endDrag}
      >
        {units.map((u, i) => {
          const result =
            templateType === "flame" ? flameHit(u.x, u.y, baseSize)
            : templateType === "line" ? "none"
            : circleHit(u.x, u.y, baseSize);
          const color = result === "full" ? "#8B5A2B" : result === "partial" ? "#D2B48C" : "#EEE";
          return (
            <rect
              key={i}
              x={u.x} y={u.y}
              width={baseSize} height={baseSize}
              fill={color} stroke="black"
            />
          );
        })}

        {templateType.includes("circle") && (
          <circle cx={template.x} cy={template.y} r={radius} fill="rgba(255,165,0,0.5)" />
        )}

        {templateType === "line" && (
          <line x1={template.x} y1={0} x2={template.x} y2={400} stroke="red" strokeWidth={3} />
        )}

        {templateType === "flame" && (
          <circle cx={template.x} cy={template.y} r={10} fill="orange" />
        )}
      </svg>
    </div>
  );
};

const hcss = {
  container: {
    backgroundColor: "#6aa84f",
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  stats: {
    textAlign: "center",
    color: "white",
    margin: "10px 0",
  },
  row: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    margin: "5px 0",
    color: "white",
  },
  btn: {
    backgroundColor: "white",
    padding: "5px 10px",
    margin: "0 5px",
    border: "1px solid #ccc",
    cursor: "pointer",
  },
  select: {
    width: "100%",
    background: "var(--d3, #333)",
    border: "1px solid rgba(201,168,76,.28)",
    borderRadius: 3,
    color: "white",
    fontSize: 16,
    padding: "9px 11px",
    marginBottom: 10,
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
  },
};
