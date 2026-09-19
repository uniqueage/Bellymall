const MESSAGE =
  "Free delivery on orders over ₦10,000  •  New: Suya Fridays at the Protein Factory  •  Use code BELLY10 for 10% off your first feast  •  120+ stalls under one roof";

export function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        <span>
          <i className="fa-solid fa-fire"></i> {MESSAGE}
        </span>
        <span>
          <i className="fa-solid fa-fire"></i> {MESSAGE}
        </span>
      </div>
    </div>
  );
}
