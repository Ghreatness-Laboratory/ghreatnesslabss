import React from 'react';

export function AmbientBrandMark() {
  return (
    <div className="ambient-mark-container" aria-hidden="true">
      <div className="ambient-mark-spin">
        <span className="ambient-ring ambient-ring-outer" />
        <span className="ambient-ring ambient-ring-mid" />
        <span className="ambient-ring ambient-ring-inner" />
        <span className="ambient-mark-dot" />
      </div>
    </div>
  );
}
