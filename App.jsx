import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ExternalLink, Activity, Globe, Wrench, X, BarChart3, TrendingUp, Download, Eye, Layers, GripVertical, AlertTriangle, Star, Search, MessageSquare, FolderOpen, MessageCircle, RefreshCw } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ref, onValue, set } from 'firebase/database';
import { database } from './firebase';
import './App.css';

const DEFAULT_WEBSITES = [
  { id: 'w1', name: '轉職故事', url: 'https://www.careerpivot.com.tw/', isFavorite: false },
  { id: 'w2', name: '麻將', url: 'https://www.mahjongking.com.tw/', isFavorite: false },
  { id: 'w3', name: '盧恩符文', url: 'https://mythrune.net/', isFavorite: false },
  { id: 'w4', name: '綠能', url: 'https://taiwanesg.com.tw', isFavorite: false },
  { id: 'w5', name: '政治', url: 'https://www.taiwannews365.com.tw/', isFavorite: false },
  { id: 'w6', name: 'AI新聞', url: 'https://www.twainews.com.tw/', isFavorite: false },
  { id: 'w7', name: '體育', url: 'https://twsportnews.com/', isFavorite: false },
];

const DEFAULT_TOOLS = [
  { id: 't1', name: '露營', url: 'https://camping.mixytalk.com/', isFavorite: false },
  { id: 't2', name: '雲端備忘錄', url: 'https://memo-tool.mixytalk.com/', isFavorite: false },
  { id: 't3', name: '穿搭配對', url: 'https://ai-wardrobe.mixytalk.com/', isFavorite: false },
  { id: 't4', name: '心靈塗鴉占卜儀', url: 'https://spiritdraw.mixytalk.com/', isFavorite: false },
  { id: 't5', name: '日式手繪御神籤', url: 'https://omikuji-draw.mixytalk.com/', isFavorite: false },
  { id: 't6', name: '你的社交人格', url: 'https://social-creature-quiz.mixytalk.com/', isFavorite: false },
  { id: 't7', name: '昆蟲', url: 'https://insect.mixytalk.com/', isFavorite: false },
  { id: 't8', name: '訂閱分帳工具', url: 'http://accounting-tools.mixytalk.com/', isFavorite: false },
  { id: 't9', name: 'PDF 壓縮工具', url: 'https://pdf.mixytalk.com/', isFavorite: false },
  { id: 't10', name: '探索台灣', url: 'https://explore-taiwan.mixytalk.com/', isFavorite: false },
  { id: 't11', name: '台灣騎跡', url: 'https://cycling-tool.mixytalk.com/', isFavorite: false },
  { id: 't12', name: '料理救星', url: 'https://cooking-savior.mixytalk.com/', isFavorite: false },
  { id: 't13', name: '我的衣櫥', url: 'https://test.mixytalk.com/', isFavorite: false },
];

const MAIN_DASHBOARD_URL = 'http://192.168.163.69:3000/';
const OLD_REPORT_URL = 'https://lookerstudio.google.com/u/4/reporting/e7b873d5-8727-45ab-b7bc-229cf715107c/page/XTQtF';

// --- Cloudflare API 設定 ---
const CLOUDFLARE_API_URL = 'https://mega-traffic-api.lgs-old-ts-mia.workers.dev';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function ItemCard({ item, onEdit, onDelete, onFavorite, type, dragHandleProps }) {
  const Icon = type === 'web' ? Globe : Wrench;
  return (
    <div className={`item-card glass-panel group ${item.isFavorite ? 'favorite-card' : ''}`}>
      <div className="flex items-center text-gray-300 hover:text-gray-500 transition-colors mr-2 cursor-grab active:cursor-grabbing pb-1" {...dragHandleProps}>
        <GripVertical size={16} />
      </div>
      <button
        type="button"
        onClick={() => onFavorite(item.id, type)}
        className="flex items-center justify-center w-6 h-6 mr-2 transition-colors cursor-pointer disabled:opacity-50"
        title={item.isFavorite ? "取消我的最愛" : "加入我的最愛"}
      >
        <Star size={16} className={item.isFavorite ? 'favorite-icon' : 'unfavorite-icon'} />
      </button>

      <div className="item-content flex-between w-full" style={{ minWidth: 0 }}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="item-link relative z-10 flex items-center" style={{ paddingRight: '10px', flex: 1, minWidth: 0 }}>
          <div className="item-icon-wrapper" style={{ flexShrink: 0 }}>
            <Icon className="icon-main" size={20} />
          </div>
          <div className="item-text" style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
            <h3 className="item-name truncate">{item.name}</h3>
            <p className="item-url truncate">{item.url}</p>
          </div>
        </a>
        <div className={`item-actions relative z-20 shadow-[0_0_10px_10px_rgba(255,255,255,1)] ${item.isFavorite ? 'bg-[#fffbeb]' : 'bg-white'}`} style={{ flexShrink: 0, paddingLeft: '0.25rem' }}>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="action-btn" title="前往網頁">
            <ExternalLink size={16} />
          </a>
          <button type="button" onClick={() => onEdit(item)} className="action-btn edit-btn" title="編輯項目">
            <Edit2 size={16} />
          </button>
          <button type="button" onClick={() => onDelete(item.id)} className="action-btn delete-btn" title="刪除項目">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay z-[60]">
      <div className="modal-content glass-panel" style={{ maxWidth: '22rem' }}>
        <div className="flex flex-col items-center text-center space-y-4 pt-4 pb-2">
          <div className="p-3 bg-red-50 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 m-0">確定要刪除嗎？</h2>
          <p className="text-sm text-gray-500 m-0 leading-relaxed">
            此項目一旦刪除後將無法直接復原。
          </p>
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          <button type="button" onClick={onClose} className="btn-cancel" style={{ width: '100%', padding: '0.6rem', display: 'flex', justifyContent: 'center' }}>
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary"
            style={{ width: '100%', padding: '0.6rem', display: 'flex', justifyContent: 'center', backgroundColor: '#ef4444' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            確定刪除
          </button>
        </div>
      </div>
    </div>
  );
}

function NotesModal({ isOpen, onClose, notes, onChangeNotes }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay z-[70]">
      <div className="modal-content glass-panel flex flex-col" style={{ maxWidth: '32rem', height: '60vh' }}>
        <div className="modal-header flex-between mb-4">
          <h2 className="modal-title font-semibold text-lg flex items-center gap-2">
            <MessageSquare size={20} className="text-purple-500" />
            百站大小事
          </h2>
          <button type="button" onClick={onClose} className="icon-btn rounded-full p-1.5 hover-bg-light">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <textarea
          className="notes-textarea custom-scrollbar"
          placeholder="在這裡記錄大小事..."
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          style={{ flex: 1, resize: 'none' }}
          autoFocus
        />
        <div className="modal-footer flex-end mt-6">
          <button type="button" onClick={onClose} className="btn-primary px-6">
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

function Modal({ isOpen, onClose, onSave, item, type }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setUrl(item.url);
    } else {
      setName('');
      setUrl('');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onSave({ id: item ? item.id : generateId(), name: name.trim(), url: url.trim(), isFavorite: item ? item.isFavorite : false });
    onClose();
  };

  return (
    <div className="modal-overlay z-50">
      <div className="modal-content glass-panel">
        <div className="modal-header flex-between mb-4">
          <h2 className="modal-title font-semibold text-lg">
            {item ? '編輯' : '新增'} {type === 'web' ? '網站' : '工具'}
          </h2>
          <button type="button" onClick={onClose} className="icon-btn rounded-full p-1.5 hover-bg-light">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label block text-sm mb-1.5">名稱</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="premium-input w-full"
              placeholder="輸入名稱..."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label block text-sm mb-1.5 mt-4">網址</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="premium-input w-full"
              placeholder="https://..."
              required
            />
          </div>
          <div className="modal-footer flex-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [websites, setWebsites] = useState(() => {
    const saved = localStorage.getItem('mega-traffic-websites');
    return saved ? JSON.parse(saved) : DEFAULT_WEBSITES;
  });

  const [tools, setTools] = useState(() => {
    const saved = localStorage.getItem('mega-traffic-tools');
    return saved ? JSON.parse(saved) : DEFAULT_TOOLS;
  });

  const [notes, setNotes] = useState(() => {
    return localStorage.getItem('mega-traffic-notes') || '';
  });

  const [searchWeb, setSearchWeb] = useState('');
  const [searchTool, setSearchTool] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('web');
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, type: null });
  const [notesOpen, setNotesOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const dbRef = ref(database, 'dashboard-data');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.websites) setWebsites(data.websites);
        if (data.tools) setTools(data.tools);
        if (data.notes !== undefined) setNotes(data.notes);
      } else {
        // If Firebase is completely empty, initialize it with current local state to prevent blanks
        set(dbRef, { websites, tools, notes });
      }
    });
    return () => unsubscribe();
  }, []);

  const updateFirebase = (newWebsites = websites, newTools = tools, newNotes = notes) => {
    set(ref(database, 'dashboard-data'), {
      websites: newWebsites,
      tools: newTools,
      notes: newNotes
    });
  };

  const handleSave = (item) => {
    let newWebsites = websites;
    let newTools = tools;
    if (modalType === 'web') {
      if (editingItem) {
        newWebsites = websites.map((w) => (w.id === item.id ? item : w));
      } else {
        let insertIndex = 0;
        while (insertIndex < websites.length && websites[insertIndex].isFavorite) {
          insertIndex++;
        }
        newWebsites = [...websites];
        newWebsites.splice(insertIndex, 0, item);
      }
      setWebsites(newWebsites);
    } else {
      if (editingItem) {
        newTools = tools.map((t) => (t.id === item.id ? item : t));
      } else {
        let insertIndex = 0;
        while (insertIndex < tools.length && tools[insertIndex].isFavorite) {
          insertIndex++;
        }
        newTools = [...tools];
        newTools.splice(insertIndex, 0, item);
      }
      setTools(newTools);
    }
    updateFirebase(newWebsites, newTools, notes);
  };

  const confirmDelete = (id, type) => {
    setDeleteDialog({ isOpen: true, id, type });
  };

  const executeDelete = () => {
    const { id, type } = deleteDialog;
    let newWebsites = websites;
    let newTools = tools;
    
    if (type === 'web') {
      newWebsites = websites.filter((w) => w.id !== id);
      setWebsites(newWebsites);
    } else {
      newTools = tools.filter((t) => t.id !== id);
      setTools(newTools);
    }
    
    updateFirebase(newWebsites, newTools, notes);
    setDeleteDialog({ isOpen: false, id: null, type: null });
  };

  const toggleFavorite = (id, type) => {
    const isWeb = type === 'web';
    const list = isWeb ? [...websites] : [...tools];
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return;

    const [item] = list.splice(index, 1);
    item.isFavorite = !item.isFavorite;

    if (item.isFavorite) {
      list.unshift(item);
    } else {
      // Find the last favorite to place it after
      let insertIndex = 0;
      while (insertIndex < list.length && list[insertIndex].isFavorite) {
        insertIndex++;
      }
      list.splice(insertIndex, 0, item);
    }

    if (isWeb) {
      setWebsites(list);
      updateFirebase(list, tools, notes);
    } else {
      setTools(list);
      updateFirebase(websites, list, notes);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setModalOpen(true);
  };

  const onDragEnd = (result, type) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (type === 'web') {
      const items = Array.from(websites);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setWebsites(items);
      updateFirebase(items, tools, notes);
    } else {
      const items = Array.from(tools);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setTools(items);
      updateFirebase(websites, items, notes);
    }
  };

  const handleSyncCloudflare = async () => {
    if (CLOUDFLARE_API_URL.includes('👉你的worker網址👈')) {
      alert("請先在 App.jsx 頂部設定真實的 CLOUDFLARE_API_URL");
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(CLOUDFLARE_API_URL);
      if (!response.ok) throw new Error("API 請求失敗");
      const urls = await response.json(); 
      // 假設回傳格式如: ['https://explore-taiwan.mixytalk.com/', 'https://10000000.mixytalk.com/']

      // 建立目前所有網址的集合，用來忽略大小寫與最後的斜線
      const existingUrls = new Set(tools.map(t => t.url.toLowerCase().replace(/\/$/, '')));
      let newToolsCount = 0;
      let newToolsList = [...tools];

      urls.forEach(urlStr => {
        let url = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
        const cleanUrl = url.toLowerCase().replace(/\/$/, '');

        // 防呆：如果 URL 已存在則跳過
        if (!existingUrls.has(cleanUrl)) {
          // 擷取名稱：取網址 //後面，.COM前面
          let newName = urlStr;
          const match = urlStr.match(/\/\/(.*?)\.com/i);
          if (match && match[1]) {
            newName = match[1]; // 去除 '.com' 之後的結果
          }

          newToolsList.push({
            id: generateId(),
            name: newName,
            url: url,
            isFavorite: false
          });
          newToolsCount++;
        }
      });

      if (newToolsCount > 0) {
        setTools(newToolsList);
        updateFirebase(websites, newToolsList, notes);
        alert(`同步完成！自動新增了 ${newToolsCount} 個工具/小遊戲。`);
      } else {
        alert('沒有發現新網址的工具/小遊戲，清單已是最新狀態。');
      }

    } catch (err) {
      alert("同步失敗：" + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredWebsites = websites.filter(w =>
    w.name.toLowerCase().includes(searchWeb.toLowerCase()) ||
    w.url.toLowerCase().includes(searchWeb.toLowerCase())
  );

  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(searchTool.toLowerCase()) ||
    t.url.toLowerCase().includes(searchTool.toLowerCase())
  );

  return (
    <div className="app-container relative" style={{ zoom: 1.1, height: '90.909vh' }}>
      <div className="bg-glow absolute top-0 -z-10"></div>

      <div className="max-w-7xl mx-auto h-full flex flex-col relative z-10 w-full">

        {/* Header - Fixed Height */}
        <header className="app-header relative z-20">
          <div className="header-brand">
            <div className="logo-icon bg-gradient-brand">
              <Layers size={28} color="white" />
            </div>
            <div>
              <h1 className="title-h1 flex items-baseline gap-2">
                百站引流 <span style={{ fontSize: '1.15rem', color: '#64748b', fontWeight: '500' }}>(mega traffic)</span>
              </h1>
              <p className="subtitle">資料中心與營運工具管理平台</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end" style={{ gap: '10px' }}>
            <a 
              href="https://analytics.google.com/analytics/web/?authuser=4#/a389467606p530690306/reports/intelligenthome" 
              target="_blank" rel="noopener noreferrer" 
              className="glass-btn flex-center gap-2 cursor-pointer relative z-20"
              style={{ backgroundColor: 'rgba(255, 247, 237, 0.6)', borderColor: 'rgba(255, 237, 213, 0.8)', color: '#c2410c' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fff7ed'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 247, 237, 0.6)'; }}
            >
              <BarChart3 size={16} style={{ color: '#f97316' }} />
              <span>GA</span>
            </a>
            <a 
              href="https://search.google.com/u/4/search-console?resource_id=sc-domain%3Amahjongking.com.tw" 
              target="_blank" rel="noopener noreferrer" 
              className="glass-btn flex-center gap-2 cursor-pointer relative z-20"
              style={{ backgroundColor: 'rgba(239, 246, 255, 0.6)', borderColor: 'rgba(191, 219, 254, 0.8)', color: '#1d4ed8' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 246, 255, 0.6)'; }}
            >
              <Search size={16} style={{ color: '#3b82f6' }} />
              <span>GSC</span>
            </a>
            <a 
              href="https://tagmanager.google.com/?authuser=4#/home" 
              target="_blank" rel="noopener noreferrer" 
              className="glass-btn flex-center gap-2 cursor-pointer relative z-20"
              style={{ backgroundColor: 'rgba(236, 253, 245, 0.6)', borderColor: 'rgba(167, 243, 208, 0.8)', color: '#047857' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ecfdf5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(236, 253, 245, 0.6)'; }}
            >
              <Layers size={16} style={{ color: '#10b981' }} />
              <span>GTM</span>
            </a>
            <a 
              href="https://internationalgamessystem-my.sharepoint.com/:f:/g/personal/chialungwang_igs_com_tw/IgCp8hZ-IVMCTo1Bf_7CoVRbATw3y1-mjRRPzZoPK6FbVeM?e=VLSKqm" 
              target="_blank" rel="noopener noreferrer" 
              className="glass-btn flex-center gap-2 cursor-pointer relative z-20"
              style={{ backgroundColor: 'rgba(241, 245, 249, 0.8)', borderColor: 'rgba(203, 213, 225, 0.8)', color: '#334155' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(241, 245, 249, 0.8)'; }}
            >
              <FolderOpen size={16} style={{ color: '#475569' }} />
              <span>共用 skill</span>
            </a>
            <a 
              href="https://allen1229.github.io/psychological-dashboard/" 
              target="_blank" rel="noopener noreferrer" 
              className="glass-btn flex-center gap-2 cursor-pointer relative z-20"
              style={{ backgroundColor: 'rgba(255, 228, 230, 0.4)', borderColor: 'rgba(255, 228, 230, 0.8)', color: '#be123c' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffe4e6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 228, 230, 0.4)'; }}
            >
              <MessageCircle size={16} style={{ color: '#e11d48' }} />
              <span>熱門話題</span>
            </a>
            <a 
              href="#" onClick={(e) => { e.preventDefault(); alert('連結待補'); }} 
              className="glass-btn flex-center gap-2 cursor-pointer relative z-20"
              style={{ backgroundColor: 'rgba(241, 245, 249, 0.8)', borderColor: 'rgba(203, 213, 225, 0.8)', color: '#334155' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(241, 245, 249, 0.8)'; }}
            >
              <TrendingUp size={16} style={{ color: '#475569' }} />
              <span>脆趨勢</span>
            </a>
          </div>
        </header>

        {/* 3 Columns Layout - Fills Remaining Height */}
        <div className="content-grid">

          {/* Column 1: 數據觀察 (Data Observation) */}
          <div className="column-section space-y-6">
            <div className="section-header flex-between mb-2">
              <div className="section-title flex-center gap-2">
                <BarChart3 size={22} className="text-blue-600" />
                <h2 className="title-h2">數據觀察</h2>
              </div>
            </div>

            <div className="column-content flex-col-scroll p-1" style={{ paddingTop: '0' }}>
              {/* Dashboard Widget */}
              <div className="glass-panel p-6 panel-widget mt-0">
                <div className="bg-icon absolute top-right">
                  <Activity size={120} className="text-cyan-alpha" />
                </div>
                <div className="widget-header flex-between z-10-rel">
                  <h3 className="font-semibold text-gray-800 flex-center gap-2 text-lg">
                    流量數據看板
                  </h3>
                  <span className="live-indicator" title="即時連線中">
                    <span className="ping"></span>
                    <span className="dot"></span>
                  </span>
                </div>

                <div className="widget-body z-10-rel mt-6">
                  <div className="tag-group flex-between mb-5">
                    <span className="tag-live">
                      <TrendingUp size={14} /> 系統連線穩定
                    </span>
                    <a 
                      href={OLD_REPORT_URL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-blue-50/50 hover:bg-blue-100/50"
                    >
                      <Layers size={12} />
                      舊版
                    </a>
                  </div>
                  <a href={MAIN_DASHBOARD_URL} target="_blank" rel="noopener noreferrer" className="btn-gradient relative z-20">
                    <Eye size={18} className="btn-icon" /> 前往報表主頁
                  </a>
                </div>
              </div>

              {/* System Stats */}
              <div className="glass-panel p-6 mt-6">
                <h3 className="font-semibold text-gray-800 mb-4 text-base">系統總覽</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      {websites.length} 
                      <span className="text-sm text-gray-400 font-medium" style={{ fontSize: '0.875rem' }}>/ 100</span>
                    </div>
                    <div className="stat-label">已收錄網站</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      {tools.length} 
                      <span className="text-sm text-gray-400 font-medium" style={{ fontSize: '0.875rem' }}>/ 100</span>
                    </div>
                    <div className="stat-label">已收錄工具/小遊戲</div>
                  </div>
                </div>
              </div>

              {/* Notes Board (百站大小事) */}
              <div className="mt-12 mb-6 pb-2">
                <button 
                  onClick={() => setNotesOpen(true)}
                  className="glass-btn w-full flex-center gap-2 cursor-pointer"
                  style={{
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    color: '#059669',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <MessageSquare size={18} />
                  百站大小事
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: 營運網站 (Websites) */}
          <div className="column-section flex flex-col h-full">
            <div className="section-header flex-between pb-3">
              <div className="section-title flex-center gap-2">
                <Globe size={22} className="text-indigo-600" />
                <h2 className="title-h2">網站</h2>
              </div>
              <button type="button" onClick={() => openModal('web')} className="add-btn btn-outline-indigo relative z-20 cursor-pointer">
                <Plus size={16} /> 新增網站
              </button>
            </div>

            <div className="search-container">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="搜尋網站名稱或網址..."
                value={searchWeb}
                onChange={(e) => setSearchWeb(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="scroll-area custom-scrollbar">
              <DragDropContext onDragEnd={(result) => onDragEnd(result, 'web')}>
                <Droppable droppableId="droppable-web" isDropDisabled={searchWeb.length > 0}>
                  {(provided) => (
                    <div className="items-list" {...provided.droppableProps} ref={provided.innerRef}>
                      {filteredWebsites.map((site, index) => (
                        <Draggable key={site.id} draggableId={site.id} index={index} isDragDisabled={searchWeb.length > 0}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.9 : 1,
                              }}
                            >
                              <ItemCard
                                item={site}
                                type="web"
                                onEdit={(item) => openModal('web', item)}
                                onDelete={(id) => confirmDelete(id, 'web')}
                                onFavorite={toggleFavorite}
                                dragHandleProps={searchWeb.length === 0 ? provided.dragHandleProps : {}}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {filteredWebsites.length === 0 && (
                        <div className="empty-state">查無相關網站。</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          {/* Column 3: 實用工具 (Tools) */}
          <div className="column-section flex flex-col h-full">
            <div className="section-header flex-between pb-3">
              <div className="section-title flex-center gap-2">
                <Wrench size={22} className="text-purple-600" />
                <h2 className="title-h2">工具/小遊戲</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={handleSyncCloudflare} 
                  className="glass-btn flex-center gap-2 cursor-pointer text-purple-600"
                  disabled={isSyncing}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                >
                  <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                  {isSyncing ? "同步中" : "同步 CF"}
                </button>
                <button type="button" onClick={() => openModal('t')} className="add-btn btn-outline-purple relative z-20 cursor-pointer" style={{ padding: '0.4rem 0.75rem' }}>
                  <Plus size={16} /> 新增
                </button>
              </div>
            </div>

            <div className="search-container">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="搜尋工具名稱或網址..."
                value={searchTool}
                onChange={(e) => setSearchTool(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="scroll-area custom-scrollbar">
              <DragDropContext onDragEnd={(result) => onDragEnd(result, 't')}>
                <Droppable droppableId="droppable-tools" isDropDisabled={searchTool.length > 0}>
                  {(provided) => (
                    <div className="items-list" {...provided.droppableProps} ref={provided.innerRef}>
                      {filteredTools.map((tool, index) => (
                        <Draggable key={tool.id} draggableId={tool.id} index={index} isDragDisabled={searchTool.length > 0}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.9 : 1,
                              }}
                            >
                              <ItemCard
                                item={tool}
                                type="tool"
                                onEdit={(item) => openModal('t', item)}
                                onDelete={(id) => confirmDelete(id, 't')}
                                onFavorite={toggleFavorite}
                                dragHandleProps={searchTool.length === 0 ? provided.dragHandleProps : {}}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {filteredTools.length === 0 && (
                        <div className="empty-state">查無相關工具。</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        item={editingItem}
        type={modalType}
      />

      <ConfirmDeleteModal
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, type: null })}
        onConfirm={executeDelete}
      />

      <NotesModal
        isOpen={notesOpen}
        onClose={() => setNotesOpen(false)}
        notes={notes}
        onChangeNotes={(newNotes) => {
          setNotes(newNotes);
          updateFirebase(websites, tools, newNotes);
        }}
      />
    </div>
  );
}
