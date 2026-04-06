import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import {
  Link2, Hash, Scissors, RotateCw, Droplets,
  ImagePlus, Copy, Pencil, PackageOpen,
  Upload, FileText, X, Download, ArrowLeft, CheckCircle2
} from "lucide-react";
import "./Banner.css";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileExt = (name) => name.split(".").pop().toUpperCase();

const TOOLS = [
  { id: "merge",      label: "Merge",       sub: "Combine PDFs",      Icon: Link2       },
  { id: "number",     label: "Numbering",   sub: "Add page numbers",  Icon: Hash        },
  { id: "split",      label: "Split",       sub: "Extract pages",     Icon: Scissors    },
  { id: "rotate",     label: "Rotate",      sub: "Rotate pages",      Icon: RotateCw    },
  { id: "watermark",  label: "Watermark",   sub: "Add watermark",     Icon: Droplets    },
  { id: "imgToPdf",   label: "Img → PDF",   sub: "Convert images",    Icon: ImagePlus   },
  { id: "duplicate",  label: "Duplicate",   sub: "Copy pages",        Icon: Copy        },
  { id: "rename",     label: "Rename",      sub: "Rename file",       Icon: Pencil      },
  { id: "compress",   label: "Compress",    sub: "Reduce size",       Icon: PackageOpen },
];

/* ─────────────────────────────────────────────
   TOOL SETTINGS FORM
   Defined OUTSIDE Banner so its identity is
   stable across renders — fixes the focus bug
   where typing a character caused the input to
   lose focus due to React unmounting/remounting
   a newly-created component on every keystroke.
───────────────────────────────────────────── */
const ToolSettingsForm = ({
  activeTool,
  pdfPageCount,
  files,
  splitRange, setSplitRange,
  numberStartType, setNumberStartType,
  numberPosition, setNumberPosition,
  rotateDeg, setRotateDeg,
  watermarkText, setWatermarkText,
  watermarkOpacity, setWatermarkOpacity,
  watermarkColor, setWatermarkColor,
  dupPage, setDupPage,
  dupTimes, setDupTimes,
  renameFile, setRenameFile,
  newFileName, setNewFileName,
}) => {
  if (!activeTool) return null;

  return (
    <div className="modal-settings">
      {activeTool === "split" && (
        <>
          {pdfPageCount && <div className="page-count-chip">{pdfPageCount} pages in this file</div>}
          <div className="info-box">
            <p className="info-box-title">Range rules</p>
            <ul>
              <li>Single page → 3-3</li>
              <li>Multiple pages → 2-6</li>
              <li>Reverse range not allowed</li>
            </ul>
          </div>
          <div className="form-row">
            <label>Page range</label>
            <input placeholder="e.g. 2-6" value={splitRange} onChange={(e) => setSplitRange(e.target.value)} />
          </div>
        </>
      )}

      {activeTool === "number" && (
        <>
          <div className="form-row">
            <label>Start from</label>
            <select value={numberStartType} onChange={(e) => setNumberStartType(e.target.value)}>
              <option value="1">1, 2, 3…</option>
              <option value="a">a, b, c…</option>
              <option value="A">A, B, C…</option>
            </select>
          </div>
          <div className="form-row">
            <label>Position</label>
            <select value={numberPosition} onChange={(e) => setNumberPosition(e.target.value)}>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="top-center">Top Center</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
            </select>
          </div>
        </>
      )}

      {activeTool === "rotate" && (
        <div className="form-row">
          <label>Angle</label>
          <select value={rotateDeg} onChange={(e) => setRotateDeg(e.target.value)}>
            <option value="90">90° clockwise</option>
            <option value="180">180°</option>
            <option value="270">270° (90° CCW)</option>
          </select>
        </div>
      )}

      {activeTool === "watermark" && (
        <>
          <div className="form-row">
            <label>Text</label>
            <input placeholder="CONFIDENTIAL" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Opacity</label>
            <select value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(e.target.value)}>
              <option value="0.1">Very light (10%)</option>
              <option value="0.25">Light (25%)</option>
              <option value="0.45">Medium (45%)</option>
              <option value="0.65">Dark (65%)</option>
            </select>
          </div>
          <div className="color-row">
            <label>Color</label>
            <input type="color" value={watermarkColor} onChange={(e) => setWatermarkColor(e.target.value)} />
            <span style={{ fontSize: 12, color: "#64748b" }}>{watermarkColor.toUpperCase()}</span>
          </div>
        </>
      )}

      {activeTool === "duplicate" && (
        <>
          {pdfPageCount && <div className="page-count-chip">{pdfPageCount} pages in this file</div>}
          <div className="form-row">
            <label>Page №</label>
            <input type="number" min="1" placeholder="e.g. 3" value={dupPage} onChange={(e) => setDupPage(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Copies</label>
            <input type="number" min="1" max="20" placeholder="1–20" value={dupTimes} onChange={(e) => setDupTimes(e.target.value)} />
          </div>
        </>
      )}

      {activeTool === "rename" && (
        <>
          <div className="form-row">
            <label>Select file</label>
            <select onChange={(e) => setRenameFile(files.find((f) => f.name === e.target.value))}>
              <option value="">Choose a file…</option>
              {files.filter((f) => f.type === "application/pdf").map((f, i) => (
                <option key={i} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>New name</label>
            <input placeholder="Enter new filename" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
          </div>
        </>
      )}

      {["merge", "imgToPdf", "compress"].includes(activeTool) && (
        <p className="modal-no-settings">No additional settings needed — ready to go.</p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const Banner = () => {
  const [files, setFiles] = useState([]);
  const [activeTool, setActiveTool] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [splitRange, setSplitRange] = useState("");
  const [pdfPageCount, setPdfPageCount] = useState(null);

  const [numberStartType, setNumberStartType] = useState("1");
  const [numberPosition, setNumberPosition] = useState("bottom-center");

  const [renameFile, setRenameFile] = useState(null);
  const [newFileName, setNewFileName] = useState("");

  const [rotateDeg, setRotateDeg] = useState("90");

  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState("0.25");
  const [watermarkColor, setWatermarkColor] = useState("#1e40af");

  const [dupPage, setDupPage] = useState("");
  const [dupTimes, setDupTimes] = useState("1");

  const fileInputRef = useRef(null);
  const thumbUrlCache = useRef({});
  const modalRef = useRef(null);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  /* Close modal on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    if (showModal) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showModal]);

  /* Lock body scroll when modal open */
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  /* ── Utilities ── */
  const requireFiles = () => {
    if (files.length === 0) { alert("Please upload a file first."); return false; }
    return true;
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const target = index + direction;
    if (target < 0 || target >= files.length) return;
    [newFiles[index], newFiles[target]] = [newFiles[target], newFiles[index]];
    setFiles(newFiles);
  };

  const removeFile = (index) => {
    const file = files[index];
    if (thumbUrlCache.current[file.name]) {
      URL.revokeObjectURL(thumbUrlCache.current[file.name]);
      delete thumbUrlCache.current[file.name];
    }
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const download = (blob, filename) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  const getPDFPageCount = async (file) => {
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    return pdf.getPageCount();
  };

  const getDynamicLabel = (startValue, index) => {
    if (/^[a-zA-Z]$/.test(startValue)) return String.fromCharCode(startValue.charCodeAt(0) + index);
    return String(Number(startValue) + index);
  };

  const getPositionXY = (page, position) => {
    const { width, height } = page.getSize();
    const map = {
      "bottom-left":   [30, 20],
      "bottom-center": [width / 2, 20],
      "bottom-right":  [width - 50, 20],
      "top-left":      [30, height - 40],
      "top-center":    [width / 2, height - 40],
      "top-right":     [width - 50, height - 40],
    };
    return { x: map[position][0], y: map[position][1] };
  };

  const getThumbUrl = (file) => {
    if (!thumbUrlCache.current[file.name]) {
      thumbUrlCache.current[file.name] = URL.createObjectURL(file);
    }
    return thumbUrlCache.current[file.name];
  };

  /* ── Modal helpers ── */
  const closeModal = () => {
    setShowModal(false);
    setDownloaded(false);
  };

  /* ── File change — only per-file size limit, no total cap ── */
  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const oversized = selected.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length) {
      alert(`These files exceed the ${MAX_FILE_SIZE_MB} MB per-file limit:\n${oversized.map((f) => f.name).join("\n")}`);
    }

    const allowed = selected.filter((f) => f.size <= MAX_FILE_SIZE);

    setFiles((prev) => [...prev, ...allowed]);
    setActiveTool(null);

    const pdfs = allowed.filter((f) => f.type === "application/pdf");
    if (pdfs.length === 1 && files.length === 0) {
      setPdfPageCount(await getPDFPageCount(pdfs[0]));
    } else {
      setPdfPageCount(null);
    }
    e.target.value = null;
  };

  const handleUploadBoxClick = () => fileInputRef.current?.click();

  /* ── Preview ── */
  const openPreview = (file) => {
    const url = URL.createObjectURL(file);
    setPreviewFile({ url, name: file.name, type: file.type });
  };

  const closePreview = () => {
    if (previewFile) URL.revokeObjectURL(previewFile.url);
    setPreviewFile(null);
  };

  /* ── Circular Thumbnail ── */
  const FileThumbnail = ({ file }) => {
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      return (
        <div className="file-thumb" onClick={() => openPreview(file)} title="Click to preview">
          <img src={getThumbUrl(file)} alt={file.name} />
        </div>
      );
    }
    return (
      <div className="file-thumb" onClick={() => openPreview(file)} title="Click to preview">
        <FileText size={16} strokeWidth={2} color="#2563eb" />
      </div>
    );
  };

  /* ── PDF operations ── */
  const imageToPDF = async () => {
    const images = files.filter((f) => f.type === "image/png" || f.type === "image/jpeg");
    if (!images.length) { alert("Upload PNG or JPG images"); return; }
    const pdf = await PDFDocument.create();
    for (const img of images) {
      const bytes = await img.arrayBuffer();
      const image = img.type === "image/png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    download(new Blob([await pdf.save()]), "images-to-pdf.pdf");
  };

  const mergePDFs = async () => {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (pdfs.length < 2) { alert("Upload at least 2 PDFs"); return; }
    const merged = await PDFDocument.create();
    for (const f of pdfs) {
      const pdf = await PDFDocument.load(await f.arrayBuffer());
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }
    download(new Blob([await merged.save()]), "merged.pdf");
  };

  const addPageNumbers = async () => {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (!pdfs.length) { alert("No PDFs found"); return; }
    const merged = await PDFDocument.create();
    for (const f of pdfs) {
      const pdf = await PDFDocument.load(await f.arrayBuffer());
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }
    const font = await merged.embedFont(StandardFonts.Helvetica);
    merged.getPages().forEach((page, i) => {
      const label = getDynamicLabel(numberStartType, i);
      const { x, y } = getPositionXY(page, numberPosition);
      page.drawText(label, { x, y, size: 12, font, color: rgb(0, 0, 0) });
    });
    download(new Blob([await merged.save()]), "numbered.pdf");
  };

  const splitPDF = async () => {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (pdfs.length !== 1) { alert("Split works on ONE PDF"); return; }
    const [start, end] = splitRange.split("-").map(Number);
    const src = await PDFDocument.load(await pdfs[0].arrayBuffer());
    if (!start || !end || start > end || end > src.getPageCount()) { alert("Invalid page range"); return; }
    const pdf = await PDFDocument.create();
    const pages = await pdf.copyPages(src, Array.from({ length: end - start + 1 }, (_, i) => i + start - 1));
    pages.forEach((p) => pdf.addPage(p));
    download(new Blob([await pdf.save()]), `pages-${start}-to-${end}.pdf`);
  };

  const rotatePDF = async () => {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (!pdfs.length) { alert("No PDFs found"); return; }
    const deg = parseInt(rotateDeg, 10);
    const out = await PDFDocument.create();
    for (const f of pdfs) {
      const src = await PDFDocument.load(await f.arrayBuffer());
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => {
        p.setRotation(degrees((p.getRotation().angle + deg) % 360));
        out.addPage(p);
      });
    }
    download(new Blob([await out.save()]), "rotated.pdf");
  };

  const addWatermark = async () => {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (!pdfs.length) { alert("No PDFs found"); return; }
    if (!watermarkText.trim()) { alert("Enter watermark text"); return; }
    const opacity = parseFloat(watermarkOpacity);
    const hex = watermarkColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const out = await PDFDocument.create();
    const font = await out.embedFont(StandardFonts.HelveticaBold);
    for (const f of pdfs) {
      const src = await PDFDocument.load(await f.arrayBuffer());
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((page) => {
        out.addPage(page);
        const { width, height } = page.getSize();
        const fontSize = Math.min(width, height) * 0.09;
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        page.drawText(watermarkText, {
          x: (width - textWidth) / 2,
          y: height / 2 - fontSize / 2,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: degrees(35),
        });
      });
    }
    download(new Blob([await out.save()]), "watermarked.pdf");
  };

  const duplicatePage = async () => {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (pdfs.length !== 1) { alert("Select ONE PDF"); return; }
    const pageNum = parseInt(dupPage, 10);
    const times = parseInt(dupTimes, 10);
    const src = await PDFDocument.load(await pdfs[0].arrayBuffer());
    const total = src.getPageCount();
    if (!pageNum || pageNum < 1 || pageNum > total) { alert(`Invalid page. PDF has ${total} pages.`); return; }
    if (!times || times < 1 || times > 20) { alert("Enter copies between 1 and 20"); return; }
    const out = await PDFDocument.create();
    const allPages = await out.copyPages(src, src.getPageIndices());
    allPages.forEach((p) => out.addPage(p));
    for (let i = 0; i < times; i++) {
      const [copy] = await out.copyPages(src, [pageNum - 1]);
      out.addPage(copy);
    }
    download(new Blob([await out.save()]), `duplicated-page-${pageNum}.pdf`);
  };

  const compressPDF = async () => {
    const pdfs = files.filter((f) => f.type === "application/pdf");
    if (!pdfs.length) { alert("No PDFs found"); return; }
    const out = await PDFDocument.create();
    for (const f of pdfs) {
      const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
    }
    const bytes = await out.save({ useObjectStreams: true });
    download(new Blob([bytes]), "compressed.pdf");
  };

  const renameAndDownload = async () => {
    if (!renameFile || !newFileName.trim()) return;
    const buffer = await renameFile.arrayBuffer();
    download(new Blob([buffer], { type: "application/pdf" }), `${newFileName}.pdf`);
  };

  /* ── Master download dispatcher ── */
  const handleModalDownload = async () => {
    setDownloading(true);
    try {
      switch (activeTool) {
        case "merge":      await mergePDFs(); break;
        case "number":     await addPageNumbers(); break;
        case "split":      await splitPDF(); break;
        case "rotate":     await rotatePDF(); break;
        case "watermark":  await addWatermark(); break;
        case "imgToPdf":   await imageToPDF(); break;
        case "duplicate":  await duplicatePage(); break;
        case "compress":   await compressPDF(); break;
        case "rename":     await renameAndDownload(); break;
        default: break;
      }
      setDownloaded(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please check your settings and try again.");
    } finally {
      setDownloading(false);
    }
  };

  /* ── Summary lines for the modal ── */
  const getModalSummary = () => {
    const pdfFiles = files.filter((f) => f.type === "application/pdf");
    const imgFiles = files.filter((f) => f.type.startsWith("image/"));

    switch (activeTool) {
      case "merge":
        return {
          title: "Merge PDFs",
          outputName: "merged.pdf",
          details: [
            `${pdfFiles.length} PDF${pdfFiles.length !== 1 ? "s" : ""} will be merged in order`,
            ...pdfFiles.map((f, i) => `${i + 1}. ${f.name}`),
          ],
        };
      case "number":
        return {
          title: "Add Page Numbers",
          outputName: "numbered.pdf",
          details: [
            `Numbering style: ${numberStartType === "1" ? "1, 2, 3…" : numberStartType === "a" ? "a, b, c…" : "A, B, C…"}`,
            `Position: ${numberPosition.replace("-", " ")}`,
            `Applies to ${pdfFiles.length} PDF${pdfFiles.length !== 1 ? "s" : ""}`,
          ],
        };
      case "split":
        return {
          title: "Split PDF",
          outputName: splitRange ? `pages-${splitRange.replace("-", "-to-")}.pdf` : "split.pdf",
          details: [
            `Source: ${pdfFiles[0]?.name || "—"}`,
            `Extracting pages: ${splitRange || "not set"}`,
            pdfPageCount ? `Document has ${pdfPageCount} pages total` : null,
          ].filter(Boolean),
        };
      case "rotate":
        return {
          title: "Rotate Pages",
          outputName: "rotated.pdf",
          details: [
            `Angle: ${rotateDeg}°`,
            `Applies to all pages in ${pdfFiles.length} PDF${pdfFiles.length !== 1 ? "s" : ""}`,
          ],
        };
      case "watermark":
        return {
          title: "Add Watermark",
          outputName: "watermarked.pdf",
          details: [
            `Text: "${watermarkText}"`,
            `Opacity: ${Math.round(parseFloat(watermarkOpacity) * 100)}%`,
            `Color: ${watermarkColor.toUpperCase()}`,
            `Applies to ${pdfFiles.length} PDF${pdfFiles.length !== 1 ? "s" : ""}`,
          ],
        };
      case "imgToPdf":
        return {
          title: "Image → PDF",
          outputName: "images-to-pdf.pdf",
          details: [
            `${imgFiles.length} image${imgFiles.length !== 1 ? "s" : ""} will be converted`,
            `One page per image, in upload order`,
          ],
        };
      case "duplicate":
        return {
          title: "Duplicate Page",
          outputName: `duplicated-page-${dupPage}.pdf`,
          details: [
            `Source: ${pdfFiles[0]?.name || "—"}`,
            `Page to duplicate: ${dupPage || "not set"}`,
            `Copies to append: ${dupTimes}`,
          ],
        };
      case "compress":
        return {
          title: "Compress PDF",
          outputName: "compressed.pdf",
          details: [
            `${pdfFiles.length} PDF${pdfFiles.length !== 1 ? "s" : ""} will be re-serialised`,
            `Uses object streams for smaller file size`,
          ],
        };
      case "rename":
        return {
          title: "Rename PDF",
          outputName: newFileName ? `${newFileName}.pdf` : "renamed.pdf",
          details: [
            `Source: ${renameFile?.name || "none selected"}`,
            `New name: ${newFileName ? `${newFileName}.pdf` : "not set"}`,
          ],
        };
      default:
        return { title: "Process", outputName: "output.pdf", details: [] };
    }
  };

  /* ── Right panel content (desktop, shown when no modal) ── */
  const RightPanelContent = () => {
    if (files.length === 0) {
      return (
        <div className="right-empty">
          <div className="right-empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="4" width="24" height="32" rx="4" stroke="#cbd5e1" strokeWidth="2.5"/>
              <path d="M14 14h12M14 19h12M14 24h8" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
              <rect x="20" y="28" width="20" height="16" rx="4" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2"/>
              <path d="M30 33v6M27 36h6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="right-empty-title">No files yet</p>
          <p className="right-empty-sub">Upload a PDF or image to get started. Your files will appear here.</p>
        </div>
      );
    }

    return (
      <div className="right-files">
        <div className="right-files-header">
          <div className="right-files-title-row">
            <p className="right-files-title">Files</p>
            <span className="right-files-count">{files.length}</span>
          </div>
          <div className="size-limit-bar right-size-bar">
            <div className="size-limit-track">
              <div className="size-limit-fill" style={{ width: `${Math.min(100, (totalSize / (MAX_FILE_SIZE * 5)) * 100)}%` }} />
            </div>
            <span className="size-limit-label">{formatSize(totalSize)} used</span>
          </div>
        </div>

        <div className="right-file-list">
          {files.map((file, i) => (
            <div key={i} className="right-file-card">
              <div className="right-file-thumb-wrap">
                <FileThumbnail file={file} />
                <span className="right-file-num">{i + 1}</span>
              </div>
              <div className="right-file-info">
                <p className="right-file-name">{file.name}</p>
                <div className="right-file-meta">
                  <span className="file-ext">{getFileExt(file.name)}</span>
                  <span className="right-file-size">{formatSize(file.size)}</span>
                </div>
              </div>
              <div className="right-file-actions">
                {file.type === "application/pdf" && (
                  <div className="reorder-buttons">
                    <button onClick={(e) => { e.stopPropagation(); moveFile(i, -1); }}>↑</button>
                    <button onClick={(e) => { e.stopPropagation(); moveFile(i, 1); }}>↓</button>
                  </div>
                )}
                <button className="file-remove-btn" onClick={(e) => { e.stopPropagation(); removeFile(i); }} title="Remove file">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const summary = activeTool ? getModalSummary() : null;
  const tool = TOOLS.find((t) => t.id === activeTool);

  /* Shared props for the stable ToolSettingsForm */
  const formProps = {
    activeTool, pdfPageCount, files,
    splitRange, setSplitRange,
    numberStartType, setNumberStartType,
    numberPosition, setNumberPosition,
    rotateDeg, setRotateDeg,
    watermarkText, setWatermarkText,
    watermarkOpacity, setWatermarkOpacity,
    watermarkColor, setWatermarkColor,
    dupPage, setDupPage,
    dupTimes, setDupTimes,
    renameFile, setRenameFile,
    newFileName, setNewFileName,
  };

  return (
    <>
      {/* ── Preview modal ── */}
      {previewFile && (
        <div className="preview-overlay" onClick={closePreview}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <span className="preview-modal-name">{previewFile.name}</span>
              <button className="preview-close-btn" onClick={closePreview}>✕</button>
            </div>
            <div className="preview-modal-body">
              {previewFile.type.startsWith("image/") ? (
                <img src={previewFile.url} alt={previewFile.name} />
              ) : (
                <iframe src={previewFile.url} title={previewFile.name} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation / Download Modal ── */}
      {showModal && summary && (
        <div className="confirm-overlay" onClick={closeModal}>
          <div className="confirm-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="confirm-modal-header">
              <div className="confirm-modal-title-row">
                {tool && <tool.Icon size={18} strokeWidth={2} color="#2563eb" />}
                <span className="confirm-modal-title">{summary.title}</span>
              </div>
              <button className="confirm-close-btn" onClick={closeModal} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="confirm-modal-body">
              {downloaded ? (
                /* ── Success state ── */
                <div className="confirm-success">
                  <div className="confirm-success-icon">
                    <CheckCircle2 size={48} color="#16a34a" strokeWidth={1.5} />
                  </div>
                  <p className="confirm-success-title">Download started!</p>
                  <p className="confirm-success-sub">
                    Your file <strong>{summary.outputName}</strong> has been sent to your downloads.
                  </p>
                  <div className="confirm-success-actions">
                    <button className="confirm-back-btn" onClick={closeModal}>
                      <ArrowLeft size={14} /> Back to editing
                    </button>
                    <button className="action-btn" onClick={handleModalDownload}>
                      <Download size={14} /> Download again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── Summary card ── */}
                  <div className="confirm-summary-card">
                    <p className="confirm-summary-label">What will happen</p>
                    <ul className="confirm-summary-list">
                      {summary.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                    <div className="confirm-output-row">
                      <span className="confirm-output-label">Output file</span>
                      <span className="confirm-output-name">{summary.outputName}</span>
                    </div>
                  </div>

                  {/* ── Editable settings ── */}
                  <div className="confirm-settings-section">
                    <p className="confirm-settings-label">Settings</p>
                    <ToolSettingsForm {...formProps} />
                  </div>

                  {/* ── Actions ── */}
                  <div className="confirm-actions">
                    <button className="confirm-back-btn" onClick={closeModal}>
                      <ArrowLeft size={14} /> Edit files
                    </button>
                    <button
                      className="action-btn"
                      onClick={handleModalDownload}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <>
                          <span className="confirm-spinner" /> Processing…
                        </>
                      ) : (
                        <>
                          <Download size={14} /> Download
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="bnr">
        <div className="bnr-layout">

          {/* ── LEFT COLUMN ── */}
          <div className="bnr-left">

            {/* Hero */}
            <div className="bnr-hero">
              <span className="bnr-hero-kicker">
                <span className="kicker-dot" />
                Free · Runs locally · Zero uploads
              </span>
              <h2>PDF tools that<br />just <span>work</span>.</h2>
              <p>Merge, split, number, rotate, watermark — no sign-up, no server, no tracking.</p>
            </div>

            {/* Upload box */}
            <div
              className="upload-card"
              onClick={handleUploadBoxClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleUploadBoxClick()}
            >
              <div className="upload-card-inner">
                <div className="upload-card-left">
                  <div className="upload-icon-box">
                    <Upload size={17} strokeWidth={2} color="#2563eb" />
                  </div>
                  <div>
                    <p className="upload-card-title">Upload PDF or Images</p>
                    <p className="upload-card-sub">PDF, PNG, JPG · Max {MAX_FILE_SIZE_MB} MB </p>
                  </div>
                </div>
                <span className="upload-cta">Choose Files</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {/* File list — MOBILE ONLY */}
            {files.length > 0 && (
              <div className="file-section-mobile">
                <p className="section-label">Files ({files.length})<span className="section-label-line" /></p>
                <div className="file-list">
                  {files.map((file, i) => (
                    <div key={i} className="file-row">
                      <span className="file-num">{i + 1}</span>
                      <FileThumbnail file={file} />
                      <span className="file-ext">{getFileExt(file.name)}</span>
                      <span className="file-name">{file.name}</span>
                      <span className="file-size-tag">{formatSize(file.size)}</span>
                      {file.type === "application/pdf" && (
                        <div className="reorder-buttons">
                          <button onClick={(e) => { e.stopPropagation(); moveFile(i, -1); }}>↑</button>
                          <button onClick={(e) => { e.stopPropagation(); moveFile(i, 1); }}>↓</button>
                        </div>
                      )}
                      <button className="file-remove-btn" onClick={(e) => { e.stopPropagation(); removeFile(i); }} title="Remove file">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            <p className="section-label">Tools<span className="section-label-line" /></p>

            <div className="tool-grid">
              {TOOLS.map(({ id, label, sub, Icon }) => (
                <div
                  key={id}
                  className={`tool-btn ${activeTool === id ? "active" : ""}`}
                  onClick={() => {
                    if (!requireFiles()) return;
                    const next = activeTool === id ? null : id;
                    setActiveTool(next);
                    setDownloaded(false);
                    if (next) {
                      setShowModal(true);
                    }
                  }}
                >
                  <span className="tool-btn-icon"><Icon size={18} strokeWidth={1.8} /></span>
                  <span className="tool-btn-label">{label}</span>
                  <span className="tool-btn-sub">{sub}</span>
                </div>
              ))}
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="bnr-right">
            <RightPanelContent />
          </div>

        </div>
      </section>
    </>
  );
};

export default Banner;