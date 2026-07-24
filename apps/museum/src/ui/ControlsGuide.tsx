interface Props {
  hasTouch: boolean
  showKeyboard: boolean
  vrSupported: boolean
}

/**
 * Beginner-friendly "how to move" section for the entry overlay. Written for
 * people who have never played a first-person game: visual keycaps / thumb
 * zones plus short bilingual (EN/ES) explanations.
 */
export function ControlsGuide({ hasTouch, showKeyboard, vrSupported }: Props) {
  return (
    <div className="guide">
      <p className="guide-title">How to move · Cómo moverte</p>

      {hasTouch && (
        <>
          <div className="guide-item">
            <div className="thumb-diagram">
              <span className="thumb-dot" />
            </div>
            <p>
              <strong>Walk:</strong> touch the <strong>left half</strong> of the screen and drag
              your thumb.
              <span className="es">Camina: toca la mitad izquierda y arrastra el pulgar.</span>
            </p>
          </div>
          <div className="guide-item">
            <div className="thumb-diagram thumb-diagram-right">
              <span className="thumb-arrows">⇄</span>
            </div>
            <p>
              <strong>Look around:</strong> drag on the <strong>right half</strong> of the screen.
              <span className="es">Mira alrededor: desliza en la mitad derecha.</span>
            </p>
          </div>
        </>
      )}

      {showKeyboard && (
        <>
          <div className="guide-item">
            <div className="keys-stack">
              <div className="keys">
                <span className="keycap keycap-w">W</span>
                <span className="keycap">A</span>
                <span className="keycap">S</span>
                <span className="keycap">D</span>
              </div>
              <span className="keys-or">or · o</span>
              <div className="keys">
                <span className="keycap keycap-w">↑</span>
                <span className="keycap">←</span>
                <span className="keycap">↓</span>
                <span className="keycap">→</span>
              </div>
            </div>
            <p>
              <strong>Walk:</strong> hold <strong>W</strong> or the <strong>↑ arrow</strong> to go
              forward — the side keys step sideways, S / ↓ goes back.
              <span className="es">
                Camina: mantén pulsada W o la flecha ↑ para avanzar.
              </span>
            </p>
          </div>
          <div className="guide-item">
            <div className="mouse-diagram">
              <span className="mouse-body" />
            </div>
            <p>
              <strong>Look around:</strong> just move the mouse.
              <span className="es">Mira alrededor: mueve el ratón.</span>
            </p>
          </div>
          <div className="guide-item">
            <div className="keys">
              <span className="keycap keycap-wide">Shift</span>
            </div>
            <p>
              <strong>Run:</strong> hold Shift while walking. <strong>Esc</strong> shows this menu.
              <span className="es">Corre con Shift · Esc abre este menú.</span>
            </p>
          </div>
        </>
      )}

      {vrSupported && (
        <div className="guide-item">
          <div className="keys">
            <span className="keycap keycap-wide">VR</span>
          </div>
          <p>
            <strong>In VR:</strong> push the left joystick to walk, flick the right one to turn.
            <span className="es">En VR: joystick izquierdo camina, el derecho gira.</span>
          </p>
        </div>
      )}
    </div>
  )
}
