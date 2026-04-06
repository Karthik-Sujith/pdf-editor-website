import { useState, useRef, useEffect } from "react";
import { GitBranch, Link2, Mail, X, Info } from "lucide-react";

const Header = () => {
  const [showInfo, setShowInfo] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowInfo(false);
      }
    };
    if (showInfo) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInfo]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .hdr {
          height: 62px;
          padding: 0 40px;
          background: #f8faff;
          background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px);
          background-size: 24px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 200;
          border-bottom: 2px solid #0f172a;
          font-family: 'Space Grotesk', sans-serif;
        }

        .hdr-logo {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .hdr-logo-box {
          background: #0f172a;
          color: #fff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 5px 10px;
          border-radius: 6px;
          margin-right: 8px;
        }

        .hdr-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .hdr-right {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .hdr-info-btn {
          width: 34px;
          height: 34px;
          border-radius: 6px;
          border: 2px solid #0f172a;
          background: #fff;
          color: #0f172a;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 2px 2px 0 #0f172a;
        }

        .hdr-info-btn:hover {
          background: #0f172a;
          color: #fff;
          box-shadow: 3px 3px 0 #0f172a40;
        }

        .hdr-info-btn svg {
          width: 15px;
          height: 15px;
        }

        .hdr-popup {
          position: absolute;
          top: 46px;
          right: 0;
          background: #fff;
          border: 2px solid #0f172a;
          border-radius: 10px;
          padding: 16px 18px;
          min-width: 220px;
          box-shadow: 4px 4px 0 #0f172a;
          font-family: 'Space Grotesk', sans-serif;
          z-index: 300;
          animation: popupIn 0.15s ease;
        }

        @keyframes popupIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hdr-popup-eyebrow {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          margin: 0 0 3px;
        }

        .hdr-popup-name {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 14px;
        }

        .hdr-popup-divider {
          height: 1px;
          background: #e2e8f0;
          margin-bottom: 12px;
        }

        .hdr-popup-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hdr-popup-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 7px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          transition: all 0.15s;
        }

        .hdr-popup-link:hover {
          color: #2563eb;
          border-color: #bfdbfe;
          background: #eff6ff;
        }

        .hdr-popup-link svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .hdr { padding: 0 18px; }
        }

        @media (max-width: 600px) {
          .hdr { padding: 0 16px; }
          .hdr-title { font-size: 15px; }
        }
      `}</style>

      <header className="hdr">
        <div className="hdr-logo">
          <span className="hdr-logo-box">PDF</span>
          <h1 className="hdr-title">Toolkit</h1>
        </div>

        <div className="hdr-right" ref={popupRef}>
          <button
            className="hdr-info-btn"
            onClick={() => setShowInfo(!showInfo)}
            aria-label="About"
          >
            {showInfo ? <X /> : <Info />}
          </button>

          {showInfo && (
            <div className="hdr-popup">
              <p className="hdr-popup-eyebrow">Built by</p>
              <p className="hdr-popup-name">Karthik Sujith</p>
              <div className="hdr-popup-divider" />
              <div className="hdr-popup-links">
                <a
                  className="hdr-popup-link"
                  href="https://github.com/Karthik-Sujith"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitBranch size={14} />
                  GitHub
                </a>
                <a
                  className="hdr-popup-link"
                  href="https://www.linkedin.com/in/karthiksujith"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Link2 size={14} />
                  LinkedIn
                </a>
                <a
                  className="hdr-popup-link"
                  href="mailto:karthik151509@gmail.com"
                >
                  <Mail size={14} />
                  Email
                </a>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;