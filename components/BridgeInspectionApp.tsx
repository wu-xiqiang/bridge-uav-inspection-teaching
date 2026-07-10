"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  Aperture, Bot, Box, Camera, ChevronDown, ChevronRight, CircleHelp, Crosshair,
  Eye, EyeOff, Focus, Maximize, Pause, Play, RotateCcw, Route, Search, ShieldAlert,
  Sparkles, X, ZoomIn,
} from "lucide-react";
import { BridgeScene } from "./BridgeScene";
import { CrackImageViewer } from "./CrackImageViewer";
import { cracks, detectionSteps, inspectionRoutes, waypoints } from "@/lib/teaching-data";
import type { CrackRecord, RiskLevel, Stage, Waypoint } from "@/lib/types";

function riskClass(risk: RiskLevel) {
  return risk === "较高" ? "risk-high" : risk === "关注" ? "risk-watch" : "risk-low";
}

export function BridgeInspectionApp() {
  const [stage, setStage] = useState<Stage>("idle");
  const [busy, setBusy] = useState<"bridge" | "route" | null>(null);
  const [showRoute, setShowRoute] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [selectedCrack, setSelectedCrack] = useState<CrackRecord | null>(null);
  const [progress, setProgress] = useState(0);
  const [detectStep, setDetectStep] = useState(0);
  const [sortBy, setSortBy] = useState<"risk" | "width">("risk");
  const [showMask, setShowMask] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState("请从步骤 1 开始生成教学场景");

  const bridgeReady = stage !== "idle";
  const routeReady = ["route", "detecting", "results"].includes(stage);

  useEffect(() => {
    if (stage !== "detecting") return;
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = Math.min(100, value + 2);
        setDetectStep(Math.min(detectionSteps.length - 1, Math.floor(next / (100 / detectionSteps.length))));
        if (next >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => {
            setStage("results");
            setSelectedCrack(cracks[2]);
            setToast(`检测完成：共识别 ${cracks.length} 处裂缝病害`);
          }, 350);
        }
        return next;
      });
    }, 95);
    return () => window.clearInterval(timer);
  }, [stage]);

  const sortedCracks = useMemo(() => {
    const weight: Record<RiskLevel, number> = { "较高": 3, "关注": 2, "轻微": 1 };
    return [...cracks].sort((a, b) => sortBy === "width" ? b.maxWidth - a.maxWidth : weight[b.risk] - weight[a.risk]);
  }, [sortBy]);

  const generateBridge = () => {
    if (busy) return;
    setBusy("bridge");
    setStage("bridge");
    setSelectedCrack(null);
    setSelectedWaypoint(null);
    setToast("正在生成 6 跨预应力混凝土高架桥……");
    window.setTimeout(() => {
      setBusy(null);
      setAutoRotate(true);
      setToast("桥梁场景生成完成，可拖动旋转或滚轮缩放");
      window.setTimeout(() => setAutoRotate(false), 5200);
    }, 1500);
  };

  const generateRoute = () => {
    if (!bridgeReady) {
      setToast("请先生成桥梁三维场景");
      return;
    }
    setBusy("route");
    setShowRoute(true);
    setToast("正在规划梁侧、梁底及桥墩巡检航线……");
    window.setTimeout(() => {
      setStage("route");
      setBusy(null);
      setSelectedWaypoint(null);
      setResetToken((value) => value + 1);
      setToast(`4 条巡检航线生成完成：共 ${waypoints.length} 个教学航点，间隔约 2 m`);
    }, 1200);
  };

  const startDetection = () => {
    if (!bridgeReady) {
      setToast("请先生成桥梁三维场景");
      return;
    }
    setSelectedWaypoint(null);
    setSelectedCrack(null);
    setProgress(0);
    setDetectStep(0);
    setStage("detecting");
    setToast("AI 教学演示模型正在分析巡检图像");
  };

  const selectCrack = (crack: CrackRecord) => {
    if (stage !== "results") return;
    setSelectedWaypoint(null);
    setSelectedCrack(crack);
    setToast(`已定位 ${crack.id}：${crack.component}`);
  };

  const resetView = () => {
    setSelectedCrack(null);
    setSelectedWaypoint(null);
    setResetToken((value) => value + 1);
    setToast("已返回全桥观察视角");
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark"><span /><Aperture size={18} /></div>
        <div className="brand-copy">
          <h1>基于低空无人机的桥梁智能巡检教学系统</h1>
          <p>BRIDGE · UAV · AI DIGITAL TWIN LAB</p>
        </div>
        <div className="topbar-meta">
          <span className="connection-dot" />
          <div><b>教学模拟环境</b><small>场景连接正常</small></div>
          <span className="division" />
          <div className="course-code"><small>实训项目</small><b>BTI-06</b></div>
        </div>
      </header>

      <nav className="toolbar" aria-label="主要功能">
        <div className="primary-actions">
          <button data-testid="generate-bridge" className={`step-button ${bridgeReady ? "is-complete" : ""}`} onClick={generateBridge} disabled={busy !== null}>
            <span className="step-number">01</span><Box size={20} />
            <span><b>{busy === "bridge" ? "场景生成中…" : "生成桥梁场景"}</b><small>6跨简支 · 净空5m</small></span>
          </button>
          <ChevronRight className="step-arrow" size={17} />
          <button data-testid="generate-route" className={`step-button ${routeReady ? "is-complete" : ""}`} onClick={generateRoute} disabled={busy !== null}>
            <span className="step-number">02</span><Route size={20} />
            <span><b>{busy === "route" ? "航线规划中…" : "生成巡检航线"}</b><small>4类航线 · 约2m航点</small></span>
          </button>
          <ChevronRight className="step-arrow" size={17} />
          <button data-testid="ai-detect" className={`step-button ai-action ${stage === "results" ? "is-complete" : ""}`} onClick={startDetection} disabled={stage === "detecting" || busy !== null}>
            <span className="step-number">03</span><Sparkles size={20} />
            <span><b>{stage === "detecting" ? "AI 分析中…" : "AI 裂缝检测"}</b><small>分割 · 测量 · 定位</small></span>
          </button>
        </div>
        <div className="view-actions">
          <button title="重置视角" onClick={resetView}><RotateCcw size={18} /><span>重置视角</span></button>
          <button title="显示或隐藏航线" onClick={() => setShowRoute((value) => !value)} disabled={!routeReady}>{showRoute ? <Eye size={18} /> : <EyeOff size={18} />}<span>航线</span></button>
          <button title="自动旋转" onClick={() => setAutoRotate((value) => !value)} className={autoRotate ? "is-active" : ""}>{autoRotate ? <Pause size={18} /> : <Play size={18} />}<span>环绕</span></button>
          <button title="全屏" onClick={toggleFullscreen}><Maximize size={18} /><span>全屏</span></button>
          <button title="教学说明" onClick={() => setHelpOpen(true)}><CircleHelp size={18} /><span>说明</span></button>
        </div>
      </nav>

      <section className={`workspace ${stage === "results" ? "has-results" : ""}`}>
        <div className="viewport-panel">
          <BridgeScene
            stage={stage}
            showRoute={showRoute}
            autoRotate={autoRotate}
            resetToken={resetToken}
            selectedWaypoint={selectedWaypoint}
            selectedCrack={selectedCrack}
            onSelectWaypoint={(waypoint) => { setSelectedCrack(null); setSelectedWaypoint(waypoint); }}
            onSelectCrack={selectCrack}
            onUserInteraction={() => setAutoRotate(false)}
          />

          {!bridgeReady && (
            <div className="empty-state">
              <div className="empty-orbit"><Box size={42} /><i /><i /><i /></div>
              <span className="eyebrow">STEP 01 · DIGITAL TWIN</span>
              <h2>生成桥梁三维教学场景</h2>
              <p>构建 6 跨普通预应力混凝土简支高架桥，认识梁体、墩柱、盖梁与支座。</p>
              <button onClick={generateBridge}><Box size={18} />开始生成场景</button>
            </div>
          )}

          {busy && (
            <div className="build-indicator">
              <span className="scan-line" />
              <div className="loader-ring"><Box size={23} /></div>
              <div><b>{busy === "bridge" ? "构件参数化生成中" : "巡检航线解算中"}</b><small>{busy === "bridge" ? "正在装配梁体、桥墩与附属结构" : "正在计算安全距离与拍摄视角"}</small></div>
            </div>
          )}

          {bridgeReady && (
            <div className="scene-hud top-left">
              <span>场景信息</span>
              <dl><div><dt>桥梁类型</dt><dd>预应力混凝土简支梁桥</dd></div><div><dt>结构尺度</dt><dd>6 × 30 m</dd></div><div><dt>桥下净空</dt><dd>约 5.0 m</dd></div></dl>
            </div>
          )}

          {routeReady && stage !== "detecting" && (
            <div className="route-legend" aria-label="巡检航线图例">
              {inspectionRoutes.map((route) => {
                const active = selectedWaypoint?.routeId === route.id;
                const sample = route.waypoints[Math.floor(route.waypoints.length / 2)];
                return (
                  <button
                    key={route.id}
                    data-testid={route.id}
                    className={active ? "is-active" : ""}
                    style={{ borderBottomColor: route.color }}
                    onClick={() => { setSelectedCrack(null); setSelectedWaypoint(sample); }}
                  >
                    <i style={{ background: route.color }} />{route.label}<small>{route.waypoints.length}点</small>
                  </button>
                );
              })}
            </div>
          )}

          {selectedWaypoint && routeReady && (
            <div className="waypoint-card" data-testid="waypoint-card">
              <div className="card-heading"><span><Crosshair size={15} />航点参数</span><b>{selectedWaypoint.id}</b><button onClick={() => setSelectedWaypoint(null)}><X size={15} /></button></div>
              <div className="route-name-row" style={{ borderLeftColor: selectedWaypoint.color }}>{selectedWaypoint.routeName}</div>
              <div className="coordinate-row"><div><small>经度</small><b>{selectedWaypoint.longitude}° E</b></div><div><small>纬度</small><b>{selectedWaypoint.latitude}° N</b></div></div>
              <div className="parameter-grid">
                <div><small>相对高度</small><b>{selectedWaypoint.altitude.toFixed(1)} m</b></div>
                <div><small>飞行速度</small><b>{selectedWaypoint.speed.toFixed(1)} m/s</b></div>
                <div><small>云台俯仰</small><b>{selectedWaypoint.gimbalPitch}°</b></div>
                <div><small>相机偏航</small><b>{selectedWaypoint.yaw}°</b></div>
              </div>
              <p><Camera size={14} />{selectedWaypoint.component} · {selectedWaypoint.task}</p>
              <em>教学模拟坐标</em>
            </div>
          )}

          {stage === "detecting" && (
            <div className="detect-overlay" data-testid="detection-progress">
              <div className="ai-core"><Bot size={34} /><span /></div>
              <span className="eyebrow">AI VISION PIPELINE</span>
              <h3>桥梁裂缝智能分析</h3>
              <p>{detectionSteps[detectStep]}</p>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              <div className="progress-meta"><b>{progress}%</b><span>{Math.min(cracks.length, Math.ceil(progress / 17))} / {cracks.length} 幅图像</span></div>
              <small>教学演示模型 · 推理结果不用于工程鉴定</small>
            </div>
          )}

          <div className="compass"><span>N</span><i /><b>NE</b></div>
          <div className="interaction-hint"><span><span className="mouse-icon">◉</span>左键旋转</span><span><ZoomIn size={14} />滚轮缩放</span><span><Focus size={14} />右键平移</span></div>
        </div>

        {stage === "results" && (
          <aside className="results-panel" data-testid="crack-results">
            <div className="results-header">
              <div><span className="eyebrow">AI INSPECTION RESULTS</span><h2>裂缝检测结果</h2></div>
              <span className="result-count"><b>{cracks.length}</b>处</span>
            </div>
            <div className="result-summary"><div><ShieldAlert size={16} /><span>较高风险</span><b>2</b></div><div><span>平均置信度</span><b>95.8%</b></div></div>
            <label className="sort-control"><Search size={14} /><span>排序</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value as "risk" | "width")}><option value="risk">风险等级</option><option value="width">最大宽度</option></select><ChevronDown size={14} /></label>

            <div className="crack-list">
              {sortedCracks.map((crack) => (
                <button key={crack.id} className={`crack-item ${selectedCrack?.id === crack.id ? "is-selected" : ""}`} onClick={() => selectCrack(crack)} data-testid={`crack-${crack.id}`}>
                  <img src={crack.image} alt={`${crack.id}裂缝缩略图`} />
                  <span className="crack-copy"><span><b>{crack.id}</b><em className={riskClass(crack.risk)}>{crack.risk}</em></span><small>{crack.component}</small><span className="measure"><b>{crack.maxWidth.toFixed(2)}<i> mm</i></b><small>{crack.confidence}%</small></span></span>
                </button>
              ))}
            </div>

            {selectedCrack && (
              <div className="crack-detail">
                <div className="detail-heading"><div><span>图像识别详情</span><b>{selectedCrack.id}</b></div><button onClick={() => setSelectedCrack(null)}><X size={16} /></button></div>
                <div className="image-tabs"><button className={!showMask ? "is-active" : ""} onClick={() => setShowMask(false)}>原始图像</button><button className={showMask ? "is-active" : ""} onClick={() => setShowMask(true)}>分割结果</button></div>
                <CrackImageViewer crack={selectedCrack} showMask={showMask} />
                <div className="detail-metrics"><div><small>最大宽度</small><b>{selectedCrack.maxWidth.toFixed(2)} mm</b></div><div><small>裂缝长度</small><b>{selectedCrack.length} mm</b></div><div><small>模型置信度</small><b>{selectedCrack.confidence}%</b></div></div>
                <p>{selectedCrack.note}</p>
              </div>
            )}
          </aside>
        )}
      </section>

      <footer className="statusbar">
        <div className="status-message"><span className="pulse-dot" /><b>系统状态</b><span>{toast}</span></div>
        <ol className="lesson-progress">
          {["场景认知", "航线规划", "智能检测", "结果研判"].map((label, index) => {
            const activeIndex = stage === "idle" ? 0 : stage === "bridge" ? 0 : stage === "route" ? 1 : stage === "detecting" ? 2 : 3;
            return <li key={label} className={index <= activeIndex ? "is-active" : ""}><span>{index + 1}</span>{label}</li>;
          })}
        </ol>
        <span className="simulation-badge">教学模拟 · 非工程鉴定</span>
      </footer>

      {helpOpen && (
        <div className="modal-backdrop" onClick={() => setHelpOpen(false)}>
          <section className="help-modal" onClick={(event) => event.stopPropagation()}>
            <div className="help-heading"><div><span className="eyebrow">TEACHING GUIDE</span><h2>教学实训说明</h2></div><button onClick={() => setHelpOpen(false)}><X size={20} /></button></div>
            <div className="guide-flow">
              <div><Box size={20} /><b>1. 结构认识</b><p>观察梁体、桥墩、盖梁、支座与伸缩缝的空间关系。</p></div>
              <div><Route size={20} /><b>2. 航线规划</b><p>理解安全距离、拍摄重叠度、云台姿态及航点任务。</p></div>
              <div><Bot size={20} /><b>3. AI 检测</b><p>学习图像预处理、像素分割、宽度测量和三维定位流程。</p></div>
              <div><ShieldAlert size={20} /><b>4. 结果研判</b><p>依据宽度、长度和置信度筛选需人工复核的病害。</p></div>
            </div>
            <div className="control-guide"><span><b>左键拖动</b>自由旋转</span><span><b>滚轮</b>放大缩小</span><span><b>右键拖动</b>平移场景</span></div>
            <p className="warning-note">本系统坐标、病害与 AI 结果均为教学模拟数据，不能直接替代实际桥梁安全鉴定。</p>
          </section>
        </div>
      )}
    </main>
  );
}
