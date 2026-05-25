import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { 
  Sparkles, 
  Settings, 
  Download, 
  Layout, 
  Upload, 
  FileText, 
  Type, 
  Plus, 
  Minus, 
  Check, 
  X, 
  RefreshCw, 
  Eye, 
  Info,
  Lock,
  Trash2,
  Layers,
  ChevronRight
} from 'lucide-react';

const BASE_WIDTH = 750;
const BASE_HEIGHT = 400;
const DEFAULT_PREVIEW_SCALE = 2;
const MAX_EXPORT_BYTES = 5 * 1024 * 1024;
const GUIDE_TOLERANCE = 6;
const GUIDE_COLOR = '#22d3ee';
const EXPORT_QUALITIES = [0.92, 0.86, 0.8, 0.74, 0.68, 0.6, 0.52, 0.44, 0.36, 0.28, 0.22];
const TEXT_BOX_MIN_WIDTH = 80;
const TEXT_BOX_MAX_WIDTH = 680;
const TEXT_RESIZE_HANDLE_RADIUS = 12;
const CANVAS_GUIDES = {
  vertical: [0, BASE_WIDTH / 2, BASE_WIDTH],
  horizontal: [0, BASE_HEIGHT / 2, BASE_HEIGHT],
};

const ART_TEXT_PRESETS = {
  black: {
    label: '商务黑标题',
    fontFamily: '"Arial Black", "Segoe UI", sans-serif',
    fillColor: '#111111',
  },
  blue: {
    label: '品牌蓝副标题',
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
    fillColor: '#31a6ef',
  },
  body: {
    label: '说明深灰',
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
    fillColor: '#444444',
  },
  muted: {
    label: '信息浅灰',
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif',
    fillColor: '#7a8599',
  },
  inverse: {
    label: '深底白字',
    fontFamily: '"Arial Black", "Segoe UI", sans-serif',
    fillColor: '#f8fafc',
    strokeColor: 'rgba(15, 23, 42, 0.18)',
    strokeWidthRatio: 0.025,
  },
};

// 750x400 像素级预设模板配置
const TEMPLATES = [
  {
    id: 'cover',
    name: '图1：封面概览 (对应 07.jpg)',
    themeColor: 'from-blue-600 to-indigo-400',
    description: '科技感渐变背景，适合作为首图突出产品型号与品类',
    fields: [
      { id: 'title', label: '主标题 (大黑体)', default: 'E200 Series', defaultSize: 46, defaultLh: 50, isBold: true, color: '#000000', defaultX: 390, defaultY: 200, maxWidth: 330, defaultStyle: 'black', aiDesc: "Main title of the poster. Must be very short (1-3 words), e.g., 'E200 Series' or 'Industrial PC'." },
      { id: 'subtitle', label: '副标题', default: 'Embedded Mini Size IPC', defaultSize: 24, defaultLh: 30, isBold: false, color: '#000000', defaultX: 330, defaultY: 270, maxWidth: 390, defaultStyle: 'black', aiDesc: "Subtitle describing the product class. Short (3-5 words), e.g., 'Embedded Mini Size IPC'." }
    ]
  },
  {
    id: 'performance',
    name: '图2：性能展示 (对应 08.jpg)',
    themeColor: 'from-sky-200 to-blue-300',
    description: '突出强大的CPU计算核心与内存插槽特性',
    fields: [
      { id: 'title', label: '主标题', default: 'Powerful', defaultSize: 46, defaultLh: 50, isBold: true, color: '#000000', defaultX: 110, defaultY: 80, maxWidth: 580, defaultStyle: 'black', aiDesc: "Main title showing a core feature. 1-2 words, e.g., 'Powerful' or 'High Performance'." },
      { id: 'subtitle', label: '蓝字副标题', default: 'Based on Intel Processor Platform', defaultSize: 20, defaultLh: 28, isBold: false, color: '#4a9af8', defaultX: 60, defaultY: 140, maxWidth: 320, defaultStyle: 'blue', aiDesc: "Sub-headline. Short phrase (3-6 words), e.g., 'Based on Intel Processor Platform'." },
      { id: 'desc', label: '段落描述 (按回车换行)', default: 'Intel® Pentium® J4205/Celeron® J3455 processor,\n\nBased on powerful data processing and computing\ncapabilities, it has excellent performance in embedded\napplications.', isMultiline: true, defaultSize: 13, defaultLh: 22, isBold: false, color: '#222222', defaultStyle: 'body', defaultX: 60, defaultY: 190, maxWidth: 320, aiDesc: "Paragraph description. A brief introduction of the CPU and processing capabilities, about 15-25 words. You must insert \\n every 6-8 words to break it into 3-4 short lines to prevent layout overflow." },
      { id: 'bullet1', label: '特性 1', default: '· LPDDR4 memory socket', defaultSize: 16, defaultLh: 24, isBold: true, color: '#000000', defaultStyle: 'black', defaultX: 50, defaultY: 300, maxWidth: 330, aiDesc: "Bullet point 1. A short highlight, must start with '· ' and be 3-5 words, e.g., '· LPDDR4 Memory Socket'." },
      { id: 'bullet2', label: '特性 2', default: '· Max. 8GB memory capacity', defaultSize: 16, defaultLh: 24, isBold: true, color: '#000000', defaultStyle: 'black', defaultX: 50, defaultY: 340, maxWidth: 330, aiDesc: "Bullet point 2. A short highlight, must start with '· ' and be 3-5 words, e.g., '· Max. 8GB Capacity'." }
    ]
  },
  {
    id: 'interfaces',
    name: '图3：丰富接口 (对应 09.jpg)',
    themeColor: 'from-blue-50 to-sky-200',
    description: '丰富接口展示版式，产品图自带标注',
    fields: [
      { id: 'title', label: '主标题', default: 'Rich Interfaces', defaultSize: 46, defaultLh: 50, isBold: true, color: '#000000', defaultX: 400, defaultY: 90, maxWidth: 320, defaultStyle: 'black', aiDesc: "Main title. 1-2 words, e.g., 'Rich Interfaces' or 'Connectivity'." },
      { id: 'subtitle', label: '蓝字副标题', default: 'Meet different application needs', defaultSize: 22, defaultLh: 30, isBold: false, color: '#4a9af8', defaultX: 400, defaultY: 140, maxWidth: 320, defaultStyle: 'blue', aiDesc: "Sub-headline. Short phrase (3-6 words), e.g., 'Meet Different Application Needs'." },
      { id: 'desc', label: '段落描述 (按回车换行)', default: 'The front panel includes 1 HDMI, resolution up to\n3840 x 2160@30Hz, 2 Gigabit Ethernet interfaces\ncontrolled by independent chips. 4 serial ports,\n4 USB interfaces. Besides, 2 CAN are optional.', isMultiline: true, defaultSize: 13, defaultLh: 22, isBold: false, color: '#444444', defaultStyle: 'body', defaultX: 400, defaultY: 190, maxWidth: 320, aiDesc: "Paragraph description of connectivity. Summary of ports, about 20-30 words. You must insert \\n every 6-8 words to break it into 4-5 short lines." }
    ]
  },
  {
    id: 'rugged',
    name: '图4：坚固紧凑 (对应 10.jpg)',
    themeColor: 'from-slate-100 to-indigo-100',
    description: '工业感深色图片框与尺寸标注信息卡片',
    fields: [
      { id: 'title', label: '主标题', default: 'Rugged and Compact', defaultSize: 40, defaultLh: 46, isBold: true, color: '#000000', defaultX: 35, defaultY: 80, maxWidth: 280, defaultStyle: 'black', aiDesc: "Main title. 2-3 words, e.g., 'Rugged and Compact' or 'Industrial Grade'." },
      { id: 'subtitle', label: '蓝字副标题', default: 'Stable in industrial environment', defaultSize: 18, defaultLh: 26, isBold: false, color: '#2493ff', defaultX: 35, defaultY: 125, maxWidth: 280, defaultStyle: 'blue', aiDesc: "Sub-headline. Short phrase (3-6 words), e.g., 'Stable in Harsh Environments'." },
      { id: 'desc', label: '段落描述 (按回车换行)', default: 'The shell of E200 adopts reinforced aluminum\nalloy gold.Tested to industry-grade standards,\nit has stronger resistance to corrosion,anti-rust.\nanti-interference ability in harsh industrial envir\n-onment. Modular and compact design structure.', isMultiline: true, defaultSize: 13, defaultLh: 20, isBold: false, color: '#4c5561', defaultStyle: 'body', defaultX: 35, defaultY: 170, maxWidth: 280, aiDesc: "Paragraph description of materials and build. About 20-30 words. You must insert \\n every 6-8 words to break it into 4-5 short lines." },
      { id: 'sizeOverall', label: '整机尺寸', default: '172 x 125 x 62.5mm', defaultSize: 24, defaultLh: 30, isBold: true, color: '#000000', defaultStyle: 'black', defaultX: 50, defaultY: 315, maxWidth: 300, aiDesc: "Overall size of the device. Typically numbers like '172 x 125 x 62.5mm' or similar, max 4 words." },
      { id: 'sizeBoard', label: '主板尺寸', default: '146 x 102mm', defaultSize: 18, defaultLh: 24, isBold: true, color: '#000000', defaultStyle: 'black', defaultX: 50, defaultY: 350, maxWidth: 300, aiDesc: "Motherboard size. Typically numbers like '146 x 102mm' or similar, max 4 words." }
    ]
  }
];

const PANEL_TEMPLATES = [
  {
    id: 'panel_cover',
    name: '图1：封面展示 (对应 06.jpg)',
    themeColor: 'from-slate-100 to-sky-100',
    description: '居中标题与工业平板主视觉，适合作为工业平板首图',
    fields: [
      { id: 'title', label: '主标题', default: 'P101 工业触控一体机', defaultSize: 44, defaultLh: 48, isBold: true, color: '#000000', defaultX: 125, defaultY: 90, maxWidth: 500, defaultStyle: 'black', defaultAlign: 'center', aiDesc: 'Main title for industrial panel PC cover. Keep it concise.' },
      { id: 'subtitleLeft', label: '卖点 1', default: '高清显示', defaultSize: 22, defaultLh: 28, isBold: false, color: '#4b5563', defaultX: 215, defaultY: 145, maxWidth: 150, defaultStyle: 'muted', defaultAlign: 'center', aiDesc: 'Short selling point, 2-4 words.' },
      { id: 'subtitleRight', label: '卖点 2', default: '轻松操作', defaultSize: 22, defaultLh: 28, isBold: false, color: '#4b5563', defaultX: 385, defaultY: 145, maxWidth: 150, defaultStyle: 'muted', defaultAlign: 'center', aiDesc: 'Short selling point, 2-4 words.' },
    ],
  },
  {
    id: 'panel_performance',
    name: '图2：性能展示 (对应 07.jpg)',
    themeColor: 'from-slate-50 to-indigo-100',
    description: '双标题 + 左图右信息卡，适合突出芯片平台与运行性能',
    fields: [
      { id: 'titleLeft', label: '标题左', default: '优异性能', defaultSize: 36, defaultLh: 40, isBold: true, color: '#000000', defaultX: 150, defaultY: 82, maxWidth: 180, defaultStyle: 'black', defaultAlign: 'center', aiDesc: 'Large title word group. 2-4 words.' },
      { id: 'titleRight', label: '标题右', default: '运行流畅', defaultSize: 36, defaultLh: 40, isBold: true, color: '#000000', defaultX: 420, defaultY: 82, maxWidth: 180, defaultStyle: 'black', defaultAlign: 'center', aiDesc: 'Large title word group. 2-4 words.' },
      { id: 'cardTitle', label: '卡片标题', default: 'Intel Alder Lake-N N97', defaultSize: 24, defaultLh: 30, isBold: true, color: '#111111', defaultX: 410, defaultY: 150, maxWidth: 270, defaultStyle: 'black', aiDesc: 'Main performance headline in the info card.' },
      { id: 'cardBody', label: '卡片说明', default: 'Intel Gen12 UHD Graphics Engines\n(SoC integrated)\nAMI 128Mbit SPI Flash', isMultiline: true, defaultSize: 16, defaultLh: 24, isBold: false, color: '#5b6472', defaultX: 410, defaultY: 200, maxWidth: 270, defaultStyle: 'body', aiDesc: 'Short multiline chip and graphics details.' },
      { id: 'storageTitle', label: '存储标题', default: '存储空间', defaultSize: 22, defaultLh: 28, isBold: true, color: '#111111', defaultX: 410, defaultY: 295, maxWidth: 240, defaultStyle: 'black', aiDesc: 'Subsection title inside card.' },
      { id: 'storageBody', label: '存储说明', default: '单通道 DDR5 SO-DIMM (最大16GB)', defaultSize: 15, defaultLh: 22, isBold: false, color: '#5b6472', defaultX: 410, defaultY: 324, maxWidth: 270, defaultStyle: 'body', aiDesc: 'One-line storage description.' },
      { id: 'footer', label: '卡片底部说明', default: '高性能平台，操作更稳定流畅。', defaultSize: 13, defaultLh: 18, isBold: false, color: '#1f2937', defaultX: 410, defaultY: 356, maxWidth: 255, defaultStyle: 'body', aiDesc: 'Short one-line concluding sentence for performance card.' },
      { id: 'bottomLeft', label: '底部卖点 1', default: '高清屏幕', defaultSize: 24, defaultLh: 28, isBold: true, color: '#000000', defaultX: 170, defaultY: 390, maxWidth: 170, defaultStyle: 'black', defaultAlign: 'center', aiDesc: 'Short bottom highlight, 2-4 words.' },
      { id: 'bottomRight', label: '底部卖点 2', default: '精准识别', defaultSize: 24, defaultLh: 28, isBold: true, color: '#000000', defaultX: 455, defaultY: 390, maxWidth: 170, defaultStyle: 'black', defaultAlign: 'center', aiDesc: 'Short bottom highlight, 2-4 words.' },
    ],
  },
  {
    id: 'panel_touch',
    name: '图3：触控与防护 (对应 08.jpg)',
    themeColor: 'from-white to-blue-100',
    description: '顶部三项能力标签 + 中部工业平板主图 + 底部蓝带卖点',
    fields: [
      { id: 'metric1Value', label: '指标 1 数值', default: '10.1"', defaultSize: 26, defaultLh: 30, isBold: true, color: '#274c8d', defaultX: 85, defaultY: 108, maxWidth: 120, defaultStyle: 'blue', defaultAlign: 'center', aiDesc: 'Short metric value such as size.' },
      { id: 'metric1Label', label: '指标 1 说明', default: '工业级液晶屏', defaultSize: 14, defaultLh: 20, isBold: false, color: '#111111', defaultX: 40, defaultY: 145, maxWidth: 210, defaultStyle: 'black', defaultAlign: 'center', aiDesc: 'Short metric label.' },
      { id: 'metric2Value', label: '指标 2 数值', default: '10点', defaultSize: 26, defaultLh: 30, isBold: true, color: '#274c8d', defaultX: 315, defaultY: 108, maxWidth: 120, defaultStyle: 'blue', defaultAlign: 'center', aiDesc: 'Short metric value such as touch points.' },
      { id: 'metric2Label', label: '指标 2 说明', default: '工业级电容触摸屏', defaultSize: 14, defaultLh: 20, isBold: false, color: '#111111', defaultX: 255, defaultY: 145, maxWidth: 240, defaultStyle: 'black', defaultAlign: 'center', aiDesc: 'Short metric label.' },
      { id: 'metric3Value', label: '指标 3 数值', default: 'IP65', defaultSize: 28, defaultLh: 32, isBold: true, color: '#274c8d', defaultX: 560, defaultY: 108, maxWidth: 120, defaultStyle: 'blue', defaultAlign: 'center', aiDesc: 'Short protection level value.' },
      { id: 'metric3Label', label: '指标 3 说明', default: '前面板防护等级', defaultSize: 14, defaultLh: 20, isBold: false, color: '#111111', defaultX: 500, defaultY: 145, maxWidth: 170, defaultStyle: 'black', defaultAlign: 'center', aiDesc: 'Short protection metric label.' },
      { id: 'bottomLeft', label: '底部卖点 1', default: '高清显示', defaultSize: 30, defaultLh: 34, isBold: true, color: '#f8fafc', defaultX: 45, defaultY: 375, maxWidth: 180, defaultStyle: 'inverse', defaultAlign: 'center', aiDesc: 'Bottom band highlight, 2-4 words.' },
      { id: 'bottomCenter', label: '底部卖点 2', default: '精准触控', defaultSize: 30, defaultLh: 34, isBold: true, color: '#f8fafc', defaultX: 285, defaultY: 375, maxWidth: 180, defaultStyle: 'inverse', defaultAlign: 'center', aiDesc: 'Bottom band highlight, 2-4 words.' },
      { id: 'bottomRight', label: '底部卖点 3', default: '坚固抗扰', defaultSize: 30, defaultLh: 34, isBold: true, color: '#f8fafc', defaultX: 520, defaultY: 375, maxWidth: 180, defaultStyle: 'inverse', defaultAlign: 'center', aiDesc: 'Bottom band highlight, 2-4 words.' },
    ],
  },
  {
    id: 'panel_expand',
    name: '图4：接口扩展 (对应 09.jpg)',
    themeColor: 'from-slate-50 to-slate-200',
    description: '双标题 + 左侧接口清单 + 右侧深色科技图框，适合展示扩展能力',
    fields: [
      { id: 'titleLeft', label: '标题左', default: '丰富接口', defaultSize: 38, defaultLh: 42, isBold: true, color: '#000000', defaultX: 155, defaultY: 82, maxWidth: 180, defaultStyle: 'black', defaultAlign: 'center', aiDesc: 'Large title word group. 2-4 words.' },
      { id: 'titleRight', label: '标题右', default: '畅享扩展', defaultSize: 38, defaultLh: 42, isBold: true, color: '#000000', defaultX: 420, defaultY: 82, maxWidth: 180, defaultStyle: 'black', defaultAlign: 'center', aiDesc: 'Large title word group. 2-4 words.' },
      { id: 'bullet1', label: '接口 1', default: '● 3 LAN', defaultSize: 20, defaultLh: 24, isBold: false, color: '#111111', defaultX: 70, defaultY: 170, maxWidth: 300, defaultStyle: 'black', aiDesc: 'Short bullet item about interfaces.' },
      { id: 'bullet2', label: '接口 2', default: '● 3 x USB 3.0, 1 x USB 2.0', defaultSize: 19, defaultLh: 24, isBold: false, color: '#111111', defaultX: 70, defaultY: 220, maxWidth: 300, defaultStyle: 'black', aiDesc: 'Short bullet item about USB interfaces.' },
      { id: 'bullet3', label: '接口 3', default: '● 2 x COM (可扩展 6 COM)', defaultSize: 19, defaultLh: 24, isBold: false, color: '#111111', defaultX: 70, defaultY: 270, maxWidth: 300, defaultStyle: 'black', aiDesc: 'Short bullet item about serial ports.' },
      { id: 'bullet4', label: '接口 4', default: '● 1 x DP, 1 x HDMI', defaultSize: 20, defaultLh: 24, isBold: false, color: '#111111', defaultX: 70, defaultY: 320, maxWidth: 300, defaultStyle: 'black', aiDesc: 'Short bullet item about display outputs.' },
      { id: 'bullet5', label: '接口 5', default: '● 1 x M.2, 1 x M.2, 1 x Nano SIM', defaultSize: 18, defaultLh: 24, isBold: false, color: '#111111', defaultX: 70, defaultY: 370, maxWidth: 300, defaultStyle: 'black', aiDesc: 'Short bullet item about expansion slots.' },
    ],
  },
];

const TEMPLATE_GROUPS = [
  {
    id: 'expandable-machine',
    name: '可扩展机器',
    description: 'E200 系列嵌入式工控机模板',
    exportPlaceholder: 'TPM7000',
    templates: TEMPLATES,
  },
  {
    id: 'industrial-panel',
    name: '工业平板',
    description: 'P101 系列工业触控一体机模板',
    exportPlaceholder: 'P101-1G',
    templates: PANEL_TEMPLATES,
  },
];

const ALL_TEMPLATES = TEMPLATE_GROUPS.flatMap((group) => group.templates);

const TEMPLATE_IMAGE_LAYOUTS = {
  cover: { x: 40, y: 90, w: 300, h: 220 },
  performance: { x: 380, y: 110, w: 330, h: 210 },
  interfaces: { x: 50, y: 120, w: 280, h: 180 },
  rugged: { x: 370, y: 100, w: 310, h: 200 },
  panel_cover: { x: 210, y: 165, w: 330, h: 190 },
  panel_performance: { x: 65, y: 108, w: 310, h: 235 },
  panel_touch: { x: 228, y: 152, w: 296, h: 178 },
  panel_expand: { x: 460, y: 135, w: 245, h: 175 },
};

const TEMPLATE_REFERENCE_SOURCES = {
  panel_cover: '/templateRefs/industrial-panel/06.jpg',
  panel_performance: '/templateRefs/industrial-panel/07.jpg',
  panel_touch: '/templateRefs/industrial-panel/08.jpg',
  panel_expand: '/templateRefs/industrial-panel/09.jpg',
};

const DEFAULT_IMAGE_POSITIONS = Object.fromEntries(
  Object.entries(TEMPLATE_IMAGE_LAYOUTS).map(([tplId, spec]) => [tplId, { x: spec.x, y: spec.y }])
);

const DEFAULT_IMAGE_SCALES = Object.fromEntries(
  ALL_TEMPLATES.map((tpl) => [tpl.id, 100])
);

// 初始化全量表单数据
const initData = () => {
  const data = {};
  ALL_TEMPLATES.forEach(tpl => {
    tpl.fields.forEach(f => {
      data[`${tpl.id}_${f.id}`] = f.default;
      data[`${tpl.id}_${f.id}_size`] = f.defaultSize;
      data[`${tpl.id}_${f.id}_lh`] = f.defaultLh;
      data[`${tpl.id}_${f.id}_x`] = f.defaultX;
      data[`${tpl.id}_${f.id}_y`] = f.defaultY;
      data[`${tpl.id}_${f.id}_style`] = f.defaultStyle || 'black';
      data[`${tpl.id}_${f.id}_w`] = f.maxWidth || 600;
      data[`${tpl.id}_${f.id}_align`] = f.defaultAlign || 'left';
    });
  });
  return data;
};

// 宣传图规格尺寸预设
const RESOLUTIONS = [
  { id: '750x400', name: '默认规格 (750 × 400)', width: 750, height: 400 },
  { id: '1920x820', name: '宽屏大图 (1920 × 820)', width: 1920, height: 820 },
  { id: '1000x1000', name: '方形主图 (1000 × 1000)', width: 1000, height: 1000 }
];

// 静态粒子数组以避免画布重绘时粒子闪烁跳动
const STABLE_PARTICLES = Array.from({ length: 35 }, (_, i) => ({
  xOffset: (i * 17 + 23) % 150,
  yOffset: (i * 13 + 37) % 140,
  r: ((i * 7 + 11) % 15) / 10 + 0.5 // 半径在 0.5 到 2.0 像素之间
}));

export default function App() {
  const [activeTemplateSetId, setActiveTemplateSetId] = useState(TEMPLATE_GROUPS[0].id);
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATE_GROUPS[0].templates[0]);
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[0]);
  const [formData, setFormData] = useState(initData());
  const [customFieldsByTemplate, setCustomFieldsByTemplate] = useState(() => (
    Object.fromEntries(ALL_TEMPLATES.map((tpl) => [tpl.id, []]))
  ));
  const [productImages, setProductImages] = useState({}); 
  const [templateReferenceImages, setTemplateReferenceImages] = useState({});
  const [imageScales, setImageScales] = useState({ ...DEFAULT_IMAGE_SCALES }); 
  const [imagePositions, setImagePositions] = useState({ ...DEFAULT_IMAGE_POSITIONS });
  const [exportProductName, setExportProductName] = useState('TPM7000');
  
  // 画布级拖拽、缩放交互状态
  const [selectedElement, setSelectedElement] = useState(null); // { type: 'text' | 'image', id?: string }
  const [hoveredElement, setHoveredElement] = useState(null); // 同上
  const [dragStart, setDragStart] = useState(null); // { mouseX, mouseY, originalX, originalY, originalScale }
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'move' | 'resize'
  const [smartGuides, setSmartGuides] = useState({ vertical: [], horizontal: [] });
  const [smartGuidesEnabled, setSmartGuidesEnabled] = useState(true);
  
  // AI 助手状态
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [aiInputText, setAiInputText] = useState(""); 
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  
  // 辅助参数
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [apiModel, setApiModel] = useState(localStorage.getItem('gemini_api_model') || 'gemini-2.5-flash');
  const [canvasGrid, setCanvasGrid] = useState(false);
  const [batchStatus, setBatchStatus] = useState(null); // 'exporting' | 'done' | null

  const canvasRef = useRef(null);
  const customFieldCounterRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      Object.entries(TEMPLATE_REFERENCE_SOURCES).map(([tplId, src]) => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve([tplId, image]);
        image.onerror = () => resolve([tplId, null]);
        image.src = src;
      }))
    ).then((entries) => {
      if (cancelled) return;
      setTemplateReferenceImages(
        Object.fromEntries(entries.filter(([, image]) => Boolean(image)))
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);
  const activeTemplateSet = TEMPLATE_GROUPS.find((group) => group.id === activeTemplateSetId) || TEMPLATE_GROUPS[0];
  const activeTemplates = activeTemplateSet.templates;

  // 保存配置
  const saveApiSettings = (key, model) => {
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gemini_api_model', model);
    setApiKey(key);
    setApiModel(model);
    setShowApiKeyModal(false);
  };

  const handleSelectTemplateSet = (group) => {
    setActiveTemplateSetId(group.id);
    setActiveTemplate(group.templates[0]);
    setSelectedElement(null);
    setHoveredElement(null);
    setSmartGuides({ vertical: [], horizontal: [] });
    if (!exportProductName || exportProductName === 'TPM7000' || exportProductName === 'P101-1G') {
      setExportProductName(group.exportPlaceholder);
    }
  };

  const handleSelectTemplate = (tpl) => {
    setActiveTemplate(tpl);
    setSelectedElement(null);
    setHoveredElement(null);
    setSmartGuides({ vertical: [], horizontal: [] });
  };

  // 恢复特定模板默认值
  const resetTemplateDefaults = (tplId) => {
    const tpl = getTemplateDefinition(tplId);
    if (!tpl) return;
    const customFields = getCustomFields(tplId);
    setFormData(prev => {
      const updated = { ...prev };
      customFields.forEach((field) => {
        getFieldStorageKeys(tplId, field.id).forEach((key) => {
          delete updated[key];
        });
      });
      tpl.fields.forEach(f => {
        updated[`${tplId}_${f.id}`] = f.default;
        updated[`${tplId}_${f.id}_size`] = f.defaultSize;
        updated[`${tplId}_${f.id}_lh`] = f.defaultLh;
        updated[`${tplId}_${f.id}_x`] = f.defaultX;
        updated[`${tplId}_${f.id}_y`] = f.defaultY;
        updated[`${tplId}_${f.id}_style`] = f.defaultStyle || 'black';
        updated[`${tplId}_${f.id}_w`] = f.maxWidth || 600;
        updated[`${tplId}_${f.id}_align`] = f.defaultAlign || 'left';
        updated[`${tplId}_${f.id}_hidden`] = false;
      });
      return updated;
    });
    setCustomFieldsByTemplate(prev => ({
      ...prev,
      [tplId]: [],
    }));
    setImagePositions(prev => ({
      ...prev,
      [tplId]: { ...DEFAULT_IMAGE_POSITIONS[tplId] }
    }));
    setImageScales(prev => ({
      ...prev,
      [tplId]: 100
    }));
    if (selectedElement?.type === 'text' && getFieldById(tplId, selectedElement.id)?.isCustom) {
      setSelectedElement(null);
    }
    if (hoveredElement?.type === 'text' && getFieldById(tplId, hoveredElement.id)?.isCustom) {
      setHoveredElement(null);
    }
    setSmartGuides({ vertical: [], horizontal: [] });
  };

  // 处理 PDF 上传解析 (优化原生调用)
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setPdfName(file.name);
      setAiError("");
      const reader = new FileReader();
      reader.onload = (event) => {
        setPdfBase64(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAiError("请选择有效的 PDF 文件格式。");
      setPdfName("");
      setPdfBase64(null);
    }
  };

  // 阿里国际站 AI 文案生成逻辑
  const handleAIGenerate = async () => {
    const currentKey = localStorage.getItem('gemini_api_key') || apiKey;
    if (!currentKey) {
      setAiError("未配置 Gemini API Key。请点击右上角「设置」配置 API 密钥，以便启动 AI 生成。");
      setShowApiKeyModal(true);
      return;
    }

    setAiLoading(true);
    setAiError("");
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${currentKey}`;

      const schemaProps = {};
      activeTemplate.fields.forEach(f => {
        schemaProps[f.id] = { type: "STRING", description: f.aiDesc || f.label };
      });

      const systemInstruction = "你是阿里国际站 (Alibaba.com) 的资深 B2B 英文营销文案专家。擅长提炼工业级产品（如工控机）的核心卖点。请根据提供的资料，使用专业、简洁、极具吸引力的全英文生成营销海报文案。请关注耐用性 (Durability)、高性能 (High Performance)、接口丰富度 (Rich Interfaces) 等 B2B 买家核心诉求。你必须严格控制生成文案的长度，使每个字段的字数契合海报排版空间，防止文字重叠和超宽。";
      
      const promptText = `请根据我提供的产品说明书PDF（如果有上传），以及以下补充的文字说明（如果有填写），为当前的营销海报【${activeTemplate.name}】自动编写全英文文案。如果没有提供任何信息，请根据海报主题自动编造一套标准工业计算机的高质量默认文案。请严格返回 JSON 格式，并映射到要求的字段中。注意文案断句时可以使用 \\n 进行换行。

重要限制要求（关系到海报排版美观，请严格遵守）：
1. 仔细阅读每个字段的描述（description）并遵循其最大字数限制。请务必保持内容短小精练。
2. 绝对不要生成长篇大论。例如特性/Bullet points（如 bullet1, bullet2 等）必须是极短的句式（3-5 个单词），如 "· LPDDR4 Memory Support"。
3. 对于多行段落描述 (desc)，请每隔 6-8 个单词适当插入 \\n 换行符，且总长度不要超过 25 个单词。

补充产品参数说明：${aiInputText}`;

      const parts = [{ text: promptText }];
      
      if (pdfBase64) {
        const base64Data = pdfBase64.split(",")[1];
        parts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data
          }
        });
      }

      const payload = {
        contents: [{ parts }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: schemaProps,
            required: activeTemplate.fields.map(f => f.id)
          }
        }
      };

      let response;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (response.ok) break;
        } catch (e) {
          if (attempt === 3) throw e;
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }

      if (!response || !response.ok) {
        const errText = response ? await response.text() : "Network error";
        throw new Error(errText || `API status code: ${response?.status}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const parsedData = JSON.parse(text);
        setFormData(prev => {
          const newData = { ...prev };
          Object.keys(parsedData).forEach(key => {
            newData[`${activeTemplate.id}_${key}`] = parsedData[key];
          });
          return newData;
        });
      } else {
        throw new Error("Gemini AI 返回内容为空");
      }
    } catch (err) {
      console.error(err);
      setAiError(`AI 解析生成失败：${err.message || "未知错误"}。建议检查您的 API 密钥，或直接将参数复制到文字框中再试一次。`);
    } finally {
      setAiLoading(false);
    }
  };

  // 处理独立图片上传
  const handleImageUpload = (e, tplId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setProductImages(prev => ({ ...prev, [tplId]: img }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const getTemplateDefinition = (tplId) => ALL_TEMPLATES.find((tpl) => tpl.id === tplId);

  const getTemplateImageLayout = (tplId) => TEMPLATE_IMAGE_LAYOUTS[tplId] || TEMPLATE_IMAGE_LAYOUTS.cover;

  const getBuiltInFieldById = (tplId, fieldId) => getTemplateDefinition(tplId)?.fields.find((field) => field.id === fieldId) || null;

  const getCustomFields = (tplId) => customFieldsByTemplate[tplId] || [];

  const getFieldById = (tplId, fieldId) => {
    return getBuiltInFieldById(tplId, fieldId) || getCustomFields(tplId).find((field) => field.id === fieldId) || null;
  };

  const getFieldStorageKeys = (tplId, fieldId) => ([
    `${tplId}_${fieldId}`,
    `${tplId}_${fieldId}_size`,
    `${tplId}_${fieldId}_lh`,
    `${tplId}_${fieldId}_x`,
    `${tplId}_${fieldId}_y`,
    `${tplId}_${fieldId}_style`,
    `${tplId}_${fieldId}_w`,
    `${tplId}_${fieldId}_align`,
    `${tplId}_${fieldId}_hidden`,
  ]);

  const isFieldHidden = (tplId, fieldId) => Boolean(formData[`${tplId}_${fieldId}_hidden`]);

  const getAllTextFields = (tplId, includeHidden = false) => {
    const builtIn = getTemplateDefinition(tplId)?.fields || [];
    const all = [...builtIn, ...getCustomFields(tplId)];
    return includeHidden ? all : all.filter((field) => !isFieldHidden(tplId, field.id));
  };

  const createCustomField = (tplId, fieldId) => {
    const index = getCustomFields(tplId).length + 1;
    return {
      id: fieldId,
      label: `自定义文本 ${index}`,
      default: 'Custom text',
      defaultSize: 26,
      defaultLh: 32,
      defaultX: 80 + (index * 16),
      defaultY: 80 + (index * 20),
      maxWidth: 260,
      defaultStyle: 'black',
      defaultAlign: 'left',
      isCustom: true,
    };
  };

  const addTextBox = (tplId) => {
    customFieldCounterRef.current += 1;
    const newFieldId = `custom_${tplId}_${customFieldCounterRef.current}`;
    const newField = createCustomField(tplId, newFieldId);
    setCustomFieldsByTemplate((prev) => ({
      ...prev,
      [tplId]: [...(prev[tplId] || []), newField],
    }));
    setFormData((prev) => ({
      ...prev,
      [`${tplId}_${newField.id}`]: newField.default,
      [`${tplId}_${newField.id}_size`]: newField.defaultSize,
      [`${tplId}_${newField.id}_lh`]: newField.defaultLh,
      [`${tplId}_${newField.id}_x`]: newField.defaultX,
      [`${tplId}_${newField.id}_y`]: newField.defaultY,
      [`${tplId}_${newField.id}_style`]: newField.defaultStyle,
      [`${tplId}_${newField.id}_w`]: newField.maxWidth,
      [`${tplId}_${newField.id}_align`]: newField.defaultAlign,
      [`${tplId}_${newField.id}_hidden`]: false,
    }));
    setSelectedElement({ type: 'text', id: newField.id });
  };

  const restoreField = (tplId, fieldId) => {
    setFormData((prev) => ({
      ...prev,
      [`${tplId}_${fieldId}_hidden`]: false,
    }));
    setSelectedElement({ type: 'text', id: fieldId });
  };

  const removeTextBox = (tplId, fieldId) => {
    const field = getFieldById(tplId, fieldId);
    if (!field) return;

    if (field.isCustom) {
      setCustomFieldsByTemplate((prev) => ({
        ...prev,
        [tplId]: (prev[tplId] || []).filter((item) => item.id !== fieldId),
      }));
      setFormData((prev) => {
        const next = { ...prev };
        getFieldStorageKeys(tplId, fieldId).forEach((key) => {
          delete next[key];
        });
        return next;
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [`${tplId}_${fieldId}_hidden`]: true,
      }));
    }

    if (selectedElement?.type === 'text' && selectedElement.id === fieldId) {
      setSelectedElement(null);
    }
    if (hoveredElement?.type === 'text' && hoveredElement.id === fieldId) {
      setHoveredElement(null);
    }
  };

  // 表单更新辅助函数
  const updateForm = (tplId, fieldId, prop, value) => {
    setFormData(prev => ({
      ...prev,
      [`${tplId}_${fieldId}${prop === 'value' ? '' : '_' + prop}`]: value
    }));
  };

  // Nudge 快速微调坐标
  const nudgeField = (tplId, fieldId, prop, amount) => {
    const key = `${tplId}_${fieldId}_${prop}`;
    const field = getFieldById(tplId, fieldId);
    if (!field) return;
    const currentValue = formData[key] ?? field[`default${prop.toUpperCase()}`];
    updateForm(tplId, fieldId, prop, Number(currentValue) + amount);
  };

  const sanitizeFileName = (value) => {
    const normalized = String(value || '').trim().replace(/[\\/:*?"<>|]/g, ' ');
    return normalized.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'product';
  };

  const getTemplateSequence = (tplId) => {
    const index = activeTemplates.findIndex((tpl) => tpl.id === tplId);
    return index >= 0 ? index + 1 : 1;
  };

  const buildExportFileName = (tplId) => {
    const primaryTemplate = activeTemplates[0];
    const fallbackTitle = (
      formData[`${primaryTemplate?.id}_title`]
      || formData[`${tplId}_title`]
      || formData[`${tplId}_cardTitle`]
      || 'product'
    );
    const baseName = sanitizeFileName(exportProductName || fallbackTitle);
    return `${baseName}-${getTemplateSequence(tplId)}.jpg`;
  };

  const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('导出失败，浏览器未返回图片数据。'));
      }
    }, type, quality);
  });

  const triggerBlobDownload = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const getWrappedLines = (ctx, text, maxWidth) => {
    const rawParagraphs = String(text || '').split('\\n').join('\n').split('\n');
    const lines = [];

    rawParagraphs.forEach((paragraph) => {
      if (!paragraph) {
        lines.push('');
        return;
      }

      if (paragraph.includes(' ')) {
        const words = paragraph.split(' ');
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (ctx.measureText(testLine).width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          lines.push(currentLine);
        }
        return;
      }

      let currentLine = '';
      for (let i = 0; i < paragraph.length; i += 1) {
        const nextLine = currentLine + paragraph[i];
        if (ctx.measureText(nextLine).width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = paragraph[i];
        } else {
          currentLine = nextLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    });

    return lines;
  };

  const getTextPreset = (field, tplId) => {
    const presetKey = formData[`${tplId}_${field.id}_style`] || field.defaultStyle || 'black';
    return {
      key: presetKey,
      ...ART_TEXT_PRESETS[presetKey],
    };
  };

  const getTextFont = (field, fontSize, tplId) => {
    const preset = getTextPreset(field, tplId);
    const weight = field.isBold ? 'bold ' : '';
    return `${weight}${fontSize}px ${preset.fontFamily || '"Segoe UI", "Microsoft YaHei", sans-serif'}`;
  };

  const getTextBoxWidth = (tplId, field) => {
    const stored = Number(formData[`${tplId}_${field.id}_w`]);
    const fallback = field.maxWidth || 600;
    return Math.max(TEXT_BOX_MIN_WIDTH, Math.min(TEXT_BOX_MAX_WIDTH, Number.isFinite(stored) && stored > 0 ? stored : fallback));
  };

  const getTextAlign = (tplId, field) => {
    return formData[`${tplId}_${field.id}_align`] || field.defaultAlign || 'left';
  };

  const getTextResizeHandle = (bound) => ({
    x: bound.x + bound.width,
    y: bound.y + (bound.height / 2),
  });

  const drawGuideLines = (ctx, scaleX, scaleY) => {
    if (!smartGuidesEnabled) return;
    if (!smartGuides.vertical.length && !smartGuides.horizontal.length) return;

    ctx.save();
    ctx.strokeStyle = GUIDE_COLOR;
    ctx.lineWidth = Math.max(1, scaleY * 1.2);
    ctx.setLineDash([8 * scaleY, 4 * scaleY]);

    smartGuides.vertical.forEach((x) => {
      const scaledX = x * scaleX;
      ctx.beginPath();
      ctx.moveTo(scaledX, 0);
      ctx.lineTo(scaledX, BASE_HEIGHT * scaleY);
      ctx.stroke();
    });

    smartGuides.horizontal.forEach((y) => {
      const scaledY = y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, scaledY);
      ctx.lineTo(BASE_WIDTH * scaleX, scaledY);
      ctx.stroke();
    });

    ctx.restore();
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
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
  };

  const getImageDrawRect = (img, x, y, w, h, scalePerc = 100, scaleX = 1, scaleY = 1) => {
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    const scaledW = w * scaleX;
    const scaledH = h * scaleY;

    if (!img) {
      return {
        x: scaledX,
        y: scaledY,
        width: scaledW,
        height: scaledH,
      };
    }

    const imgRatio = img.width / img.height;
    const boxRatio = scaledW / scaledH;
    let drawW = scaledW;
    let drawH = scaledH;

    if (imgRatio > boxRatio) {
      drawH = scaledW / imgRatio;
    } else {
      drawW = scaledH * imgRatio;
    }

    const scale = scalePerc / 100;
    const finalW = drawW * scale;
    const finalH = drawH * scale;

    return {
      x: scaledX + (scaledW - finalW) / 2,
      y: scaledY + (scaledH - finalH) / 2,
      width: finalW,
      height: finalH,
    };
  };

  const drawImageAspect = (ctx, img, x, y, w, h, scalePerc = 100, scaleX = 1, scaleY = 1) => {
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    const scaledW = w * scaleX;
    const scaledH = h * scaleY;

    if (!img) {
      // 占位图设计，使用高端玻璃卡片感
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      drawRoundedRect(ctx, scaledX, scaledY, scaledW, scaledH, 12 * scaleY);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5 * scaleY;
      ctx.setLineDash([6 * scaleY, 4 * scaleY]);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = `${Math.round(13 * scaleY)}px "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📤 上传产品图 (PNG免抠最佳)', scaledX + scaledW / 2, scaledY + scaledH / 2);
      ctx.restore();
      return;
    }
    const rect = getImageDrawRect(img, x, y, w, h, scalePerc, scaleX, scaleY);
    ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
  };

  const drawPanelMetricIcon = (ctx, type, centerX, topY, scaleX = 1, scaleY = 1) => {
    const cx = centerX * scaleX;
    const y = topY * scaleY;
    const stroke = '#1f2937';
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.fillStyle = stroke;
    ctx.lineWidth = Math.max(1.2, 1.8 * scaleY);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (type === 'screen') {
      const w = 70 * scaleX;
      const h = 48 * scaleY;
      drawRoundedRect(ctx, cx - w / 2, y, w, h, 8 * scaleY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - (w / 2) + 8 * scaleX, y + 10 * scaleY);
      ctx.lineTo(cx - (w / 2) + 20 * scaleX, y + 10 * scaleY);
      ctx.moveTo(cx + (w / 2) - 22 * scaleX, y + 10 * scaleY);
      ctx.lineTo(cx + (w / 2) - 10 * scaleX, y + 22 * scaleY);
      ctx.stroke();
    } else if (type === 'touch') {
      const w = 70 * scaleX;
      const h = 48 * scaleY;
      drawRoundedRect(ctx, cx - w / 2, y, w, h, 8 * scaleY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 20 * scaleX, y + 14 * scaleY, 12 * scaleY, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 18 * scaleX, y + 28 * scaleY);
      ctx.lineTo(cx + 18 * scaleX, y + 52 * scaleY);
      ctx.moveTo(cx + 10 * scaleX, y + 38 * scaleY);
      ctx.lineTo(cx + 18 * scaleX, y + 28 * scaleY);
      ctx.lineTo(cx + 28 * scaleX, y + 38 * scaleY);
      ctx.stroke();
    } else if (type === 'ip') {
      const w = 60 * scaleX;
      const h = 58 * scaleY;
      drawRoundedRect(ctx, cx - w / 2, y, w, h, 6 * scaleY);
      ctx.stroke();
      ctx.font = `bold ${Math.round(12 * scaleY)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('IP65', cx, y + 38 * scaleY);
      ctx.beginPath();
      ctx.arc(cx - 10 * scaleX, y + 14 * scaleY, 5 * scaleY, 0, Math.PI * 2);
      ctx.arc(cx + 10 * scaleX, y + 14 * scaleY, 5 * scaleY, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawVerticalWordmark = (ctx, text, x, y, size, alpha, scaleX = 1, scaleY = 1) => {
    ctx.save();
    ctx.translate(x * scaleX, y * scaleY);
    ctx.rotate(-Math.PI / 2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#1f3f7a';
    ctx.font = `bold ${Math.round(size * scaleY)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  };

  const drawBlurredRect = (ctx, x, y, width, height, radius, fillStyle, blur, scaleX = 1, scaleY = 1) => {
    ctx.save();
    ctx.filter = `blur(${Math.max(1, blur * scaleY)}px)`;
    ctx.fillStyle = fillStyle;
    drawRoundedRect(ctx, x * scaleX, y * scaleY, width * scaleX, height * scaleY, radius * scaleY);
    ctx.fill();
    ctx.restore();
  };

  const drawImageReflection = (ctx, img, x, y, w, h, scalePerc = 100, scaleX = 1, scaleY = 1, opacity = 0.16) => {
    const rect = getImageDrawRect(img, x, y, w, h, scalePerc, scaleX, scaleY);
    const offsetY = 8 * scaleY;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x - (20 * scaleX), rect.y + rect.height + offsetY, rect.width + (40 * scaleX), rect.height * 0.42);
    ctx.clip();
    ctx.translate(0, (rect.y + rect.height + offsetY) * 2);
    ctx.scale(1, -1);
    ctx.globalAlpha = opacity;

    if (img) {
      ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height);
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
      drawRoundedRect(ctx, rect.x, rect.y, rect.width, rect.height, 12 * scaleY);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    const fade = ctx.createLinearGradient(0, rect.y + rect.height + offsetY, 0, rect.y + rect.height + offsetY + (rect.height * 0.45));
    fade.addColorStop(0, 'rgba(255,255,255,0.12)');
    fade.addColorStop(1, 'rgba(255,255,255,0.96)');
    ctx.fillStyle = fade;
    ctx.fillRect(rect.x - (12 * scaleX), rect.y + rect.height + offsetY, rect.width + (24 * scaleX), rect.height * 0.45);
    ctx.restore();
  };

  const drawTechScreenBackdrop = (ctx, x, y, width, height, scaleX = 1, scaleY = 1) => {
    const left = x * scaleX;
    const top = y * scaleY;
    const w = width * scaleX;
    const h = height * scaleY;

    ctx.save();
    const bg = ctx.createLinearGradient(left, top, left + w, top + h);
    bg.addColorStop(0, '#e9eef7');
    bg.addColorStop(1, '#f7f9fd');
    ctx.fillStyle = bg;
    ctx.fillRect(left, top, w, h);

    ctx.strokeStyle = 'rgba(203, 213, 225, 0.3)';
    ctx.lineWidth = 1 * scaleY;
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.moveTo(left + (i * 55 * scaleX), top + h);
      ctx.lineTo(left + ((i + 2) * 55 * scaleX), top);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(left + (w / 2), top + (h / 2), 56 * scaleY, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 28 * scaleY;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(left + (w / 2), top + (h / 2), 70 * scaleY, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.lineWidth = 2 * scaleY;
    ctx.setLineDash([5 * scaleY, 4 * scaleY]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  };

  const drawExactText = (ctx, tplId, field, scaleX = 1, scaleY = 1, scaleText = 1) => {
    if (!field || isFieldHidden(tplId, field.id)) return;
    const text = formData[`${tplId}_${field.id}`] || '';
    const size = formData[`${tplId}_${field.id}_size`] || field.defaultSize;
    const lh = formData[`${tplId}_${field.id}_lh`] || field.defaultLh;
    const x = formData[`${tplId}_${field.id}_x`] ?? field.defaultX;
    const y = formData[`${tplId}_${field.id}_y`] ?? field.defaultY;
    const align = getTextAlign(tplId, field);
    
    const scaledSize = Math.round(size * scaleText);
    const scaledLh = Math.round(lh * scaleText);
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    const fieldMaxWidth = getTextBoxWidth(tplId, field) * scaleX;
    const preset = getTextPreset(field, tplId);

    ctx.save();
    ctx.font = getTextFont(field, scaledSize, tplId);
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    
    const lines = getWrappedLines(ctx, text, fieldMaxWidth);

    lines.forEach((line, index) => {
      const lineY = scaledY + (index * scaledLh);
      let drawX = scaledX;
      if (align === 'center') {
        drawX = scaledX + (fieldMaxWidth / 2);
      } else if (align === 'right') {
        drawX = scaledX + fieldMaxWidth;
      }

      ctx.textAlign = align;
      ctx.shadowColor = preset.shadowColor || 'transparent';
      ctx.shadowBlur = Math.round((preset.shadowBlur || 0) * scaledSize);
      ctx.shadowOffsetX = Math.round((preset.shadowOffsetX || 0) * scaledSize);
      ctx.shadowOffsetY = Math.round((preset.shadowOffsetY || 0) * scaledSize);

      if (preset.strokeColor) {
        ctx.strokeStyle = preset.strokeColor;
        ctx.lineWidth = Math.max(1.2, scaledSize * (preset.strokeWidthRatio || 0.07));
        ctx.strokeText(line, drawX, lineY);
      }

      ctx.fillStyle = preset.fillColor || field.color;
      ctx.fillText(line, drawX, lineY);
    });

    ctx.restore();
  };

  const drawGrid = (ctx, scaleX = 1, scaleY = 1, width = 750, height = 400) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.lineWidth = 0.5 * scaleY;
    
    // 画横线
    for (let y = 50; y < 400; y += 50) {
      const scaledY = y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, scaledY);
      ctx.lineTo(width, scaledY);
      ctx.stroke();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.font = `${Math.round(9 * scaleY)}px monospace`;
      ctx.fillText(y, 5 * scaleX, scaledY - 2 * scaleY);
    }
    
    // 画竖线
    for (let x = 50; x < 750; x += 50) {
      const scaledX = x * scaleX;
      ctx.beginPath();
      ctx.moveTo(scaledX, 0);
      ctx.lineTo(scaledX, height);
      ctx.stroke();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.font = `${Math.round(9 * scaleY)}px monospace`;
      ctx.fillText(x, scaledX + 2 * scaleX, 10 * scaleY);
    }
    ctx.restore();
  };

  // 获取特定模板中各元素在 750x400 设计分辨率下的 bounding box
  const getElementBounds = (ctx, tplId) => {
    const tpl = getTemplateDefinition(tplId);
    if (!tpl) return [];

    const bounds = [];

    // 1. 获取图片的位置与尺寸范围
    const imgSize = getTemplateImageLayout(tplId);
    const imgPos = imagePositions[tplId] || DEFAULT_IMAGE_POSITIONS[tplId];
    bounds.push({
      type: 'image',
      id: 'product_image',
      x: imgPos.x,
      y: imgPos.y,
      width: imgSize.w,
      height: imgSize.h
    });

    // 2. 获取每个文字字段的范围
    ctx.save();
    getAllTextFields(tplId).forEach(field => {
      const text = formData[`${tplId}_${field.id}`] || '';
      const size = formData[`${tplId}_${field.id}_size`] || field.defaultSize;
      const lh = formData[`${tplId}_${field.id}_lh`] || field.defaultLh;
      const x = formData[`${tplId}_${field.id}_x`] ?? field.defaultX;
      const y = formData[`${tplId}_${field.id}_y`] ?? field.defaultY;

      ctx.font = getTextFont(field, size, tplId);
      const fieldMaxWidth = getTextBoxWidth(tplId, field);
      const lines = getWrappedLines(ctx, text, fieldMaxWidth);
      const totalHeight = lines.length * lh;

      bounds.push({
        type: 'text',
        id: field.id,
        x: x,
        y: y - size,
        width: Math.max(fieldMaxWidth, 30),
        height: Math.max(totalHeight, lh)
      });
    });

    ctx.restore();
    return bounds;
  };

  const getSelectedBound = (bounds) => {
    if (!selectedElement) return null;
    return bounds.find((bound) => bound.type === selectedElement.type && bound.id === selectedElement.id) || null;
  };

  const resolveSnappedPosition = (bounds, movingRect) => {
    if (!smartGuidesEnabled) {
      return { x: movingRect.x, y: movingRect.y, guides: { vertical: [], horizontal: [] } };
    }

    const verticalTargets = [...CANVAS_GUIDES.vertical];
    const horizontalTargets = [...CANVAS_GUIDES.horizontal];

    bounds.forEach((bound) => {
      if (selectedElement && bound.type === selectedElement.type && bound.id === selectedElement.id) return;
      verticalTargets.push(bound.x, bound.x + (bound.width / 2), bound.x + bound.width);
      horizontalTargets.push(bound.y, bound.y + (bound.height / 2), bound.y + bound.height);
    });

    const movingVerticals = [
      { edge: 'left', value: movingRect.x },
      { edge: 'center', value: movingRect.x + (movingRect.width / 2) },
      { edge: 'right', value: movingRect.x + movingRect.width },
    ];
    const movingHorizontals = [
      { edge: 'top', value: movingRect.y },
      { edge: 'center', value: movingRect.y + (movingRect.height / 2) },
      { edge: 'bottom', value: movingRect.y + movingRect.height },
    ];

    let bestX = { delta: GUIDE_TOLERANCE + 1 };
    let bestY = { delta: GUIDE_TOLERANCE + 1 };

    movingVerticals.forEach((source) => {
      verticalTargets.forEach((target) => {
        const delta = target - source.value;
        if (Math.abs(delta) < Math.abs(bestX.delta) && Math.abs(delta) <= GUIDE_TOLERANCE) {
          bestX = { delta, target, edge: source.edge };
        }
      });
    });

    movingHorizontals.forEach((source) => {
      horizontalTargets.forEach((target) => {
        const delta = target - source.value;
        if (Math.abs(delta) < Math.abs(bestY.delta) && Math.abs(delta) <= GUIDE_TOLERANCE) {
          bestY = { delta, target, edge: source.edge };
        }
      });
    });

    return {
      x: movingRect.x + (bestX.target !== undefined ? bestX.delta : 0),
      y: movingRect.y + (bestY.target !== undefined ? bestY.delta : 0),
      guides: {
        vertical: bestX.target !== undefined ? [bestX.target] : [],
        horizontal: bestY.target !== undefined ? [bestY.target] : [],
      },
    };
  };

  const drawTextFieldById = (ctx, tplId, fieldId, scaleX = 1, scaleY = 1, scaleText = 1) => {
    drawExactText(ctx, tplId, getFieldById(tplId, fieldId), scaleX, scaleY, scaleText);
  };

  const drawCustomTextFields = (ctx, tplId, scaleX = 1, scaleY = 1, scaleText = 1) => {
    getCustomFields(tplId).forEach((field) => {
      drawExactText(ctx, tplId, field, scaleX, scaleY, scaleText);
    });
  };

  const renderTemplateToCanvas = (ctx, tpl, data, img, scalePerc, width = BASE_WIDTH, height = BASE_HEIGHT, superScale = DEFAULT_PREVIEW_SCALE, isExporting = false) => {
    const tplId = tpl.id;
    const scaleX = width / BASE_WIDTH;
    const scaleY = height / BASE_HEIGHT;
    const scaleText = scaleY;
    const imageLayout = getTemplateImageLayout(tplId);
    const referenceImage = templateReferenceImages[tplId];

    ctx.clearRect(0, 0, width * superScale, height * superScale);

    ctx.save();
    ctx.scale(superScale, superScale);

    // 启用高质量平滑滤波
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (tplId === 'cover') {
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#357ae1');
      bgGradient.addColorStop(1, '#92cbfd');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1 * scaleY;
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (260 + i * 8) * scaleY);
        ctx.bezierCurveTo(150 * scaleX, (280 + i * 5) * scaleY, 300 * scaleX, (320 + i * 10) * scaleY, 500 * scaleX, 400 * scaleY);
        ctx.stroke();
      }
      ctx.restore();

      drawTextFieldById(ctx, tplId, 'title', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'subtitle', scaleX, scaleY, scaleText);

      drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, imageLayout.w, imageLayout.h, scalePerc, scaleX, scaleY);

    } else if (tplId === 'performance') {
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#d1eaff'); 
      bgGradient.addColorStop(1, '#a6d3ff'); 
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(750 * scaleX, 0);
      ctx.bezierCurveTo(450 * scaleX, 150 * scaleY, 200 * scaleX, -50 * scaleY, 0, 180 * scaleY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
      ctx.restore();

      drawTextFieldById(ctx, tplId, 'title', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'subtitle', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'desc', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'bullet1', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'bullet2', scaleX, scaleY, scaleText);

      drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, imageLayout.w, imageLayout.h, scalePerc, scaleX, scaleY);

    } else if (tplId === 'interfaces') {
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, '#eaf4fc');
      bg.addColorStop(1, '#bcdfff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(350 * scaleX, 0);
      ctx.lineTo(750 * scaleX, 0);
      ctx.lineTo(750 * scaleX, 400 * scaleY);
      ctx.lineTo(100 * scaleX, 400 * scaleY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(120, 180, 255, 0.15)';
      ctx.fill();

      drawTextFieldById(ctx, tplId, 'title', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'subtitle', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'desc', scaleX, scaleY, scaleText);

      drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, imageLayout.w, imageLayout.h, scalePerc, scaleX, scaleY);

    } else if (tplId === 'rugged') {
      const leftBg = ctx.createLinearGradient(0, 0, 400 * scaleX, 400 * scaleY);
      leftBg.addColorStop(0, '#f4f8fc'); leftBg.addColorStop(1, '#e3edf8');
      ctx.fillStyle = leftBg;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#101114';
      ctx.fillRect(330 * scaleX, 55 * scaleY, 420 * scaleX, 290 * scaleY);

      drawTextFieldById(ctx, tplId, 'title', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'subtitle', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'desc', scaleX, scaleY, scaleText);

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 15 * scaleY;
      ctx.shadowOffsetX = 5 * scaleX;
      ctx.shadowOffsetY = 8 * scaleY;
      
      ctx.fillStyle = 'rgba(248, 250, 252, 0.88)'; 
      drawRoundedRect(ctx, 35 * scaleX, 265 * scaleY, 330 * scaleX, 95 * scaleY, 12 * scaleY);
      ctx.fill();
      ctx.shadowColor = 'transparent'; 
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 * scaleY;
      ctx.stroke();
      ctx.restore();

      const sizeOverallField = getFieldById(tplId, 'sizeOverall');
      const size1_x = formData[`${tplId}_sizeOverall_x`] ?? sizeOverallField?.defaultX ?? 50;
      const size1_y = formData[`${tplId}_sizeOverall_y`] ?? sizeOverallField?.defaultY ?? 315;
      if (!isFieldHidden(tplId, 'sizeOverall')) {
        ctx.fillStyle = '#7a8599'; 
        ctx.font = `${Math.round(12 * scaleText)}px Arial`;
        ctx.fillText('Overall size', size1_x * scaleX, (size1_y - 25) * scaleY);
      }
      drawTextFieldById(ctx, tplId, 'sizeOverall', scaleX, scaleY, scaleText);
      
      const sizeBoardField = getFieldById(tplId, 'sizeBoard');
      const size2_x = formData[`${tplId}_sizeBoard_x`] ?? sizeBoardField?.defaultX ?? 50;
      const size2_y = formData[`${tplId}_sizeBoard_y`] ?? sizeBoardField?.defaultY ?? 350;
      if (!isFieldHidden(tplId, 'sizeBoard')) {
        ctx.fillStyle = '#7a8599'; 
        ctx.font = `${Math.round(12 * scaleText)}px Arial`;
        ctx.fillText('Motherboard size', size2_x * scaleX, (size2_y - 15) * scaleY);
      }
      drawTextFieldById(ctx, tplId, 'sizeBoard', scaleX, scaleY, scaleText);

      ctx.fillStyle = '#000000'; 
      ctx.font = `bold ${Math.round(36 * scaleText)}px Arial`;
      ctx.fillText('CE  FC', 220 * scaleX, 335 * scaleY);

      drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, imageLayout.w, imageLayout.h, scalePerc, scaleX, scaleY);
      
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      STABLE_PARTICLES.forEach(p => {
        ctx.beginPath();
        ctx.arc((600 + p.xOffset) * scaleX, (200 + p.yOffset) * scaleY, p.r * scaleY, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (tplId === 'panel_cover') {
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, '#eef7ff');
      bg.addColorStop(0.5, '#f8fbff');
      bg.addColorStop(1, '#eef6ff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      drawBlurredRect(ctx, 8, 8, 86, 370, 28, 'rgba(178, 214, 249, 0.28)', 26, scaleX, scaleY);
      drawBlurredRect(ctx, 98, 0, 80, 392, 28, 'rgba(196, 225, 255, 0.26)', 26, scaleX, scaleY);
      drawBlurredRect(ctx, 205, 10, 340, 92, 28, 'rgba(190, 222, 255, 0.28)', 22, scaleX, scaleY);
      drawBlurredRect(ctx, 565, 6, 88, 378, 24, 'rgba(188, 222, 254, 0.25)', 28, scaleX, scaleY);
      drawBlurredRect(ctx, 646, 14, 76, 360, 22, 'rgba(204, 232, 255, 0.22)', 24, scaleX, scaleY);
      drawBlurredRect(ctx, 160, 118, 430, 64, 26, 'rgba(255, 255, 255, 0.78)', 14, scaleX, scaleY);
      drawBlurredRect(ctx, 150, 176, 450, 150, 28, 'rgba(255, 255, 255, 0.34)', 24, scaleX, scaleY);
      drawBlurredRect(ctx, 0, 338, 750, 48, 0, 'rgba(172, 205, 236, 0.34)', 18, scaleX, scaleY);

      ctx.save();
      const centerGlow = ctx.createRadialGradient(375 * scaleX, 205 * scaleY, 20 * scaleY, 375 * scaleX, 205 * scaleY, 250 * scaleY);
      centerGlow.addColorStop(0, 'rgba(183, 217, 255, 0.16)');
      centerGlow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      drawTextFieldById(ctx, tplId, 'title', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'subtitleLeft', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'subtitleRight', scaleX, scaleY, scaleText);

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
      ctx.beginPath();
      ctx.ellipse(375 * scaleX, 346 * scaleY, 120 * scaleX, 14 * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (!img) {
        const frameX = imagePositions[tplId].x;
        const frameY = imagePositions[tplId].y;
        const frameW = imageLayout.w;
        const frameH = imageLayout.h;
        ctx.save();
        ctx.fillStyle = '#e6ebf1';
        ctx.beginPath();
        ctx.moveTo((frameX + frameW) * scaleX, frameY * scaleY);
        ctx.lineTo((frameX + frameW + 12) * scaleX, (frameY + 6) * scaleY);
        ctx.lineTo((frameX + frameW + 12) * scaleX, (frameY + frameH - 8) * scaleY);
        ctx.lineTo((frameX + frameW) * scaleX, frameY * scaleY + (frameH * scaleY));
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(ctx, frameX * scaleX, frameY * scaleY, frameW * scaleX, frameH * scaleY, 11 * scaleY);
        ctx.fill();
        ctx.fillStyle = '#05070b';
        drawRoundedRect(ctx, (frameX + 7) * scaleX, (frameY + 5) * scaleY, (frameW - 14) * scaleX, (frameH - 10) * scaleY, 8 * scaleY);
        ctx.fill();
        const panelScreen = ctx.createLinearGradient((frameX + 24) * scaleX, (frameY + 22) * scaleY, (frameX + frameW - 20) * scaleX, (frameY + frameH - 18) * scaleY);
        panelScreen.addColorStop(0, '#0d2349');
        panelScreen.addColorStop(0.45, '#0d4ea7');
        panelScreen.addColorStop(1, '#0b89ff');
        ctx.fillStyle = panelScreen;
        ctx.fillRect((frameX + 24) * scaleX, (frameY + 22) * scaleY, (frameW - 46) * scaleX, (frameH - 42) * scaleY);
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1.6 * scaleY;
        ctx.strokeRect((frameX + 24) * scaleX, (frameY + 22) * scaleY, (frameW - 46) * scaleX, (frameH - 42) * scaleY);
        ctx.fillStyle = 'rgba(255,255,255,0.86)';
        [0, 1, 2, 3].forEach((index) => {
          ctx.fillRect((frameX + frameW - 4) * scaleX, (frameY + 54 + (index * 18)) * scaleY, 2 * scaleX, 8 * scaleY);
        });
        ctx.restore();
      } else {
        drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, imageLayout.w, imageLayout.h, scalePerc, scaleX, scaleY);
      }
      if (img) {
        drawImageReflection(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, imageLayout.w, imageLayout.h, scalePerc, scaleX, scaleY, 0.14);
      } else {
        ctx.save();
        const floorFade = ctx.createLinearGradient(0, 322 * scaleY, 0, 386 * scaleY);
        floorFade.addColorStop(0, 'rgba(186, 203, 224, 0.18)');
        floorFade.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = floorFade;
        ctx.fillRect(210 * scaleX, 320 * scaleY, 340 * scaleX, 54 * scaleY);
        ctx.restore();
      }
    } else if (tplId === 'panel_performance') {
      if (referenceImage) {
        ctx.drawImage(referenceImage, 0, 0, width, height);
      } else {
        ctx.fillStyle = '#fcfdff';
        ctx.fillRect(0, 0, width, height);
      }

      if (!referenceImage) {
        drawVerticalWordmark(ctx, 'PANEL', 25, 250, 92, 0.05, scaleX, scaleY);
      }

      ctx.save();
      ctx.fillStyle = 'rgba(252, 253, 255, 0.96)';
      ctx.fillRect(145 * scaleX, 14 * scaleY, 470 * scaleX, 82 * scaleY);
      ctx.fillRect(168 * scaleX, 332 * scaleY, 446 * scaleX, 58 * scaleY);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
      [520, 560, 600].forEach((xPos, index) => {
        ctx.beginPath();
        ctx.arc(xPos * scaleX, (55 + (index * 3)) * scaleY, 2.2 * scaleY, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      drawTextFieldById(ctx, tplId, 'titleLeft', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'titleRight', scaleX, scaleY, scaleText);

      ctx.save();
      ctx.shadowColor = 'rgba(37, 99, 235, 0.14)';
      ctx.shadowBlur = 20 * scaleY;
      const chipCard = ctx.createLinearGradient(65 * scaleX, 110 * scaleY, 365 * scaleX, 335 * scaleY);
      chipCard.addColorStop(0, '#06124a');
      chipCard.addColorStop(1, '#09153a');
      ctx.fillStyle = chipCard;
      drawRoundedRect(ctx, 70 * scaleX, 110 * scaleY, 300 * scaleX, 225 * scaleY, 14 * scaleY);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(78, 213, 255, 0.75)';
      ctx.lineWidth = 2.5 * scaleY;
      drawRoundedRect(ctx, 102 * scaleX, 140 * scaleY, 226 * scaleX, 160 * scaleY, 22 * scaleY);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(33, 201, 255, 0.4)';
      ctx.lineWidth = 5 * scaleY;
      drawRoundedRect(ctx, 112 * scaleX, 150 * scaleY, 206 * scaleX, 140 * scaleY, 20 * scaleY);
      ctx.stroke();
      ctx.restore();

      if (!img) {
        ctx.save();
        ctx.translate(216 * scaleX, 224 * scaleY);
        ctx.rotate(-0.18);
        ctx.fillStyle = '#19387a';
        drawRoundedRect(ctx, -68 * scaleX, -54 * scaleY, 136 * scaleX, 108 * scaleY, 10 * scaleY);
        ctx.fill();
        ctx.fillStyle = '#16d2ff';
        drawRoundedRect(ctx, -36 * scaleX, -36 * scaleY, 72 * scaleX, 72 * scaleY, 8 * scaleY);
        ctx.fill();
        ctx.restore();
      } else {
        drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, imageLayout.w, imageLayout.h, scalePerc, scaleX, scaleY);
      }

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 12 * scaleY;
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      drawRoundedRect(ctx, 405 * scaleX, 110 * scaleY, 292 * scaleX, 245 * scaleY, 12 * scaleY);
      ctx.fill();
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.92)';
      ctx.lineWidth = 1.2 * scaleY;
      ctx.stroke();
      ctx.restore();

      drawTextFieldById(ctx, tplId, 'cardTitle', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'cardBody', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'storageTitle', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'storageBody', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'footer', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'bottomLeft', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'bottomRight', scaleX, scaleY, scaleText);
    } else if (tplId === 'panel_touch') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#365fa7';
      ctx.fillRect(0, 258 * scaleY, width, 142 * scaleY);
      ctx.fillStyle = 'rgba(255,255,255,0.36)';
      ctx.fillRect(0, 257 * scaleY, width, 2 * scaleY);

      drawVerticalWordmark(ctx, 'PANEL', 25, 240, 92, 0.05, scaleX, scaleY);

      drawPanelMetricIcon(ctx, 'screen', 145, 34, scaleX, scaleY);
      drawPanelMetricIcon(ctx, 'touch', 375, 34, scaleX, scaleY);
      drawPanelMetricIcon(ctx, 'ip', 610, 26, scaleX, scaleY);

      drawTextFieldById(ctx, tplId, 'metric1Value', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'metric1Label', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'metric2Value', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'metric2Label', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'metric3Value', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'metric3Label', scaleX, scaleY, scaleText);

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
      ctx.beginPath();
      ctx.ellipse(375 * scaleX, 286 * scaleY, 150 * scaleX, 16 * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (!img) {
        const frameX = imagePositions[tplId].x;
        const frameY = imagePositions[tplId].y;
        const frameW = imageLayout.w;
        const frameH = imageLayout.h;
        ctx.save();
        ctx.fillStyle = '#f8fafc';
        drawRoundedRect(ctx, frameX * scaleX, frameY * scaleY, frameW * scaleX, frameH * scaleY, 10 * scaleY);
        ctx.fill();
        ctx.fillStyle = '#1f1f28';
        drawRoundedRect(ctx, (frameX + 8) * scaleX, (frameY + 6) * scaleY, (frameW - 16) * scaleX, (frameH - 12) * scaleY, 8 * scaleY);
        ctx.fill();
        drawTechScreenBackdrop(ctx, frameX + 28, frameY + 24, frameW - 56, frameH - 48, scaleX, scaleY);
        ctx.restore();
      } else {
        drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, imageLayout.w, imageLayout.h, scalePerc, scaleX, scaleY);
      }

      drawTextFieldById(ctx, tplId, 'bottomLeft', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'bottomCenter', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'bottomRight', scaleX, scaleY, scaleText);
    } else if (tplId === 'panel_expand') {
      if (referenceImage) {
        ctx.drawImage(referenceImage, 0, 0, width, height);
      } else {
        ctx.fillStyle = '#fcfdff';
        ctx.fillRect(0, 0, width, height);
      }

      if (!referenceImage) {
        drawVerticalWordmark(ctx, 'PANEL', 708, 230, 92, 0.05, scaleX, scaleY);
      }

      ctx.save();
      ctx.fillStyle = 'rgba(252, 253, 255, 0.96)';
      ctx.fillRect(160 * scaleX, 14 * scaleY, 440 * scaleX, 82 * scaleY);
      ctx.restore();

      drawTextFieldById(ctx, tplId, 'titleLeft', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'titleRight', scaleX, scaleY, scaleText);

      ctx.save();
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 12 * scaleY;
      const leftPanel = ctx.createLinearGradient(35 * scaleX, 115 * scaleY, 425 * scaleX, 350 * scaleY);
      leftPanel.addColorStop(0, 'rgba(255,255,255,0.96)');
      leftPanel.addColorStop(1, 'rgba(245, 248, 252, 0.98)');
      ctx.fillStyle = leftPanel;
      drawRoundedRect(ctx, 35 * scaleX, 115 * scaleY, 390 * scaleX, 235 * scaleY, 16 * scaleY);
      ctx.fill();
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.lineWidth = 1 * scaleY;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(226,232,240,0.45)';
      ctx.lineWidth = 1 * scaleY;
      ctx.beginPath();
      ctx.moveTo(50 * scaleX, 138 * scaleY);
      ctx.lineTo(220 * scaleX, 138 * scaleY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(50 * scaleX, 342 * scaleY);
      ctx.lineTo(240 * scaleX, 342 * scaleY);
      ctx.stroke();
      ctx.restore();

      drawTextFieldById(ctx, tplId, 'bullet1', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'bullet2', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'bullet3', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'bullet4', scaleX, scaleY, scaleText);
      drawTextFieldById(ctx, tplId, 'bullet5', scaleX, scaleY, scaleText);

      ctx.save();
      const darkCard = ctx.createLinearGradient(430 * scaleX, 115 * scaleY, 705 * scaleX, 355 * scaleY);
      darkCard.addColorStop(0, '#04101d');
      darkCard.addColorStop(1, '#021224');
      ctx.fillStyle = darkCard;
      drawRoundedRect(ctx, 430 * scaleX, 115 * scaleY, 275 * scaleX, 235 * scaleY, 22 * scaleY);
      ctx.fill();
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.18)';
      ctx.lineWidth = 1.2 * scaleY;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
      ctx.lineWidth = 1 * scaleY;
      [
        [430, 332, 492, 250],
        [452, 352, 544, 286],
        [492, 350, 625, 232],
        [435, 230, 588, 165],
        [522, 350, 690, 278],
        [430, 276, 536, 198],
        [560, 350, 706, 320],
      ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1 * scaleX, y1 * scaleY);
        ctx.lineTo(x2 * scaleX, y2 * scaleY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x1 * scaleX, y1 * scaleY, 2.2 * scaleY, 0, Math.PI * 2);
        ctx.arc(x2 * scaleX, y2 * scaleY, 2.2 * scaleY, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      });
      ctx.restore();

      if (!img) {
        const frameX = imagePositions[tplId].x;
        const frameY = imagePositions[tplId].y;
        const frameW = imageLayout.w;
        const frameH = imageLayout.h;
        ctx.save();
        ctx.fillStyle = '#f8fafc';
        drawRoundedRect(ctx, frameX * scaleX, frameY * scaleY, frameW * scaleX, frameH * scaleY, 9 * scaleY);
        ctx.fill();
        ctx.fillStyle = '#0a0b0f';
        drawRoundedRect(ctx, (frameX + 6) * scaleX, (frameY + 4) * scaleY, (frameW - 12) * scaleX, (frameH - 8) * scaleY, 8 * scaleY);
        ctx.fill();
        ctx.fillStyle = '#2a2a31';
        ctx.fillRect((frameX + 18) * scaleX, (frameY + 18) * scaleY, (frameW - 36) * scaleX, (frameH - 36) * scaleY);
        ctx.restore();
      } else {
        drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, imageLayout.w, imageLayout.h, scalePerc, scaleX, scaleY);
      }
    }

    drawCustomTextFields(ctx, tplId, scaleX, scaleY, scaleText);

    // 只有在非导出状态下，才绘制选中/悬停虚线框及手柄
    if (!isExporting) {
      const bounds = getElementBounds(ctx, tplId);
      
      // 1. 绘制悬停框
      if (hoveredElement) {
        const hBound = bounds.find(b => b.type === hoveredElement.type && b.id === hoveredElement.id);
        if (hBound) {
          ctx.save();
          ctx.strokeStyle = 'rgba(79, 70, 229, 0.45)'; // 浅紫色/蓝色
          ctx.lineWidth = 1 * scaleY;
          ctx.setLineDash([4 * scaleY, 3 * scaleY]);
          ctx.strokeRect(hBound.x * scaleX, hBound.y * scaleY, hBound.width * scaleX, hBound.height * scaleY);
          ctx.restore();
        }
      }

      // 2. 绘制选中边框与控制点
      if (selectedElement) {
        const sBound = bounds.find(b => b.type === selectedElement.type && b.id === selectedElement.id);
        if (sBound) {
          ctx.save();
          ctx.strokeStyle = '#4f46e5'; // 经典 Indigo
          ctx.lineWidth = 1.5 * scaleY;
          ctx.strokeRect(sBound.x * scaleX, sBound.y * scaleY, sBound.width * scaleX, sBound.height * scaleY);
          
          // 图片与文本的拉伸手柄
          if (selectedElement.type === 'image') {
            const handleX = (sBound.x + sBound.width) * scaleX;
            const handleY = (sBound.y + sBound.height) * scaleY;
            const handleR = 5 * scaleY;
            
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 1.5 * scaleY;
            
            ctx.beginPath();
            ctx.arc(handleX, handleY, handleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (selectedElement.type === 'text') {
            const handle = getTextResizeHandle(sBound);
            const handleX = handle.x * scaleX;
            const handleY = handle.y * scaleY;
            const handleR = 5 * scaleY;

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 1.5 * scaleY;

            ctx.beginPath();
            ctx.arc(handleX, handleY, handleR, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    }

    if (!isExporting) {
      drawGuideLines(ctx, scaleX, scaleY);
    }

    if (canvasGrid && !isExporting) {
      drawGrid(ctx, scaleX, scaleY, width, height);
    }

    ctx.restore();
  };

  const renderPreview = useEffectEvent(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const superScale = DEFAULT_PREVIEW_SCALE;

    canvas.width = selectedRes.width * superScale;
    canvas.height = selectedRes.height * superScale;

    renderTemplateToCanvas(
      ctx,
      activeTemplate,
      formData,
      productImages[activeTemplate.id],
      imageScales[activeTemplate.id],
      selectedRes.width,
      selectedRes.height,
      superScale
    );
  });

  useEffect(() => {
    renderPreview();
  }, [activeTemplate, formData, productImages, templateReferenceImages, imageScales, canvasGrid, imagePositions, selectedRes, selectedElement, hoveredElement, smartGuides, smartGuidesEnabled]);

  const renderExportBlob = async (tpl) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = selectedRes.width;
    tempCanvas.height = selectedRes.height;
    const tempCtx = tempCanvas.getContext('2d');

    renderTemplateToCanvas(
      tempCtx,
      tpl,
      formData,
      productImages[tpl.id],
      imageScales[tpl.id],
      selectedRes.width,
      selectedRes.height,
      1,
      true
    );

    let lastBlob = null;
    for (const quality of EXPORT_QUALITIES) {
      const blob = await canvasToBlob(tempCanvas, 'image/jpeg', quality);
      lastBlob = blob;
      if (blob.size <= MAX_EXPORT_BYTES) {
        return blob;
      }
    }
    return lastBlob;
  };

  const handleDownloadSingle = async () => {
    if (batchStatus === 'exporting') return;
    setBatchStatus('exporting');
    try {
      const blob = await renderExportBlob(activeTemplate);
      triggerBlobDownload(blob, buildExportFileName(activeTemplate.id));
      setBatchStatus('done');
      setTimeout(() => setBatchStatus(null), 1800);
    } catch (error) {
      console.error(error);
      setBatchStatus(null);
    }
  };

  const handleDownloadAll = async () => {
    setBatchStatus('exporting');
    try {
      for (const tpl of activeTemplates) {
        const blob = await renderExportBlob(tpl);
        triggerBlobDownload(blob, buildExportFileName(tpl.id));
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      setBatchStatus('done');
      setTimeout(() => setBatchStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setBatchStatus(null);
    }
  };

  const alignSelectedElement = (mode) => {
    if (!selectedElement) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const bounds = getElementBounds(ctx, activeTemplate.id);
    const current = getSelectedBound(bounds);
    if (!current) return;

    if (selectedElement.type === 'text') {
      const field = getFieldById(activeTemplate.id, selectedElement.id);
      if (!field) return;
      const size = formData[`${activeTemplate.id}_${field.id}_size`] || field.defaultSize;
      const next = { x: current.x, y: current.y };

      if (mode === 'left') next.x = 0;
      if (mode === 'center') next.x = Math.round((BASE_WIDTH - current.width) / 2);
      if (mode === 'right') next.x = Math.round(BASE_WIDTH - current.width);
      if (mode === 'top') next.y = 0;
      if (mode === 'middle') next.y = Math.round((BASE_HEIGHT - current.height) / 2);
      if (mode === 'bottom') next.y = Math.round(BASE_HEIGHT - current.height);

      updateForm(activeTemplate.id, field.id, 'x', next.x);
      updateForm(activeTemplate.id, field.id, 'y', next.y + size);
      return;
    }

    const next = { x: current.x, y: current.y };
    if (mode === 'left') next.x = 0;
    if (mode === 'center') next.x = Math.round((BASE_WIDTH - current.width) / 2);
    if (mode === 'right') next.x = Math.round(BASE_WIDTH - current.width);
    if (mode === 'top') next.y = 0;
    if (mode === 'middle') next.y = Math.round((BASE_HEIGHT - current.height) / 2);
    if (mode === 'bottom') next.y = Math.round(BASE_HEIGHT - current.height);

    setImagePositions((prev) => ({
      ...prev,
      [activeTemplate.id]: next,
    }));
  };

  const getMouseCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // 映射回 750x400 基准设计分辨率坐标
    const x = ((e.clientX - rect.left) / rect.width) * BASE_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * BASE_HEIGHT;
    
    return { x, y };
  };

  const handleCanvasMouseDown = (e) => {
    if (batchStatus === 'exporting') return;
    e.preventDefault(); // 阻止默认的文本选择与拖动
    const { x, y } = getMouseCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const bounds = getElementBounds(ctx, activeTemplate.id);

    // 1. 检查是否击中了当前选中元素的拉伸手柄
    if (selectedElement && selectedElement.type === 'image') {
      const imgBound = bounds.find(b => b.type === 'image');
      if (imgBound) {
        const handleX = imgBound.x + imgBound.width;
        const handleY = imgBound.y + imgBound.height;
        const dist = Math.hypot(x - handleX, y - handleY);
        if (dist <= 15) {
          setDragStart({
            mouseX: x,
            mouseY: y,
            originalScale: imageScales[activeTemplate.id] || 100,
            originalX: imgBound.x,
            originalY: imgBound.y
          });
          setDragMode('resize');
          setIsDragging(true);
          return;
        }
      }
    } else if (selectedElement && selectedElement.type === 'text') {
      const textBound = bounds.find((b) => b.type === 'text' && b.id === selectedElement.id);
      if (textBound) {
        const handle = getTextResizeHandle(textBound);
        const dist = Math.hypot(x - handle.x, y - handle.y);
        if (dist <= TEXT_RESIZE_HANDLE_RADIUS) {
          const field = getFieldById(activeTemplate.id, selectedElement.id);
          if (!field) return;
          setDragStart({
            mouseX: x,
            mouseY: y,
            originalWidth: getTextBoxWidth(activeTemplate.id, field),
          });
          setDragMode('resize-text');
          setIsDragging(true);
          return;
        }
      }
    }

    // 2. 检查是否击中了文字或图片（文字层优先级高于图片层，方便重叠点击）
    const hit = [...bounds].reverse().find(b => {
      return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
    });

    if (hit) {
      if (hit.type === 'text') {
        const fieldId = hit.id;
        const field = getFieldById(activeTemplate.id, fieldId);
        if (!field) return;
        const currentX = formData[`${activeTemplate.id}_${fieldId}_x`] ?? field.defaultX;
        const currentY = formData[`${activeTemplate.id}_${fieldId}_y`] ?? field.defaultY;
        
        setDragStart({
          mouseX: x,
          mouseY: y,
          originalX: currentX,
          originalY: currentY
        });
        setSelectedElement({ type: 'text', id: fieldId });
        setDragMode('move');
        setIsDragging(true);
        setSmartGuides({ vertical: [], horizontal: [] });
      } else if (hit.type === 'image') {
        const currentPos = imagePositions[activeTemplate.id] || DEFAULT_IMAGE_POSITIONS[activeTemplate.id];
        setDragStart({
          mouseX: x,
          mouseY: y,
          originalX: currentPos.x,
          originalY: currentPos.y
        });
        setSelectedElement({ type: 'image', id: 'product_image' });
        setDragMode('move');
        setIsDragging(true);
        setSmartGuides({ vertical: [], horizontal: [] });
      }
    } else {
      setSelectedElement(null); // 点击空白处取消选中
      setSmartGuides({ vertical: [], horizontal: [] });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (batchStatus === 'exporting') return;
    const { x, y } = getMouseCoords(e);

    // 1. 如果没有拖动，处理 Hover 状态和光标改变
    if (!isDragging) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const bounds = getElementBounds(ctx, activeTemplate.id);
      
      let handleHovered = false;
      if (selectedElement && selectedElement.type === 'image') {
        const imgBound = bounds.find(b => b.type === 'image');
        if (imgBound) {
          const handleX = imgBound.x + imgBound.width;
          const handleY = imgBound.y + imgBound.height;
          const dist = Math.hypot(x - handleX, y - handleY);
          if (dist <= 15) {
            handleHovered = true;
          }
        }
      } else if (selectedElement && selectedElement.type === 'text') {
        const textBound = bounds.find((b) => b.type === 'text' && b.id === selectedElement.id);
        if (textBound) {
          const handle = getTextResizeHandle(textBound);
          const dist = Math.hypot(x - handle.x, y - handle.y);
          if (dist <= TEXT_RESIZE_HANDLE_RADIUS) {
            handleHovered = true;
          }
        }
      }
      
      if (handleHovered) {
        e.target.style.cursor = selectedElement?.type === 'text' ? 'ew-resize' : 'nwse-resize';
        setHoveredElement(null);
        return;
      }

      const hit = [...bounds].reverse().find(b => {
        return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
      });

      if (hit) {
        e.target.style.cursor = 'move';
        setHoveredElement({ type: hit.type, id: hit.id });
      } else {
        e.target.style.cursor = 'default';
        setHoveredElement(null);
      }
      return;
    }

    // 2. 正在进行拖拽或缩放
    if (isDragging && dragStart && dragMode) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const bounds = getElementBounds(ctx, activeTemplate.id);
      const dx = x - dragStart.mouseX;
      const dy = y - dragStart.mouseY;

      if (dragMode === 'move') {
        const selectedBound = getSelectedBound(bounds);
        const proposedRect = selectedBound
          ? {
              x: Math.round(dragStart.originalX + dx),
              y: Math.round(dragStart.originalY + dy),
              width: selectedBound.width,
              height: selectedBound.height,
            }
          : null;
        const snapped = proposedRect
          ? resolveSnappedPosition(bounds, proposedRect)
          : { x: Math.round(dragStart.originalX + dx), y: Math.round(dragStart.originalY + dy), guides: { vertical: [], horizontal: [] } };
        const newX = snapped.x;
        const newY = snapped.y;
        setSmartGuides(snapped.guides);

        if (selectedElement.type === 'text') {
          const fieldId = selectedElement.id;
          updateForm(activeTemplate.id, fieldId, 'x', newX);
          updateForm(activeTemplate.id, fieldId, 'y', newY);
        } else if (selectedElement.type === 'image') {
          setImagePositions(prev => ({
            ...prev,
            [activeTemplate.id]: { x: newX, y: newY }
          }));
        }
      } else if (dragMode === 'resize' && selectedElement.type === 'image') {
        setSmartGuides({ vertical: [], horizontal: [] });
        const baseW = getTemplateImageLayout(activeTemplate.id).w;
        const newW = x - dragStart.originalX;
        // 等比缩放，比例计算为（当前宽度/基准宽度），范围限制为 10% - 300%
        const newScale = Math.min(Math.max(Math.round((newW / baseW) * 100), 10), 300);
        
        setImageScales(prev => ({
          ...prev,
          [activeTemplate.id]: newScale
        }));
      } else if (dragMode === 'resize-text' && selectedElement.type === 'text') {
        setSmartGuides({ vertical: [], horizontal: [] });
        const field = getFieldById(activeTemplate.id, selectedElement.id);
        if (!field) return;
        const nextWidth = Math.max(
          TEXT_BOX_MIN_WIDTH,
          Math.min(TEXT_BOX_MAX_WIDTH, Math.round((dragStart.originalWidth || getTextBoxWidth(activeTemplate.id, field)) + dx))
        );
        updateForm(activeTemplate.id, field.id, 'w', nextWidth);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setDragMode(null);
    setSmartGuides({ vertical: [], horizontal: [] });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setHoveredElement(null);
        setSmartGuides({ vertical: [], horizontal: [] });
        return;
      }

      if (!selectedElement) return;
      
      // Avoid nudging when typing in text inputs or textareas
      if (document.activeElement && (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA'
      )) {
        return;
      }

      let nudgeX = 0;
      let nudgeY = 0;

      if (e.key === 'ArrowUp') {
        nudgeY = -1;
      } else if (e.key === 'ArrowDown') {
        nudgeY = 1;
      } else if (e.key === 'ArrowLeft') {
        nudgeX = -1;
      } else if (e.key === 'ArrowRight') {
        nudgeX = 1;
      } else {
        return;
      }

      // Shift key nudges by 5px, otherwise 1px
      const amount = e.shiftKey ? 5 : 1;
      nudgeX *= amount;
      nudgeY *= amount;

      e.preventDefault();

      if (selectedElement.type === 'text') {
        const fieldId = selectedElement.id;
        const field = activeTemplate.fields.find((item) => item.id === fieldId)
          || (customFieldsByTemplate[activeTemplate.id] || []).find((item) => item.id === fieldId);
        if (!field) return;
        const currentX = formData[`${activeTemplate.id}_${fieldId}_x`] ?? field.defaultX;
        const currentY = formData[`${activeTemplate.id}_${fieldId}_y`] ?? field.defaultY;
        
        updateForm(activeTemplate.id, fieldId, 'x', currentX + nudgeX);
        updateForm(activeTemplate.id, fieldId, 'y', currentY + nudgeY);
      } else if (selectedElement.type === 'image') {
        setImagePositions(prev => {
          const currentPos = prev[activeTemplate.id] || DEFAULT_IMAGE_POSITIONS[activeTemplate.id];
          return {
            ...prev,
            [activeTemplate.id]: {
              x: currentPos.x + nudgeX,
              y: currentPos.y + nudgeY
            }
          };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, formData, activeTemplate, customFieldsByTemplate]);

  const visibleTextFields = getAllTextFields(activeTemplate.id);
  const hiddenBuiltInFields = activeTemplate.fields.filter((field) => isFieldHidden(activeTemplate.id, field.id));

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-900 text-slate-100 font-sans antialiased overflow-hidden">
      
      {/* Settings Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-float">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                Gemini API 配置
              </h3>
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              文案生成能力由 Google Gemini API 提供支持。请在下方输入您的 API Key。此密钥仅保存在您的本地浏览器中，绝不会上传到第三方服务器。
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gemini API 密钥
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-850 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  使用模型
                </label>
                <select
                  value={apiModel}
                  onChange={(e) => setApiModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-850 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (推荐 - 速度快且智能)</option>
                  <option value="gemini-2.5-flash-preview-09-2025">Gemini 2.5 Flash Preview</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (深度推理)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition"
                >
                  取消
                </button>
                <button
                  onClick={() => saveApiSettings(apiKey, apiModel)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-lg text-xs shadow-md shadow-indigo-600/10 transition"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 左侧控制面板 */}
      <div className="w-full lg:w-[420px] bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden shrink-0">
        
        {/* 顶部 Brand Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <div>
            <h1 className="text-base font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Marketing Banner Maker
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">B2B 阿里国际站营销大图生成工具</p>
          </div>
          
          <button 
            onClick={() => setShowApiKeyModal(true)}
            className={`p-2 rounded-lg transition relative border ${apiKey ? 'border-slate-850 hover:bg-slate-800 text-indigo-400' : 'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 animate-pulse'}`}
            title="配置 API 密钥"
          >
            <Settings className="w-4 h-4" />
            {!apiKey && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900"></span>
            )}
          </button>
        </div>

        {/* 滚动面板区 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          
          {/* Section 1: AI Marketing Writer */}
          <div className="bg-slate-850/80 border border-slate-850 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-200">AI B2B 营销文案专家</h2>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              提供 PDF 规格书或产品核心参数，由 AI 自动生成地道 B2B 买家首选文案。
            </p>

            <div className="space-y-3">
              {/* PDF 上传 */}
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 transition focus-within:border-indigo-500/50">
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  步骤 1: 上传产品 PDF 规格书
                </label>
                
                {!pdfName ? (
                  <div className="relative group cursor-pointer border border-dashed border-slate-700/60 hover:border-slate-600 rounded-lg py-3 text-center transition">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handlePdfUpload}
                      onClick={(e) => { e.target.value = null; }} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-5 h-5 mx-auto text-slate-500 group-hover:text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400">选择或拖拽 PDF</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-[10px] bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20 font-mono">
                    <span className="truncate max-w-[240px]">✓ {pdfName}</span>
                    <button 
                      onClick={() => { setPdfBase64(null); setPdfName(""); }} 
                      className="text-rose-400 hover:text-rose-300 font-bold underline ml-2 shrink-0"
                    >
                      清除
                    </button>
                  </div>
                )}
              </div>

              {/* 备用文字参数 */}
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  步骤 2 (可选): 补充或粘贴文字参数
                </label>
                <textarea
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  placeholder="Intel J3455, 8GB RAM, 4x COM, 2x LAN..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-600"
                  rows={2}
                />
              </div>

              {/* 生成按钮 */}
              <button 
                onClick={handleAIGenerate}
                disabled={aiLoading}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                  aiLoading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/30' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-550 shadow-indigo-600/10 hover:shadow-indigo-600/20'
                }`}
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    AI 正在分析文案中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    生成当前【{activeTemplate.name.split('：')[0]}】文案
                  </>
                )}
              </button>
              
              {aiError && (
                <div className="text-[10px] text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 leading-normal flex gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Edit Templates */}
          <div>
            <div className="flex items-start gap-2 mb-3">
              <Layout className="w-4.5 h-4.5 text-blue-400 mt-0.5" />
              <div>
                <label className="text-xs font-bold text-slate-300">1. 切换模板组与版式 ({activeTemplates.length} 张)</label>
                <p className="text-[10px] text-slate-500 mt-1">{activeTemplateSet.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              {TEMPLATE_GROUPS.map((group) => {
                const isGroupActive = activeTemplateSetId === group.id;

                return (
                  <button
                    key={group.id}
                    onClick={() => handleSelectTemplateSet(group)}
                    className={`px-3 py-2 rounded-xl border text-left transition ${
                      isGroupActive
                        ? 'border-cyan-400/40 bg-cyan-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">{group.name}</div>
                    <div className="text-[9px] text-slate-500 mt-1">{group.templates.length} 张模板</div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {activeTemplates.map(tpl => {
                const isActive = activeTemplate.id === tpl.id;
                const hasImage = !!productImages[tpl.id];
                
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`group w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 ${
                      isActive 
                        ? 'border-indigo-500 bg-indigo-500/5 text-white shadow-md' 
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-750 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* 彩色渐变块预览 layout */}
                      <div className={`w-8 h-6 rounded-md bg-gradient-to-br ${tpl.themeColor} shrink-0 opacity-80 border border-slate-700/30 flex items-center justify-center`}>
                        <div className="w-3 h-3 rounded bg-white/20"></div>
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs block font-bold truncate ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                          {tpl.name}
                        </span>
                        <span className="text-[9px] text-slate-500 truncate block mt-0.5">{tpl.description}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasImage && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-semibold">已配图</span>
                      )}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0.5 text-indigo-400' : 'text-slate-600'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-850/40 border border-slate-850">
            <div className="flex items-center justify-between gap-3 mb-2">
              <label className="text-xs font-bold text-slate-300">导出产品名</label>
              <span className="text-[10px] text-slate-500">导出格式: `产品名-序号.jpg`</span>
            </div>
            <input
              type="text"
              value={exportProductName}
              onChange={(e) => setExportProductName(e.target.value)}
              placeholder={`例如 ${activeTemplateSet.exportPlaceholder}`}
              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 placeholder-slate-600"
            />
            <p className="text-[10px] text-slate-500 mt-2">
              当前页会导出为 <span className="text-slate-300 font-mono">{buildExportFileName(activeTemplate.id)}</span>
            </p>
          </div>

          {/* Section 3: Upload Product Image */}
          <div 
            onClick={() => setSelectedElement({ type: 'image', id: 'product_image' })}
            className={`p-4 rounded-2xl transition-all duration-300 border ${
              selectedElement?.type === 'image' 
                ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_12px_rgba(79,70,229,0.15)]' 
                : 'bg-slate-850/40 border-slate-850 hover:border-slate-750'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-400" />
                2. 上传【当前版式】产品图
              </label>
              {productImages[activeTemplate.id] && (
                <button
                  onClick={() => setProductImages(prev => {
                    const next = { ...prev };
                    delete next[activeTemplate.id];
                    return next;
                  })}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                  title="删除图片"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative group cursor-pointer border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/60 rounded-xl py-4 text-center transition">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, activeTemplate.id)}
                onClick={(e) => { e.target.value = null; }} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-5 h-5 text-slate-500 group-hover:text-slate-400 mb-1" />
                <span className="text-[10px] text-slate-400 group-hover:text-slate-300">
                  {productImages[activeTemplate.id] ? '更改产品配图' : '选择产品 PNG 格式原图'}
                </span>
                <span className="text-[9px] text-slate-600 mt-0.5">支持透明背景免抠图片</span>
              </div>
            </div>

            {/* Scale & Position controls */}
            {productImages[activeTemplate.id] && (
              <div className="space-y-3 mt-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">缩放:</span>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    value={imageScales[activeTemplate.id]}
                    onChange={(e) => setImageScales(prev => ({ ...prev, [activeTemplate.id]: Number(e.target.value) }))}
                    onFocus={() => setSelectedElement({ type: 'image', id: 'product_image' })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{imageScales[activeTemplate.id]}%</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900/40">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">图片 X:</span>
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={() => setImagePositions(prev => ({
                          ...prev,
                          [activeTemplate.id]: { ...prev[activeTemplate.id], x: prev[activeTemplate.id].x - 5 }
                        }))} 
                        className="p-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded"
                        title="向左移动 5px"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <input 
                        type="number" 
                        value={imagePositions[activeTemplate.id]?.x ?? DEFAULT_IMAGE_POSITIONS[activeTemplate.id].x} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setImagePositions(prev => ({
                            ...prev,
                            [activeTemplate.id]: { ...prev[activeTemplate.id], x: val }
                          }));
                        }}
                        onFocus={() => setSelectedElement({ type: 'image', id: 'product_image' })}
                        className="w-9 text-center bg-slate-900 text-[10px] text-slate-200 border border-slate-850 py-0.5 rounded font-mono"
                      />
                      <button 
                        onClick={() => setImagePositions(prev => ({
                          ...prev,
                          [activeTemplate.id]: { ...prev[activeTemplate.id], x: prev[activeTemplate.id].x + 5 }
                        }))} 
                        className="p-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded"
                        title="向右移动 5px"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">图片 Y:</span>
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={() => setImagePositions(prev => ({
                          ...prev,
                          [activeTemplate.id]: { ...prev[activeTemplate.id], y: prev[activeTemplate.id].y - 5 }
                        }))} 
                        className="p-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded"
                        title="向上移动 5px"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <input 
                        type="number" 
                        value={imagePositions[activeTemplate.id]?.y ?? DEFAULT_IMAGE_POSITIONS[activeTemplate.id].y} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setImagePositions(prev => ({
                            ...prev,
                            [activeTemplate.id]: { ...prev[activeTemplate.id], y: val }
                          }));
                        }}
                        onFocus={() => setSelectedElement({ type: 'image', id: 'product_image' })}
                        className="w-9 text-center bg-slate-900 text-[10px] text-slate-200 border border-slate-850 py-0.5 rounded font-mono"
                      />
                      <button 
                        onClick={() => setImagePositions(prev => ({
                          ...prev,
                          [activeTemplate.id]: { ...prev[activeTemplate.id], y: prev[activeTemplate.id].y + 5 }
                        }))} 
                        className="p-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded"
                        title="向下移动 5px"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Typography and Position editing */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Type className="w-4.5 h-4.5 text-blue-400" />
                3. 文本框编辑与版式微调
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addTextBox(activeTemplate.id)}
                  className="text-[10px] text-emerald-300 hover:text-emerald-200 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/15 transition"
                >
                  <Plus className="w-3 h-3" />
                  新增文本框
                </button>
                <button 
                  onClick={() => resetTemplateDefaults(activeTemplate.id)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 hover:bg-indigo-500/10 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  重置当前页
                </button>
              </div>
            </div>

            {hiddenBuiltInFields.length > 0 && (
              <div className="mb-3 p-2 rounded-xl border border-slate-800 bg-slate-900/50">
                <div className="text-[10px] text-slate-500 font-semibold uppercase mb-2">已隐藏的内置文本框</div>
                <div className="flex flex-wrap gap-2">
                  {hiddenBuiltInFields.map((field) => (
                    <button
                      key={field.id}
                      onClick={() => restoreField(activeTemplate.id, field.id)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      恢复 {field.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {visibleTextFields.map(field => {
                const val = formData[`${activeTemplate.id}_${field.id}`] || '';
                const size = formData[`${activeTemplate.id}_${field.id}_size`] || field.defaultSize;
                const lh = formData[`${activeTemplate.id}_${field.id}_lh`] || field.defaultLh;
                const posX = formData[`${activeTemplate.id}_${field.id}_x`] ?? field.defaultX;
                const posY = formData[`${activeTemplate.id}_${field.id}_y`] ?? field.defaultY;
                const artStyle = formData[`${activeTemplate.id}_${field.id}_style`] || field.defaultStyle || 'black';
                const boxWidth = getTextBoxWidth(activeTemplate.id, field);
                const textAlign = getTextAlign(activeTemplate.id, field);
                
                return (
                  <div 
                    key={field.id} 
                    onClick={() => setSelectedElement({ type: 'text', id: field.id })}
                    className={`p-3 rounded-xl transition duration-150 border ${
                      selectedElement?.type === 'text' && selectedElement?.id === field.id
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_12px_rgba(79,70,229,0.15)] animate-pulse-subtle'
                        : 'bg-slate-850/50 border-slate-850 hover:border-slate-750'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold text-slate-300">{field.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-slate-500">#{field.id}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTextBox(activeTemplate.id, field.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                          title={field.isCustom ? '删除文本框' : '隐藏文本框'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {field.isMultiline ? (
                      <textarea
                        value={val}
                        onChange={(e) => updateForm(activeTemplate.id, field.id, 'value', e.target.value)}
                        onFocus={() => setSelectedElement({ type: 'text', id: field.id })}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-sans text-slate-200 placeholder-slate-700 mb-2"
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateForm(activeTemplate.id, field.id, 'value', e.target.value)}
                        onFocus={() => setSelectedElement({ type: 'text', id: field.id })}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 placeholder-slate-700 mb-2"
                      />
                    )}

                    <div className="mb-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-semibold uppercase mb-1">文字风格</label>
                          <select
                            value={artStyle}
                            onChange={(e) => updateForm(activeTemplate.id, field.id, 'style', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            {Object.entries(ART_TEXT_PRESETS).map(([presetKey, preset]) => (
                              <option key={presetKey} value={presetKey}>{preset.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-semibold uppercase mb-1">框内对齐</label>
                          <select
                            value={textAlign}
                            onChange={(e) => updateForm(activeTemplate.id, field.id, 'align', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="left">左对齐</option>
                            <option value="center">居中</option>
                            <option value="right">右对齐</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Sizing & Positioning */}
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-900/40">
                      
                      {/* FontSize & LineHeight */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] text-slate-500 font-semibold uppercase">字号:</span>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => updateForm(activeTemplate.id, field.id, 'size', Math.max(8, Number(size) - 2))} className="p-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><Minus className="w-2.5 h-2.5" /></button>
                            <input 
                              type="number" 
                              value={size} 
                              onChange={(e) => updateForm(activeTemplate.id, field.id, 'size', Number(e.target.value))}
                              className="w-9 text-center bg-slate-900 text-[10px] text-slate-200 border border-slate-800 py-0.5 rounded"
                            />
                            <button onClick={() => updateForm(activeTemplate.id, field.id, 'size', Number(size) + 2)} className="p-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><Plus className="w-2.5 h-2.5" /></button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] text-slate-500 font-semibold uppercase">行距:</span>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => updateForm(activeTemplate.id, field.id, 'lh', Math.max(4, Number(lh) - 2))} className="p-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><Minus className="w-2.5 h-2.5" /></button>
                            <input 
                              type="number" 
                              value={lh} 
                              onChange={(e) => updateForm(activeTemplate.id, field.id, 'lh', Number(e.target.value))}
                              className="w-9 text-center bg-slate-900 text-[10px] text-slate-200 border border-slate-800 py-0.5 rounded"
                            />
                            <button onClick={() => updateForm(activeTemplate.id, field.id, 'lh', Number(lh) + 2)} className="p-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><Plus className="w-2.5 h-2.5" /></button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] text-slate-500 font-semibold uppercase">框宽:</span>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => updateForm(activeTemplate.id, field.id, 'w', Math.max(TEXT_BOX_MIN_WIDTH, Number(boxWidth) - 10))} className="p-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><Minus className="w-2.5 h-2.5" /></button>
                            <input 
                              type="number" 
                              value={boxWidth}
                              onChange={(e) => updateForm(activeTemplate.id, field.id, 'w', Math.max(TEXT_BOX_MIN_WIDTH, Math.min(TEXT_BOX_MAX_WIDTH, Number(e.target.value) || TEXT_BOX_MIN_WIDTH)))}
                              className="w-12 text-center bg-slate-900 text-[10px] text-slate-200 border border-slate-800 py-0.5 rounded"
                            />
                            <button onClick={() => updateForm(activeTemplate.id, field.id, 'w', Math.min(TEXT_BOX_MAX_WIDTH, Number(boxWidth) + 10))} className="p-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"><Plus className="w-2.5 h-2.5" /></button>
                          </div>
                        </div>
                      </div>

                      {/* X & Y position buttons */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] text-indigo-400/80 font-bold uppercase">X位置:</span>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => nudgeField(activeTemplate.id, field.id, 'x', -5)} className="p-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded" title="向左移动 5px"><Minus className="w-2.5 h-2.5" /></button>
                            <input 
                              type="number" 
                              value={posX} 
                              onChange={(e) => updateForm(activeTemplate.id, field.id, 'x', Number(e.target.value))}
                              className="w-9 text-center bg-slate-900 text-[10px] text-slate-200 border border-slate-850 py-0.5 rounded font-mono"
                            />
                            <button onClick={() => nudgeField(activeTemplate.id, field.id, 'x', 5)} className="p-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded" title="向右移动 5px"><Plus className="w-2.5 h-2.5" /></button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] text-indigo-400/80 font-bold uppercase">Y位置:</span>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => nudgeField(activeTemplate.id, field.id, 'y', -5)} className="p-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded" title="向上移动 5px"><Minus className="w-2.5 h-2.5" /></button>
                            <input 
                              type="number" 
                              value={posY} 
                              onChange={(e) => updateForm(activeTemplate.id, field.id, 'y', Number(e.target.value))}
                              className="w-9 text-center bg-slate-900 text-[10px] text-slate-200 border border-slate-850 py-0.5 rounded font-mono"
                            />
                            <button onClick={() => nudgeField(activeTemplate.id, field.id, 'y', 5)} className="p-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded" title="向下移动 5px"><Plus className="w-2.5 h-2.5" /></button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 底部动作区域 */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 space-y-2">
          <button 
            onClick={handleDownloadSingle}
            className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700/60"
          >
            <Download className="w-3.5 h-3.5" />
            导出当前图 ({buildExportFileName(activeTemplate.id)})
          </button>
          
          <button 
            onClick={handleDownloadAll}
            disabled={batchStatus === 'exporting'}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg ${
              batchStatus === 'exporting' 
                ? 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800' 
                : 'bg-indigo-600 hover:bg-indigo-550 text-white shadow-indigo-600/10'
            }`}
          >
            {batchStatus === 'exporting' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                正在顺序生成及打包中 (约需几秒)...
              </>
            ) : batchStatus === 'done' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                ✓ 一键打包全部导出成功！
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                一键导出全部 {activeTemplates.length} 张 JPG
              </>
            )}
          </button>
        </div>

      </div>

      {/* 右侧实时预览区 */}
      <div className="flex-1 bg-slate-950 p-6 lg:p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar relative">
        
        {/* Header Preview bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-4 py-1.5 rounded-full shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse-ring"></span>
            <span className="text-xs font-semibold text-slate-400">
              当前视图: <span className="text-slate-200">{activeTemplate.name}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono pl-2 border-l border-slate-800">{selectedRes.width} x {selectedRes.height} PX</span>
          </div>

          {/* Resolution Tabs & Grid Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto sm:justify-end">
            <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-xl shrink-0">
              {RESOLUTIONS.map(res => (
                <button
                  key={res.id}
                  onClick={() => setSelectedRes(res)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all duration-200 ${
                    selectedRes.id === res.id 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {res.id === '750x400' ? '原版 750×400' : res.id === '1920x820' ? '宽屏 1920×820' : '方形 1000×1000'}
                </button>
              ))}
            </div>

            <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-xl shrink-0">
              {[
                ['left', '左'],
                ['center', '中'],
                ['right', '右'],
                ['top', '上'],
                ['middle', '中高'],
                ['bottom', '下'],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => alignSelectedElement(mode)}
                  disabled={!selectedElement}
                  className={`text-[10px] px-2 py-1 rounded-lg font-bold transition ${
                    selectedElement ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 cursor-not-allowed'
                  }`}
                  title={`对齐${label}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCanvasGrid(!canvasGrid)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 ${
                canvasGrid 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {canvasGrid ? '关闭网格线' : '显示定位网格'}
            </button>

            <button
              onClick={() => setSmartGuidesEnabled(!smartGuidesEnabled)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition ${
                smartGuidesEnabled
                  ? 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                  : 'bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-400'
              }`}
            >
              {smartGuidesEnabled ? '智能参考线已开' : '开启智能参考线'}
            </button>
          </div>
        </div>

        {/* Canvas Area with high premium box shadows */}
        <div className="flex-1 flex items-center justify-center py-4">
          <div 
            className="relative p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl transition-all duration-300 max-w-full flex flex-col items-center"
            style={{ 
              width: '100%', 
              maxWidth: selectedRes.id === '750x400' ? '780px' : selectedRes.id === '1000x1000' ? '540px' : '980px'
            }}
          >
            
            {/* Canvas Outer Screen mockup */}
            <div className="w-full h-6 bg-slate-850 rounded-t-lg flex items-center px-4 gap-1.5 pointer-events-none border-b border-slate-900">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[8px] text-slate-500 font-mono ml-2">yantronic_marketing_builder_canvas.png</span>
            </div>
            
            <div 
              className="w-full border border-slate-850 rounded-b-lg overflow-hidden bg-slate-950 flex items-center justify-center transition-all duration-300"
              style={{ 
                aspectRatio: `${selectedRes.width} / ${selectedRes.height}`,
                maxHeight: '60vh'
              }}
            >
              <canvas 
                ref={canvasRef} 
                className="block shadow-inner w-full h-full object-contain"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              ></canvas>
            </div>
          </div>
        </div>

        {/* Helper instructions footer */}
        <div className="mt-6 glass-panel border border-slate-800/40 p-4 rounded-xl max-w-2xl mx-auto flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <h4 className="font-bold text-slate-200 mb-1">💡 快捷排版指南与尺寸自适应</h4>
            <p>
              1. 每一个编辑版式的产品图均是<strong className="text-white">独立配置</strong>的。您可以切换左侧菜单依次上传各个页面的图片。
            </p>
            <p className="mt-1">
              2. 文字和图片拖拽时会优先吸附画布中心线、边缘线以及其他元素边缘线，配合上方对齐按钮能更快排整齐。
            </p>
            <p className="mt-1">
              3. 导出统一为 JPG，并自动压缩到单张 5MB 以内。文件名按“产品名-序号”生成，例如 `TPM7000-1.jpg`。
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
