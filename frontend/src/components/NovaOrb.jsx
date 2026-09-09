import React from 'react';
import { Mic, Sparkles, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import './NovaOrb.css';

/**
 * NovaOrb - Visual futuristic AI Assistant Orb component
 * @param {'idle' | 'listening' | 'thinking' | 'speaking' | 'error'} state
 * @param {'sm' | 'md' | 'lg' | 'xl'} size
 * @param {function} onClick
 * @param {boolean} interactive
 */
export default function NovaOrb({ state = 'idle', size = 'md', onClick, interactive = false, label }) {
  return (
    <div
      className={`nova-orb-container orb-size-${size} orb-state-${state} ${interactive ? 'interactive' : ''}`}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {/* Outer energy aura rings */}
      <div className="orb-ring ring-outer" />
      <div className="orb-ring ring-middle" />
      <div className="orb-ring ring-inner" />

      {/* Audio Wave animation lines (visible when listening or speaking) */}
      {(state === 'listening' || state === 'speaking') && (
        <div className="orb-audio-waves">
          <span className="wave-bar bar-1"></span>
          <span className="wave-bar bar-2"></span>
          <span className="wave-bar bar-3"></span>
          <span className="wave-bar bar-4"></span>
          <span className="wave-bar bar-5"></span>
        </div>
      )}

      {/* Core Orb Center */}
      <div className="orb-core">
        <div className="orb-glow" />
        <div className="orb-icon">
          {state === 'idle' && <Sparkles className="icon-pulse" />}
          {state === 'listening' && <Mic className="icon-mic" />}
          {state === 'thinking' && <Loader2 className="icon-spin" />}
          {state === 'speaking' && <Volume2 className="icon-speak" />}
          {state === 'error' && <AlertCircle className="icon-error" />}
        </div>
      </div>

      {label && <div className="orb-label">{label}</div>}
    </div>
  );
}

