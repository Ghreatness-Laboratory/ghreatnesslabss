import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TagManagerProps {
  tags: string[];
  onChange: (newTags: string[]) => void;
  label?: string;
}

export function TagManager({ tags, onChange, label = 'Tags' }: TagManagerProps) {
  const [inputVal, setInputVal] = useState('');

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="admin-tag-manager">
      <label className="admin-field-label">{label}</label>
      <div className="admin-tag-list">
        {tags.map((tag) => (
          <span key={tag} className="admin-tag-chip">
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              aria-label={`Remove tag ${tag}`}
              className="admin-tag-remove"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="admin-tag-input-row">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag and press Enter..."
          className="admin-input"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="admin-btn admin-btn-sm"
          disabled={!inputVal.trim()}
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}
