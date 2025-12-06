"use client";

import { useState } from 'react';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';
import { FaBullhorn, FaBolt, FaPercent, FaInfoCircle, FaTrash, FaTimes, FaPlus } from 'react-icons/fa';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS = [
  { id: 'sale', label: 'İndirim', icon: <FaPercent />, color: 'pink' as const },
  { id: 'flash', label: 'Flaş', icon: <FaBolt />, color: 'orange' as const },
  { id: 'info', label: 'Bilgi', icon: <FaInfoCircle />, color: 'blue' as const },
  { id: 'bullhorn', label: 'Hoparlör', icon: <FaBullhorn />, color: 'purple' as const },
];

export default function AnnouncementQuickModal({ isOpen, onClose }: Props) {
  const { announcements, addAnnouncement, updateAnnouncement, removeAnnouncement } = useAnnouncementStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ticker, setTicker] = useState(true);
  const [durationSec, setDurationSec] = useState(5);
  const [selectedIcon, setSelectedIcon] = useState<'sale'|'flash'|'info'|'star'>('info');

  if (!isOpen) return null;

  const handleAdd = () => {
    // Boş bırakılsa bile buton aktif kalsın ve varsayılan değerlerle kayıt edilsin
    const safeTitle = title?.trim() || 'Duyuru';
    const safeDesc = description?.trim() || '';
    const safeDuration = Number.isFinite(durationSec) && durationSec > 0 ? durationSec : 3;
    addAnnouncement({ 
      id: Date.now().toString(), 
      title: safeTitle, 
      description: safeDesc, 
      ticker, 
      durationSec: safeDuration, 
      icon: selectedIcon 
    });
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-5" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaBullhorn className="text-purple-600" />
            <h3 className="text-lg font-semibold">Duyurular (Hızlı)</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FaTimes /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Yeni duyuru */}
          <div className="border rounded-lg p-3">
            <h4 className="font-medium mb-2">Yeni Duyuru</h4>
            <input type="text" className="w-full border rounded p-2 mb-2 text-sm" placeholder="Başlık" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="w-full border rounded p-2 mb-2 text-sm" placeholder="Açıklama" rows={3} value={description} onChange={e=>setDescription(e.target.value)} />
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={ticker} onChange={e=>setTicker(e.target.checked)} />
                Kayan Slider'da Göster
              </label>
              <label className="flex items-center gap-2 text-sm">
                Süre
                <input type="number" min={3} max={10} value={durationSec} onChange={e=>setDurationSec(parseInt(e.target.value || '5'))} className="w-16 border rounded p-1" /> sn
              </label>
            </div>

            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-1">İkon/Stil</div>
              <div className="flex gap-2">
                {ICONS.map(opt => (
                  <button key={opt.id} onClick={()=>setSelectedIcon(opt.id as any)} className={`px-2 py-1 text-sm rounded border ${selectedIcon===opt.id?'bg-purple-600 text-white border-purple-600':'bg-white text-gray-700'}`}>
                    <span className="inline-flex items-center gap-1">{opt.icon} {opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={handleAdd} className="btn bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 inline-flex items-center gap-2"><FaPlus /> Ekle</button>
          </div>

          {/* Mevcut duyurular */}
          <div className="border rounded-lg p-3">
            <h4 className="font-medium mb-2">Mevcut Duyurular</h4>
            <div className="space-y-2 max-h-72 overflow-auto">
              {announcements.map(a => (
                <div key={a.id} className="p-2 border rounded flex items-start gap-2">
                  <div className="flex-1">
                    <input className="w-full border rounded p-1 text-sm mb-1" value={a.title} onChange={e=>updateAnnouncement(a.id,{ title: e.target.value })} />
                    <textarea className="w-full border rounded p-1 text-xs" value={a.description} onChange={e=>updateAnnouncement(a.id,{ description: e.target.value })} />
                    <div className="text-[10px] text-gray-500 mt-1">{a.ticker ? 'Slider' : 'Sabit'} • {a.durationSec || 5}s • {a.icon || 'info'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>updateAnnouncement(a.id,{ ticker: !a.ticker })} className="text-xs px-2 py-1 border rounded">{a.ticker?'Sabit Yap':'Slayt Yap'}</button>
                    <button onClick={()=>removeAnnouncement(a.id)} className="text-red-600 hover:text-red-700"><FaTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
