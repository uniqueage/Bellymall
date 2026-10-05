import { useSettings } from "../lib/settings";

const FALLBACK_MESSAGE =
  "Free delivery on orders over ₦10,000  •  New: Suya Fridays at the Protein Factory  •  Use code BELLY10 for 10% off your first feast  •  120+ stalls under one roof";

export function Ticker() {
  const { ticker } = useSettings();
  const message = ticker.trim() || FALLBACK_MESSAGE;

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        <span>
          <i className="fa-solid fa-fire"></i> {message}
        </span>
        <span>
          <i className="fa-solid fa-fire"></i> {message}
        </span>
      </div>
    </div>
  );
}
