import React from 'react';
import jsPDF from 'jspdf';

export default function PDFReport({ result, userName, btnStyle }) {

  const generatePDF = () => {
    if (!result) { alert('No result data found.'); return; }

    const doc    = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    const W      = doc.internal.pageSize.getWidth();
    const H      = doc.internal.pageSize.getHeight();
    const margin = 20;
    const colW   = W - margin * 2;
    let   y      = 0;

    const colors = {
      bg:        [0,   3,   8  ],
      card:      [8,   15,  25 ],
      cardLight: [12,  22,  38 ],
      cyan:      [0,   255, 247],
      purple:    [181, 55,  242],
      green:     [0,   255, 150],
      pink:      [255, 45,  155],
      amber:     [255, 184, 0  ],
      white:     [255, 255, 255],
      dim:       [100, 120, 140],
      muted:     [60,  80,  100],
    };

    const scoreColor = result.score >= 65
      ? colors.green
      : result.score >= 40
        ? colors.amber
        : colors.pink;

    const tierLabel = result.score >= 65
      ? 'Low Risk'
      : result.score >= 40
        ? 'Medium Risk'
        : 'High Risk';

    const setFill   = (c) => doc.setFillColor(c[0], c[1], c[2]);
    const setStroke = (c) => doc.setDrawColor(c[0], c[1], c[2]);
    const setColor  = (c) => doc.setTextColor(c[0], c[1], c[2]);

    const rect = (x, ry, w, h, fill, radius = 0) => {
      setFill(fill);
      if (radius > 0) doc.roundedRect(x, ry, w, h, radius, radius, 'F');
      else            doc.rect(x, ry, w, h, 'F');
    };

    const line = (x1, ly, x2, ly2, color, lw = 0.3) => {
      doc.setLineWidth(lw);
      setStroke(color);
      doc.line(x1, ly, x2, ly2);
    };

    const text = (txt, x, ty, color, size, align = 'left', style = 'normal') => {
      setColor(color);
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.text(String(txt), x, ty, { align });
    };

    const addPage = () => {
      doc.addPage();
      rect(0, 0, W, H, colors.bg);
      y = 20;
    };

    const checkPage = (needed = 30) => {
      if (y + needed > H - 20) addPage();
    };

    // ── PAGE 1 BACKGROUND ─────────────────────────────────────
    rect(0, 0, W, H, colors.bg);
    rect(0,     0, W/3, 3, colors.cyan  );
    rect(W/3,   0, W/3, 3, colors.purple);
    rect(W*2/3, 0, W/3, 3, colors.pink  );

    y = 12;

    // ── LOGO ─────────────────────────────────────────────────
    rect(margin, y, 18, 18, colors.card, 3);
    setStroke(colors.cyan);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, 18, 18, 3, 3, 'S');

    text('MICRO',  margin + 22, y + 6,  colors.cyan,   22, 'left', 'bold');
    text('LOAN',   margin + 22, y + 13, colors.purple, 22, 'left', 'bold');
    text('.AI',    margin + 22, y + 20, colors.pink,   22, 'left', 'bold');

    text('Credit Analysis Report',
      W - margin, y + 5,  colors.white, 11, 'right', 'bold');
    text('AI-Powered Alternative Credit Scoring | Transformer + GAT Neural Network',
      W - margin, y + 11, colors.dim,   7,  'right');

    const reportId = result.report_id
      || Math.floor(Math.random()*99999999).toString().padStart(8,'0');

    text(`ID: RPT-${reportId}`,
      W - margin, y + 17, colors.muted, 6.5, 'right');
    text(
      `Generated: ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} at ${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}`,
      W - margin, y + 22, colors.muted, 6.5, 'right'
    );

    y += 28;
    line(margin, y, W - margin, y, colors.cyan, 0.5);
    y += 8;

    // ── HERO SCORE CARD ───────────────────────────────────────
    rect(margin, y, colW, 52, colors.card, 4);
    setStroke(scoreColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, colW, 52, 4, 4, 'S');

    text('APPLICANT',             margin + 8, y + 10, colors.dim,   7,  'left');
    text(userName || 'N/A',       margin + 8, y + 18, colors.white, 14, 'left', 'bold');
    text('RISK TIER',             margin + 8, y + 28, colors.dim,   7,  'left');
    text(tierLabel.toUpperCase(), margin + 8, y + 36, scoreColor,   12, 'left', 'bold');

    line(margin + colW*0.45, y+6, margin + colW*0.45, y+46, colors.muted, 0.3);

    const scoreX = margin + colW * 0.72;
    text('CREDIT SCORE', scoreX, y + 10, colors.dim, 7, 'center');
    setFill([20, 30, 45]);
    doc.circle(scoreX, y + 28, 16, 'F');
    setStroke(scoreColor);
    doc.setLineWidth(1.2);
    doc.circle(scoreX, y + 28, 16, 'S');
    text(String(result.score), scoreX, y + 32, scoreColor, 22, 'center', 'bold');
    text('/ 100',               scoreX, y + 40, colors.dim,  7,  'center');

    y += 58;

    // ── SCORE INDICATOR BAR ───────────────────────────────────
    rect(margin, y, colW, 24, colors.card, 3);

    const barLeft   = margin + 6;
    const barRight  = W - margin - 6;
    const barWidth  = barRight - barLeft;
    const barHeight = 5;
    const labelY    = y + 7;
    const barY      = y + 15;

    // Labels ABOVE bar — well spaced, never overlap
    text('HIGH RISK (0-40)',  barLeft,                   labelY, colors.pink,  5.5, 'left');
    text('MEDIUM (40-65)',    barLeft + barWidth * 0.40, labelY, colors.amber, 5.5, 'left');
    text('LOW RISK (65-100)', barLeft + barWidth * 0.67, labelY, colors.green, 5.5, 'left');

    // Bar segments
    rect(barLeft,                 barY, barWidth,      barHeight, [25, 35, 50], 2);
    rect(barLeft,                 barY, barWidth*0.40, barHeight, [180, 30,  80], 0);
    rect(barLeft + barWidth*0.40, barY, barWidth*0.25, barHeight, [160, 120,  0], 0);
    rect(barLeft + barWidth*0.65, barY, barWidth*0.35, barHeight, [0,  160,  80], 0);

    // Score marker triangle
    const markerX = barLeft + (result.score / 100) * barWidth;
    setFill(colors.white);
    doc.triangle(markerX-2, barY-1, markerX+2, barY-1, markerX, barY+barHeight+1, 'F');

    // YOUR SCORE label — BELOW bar, separate line, no overlap
    text(
      `YOUR SCORE: ${result.score}`,
      markerX, barY + barHeight + 6,
      colors.white, 5.5, 'center', 'bold'
    );

    y += 30;

    // ── MODEL PERFORMANCE ─────────────────────────────────────
    y += 4;
    rect(margin, y, colW, 8, [15, 25, 40]);
    text('MODEL PERFORMANCE', margin + 4, y + 5.5, colors.cyan, 7, 'left', 'bold');
    y += 10;

    const perfRows = [
      ['AI Architecture',   'Transformer Encoder + Graph Attention Network (GAT)'],
      ['Model AUC-ROC',     '0.9618 (Excellent — industry benchmark > 0.80)'],
      ['F1 Score',          '0.9142'],
      ['Training Records',  '10,000 synthetic applicant profiles'],
      ['Behavioral Data',   '12 months of sequential transaction patterns'],
      ['Features Analyzed', 'Recharge, Electricity, Grocery, Location, Social Trust'],
    ];

    perfRows.forEach((row, i) => {
      rect(margin, y, colW, 7, i%2===0 ? colors.card : colors.cardLight);
      text(row[0], margin + 4,           y + 5, colors.dim,   6.5, 'left');
      text(row[1], margin + colW * 0.40, y + 5, colors.white, 6.5, 'left');
      y += 7;
    });

    y += 6;

    // ── SHAP FEATURE IMPACT ───────────────────────────────────
    checkPage(60);
    rect(margin, y, colW, 8, [15, 25, 40]);
    text('FEATURE IMPACT ANALYSIS (SHAP)', margin + 4, y + 5.5, colors.cyan, 7, 'left', 'bold');
    text(
      'Each feature contribution to the credit score. Green bar = positive. Red bar = negative.',
      margin + 4, y + 12, colors.dim, 5.5, 'left'
    );
    y += 16;

    // Table header
    rect(margin, y, colW, 7, [20, 35, 55]);
    text('FEATURE',    margin + 4,          y + 5, colors.cyan, 6.5, 'left',   'bold');
    text('IMPACT BAR', margin + colW*0.38,  y + 5, colors.cyan, 6.5, 'left',   'bold');
    text('VALUE',      margin + colW*0.72,  y + 5, colors.cyan, 6.5, 'center', 'bold');
    text('DIRECTION',  margin + colW*0.87,  y + 5, colors.cyan, 6.5, 'center', 'bold');
    y += 8;

    const shapFeatures = result.shap_values && result.feature_names
      ? result.feature_names.map((n, i) => ({
          feature: n.replace(/_/g,' '),
          value:   parseFloat(result.shap_values[i].toFixed(2)),
        }))
      : [];

    const maxAbs  = Math.max(...shapFeatures.map(f => Math.abs(f.value)), 1);
    const barColW = W * 0.30;

    shapFeatures.forEach((feat, i) => {
      checkPage(10);
      const isPos  = feat.value >= 0;
      const rowBg  = i%2===0 ? colors.card : colors.cardLight;
      const barClr = isPos ? colors.green : colors.pink;
      const pct    = Math.abs(feat.value) / maxAbs;
      const bW     = Math.max(barColW * pct * 0.85, 1);

      rect(margin, y, colW, 8, rowBg);
      text(feat.feature, margin + 4, y + 5.5, colors.white, 6.5, 'left');

      const bX = margin + colW * 0.38;
      rect(bX, y+2, barColW*0.85, 4, [25, 40, 60], 1);
      rect(bX, y+2, bW,           4, barClr,       1);

      text(feat.value.toFixed(2), margin + colW*0.75, y + 5.5, barClr, 6.5, 'center', 'bold');
      text(isPos ? '(+) Positive' : '(-) Negative', margin + colW*0.88, y + 5.5, barClr, 6, 'center');
      y += 8;
    });

    y += 4;
    rect(margin + colW*0.38, y, 8, 4, colors.green, 1);
    text('Positive impact (increases score)', margin + colW*0.38 + 10, y + 3.5, colors.green, 5.5, 'left');
    rect(margin + colW*0.75, y, 8, 4, colors.pink, 1);
    text('Negative impact (reduces score)',   margin + colW*0.75 + 10, y + 3.5, colors.pink,  5.5, 'left');
    y += 10;

    // ── DECISION RATIONALE ────────────────────────────────────
    checkPage(50);
    rect(margin, y, colW, 8, [15, 25, 40]);
    text('DECISION RATIONALE', margin + 4, y + 5.5, colors.cyan, 7, 'left', 'bold');
    text(
      'Behavioral and social factors that influenced this credit decision:',
      margin + 4, y + 12, colors.dim, 5.5, 'left'
    );
    y += 16;

    const explanations = Array.isArray(result.explanation)
      ? result.explanation
      : [result.explanation];

    explanations.forEach((expl, i) => {
      checkPage(12);
      rect(margin, y, colW, 10, i%2===0 ? colors.card : colors.cardLight, 2);
      setFill(colors.cyan);
      doc.circle(margin + 6, y + 5, 3, 'F');
      text(String(i+1), margin + 6, y + 6.5, colors.bg, 5.5, 'center', 'bold');
      const wrapped = doc.splitTextToSize(String(expl), colW - 18);
      text(wrapped[0], margin + 13, y + 6, colors.white, 6.5, 'left');
      y += 11;
    });

    y += 6;

    // ── SCORE IMPROVEMENT TIPS ────────────────────────────────
    checkPage(20);
    rect(margin, y, colW, 8, [15, 25, 40]);
    text('SCORE IMPROVEMENT RECOMMENDATIONS', margin + 4, y + 5.5, colors.amber, 7, 'left', 'bold');
    text(
      'Action steps to improve your credit score for future applications:',
      margin + 4, y + 12, colors.dim, 5.5, 'left'
    );
    y += 16;

    const tips = Array.isArray(result.tips)
      ? result.tips
      : [result.tips];

    tips.forEach((tip, i) => {
      checkPage(12);
      rect(margin, y, colW, 10, i%2===0 ? colors.card : colors.cardLight, 2);
      setFill(colors.amber);
      doc.circle(margin + 6, y + 5, 3, 'F');
      text(String(i+1), margin + 6, y + 6.5, colors.bg, 5.5, 'center', 'bold');
      const wrapped = doc.splitTextToSize(String(tip), colW - 18);
      text(wrapped[0], margin + 13, y + 6, colors.white, 6.5, 'left');
      y += 11;
    });

    y += 8;

    // ── REPORT SUMMARY ────────────────────────────────────────
    checkPage(20);
    rect(margin, y, colW, 14, colors.card, 3);
    setStroke(scoreColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, colW, 14, 3, 3, 'S');
    text('REPORT SUMMARY', margin + 4, y + 5.5, colors.dim, 6, 'left', 'bold');
    text(
      `${userName || 'Applicant'} | Score: ${result.score}/100 | ${tierLabel} | AUC: 0.9618 | Transformer + GAT`,
      margin + 4, y + 11, colors.white, 7, 'left', 'bold'
    );
    y += 18;

    // ── DISCLAIMER ────────────────────────────────────────────
    checkPage(30);
    rect(margin, y, colW, 28, [10, 18, 30], 3);
    text('DISCLAIMER', margin + 4, y + 6, colors.dim, 6.5, 'left', 'bold');
    [
      'This report is generated by an AI model for informational purposes only.',
      'It does not constitute professional financial or legal advice.',
      'Credit decisions should be made in consultation with a qualified financial advisor.',
      'Model is trained on synthetic data and may not reflect all real-world credit factors.',
    ].forEach((dl, i) => {
      text(dl, margin + 4, y + 11 + i*4, colors.muted, 5.5, 'left');
    });
    y += 32;

    // ── FOOTER ────────────────────────────────────────────────
    rect(0, H-14, W, 14, colors.card);
    line(0, H-14, W, H-14, colors.cyan, 0.5);
    text('Micro-Loan Worthiness System',                margin,   H-7,  colors.cyan,  7,   'left',   'bold');
    text('Powered by Transformer + GAT Neural Network', W/2,      H-9,  colors.dim,   5.5, 'center');
    text('AUC-ROC: 0.9618  |  F1: 0.9142',             W/2,      H-5,  colors.muted, 5,   'center');
    text(
      `RPT-${reportId} | Confidential | For authorized use only`,
      W - margin, H-7, colors.muted, 5.5, 'right'
    );

    doc.save(`MicroLoan_Report_RPT-${reportId}.pdf`);
  };

  const defaultStyle = {
    padding:       '14px',
    background:    'linear-gradient(135deg,rgba(0,255,150,0.2),rgba(0,255,247,0.1))',
    border:        '1px solid rgba(0,255,150,0.4)',
    borderRadius:  '4px',
    fontSize:      '11px',
    fontWeight:    '700',
    letterSpacing: '2px',
    color:         '#00ff96',
    cursor:        'pointer',
    fontFamily:    "'Courier New',monospace",
    textTransform: 'uppercase',
    transition:    'all 0.3s',
    width:         '100%',
  };

  return (
    <button
      onClick={generatePDF}
      style={btnStyle || defaultStyle}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(0,255,150,0.25)';
        e.currentTarget.style.boxShadow  = '0 0 25px rgba(0,255,150,0.4)';
        e.currentTarget.style.transform  = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = (btnStyle || defaultStyle).background;
        e.currentTarget.style.boxShadow  = 'none';
        e.currentTarget.style.transform  = 'translateY(0)';
      }}>
      ⬇ DOWNLOAD PDF REPORT
    </button>
  );
}