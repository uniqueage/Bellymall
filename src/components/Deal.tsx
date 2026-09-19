import { useState } from "react";
import { toast } from "../toast";

const COUPON_CODE = "BELLY10";

export function Deal() {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    const done = () => {
      setCopied(true);
      toast(`Code ${COUPON_CODE} copied — 10% off awaits!`, "fa-tags");
      window.setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(COUPON_CODE).then(done).catch(() => fallbackCopy(done));
    } else {
      fallbackCopy(done);
    }
  };

  const fallbackCopy = (done: () => void) => {
    const ta = document.createElement("textarea");
    ta.value = COUPON_CODE;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch {
      toast(`Copy failed — code is ${COUPON_CODE}`, "fa-tags");
    }
    ta.remove();
  };

  return (
    <section className="section deal-wrap" id="deals">
      <div className="container">
        <div className="deal reveal">
          <div>
            <span className="deal__eyebrow">
              <i className="fa-solid fa-tags"></i> First-feast offer
            </span>
            <h2 className="deal__title">
              Your first order eats for <em>10% less</em>
            </h2>
            <p className="deal__sub">
              New to the mall? Copy the code, stack your box and let us handle the heat. Valid on your first order, any
              stall.
            </p>
            <div className="deal__code-row">
              <code className="deal__code">{COUPON_CODE}</code>
              <button className="btn btn--light" onClick={copyCode}>
                <i className={copied ? "fa-solid fa-check" : "fa-regular fa-copy"}></i> {copied ? "Copied!" : "Copy code"}
              </button>
            </div>
            <p className="deal__fine">
              <i className="fa-regular fa-clock"></i> New customers • Min order ₦5,000 • Runs till Sept 30
            </p>
          </div>
          <div className="deal__badge" aria-hidden="true">
            <strong>-10%</strong>
            <span>
              Off your
              <br />
              first feast
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
