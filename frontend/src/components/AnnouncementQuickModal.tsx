import { useState } from 'react';
import { useBusinessSettingsStore } from '@/store/useBusinessSettingsStore';
import { FaBullhorn, FaBolt, FaPercent, FaInfoCircle, FaTrash, FaTimes, FaPlus } from 'react-icons/fa';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ICONS = [
  { id: 'sale', label: 'İndirim', icon: <FaPercent />, color: 'pink' as const, emoji: '🏷️' },
  { id: 'flash', label: 'Flaş', icon: <FaBolt />, color: 'orange' as const, emoji: '⚡' },
  { id: 'info', label: 'Bilgi', icon: <FaInfoCircle />, color: 'blue' as const, emoji: 'ℹ️' },
  { id: 'bullhorn', label: 'Duyuru', icon: <FaBullhorn />, color: 'purple' as const, emoji: '📢' },
];

export default function AnnouncementQuickModal({ isOpen, onClose }: Props) {
  const { settings, updateSettings } = useBusinessSettingsStore();
  const announcements = settings.basicInfo.menuSpecialContents || [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('info');

  if (!isOpen) return null;

  const handleAdd = async () => {
    const safeTitle = title?.trim() || 'Duyuru';
    const safeDesc = description?.trim() || '';
    const iconObj = ICONS.find(i => i.id === selectedIcon) || ICONS[2];

    const newAnn = {
      id: Date.now().toString(),
      title: safeTitle,
      description: safeDesc,
      emoji: iconObj.emoji
    };

    const updatedContents = [...announcements, newAnn];

    updateSettings({
      basicInfo: {
        ...settings.basicInfo,
        menuSpecialContents: updatedContents
      }
    });

    setTitle('');
    setDescription('');
  };

  const handleRemove = (id: string) => {
    const updatedContents = announcements.filter(a => a.id !== id);
    updateSettings({
      basicInfo: {
        ...settings.basicInfo,
        menuSpecialContents: updatedContents
      }
    });
  };

  const handleUpdate = (id: string, patch: any) => {
    const updatedContents = announcements.map(a =>
      a.id === id ? { ...a, ...patch } : a
    );
    updateSettings({
      basicInfo: {
        ...settings.basicInfo,
        menuSpecialContents: updatedContents
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FaBullhorn className="text-xl" />
            </div>
            <h3 className="text-xl font-bold">Duyurular (Hızlı Yönetim)</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Yeni duyuru */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 border-b pb-2">Yeni Duyuru Ekle</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-purple-500 transition-colors"
                  placeholder="Başlık (Örn: Günün Çorbası)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <textarea
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-purple-500 transition-colors"
                  placeholder="Kısa açıklama..."
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />

                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-2">İkon Seçimi</div>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedIcon(opt.id as any)}
                        className={`px-3 py-2 rounded-xl border-2 transition-all flex items-center gap-2 ${selectedIcon === opt.id
                          ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'
                          }`}
                      >
                        <span className="text-lg">{opt.emoji}</span>
                        <span className="text-xs font-bold">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <FaPlus /> Duyuruyu Ekle
                </button>
              </div>
            </div>

            {/* Mevcut duyurular */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 border-b pb-2">Aktif Duyurular ({announcements.length})</h4>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {announcements.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 italic">
                    <FaBullhorn className="mx-auto text-4xl mb-3 opacity-20" />
                    Henüz aktif duyuru yok
                  </div>
                ) : (
                  announcements.map(a => (
                    <div key={a.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-1">{a.emoji || '📢'}</span>
                        <div className="flex-1 min-w-0">
                          <input
                            className="w-full bg-transparent font-bold text-gray-800 text-sm focus:outline-none"
                            value={a.title}
                            onChange={e => handleUpdate(a.id, { title: e.target.value })}
                          />
                          <p className="text-xs text-gray-600 mt-1 truncate">{a.description}</p>
                        </div>
                        <button
                          onClick={() => handleRemove(a.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
