(() => {
  'use strict';

  const REQUIRED_IDS = [
    'brandSub',
    'modeBoard',
    'modeOverlay',
    'contentBtn',
    'contentPanel',
    'contentClose',
    'imagePick',
    'pdfPick',
    'imageInput',
    'pdfInput',
    'ytUrl',
    'ytLoad',
    'ytError',
    'siteUrl',
    'siteLoad',
    'siteError',
    'contentClear',
    'stylePanel',
    'styleClose',
    'styleBtn',
    'colorDot',
    'styleSummary',
    'paletteGrid',
    'penWidthGroup',
    'eraserGroup',
    'toolbar',
    'toolbarGrip',
    'dockLeft',
    'dockRight',
    'penToggle',
    'undoBtn',
    'redoBtn',
    'curtainBtn',
    'exportBtn',
    'clearBtn',
    'stage',
    'contentLayer',
    'contentEmpty',
    'contentImage',
    'embedHost',
    'drawCanvas',
    'previewCanvas',
    'textInput',
    'drawStatus',
    'drawStatusText',
    'curtain',
    'curtainWindow',
    'curtainResize',
    'brushCursor',
    'toastRegion',
    'clearDialog',
    'clearCancel',
    'clearConfirm'
  ];

  const found = Object.create(null);
  const missing = [];

  for (const id of REQUIRED_IDS) {
    const element = document.getElementById(id);
    if (element) {
      found[id] = element;
    } else {
      missing.push(id);
    }
  }

  if (missing.length > 0) {
    console.error('[Fatih Kalem] Eksik DOM öğeleri:', missing.join(', '));
    return;
  }

  const {
    brandSub,
    modeBoard,
    modeOverlay,
    contentBtn,
    contentPanel,
    contentClose,
    imagePick,
    pdfPick,
    imageInput,
    pdfInput,
    ytUrl,
    ytLoad,
    ytError,
    siteUrl,
    siteLoad,
    siteError,
    contentClear,
    stylePanel,
    styleClose,
    styleBtn,
    colorDot,
    styleSummary,
    paletteGrid,
    penWidthGroup,
    eraserGroup,
    toolbar,
    toolbarGrip,
    dockLeft,
    dockRight,
    penToggle,
    undoBtn,
    redoBtn,
    curtainBtn,
    exportBtn,
    clearBtn,
    stage,
    contentLayer,
    contentEmpty,
    contentImage,
    embedHost,
    drawCanvas,
    previewCanvas,
    textInput,
    drawStatus,
    drawStatusText,
    curtain,
    curtainWindow,
    curtainResize,
    brushCursor,
    toastRegion,
    clearDialog,
    clearCancel,
    clearConfirm
  } = found;

  const toolButtons = Array.from(document.querySelectorAll('[data-tool]'));
  if (toolButtons.length === 0) {
    console.error('[Fatih Kalem] Araç düğmeleri bulunamadı.');
    return;
  }

  const ctx = drawCanvas.getContext('2d');
  const previewCtx = previewCanvas.getContext('2d');
  const highlightCanvas = document.createElement('canvas');
  const highlightCtx = highlightCanvas.getContext('2d');

  if (!ctx || !previewCtx || !highlightCtx) {
    console.error('[Fatih Kalem] Canvas 2D bağlamı oluşturulamadı.');
    return;
  }

  const COLORS = [
    { hex: '#18181b', name: 'Siyah' },
    { hex: '#ffffff', name: 'Beyaz' },
    { hex: '#71717a', name: 'Gri' },
    { hex: '#a1a1aa', name: 'Açık gri' },
    { hex: '#b91c1c', name: 'Koyu kırmızı' },
    { hex: '#ef4444', name: 'Kırmızı' },
    { hex: '#ea580c', name: 'Turuncu' },
    { hex: '#f59e0b', name: 'Hardal' },
    { hex: '#facc15', name: 'Sarı' },
    { hex: '#84cc16', name: 'Fıstık yeşili' },
    { hex: '#22c55e', name: 'Yeşil' },
    { hex: '#15803d', name: 'Koyu yeşil' },
    { hex: '#14b8a6', name: 'Turkuaz' },
    { hex: '#06b6d4', name: 'Camgöbeği' },
    { hex: '#0ea5e9', name: 'Gök mavisi' },
    { hex: '#2563eb', name: 'Mavi' },
    { hex: '#1e3a8a', name: 'Lacivert' },
    { hex: '#6366f1', name: 'İndigo' },
    { hex: '#7c3aed', name: 'Mor' },
    { hex: '#a855f7', name: 'Açık mor' },
    { hex: '#d946ef', name: 'Fuşya' },
    { hex: '#ec4899', name: 'Pembe' },
    { hex: '#f43f5e', name: 'Gül' },
    { hex: '#92400e', name: 'Kahverengi' }
  ];

  const PEN_WIDTHS = [2, 4, 8];
  const HIGHLIGHT_WIDTHS = [16, 26, 38];
  const HIGHLIGHTER_ALPHA = 0.3;
  const ERASER_SIZES = [24, 48];
  const FONT_SIZES = [22, 30, 40];
  const MAX_HISTORY = 30;
  const MAX_TOASTS = 3;
  const TOAST_MS = 3800;
  const TOAST_LEAVE_MS = 170;
  const TOOL_SHORTCUTS = {
    p: 'pen',
    h: 'highlighter',
    e: 'eraser',
    l: 'line',
    r: 'rect',
    o: 'ellipse',
    t: 'text'
  };
  const VALID_TOOLS = ['pen', 'highlighter', 'eraser', 'line', 'rect', 'ellipse', 'text'];
  const SHAPE_TOOLS = ['line', 'rect', 'ellipse'];
  const TEXT_FONT = '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

  const state = {
    mode: 'board',
    tool: 'pen',
    color: '#18181b',
    colorName: 'Siyah',
    penWidth: 4,
    eraserSize: 24,
    penOff: false,
    curtain: false
  };

  const content = {
    type: null,
    imageReady: false,
    sourceUrl: null,
    blobUrls: []
  };

  const historyStack = [];
  const redoStack = [];

  let historyBusy = false;
  let historyToken = 0;
  let dpr = 1;
  let cssWidth = 0;
  let cssHeight = 0;
  let activePointer = null;
  let stroke = null;
  let textPoint = null;
  let textSize = FONT_SIZES[1];
  let curtainLayout = null;
  let curtainDrag = null;
  let toolbarDrag = null;
  let fitFrame = 0;
  let dialogReturnFocus = null;
  let stageObserver = null;

  function clamp(value, min, max) {
    if (max < min) {
      return min;
    }
    return Math.min(Math.max(value, min), max);
  }

  function closestFrom(target, selector) {
    if (!(target instanceof Element)) {
      return null;
    }
    return target.closest(selector);
  }

  function penWidthIndex() {
    const index = PEN_WIDTHS.indexOf(state.penWidth);
    return index === -1 ? 1 : index;
  }

  function activeStrokeWidth() {
    if (state.tool === 'eraser') {
      return state.eraserSize;
    }
    if (state.tool === 'highlighter') {
      return HIGHLIGHT_WIDTHS[penWidthIndex()];
    }
    return state.penWidth;
  }

  function widthLabel() {
    return ['İnce', 'Orta', 'Kalın'][penWidthIndex()];
  }

  function showToast(message, tone = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tone}`;
    toast.textContent = message;
    toastRegion.append(toast);

    while (toastRegion.children.length > MAX_TOASTS) {
      toastRegion.firstElementChild?.remove();
    }

    window.setTimeout(() => {
      toast.classList.add('is-leaving');
      window.setTimeout(() => toast.remove(), TOAST_LEAVE_MS);
    }, TOAST_MS);
  }

  function buildPalette() {
    const fragment = document.createDocumentFragment();

    for (const color of COLORS) {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'swatch';
      swatch.dataset.color = color.hex;
      swatch.style.setProperty('--swatch', color.hex);
      swatch.setAttribute('aria-label', color.name);
      swatch.setAttribute('aria-pressed', String(color.hex === state.color));
      swatch.title = color.name;
      fragment.append(swatch);
    }

    paletteGrid.replaceChildren(fragment);
  }

  function updateStyleUI() {
    penWidthGroup.querySelectorAll('[data-pen-width]').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.penWidth) === state.penWidth));
    });

    eraserGroup.querySelectorAll('[data-eraser-size]').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.eraserSize) === state.eraserSize));
    });

    colorDot.style.backgroundColor = state.color;
    styleSummary.textContent = `${state.colorName} · ${widthLabel()}`;
    styleBtn.setAttribute('aria-label', `Renk ve kalınlık: ${state.colorName}, ${widthLabel()}`);

    paletteGrid.querySelectorAll('.swatch').forEach((swatch) => {
      swatch.setAttribute('aria-pressed', String(swatch.dataset.color === state.color));
    });

    if (!textInput.hidden) {
      textInput.style.color = state.color;
    }
  }

  function setColor(hex) {
    const choice = COLORS.find((color) => color.hex === hex);
    if (!choice) {
      return;
    }
    state.color = choice.hex;
    state.colorName = choice.name;
    updateStyleUI();
  }

  function clearSurface(target, canvasElement) {
    target.save();
    target.setTransform(1, 0, 0, 1, 0, 0);
    target.clearRect(0, 0, canvasElement.width, canvasElement.height);
    target.restore();
  }

  function clearPreview() {
    clearSurface(previewCtx, previewCanvas);
  }

  function updateBrushCursor() {
    if (state.penOff || state.tool === 'text') {
      brushCursor.hidden = true;
      return;
    }

    const size = Math.max(6, activeStrokeWidth());
    brushCursor.style.width = `${size}px`;
    brushCursor.style.height = `${size}px`;
  }

  function fitCanvases() {
    const rect = stage.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);

    if (nextWidth === cssWidth && nextHeight === cssHeight && nextDpr === dpr) {
      return;
    }

    if (stroke) {
      abortStroke();
    }

    const previous = document.createElement('canvas');
    previous.width = drawCanvas.width;
    previous.height = drawCanvas.height;
    const previousCtx = previous.getContext('2d');
    if (previousCtx && previous.width > 0 && previous.height > 0) {
      previousCtx.drawImage(drawCanvas, 0, 0);
    }

    cssWidth = nextWidth;
    cssHeight = nextHeight;
    dpr = nextDpr;

    const backingWidth = Math.max(1, Math.round(cssWidth * dpr));
    const backingHeight = Math.max(1, Math.round(cssHeight * dpr));

    drawCanvas.width = backingWidth;
    drawCanvas.height = backingHeight;
    previewCanvas.width = backingWidth;
    previewCanvas.height = backingHeight;
    highlightCanvas.width = backingWidth;
    highlightCanvas.height = backingHeight;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    previewCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    highlightCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (previous.width > 0 && previous.height > 0) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(previous, 0, 0, previous.width, previous.height, 0, 0, backingWidth, backingHeight);
      ctx.restore();
    }

    clearPreview();

    if (state.curtain) {
      clampCurtainToViewport();
      renderCurtain();
    }

    if (!stylePanel.hidden) {
      positionStylePanel();
    }

    updateBrushCursor();
  }

  function scheduleFit() {
    if (fitFrame !== 0) {
      return;
    }

    fitFrame = window.requestAnimationFrame(() => {
      fitFrame = 0;
      fitCanvases();
      keepToolbarVisible();
      if (!stylePanel.hidden) {
        positionStylePanel();
      }
    });
  }

  function snapshotCanvas() {
    try {
      return drawCanvas.toDataURL('image/png');
    } catch (error) {
      console.warn('[Fatih Kalem] Çizim anlık görüntüsü alınamadı.', error);
      return null;
    }
  }

  function updateHistoryButtons() {
    undoBtn.disabled = historyBusy || historyStack.length === 0;
    redoBtn.disabled = historyBusy || redoStack.length === 0;
  }

  function pushHistory() {
    const snapshot = snapshotCanvas();
    if (!snapshot) {
      return;
    }

    historyStack.push(snapshot);
    if (historyStack.length > MAX_HISTORY) {
      historyStack.shift();
    }
    redoStack.length = 0;
    updateHistoryButtons();
  }

  function restoreSnapshot(dataUrl) {
    historyBusy = true;
    const token = ++historyToken;
    updateHistoryButtons();

    const image = new Image();
    image.onload = () => {
      if (token !== historyToken) {
        return;
      }

      clearSurface(ctx, drawCanvas);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.drawImage(image, 0, 0, drawCanvas.width, drawCanvas.height);
      ctx.restore();
      historyBusy = false;
      updateHistoryButtons();
    };
    image.onerror = () => {
      if (token !== historyToken) {
        return;
      }
      historyBusy = false;
      updateHistoryButtons();
      showToast('Geri alma görüntüsü yüklenemedi.', 'error');
    };
    image.src = dataUrl;
  }

  function undo() {
    if (historyBusy || activePointer !== null || historyStack.length === 0) {
      return;
    }

    const snapshot = snapshotCanvas();
    if (!snapshot) {
      return;
    }

    redoStack.push(snapshot);
    if (redoStack.length > MAX_HISTORY) {
      redoStack.shift();
    }

    const previous = historyStack.pop();
    updateHistoryButtons();
    if (previous) {
      restoreSnapshot(previous);
    }
  }

  function redo() {
    if (historyBusy || activePointer !== null || redoStack.length === 0) {
      return;
    }

    const snapshot = snapshotCanvas();
    if (!snapshot) {
      return;
    }

    historyStack.push(snapshot);
    if (historyStack.length > MAX_HISTORY) {
      historyStack.shift();
    }

    const next = redoStack.pop();
    updateHistoryButtons();
    if (next) {
      restoreSnapshot(next);
    }
  }

  function setTool(tool) {
    if (!VALID_TOOLS.includes(tool)) {
      return;
    }

    if (!textInput.hidden) {
      commitText();
    }

    state.tool = tool;
    for (const button of toolButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.tool === tool));
    }
    stage.dataset.tool = tool;

    if (state.penOff) {
      setPenOff(false);
    }

    updateBrushCursor();
  }

  function updatePenStatus() {
    drawStatus.hidden = !state.penOff;
    if (!state.penOff) {
      return;
    }

    drawStatusText.textContent = state.mode === 'overlay'
      ? 'Kalem kapalı · İçerikle etkileşim açık'
      : 'Kalem kapalı · Çizim devre dışı';
  }

  function setPenOff(off) {
    const next = Boolean(off);

    if (state.penOff === next) {
      updatePenStatus();
      return;
    }

    state.penOff = next;
    stage.classList.toggle('pen-off', next);
    penToggle.setAttribute('aria-pressed', String(next));
    penToggle.title = next
      ? 'Etkileşim açık — çizime dönmek için tıklayın (K)'
      : 'Etkileşim (K) — kalemi kapat';

    if (next) {
      brushCursor.hidden = true;

      if (stroke) {
        abortStroke();
      }
      if (!textInput.hidden) {
        commitText();
      }
    }

    updatePenStatus();
  }

  function pointFromEvent(event) {
    const rect = drawCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function prepareFreehand(target, tool, width, color) {
    target.globalAlpha = 1;
    target.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    target.lineWidth = width;
    target.lineCap = 'round';
    target.lineJoin = 'round';
    target.strokeStyle = tool === 'eraser' ? '#000000' : color;
    target.fillStyle = tool === 'eraser' ? '#000000' : color;
  }

  function resetPaint(target) {
    target.globalCompositeOperation = 'source-over';
    target.globalAlpha = 1;
  }

  function drawDot(target, point, width, color) {
    target.fillStyle = color;
    target.beginPath();
    target.arc(point.x, point.y, Math.max(width / 2, 0.5), 0, Math.PI * 2);
    target.fill();
  }

  function renderHighlighterPreview() {
    clearPreview();
    previewCtx.save();
    previewCtx.globalAlpha = HIGHLIGHTER_ALPHA;
    previewCtx.drawImage(highlightCanvas, 0, 0, cssWidth, cssHeight);
    previewCtx.restore();
  }

  function drawShape(target, tool, start, end, width, color) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    target.globalCompositeOperation = 'source-over';
    target.globalAlpha = 1;
    target.lineWidth = width;
    target.strokeStyle = color;
    target.lineCap = 'round';
    target.lineJoin = 'round';
    target.beginPath();

    if (tool === 'line') {
      target.moveTo(start.x, start.y);
      target.lineTo(end.x, end.y);
    } else if (tool === 'rect') {
      target.rect(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(dx), Math.abs(dy));
    } else {
      target.ellipse(
        start.x + dx / 2,
        start.y + dy / 2,
        Math.max(Math.abs(dx) / 2, 0.01),
        Math.max(Math.abs(dy) / 2, 0.01),
        0,
        0,
        Math.PI * 2
      );
    }

    target.stroke();
  }

  function beginFreehand(point) {
    const tool = state.tool;
    const width = activeStrokeWidth();

    if (tool === 'highlighter') {
      clearSurface(highlightCtx, highlightCanvas);
      prepareFreehand(highlightCtx, 'pen', width, state.color);
      drawDot(highlightCtx, point, width, state.color);
      renderHighlighterPreview();
    } else {
      pushHistory();
      prepareFreehand(ctx, tool, width, state.color);
      drawDot(ctx, point, width, tool === 'eraser' ? '#000000' : state.color);
    }

    stroke = {
      kind: 'free',
      tool,
      pointerId: activePointer,
      last: point,
      lastMid: point,
      moved: false
    };
  }

  function addFreehandPoint(point) {
    if (!stroke || stroke.kind !== 'free') {
      return;
    }

    if (Math.abs(point.x - stroke.last.x) < 0.1 && Math.abs(point.y - stroke.last.y) < 0.1) {
      return;
    }

    const target = stroke.tool === 'highlighter' ? highlightCtx : ctx;
    const mid = {
      x: (stroke.last.x + point.x) / 2,
      y: (stroke.last.y + point.y) / 2
    };

    target.beginPath();
    target.moveTo(stroke.lastMid.x, stroke.lastMid.y);
    target.quadraticCurveTo(stroke.last.x, stroke.last.y, mid.x, mid.y);
    target.stroke();

    stroke.last = point;
    stroke.lastMid = mid;
    stroke.moved = true;
  }

  function finishFreehand() {
    if (!stroke) {
      return;
    }

    const { tool, last, lastMid, moved } = stroke;

    if (tool === 'highlighter') {
      if (moved) {
        highlightCtx.beginPath();
        highlightCtx.moveTo(lastMid.x, lastMid.y);
        highlightCtx.quadraticCurveTo(last.x, last.y, last.x, last.y);
        highlightCtx.stroke();
      }

      pushHistory();
      ctx.save();
      ctx.globalAlpha = HIGHLIGHTER_ALPHA;
      ctx.drawImage(highlightCanvas, 0, 0, cssWidth, cssHeight);
      ctx.restore();
      resetPaint(ctx);
      clearPreview();
      clearSurface(highlightCtx, highlightCanvas);
      return;
    }

    if (moved) {
      ctx.beginPath();
      ctx.moveTo(lastMid.x, lastMid.y);
      ctx.quadraticCurveTo(last.x, last.y, last.x, last.y);
      ctx.stroke();
    }

    resetPaint(ctx);
  }

  function beginShape(point) {
    stroke = {
      kind: 'shape',
      tool: state.tool,
      pointerId: activePointer,
      start: point,
      end: point
    };
    renderShapePreview();
  }

  function renderShapePreview() {
    clearPreview();
    if (!stroke || stroke.kind !== 'shape') {
      return;
    }
    drawShape(previewCtx, stroke.tool, stroke.start, stroke.end, state.penWidth, state.color);
  }

  function updateShape(point) {
    if (!stroke || stroke.kind !== 'shape') {
      return;
    }
    stroke.end = point;
    renderShapePreview();
  }

  function finishShape() {
    if (!stroke || stroke.kind !== 'shape') {
      return;
    }

    const dx = stroke.end.x - stroke.start.x;
    const dy = stroke.end.y - stroke.start.y;
    const tooSmall = stroke.tool === 'line'
      ? Math.hypot(dx, dy) < 2
      : Math.abs(dx) < 2 || Math.abs(dy) < 2;

    if (!tooSmall) {
      pushHistory();
      drawShape(ctx, stroke.tool, stroke.start, stroke.end, state.penWidth, state.color);
      resetPaint(ctx);
    }

    clearPreview();
  }

  function releaseDrawPointer(pointerId) {
    try {
      if (drawCanvas.hasPointerCapture(pointerId)) {
        drawCanvas.releasePointerCapture(pointerId);
      }
    } catch {
      // Pointer capture may already be gone.
    }
  }

  function finishStroke() {
    if (!stroke) {
      activePointer = null;
      return;
    }

    const pointerId = activePointer;

    if (stroke.kind === 'free') {
      finishFreehand();
    } else {
      finishShape();
    }

    stroke = null;
    activePointer = null;

    if (pointerId !== null) {
      releaseDrawPointer(pointerId);
    }
  }

  function abortStroke() {
    if (!stroke) {
      activePointer = null;
      return;
    }

    const pointerId = activePointer;

    if (stroke.tool === 'highlighter') {
      clearPreview();
      clearSurface(highlightCtx, highlightCanvas);
    } else if (stroke.kind === 'shape') {
      clearPreview();
    } else {
      resetPaint(ctx);
    }

    stroke = null;
    activePointer = null;

    if (pointerId !== null) {
      releaseDrawPointer(pointerId);
    }
  }

  function onPointerDown(event) {
    if (state.penOff || historyBusy) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (activePointer !== null) {
      return;
    }

    const point = pointFromEvent(event);

    if (state.tool === 'text') {
      event.preventDefault();
      openTextInput(point);
      return;
    }

    activePointer = event.pointerId;

    try {
      drawCanvas.setPointerCapture(event.pointerId);
    } catch {
      // Drawing still works without pointer capture.
    }

    event.preventDefault();

    if (SHAPE_TOOLS.includes(state.tool)) {
      beginShape(point);
    } else {
      beginFreehand(point);
    }
  }

  function onPointerMove(event) {
    if (activePointer === null || !stroke || event.pointerId !== activePointer) {
      return;
    }

    if (stroke.kind === 'shape') {
      updateShape(pointFromEvent(event));
      return;
    }

    const samples = typeof event.getCoalescedEvents === 'function'
      ? event.getCoalescedEvents()
      : [event];
    const points = samples.length > 0 ? samples : [event];

    for (const sample of points) {
      addFreehandPoint(pointFromEvent(sample));
    }

    if (stroke && stroke.tool === 'highlighter') {
      renderHighlighterPreview();
    }
  }

  function onPointerUp(event) {
    if (activePointer === null || !stroke || event.pointerId !== activePointer) {
      return;
    }
    finishStroke();
  }

  function onPointerCancel(event) {
    if (activePointer === null || event.pointerId !== activePointer) {
      return;
    }
    abortStroke();
  }

  function openTextInput(point) {
    if (!textInput.hidden) {
      commitText();
    }

    textSize = FONT_SIZES[penWidthIndex()];
    const left = clamp(point.x, 8, Math.max(8, cssWidth - 330));
    const top = clamp(point.y, 8, Math.max(8, cssHeight - textSize - 26));

    textPoint = { x: left + 8, y: top + 5 };
    textInput.value = '';
    textInput.style.color = state.color;
    textInput.style.fontSize = `${textSize}px`;
    textInput.style.left = `${left}px`;
    textInput.style.top = `${top}px`;
    textInput.hidden = false;
    textInput.focus({ preventScroll: true });
  }

  function commitText() {
    if (textInput.hidden) {
      return;
    }

    const value = textInput.value.trim();
    const point = textPoint;
    const size = textSize;

    textInput.hidden = true;
    textInput.value = '';
    textPoint = null;

    if (!value || !point) {
      return;
    }

    pushHistory();
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = state.color;
    ctx.font = `600 ${size}px ${TEXT_FONT}`;
    ctx.textBaseline = 'top';
    ctx.fillText(value, point.x, point.y);
    ctx.restore();
  }

  function cancelText() {
    if (textInput.hidden) {
      return;
    }
    textInput.hidden = true;
    textInput.value = '';
    textPoint = null;
  }

  function setMode(mode) {
    if (mode !== 'board' && mode !== 'overlay') {
      return;
    }
    if (state.mode === mode) {
      return;
    }

    if (stroke) {
      abortStroke();
    }
    if (!textInput.hidden) {
      commitText();
    }

    const overlay = mode === 'overlay';

    if (!overlay) {
      closeContentPanel(false);
    }

    state.mode = mode;
    stage.classList.toggle('is-overlay', overlay);
    contentLayer.hidden = !overlay;
    contentBtn.hidden = !overlay;
    modeBoard.setAttribute('aria-pressed', String(!overlay));
    modeOverlay.setAttribute('aria-pressed', String(overlay));
    brandSub.textContent = overlay ? 'İçerik üzerine çizim' : 'Tahta modu';

    if (!overlay && state.penOff) {
      setPenOff(false);
    }

    updatePenStatus();

    if (overlay && !hasContent()) {
      openContentPanel();
    }
  }

  function hasContent() {
    return content.type !== null;
  }

  function updateContentUI() {
    const has = hasContent();
    contentClear.disabled = !has;
    contentEmpty.hidden = has;
    contentImage.hidden = content.type !== 'image' || !content.imageReady;
    embedHost.hidden = content.type === null || content.type === 'image';
  }

  function resetContentDom() {
    embedHost.replaceChildren();
    contentImage.hidden = true;
    contentImage.removeAttribute('src');
    contentImage.alt = '';

    for (const url of content.blobUrls) {
      URL.revokeObjectURL(url);
    }
    content.blobUrls = [];

    content.type = null;
    content.imageReady = false;
    content.sourceUrl = null;
  }

  function clearContent({ announce = true } = {}) {
    resetContentDom();
    contentEmpty.hidden = false;
    updateContentUI();
    ytUrl.value = '';
    siteUrl.value = '';
    setFieldError(ytUrl, ytError, '');
    setFieldError(siteUrl, siteError, '');

    if (announce) {
      showToast('İçerik kaldırıldı.', 'info');
    }
  }

  function loadImageFile(file) {
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      showToast('Lütfen bir görsel dosyası seçin.', 'error');
      return;
    }

    resetContentDom();
    const url = URL.createObjectURL(file);
    content.blobUrls.push(url);
    content.type = 'image';
    content.imageReady = false;
    content.sourceUrl = url;
    contentImage.alt = file.name || 'Yüklenen görsel';
    contentImage.hidden = true;
    contentImage.src = url;
    updateContentUI();
  }

  function loadPdfFile(file) {
    if (!file) {
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Lütfen bir PDF dosyası seçin.', 'error');
      return;
    }

    resetContentDom();
    const url = URL.createObjectURL(file);
    content.blobUrls.push(url);
    content.type = 'pdf';
    content.imageReady = false;

    const embed = document.createElement('embed');
    embed.src = url;
    embed.type = 'application/pdf';
    embed.title = file.name || 'PDF';
    embedHost.replaceChildren(embed);
    updateContentUI();
    closeContentPanel(true);
    showToast('PDF yüklendi. Gömülü PDF dışa aktarmada yakalanamaz.', 'info');
  }

  function getYouTubeId(value) {
    const raw = value.trim();
    if (!raw) {
      return null;
    }

    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
      return raw;
    }

    let url;
    try {
      url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
      return null;
    }

    const host = url.hostname.replace(/^www\./, '');
    const isYouTubeHost = host === 'youtube.com'
      || host.endsWith('.youtube.com')
      || host === 'youtube-nocookie.com'
      || host.endsWith('.youtube-nocookie.com');

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (isYouTubeHost) {
      const fromQuery = url.searchParams.get('v');
      if (fromQuery && /^[A-Za-z0-9_-]{11}$/.test(fromQuery)) {
        return fromQuery;
      }

      const match = url.pathname.match(/\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  function loadEmbed(source, title, type) {
    resetContentDom();
    const frame = document.createElement('iframe');
    frame.src = source;
    frame.title = title;
    frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    embedHost.replaceChildren(frame);
    content.type = type;
    content.imageReady = false;
    updateContentUI();
  }

  function loadYouTube() {
    const id = getYouTubeId(ytUrl.value);
    if (!id) {
      setFieldError(ytUrl, ytError, 'Geçerli bir YouTube bağlantısı veya video kimliği girin.');
      ytUrl.focus();
      return;
    }

    setFieldError(ytUrl, ytError, '');
    loadEmbed(
      `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`,
      'YouTube videosu',
      'youtube'
    );
    closeContentPanel(true);
    showToast('YouTube videosu yüklendi. Oynatmak için Etkileşim aracını seçin.', 'success');
  }

  function loadSite() {
    const raw = siteUrl.value.trim();
    if (!raw) {
      setFieldError(siteUrl, siteError, 'Bir web sitesi adresi girin.');
      siteUrl.focus();
      return;
    }

    let url;
    try {
      const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
      url = new URL(candidate);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Desteklenmeyen protokol');
      }
    } catch {
      setFieldError(siteUrl, siteError, 'Geçerli bir http veya https adresi girin.');
      siteUrl.focus();
      return;
    }

    setFieldError(siteUrl, siteError, '');
    loadEmbed(url.href, 'Gömülü web sayfası', 'site');
    closeContentPanel(true);
    showToast('Web sayfası yüklendi. Bazı siteler gömülmeyi engelleyebilir.', 'info');
  }

  function setFieldError(input, errorElement, message) {
    if (message) {
      errorElement.textContent = message;
      errorElement.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    } else {
      errorElement.textContent = '';
      errorElement.hidden = true;
      input.removeAttribute('aria-invalid');
    }
  }

  function openContentPanel() {
    if (state.mode !== 'overlay' || !contentPanel.hidden) {
      return;
    }
    contentPanel.hidden = false;
    contentBtn.setAttribute('aria-expanded', 'true');
  }

  function closeContentPanel(restoreFocus = false) {
    if (contentPanel.hidden) {
      return;
    }

    contentPanel.hidden = true;
    contentBtn.setAttribute('aria-expanded', 'false');

    if (restoreFocus) {
      contentBtn.focus({ preventScroll: true });
    }
  }

  function positionStylePanel() {
    if (stylePanel.hidden) {
      return;
    }

    const anchor = styleBtn.getBoundingClientRect();
    const panelRect = stylePanel.getBoundingClientRect();
    const gap = 10;
    const margin = 10;

    let left = anchor.right + gap;
    if (left + panelRect.width > window.innerWidth - margin) {
      left = anchor.left - panelRect.width - gap;
    }
    left = clamp(left, margin, window.innerWidth - panelRect.width - margin);

    const top = clamp(
      anchor.top - 6,
      margin,
      window.innerHeight - panelRect.height - margin
    );

    stylePanel.style.left = `${left}px`;
    stylePanel.style.top = `${top}px`;
  }

  function openStylePanel() {
    if (!stylePanel.hidden) {
      return;
    }
    stylePanel.hidden = false;
    styleBtn.setAttribute('aria-expanded', 'true');
    positionStylePanel();
    styleClose.focus({ preventScroll: true });
  }

  function closeStylePanel(restoreFocus = false) {
    if (stylePanel.hidden) {
      return;
    }

    stylePanel.hidden = true;
    styleBtn.setAttribute('aria-expanded', 'false');

    if (restoreFocus) {
      styleBtn.focus({ preventScroll: true });
    }
  }

  function ensureCurtainLayout() {
    if (!curtainLayout) {
      const width = Math.min(760, Math.max(220, cssWidth * 0.64));
      const height = Math.min(520, Math.max(160, cssHeight * 0.56));
      curtainLayout = {
        left: Math.round((cssWidth - width) / 2),
        top: Math.round((cssHeight - height) / 2),
        width: Math.round(width),
        height: Math.round(height)
      };
    }
    clampCurtainToViewport();
  }

  function clampCurtainToViewport() {
    if (!curtainLayout) {
      return;
    }

    const margin = 8;
    const maxWidth = Math.max(80, cssWidth - margin * 2);
    const maxHeight = Math.max(80, cssHeight - margin * 2);
    const minWidth = Math.min(160, maxWidth);
    const minHeight = Math.min(120, maxHeight);

    curtainLayout.width = clamp(curtainLayout.width, minWidth, maxWidth);
    curtainLayout.height = clamp(curtainLayout.height, minHeight, maxHeight);
    curtainLayout.left = clamp(curtainLayout.left, margin, Math.max(margin, cssWidth - curtainLayout.width - margin));
    curtainLayout.top = clamp(curtainLayout.top, margin, Math.max(margin, cssHeight - curtainLayout.height - margin));
  }

  function renderCurtain() {
    if (!curtainLayout) {
      return;
    }
    curtainWindow.style.left = `${curtainLayout.left}px`;
    curtainWindow.style.top = `${curtainLayout.top}px`;
    curtainWindow.style.width = `${curtainLayout.width}px`;
    curtainWindow.style.height = `${curtainLayout.height}px`;
  }

  function openCurtain() {
    if (state.curtain) {
      return;
    }

    if (stroke) {
      abortStroke();
    }
    if (!textInput.hidden) {
      commitText();
    }

    state.curtain = true;
    curtain.hidden = false;
    curtainBtn.setAttribute('aria-pressed', 'true');
    ensureCurtainLayout();
    renderCurtain();
    curtainWindow.focus({ preventScroll: true });
    showToast('Perde açık. Kapatmak için Esc.', 'info');
  }

  function closeCurtain(restoreFocus = true) {
    if (!state.curtain) {
      return;
    }

    if (curtainDrag) {
      releaseCurtainPointer(curtainDrag.pointerId);
      curtainDrag = null;
    }

    state.curtain = false;
    curtain.hidden = true;
    curtainBtn.setAttribute('aria-pressed', 'false');

    if (restoreFocus) {
      curtainBtn.focus({ preventScroll: true });
    }
  }

  function toggleCurtain() {
    if (state.curtain) {
      closeCurtain(true);
    } else {
      openCurtain();
    }
  }

  function releaseCurtainPointer(pointerId) {
    try {
      if (curtainWindow.hasPointerCapture(pointerId)) {
        curtainWindow.releasePointerCapture(pointerId);
      }
    } catch {
      // Pointer capture may already be gone.
    }
  }

  function beginCurtainDrag(event) {
    if (!state.curtain || curtainDrag || !curtainLayout) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    event.preventDefault();
    curtainDrag = {
      mode: event.target === curtainResize ? 'resize' : 'move',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      base: { ...curtainLayout }
    };

    try {
      curtainWindow.setPointerCapture(event.pointerId);
    } catch {
      // Dragging still works while the pointer stays over the window.
    }

    curtainWindow.focus({ preventScroll: true });
  }

  function moveCurtainDrag(event) {
    if (!curtainDrag || !curtainLayout || event.pointerId !== curtainDrag.pointerId) {
      return;
    }

    event.preventDefault();
    const dx = event.clientX - curtainDrag.startX;
    const dy = event.clientY - curtainDrag.startY;
    const margin = 8;

    if (curtainDrag.mode === 'move') {
      const maxLeft = Math.max(margin, cssWidth - curtainLayout.width - margin);
      const maxTop = Math.max(margin, cssHeight - curtainLayout.height - margin);
      curtainLayout.left = clamp(curtainDrag.base.left + dx, margin, maxLeft);
      curtainLayout.top = clamp(curtainDrag.base.top + dy, margin, maxTop);
    } else {
      const maxWidth = Math.max(80, cssWidth - curtainLayout.left - margin);
      const maxHeight = Math.max(80, cssHeight - curtainLayout.top - margin);
      curtainLayout.width = clamp(curtainDrag.base.width + dx, Math.min(160, maxWidth), maxWidth);
      curtainLayout.height = clamp(curtainDrag.base.height + dy, Math.min(120, maxHeight), maxHeight);
    }

    renderCurtain();
  }

  function endCurtainDrag(event) {
    if (!curtainDrag || event.pointerId !== curtainDrag.pointerId) {
      return;
    }

    const pointerId = curtainDrag.pointerId;
    curtainDrag = null;
    releaseCurtainPointer(pointerId);
  }

  function handleCurtainKeydown(event) {
    if (!state.curtain || !curtainLayout) {
      return;
    }

    const step = event.altKey ? 40 : 12;
    const resize = event.shiftKey;
    let handled = true;

    switch (event.key) {
      case 'ArrowLeft':
        if (resize) {
          curtainLayout.width -= step;
        } else {
          curtainLayout.left -= step;
        }
        break;
      case 'ArrowRight':
        if (resize) {
          curtainLayout.width += step;
        } else {
          curtainLayout.left += step;
        }
        break;
      case 'ArrowUp':
        if (resize) {
          curtainLayout.height -= step;
        } else {
          curtainLayout.top -= step;
        }
        break;
      case 'ArrowDown':
        if (resize) {
          curtainLayout.height += step;
        } else {
          curtainLayout.top += step;
        }
        break;
      default:
        handled = false;
    }

    if (!handled) {
      return;
    }

    event.preventDefault();
    clampCurtainToViewport();
    renderCurtain();
  }

  function setDock(side) {
    if (side !== 'left' && side !== 'right') {
      return;
    }

    const rect = toolbar.getBoundingClientRect();
    const top = clamp(rect.top, 8, window.innerHeight - rect.height - 8);

    toolbar.dataset.dock = side;
    toolbar.style.transform = 'none';
    toolbar.style.top = `${top}px`;
    toolbar.style.left = side === 'left' ? '14px' : 'auto';
    toolbar.style.right = side === 'right' ? '14px' : 'auto';
    updateDockButtons();
    closeStylePanel(false);
  }

  function updateDockButtons() {
    dockLeft.setAttribute('aria-pressed', String(toolbar.dataset.dock === 'left'));
    dockRight.setAttribute('aria-pressed', String(toolbar.dataset.dock === 'right'));
  }

  function keepToolbarVisible() {
    const rect = toolbar.getBoundingClientRect();
    const margin = 8;
    const top = clamp(rect.top, margin, window.innerHeight - rect.height - margin);
    let left;

    if (toolbar.dataset.dock === 'left') {
      left = 14;
    } else if (toolbar.dataset.dock === 'right') {
      left = window.innerWidth - rect.width - 14;
    } else {
      left = clamp(rect.left, margin, window.innerWidth - rect.width - margin);
    }

    toolbar.style.transform = 'none';
    toolbar.style.top = `${top}px`;
    toolbar.style.left = `${left}px`;
    toolbar.style.right = 'auto';
  }

  function beginToolbarDrag(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (closestFrom(event.target, 'button')) {
      return;
    }

    const rect = toolbar.getBoundingClientRect();
    toolbarDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseLeft: rect.left,
      baseTop: rect.top
    };

    toolbar.dataset.dock = 'free';
    toolbar.style.transform = 'none';
    toolbar.style.left = `${rect.left}px`;
    toolbar.style.right = 'auto';
    toolbar.style.top = `${rect.top}px`;
    updateDockButtons();
    closeStylePanel(false);

    try {
      toolbarGrip.setPointerCapture(event.pointerId);
    } catch {
      // Dragging still works while the pointer stays over the grip.
    }

    event.preventDefault();
  }

  function moveToolbar(event) {
    if (!toolbarDrag || event.pointerId !== toolbarDrag.pointerId) {
      return;
    }

    const width = toolbar.offsetWidth;
    const height = toolbar.offsetHeight;
    const left = clamp(
      toolbarDrag.baseLeft + event.clientX - toolbarDrag.startX,
      8,
      window.innerWidth - width - 8
    );
    const top = clamp(
      toolbarDrag.baseTop + event.clientY - toolbarDrag.startY,
      8,
      window.innerHeight - height - 8
    );

    toolbar.style.left = `${left}px`;
    toolbar.style.top = `${top}px`;
  }

  function releaseToolbarPointer(pointerId) {
    try {
      if (toolbarGrip.hasPointerCapture(pointerId)) {
        toolbarGrip.releasePointerCapture(pointerId);
      }
    } catch {
      // Pointer capture may already be gone.
    }
  }

  function endToolbarDrag(event) {
    if (!toolbarDrag || event.pointerId !== toolbarDrag.pointerId) {
      return;
    }

    const pointerId = toolbarDrag.pointerId;
    toolbarDrag = null;
    releaseToolbarPointer(pointerId);
  }

  function drawContentImage(target) {
    const imageWidth = contentImage.naturalWidth;
    const imageHeight = contentImage.naturalHeight;
    if (!imageWidth || !imageHeight) {
      throw new Error('Görsel boyutları okunamadı.');
    }

    const scale = Math.min(target.canvas.width / imageWidth, target.canvas.height / imageHeight);
    const width = imageWidth * scale;
    const height = imageHeight * scale;
    target.drawImage(contentImage, (target.canvas.width - width) / 2, (target.canvas.height - height) / 2, width, height);
  }

  function fileStamp() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  }

  function exportPng() {
    try {
      const output = document.createElement('canvas');
      output.width = drawCanvas.width;
      output.height = drawCanvas.height;
      const outputCtx = output.getContext('2d');
      if (!outputCtx) {
        throw new Error('Canvas 2D bağlamı oluşturulamadı.');
      }

      outputCtx.fillStyle = '#ffffff';
      outputCtx.fillRect(0, 0, output.width, output.height);

      let warning = null;

      if (state.mode === 'overlay' && content.type !== null) {
        if (content.type === 'image' && content.imageReady) {
          try {
            drawContentImage(outputCtx);
          } catch (error) {
            console.warn('[Fatih Kalem] Gömülü görsel yakalanamadı.', error);
            outputCtx.fillStyle = '#ffffff';
            outputCtx.fillRect(0, 0, output.width, output.height);
            warning = 'Gömülü içerik yakalanamadı. Yalnızca çizim katmanı indirildi.';
          }
        } else if (content.type === 'image') {
          warning = 'Görsel henüz hazır değil. Yalnızca çizim katmanı indirildi.';
        } else {
          warning = 'Çapraz kaynaklı içerik yakalanamadı. Yalnızca çizim katmanı indirildi.';
        }
      }

      outputCtx.drawImage(drawCanvas, 0, 0);

      const link = document.createElement('a');
      link.href = output.toDataURL('image/png');
      link.download = `fatih-kalem-${fileStamp()}.png`;
      document.body.append(link);
      link.click();
      link.remove();

      if (warning) {
        showToast(warning, 'warning');
      } else {
        showToast('PNG indirildi.', 'success');
      }
    } catch (error) {
      console.error('[Fatih Kalem] PNG dışa aktarma başarısız.', error);
      showToast('PNG oluşturulamadı. Tarayıcı konsolunu kontrol edin.', 'error');
    }
  }

  function handleDialogClosed() {
    if (dialogReturnFocus && dialogReturnFocus.isConnected) {
      dialogReturnFocus.focus({ preventScroll: true });
    }
    dialogReturnFocus = null;
  }

  function openClearDialog() {
    dialogReturnFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    if (typeof clearDialog.showModal === 'function') {
      if (!clearDialog.open) {
        clearDialog.showModal();
      }
    } else {
      clearDialog.setAttribute('open', '');
    }

    clearCancel.focus({ preventScroll: true });
  }

  function closeClearDialog() {
    if (clearDialog.open && typeof clearDialog.close === 'function') {
      clearDialog.close();
    } else {
      clearDialog.removeAttribute('open');
      handleDialogClosed();
    }
  }

  function clearAllDrawings() {
    if (stroke) {
      abortStroke();
    }

    pushHistory();
    clearSurface(ctx, drawCanvas);
    clearSurface(previewCtx, previewCanvas);
    clearSurface(highlightCtx, highlightCanvas);
    updateHistoryButtons();
    closeClearDialog();
    showToast('Çizim temizlendi. Geri almak için Ctrl+Z.', 'success');
  }

  function isTypingTarget(target) {
    if (!(target instanceof Element)) {
      return false;
    }
    return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
  }

  function handleGlobalKeydown(event) {
    if (clearDialog.open) {
      return;
    }

    const key = event.key;

    if (key === 'Escape') {
      if (!textInput.hidden) {
        event.preventDefault();
        cancelText();
        return;
      }
      if (!stylePanel.hidden) {
        event.preventDefault();
        closeStylePanel(true);
        return;
      }
      if (!contentPanel.hidden) {
        event.preventDefault();
        closeContentPanel(true);
        return;
      }
      if (state.curtain) {
        event.preventDefault();
        closeCurtain(true);
        return;
      }
      return;
    }

    if (isTypingTarget(event.target)) {
      return;
    }

    const modifier = event.ctrlKey || event.metaKey;

    if (modifier && (key === 'z' || key === 'Z')) {
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }

    if (modifier && (key === 'y' || key === 'Y')) {
      event.preventDefault();
      redo();
      return;
    }

    if (modifier || event.altKey) {
      return;
    }

    const lower = key.toLowerCase();

    if (lower === 'u') {
      event.preventDefault();
      undo();
      return;
    }

    if (lower === 'k') {
      event.preventDefault();
      setPenOff(!state.penOff);
      return;
    }

    const tool = TOOL_SHORTCUTS[lower];
    if (tool) {
      event.preventDefault();
      setTool(tool);
    }
  }

  function handleBrushPointerMove(event) {
    if (event.pointerType !== 'mouse' || state.penOff || state.tool === 'text') {
      brushCursor.hidden = true;
      return;
    }

    if (event.target !== drawCanvas) {
      brushCursor.hidden = true;
      return;
    }

    brushCursor.hidden = false;
    brushCursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
  }

  function handleOutsidePointerDown(event) {
    if (
      !contentPanel.hidden &&
      !contentPanel.contains(event.target) &&
      !contentBtn.contains(event.target)
    ) {
      closeContentPanel(false);
    }

    if (
      !stylePanel.hidden &&
      !stylePanel.contains(event.target) &&
      !styleBtn.contains(event.target)
    ) {
      closeStylePanel(false);
    }
  }

  // Toolbar and style controls ---------------------------------------------

  for (const button of toolButtons) {
    button.addEventListener('click', () => setTool(button.dataset.tool || ''));
  }

  penToggle.addEventListener('click', () => setPenOff(!state.penOff));

  styleBtn.addEventListener('click', () => {
    if (stylePanel.hidden) {
      openStylePanel();
    } else {
      closeStylePanel(true);
    }
  });

  styleClose.addEventListener('click', () => closeStylePanel(true));

  paletteGrid.addEventListener('click', (event) => {
    const swatch = closestFrom(event.target, 'button[data-color]');
    if (swatch) {
      setColor(swatch.dataset.color || '');
    }
  });

  penWidthGroup.addEventListener('click', (event) => {
    const button = closestFrom(event.target, 'button[data-pen-width]');
    if (!button) {
      return;
    }
    const width = Number(button.dataset.penWidth);
    if (!PEN_WIDTHS.includes(width)) {
      return;
    }
    state.penWidth = width;
    updateStyleUI();
    updateBrushCursor();
  });

  eraserGroup.addEventListener('click', (event) => {
    const button = closestFrom(event.target, 'button[data-eraser-size]');
    if (!button) {
      return;
    }
    const size = Number(button.dataset.eraserSize);
    if (!ERASER_SIZES.includes(size)) {
      return;
    }
    state.eraserSize = size;
    updateStyleUI();
    updateBrushCursor();
  });

  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  clearBtn.addEventListener('click', openClearDialog);
  exportBtn.addEventListener('click', exportPng);
  curtainBtn.addEventListener('click', toggleCurtain);

  dockLeft.addEventListener('click', () => setDock('left'));
  dockRight.addEventListener('click', () => setDock('right'));

  toolbarGrip.addEventListener('pointerdown', beginToolbarDrag);
  toolbarGrip.addEventListener('pointermove', moveToolbar);
  toolbarGrip.addEventListener('pointerup', endToolbarDrag);
  toolbarGrip.addEventListener('pointercancel', endToolbarDrag);

  // Modes and content ------------------------------------------------------

  modeBoard.addEventListener('click', () => setMode('board'));
  modeOverlay.addEventListener('click', () => setMode('overlay'));

  contentBtn.addEventListener('click', () => {
    if (contentPanel.hidden) {
      openContentPanel();
    } else {
      closeContentPanel(true);
    }
  });

  contentClose.addEventListener('click', () => closeContentPanel(true));

  imagePick.addEventListener('click', () => imageInput.click());
  pdfPick.addEventListener('click', () => pdfInput.click());

  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    imageInput.value = '';
    loadImageFile(file);
  });

  pdfInput.addEventListener('change', () => {
    const file = pdfInput.files?.[0];
    pdfInput.value = '';
    loadPdfFile(file);
  });

  contentImage.addEventListener('load', () => {
    if (content.type !== 'image' || contentImage.getAttribute('src') !== content.sourceUrl) {
      return;
    }
    content.imageReady = true;
    updateContentUI();
    closeContentPanel(true);
    showToast('Görsel yüklendi.', 'success');
  });

  contentImage.addEventListener('error', () => {
    if (content.type !== 'image' || contentImage.getAttribute('src') !== content.sourceUrl) {
      return;
    }
    resetContentDom();
    updateContentUI();
    showToast('Görsel açılamadı. Dosyayı kontrol edin.', 'error');
  });

  contentClear.addEventListener('click', () => {
    clearContent();
    imagePick.focus({ preventScroll: true });
  });

  ytLoad.addEventListener('click', loadYouTube);
  siteLoad.addEventListener('click', loadSite);

  ytUrl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      loadYouTube();
    }
  });

  siteUrl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      loadSite();
    }
  });

  ytUrl.addEventListener('input', () => setFieldError(ytUrl, ytError, ''));
  siteUrl.addEventListener('input', () => setFieldError(siteUrl, siteError, ''));

  // Drawing surface --------------------------------------------------------

  drawCanvas.addEventListener('pointerdown', onPointerDown);
  drawCanvas.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerCancel);

  textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      commitText();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      cancelText();
    }
  });

  textInput.addEventListener('blur', () => {
    if (textInput.hidden || document.activeElement === textInput) {
      return;
    }
    commitText();
  });

  // Curtain ----------------------------------------------------------------

  curtainWindow.addEventListener('pointerdown', beginCurtainDrag);
  curtainWindow.addEventListener('pointermove', moveCurtainDrag);
  curtainWindow.addEventListener('pointerup', endCurtainDrag);
  curtainWindow.addEventListener('pointercancel', endCurtainDrag);
  curtainWindow.addEventListener('keydown', handleCurtainKeydown);

  // Dialog -----------------------------------------------------------------

  clearCancel.addEventListener('click', closeClearDialog);
  clearConfirm.addEventListener('click', clearAllDrawings);
  clearDialog.addEventListener('close', handleDialogClosed);
  clearDialog.addEventListener('click', (event) => {
    if (event.target === clearDialog) {
      closeClearDialog();
    }
  });

  // Global behavior --------------------------------------------------------

  document.addEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('pointerdown', handleOutsidePointerDown);
  document.addEventListener('pointermove', handleBrushPointerMove, { passive: true });

  if ('ResizeObserver' in window) {
    stageObserver = new ResizeObserver(scheduleFit);
    stageObserver.observe(stage);
  }
  window.addEventListener('resize', scheduleFit);

  // Initialize -------------------------------------------------------------

  buildPalette();
  updateStyleUI();
  updateHistoryButtons();
  updateContentUI();
  updatePenStatus();
  updateDockButtons();
  fitCanvases();
  keepToolbarVisible();
})();
