"use client";

import { useState, useEffect } from 'react';
import { FaCheck } from 'react-icons/fa';
import useCartStore from '@/store/useCartStore';

interface CartItemNotesProps {
  itemId: string; // cart item id
}

export default function CartItemNotes({ itemId }: CartItemNotesProps) {
  const { items, updateNotes } = useCartStore();
  const item = items.find(i => i.id === itemId);
  const [value, setValue] = useState(item?.notes || '');

  useEffect(() => {
    setValue(item?.notes || '');
  }, [item?.notes]);

  if (!item) return null;

  return (
    <div className="mt-2">
      <label className="text-[11px] text-gray-500 mb-1 block">Özel istek</label>
      <div className="flex items-center gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => updateNotes(itemId, value)}
          placeholder="Ketçap olmasın, mayonez az..."
          className="flex-1 text-sm p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none h-9"
          rows={1}
        />
        <button
          onClick={() => updateNotes(itemId, value)}
          className="px-3 py-2 text-xs rounded-md flex items-center gap-1 btn-primary"
          title="Kaydet"
        >
          <FaCheck size={12} />
        </button>
      </div>
    </div>
  );
}


