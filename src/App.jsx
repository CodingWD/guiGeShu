import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Settings, 
  Download, 
  Layout, 
  Upload, 
  FileText, 
  Move, 
  Type, 
  Plus, 
  Minus, 
  Check, 
  X, 
  RefreshCw, 
  Eye, 
  Info,
  Maximize2,
  Trash2,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';

// 750x400 像素级预设模板配置
const TEMPLATES = [
  {
    id: 'cover',
    name: '图1：封面概览 (对应 07.jpg)',
    themeColor: 'from-blue-600 to-indigo-400',
    description: '科技感渐变背景，适合作为首图突出产品型号与品类',
    fields: [
      { id: 'title', label: '主标题 (大黑体)', default: 'E200 Series', defaultSize: 46, defaultLh: 50, isBold: true, color: '#000000', defaultX: 390, defaultY: 200 },
      { id: 'subtitle', label: '副标题', default: 'Embedded Mini Size IPC', defaultSize: 24, defaultLh: 30, isBold: false, color: '#000000', defaultX: 330, defaultY: 270 }
    ]
  },
  {
    id: 'performance',
    name: '图2：性能展示 (对应 08.jpg)',
    themeColor: 'from-sky-200 to-blue-300',
    description: '突出强大的CPU计算核心与内存插槽特性',
    fields: [
      { id: 'title', label: '主标题', default: 'Powerful', defaultSize: 46, defaultLh: 50, isBold: true, color: '#000000', defaultX: 110, defaultY: 80 },
      { id: 'subtitle', label: '蓝字副标题', default: 'Based on Intel Processor Platform', defaultSize: 20, defaultLh: 28, isBold: false, color: '#4a9af8', defaultX: 60, defaultY: 140 },
      { id: 'desc', label: '段落描述 (按回车换行)', default: 'Intel® Pentium® J4205/Celeron® J3455 processor,\n\nBased on powerful data processing and computing\ncapabilities, it has excellent performance in embedded\napplications.', isMultiline: true, defaultSize: 13, defaultLh: 22, isBold: false, color: '#222222', defaultX: 60, defaultY: 190 },
      { id: 'bullet1', label: '特性 1', default: '· LPDDR4 memory socket', defaultSize: 16, defaultLh: 24, isBold: true, color: '#000000', defaultX: 50, defaultY: 300 },
      { id: 'bullet2', label: '特性 2', default: '· Max. 8GB memory capacity', defaultSize: 16, defaultLh: 24, isBold: true, color: '#000000', defaultX: 50, defaultY: 340 }
    ]
  },
  {
    id: 'interfaces',
    name: '图3：丰富接口 (对应 09.jpg)',
    themeColor: 'from-blue-50 to-sky-200',
    description: '丰富接口展示版式，产品图自带标注',
    fields: [
      { id: 'title', label: '主标题', default: 'Rich Interfaces', defaultSize: 46, defaultLh: 50, isBold: true, color: '#000000', defaultX: 400, defaultY: 90 },
      { id: 'subtitle', label: '蓝字副标题', default: 'Meet different application needs', defaultSize: 22, defaultLh: 30, isBold: false, color: '#4a9af8', defaultX: 400, defaultY: 140 },
      { id: 'desc', label: '段落描述 (按回车换行)', default: 'The front panel includes 1 HDMI, resolution up to\n3840 x 2160@30Hz, 2 Gigabit Ethernet interfaces\ncontrolled by independent chips. 4 serial ports,\n4 USB interfaces. Besides, 2 CAN are optional.', isMultiline: true, defaultSize: 13, defaultLh: 22, isBold: false, color: '#444444', defaultX: 400, defaultY: 190 }
    ]
  },
  {
    id: 'rugged',
    name: '图4：坚固紧凑 (对应 10.jpg)',
    themeColor: 'from-slate-100 to-indigo-100',
    description: '工业感深色图片框与尺寸标注信息卡片',
    fields: [
      { id: 'title', label: '主标题', default: 'Rugged and Compact', defaultSize: 40, defaultLh: 46, isBold: true, color: '#000000', defaultX: 35, defaultY: 80 },
      { id: 'subtitle', label: '蓝字副标题', default: 'Stable in industrial environment', defaultSize: 18, defaultLh: 26, isBold: false, color: '#2493ff', defaultX: 35, defaultY: 125 },
      { id: 'desc', label: '段落描述 (按回车换行)', default: 'The shell of E200 adopts reinforced aluminum\nalloy gold.Tested to industry-grade standards,\nit has stronger resistance to corrosion,anti-rust.\nanti-interference ability in harsh industrial envir\n-onment. Modular and compact design structure.', isMultiline: true, defaultSize: 13, defaultLh: 20, isBold: false, color: '#4c5561', defaultX: 35, defaultY: 170 },
      { id: 'sizeOverall', label: '整机尺寸', default: '172 x 125 x 62.5mm', defaultSize: 24, defaultLh: 30, isBold: true, color: '#000000', defaultX: 50, defaultY: 315 },
      { id: 'sizeBoard', label: '主板尺寸', default: '146 x 102mm', defaultSize: 18, defaultLh: 24, isBold: true, color: '#000000', defaultX: 50, defaultY: 350 }
    ]
  }
];

// 初始化全量表单数据
const initData = () => {
  const data = {};
  TEMPLATES.forEach(tpl => {
    tpl.fields.forEach(f => {
      data[`${tpl.id}_${f.id}`] = f.default;
      data[`${tpl.id}_${f.id}_size`] = f.defaultSize;
      data[`${tpl.id}_${f.id}_lh`] = f.defaultLh;
      data[`${tpl.id}_${f.id}_x`] = f.defaultX;
      data[`${tpl.id}_${f.id}_y`] = f.defaultY;
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

const DEFAULT_IMAGE_POSITIONS = {
  cover: { x: 40, y: 90 },
  performance: { x: 380, y: 110 },
  interfaces: { x: 50, y: 120 },
  rugged: { x: 370, y: 100 }
};

export default function App() {
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0]);
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[0]);
  const [formData, setFormData] = useState(initData());
  const [productImages, setProductImages] = useState({}); 
  const [imageScales, setImageScales] = useState({ cover: 100, performance: 100, interfaces: 100, rugged: 100 }); 
  const [imagePositions, setImagePositions] = useState({ ...DEFAULT_IMAGE_POSITIONS });
  
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

  // 保存配置
  const saveApiSettings = (key, model) => {
    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gemini_api_model', model);
    setApiKey(key);
    setApiModel(model);
    setShowApiKeyModal(false);
  };

  // 恢复特定模板默认值
  const resetTemplateDefaults = (tplId) => {
    const tpl = TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;
    setFormData(prev => {
      const updated = { ...prev };
      tpl.fields.forEach(f => {
        updated[`${tplId}_${f.id}`] = f.default;
        updated[`${tplId}_${f.id}_size`] = f.defaultSize;
        updated[`${tplId}_${f.id}_lh`] = f.defaultLh;
        updated[`${tplId}_${f.id}_x`] = f.defaultX;
        updated[`${tplId}_${f.id}_y`] = f.defaultY;
      });
      return updated;
    });
    setImagePositions(prev => ({
      ...prev,
      [tplId]: { ...DEFAULT_IMAGE_POSITIONS[tplId] }
    }));
    setImageScales(prev => ({
      ...prev,
      [tplId]: 100
    }));
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
        schemaProps[f.id] = { type: "STRING", description: f.label };
      });

      const systemInstruction = "你是阿里国际站 (Alibaba.com) 的资深 B2B 英文营销文案专家。擅长提炼工业级产品（如工控机）的核心卖点。请根据提供的资料，使用专业、简洁、极具吸引力的全英文生成营销海报文案。请关注耐用性 (Durability)、高性能 (High Performance)、接口丰富度 (Rich Interfaces) 等 B2B 买家核心诉求。";
      
      const promptText = `请根据我提供的产品说明书PDF（如果有上传），以及以下补充的文字说明（如果有填写），为当前的营销海报【${activeTemplate.name}】自动编写全英文文案。如果没有提供任何信息，请根据海报主题自动编造一套标准工业计算机的高质量默认文案。请严格返回 JSON 格式，并映射到要求的字段中。注意文案断句时可以使用 \\n 进行换行。\n\n补充产品参数说明：${aiInputText}`;

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
    const currentValue = formData[key] ?? TEMPLATES.find(t=>t.id===tplId).fields.find(f=>f.id===fieldId)[`default${prop.toUpperCase()}`];
    updateForm(tplId, fieldId, prop, Number(currentValue) + amount);
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

    const finalX = scaledX + (scaledW - finalW) / 2;
    const finalY = scaledY + (scaledH - finalH) / 2;

    ctx.drawImage(img, finalX, finalY, finalW, finalH);
  };

  const drawExactText = (ctx, tplId, field, scaleX = 1, scaleY = 1, scaleText = 1) => {
    if (!field) return;
    const text = formData[`${tplId}_${field.id}`] || '';
    const size = formData[`${tplId}_${field.id}_size`] || field.defaultSize;
    const lh = formData[`${tplId}_${field.id}_lh`] || field.defaultLh;
    const x = formData[`${tplId}_${field.id}_x`] ?? field.defaultX;
    const y = formData[`${tplId}_${field.id}_y`] ?? field.defaultY;
    
    const scaledSize = Math.round(size * scaleText);
    const scaledLh = Math.round(lh * scaleText);
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    ctx.fillStyle = field.color;
    ctx.font = `${field.isBold ? 'bold ' : ''}${scaledSize}px "Segoe UI", "Microsoft YaHei", sans-serif`;
    
    const lines = text.split('\\n').join('\n').split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, scaledX, scaledY + (index * scaledLh));
    });
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

  const renderTemplateToCanvas = (ctx, tpl, data, img, scalePerc, width = 750, height = 400, superScale = 2) => {
    const tplId = tpl.id;
    const scaleX = width / 750;
    const scaleY = height / 400;
    const scaleText = scaleY;

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

      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='title'), scaleX, scaleY, scaleText);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='subtitle'), scaleX, scaleY, scaleText);

      drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, 300, 220, scalePerc, scaleX, scaleY);

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

      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='title'), scaleX, scaleY, scaleText);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='subtitle'), scaleX, scaleY, scaleText);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='desc'), scaleX, scaleY, scaleText);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='bullet1'), scaleX, scaleY, scaleText);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='bullet2'), scaleX, scaleY, scaleText);

      drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, 330, 210, scalePerc, scaleX, scaleY);

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

      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='title'), scaleX, scaleY, scaleText);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='subtitle'), scaleX, scaleY, scaleText);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='desc'), scaleX, scaleY, scaleText);

      drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, 280, 180, scalePerc, scaleX, scaleY);

    } else if (tplId === 'rugged') {
      const leftBg = ctx.createLinearGradient(0, 0, 400 * scaleX, 400 * scaleY);
      leftBg.addColorStop(0, '#f4f8fc'); leftBg.addColorStop(1, '#e3edf8');
      ctx.fillStyle = leftBg;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#101114';
      ctx.fillRect(330 * scaleX, 55 * scaleY, 420 * scaleX, 290 * scaleY);

      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='title'), scaleX, scaleY, scaleText);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='subtitle'), scaleX, scaleY, scaleText);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='desc'), scaleX, scaleY, scaleText);

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

      const size1_x = formData[`${tplId}_sizeOverall_x`] ?? tpl.fields.find(f=>f.id==='sizeOverall').defaultX;
      const size1_y = formData[`${tplId}_sizeOverall_y`] ?? tpl.fields.find(f=>f.id==='sizeOverall').defaultY;
      ctx.fillStyle = '#7a8599'; 
      ctx.font = `${Math.round(12 * scaleText)}px Arial`;
      ctx.fillText('Overall size', size1_x * scaleX, (size1_y - 25) * scaleY);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='sizeOverall'), scaleX, scaleY, scaleText);
      
      const size2_x = formData[`${tplId}_sizeBoard_x`] ?? tpl.fields.find(f=>f.id==='sizeBoard').defaultX;
      const size2_y = formData[`${tplId}_sizeBoard_y`] ?? tpl.fields.find(f=>f.id==='sizeBoard').defaultY;
      ctx.fillStyle = '#7a8599'; 
      ctx.font = `${Math.round(12 * scaleText)}px Arial`;
      ctx.fillText('Motherboard size', size2_x * scaleX, (size2_y - 15) * scaleY);
      drawExactText(ctx, tplId, tpl.fields.find(f=>f.id==='sizeBoard'), scaleX, scaleY, scaleText);

      ctx.fillStyle = '#000000'; 
      ctx.font = `bold ${Math.round(36 * scaleText)}px Arial`;
      ctx.fillText('CE  FC', 220 * scaleX, 335 * scaleY);

      drawImageAspect(ctx, img, imagePositions[tplId].x, imagePositions[tplId].y, 310, 200, scalePerc, scaleX, scaleY);
      
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      for(let i=0; i<30; i++) {
        ctx.beginPath();
        ctx.arc((600 + Math.random()*150) * scaleX, (200 + Math.random()*140) * scaleY, Math.random()*1.5 * scaleY, 0, Math.PI*2);
        ctx.fill();
      }
    }

    if (canvasGrid) {
      drawGrid(ctx, scaleX, scaleY, width, height);
    }

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const superScale = 2; // 2 倍超清超采样
    canvas.width = selectedRes.width * superScale;
    canvas.height = selectedRes.height * superScale;
    
    renderTemplateToCanvas(ctx, activeTemplate, formData, productImages[activeTemplate.id], imageScales[activeTemplate.id], selectedRes.width, selectedRes.height, superScale);

  }, [activeTemplate, formData, productImages, imageScales, canvasGrid, imagePositions, selectedRes]);

  const handleDownloadSingle = () => {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `yantronic_${activeTemplate.id}_${selectedRes.width}x${selectedRes.height}.png`;
    link.href = url;
    link.click();
  };

  const handleDownloadAll = async () => {
    setBatchStatus('exporting');
    try {
      const superScale = 2; // 2 倍超清超采样
      for (const tpl of TEMPLATES) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = selectedRes.width * superScale;
        tempCanvas.height = selectedRes.height * superScale;
        const tempCtx = tempCanvas.getContext('2d');
        
        renderTemplateToCanvas(tempCtx, tpl, formData, productImages[tpl.id], imageScales[tpl.id], selectedRes.width, selectedRes.height, superScale);
        
        const url = tempCanvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `yantronic_${tpl.id}_${selectedRes.width}x${selectedRes.height}.png`;
        link.href = url;
        link.click();
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      setBatchStatus('done');
      setTimeout(() => setBatchStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setBatchStatus(null);
    }
  };

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
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4.5 h-4.5 text-blue-400" />
              <label className="text-xs font-bold text-slate-300">1. 切换编辑版式 (共4张)</label>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {TEMPLATES.map(tpl => {
                const isActive = activeTemplate.id === tpl.id;
                const hasImage = !!productImages[tpl.id];
                
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setActiveTemplate(tpl)}
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

          {/* Section 3: Upload Product Image */}
          <div className="bg-slate-850/40 border border-slate-850 p-4 rounded-2xl">
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
                3. 编写文本与版式微调 (X/Y坐标)
              </label>
              
              <button 
                onClick={() => resetTemplateDefaults(activeTemplate.id)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 hover:bg-indigo-500/10 transition"
              >
                <RefreshCw className="w-3 h-3" />
                重置当前页
              </button>
            </div>

            <div className="space-y-4">
              {activeTemplate.fields.map(field => {
                const val = formData[`${activeTemplate.id}_${field.id}`] || '';
                const size = formData[`${activeTemplate.id}_${field.id}_size`] || field.defaultSize;
                const lh = formData[`${activeTemplate.id}_${field.id}_lh`] || field.defaultLh;
                const posX = formData[`${activeTemplate.id}_${field.id}_x`] ?? field.defaultX;
                const posY = formData[`${activeTemplate.id}_${field.id}_y`] ?? field.defaultY;
                
                return (
                  <div key={field.id} className="bg-slate-850/50 border border-slate-850 p-3 rounded-xl hover:border-slate-750 transition duration-150">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold text-slate-300">{field.label}</span>
                      <span className="text-[9px] font-mono text-slate-500">#{field.id}</span>
                    </div>

                    {field.isMultiline ? (
                      <textarea
                        value={val}
                        onChange={(e) => updateForm(activeTemplate.id, field.id, 'value', e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-sans text-slate-200 placeholder-slate-700 mb-2"
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateForm(activeTemplate.id, field.id, 'value', e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 placeholder-slate-700 mb-2"
                      />
                    )}

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
            仅导出当前图 ({activeTemplate.id})
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
                一键打包导出全部 4 张大图
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
              2. 界面坐标与字号参数**始终以 `750 × 400` 为基准配置**。在切换至 `1920 × 820` 等分辨率时，系统将**自动等比放大**所有文案与图像位置，无需重新微调。
            </p>
            <p className="mt-1">
              3. 为保证大分辨率在屏幕内完美呈现，预览图已自适应缩放展示。**实际导出时将输出 100% 的无损高清规格大图**。
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
