import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants";
import { BranchWithMessages } from "../types";

interface BranchFlowViewProps {
  branches: BranchWithMessages[];
  activeBranchId: string;
  onBranchSelect: (branchId: string) => void;
}

interface BranchNode {
  branch: BranchWithMessages;
  x: number;
  y: number;
  level: number;
}

interface LayoutNode {
  id: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

interface Edge {
  from: string;
  to: string;
}

// Simple tree layout algorithm (similar to dagre but simpler)
const layoutTree = (
  nodes: LayoutNode[],
  edges: Edge[],
  nodeSpacing = 40,
  levelSpacing = 80
): Map<string, { x: number; y: number }> => {
  const positions = new Map<string, { x: number; y: number }>();
  const childrenMap = new Map<string, string[]>();
  const roots: string[] = [];

  // Build children map and find roots
  edges.forEach((edge) => {
    if (!childrenMap.has(edge.from)) {
      childrenMap.set(edge.from, []);
    }
    childrenMap.get(edge.from)!.push(edge.to);
  });

  nodes.forEach((node) => {
    const hasParent = edges.some((e) => e.to === node.id);
    if (!hasParent) {
      roots.push(node.id);
    }
  });

  // Calculate subtree widths
  const subtreeWidths = new Map<string, number>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const calculateSubtreeWidth = (nodeId: string): number => {
    if (subtreeWidths.has(nodeId)) return subtreeWidths.get(nodeId)!;

    const node = nodeMap.get(nodeId);
    if (!node) return 0;

    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) {
      subtreeWidths.set(nodeId, node.width);
      return node.width;
    }

    const childrenWidth = children.reduce(
      (sum, childId) => sum + calculateSubtreeWidth(childId) + nodeSpacing,
      0
    );
    const width = Math.max(node.width, childrenWidth - nodeSpacing);
    subtreeWidths.set(nodeId, width);
    return width;
  };

  // Position nodes recursively
  const positionNode = (nodeId: string, x: number, y: number): void => {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    positions.set(nodeId, { x, y });

    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return;

    // Calculate total width of children
    const totalWidth =
      children.reduce(
        (sum, childId) => sum + (subtreeWidths.get(childId) || 0) + nodeSpacing,
        0
      ) - nodeSpacing;

    // Center children under parent
    let childX = x - totalWidth / 2 + (subtreeWidths.get(children[0]) || 0) / 2;
    const childY = y + levelSpacing;

    children.forEach((childId) => {
      positionNode(childId, childX, childY);
      childX += (subtreeWidths.get(childId) || 0) + nodeSpacing;
    });
  };

  // Layout each tree
  roots.forEach((rootId) => {
    calculateSubtreeWidth(rootId);
  });

  let offsetX = 0;
  roots.forEach((rootId) => {
    const width = subtreeWidths.get(rootId) || 0;
    positionNode(rootId, offsetX + width / 2, 0);
    offsetX += width + nodeSpacing * 2;
  });

  return positions;
};

export default function BranchFlowView({
  branches,
  activeBranchId,
  onBranchSelect,
}: BranchFlowViewProps) {
  // Build tree structure with proper layout
  const { nodes, edges, canvasSize } = useMemo(() => {
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 54;
    const NODE_SPACING = 40;
    const LEVEL_SPACING = 80;

    // Create layout nodes
    const layoutNodes: LayoutNode[] = branches.map((b) => ({
      id: b.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    }));

    // Create edges
    const layoutEdges: Edge[] = branches
      .filter((b) => b.parentId)
      .map((b) => ({
        from: b.parentId!,
        to: b.id,
      }));

    // Calculate positions using tree layout
    const positions = layoutTree(
      layoutNodes,
      layoutEdges,
      NODE_SPACING,
      LEVEL_SPACING
    );

    // Create positioned nodes
    const positionedNodes: BranchNode[] = branches.map((branch) => {
      const pos = positions.get(branch.id) || { x: 0, y: 0 };
      return {
        branch,
        x: pos.x,
        y: pos.y,
        level: 0, // Not needed with proper layout
      };
    });

    // Calculate canvas size
    let maxX = 0;
    let maxY = 0;
    positionedNodes.forEach((node) => {
      maxX = Math.max(maxX, node.x + NODE_WIDTH);
      maxY = Math.max(maxY, node.y + NODE_HEIGHT);
    });

    return {
      nodes: positionedNodes,
      edges: layoutEdges,
      canvasSize: {
        width: maxX + 100,
        height: maxY + 100,
      },
    };
  }, [branches]);

  // Draw SVG-like connections using positioned Views
  const renderConnections = () => {
    const lines: React.ReactElement[] = [];
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 54;

    edges.forEach((edge) => {
      const parentNode = nodes.find((n) => n.branch.id === edge.from);
      const childNode = nodes.find((n) => n.branch.id === edge.to);

      if (parentNode && childNode) {
        // Connection points (center bottom of parent to center top of child)
        const x1 = parentNode.x + NODE_WIDTH / 2;
        const y1 = parentNode.y + NODE_HEIGHT;
        const x2 = childNode.x + NODE_WIDTH / 2;
        const y2 = childNode.y;

        const color = childNode.branch.color || "#6366f1";

        // Draw path: straight down from parent, horizontal, then down to child
        const midY = y1 + (y2 - y1) / 2;

        // Vertical line from parent
        lines.push(
          <View
            key={`v1-${edge.from}-${edge.to}`}
            style={[
              styles.connectionLine,
              {
                position: "absolute",
                left: x1 - 1,
                top: y1,
                width: 2,
                height: midY - y1,
                backgroundColor: color,
              },
            ]}
          />
        );

        // Horizontal line
        lines.push(
          <View
            key={`h-${edge.from}-${edge.to}`}
            style={[
              styles.connectionLine,
              {
                position: "absolute",
                left: Math.min(x1, x2),
                top: midY - 1,
                width: Math.abs(x2 - x1),
                height: 2,
                backgroundColor: color,
              },
            ]}
          />
        );

        // Vertical line to child
        lines.push(
          <View
            key={`v2-${edge.from}-${edge.to}`}
            style={[
              styles.connectionLine,
              {
                position: "absolute",
                left: x2 - 1,
                top: midY,
                width: 2,
                height: y2 - midY,
                backgroundColor: color,
              },
            ]}
          />
        );

        // Arrow head at child
        lines.push(
          <View
            key={`arrow-${edge.from}-${edge.to}`}
            style={[
              styles.arrowHead,
              {
                position: "absolute",
                left: x2 - 4,
                top: y2 - 8,
                borderLeftWidth: 4,
                borderRightWidth: 4,
                borderTopWidth: 8,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopColor: color,
              },
            ]}
          />
        );
      }
    });

    return lines;
  };

  return (
    <ScrollView
      horizontal
      style={styles.container}
      contentContainerStyle={{
        width: canvasSize.width,
        height: canvasSize.height,
      }}
    >
      <ScrollView style={styles.verticalScroll}>
        <View
          style={[
            styles.canvas,
            { width: canvasSize.width, height: canvasSize.height },
          ]}
        >
          {/* Render connections first (background) */}
          {renderConnections()}

          {/* Render nodes */}
          {nodes.map(({ branch, x, y }) => {
            const isActive = branch.id === activeBranchId;
            const messageCount = branch.messages?.length || 0;

            return (
              <TouchableOpacity
                key={branch.id}
                style={[
                  styles.node,
                  {
                    left: x,
                    top: y,
                    borderColor: branch.color,
                    borderWidth: isActive ? 3 : 2,
                  },
                  isActive && styles.activeNode,
                ]}
                onPress={() => onBranchSelect(branch.id)}
              >
                <View style={styles.nodeContent}>
                  <Text
                    style={[styles.nodeName, isActive && styles.activeNodeText]}
                  >
                    {branch.name}
                  </Text>
                  <View
                    style={[styles.badge, { backgroundColor: branch.color }]}
                  >
                    <Text style={styles.badgeText}>{messageCount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  verticalScroll: {
    flex: 1,
  },
  canvas: {
    position: "relative",
  },
  connectionLine: {
    position: "absolute",
    height: 2,
    opacity: 0.5,
  },
  node: {
    position: "absolute",
    width: 200,
    backgroundColor: COLORS.dark.surface,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeNode: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
  },
  nodeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nodeName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark.text,
    flex: 1,
  },
  activeNodeText: {
    color: COLORS.primary,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  arrowHead: {
    width: 0,
    height: 0,
  },
});
