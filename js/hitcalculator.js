import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from "react-native";
import Svg, { Rect, Circle, G, Line } from "react-native-svg";
import { Picker } from "@react-native-picker/picker";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function App() {
  const [cols, setCols] = useState(5);
  const [rows, setRows] = useState(5);
  const [baseSize, setBaseSize] = useState(25);
  const [templateType, setTemplateType] = useState("circle_small");

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [template, setTemplate] = useState({
    x: SCREEN_WIDTH / 2,
    y: 200,
  });

  const lastDrag = useRef({ x: template.x, y: template.y });

  // 🎯 template radius
  const radius = templateType === "circle_large" ? 100 : 60;

  // 🧠 grid
  const units = useMemo(() => {
    const arr = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        arr.push({
          x: x * baseSize + 100,
          y: y * baseSize + 100,
          row: y,
        });
      }
    }
    return arr;
  }, [cols, rows, baseSize]);

  // 🔥 circle vs square
  function circleHit(sx, sy, size) {
    const cx = template.x;
    const cy = template.y;

    const corners = [
      [sx, sy],
      [sx + size, sy],
      [sx, sy + size],
      [sx + size, sy + size],
    ];

    let inside = corners.filter(([x, y]) => {
      const dx = x - cx;
      const dy = y - cy;
      return dx * dx + dy * dy <= radius * radius;
    }).length;

    if (inside === 4) return "full";
    if (inside > 0) return "partial";

    const centerX = sx + size / 2;
    const centerY = sy + size / 2;

    const dx = centerX - cx;
    const dy = centerY - cy;

    if (dx * dx + dy * dy <= radius * radius) return "partial";

    return "none";
  }

  // 🔥 flame
  function flameHit(sx, sy, size) {
    const px = sx + size / 2;
    const py = sy + size / 2;

    const origin = template;
    const length = 200;
    const startW = 20;
    const endW = 60;

    const dx = px - origin.x;
    const dy = py - origin.y;

    const t = dx / length;
    if (t < 0 || t > 1) return "none";

    const width = startW + (endW - startW) * t;

    if (Math.abs(dy) <= width / 2) return "partial";

    return "none";
  }

  // ⚡ line
  function lineHits() {
    let hitRows = new Set();

    units.forEach((u) => {
      const dx = Math.abs(u.x - template.x);
      if (dx < baseSize / 2) {
        hitRows.add(u.row);
      }
    });

    return hitRows.size;
  }

  // 📊 stats
  const stats = useMemo(() => {
    let full = 0;
    let partial = 0;

    if (templateType === "line") {
      return { full: lineHits(), partial: 0, total: lineHits() };
    }

    units.forEach((u) => {
      let res =
        templateType === "flame"
          ? flameHit(u.x, u.y, baseSize)
          : circleHit(u.x, u.y, baseSize);

      if (res === "full") full++;
      if (res === "partial") partial++;
    });

    return { full, partial, total: full + partial };
  }, [units, template, templateType]);

  // 🖐️ drag FIXED (ei drift)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderGrant: () => {
      lastDrag.current = { ...template };
    },

    onPanResponderMove: (_, gesture) => {
      setTemplate({
        x: lastDrag.current.x + gesture.dx,
        y: lastDrag.current.y + gesture.dy,
      });
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Template Calculator</Text>

      <Text style={styles.stats}>
        Full: {stats.full} | Partial: {stats.partial} | Total: {stats.total}
      </Text>

      {/* CONTROLS */}
      <View style={styles.row}>
        <Text>Files</Text>
        <Button label="-" onPress={() => setCols((c) => Math.max(1, c - 1))} />
        <Text>{cols}</Text>
        <Button label="+" onPress={() => setCols((c) => c + 1)} />
      </View>

      <View style={styles.row}>
        <Text>Ranks</Text>
        <Button label="-" onPress={() => setRows((r) => Math.max(1, r - 1))} />
        <Text>{rows}</Text>
        <Button label="+" onPress={() => setRows((r) => r + 1)} />
      </View>

      <Picker selectedValue={baseSize} onValueChange={setBaseSize}>
        <Picker.Item label="20mm" value={20} />
        <Picker.Item label="25mm" value={25} />
        <Picker.Item label="40mm" value={40} />
      </Picker>

      <Picker selectedValue={templateType} onValueChange={setTemplateType}>
        <Picker.Item label='3" Blast' value="circle_small" />
        <Picker.Item label='5" Blast' value="circle_large" />
        <Picker.Item label="Flame" value="flame" />
        <Picker.Item label="Line" value="line" />
      </Picker>

      {/* CANVAS */}
      <View {...panResponder.panHandlers}>
        <Svg width={SCREEN_WIDTH} height={400}>
          <G transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
            {units.map((u, i) => {
              let result =
                templateType === "flame"
                  ? flameHit(u.x, u.y, baseSize)
                  : templateType === "line"
                    ? "none"
                    : circleHit(u.x, u.y, baseSize);

              let color = "#EEE";
              if (result === "full") color = "#8B5A2B";
              if (result === "partial") color = "#D2B48C";

              return (
                <Rect
                  key={i}
                  x={u.x}
                  y={u.y}
                  width={baseSize}
                  height={baseSize}
                  fill={color}
                  stroke="black"
                />
              );
            })}

            {/* templates */}
            {templateType.includes("circle") && (
              <Circle
                cx={template.x}
                cy={template.y}
                r={radius}
                fill="rgba(255,165,0,0.5)"
              />
            )}

            {templateType === "line" && (
              <Line
                x1={template.x}
                y1={0}
                x2={template.x}
                y2={400}
                stroke="red"
                strokeWidth={3}
              />
            )}

            {templateType === "flame" && (
              <Circle cx={template.x} cy={template.y} r={10} fill="orange" />
            )}
          </G>
        </Svg>
      </View>
    </View>
  );
}

// 🔘 button helper
function Button({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginVertical: 5,
  },
  btn: {
    backgroundColor: "white",
    padding: 5,
    marginHorizontal: 5,
  },
});
