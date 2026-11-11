## Parameter Schema

### `applyCanvasActions`

Modify the canvas board by applying an ordered list of actions in a single atomic batch. For new iframes that just need automatic placement, use `create-auto`; for manual x/y placement, call `getCanvasState` first to see existing shapes and find empty space.

Create a shapeId once — creating an existing shapeId fails. Use `update` for all later changes (changed properties go inside `updates`), like flipping a `building` placeholder to `live`.

```json
{
  "$defs": {
    "CanvasAlignActionInput": {
      "properties": {
        "type": { "const": "align", "description": "Align multiple shapes.", "type": "string" },
        "shapeIds": { "description": "Target shape ids.", "items": { "type": "string" }, "type": "array" },
        "alignment": { "description": "Alignment mode.", "enum": ["left", "center-horizontal", "right", "top", "center-vertical", "bottom"], "type": "string" }
      },
      "required": ["type", "shapeIds", "alignment"]
    },
    "CanvasCreateActionInput": {
      "properties": {
        "type": { "const": "create", "description": "Create a shape.", "type": "string" },
        "shape": { "$ref": "#/$defs/CanvasShapeInput", "description": "Shape payload." },
        "shapeId": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "Optional deterministic id." }
      },
      "required": ["type", "shape"]
    },
    "CanvasCreateAutoActionInput": {
      "properties": {
        "type": { "const": "create-auto", "description": "Create one or more iframe shapes with automatic placement.", "type": "string" },
        "shapeIds": { "description": "Deterministic ids for created iframe shapes.", "items": { "type": "string" }, "minItems": 1, "type": "array" },
        "shape": { "$ref": "#/$defs/CanvasCreateAutoShapeInput", "description": "Iframe payload shared by every item." },
        "names": { "description": "Per-shape componentName values; must match shapeIds.", "items": { "type": "string" }, "type": "array" }
      },
      "required": ["type", "shapeIds", "shape", "names"]
    },
    "CanvasCreateAutoShapeInput": {
      "properties": {
        "type": { "const": "iframe", "description": "Create-auto creates iframes.", "type": "string" },
        "w": { "description": "Shape width in canvas units.", "type": "number" },
        "h": { "description": "Shape height in canvas units.", "type": "number" },
        "url": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "For iframe shapes: the https URL to embed. Optional when creating with state 'building'; required when setting state to 'live'." },
        "componentPath": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "For iframe shapes: file path shown in the shape title bar." },
        "componentProps": { "anyOf": [{ "additionalProperties": true, "type": "object" }, { "type": "null" }], "default": null, "description": "For iframe shapes: extra props to pass." },
        "state": { "anyOf": [{ "enum": ["building", "modifying", "live"], "type": "string" }, { "type": "null" }], "default": null, "description": "For iframe shapes: lifecycle state. Set 'building' on create, 'modifying' before edits, 'live' when the component is ready." },
        "artifactKind": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "For iframe shapes: artifact kind metadata." }
      },
      "required": ["type", "w", "h"]
    },
    "CanvasDeleteActionInput": {
      "properties": {
        "type": { "const": "delete", "description": "Delete a shape.", "type": "string" },
        "shapeId": { "description": "Target shape id.", "type": "string" }
      },
      "required": ["type", "shapeId"]
    },
    "CanvasDistributeActionInput": {
      "properties": {
        "type": { "const": "distribute", "description": "Distribute multiple shapes.", "type": "string" },
        "shapeIds": { "description": "Target shape ids.", "items": { "type": "string" }, "type": "array" },
        "direction": { "description": "Distribution axis.", "enum": ["horizontal", "vertical"], "type": "string" }
      },
      "required": ["type", "shapeIds", "direction"]
    },
    "CanvasMoveActionInput": {
      "properties": {
        "type": { "const": "move", "description": "Move a shape.", "type": "string" },
        "shapeId": { "description": "Target shape id.", "type": "string" },
        "x": { "description": "Destination x.", "type": "number" },
        "y": { "description": "Destination y.", "type": "number" }
      },
      "required": ["type", "shapeId", "x", "y"]
    },
    "CanvasReorderActionInput": {
      "properties": {
        "type": { "const": "reorder", "description": "Reorder a shape.", "type": "string" },
        "shapeId": { "description": "Target shape id.", "type": "string" },
        "direction": { "description": "Stacking direction.", "enum": ["front", "back"], "type": "string" }
      },
      "required": ["type", "shapeId", "direction"]
    },
    "CanvasResizeActionInput": {
      "properties": {
        "type": { "const": "resize", "description": "Resize a shape.", "type": "string" },
        "shapeId": { "description": "Target shape id.", "type": "string" },
        "w": { "description": "Destination width.", "type": "number" },
        "h": { "description": "Destination height.", "type": "number" }
      },
      "required": ["type", "shapeId", "w", "h"]
    },
    "CanvasShapeInput": {
      "properties": {
        "type": { "description": "Shape type: 'geo' (rectangle/ellipse), 'text' (label), 'note' (sticky note), 'iframe' (embedded web content), 'image' (embedded image), or 'video' (embedded video).", "enum": ["geo", "text", "note", "iframe", "image", "video"], "type": "string" },
        "x": { "description": "X position on canvas (0 is left).", "type": "number" },
        "y": { "description": "Y position on canvas (0 is top).", "type": "number" },
        "w": { "description": "Shape width in canvas units.", "type": "number" },
        "h": { "description": "Shape height in canvas units.", "type": "number" },
        "geo": { "anyOf": [{ "enum": ["cloud", "rectangle", "ellipse", "triangle", "diamond", "pentagon", "hexagon", "octagon", "star", "rhombus", "rhombus-2", "oval", "trapezoid", "arrow-right", "arrow-left", "arrow-up", "arrow-down", "x-box", "check-box", "heart"], "type": "string" }, { "type": "null" }], "default": null, "description": "Geometry sub-type for 'geo' shapes." },
        "color": { "anyOf": [{ "enum": ["black", "grey", "light-violet", "violet", "blue", "light-blue", "yellow", "orange", "green", "light-green", "light-red", "red", "white"], "type": "string" }, { "type": "null" }], "default": null, "description": "Shape color." },
        "labelColor": { "anyOf": [{ "enum": ["black", "grey", "light-violet", "violet", "blue", "light-blue", "yellow", "orange", "green", "light-green", "light-red", "red", "white"], "type": "string" }, { "type": "null" }], "default": null, "description": "Text label color. Overrides the shape color for text content." },
        "fill": { "anyOf": [{ "enum": ["none", "semi", "solid", "pattern", "fill", "lined-fill"], "type": "string" }, { "type": "null" }], "default": null, "description": "Fill style." },
        "text": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "Text content displayed inside the shape." },
        "url": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "For iframe shapes: the https URL to embed. Optional when creating with state 'building'; required when setting state to 'live'." },
        "src": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "For image/video shapes: the source URL of the media." },
        "altText": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "For image/video shapes: alt text describing the media." },
        "componentPath": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "For iframe shapes: file path shown in the shape title bar." },
        "componentName": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "For iframe shapes: component name shown in the shape title bar." },
        "componentProps": { "anyOf": [{ "additionalProperties": true, "type": "object" }, { "type": "null" }], "default": null, "description": "For iframe shapes: extra props to pass." },
        "state": { "anyOf": [{ "enum": ["building", "modifying", "live"], "type": "string" }, { "type": "null" }], "default": null, "description": "For iframe shapes: lifecycle state. Set 'building' on create, 'modifying' before edits, 'live' when the component is ready." }
      },
      "required": ["type", "x", "y", "w", "h"]
    },
    "CanvasUpdateActionInput": {
      "properties": {
        "type": { "const": "update", "description": "Update a shape.", "type": "string" },
        "shapeId": { "description": "Target shape id.", "type": "string" },
        "updates": { "$ref": "#/$defs/CanvasUpdateFieldsInput", "description": "Partial shape update." }
      },
      "required": ["type", "shapeId", "updates"]
    },
    "CanvasUpdateFieldsInput": {
      "properties": {
        "shapeType": { "description": "The type of shape being updated. Always required -- controls how the update is serialized.", "enum": ["geo", "text", "note", "iframe", "image", "video"], "type": "string" },
        "x": { "anyOf": [{ "type": "number" }, { "type": "null" }], "default": null, "description": "New x position." },
        "y": { "anyOf": [{ "type": "number" }, { "type": "null" }], "default": null, "description": "New y position." },
        "w": { "anyOf": [{ "type": "number" }, { "type": "null" }], "default": null, "description": "New width." },
        "h": { "anyOf": [{ "type": "number" }, { "type": "null" }], "default": null, "description": "New height." },
        "geo": { "anyOf": [{ "enum": ["cloud", "rectangle", "ellipse", "triangle", "diamond", "pentagon", "hexagon", "octagon", "star", "rhombus", "rhombus-2", "oval", "trapezoid", "arrow-right", "arrow-left", "arrow-up", "arrow-down", "x-box", "check-box", "heart"], "type": "string" }, { "type": "null" }], "default": null, "description": "New geometry sub-type." },
        "color": { "anyOf": [{ "enum": ["black", "grey", "light-violet", "violet", "blue", "light-blue", "yellow", "orange", "green", "light-green", "light-red", "red", "white"], "type": "string" }, { "type": "null" }], "default": null, "description": "New shape color." },
        "labelColor": { "anyOf": [{ "enum": ["black", "grey", "light-violet", "violet", "blue", "light-blue", "yellow", "orange", "green", "light-green", "light-red", "red", "white"], "type": "string" }, { "type": "null" }], "default": null, "description": "New text label color." },
        "fill": { "anyOf": [{ "enum": ["none", "semi", "solid", "pattern", "fill", "lined-fill"], "type": "string" }, { "type": "null" }], "default": null, "description": "New fill style." },
        "text": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "New text content." },
        "url": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "New URL for iframe shapes (must be https)." },
        "src": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "New source URL for image/video shapes." },
        "altText": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "New alt text for image/video shapes." },
        "componentPath": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "New component path for iframe shapes." },
        "componentName": { "anyOf": [{ "type": "string" }, { "type": "null" }], "default": null, "description": "New component name for iframe shapes." },
        "componentProps": { "anyOf": [{ "additionalProperties": true, "type": "object" }, { "type": "null" }], "default": null, "description": "Props to merge into iframe shape props." },
        "state": { "anyOf": [{ "enum": ["building", "modifying", "live"], "type": "string" }, { "type": "null" }], "default": null, "description": "New lifecycle state for iframe shapes. Set 'modifying' before edits, 'live' when ready." },
        "suggestedActions": { "type": "array", "maxItems": 3, "items": { "type": "object", "additionalProperties": false, "properties": { "content": { "type": "object", "additionalProperties": false, "properties": { "kind": { "const": "prompt" }, "prompt": { "type": "string", "minLength": 1, "maxLength": 1000 } }, "required": ["kind", "prompt"] }, "label": { "type": "string", "minLength": 1, "maxLength": 60 }, "category": { "type": "string", "minLength": 1, "maxLength": 60 }, "id": { "type": "string", "minLength": 1, "maxLength": 128 } }, "required": ["content", "label"] }, "description": "For design/mockup iframe shapes: 3 follow-up suggestion cards. Omit the field entirely when unused -- do NOT send null. Required when taking a design frame to 'live'. Each entry has hidden execution content {kind:'prompt',prompt}, a required user-facing label that briefly describes the change in one sentence, an optional non-empty freeform category, and an authored id." }
      },
      "required": ["shapeType"]
    }
  },
  "properties": {
    "actions": {
      "description": "Ordered list of canvas actions to apply.",
      "items": {
        "anyOf": [
          { "$ref": "#/$defs/CanvasCreateActionInput" },
          { "$ref": "#/$defs/CanvasCreateAutoActionInput" },
          { "$ref": "#/$defs/CanvasUpdateActionInput" },
          { "$ref": "#/$defs/CanvasDeleteActionInput" },
          { "$ref": "#/$defs/CanvasMoveActionInput" },
          { "$ref": "#/$defs/CanvasResizeActionInput" },
          { "$ref": "#/$defs/CanvasReorderActionInput" },
          { "$ref": "#/$defs/CanvasAlignActionInput" },
          { "$ref": "#/$defs/CanvasDistributeActionInput" }
        ]
      },
      "type": "array"
    }
  },
  "required": ["actions"]
}
```

### `getCanvasState`

Read the current state of the canvas board. Returns shapes at three detail levels based on distance from the viewport or focus area.

```json
{
  "$defs": {
    "FocusAreaInput": {
      "properties": {
        "x": { "description": "Left edge x coordinate.", "type": "number" },
        "y": { "description": "Top edge y coordinate.", "type": "number" },
        "w": { "description": "Width of the region.", "type": "number" },
        "h": { "description": "Height of the region.", "type": "number" }
      },
      "required": ["x", "y", "w", "h"]
    }
  },
  "properties": {
    "focusArea": {
      "anyOf": [{ "$ref": "#/$defs/FocusAreaInput" }, { "type": "null" }],
      "default": null,
      "description": "Optional region to zoom into. Shapes inside get full detail. If omitted, uses the current user viewport."
    }
  }
}
```

Response fields are documented in [Read the board](../SKILL.md#read-the-board).

### `focusCanvasShapes`

Pan and zoom the user's canvas viewport to center on specific shapes. Only call after the user asks to see your work -- except for the empty-canvas mockup exception (see [URLs and viewport](../SKILL.md#urls-and-viewport)).

```json
{
  "properties": {
    "shapeIds": { "description": "List of shape IDs to focus on.", "items": { "type": "string" }, "type": "array" },
    "animateMs": { "anyOf": [{ "type": "number" }, { "type": "null" }], "default": null, "description": "Optional animation duration in milliseconds for the viewport transition. Use 500 for smooth transitions." },
    "padding": { "anyOf": [{ "type": "number" }, { "type": "null" }], "default": null, "description": "Optional padding around the focused shapes in canvas units." }
  },
  "required": ["shapeIds"]
}
```
