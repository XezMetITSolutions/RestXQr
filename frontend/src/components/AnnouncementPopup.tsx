import { useEffect, useState } from 'react';
import { useAnnouncementStore } from '@/store/useAnnouncementStore';
import { FaInfoCircle } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import TranslatedText from '@/components/TranslatedText';

export default function AnnouncementPopup() {
  const { announcements } = useAnnouncementStore();
  const { currentLanguage } = useLanguage();
  const [show, setShow] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('announcement_seen');
      if (!seen) setShow(true);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('announcement_seen', '1');
  };

  const handleNext = () => {
    if (index < announcements.length - 1) {
      setIndex(index + 1);
    } else {
      handleClose();
    }
  };

  if (!show || announcements.length === 0) return null;

  const current = announcements[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-xs w-full p-5 text-center relative">
        <FaInfoCircle className="mx-auto text-blue-500 text-3xl mb-2" />
        <h2 className="font-bold text-lg mb-1"><TranslatedText>Duyurular</TranslatedText></h2>
        <div className="font-semibold text-primary mb-1"><TranslatedText>{current.title}</TranslatedText></div>
        <p className="mb-4 text-gray-700"><TranslatedText>{current.description}</TranslatedText></p>
        <button
          className="btn bg-primary text-white px-4 py-2 rounded mr-2"
          onClick={handleNext}
        >
          <TranslatedText>{index < announcements.length - 1 ? 'Sonraki' : 'Kapat'}</TranslatedText>
        </button>
      </div>
    </div>
  );
}
