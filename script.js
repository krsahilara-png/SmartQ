/* ==========================================================================
   SmartQ — Intelligent Digital Queue Management Platform
   Standalone Modular Vanilla JavaScript (Zero Framework Dependencies)
   ========================================================================== */

'use strict';

import {
  BHOPAL_CATEGORIES,
  BHOPAL_AREAS,
  BHOPAL_SEED_BUSINESSES,
  DEMO_CENTRE_META,
  getDirectoryCategory,
  getSuggestedCounterTemplates,
  matchesBhopalArea,
  buildTemplateServiceCategories,
  getBusinessQueueMeta,
} from './bhopalData.js';
import * as SupabaseBackend from './src/supabase/index.ts';

/* --------------------------------------------------------------------------
   1. I18N — Bilingual English & Hindi Dictionary
   -------------------------------------------------------------------------- */
const I18N = {
  en: {
    brand: 'SmartQ',
    tagline: 'Skip the line. Not your turn.',
    navHome: 'Explore',
    navDirectory: 'Bhopal Directory',
    navCustomer: 'Book & Track',
    navOperator: 'Operator Desk',
    navAdmin: 'Admin Console',
    navDisplay: 'Live Display',
    navVerify: 'Verify QR',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    guestMode: 'Guest Booking',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    languageLabel: 'हिन्दी',
    localModeNotice: 'SmartQ Bhopal · Supabase Realtime Backend',
    heroKicker: 'SmartQ Bhopal · Multi-Category Digital Queue Platform',
    heroTitle: 'Skip the line. Not your turn.',
    heroDesc:
      'Explore hospitals, diagnostic labs, retail stores, salons, and local services across Bhopal. Check verified counter availability and book scannable QR tokens where live queues are active.',
    whereToGoTitle: 'Where do you want to go?',
    whereToGoSub: 'Choose a category to explore Bhopal establishments, filter by locality, and check counter availability.',
    bookTokenCta: 'Explore Bhopal',
    openDisplayCta: 'Open Live Display',
    verifyQrCta: 'Verify QR Token',
    activeToken: 'Active Token',
    queuePosition: 'Queue Position',
    peopleAhead: 'People Ahead',
    estWait: 'Est. Wait Time',
    approxNote: 'Estimate only — calculated from people ahead and recent counter service durations, not a guaranteed time.',
    displayEstWait: 'Est. Wait (New)',
    displayAvgPace: 'Avg Pace',
    displayEtaNote: 'All displayed wait times are dynamic estimates based on recent counter service times, not guaranteed.',
    nowServing: 'Now Serving',
    nextTokens: 'Next in Queue (Est. Wait)',
    waitingCount: 'Waiting',
    counterStatus: 'Status',
    announcements: 'Service Announcement',
    noActiveToken: 'No active token yet',
    callNext: 'Call Next Customer',
    markArrived: 'Mark Arrived',
    startService: 'Start Service',
    completeService: 'Complete Service',
    skipToken: 'Skip Token',
    markNoShow: 'Mark No-Show',
    recallToken: 'Recall',
    cancelBooking: 'Cancel Booking',
    reschedule: 'Reschedule',
    printToken: 'Print Token',
    downloadQr: 'Download QR',
    shareToken: 'Share Details',
    statusMap: {
      Booked: 'Booked',
      Waiting: 'Waiting',
      Approaching: 'Approaching',
      Called: 'Called',
      Arrived: 'Arrived',
      Serving: 'Serving',
      Completed: 'Completed',
      Cancelled: 'Cancelled',
      Skipped: 'Skipped',
      'No-show': 'No-show',
      open: 'Open',
      paused: 'Paused',
      closed: 'Closed',
    },
    congestionMap: {
      low: 'Low Traffic',
      moderate: 'Moderate Wait',
      high: 'High Congestion',
      full: 'Queue Full',
    },
    displayTitle: 'Live Queue Status Board',
    voiceOn: 'Voice Alerts: On',
    voiceOff: 'Voice Alerts: Off',
    enterFullscreen: 'Full Screen',
    exitFullscreen: 'Exit Full Screen',
    backToApp: 'Exit Display',
    emptyQueue: 'No customers waiting',
    idleCounter: 'Available',
  },
  hi: {
    brand: 'SmartQ',
    tagline: 'कतार छोड़ें, अपनी बारी नहीं।',
    navHome: 'एक्सप्लोर',
    navDirectory: 'भोपाल डायरेक्टरी',
    navCustomer: 'टोकन बुक करें',
    navOperator: 'ऑपरेटर डेस्क',
    navAdmin: 'एडमिन कंसोल',
    navDisplay: 'लाइव डिस्प्ले',
    navVerify: 'QR सत्यापन',
    signIn: 'लॉग इन',
    signOut: 'लॉग आउट',
    guestMode: 'अतिथि बुकिंग',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    languageLabel: 'English',
    localModeNotice: 'SmartQ भोपाल · Supabase रीयलटाइम बैकएंड',
    heroKicker: 'SmartQ भोपाल · बहु-श्रेणी डिजिटल कतार प्लेटफॉर्म',
    heroTitle: 'कतार छोड़ें, अपनी बारी नहीं।',
    heroDesc:
      'भोपाल के अस्पताल, पैथोलॉजी लैब, रिटेल स्टोर, सैलून और स्थानीय सेवाओं की खोज करें। लाइव काउंटर स्थिति देखें और उपलब्ध स्थानों पर QR टोकन बुक करें।',
    whereToGoTitle: 'आप कहाँ जाना चाहते हैं?',
    whereToGoSub: 'भोपाल के प्रतिष्ठानों को देखने, क्षेत्र के अनुसार फ़िल्टर करने और काउंटर उपलब्धता जांचने के लिए श्रेणी चुनें।',
    bookTokenCta: 'भोपाल डायरेक्टरी देखें',
    openDisplayCta: 'लाइव डिस्प्ले खोलें',
    verifyQrCta: 'QR टोकन जांचें',
    activeToken: 'सक्रिय टोकन',
    queuePosition: 'कतार में स्थान',
    peopleAhead: 'आगे लोग',
    estWait: 'अनुमानित प्रतीक्षा',
    approxNote: 'केवल अनुमान — आगे के ग्राहकों और हाल के काउंटर सेवा समय पर आधारित, गारंटीकृत समय नहीं।',
    displayEstWait: 'अनुमानित प्रतीक्षा',
    displayAvgPace: 'औसत गति',
    displayEtaNote: 'दिखाया गया प्रतीक्षा समय हाल के काउंटर सेवा समय पर आधारित अनुमान है, गारंटीकृत नहीं।',
    nowServing: 'वर्तमान सेवा',
    nextTokens: 'अगले टोकन (अनुमानित प्रतीक्षा)',
    waitingCount: 'प्रतीक्षारत',
    counterStatus: 'स्थिति',
    announcements: 'सेवा सूचना',
    noActiveToken: 'अभी कोई सक्रिय टोकन नहीं है',
    callNext: 'अगले ग्राहक को बुलाएं',
    markArrived: 'उपस्थिति दर्ज करें',
    startService: 'सेवा शुरू करें',
    completeService: 'सेवा पूर्ण करें',
    skipToken: 'टोकन स्किप करें',
    markNoShow: 'अनुपस्थित चिह्नित करें',
    recallToken: 'पुनः बुलाएं',
    cancelBooking: 'बुकिंग रद्द करें',
    reschedule: 'समय बदलें',
    printToken: 'टोकन प्रिंट करें',
    downloadQr: 'QR डाउनलोड करें',
    shareToken: 'विवरण साझा करें',
    statusMap: {
      Booked: 'बुक किया गया',
      Waiting: 'प्रतीक्षारत',
      Approaching: 'बारी नजदीक',
      Called: 'बुलाया गया',
      Arrived: 'पहुँच चुके',
      Serving: 'सेवा जारी',
      Completed: 'पूर्ण',
      Cancelled: 'रद्द',
      Skipped: 'स्किप किया गया',
      'No-show': 'अनुपस्थित',
      open: 'खुला',
      paused: 'रोका गया',
      closed: 'बंद',
    },
    congestionMap: {
      low: 'कम भीड़',
      moderate: 'मध्यम प्रतीक्षा',
      high: 'अधिक भीड़',
      full: 'कतार पूर्ण',
    },
    displayTitle: 'लाइव कतार सूचना बोर्ड',
    voiceOn: 'ध्वनि घोषणा: चालू',
    voiceOff: 'ध्वनि घोषणा: बंद',
    enterFullscreen: 'फुल स्क्रीन',
    exitFullscreen: 'फुल स्क्रीन बंद',
    backToApp: 'डिस्प्ले बंद करें',
    emptyQueue: 'कोई ग्राहक प्रतीक्षारत नहीं',
    idleCounter: 'उपलब्ध',
  },
};

/* --------------------------------------------------------------------------
   2. Utils — Escaping, IDs, Formatting, CSV Export
   -------------------------------------------------------------------------- */
const Utils = {
  esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  uid(prefix = 'id') {
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    const ts = Date.now().toString(36).slice(-5).toUpperCase();
    return `${prefix}_${ts}${rand}`;
  },

  normalizePhone(phone) {
    return String(phone || '').replace(/\D/g, '').slice(-10);
  },

  todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  dateStrFromIso(iso) {
    if (!iso) return this.todayStr();
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return this.todayStr();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  formatTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  maskPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 4) return '••••';
    return `••••••${digits.slice(-4)}`;
  },

  toCsv(headers, rows) {
    const escapeCell = (val) => {
      const s = val === null || val === undefined ? '' : String(val);
      if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [headers.map(escapeCell).join(',')];
    for (const row of rows) {
      lines.push(row.map(escapeCell).join(','));
    }
    return lines.join('\r\n');
  },

  downloadTextFile(filename, content, mime = 'text/csv;charset=utf-8;') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  statusClass(status) {
    return `status-${String(status || '').toLowerCase().replace(/\s+/g, '-')}`;
  },
};

/* --------------------------------------------------------------------------
   3. Pure Vanilla JS ISO/IEC 18004 QR Code Generator (EC Level M, Versions 1-6)
      Generates genuinely scannable QR codes with zero external dependencies.
   -------------------------------------------------------------------------- */
const QRGenerator = (() => {
  // GF(256) with primitive polynomial 0x11d
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      const factor = EXP[i];
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], factor);
      }
      poly = next;
    }
    return poly;
  }

  function rsRemainder(data, ecCount) {
    const gen = rsGeneratorPoly(ecCount);
    const res = new Uint8Array(data.length + ecCount);
    res.set(data);
    for (let i = 0; i < data.length; i++) {
      const coef = res[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          res[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return res.slice(data.length);
  }

  // Version specs for EC Level M (Versions 1..6, up to 106 bytes)
  const SPECS = {
    1: { size: 21, totalData: 16, ecPerBlock: 10, blocks: 1, align: [] },
    2: { size: 25, totalData: 28, ecPerBlock: 16, blocks: 1, align: [6, 18] },
    3: { size: 29, totalData: 44, ecPerBlock: 26, blocks: 1, align: [6, 22] },
    4: { size: 33, totalData: 64, ecPerBlock: 18, blocks: 2, align: [6, 26] },
    5: { size: 37, totalData: 86, ecPerBlock: 24, blocks: 2, align: [6, 30] },
    6: { size: 41, totalData: 108, ecPerBlock: 16, blocks: 4, align: [6, 34] },
  };

  function encodeBytes(text) {
    const bytes = new TextEncoder().encode(text);
    let version = 1;
    for (let v = 1; v <= 6; v++) {
      if (bytes.length + 2 <= SPECS[v].totalData) {
        version = v;
        break;
      }
      if (v === 6) version = 6;
    }
    const spec = SPECS[version];
    const maxPayload = spec.totalData - 2;
    const payload = bytes.slice(0, maxPayload);

    const bits = [];
    const pushBits = (val, len) => {
      for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
    };

    // Byte mode indicator (0100) + 8-bit length
    pushBits(0b0100, 4);
    pushBits(payload.length, 8);
    for (const b of payload) pushBits(b, 8);

    // Terminator up to 4 zero bits
    const capacityBits = spec.totalData * 8;
    const termLen = Math.min(4, capacityBits - bits.length);
    for (let i = 0; i < termLen; i++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);

    const dataCodewords = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
      dataCodewords.push(byte);
    }

    const pads = [0xec, 0x11];
    let padIdx = 0;
    while (dataCodewords.length < spec.totalData) {
      dataCodewords.push(pads[padIdx++ % 2]);
    }

    // Split into blocks & compute Reed-Solomon EC codewords
    const blockSize = spec.totalData / spec.blocks;
    const dataBlocks = [];
    const ecBlocks = [];
    for (let b = 0; b < spec.blocks; b++) {
      const slice = dataCodewords.slice(b * blockSize, (b + 1) * blockSize);
      dataBlocks.push(slice);
      ecBlocks.push(Array.from(rsRemainder(slice, spec.ecPerBlock)));
    }

    // Interleave
    const finalBytes = [];
    for (let i = 0; i < blockSize; i++) {
      for (let b = 0; b < spec.blocks; b++) finalBytes.push(dataBlocks[b][i]);
    }
    for (let i = 0; i < spec.ecPerBlock; i++) {
      for (let b = 0; b < spec.blocks; b++) finalBytes.push(ecBlocks[b][i]);
    }

    const finalBits = [];
    for (const byte of finalBytes) {
      for (let i = 7; i >= 0; i--) finalBits.push((byte >> i) & 1);
    }

    return buildMatrix(version, spec, finalBits);
  }

  function buildMatrix(version, spec, dataBits) {
    const size = spec.size;
    const matrix = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
    const isFunc = Array.from({ length: size }, () => new Uint8Array(size));

    const setFunc = (r, c, val) => {
      if (r >= 0 && r < size && c >= 0 && c < size) {
        matrix[r][c] = val ? 1 : 0;
        isFunc[r][c] = 1;
      }
    };

    // Finder patterns + separators
    const drawFinder = (tr, tc) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const r = tr + dr;
          const c = tc + dc;
          if (r < 0 || r >= size || c < 0 || c >= size) continue;
          const onBorder = dr === -1 || dr === 7 || dc === -1 || dc === 7;
          const dark =
            !onBorder &&
            (dr === 0 ||
              dr === 6 ||
              dc === 0 ||
              dc === 6 ||
              (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
          setFunc(r, c, dark ? 1 : 0);
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Alignment patterns
    const pos = spec.align;
    for (const r of pos) {
      for (const c of pos) {
        if (isFunc[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setFunc(r + dr, c + dc, dark ? 1 : 0);
          }
        }
      }
    }

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      setFunc(6, i, i % 2 === 0 ? 1 : 0);
      setFunc(i, 6, i % 2 === 0 ? 1 : 0);
    }

    // Dark module
    setFunc(size - 8, 8, 1);

    // Reserve format info areas
    for (let i = 0; i <= 8; i++) {
      if (!isFunc[8][i]) setFunc(8, i, 0);
      if (!isFunc[i][8]) setFunc(i, 8, 0);
    }
    for (let i = size - 8; i < size; i++) {
      if (!isFunc[8][i]) setFunc(8, i, 0);
      if (!isFunc[i][8]) setFunc(i, 8, 0);
    }

    // Place data bits in upward/downward zig-zag columns
    let bitIdx = 0;
    let upward = true;
    for (let col = size - 1; col >= 1; col -= 2) {
      if (col === 6) col = 5;
      for (let i = 0; i < size; i++) {
        const r = upward ? size - 1 - i : i;
        for (let dx = 0; dx < 2; dx++) {
          const c = col - dx;
          if (!isFunc[r][c]) {
            matrix[r][c] = bitIdx < dataBits.length ? dataBits[bitIdx++] : 0;
          }
        }
      }
      upward = !upward;
    }

    // Apply Mask 0 ((r + c) % 2 === 0) or best mask among 0..7
    const maskFns = [
      (r, c) => (r + c) % 2 === 0,
      (r) => r % 2 === 0,
      (_, c) => c % 3 === 0,
      (r, c) => (r + c) % 3 === 0,
      (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
      (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
      (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
      (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
    ];

    let bestMatrix = null;
    let bestScore = Infinity;

    for (let m = 0; m < 8; m++) {
      const candidate = matrix.map((row) => new Int8Array(row));
      const fn = maskFns[m];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!isFunc[r][c] && fn(r, c)) {
            candidate[r][c] ^= 1;
          }
        }
      }
      writeFormatBits(candidate, size, m);
      const score = evaluatePenalty(candidate, size);
      if (score < bestScore) {
        bestScore = score;
        bestMatrix = candidate;
      }
    }

    return { size, matrix: bestMatrix };
  }

  function writeFormatBits(mat, size, maskId) {
    // EC Level M = 00
    const data = (0b00 << 3) | maskId;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    const getBit = (i) => (bits >> i) & 1;
    // Around top-left
    const coords1 = [
      [8, 0],
      [8, 1],
      [8, 2],
      [8, 3],
      [8, 4],
      [8, 5],
      [8, 7],
      [8, 8],
      [7, 8],
      [5, 8],
      [4, 8],
      [3, 8],
      [2, 8],
      [1, 8],
      [0, 8],
    ];
    for (let i = 0; i < 15; i++) {
      const [r, c] = coords1[i];
      mat[r][c] = getBit(14 - i);
    }
    // Bottom-left & top-right
    for (let i = 0; i < 7; i++) mat[size - 1 - i][8] = getBit(i);
    for (let i = 0; i < 8; i++) mat[8][size - 8 + i] = getBit(7 + i);
  }

  function evaluatePenalty(mat, size) {
    let penalty = 0;
    for (let r = 0; r < size; r++) {
      let run = 1;
      for (let c = 1; c < size; c++) {
        if (mat[r][c] === mat[r][c - 1]) {
          run++;
          if (run === 5) penalty += 3;
          else if (run > 5) penalty += 1;
        } else {
          run = 1;
        }
      }
    }
    for (let c = 0; c < size; c++) {
      let run = 1;
      for (let r = 1; r < size; r++) {
        if (mat[r][c] === mat[r - 1][c]) {
          run++;
          if (run === 5) penalty += 3;
          else if (run > 5) penalty += 1;
        } else {
          run = 1;
        }
      }
    }
    let dark = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (mat[r][c] === 1) dark++;
      }
    }
    const ratio = Math.abs((dark * 100) / (size * size) - 50);
    penalty += Math.floor(ratio / 5) * 10;
    return penalty;
  }

  function drawToCanvas(canvas, payload, pixelSize = 168) {
    if (!canvas) return;
    const { size, matrix } = encodeBytes(payload);
    const quiet = 4;
    const totalModules = size + quiet * 2;
    const scale = Math.max(2, Math.floor(pixelSize / totalModules));
    const dim = totalModules * scale;
    canvas.width = dim;
    canvas.height = dim;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = '#0f172a';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c] === 1) {
          ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
        }
      }
    }
  }

  function toDataURL(payload, pixelSize = 220) {
    const c = document.createElement('canvas');
    drawToCanvas(c, payload, pixelSize);
    return c.toDataURL('image/png');
  }

  function buildPayload(token) {
    // Privacy-safe QR payload: contains NO customer name, phone, or email
    return `SMARTQ|TKN:${token.tokenNumber}|ID:${token.id}|CTR:${token.centreId}|CNT:${token.counterId}`;
  }

  function parsePayload(raw) {
    const trimmed = String(raw || '').trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('SMARTQ|')) {
      const parts = trimmed.split('|').slice(1);
      const map = {};
      for (const p of parts) {
        const idx = p.indexOf(':');
        if (idx > 0) map[p.slice(0, idx)] = p.slice(idx + 1);
      }
      return { tokenId: map.ID || '', tokenNumber: map.TKN || '' };
    }
    return { tokenId: trimmed, tokenNumber: trimmed.toUpperCase() };
  }

  return { drawToCanvas, toDataURL, buildPayload, parsePayload };
})();

/* --------------------------------------------------------------------------
   4. Initial Snapshot — Static Bhopal Directory Reference Only (Zero Fake Live Data)
   -------------------------------------------------------------------------- */
function createInitialSnapshot() {
  return SupabaseBackend.buildEmptySnapshot(
    BHOPAL_SEED_BUSINESSES,
    buildTemplateServiceCategories()
  );
}

/* --------------------------------------------------------------------------
   5. UiPreferencesAdapter — LocalStorage Restricted Strictly to UI Preferences
      All operational queue data lives in Supabase PostgreSQL + Realtime.
   -------------------------------------------------------------------------- */
const StorageAdapter = (() => {
  function loadUiPrefs() {
    return SupabaseBackend.loadUiPreferences();
  }

  function saveUiPrefs(partial) {
    return SupabaseBackend.saveUiPreferences(partial);
  }

  function requireConfigured() {
    if (!SupabaseBackend.isSupabaseConfigured()) {
      return {
        ok: false,
        error:
          'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file and run the SQL migrations (click "Setup Guide").',
      };
    }
    return { ok: true };
  }

  return { loadUiPrefs, saveUiPrefs, requireConfigured };
})();

/* --------------------------------------------------------------------------
   6. NotificationService — Supabase Notification Engine, History & Browser Push
   -------------------------------------------------------------------------- */
const NotificationService = {
  push(db, { userId, tokenId, type, title, message, urgent = false }) {
    if (!userId) return null;
    if (!Array.isArray(db.notifications)) db.notifications = [];
    const entry = {
      id: Utils.uid('NTF'),
      userId,
      tokenId: tokenId || '',
      type: type || 'info',
      title,
      message,
      urgent: Boolean(urgent),
      read: false,
      createdAt: new Date().toISOString(),
    };
    db.notifications.unshift(entry);
    if (db.notifications.length > 300) db.notifications.length = 300;

    // Persist asynchronously to Supabase public.notifications (RLS-enforced)
    if (SupabaseBackend.isSupabaseConfigured()) {
      SupabaseBackend.insertNotificationRow(entry).catch(() => {});
    }

    // Trigger native browser notification ONLY if user granted explicit permission
    if (
      db.settings &&
      db.settings.browserNotificationsEnabled &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      try {
        const opts = {
          body: message,
          tag: tokenId ? `${tokenId}_${type || 'info'}` : entry.id,
        };
        if (urgent) opts.requireInteraction = true;
        new Notification(title, opts);
      } catch (_) {
        // Ignore restricted iframe notification errors
      }
    }
    return entry;
  },

  getForUser(db, userId) {
    if (!userId || !Array.isArray(db.notifications)) return [];
    return db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnreadCount(db, userId) {
    if (!userId || !Array.isArray(db.notifications)) return 0;
    return db.notifications.reduce((cnt, n) => (n.userId === userId && !n.read ? cnt + 1 : cnt), 0);
  },

  async markRead(db, notifId, userId, isRead = true) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return { ok: false, error: cfg.error };
    const res = await SupabaseBackend.setNotificationReadInDb(notifId, Boolean(isRead));
    if (!res.ok) return res;
    if (Array.isArray(db.notifications)) {
      const item = db.notifications.find((n) => n.id === notifId && (!userId || n.userId === userId));
      if (item) item.read = Boolean(isRead);
    }
    return { ok: true };
  },

  async markAllRead(db, userId) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return { ok: false, error: cfg.error, count: 0 };
    if (!userId) return { ok: false, error: 'Sign in required.', count: 0 };
    const res = await SupabaseBackend.markAllNotificationsReadInDb(userId);
    if (!res.ok) return { ok: false, error: res.error, count: 0 };
    let updated = 0;
    if (Array.isArray(db.notifications)) {
      for (const n of db.notifications) {
        if (n.userId === userId && !n.read) {
          n.read = true;
          updated++;
        }
      }
    }
    return { ok: true, count: updated };
  },

  async deleteOne(db, notifId, userId) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return { ok: false, error: cfg.error };
    const res = await SupabaseBackend.deleteNotificationInDb(notifId);
    if (!res.ok) return res;
    if (Array.isArray(db.notifications)) {
      db.notifications = db.notifications.filter((n) => !(n.id === notifId && (!userId || n.userId === userId)));
    }
    return { ok: true };
  },

  async clearAll(db, userId) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return { ok: false, error: cfg.error, count: 0 };
    if (!userId) return { ok: false, error: 'Sign in required.', count: 0 };
    const res = await SupabaseBackend.clearAllNotificationsInDb(userId);
    if (!res.ok) return { ok: false, error: res.error, count: 0 };
    const before = Array.isArray(db.notifications) ? db.notifications.length : 0;
    if (Array.isArray(db.notifications)) {
      db.notifications = db.notifications.filter((n) => n.userId !== userId);
    }
    return { ok: true, count: Math.max(0, before - (db.notifications ? db.notifications.length : 0)) };
  },

  formatRelativeTime(iso) {
    if (!iso) return '—';
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay === 1) return 'Yesterday';
    return `${diffDay}d ago`;
  },

  getCategoryMeta(type) {
    const map = {
      called: { label: 'Token Called', cls: 'notif-category-urgent', group: 'queue' },
      threshold_1: { label: 'Position #1 — Next', cls: 'notif-category-urgent', group: 'queue' },
      threshold_3: { label: 'Position #3 Alert', cls: 'notif-category-accent', group: 'queue' },
      threshold_5: { label: 'Position #5 Alert', cls: 'notif-category-accent', group: 'queue' },
      approaching: { label: 'Approaching Turn', cls: 'notif-category-accent', group: 'queue' },
      position: { label: 'Queue Update', cls: '', group: 'queue' },
      eta: { label: 'ETA Change', cls: 'notif-category-warn', group: 'queue' },
      booking: { label: 'Booking Confirmed', cls: 'notif-category-good', group: 'booking' },
      rescheduled: { label: 'Rescheduled', cls: 'notif-category-accent', group: 'booking' },
      cancelled: { label: 'Cancelled', cls: 'notif-category-urgent', group: 'booking' },
      noshow: { label: 'Marked No-Show', cls: 'notif-category-urgent', group: 'booking' },
      restored: { label: 'Token Restored', cls: 'notif-category-good', group: 'booking' },
      skipped: { label: 'Token Skipped', cls: 'notif-category-warn', group: 'queue' },
      completed: { label: 'Completed', cls: 'notif-category-good', group: 'booking' },
      paused: { label: 'Counter Paused', cls: 'notif-category-warn', group: 'counter' },
      counter_paused: { label: 'Counter Paused', cls: 'notif-category-warn', group: 'counter' },
      counter_resumed: { label: 'Counter Resumed', cls: 'notif-category-good', group: 'counter' },
      counter_changed: { label: 'Counter Changed', cls: 'notif-category-accent', group: 'counter' },
      test: { label: 'Test Alert', cls: 'notif-category-accent', group: 'queue' },
    };
    return map[type] || { label: 'Update', cls: '', group: 'queue' };
  },

  matchesFilter(notif, filter) {
    if (!filter || filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    const meta = this.getCategoryMeta(notif.type);
    return meta.group === filter;
  },

  getBrowserPermissionState() {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission || 'default';
  },

  async requestBrowserPermission(db) {
    if (typeof Notification === 'undefined') {
      return { ok: false, message: 'Browser notifications are not supported in this browser.' };
    }
    if (Notification.permission === 'denied') {
      db.settings.browserNotificationsEnabled = false;
      StorageAdapter.saveUiPrefs({ browserNotificationsEnabled: false });
      return {
        ok: false,
        message: 'Browser notification permission is blocked in your browser site settings. In-app alerts remain active.',
      };
    }
    if (Notification.permission === 'granted') {
      db.settings.browserNotificationsEnabled = true;
      StorageAdapter.saveUiPrefs({ browserNotificationsEnabled: true });
      return { ok: true, message: 'Browser notifications enabled.' };
    }
    const result = await Notification.requestPermission();
    const granted = result === 'granted';
    db.settings.browserNotificationsEnabled = granted;
    StorageAdapter.saveUiPrefs({ browserNotificationsEnabled: granted });
    return {
      ok: granted,
      message: granted
        ? 'Browser notifications enabled.'
        : 'Permission was not granted. In-app alerts remain active.',
    };
  },

  disableBrowserNotifications(db) {
    db.settings.browserNotificationsEnabled = false;
    StorageAdapter.saveUiPrefs({ browserNotificationsEnabled: false });
    return { ok: true, message: 'Browser notifications muted. In-app alerts remain active.' };
  },

  async sendTestNotification(db, userId) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return { ok: false, error: cfg.error };
    const entry = {
      id: Utils.uid('NTF'),
      userId,
      tokenId: '',
      type: 'test',
      title: 'SmartQ Test Alert',
      message: 'Your Supabase realtime queue, ETA, and counter notifications are working properly.',
      urgent: false,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const res = await SupabaseBackend.insertNotificationRow(entry);
    if (!res.ok) return res;
    if (!Array.isArray(db.notifications)) db.notifications = [];
    db.notifications.unshift(entry);
    return { ok: true, entry };
  },

  announceVoice(tokenNumber, counterNumber, lang = 'en') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const text =
        lang === 'hi'
          ? `टोकन संख्या ${tokenNumber.split('').join(' ')}, कृपया ${counterNumber} पर आएं।`
          : `Token number ${tokenNumber.replace('-', ' ')}, please proceed to ${counterNumber}.`;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    } catch (_) {
      // Speech synthesis unavailable
    }
  },
};

/* --------------------------------------------------------------------------
   6B. DynamicEtaEngine — Per-Counter Historical Duration & Live Queue ETA
   -------------------------------------------------------------------------- */
const DynamicEtaEngine = (() => {
  const MAX_HISTORY_WINDOW = 12;

  function ensureStore(db) {
    if (!db.etaStats || typeof db.etaStats !== 'object') db.etaStats = {};
    return db.etaStats;
  }

  function getHistoricalStats(db, counterId) {
    const counter = db.counters.find((c) => c.id === counterId);
    const baseline = counter && counter.avgDurationMin > 0 ? counter.avgDurationMin : 8;
    const completed = (db.serviceHistory || [])
      .filter((h) => h.counterId === counterId && h.outcome === 'Completed' && Number(h.serviceDurationMin) > 0)
      .slice(0, MAX_HISTORY_WINDOW);

    if (completed.length === 0) {
      return {
        counterId,
        rollingAvgMin: baseline,
        sampleCount: 0,
        lastActualDurationMin: null,
        basis: 'baseline',
        categoryAverages: {},
      };
    }

    // Recency-weighted rolling average so recent shifts improve future estimates quickly
    let weightedSum = 0;
    let weightTotal = 0;
    const catBuckets = {};
    completed.forEach((rec, idx) => {
      const dur = Math.max(1, Number(rec.serviceDurationMin));
      const weight = Math.max(1, MAX_HISTORY_WINDOW - idx);
      weightedSum += dur * weight;
      weightTotal += weight;
      if (rec.categoryId) {
        if (!catBuckets[rec.categoryId]) catBuckets[rec.categoryId] = [];
        catBuckets[rec.categoryId].push(dur);
      }
    });

    const rawHistAvg = weightedSum / weightTotal;
    // Blend smoothly with baseline when only 1 sample exists; use pure historical average from >= 2 samples
    const rollingAvgMin =
      completed.length >= 2
        ? Math.max(1, Math.round(rawHistAvg * 10) / 10)
        : Math.max(1, Math.round(((rawHistAvg + baseline) / 2) * 10) / 10);

    const categoryAverages = {};
    for (const [catId, list] of Object.entries(catBuckets)) {
      const sum = list.reduce((a, b) => a + b, 0);
      categoryAverages[catId] = {
        avgMin: Math.max(1, Math.round((sum / list.length) * 10) / 10),
        samples: list.length,
      };
    }

    return {
      counterId,
      rollingAvgMin,
      sampleCount: completed.length,
      lastActualDurationMin: Number(completed[0].serviceDurationMin),
      basis: completed.length >= 2 ? 'historical' : 'blended',
      categoryAverages,
    };
  }

  function getExpectedServiceDuration(db, counterId, categoryId, histStats = null) {
    const stats = histStats || getHistoricalStats(db, counterId);
    const cat = db.categories.find((c) => c.id === categoryId);
    const catDefault = cat && cat.defaultDurationMin > 0 ? cat.defaultDurationMin : stats.rollingAvgMin;

    const catHist = categoryId && stats.categoryAverages ? stats.categoryAverages[categoryId] : null;
    if (catHist && catHist.samples >= 2) {
      return Math.max(1, Math.round(catHist.avgMin));
    }
    if (stats.sampleCount >= 2) {
      // Weight counter's real historical average heavily (70%) with category baseline (30%)
      return Math.max(1, Math.round(stats.rollingAvgMin * 0.7 + catDefault * 0.3));
    }
    if (stats.sampleCount === 1) {
      return Math.max(1, Math.round(stats.rollingAvgMin * 0.5 + catDefault * 0.5));
    }
    return Math.max(1, Math.round((catDefault + stats.rollingAvgMin) / 2));
  }

  function estimateRemainingForCurrent(db, counterId, currentToken, histStats = null) {
    if (!currentToken) return 0;
    const expected = getExpectedServiceDuration(db, counterId, currentToken.categoryId, histStats);
    const startedIso = currentToken.servingStartedAt || currentToken.arrivedAt || currentToken.calledAt || currentToken.createdAt;
    const elapsedMin = Math.max(0, (Date.now() - new Date(startedIso).getTime()) / 60000);
    if (currentToken.status === 'Called' && !currentToken.servingStartedAt) {
      // Customer called but not yet serving: expect full duration minus brief call grace
      return Math.max(2, Math.round(expected - Math.min(2, elapsedMin * 0.5)));
    }
    return Math.max(1, Math.round(expected - elapsedMin));
  }

  function computeCounterEta(db, counterId, current, waiting) {
    const stats = getHistoricalStats(db, counterId);
    const remainingCurrentMin = estimateRemainingForCurrent(db, counterId, current, stats);
    const nowIso = new Date().toISOString();

    let cumulativeMin = remainingCurrentMin;
    const perToken = [];

    waiting.forEach((tok, idx) => {
      const peopleAhead = idx + (current ? 1 : 0);
      const etaMin = peopleAhead === 0 ? 0 : Math.max(1, Math.round(cumulativeMin));
      const variance = Math.max(1, Math.round(etaMin * 0.15));
      const etaRangeMin = etaMin === 0 ? 0 : Math.max(1, etaMin - variance);
      const etaRangeMax = etaMin === 0 ? 0 : etaMin + variance;

      perToken.push({
        token: tok,
        position: idx + 1,
        peopleAhead,
        waitingAhead: idx,
        etaMin,
        etaRangeMin,
        etaRangeMax,
        etaBasis: stats.basis,
        etaSampleCount: stats.sampleCount,
        etaAvgServiceMin: Math.round(stats.rollingAvgMin),
        etaUpdatedAt: nowIso,
      });

      cumulativeMin += getExpectedServiceDuration(db, counterId, tok.categoryId, stats);
    });

    const projectedWaitMin = current || waiting.length > 0 ? Math.max(1, Math.round(cumulativeMin)) : 0;
    const nextTokenEtaMin = perToken.length > 0 ? perToken[0].etaMin : 0;

    const etaStore = ensureStore(db);
    etaStore[counterId] = {
      counterId,
      rollingAvgMin: stats.rollingAvgMin,
      sampleCount: stats.sampleCount,
      lastActualDurationMin: stats.lastActualDurationMin,
      basis: stats.basis,
      remainingCurrentMin,
      projectedWaitMin,
      nextTokenEtaMin,
      waitingCount: waiting.length,
      hasActiveServing: Boolean(current),
      updatedAt: nowIso,
    };

    return {
      stats,
      remainingCurrentMin,
      projectedWaitMin,
      nextTokenEtaMin,
      perToken,
      updatedAt: nowIso,
    };
  }

  function recordActualDuration(db, counterId, actualMin) {
    const counter = db.counters.find((c) => c.id === counterId);
    const stats = getHistoricalStats(db, counterId);
    if (counter && stats.sampleCount >= 2) {
      counter.avgDurationMin = Math.max(1, Math.round(stats.rollingAvgMin));
    }
    const etaStore = ensureStore(db);
    etaStore[counterId] = {
      ...(etaStore[counterId] || {}),
      counterId,
      rollingAvgMin: stats.rollingAvgMin,
      sampleCount: stats.sampleCount,
      lastActualDurationMin: actualMin,
      basis: stats.basis,
      updatedAt: new Date().toISOString(),
    };
    return stats;
  }

  return {
    getHistoricalStats,
    getExpectedServiceDuration,
    estimateRemainingForCurrent,
    computeCounterEta,
    recordActualDuration,
  };
})();

/* --------------------------------------------------------------------------
   6C. CounterRecommendationEngine — Live Multi-Factor Counter Optimization
   -------------------------------------------------------------------------- */
const CounterRecommendationEngine = (() => {
  function supportsCategory(counter, categoryId) {
    if (!counter) return false;
    if (!categoryId) return true;
    const list = Array.isArray(counter.categoryIds) ? counter.categoryIds : [];
    return list.length === 0 || list.includes(categoryId);
  }

  function evaluateAvailability(counter, centre, counterState) {
    if (!centre || !centre.isActive) {
      return { available: false, excludeReason: 'Business inactive' };
    }
    if (!centre.isOnboarded) {
      return { available: false, excludeReason: 'Not yet onboarded (Directory Listing)' };
    }
    if (centre.bookingEnabled === false) {
      return { available: false, excludeReason: 'Token booking paused by admin' };
    }
    if (counter.status === 'closed') {
      return { available: false, excludeReason: 'Counter closed' };
    }
    if (counter.status === 'paused') {
      return {
        available: false,
        excludeReason: counter.pauseReason ? `Paused (${counter.pauseReason})` : 'Counter paused',
      };
    }
    if (counter.status !== 'open') {
      return { available: false, excludeReason: 'Counter unavailable' };
    }
    if (counterState.waiting.length >= counter.maxCapacity) {
      return {
        available: false,
        excludeReason: `Queue full (${counterState.waiting.length}/${counter.maxCapacity})`,
      };
    }
    return { available: true, excludeReason: '' };
  }

  function buildRecommendationReason(best, runnerUp, totalEligible, excludedCount) {
    if (!best) return '';
    const waitTxt = best.projectedWaitMin === 0 ? 'immediate (~0 min)' : `~${best.projectedWaitMin} min`;
    const queueTxt = `${best.waitingCount} waiting`;
    const speedTxt = `~${best.estimatedServiceDurationMin} min/service`;

    if (totalEligible === 1) {
      const exclNote = excludedCount > 0 ? `; ${excludedCount} paused/closed/full excluded` : '';
      return best.projectedWaitMin === 0
        ? `Immediate availability — 0 waiting (${speedTxt}${exclNote}).`
        : `Only open counter available for this service (${queueTxt} · ${waitTxt} est. wait · ${speedTxt}${exclNote}).`;
    }

    if (runnerUp) {
      const savedMin = runnerUp.projectedWaitMin - best.projectedWaitMin;
      if (savedMin > 0) {
        return `Lowest estimated wait (${waitTxt}) — saves ~${savedMin} min vs ${runnerUp.counter.number} (${queueTxt} · ${speedTxt}).`;
      }
      if (best.waitingCount < runnerUp.waitingCount) {
        return `Shortest waiting queue (${best.waitingCount} vs ${runnerUp.waitingCount} at ${runnerUp.counter.number}) with ${waitTxt} est. wait (${speedTxt}).`;
      }
      if (best.estimatedServiceDurationMin < runnerUp.estimatedServiceDurationMin) {
        return `Faster estimated service (~${best.estimatedServiceDurationMin} min vs ~${runnerUp.estimatedServiceDurationMin} min at ${runnerUp.counter.number}) with ${waitTxt} est. wait.`;
      }
    }

    if (best.projectedWaitMin === 0) {
      return `Immediate availability — 0 waiting (${speedTxt}, ${best.capacityRemaining} open slots).`;
    }
    return `Lowest estimated wait (${waitTxt}) based on queue length (${queueTxt}), service duration (${speedTxt}), and spare capacity.`;
  }

  function analyzeCounters(db, { categoryId = null, centreId = null, excludeCounterId = null } = {}) {
    const centreMap = new Map((db.centres || []).map((c) => [c.id, c]));
    const matching = (db.counters || []).filter((c) => {
      if (centreId && c.centreId !== centreId) return false;
      if (!supportsCategory(c, categoryId)) return false;
      return true;
    });

    const eligible = [];
    const excluded = [];

    for (const counter of matching) {
      const centre = centreMap.get(counter.centreId) || null;
      const state = QueueEngine.getCounterState(db, counter.id);
      const estimatedServiceDurationMin = DynamicEtaEngine.getExpectedServiceDuration(
        db,
        counter.id,
        categoryId,
        state.etaStats
      );
      const waitingCount = state.waiting.length;
      const peopleAhead = waitingCount + (state.current ? 1 : 0);
      const capacityRemaining = Math.max(0, counter.maxCapacity - waitingCount);
      const utilizationRatio = waitingCount / Math.max(1, counter.maxCapacity);
      const avail = evaluateAvailability(counter, centre, state);

      const isExplicitlyExcluded = Boolean(excludeCounterId && counter.id === excludeCounterId);
      const candidate = {
        ...state,
        counter,
        centre,
        waitingCount,
        peopleAhead,
        estimatedServiceDurationMin,
        capacityRemaining,
        utilizationRatio,
        available: avail.available && !isExplicitlyExcluded,
        excludeReason: isExplicitlyExcluded ? 'Current counter' : avail.excludeReason,
        isRecommended: false,
        rank: null,
        reason: '',
        savedMin: 0,
      };

      if (candidate.available) {
        eligible.push(candidate);
      } else {
        excluded.push(candidate);
      }
    }

    // Multi-factor ranking:
    // 1. Lowest estimated waiting time (projectedWaitMin)
    // 2. Shortest waiting queue length (waitingCount)
    // 3. Lowest estimated service duration (estimatedServiceDurationMin)
    // 4. Lowest capacity utilization (more spare slots)
    eligible.sort((a, b) => {
      if (a.projectedWaitMin !== b.projectedWaitMin) return a.projectedWaitMin - b.projectedWaitMin;
      if (a.waitingCount !== b.waitingCount) return a.waitingCount - b.waitingCount;
      if (a.estimatedServiceDurationMin !== b.estimatedServiceDurationMin) {
        return a.estimatedServiceDurationMin - b.estimatedServiceDurationMin;
      }
      if (a.utilizationRatio !== b.utilizationRatio) return a.utilizationRatio - b.utilizationRatio;
      return a.counter.number.localeCompare(b.counter.number);
    });

    eligible.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    const recommended = eligible.length > 0 ? eligible[0] : null;
    const runnerUp = eligible.length > 1 ? eligible[1] : null;

    if (recommended) {
      recommended.isRecommended = true;
      recommended.savedMin = runnerUp ? Math.max(0, runnerUp.projectedWaitMin - recommended.projectedWaitMin) : 0;
      recommended.reason = buildRecommendationReason(recommended, runnerUp, eligible.length, excluded.length);
    }

    return {
      categoryId,
      centreId,
      recommended,
      runnerUp,
      eligible,
      excluded,
      allCounters: [...eligible, ...excluded],
      analyzedAt: new Date().toISOString(),
    };
  }

  return {
    supportsCategory,
    evaluateAvailability,
    analyzeCounters,
  };
})();

/* --------------------------------------------------------------------------
   7. QueueEngine — Core Queue Rules, Dynamic ETA, Congestion & Audit Trail
   -------------------------------------------------------------------------- */
const QueueEngine = (() => {
  const ACTIVE_STATUSES = ['Booked', 'Waiting', 'Approaching', 'Called', 'Arrived', 'Serving'];
  const WAITING_STATUSES = ['Waiting', 'Approaching'];
  const SERVING_SLOT_STATUSES = ['Called', 'Arrived', 'Serving'];

  function addAudit(db, actor, action, targetType, targetId, details) {
    const entry = {
      id: Utils.uid('AUD'),
      actorId: actor ? actor.id : 'SYSTEM',
      actorName: actor ? actor.name : 'System',
      actorRole: actor ? actor.role : 'system',
      action,
      targetType,
      targetId: targetId || '',
      details,
      createdAt: new Date().toISOString(),
    };
    db.auditLogs.unshift(entry);
    if (db.auditLogs.length > 300) db.auditLogs.length = 300;
    if (SupabaseBackend.isSupabaseConfigured()) {
      SupabaseBackend.insertAuditLogRow(entry).catch(() => {});
    }
    return entry;
  }

  function getCounterRollingAvg(db, counterId, fallbackCategoryId = null) {
    if (fallbackCategoryId) {
      return DynamicEtaEngine.getExpectedServiceDuration(db, counterId, fallbackCategoryId);
    }
    return Math.round(DynamicEtaEngine.getHistoricalStats(db, counterId).rollingAvgMin);
  }

  function sortWaitingQueue(tokens) {
    return [...tokens].sort((a, b) => {
      const aPri = a.priorityType && a.priorityType !== 'standard' ? 0 : 1;
      const bPri = b.priorityType && b.priorityType !== 'standard' ? 0 : 1;
      if (aPri !== bPri) return aPri - bPri;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  function getCounterState(db, counterId) {
    const counter = db.counters.find((c) => c.id === counterId);
    const allForCounter = db.tokens.filter((t) => t.counterId === counterId);
    const current = allForCounter.find((t) => SERVING_SLOT_STATUSES.includes(t.status)) || null;
    const waiting = sortWaitingQueue(allForCounter.filter((t) => WAITING_STATUSES.includes(t.status)));
    const bookedAppointments = allForCounter
      .filter((t) => t.status === 'Booked')
      .sort((a, b) => String(a.scheduledTime).localeCompare(String(b.scheduledTime)));
    const skipped = allForCounter
      .filter((t) => t.status === 'Skipped')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const etaCalc = DynamicEtaEngine.computeCounterEta(db, counterId, current, waiting);
    const avgMin = Math.round(etaCalc.stats.rollingAvgMin);
    const capacity = counter ? counter.maxCapacity : 15;
    const loadRatio = capacity > 0 ? waiting.length / capacity : 0;
    let congestion = 'low';
    if (waiting.length >= capacity) congestion = 'full';
    else if (loadRatio >= 0.75) congestion = 'high';
    else if (loadRatio >= 0.4) congestion = 'moderate';

    return {
      counter,
      current,
      waiting,
      bookedAppointments,
      skipped,
      avgMin,
      etaStats: etaCalc.stats,
      remainingCurrentMin: etaCalc.remainingCurrentMin,
      nextTokenEtaMin: etaCalc.nextTokenEtaMin,
      perTokenEta: etaCalc.perToken,
      congestion,
      projectedWaitMin: etaCalc.projectedWaitMin,
    };
  }

  function recalculateCounter(db, counterId, emitAlerts = true, options = {}) {
    const state = getCounterState(db, counterId);
    const counter = state.counter;
    if (!counter) return;

    const centre = db.centres.find((c) => c.id === counter.centreId);
    const centreName = centre ? centre.name : 'Service Centre';
    const skipTokenId = options && options.skipTokenId ? options.skipTokenId : null;

    if (state.current) {
      state.current.position = 0;
      state.current.peopleAhead = 0;
      state.current.etaMin = 0;
      state.current.etaRangeMin = 0;
      state.current.etaRangeMax = 0;
      state.current.etaUpdatedAt = new Date().toISOString();
    }

    state.perTokenEta.forEach((entry) => {
      const token = entry.token;
      const prevPos = token.position;
      const prevEta = token.etaMin;
      const newPos = entry.position;
      const newEta = entry.etaMin;

      token.position = newPos;
      token.peopleAhead = entry.peopleAhead;
      token.waitingAhead = entry.waitingAhead;
      token.etaMin = newEta;
      token.etaRangeMin = entry.etaRangeMin;
      token.etaRangeMax = entry.etaRangeMax;
      token.etaBasis = entry.etaBasis;
      token.etaSampleCount = entry.etaSampleCount;
      token.etaAvgServiceMin = entry.etaAvgServiceMin;
      token.etaUpdatedAt = entry.etaUpdatedAt;
      if (!Array.isArray(token.notifiedThresholds)) token.notifiedThresholds = [];

      // Clear milestone markers if token was moved back behind a threshold (e.g. reschedule or priority insertion)
      if (newPos > 5) token.notifiedThresholds = token.notifiedThresholds.filter((k) => k !== 'five');
      if (newPos > 3) token.notifiedThresholds = token.notifiedThresholds.filter((k) => k !== 'three');
      if (newPos > 2) token.notifiedThresholds = token.notifiedThresholds.filter((k) => k !== 'approaching');
      if (newPos > 1) token.notifiedThresholds = token.notifiedThresholds.filter((k) => k !== 'one');

      // Seed ETA notification baseline if missing
      if (typeof token.lastNotifiedEtaMin !== 'number') {
        token.lastNotifiedEtaMin = typeof prevEta === 'number' && prevEta > 0 ? prevEta : newEta;
      }

      // Automatic promotion to Approaching when within top 2
      if (newPos <= 2 && token.status === 'Waiting') {
        token.status = 'Approaching';
      } else if (newPos > 2 && token.status === 'Approaching') {
        token.status = 'Waiting';
      }

      if (emitAlerts && token.customerId && token.id !== skipTokenId) {
        let milestoneSent = false;

        // Milestone 1: Queue position reaches 5
        if (newPos === 5 && db.settings.notifyAtFive && !token.notifiedThresholds.includes('five')) {
          token.notifiedThresholds.push('five');
          milestoneSent = true;
          NotificationService.push(db, {
            userId: token.customerId,
            tokenId: token.id,
            type: 'threshold_5',
            title: `Queue Position #5 — ${token.tokenNumber}`,
            message: `Your queue position reached #5 (${entry.peopleAhead} ahead) at ${centreName} (${counter.number}). Est. wait ~${newEta} min (approx., not guaranteed).`,
          });
        }

        // Milestone 2: Queue position reaches 3
        if (newPos === 3 && db.settings.notifyAtThree && !token.notifiedThresholds.includes('three')) {
          token.notifiedThresholds.push('three');
          milestoneSent = true;
          NotificationService.push(db, {
            userId: token.customerId,
            tokenId: token.id,
            type: 'threshold_3',
            title: `Queue Position #3 — ${token.tokenNumber}`,
            message: `Your queue position reached #3 (${entry.peopleAhead} ahead) at ${centreName} (${counter.number}). Est. wait ~${newEta} min (approx.).`,
          });
        }

        // Milestone 3: Queue position reaches 1 (You're Next)
        if (newPos === 1 && db.settings.notifyAtOne !== false && !token.notifiedThresholds.includes('one')) {
          token.notifiedThresholds.push('one');
          milestoneSent = true;
          NotificationService.push(db, {
            userId: token.customerId,
            tokenId: token.id,
            type: 'threshold_1',
            urgent: true,
            title: `You're Next (Position #1) — ${token.tokenNumber}`,
            message: `You are now #1 in line at ${centreName} (${counter.number}). Please move near the counter — est. wait ~${newEta} min (approx.).`,
          });
        } else if (
          newPos === 2 &&
          db.settings.notifyApproaching &&
          !token.notifiedThresholds.includes('approaching')
        ) {
          token.notifiedThresholds.push('approaching');
          milestoneSent = true;
          NotificationService.push(db, {
            userId: token.customerId,
            tokenId: token.id,
            type: 'approaching',
            title: `Turn Approaching (Position #2) — ${token.tokenNumber}`,
            message: `You are #2 in queue (${entry.peopleAhead} ahead) at ${centreName} (${counter.number}). Est. wait ~${newEta} min (approx.).`,
          });
        }

        // Significant ETA change check (independent of position changes so major wait shifts are never missed)
        const baselineEta = token.lastNotifiedEtaMin;
        if (db.settings.notifyEtaChange !== false && typeof baselineEta === 'number' && baselineEta > 0) {
          const delta = newEta - baselineEta;
          const absDelta = Math.abs(delta);
          const pctDelta = absDelta / Math.max(1, baselineEta);
          const isSignificant = absDelta >= 3 || (absDelta >= 2 && pctDelta >= 0.25);

          if (isSignificant) {
            // Avoid double-alerting on the exact same tick if a milestone alert already communicated a normal 1-step decrease,
            // EXCEPT when wait time increased or shifted sharply (>= 5 min).
            if (!milestoneSent || delta > 0 || absDelta >= 5) {
              const directionTitle =
                delta > 0
                  ? `Wait Time Increased (+${delta} min) — ${token.tokenNumber}`
                  : `Wait Time Shortened (${delta} min) — ${token.tokenNumber}`;
              const directionVerb = delta > 0 ? 'increased' : 'decreased';
              NotificationService.push(db, {
                userId: token.customerId,
                tokenId: token.id,
                type: 'eta',
                title: directionTitle,
                message: `Your estimated wait at ${counter.number} (${centreName}) ${directionVerb} from ~${baselineEta} min to ~${newEta} min (estimate, not guaranteed).`,
              });
            }
            token.lastNotifiedEtaMin = newEta;
          } else if (milestoneSent) {
            token.lastNotifiedEtaMin = newEta;
          }
        }
      }
    });
  }

  function recalculateAll(db, emitAlerts = false) {
    for (const c of db.counters) {
      recalculateCounter(db, c.id, emitAlerts);
    }
  }

  function analyzeCounters(db, opts = {}) {
    return CounterRecommendationEngine.analyzeCounters(db, opts);
  }

  function recommendCounter(db, centreId, categoryId) {
    const analysis = CounterRecommendationEngine.analyzeCounters(db, {
      centreId: centreId || null,
      categoryId: categoryId || null,
    });
    if (!analysis.recommended) return null;
    return {
      ...analysis.recommended,
      analysis,
    };
  }

  function predictCrowdForHour(db, centreId, hour) {
    const rows = db.serviceHistory.filter((h) => h.centreId === centreId && h.hourOfDay === hour);
    const totalForCentre = db.serviceHistory.filter((h) => h.centreId === centreId).length;
    if (totalForCentre === 0) return { level: 'low', label: 'Low (limited history)', count: 0 };
    const ratio = rows.length / Math.max(1, totalForCentre);
    if (ratio >= 0.25 || rows.length >= 4) return { level: 'high', label: 'Peak Hour (High)', count: rows.length };
    if (ratio >= 0.12 || rows.length >= 2) return { level: 'moderate', label: 'Moderate Traffic', count: rows.length };
    return { level: 'low', label: 'Quiet Slot (Low)', count: rows.length };
  }

  async function generateTokenNumber(db, categoryId) {
    const cat = db.categories.find((c) => c.id === categoryId);
    const code = (cat && cat.code ? cat.code : 'Q').toUpperCase();
    const res = await SupabaseBackend.generateNextTokenNumber(code);
    if (!res.ok || !res.data) {
      return { ok: false, error: res.error || 'Failed to allocate next token number from Supabase.' };
    }
    return { ok: true, tokenNumber: res.data };
  }

  async function syncCounterToSupabase(db, counterId) {
    const waitingTokens = db.tokens.filter(
      (t) => t.counterId === counterId && WAITING_STATUSES.includes(t.status) && !t.isRedactedPublic
    );
    if (waitingTokens.length > 0) {
      await SupabaseBackend.syncCounterTokensPositions(waitingTokens).catch(() => {});
    }
  }

  async function bookToken(db, payload, actor) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const {
      customerId,
      customerName,
      customerPhone,
      isGuest,
      centreId,
      categoryId,
      counterId,
      bookingType,
      scheduledTime,
      priorityType,
      priorityReason,
    } = payload;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(customerId || ''));
    if (!isUuid) {
      return { ok: false, error: 'Please sign in with your SmartQ account to book a live queue token.' };
    }

    const cleanName = String(customerName || '').trim();
    const normPhone = Utils.normalizePhone(customerPhone);
    if (cleanName.length < 2) return { ok: false, error: 'Please enter a valid full name (at least 2 characters).' };
    if (normPhone.length < 10) return { ok: false, error: 'Please enter a valid 10-digit mobile number.' };

    const centre = db.centres.find((c) => c.id === centreId && c.isActive);
    if (!centre) return { ok: false, error: 'Selected business or service centre is not available.' };
    if (!centre.isOnboarded) {
      return {
        ok: false,
        error: `${centre.name} is currently a directory listing and is not yet onboarded for live SmartQ bookings.`,
      };
    }
    if (centre.bookingEnabled === false) {
      return {
        ok: false,
        error: `Live token booking is currently paused for ${centre.name}.`,
      };
    }

    const category = db.categories.find((c) => c.id === categoryId && c.active);
    if (!category) return { ok: false, error: 'Selected service is inactive.' };

    const counter = db.counters.find((c) => c.id === counterId && c.centreId === centreId);
    if (!counter) return { ok: false, error: 'Selected counter was not found.' };
    if (!CounterRecommendationEngine.supportsCategory(counter, categoryId)) {
      return { ok: false, error: `${counter.number} does not handle ${category.name}. Please choose a supported counter.` };
    }
    if (counter.status === 'closed') return { ok: false, error: `${counter.number} is currently closed.` };
    if (counter.status === 'paused' && bookingType === 'immediate') {
      return {
        ok: false,
        error: `${counter.number} is temporarily paused (${counter.pauseReason || 'Operational break'}). Choose another counter or an appointment slot.`,
      };
    }

    // Duplicate active booking prevention for the same service
    const existingDuplicate = db.tokens.find(
      (t) =>
        ACTIVE_STATUSES.includes(t.status) &&
        t.categoryId === categoryId &&
        ((customerId && t.customerId === customerId) || (t.customerPhone && Utils.normalizePhone(t.customerPhone) === normPhone))
    );
    if (existingDuplicate) {
      return {
        ok: false,
        error: `Duplicate booking blocked: You already have active token ${existingDuplicate.tokenNumber} (${existingDuplicate.status}) for ${category.name}.`,
        existingTokenId: existingDuplicate.id,
      };
    }

    // Queue capacity enforcement
    const counterState = getCounterState(db, counterId);
    if (bookingType === 'immediate' && counterState.waiting.length >= counter.maxCapacity) {
      return {
        ok: false,
        error: `${counter.number} has reached its queue capacity (${counter.maxCapacity}). Please pick another counter or book a scheduled slot.`,
      };
    }

    // Priority rule validation
    let finalPriority = 'standard';
    let finalPriorityReason = '';
    if (priorityType && priorityType !== 'standard') {
      const allowed = db.settings.priorityRules && db.settings.priorityRules[priorityType];
      if (!allowed) {
        return { ok: false, error: `Priority category "${priorityType}" is not enabled by administrator policy.` };
      }
      if (db.settings.priorityRules.requireReason && !String(priorityReason || '').trim()) {
        return { ok: false, error: 'Please provide an eligibility note for priority queue handling.' };
      }
      finalPriority = priorityType;
      finalPriorityReason = String(priorityReason || '').trim();
    }

    if (bookingType === 'appointment' && !scheduledTime) {
      return { ok: false, error: 'Please select an available appointment time slot.' };
    }

    const numRes = await generateTokenNumber(db, categoryId);
    if (!numRes.ok) return numRes;

    const tokenNumber = numRes.tokenNumber;
    const nowIso = new Date().toISOString();
    const initialStatus = bookingType === 'appointment' ? 'Booked' : 'Waiting';

    const token = {
      id: Utils.uid('TKN'),
      tokenNumber,
      customerId,
      customerName: cleanName,
      customerPhone: normPhone,
      isGuest: Boolean(isGuest),
      centreId,
      categoryId,
      counterId,
      bookingType: bookingType === 'appointment' ? 'appointment' : 'immediate',
      scheduledTime: bookingType === 'appointment' ? scheduledTime : '',
      createdAt: nowIso,
      calledAt: null,
      arrivedAt: null,
      servingStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelReason: '',
      position: 0,
      etaMin: counterState.projectedWaitMin || counter.avgDurationMin,
      status: initialStatus,
      priorityType: finalPriority,
      priorityApprovedBy: finalPriority !== 'standard' ? 'Policy Rule (Pending Desk Check)' : '',
      priorityReason: finalPriorityReason,
      notes: '',
      lastNotifiedEtaMin: null,
      notifiedThresholds: ['booked'],
    };

    db.tokens.push(token);
    recalculateCounter(db, counterId, false, { skipTokenId: token.id });
    token.lastNotifiedEtaMin = token.etaMin;

    const saveRes = await SupabaseBackend.insertQueueToken(token);
    if (!saveRes.ok) {
      // Revert local state on DB error — never pretend booking succeeded
      db.tokens = db.tokens.filter((t) => t.id !== token.id);
      recalculateCounter(db, counterId, false);
      return { ok: false, error: saveRes.error || 'Failed to save booking in Supabase.' };
    }

    // Now emit milestone alerts & sync positions
    recalculateCounter(db, counterId, true, { skipTokenId: token.id });

    NotificationService.push(db, {
      userId: token.customerId,
      tokenId: token.id,
      type: 'booking',
      title: `Booking Confirmed — ${token.tokenNumber}`,
      message:
        token.bookingType === 'appointment'
          ? `Scheduled for ${token.scheduledTime} at ${centre.name} (${counter.number}).`
          : `Joined queue at ${centre.name} (${counter.number}). Position #${token.position}, approx. wait ~${token.etaMin} min (estimate).`,
    });

    if (token.bookingType === 'immediate' && token.customerId) {
      if (token.position === 5 && db.settings.notifyAtFive && !token.notifiedThresholds.includes('five')) {
        token.notifiedThresholds.push('five');
        NotificationService.push(db, {
          userId: token.customerId,
          tokenId: token.id,
          type: 'threshold_5',
          title: `Queue Position #5 — ${token.tokenNumber}`,
          message: `You entered the queue at Position #5 (${token.peopleAhead} ahead) at ${centre.name} (${counter.number}). Est. wait ~${token.etaMin} min (approx.).`,
        });
      } else if (token.position === 3 && db.settings.notifyAtThree && !token.notifiedThresholds.includes('three')) {
        token.notifiedThresholds.push('three');
        NotificationService.push(db, {
          userId: token.customerId,
          tokenId: token.id,
          type: 'threshold_3',
          title: `Queue Position #3 — ${token.tokenNumber}`,
          message: `You entered the queue at Position #3 (${token.peopleAhead} ahead) at ${centre.name} (${counter.number}). Est. wait ~${token.etaMin} min (approx.).`,
        });
      } else if (token.position === 1 && db.settings.notifyAtOne !== false && !token.notifiedThresholds.includes('one')) {
        token.notifiedThresholds.push('one');
        NotificationService.push(db, {
          userId: token.customerId,
          tokenId: token.id,
          type: 'threshold_1',
          urgent: true,
          title: `You're Next (Position #1) — ${token.tokenNumber}`,
          message: `You are #1 in line at ${centre.name} (${counter.number}). Please stay close to the counter — est. wait ~${token.etaMin} min (approx.).`,
        });
      }
    }

    await SupabaseBackend.updateQueueToken(token).catch(() => {});
    await syncCounterToSupabase(db, counterId);

    addAudit(
      db,
      actor || { id: token.customerId, name: cleanName, role: 'customer' },
      finalPriority !== 'standard' ? 'PRIORITY_TOKEN_BOOKED' : 'TOKEN_BOOKED',
      'token',
      token.id,
      `Booked ${token.tokenNumber} at ${counter.number} (${category.name})${
        finalPriority !== 'standard' ? ` [Priority: ${finalPriority} — ${finalPriorityReason}]` : ''
      }.`
    );

    return { ok: true, token };
  }

  async function checkInAppointment(db, tokenId, actor) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token || token.status !== 'Booked') {
      return { ok: false, error: 'Only scheduled (Booked) tokens can check in to the live queue.' };
    }
    const counter = db.counters.find((c) => c.id === token.counterId);
    if (!counter || counter.status !== 'open') {
      return { ok: false, error: 'Assigned counter is not currently open for check-in.' };
    }
    const centre = db.centres.find((c) => c.id === token.centreId);
    const prevSnapshot = { ...token };

    token.status = 'Waiting';
    token.createdAt = new Date().toISOString();
    recalculateCounter(db, token.counterId, false, { skipTokenId: token.id });
    token.lastNotifiedEtaMin = token.etaMin;

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      recalculateCounter(db, token.counterId, false);
      return { ok: false, error: updRes.error || 'Failed to check in appointment.' };
    }

    recalculateCounter(db, token.counterId, true, { skipTokenId: token.id });
    await syncCounterToSupabase(db, token.counterId);

    NotificationService.push(db, {
      userId: token.customerId,
      tokenId: token.id,
      type: 'booking',
      title: `Appointment Checked In — ${token.tokenNumber}`,
      message: `You are now in the live queue at ${centre ? centre.name : 'the centre'} (${counter.number}) at Position #${token.position} (~${token.etaMin} min approx.).`,
    });
    addAudit(db, actor, 'APPOINTMENT_CHECKIN', 'token', token.id, `Checked in ${token.tokenNumber} to ${counter.number}.`);
    return { ok: true, token };
  }

  async function callNextToken(db, counterId, actor, options = {}) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const counter = db.counters.find((c) => c.id === counterId);
    if (!counter) return { ok: false, error: 'Counter not found.' };
    if (counter.status === 'paused') return { ok: false, error: `${counter.number} is paused. Resume before calling next.` };
    if (counter.status === 'closed') return { ok: false, error: `${counter.number} is closed.` };

    const state = getCounterState(db, counterId);
    if (state.current) {
      return {
        ok: false,
        error: `Token ${state.current.tokenNumber} is currently ${state.current.status}. Complete, skip, or mark no-show first.`,
      };
    }

    const next = state.waiting[0];
    if (!next) return { ok: false, error: 'No waiting customers in this counter queue.' };

    const prevSnapshot = { ...next };
    next.status = 'Called';
    next.calledAt = new Date().toISOString();
    next.recallCount = 0;
    next.position = 0;
    next.etaMin = 0;

    const updRes = await SupabaseBackend.updateQueueToken(next);
    if (!updRes.ok) {
      Object.assign(next, prevSnapshot);
      return { ok: false, error: updRes.error || 'Failed to call next token in Supabase.' };
    }

    recalculateCounter(db, counterId, true);
    await syncCounterToSupabase(db, counterId);

    const centre = db.centres.find((c) => c.id === counter.centreId);
    const recoveredNote =
      options && options.autoRecoveredFrom
        ? ` Queue moved forward automatically after ${options.autoRecoveredFrom} was unclaimed.`
        : '';
    NotificationService.push(db, {
      userId: next.customerId,
      tokenId: next.id,
      type: 'called',
      urgent: true,
      title: `Now Calling — ${next.tokenNumber}`,
      message: `Please proceed immediately to ${counter.number} at ${centre ? centre.name : 'the centre'}.${recoveredNote}`,
    });

    addAudit(
      db,
      actor,
      options && options.autoRecoveredFrom ? 'TOKEN_AUTO_CALLED' : 'TOKEN_CALLED',
      'token',
      next.id,
      `Called ${next.tokenNumber} at ${counter.number}${
        options && options.autoRecoveredFrom ? ` (auto-recovery after ${options.autoRecoveredFrom} No-Show)` : ''
      }.`
    );

    if (db.settings.voiceAnnouncements) {
      NotificationService.announceVoice(next.tokenNumber, counter.number, db.settings.language);
    }

    return { ok: true, token: next };
  }

  async function recallToken(db, tokenId, actor) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token) return { ok: false, error: 'Token not found.' };
    const counter = db.counters.find((c) => c.id === token.counterId);
    if (!counter || counter.status !== 'open') return { ok: false, error: 'Counter must be open to recall a token.' };

    const state = getCounterState(db, token.counterId);
    if (state.current && state.current.id !== token.id) {
      return { ok: false, error: `Finish or skip current token ${state.current.tokenNumber} before recalling ${token.tokenNumber}.` };
    }

    if (!['Skipped', 'Called'].includes(token.status)) {
      return { ok: false, error: 'Only Skipped or Called tokens can be recalled.' };
    }

    const prevSnapshot = { ...token };
    token.status = 'Called';
    token.calledAt = new Date().toISOString();
    token.recallCount = (token.recallCount || 0) + 1;

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      return { ok: false, error: updRes.error || 'Failed to recall token in Supabase.' };
    }

    recalculateCounter(db, token.counterId, true);
    await syncCounterToSupabase(db, token.counterId);

    const graceTxt = formatGraceDuration(db.settings.noShowGraceSec || 180);
    NotificationService.push(db, {
      userId: token.customerId,
      tokenId: token.id,
      type: 'called',
      urgent: true,
      title: `Recall Alert #${token.recallCount} — ${token.tokenNumber}`,
      message: `Your token ${token.tokenNumber} has been recalled at ${counter.number}. Please report within ${graceTxt} to avoid No-Show.`,
    });

    addAudit(
      db,
      actor,
      'TOKEN_RECALLED',
      'token',
      token.id,
      `Recalled ${token.tokenNumber} at ${counter.number} (recall #${token.recallCount}; grace timer reset to ${graceTxt}).`
    );

    if (db.settings.voiceAnnouncements) {
      NotificationService.announceVoice(token.tokenNumber, counter.number, db.settings.language);
    }

    return { ok: true, token };
  }

  async function markArrived(db, tokenId, actor) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token || token.status !== 'Called') return { ok: false, error: 'Only Called tokens can be marked arrived.' };
    const prevSnapshot = { ...token };
    token.status = 'Arrived';
    token.arrivedAt = new Date().toISOString();

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      return { ok: false, error: updRes.error || 'Failed to mark token arrived in Supabase.' };
    }

    recalculateCounter(db, token.counterId, false);
    addAudit(db, actor, 'TOKEN_ARRIVED', 'token', token.id, `Marked ${token.tokenNumber} as arrived.`);
    return { ok: true, token };
  }

  async function startService(db, tokenId, actor) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token || !['Called', 'Arrived'].includes(token.status)) {
      return { ok: false, error: 'Token must be Called or Arrived to start service.' };
    }
    const prevSnapshot = { ...token };
    token.status = 'Serving';
    if (!token.arrivedAt) token.arrivedAt = new Date().toISOString();
    token.servingStartedAt = new Date().toISOString();

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      return { ok: false, error: updRes.error || 'Failed to start service in Supabase.' };
    }

    recalculateCounter(db, token.counterId, false);
    addAudit(db, actor, 'TOKEN_SERVING', 'token', token.id, `Started serving ${token.tokenNumber}.`);
    return { ok: true, token };
  }

  async function completeService(db, tokenId, actor, notes = '', recordedDurationMin = null) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token || !['Called', 'Arrived', 'Serving'].includes(token.status)) {
      return { ok: false, error: 'Only active serving/called tokens can be completed.' };
    }

    const prevSnapshot = { ...token };
    const nowIso = new Date().toISOString();
    const nowMs = Date.now();
    const createdMs = new Date(token.createdAt).getTime();
    const startMs = token.servingStartedAt
      ? new Date(token.servingStartedAt).getTime()
      : new Date(token.calledAt || token.createdAt).getTime();

    const waitMin = Math.max(1, Math.round((startMs - createdMs) / 60000));
    const measuredMin = Math.max(1, Math.round((nowMs - startMs) / 60000));
    const parsedOverride = Number(recordedDurationMin);
    const serviceMin =
      Number.isFinite(parsedOverride) && parsedOverride >= 1 && parsedOverride <= 180
        ? Math.round(parsedOverride)
        : measuredMin;

    token.status = 'Completed';
    token.completedAt = nowIso;
    token.actualServiceDurationMin = serviceMin;
    if (notes !== undefined && notes !== null && String(notes).trim()) {
      token.notes = String(notes).trim();
    }

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      return { ok: false, error: updRes.error || 'Failed to complete service in Supabase.' };
    }

    const histEntry = {
      id: Utils.uid('HIS'),
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
      centreId: token.centreId,
      counterId: token.counterId,
      categoryId: token.categoryId,
      operatorId: actor ? actor.id : '',
      fromStatus: prevSnapshot.status,
      toStatus: 'Completed',
      waitDurationMin: waitMin,
      serviceDurationMin: serviceMin,
      hourOfDay: new Date(nowMs).getHours(),
      dateStr: Utils.todayStr(),
      outcome: 'Completed',
      notes: token.notes || '',
      createdAt: nowIso,
    };
    db.serviceHistory.unshift(histEntry);
    await SupabaseBackend.insertStatusHistoryRow(histEntry).catch(() => {});

    // Update counter historical average first, persist to Supabase, then recalculate remaining queue ETAs
    DynamicEtaEngine.recordActualDuration(db, token.counterId, serviceMin);
    const updatedCounter = db.counters.find((c) => c.id === token.counterId);
    if (updatedCounter) {
      await SupabaseBackend.updateCounterAvgDurationInDb(token.counterId, updatedCounter.avgDurationMin).catch(() => {});
    }
    recalculateCounter(db, token.counterId, true);
    await syncCounterToSupabase(db, token.counterId);

    NotificationService.push(db, {
      userId: token.customerId,
      tokenId: token.id,
      type: 'completed',
      title: `Service Completed — ${token.tokenNumber}`,
      message: `Thank you for visiting SmartQ. Your service for token ${token.tokenNumber} is complete (${serviceMin} min).`,
    });

    addAudit(
      db,
      actor,
      'TOKEN_COMPLETED',
      'token',
      token.id,
      `Completed ${token.tokenNumber} (actual duration: ${serviceMin} min; counter ETA updated).`
    );
    return { ok: true, token, actualServiceDurationMin: serviceMin };
  }

  async function skipToken(db, tokenId, actor) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token || !['Called', 'Arrived', 'Waiting', 'Approaching'].includes(token.status)) {
      return { ok: false, error: 'This token cannot be skipped in its current state.' };
    }
    const prevSnapshot = { ...token };
    token.status = 'Skipped';

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      return { ok: false, error: updRes.error || 'Failed to skip token in Supabase.' };
    }

    recalculateCounter(db, token.counterId, true);
    await syncCounterToSupabase(db, token.counterId);

    NotificationService.push(db, {
      userId: token.customerId,
      tokenId: token.id,
      type: 'skipped',
      title: `Token Skipped — ${token.tokenNumber}`,
      message: `You missed your call for ${token.tokenNumber}. Please contact the counter desk for recall.`,
    });

    addAudit(db, actor, 'TOKEN_SKIPPED', 'token', token.id, `Skipped token ${token.tokenNumber}.`);
    return { ok: true, token };
  }

  function formatGraceDuration(seconds) {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  }

  function getGraceStatus(db, token, nowMs = Date.now()) {
    const graceSec = Math.max(15, Number(db.settings && db.settings.noShowGraceSec) || 180);
    if (!token || token.status !== 'Called' || !token.calledAt) {
      return { active: false, graceSec, elapsedSec: 0, remainingSec: graceSec, expired: false, formattedRemaining: '' };
    }
    const calledMs = new Date(token.calledAt).getTime();
    const elapsedSec = Math.max(0, Math.floor((nowMs - calledMs) / 1000));
    const remainingSec = Math.max(0, graceSec - elapsedSec);
    const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
    const ss = String(remainingSec % 60).padStart(2, '0');
    return {
      active: true,
      graceSec,
      elapsedSec,
      remainingSec,
      expired: elapsedSec >= graceSec,
      formattedRemaining: `${mm}:${ss}`,
    };
  }

  async function markNoShow(db, tokenId, actor, options = {}) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token) return { ok: false, error: 'Token not found.' };

    if (token.status === 'No-show') {
      return { ok: false, error: `Token ${token.tokenNumber} is already marked No-Show.` };
    }
    if (['Completed', 'Cancelled', 'Serving', 'Arrived'].includes(token.status)) {
      return {
        ok: false,
        error: `Cannot mark ${token.tokenNumber} as No-Show while its status is ${token.status}.`,
      };
    }
    if (!['Called', 'Skipped'].includes(token.status)) {
      return { ok: false, error: 'Only Called or Skipped tokens can be marked No-Show.' };
    }

    const prevSnapshot = { ...token };
    const nowIso = new Date().toISOString();
    const mode = options && options.mode === 'automatic' ? 'automatic' : 'manual';
    const graceSec = Math.max(15, Number(db.settings && db.settings.noShowGraceSec) || 180);
    const defaultReason =
      mode === 'automatic'
        ? `Unclaimed after ${formatGraceDuration(graceSec)} grace period`
        : 'Customer did not report after call';
    const cleanReason = String((options && options.reason) || defaultReason).trim();

    const counter = db.counters.find((c) => c.id === token.counterId);
    const centre = db.centres.find((c) => c.id === token.centreId);
    const counterNumber = counter ? counter.number : token.counterId;
    const centreName = centre ? centre.name : 'Service Centre';

    token.status = 'No-show';
    token.noShowAt = nowIso;
    token.cancelledAt = nowIso;
    token.noShowReason = cleanReason;
    token.noShowMode = mode;
    token.position = 0;
    token.peopleAhead = 0;
    token.etaMin = 0;

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      return { ok: false, error: updRes.error || 'Failed to mark token as No-Show in Supabase.' };
    }

    if (!Array.isArray(db.noShowHistory)) db.noShowHistory = [];
    const historyEntry = {
      id: Utils.uid('NSH'),
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
      customerId: token.customerId,
      customerName: token.customerName,
      centreId: token.centreId,
      counterId: token.counterId,
      counterNumber,
      calledAt: token.calledAt || token.createdAt,
      timestamp: nowIso,
      reason: cleanReason,
      mode,
      actorName: actor ? actor.name : 'Auto-Recovery Engine',
      restored: false,
      restoredAt: null,
      restoredBy: '',
      restoreReason: '',
    };
    db.noShowHistory.unshift(historyEntry);
    if (db.noShowHistory.length > 300) db.noShowHistory.length = 300;
    await SupabaseBackend.insertNoShowHistoryRow(historyEntry).catch(() => {});

    // Avoid duplicate No-show entries in serviceHistory for the same token
    db.serviceHistory = db.serviceHistory.filter((h) => !(h.tokenId === token.id && h.outcome === 'No-show'));
    await SupabaseBackend.deleteNoShowHistoryOutcome(token.id).catch(() => {});

    const statusHistEntry = {
      id: Utils.uid('HIS'),
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
      centreId: token.centreId,
      counterId: token.counterId,
      categoryId: token.categoryId,
      operatorId: actor ? actor.id : '',
      fromStatus: prevSnapshot.status,
      toStatus: 'No-show',
      waitDurationMin: Math.max(1, Math.round((Date.now() - new Date(token.createdAt).getTime()) / 60000)),
      serviceDurationMin: 0,
      hourOfDay: new Date().getHours(),
      dateStr: Utils.todayStr(),
      outcome: 'No-show',
      notes: cleanReason,
      createdAt: nowIso,
    };
    db.serviceHistory.unshift(statusHistEntry);
    await SupabaseBackend.insertStatusHistoryRow(statusHistEntry).catch(() => {});

    NotificationService.push(db, {
      userId: token.customerId,
      tokenId: token.id,
      type: 'noshow',
      urgent: true,
      title: `Marked No-Show — ${token.tokenNumber}`,
      message: `Your token ${token.tokenNumber} at ${counterNumber} (${centreName}) was marked No-Show (${cleanReason}). Contact an administrator if this was a mistake.`,
    });

    recalculateCounter(db, token.counterId, true);
    await syncCounterToSupabase(db, token.counterId);

    addAudit(
      db,
      actor || { id: 'SYSTEM', name: 'Auto-Recovery Engine', role: 'system' },
      mode === 'automatic' ? 'TOKEN_NOSHOW_AUTO' : 'TOKEN_NOSHOW',
      'token',
      token.id,
      `Marked ${token.tokenNumber} at ${counterNumber} as No-Show (${mode}: ${cleanReason}).`
    );

    const shouldAutoAdvance =
      options && typeof options.autoAdvance === 'boolean'
        ? options.autoAdvance
        : Boolean(db.settings && db.settings.autoAdvanceOnNoShow !== false);
    let autoCalledToken = null;
    if (shouldAutoAdvance && counter && counter.status === 'open') {
      const postState = getCounterState(db, token.counterId);
      if (!postState.current && postState.waiting.length > 0) {
        const callRes = await callNextToken(
          db,
          token.counterId,
          actor || { id: 'SYSTEM', name: 'Auto-Recovery Engine', role: 'system' },
          { autoRecoveredFrom: token.tokenNumber }
        );
        if (callRes.ok) autoCalledToken = callRes.token;
      }
    }

    return { ok: true, token, historyEntry, autoCalledToken };
  }

  async function processAutomaticNoShows(db, nowMs = Date.now(), actor = null) {
    if (!SupabaseBackend.isSupabaseConfigured()) return { processed: [], count: 0 };
    if (!db || !db.settings || db.settings.autoNoShowEnabled === false) {
      return { processed: [], count: 0 };
    }
    // Only authenticated admins or operators assigned to the counter may trigger automatic No-Show mutations
    if (!actor || (actor.role !== 'admin' && actor.role !== 'operator')) {
      return { processed: [], count: 0 };
    }

    const graceSec = Math.max(15, Number(db.settings.noShowGraceSec) || 180);
    const processed = [];

    for (const counter of db.counters || []) {
      if (counter.status !== 'open') continue;
      if (
        actor.role === 'operator' &&
        counter.operatorId !== actor.id &&
        actor.assignedCounterId !== counter.id
      ) {
        continue;
      }
      const calledTokens = (db.tokens || []).filter(
        (t) => t.counterId === counter.id && t.status === 'Called' && t.calledAt && !t.isRedactedPublic
      );
      for (const tok of calledTokens) {
        if (tok.status !== 'Called') continue;
        const status = getGraceStatus(db, tok, nowMs);
        if (!status.expired) continue;

        const res = await markNoShow(
          db,
          tok.id,
          actor,
          {
            mode: 'automatic',
            reason: `Unclaimed after ${formatGraceDuration(graceSec)} grace period`,
            autoAdvance: db.settings.autoAdvanceOnNoShow !== false,
          }
        );
        if (res.ok) {
          processed.push({
            counterNumber: counter.number,
            tokenNumber: tok.tokenNumber,
            autoCalledNumber: res.autoCalledToken ? res.autoCalledToken.tokenNumber : null,
          });
        }
      }
    }

    return { processed, count: processed.length };
  }

  async function restoreToken(db, tokenId, actor, reason = 'Restored by administrator') {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    if (!actor || actor.role !== 'admin') {
      return { ok: false, error: 'Only administrators can restore a Skipped or No-Show token.' };
    }
    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token) return { ok: false, error: 'Token not found.' };
    if (!['No-show', 'Skipped'].includes(token.status)) {
      return { ok: false, error: `Only Skipped or No-Show tokens can be restored (current status: ${token.status}).` };
    }

    const counter = db.counters.find((c) => c.id === token.counterId);
    if (!counter || counter.status === 'closed') {
      return { ok: false, error: 'Assigned counter is closed. Reopen or reassign before restoring.' };
    }

    const duplicateActive = db.tokens.find(
      (t) =>
        t.id !== token.id &&
        ACTIVE_STATUSES.includes(t.status) &&
        t.categoryId === token.categoryId &&
        ((token.customerId && t.customerId === token.customerId) ||
          (token.customerPhone && Utils.normalizePhone(t.customerPhone) === Utils.normalizePhone(token.customerPhone)))
    );
    if (duplicateActive) {
      return {
        ok: false,
        error: `Customer already has active token ${duplicateActive.tokenNumber} for this service.`,
      };
    }

    const prevSnapshot = { ...token };
    const prevStatus = token.status;
    const nowIso = new Date().toISOString();
    const cleanReason = String(reason || 'Restored by administrator').trim();
    const centre = db.centres.find((c) => c.id === token.centreId);
    const centreName = centre ? centre.name : 'Service Centre';

    token.status = 'Waiting';
    token.cancelledAt = null;
    token.noShowAt = null;
    token.noShowReason = '';
    token.restoredAt = nowIso;
    token.restoredBy = actor.name;
    token.restoreReason = cleanReason;
    token.notifiedThresholds = ['booked'];

    recalculateCounter(db, token.counterId, false, { skipTokenId: token.id });
    token.lastNotifiedEtaMin = token.etaMin;

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      recalculateCounter(db, token.counterId, false);
      return { ok: false, error: updRes.error || 'Failed to restore token in Supabase.' };
    }

    if (Array.isArray(db.noShowHistory)) {
      const histItem = db.noShowHistory.find((h) => h.tokenId === token.id && !h.restored);
      if (histItem) {
        histItem.restored = true;
        histItem.restoredAt = nowIso;
        histItem.restoredBy = actor.name;
        histItem.restoreReason = cleanReason;
      }
    }
    await SupabaseBackend.markNoShowRestoredInDb(token.id, actor.name, cleanReason).catch(() => {});

    db.serviceHistory = db.serviceHistory.filter((h) => !(h.tokenId === token.id && h.outcome === 'No-show'));
    await SupabaseBackend.deleteNoShowHistoryOutcome(token.id).catch(() => {});

    recalculateCounter(db, token.counterId, true, { skipTokenId: token.id });
    await syncCounterToSupabase(db, token.counterId);

    NotificationService.push(db, {
      userId: token.customerId,
      tokenId: token.id,
      type: 'restored',
      urgent: true,
      title: `Token Restored — ${token.tokenNumber}`,
      message: `An administrator restored your ${prevStatus} token ${token.tokenNumber} to ${counter.number} (${centreName}). Current Position #${token.position}, est. wait ~${token.etaMin} min (approx.).`,
    });

    addAudit(
      db,
      actor,
      'TOKEN_RESTORED',
      'token',
      token.id,
      `Restored ${prevStatus} token ${token.tokenNumber} to ${counter.number} (Position #${token.position}; reason: ${cleanReason}).`
    );
    return { ok: true, token };
  }

  async function cancelToken(db, tokenId, actor, reason = 'Cancelled by customer') {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token) return { ok: false, error: 'Token not found.' };
    if (['Completed', 'Cancelled', 'No-show', 'Serving'].includes(token.status)) {
      return { ok: false, error: `Cannot cancel token when status is ${token.status}.` };
    }

    const prevSnapshot = { ...token };
    const nowIso = new Date().toISOString();
    token.status = 'Cancelled';
    token.cancelledAt = nowIso;
    token.cancelReason = String(reason || 'Cancelled').trim();
    token.position = 0;
    token.etaMin = 0;

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      return { ok: false, error: updRes.error || 'Failed to cancel token in Supabase.' };
    }

    const histEntry = {
      id: Utils.uid('HIS'),
      tokenId: token.id,
      tokenNumber: token.tokenNumber,
      centreId: token.centreId,
      counterId: token.counterId,
      categoryId: token.categoryId,
      operatorId: actor ? actor.id : '',
      fromStatus: prevSnapshot.status,
      toStatus: 'Cancelled',
      waitDurationMin: 0,
      serviceDurationMin: 0,
      hourOfDay: new Date().getHours(),
      dateStr: Utils.todayStr(),
      outcome: 'Cancelled',
      notes: token.cancelReason,
      createdAt: nowIso,
    };
    db.serviceHistory.unshift(histEntry);
    await SupabaseBackend.insertStatusHistoryRow(histEntry).catch(() => {});

    recalculateCounter(db, token.counterId, true);
    await syncCounterToSupabase(db, token.counterId);

    NotificationService.push(db, {
      userId: token.customerId,
      tokenId: token.id,
      type: 'cancelled',
      title: `Token Cancelled — ${token.tokenNumber}`,
      message: `Your booking ${token.tokenNumber} was cancelled. Reason: ${token.cancelReason}.`,
    });

    addAudit(db, actor, 'TOKEN_CANCELLED', 'token', token.id, `Cancelled ${token.tokenNumber} (${token.cancelReason}).`);
    return { ok: true, token };
  }

  async function rescheduleToken(db, tokenId, { counterId, bookingType, scheduledTime }, actor) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token) return { ok: false, error: 'Token not found.' };
    if (!['Booked', 'Waiting', 'Approaching'].includes(token.status)) {
      return { ok: false, error: 'Tokens can only be rescheduled before being called or served.' };
    }

    const oldCounterId = token.counterId;
    const oldCounter = db.counters.find((c) => c.id === oldCounterId);
    const newCounter = db.counters.find((c) => c.id === (counterId || oldCounterId));
    if (!newCounter || newCounter.status === 'closed') {
      return { ok: false, error: 'Target counter is closed or unavailable.' };
    }
    if (bookingType === 'appointment' && !scheduledTime) {
      return { ok: false, error: 'Please pick a new appointment time slot.' };
    }

    const prevSnapshot = { ...token };
    const counterChanged = newCounter.id !== oldCounterId;
    const centre = db.centres.find((c) => c.id === newCounter.centreId);
    const centreName = centre ? centre.name : 'Service Centre';

    token.counterId = newCounter.id;
    token.bookingType = bookingType === 'appointment' ? 'appointment' : 'immediate';
    token.scheduledTime = bookingType === 'appointment' ? scheduledTime : '';
    token.status = bookingType === 'appointment' ? 'Booked' : 'Waiting';
    token.createdAt = new Date().toISOString();
    token.notifiedThresholds = ['booked'];

    recalculateCounter(db, oldCounterId, false, { skipTokenId: token.id });
    if (counterChanged) {
      recalculateCounter(db, newCounter.id, false, { skipTokenId: token.id });
    }
    token.lastNotifiedEtaMin = token.etaMin;

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      recalculateCounter(db, oldCounterId, false);
      if (counterChanged) recalculateCounter(db, newCounter.id, false);
      return { ok: false, error: updRes.error || 'Failed to reschedule token in Supabase.' };
    }

    recalculateCounter(db, oldCounterId, true, { skipTokenId: token.id });
    await syncCounterToSupabase(db, oldCounterId);
    if (counterChanged) {
      recalculateCounter(db, newCounter.id, true, { skipTokenId: token.id });
      await syncCounterToSupabase(db, newCounter.id);
    }

    NotificationService.push(db, {
      userId: token.customerId,
      tokenId: token.id,
      type: 'rescheduled',
      title: `Booking Rescheduled — ${token.tokenNumber}`,
      message:
        token.bookingType === 'appointment'
          ? `Rescheduled to ${token.scheduledTime} at ${newCounter.number} (${centreName}).`
          : `Moved to immediate queue at ${newCounter.number} (${centreName}) — Position #${token.position}, approx. wait ~${token.etaMin} min.`,
    });

    if (counterChanged) {
      NotificationService.push(db, {
        userId: token.customerId,
        tokenId: token.id,
        type: 'counter_changed',
        urgent: true,
        title: `Counter Changed — ${token.tokenNumber}`,
        message: `Your assigned counter changed from ${oldCounter ? oldCounter.number : oldCounterId} to ${newCounter.number} (${newCounter.name}) at ${centreName}.`,
      });
    }

    addAudit(
      db,
      actor,
      counterChanged ? 'TOKEN_COUNTER_CHANGED' : 'TOKEN_RESCHEDULED',
      'token',
      token.id,
      `Rescheduled ${token.tokenNumber} ${counterChanged ? `from ${oldCounter ? oldCounter.number : oldCounterId} ` : ''}to ${newCounter.number} (${
        token.bookingType === 'appointment' ? token.scheduledTime : 'Immediate'
      }).`
    );
    return { ok: true, token, counterChanged };
  }

  async function reassignCounter(db, tokenId, newCounterId, actor, reason = '') {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const token = db.tokens.find((t) => t.id === tokenId);
    if (!token) return { ok: false, error: 'Token not found.' };
    if (!['Booked', 'Waiting', 'Approaching'].includes(token.status)) {
      return { ok: false, error: 'Only Booked, Waiting, or Approaching tokens can be moved to another counter.' };
    }
    if (token.counterId === newCounterId) {
      return { ok: false, error: 'Token is already assigned to that counter.' };
    }
    const oldCounterId = token.counterId;
    const oldCounter = db.counters.find((c) => c.id === oldCounterId);
    const newCounter = db.counters.find((c) => c.id === newCounterId);
    if (!newCounter || newCounter.status === 'closed') {
      return { ok: false, error: 'Target counter is closed or unavailable.' };
    }
    const centre = db.centres.find((c) => c.id === newCounter.centreId);
    const centreName = centre ? centre.name : 'Service Centre';

    const prevSnapshot = { ...token };
    token.counterId = newCounter.id;
    token.notifiedThresholds = ['booked'];
    recalculateCounter(db, oldCounterId, false, { skipTokenId: token.id });
    recalculateCounter(db, newCounter.id, false, { skipTokenId: token.id });
    token.lastNotifiedEtaMin = token.etaMin;

    const updRes = await SupabaseBackend.updateQueueToken(token);
    if (!updRes.ok) {
      Object.assign(token, prevSnapshot);
      recalculateCounter(db, oldCounterId, false);
      recalculateCounter(db, newCounter.id, false);
      return { ok: false, error: updRes.error || 'Failed to reassign counter in Supabase.' };
    }

    recalculateCounter(db, oldCounterId, true, { skipTokenId: token.id });
    recalculateCounter(db, newCounter.id, true, { skipTokenId: token.id });
    await syncCounterToSupabase(db, oldCounterId);
    await syncCounterToSupabase(db, newCounter.id);

    NotificationService.push(db, {
      userId: token.customerId,
      tokenId: token.id,
      type: 'counter_changed',
      urgent: true,
      title: `Counter Changed — ${token.tokenNumber}`,
      message: `Your token ${token.tokenNumber} was reassigned from ${oldCounter ? oldCounter.number : oldCounterId} to ${newCounter.number} (${newCounter.name}) at ${centreName}${
        reason ? ` (${reason})` : ''
      }. ${token.status === 'Booked' ? `Slot: ${token.scheduledTime}` : `Position #${token.position}, est. wait ~${token.etaMin} min (approx.)`}.`,
    });

    addAudit(
      db,
      actor,
      'TOKEN_COUNTER_CHANGED',
      'token',
      token.id,
      `Reassigned ${token.tokenNumber} from ${oldCounter ? oldCounter.number : oldCounterId} to ${newCounter.number}${reason ? ` (${reason})` : ''}.`
    );
    return { ok: true, token };
  }

  async function setCounterStatus(db, counterId, status, reason, actor) {
    const cfg = StorageAdapter.requireConfigured();
    if (!cfg.ok) return cfg;

    const counter = db.counters.find((c) => c.id === counterId);
    if (!counter) return { ok: false, error: 'Counter not found.' };
    const prevStatus = counter.status;
    const prevReason = counter.pauseReason;
    const centre = db.centres.find((c) => c.id === counter.centreId);
    const centreName = centre ? centre.name : 'Service Centre';

    const newReason = status === 'paused' ? String(reason || 'Temporary counter break').trim() : '';
    const updRes = await SupabaseBackend.updateCounterStatusInDb(counterId, status, newReason);
    if (!updRes.ok) {
      return { ok: false, error: updRes.error || 'Failed to update counter status in Supabase.' };
    }

    counter.status = status;
    counter.pauseReason = newReason;

    const affectedTokens = db.tokens.filter(
      (t) => t.counterId === counterId && (WAITING_STATUSES.includes(t.status) || t.status === 'Booked')
    );

    if (status === 'paused' && prevStatus !== 'paused') {
      for (const tok of affectedTokens) {
        NotificationService.push(db, {
          userId: tok.customerId,
          tokenId: tok.id,
          type: 'counter_paused',
          title: `Counter Paused — ${counter.number}`,
          message: `${counter.number} at ${centreName} is temporarily paused (${counter.pauseReason}). Your place in line (${tok.tokenNumber}) is preserved.`,
        });
      }
    } else if (status === 'open' && (prevStatus === 'paused' || prevStatus === 'closed')) {
      recalculateCounter(db, counterId, false);
      await syncCounterToSupabase(db, counterId);
      for (const tok of affectedTokens) {
        const posSuffix =
          tok.position > 0 ? ` Position #${tok.position}, est. wait ~${tok.etaMin} min (approx.).` : '';
        NotificationService.push(db, {
          userId: tok.customerId,
          tokenId: tok.id,
          type: 'counter_resumed',
          title: `Counter Resumed — ${counter.number}`,
          message: `${counter.number} at ${centreName} has resumed service. Your token ${tok.tokenNumber} is active.${posSuffix}`,
        });
      }
    } else if (status === 'closed' && prevStatus !== 'closed') {
      for (const tok of affectedTokens) {
        NotificationService.push(db, {
          userId: tok.customerId,
          tokenId: tok.id,
          type: 'counter_paused',
          urgent: true,
          title: `Counter Closed — ${counter.number}`,
          message: `${counter.number} at ${centreName} has been closed${reason ? ` (${reason})` : ''}. Please reschedule token ${tok.tokenNumber} to another open counter.`,
        });
      }
    }

    void prevReason;
    addAudit(
      db,
      actor,
      'COUNTER_STATUS',
      'counter',
      counter.id,
      `Set ${counter.number} status from ${prevStatus} to ${status}${counter.pauseReason ? ` (${counter.pauseReason})` : ''}.`
    );
    return { ok: true, counter };
  }

  return {
    ACTIVE_STATUSES,
    WAITING_STATUSES,
    SERVING_SLOT_STATUSES,
    addAudit,
    getCounterRollingAvg,
    getCounterState,
    recalculateCounter,
    recalculateAll,
    analyzeCounters,
    recommendCounter,
    predictCrowdForHour,
    bookToken,
    checkInAppointment,
    callNextToken,
    recallToken,
    markArrived,
    startService,
    completeService,
    skipToken,
    markNoShow,
    processAutomaticNoShows,
    restoreToken,
    getGraceStatus,
    formatGraceDuration,
    cancelToken,
    rescheduleToken,
    reassignCounter,
    setCounterStatus,
  };
})();

/* --------------------------------------------------------------------------
   8. AuthService — Real Supabase Authentication & Server-Verified Roles
   -------------------------------------------------------------------------- */
const AuthService = {
  getCurrentUser(db, session) {
    if (!session) return null;
    if (session.user) return session.user;
    if (!session.userId) return null;
    return (db.users || []).find((u) => u.id === session.userId) || null;
  },

  async login(email, password) {
    const res = await SupabaseBackend.signInWithEmailPassword(email, password);
    if (!res.ok || !res.data) {
      return { ok: false, error: res.error || 'Sign in failed.' };
    }
    const user = res.data;
    return { ok: true, user, session: { userId: user.id, user, guest: null } };
  },

  async registerCustomer({ name, phone, email, password }) {
    const res = await SupabaseBackend.registerCustomerAccount({ name, phone, email, password });
    if (!res.ok) {
      return { ok: false, error: res.error || 'Registration failed.' };
    }
    if (res.needsEmailConfirmation || !res.data) {
      return {
        ok: true,
        needsEmailConfirmation: true,
        user: null,
        session: { userId: null, user: null, guest: null },
      };
    }
    const user = res.data;
    return { ok: true, user, session: { userId: user.id, user, guest: null } };
  },

  async logout() {
    await SupabaseBackend.signOutAccount().catch(() => {});
    return { userId: null, user: null, guest: null };
  },
};

/* --------------------------------------------------------------------------
   9. AnalyticsEngine — KPIs, Peak Hours, Utilization & CSV Reports
   -------------------------------------------------------------------------- */
const AnalyticsEngine = {
  getOverviewKpis(db) {
    const today = Utils.todayStr();
    const todayTokens = db.tokens.filter((t) => Utils.dateStrFromIso(t.createdAt) === today);
    const todayHistory = db.serviceHistory.filter((h) => h.dateStr === today);

    const waiting = db.tokens.filter((t) => ['Booked', 'Waiting', 'Approaching'].includes(t.status)).length;
    const serving = db.tokens.filter((t) => ['Called', 'Arrived', 'Serving'].includes(t.status)).length;
    const completedToday = todayTokens.filter((t) => t.status === 'Completed').length;
    const cancelledToday = todayTokens.filter((t) => t.status === 'Cancelled').length;
    const noShowToday = todayTokens.filter((t) => t.status === 'No-show').length;

    const completedHist = db.serviceHistory.filter((h) => h.outcome === 'Completed');
    const avgWait = completedHist.length
      ? Math.round(completedHist.reduce((s, h) => s + (h.waitDurationMin || 0), 0) / completedHist.length)
      : 0;
    const avgService = completedHist.length
      ? Math.round(completedHist.reduce((s, h) => s + (h.serviceDurationMin || 0), 0) / completedHist.length)
      : 0;

    return {
      totalToday: todayTokens.length + Math.max(0, todayHistory.length - completedToday - cancelledToday - noShowToday),
      waiting,
      serving,
      completed: completedToday + todayHistory.filter((h) => h.outcome === 'Completed' && !todayTokens.some((t) => t.id === h.tokenId)).length,
      cancelled: cancelledToday + todayHistory.filter((h) => h.outcome === 'Cancelled' && !todayTokens.some((t) => t.id === h.tokenId)).length,
      noShow: noShowToday + todayHistory.filter((h) => h.outcome === 'No-show' && !todayTokens.some((t) => t.id === h.tokenId)).length,
      avgWait,
      avgService,
    };
  },

  getNoShowStats(db) {
    const history = Array.isArray(db.noShowHistory) ? db.noShowHistory : [];
    const today = Utils.todayStr();
    const todayHistory = history.filter((h) => Utils.dateStrFromIso(h.timestamp) === today);
    const autoNoShows = history.filter((h) => h.mode === 'automatic').length;
    const manualNoShows = history.filter((h) => h.mode !== 'automatic').length;
    const restoredCount = history.filter((h) => h.restored).length;
    const activeNoShows = (db.tokens || []).filter((t) => t.status === 'No-show').length;
    const totalTokens = (db.tokens || []).length;
    const noShowRate = totalTokens > 0 ? Math.round((activeNoShows / totalTokens) * 100) : 0;

    const byCounter = (db.counters || []).map((c) => ({
      counterId: c.id,
      counterNumber: c.number,
      count: history.filter((h) => h.counterId === c.id).length,
      activeCount: (db.tokens || []).filter((t) => t.counterId === c.id && t.status === 'No-show').length,
    }));

    return {
      totalEvents: history.length,
      todayEvents: todayHistory.length,
      autoNoShows,
      manualNoShows,
      restoredCount,
      activeNoShows,
      noShowRate,
      byCounter,
      history,
    };
  },

  computeReport(db, { range = '7d', fromDate = '', toDate = '' } = {}) {
    const today = Utils.todayStr();
    let startStr = '';
    let endStr = today;

    if (range === 'today') {
      startStr = today;
    } else if (range === '7d') {
      const d = new Date(Date.now() - 6 * 86400000);
      startStr = Utils.dateStrFromIso(d.toISOString());
    } else if (range === 'custom' && fromDate) {
      startStr = fromDate;
      endStr = toDate || today;
    }

    const inRange = (dateStr) => {
      if (startStr && dateStr < startStr) return false;
      if (endStr && dateStr > endStr) return false;
      return true;
    };

    // Merge live tokens + non-overlapping historical rows
    const tokenIds = new Set(db.tokens.map((t) => t.id));
    const historyOnly = db.serviceHistory.filter((h) => !tokenIds.has(h.tokenId) && inRange(h.dateStr));
    const filteredTokens = db.tokens.filter((t) => inRange(Utils.dateStrFromIso(t.createdAt)));
    const filteredHistory = db.serviceHistory.filter((h) => inRange(h.dateStr));

    const totalBookings = filteredTokens.length + historyOnly.length;
    const completed =
      filteredTokens.filter((t) => t.status === 'Completed').length +
      historyOnly.filter((h) => h.outcome === 'Completed').length;
    const cancelled =
      filteredTokens.filter((t) => t.status === 'Cancelled').length +
      historyOnly.filter((h) => h.outcome === 'Cancelled').length;
    const noShow =
      filteredTokens.filter((t) => t.status === 'No-show').length +
      historyOnly.filter((h) => h.outcome === 'No-show').length;

    const compHist = filteredHistory.filter((h) => h.outcome === 'Completed');
    const avgWait = compHist.length
      ? Math.round(compHist.reduce((s, h) => s + (h.waitDurationMin || 0), 0) / compHist.length)
      : 0;
    const avgService = compHist.length
      ? Math.round(compHist.reduce((s, h) => s + (h.serviceDurationMin || 0), 0) / compHist.length)
      : 0;
    const noShowRate = totalBookings > 0 ? Math.round((noShow / totalBookings) * 100) : 0;

    // Daily breakdown
    const dailyMap = {};
    for (const t of filteredTokens) {
      const d = Utils.dateStrFromIso(t.createdAt);
      if (!dailyMap[d]) dailyMap[d] = { date: d, total: 0, completed: 0, cancelled: 0 };
      dailyMap[d].total++;
      if (t.status === 'Completed') dailyMap[d].completed++;
      if (t.status === 'Cancelled' || t.status === 'No-show') dailyMap[d].cancelled++;
    }
    for (const h of historyOnly) {
      const d = h.dateStr;
      if (!dailyMap[d]) dailyMap[d] = { date: d, total: 0, completed: 0, cancelled: 0 };
      dailyMap[d].total++;
      if (h.outcome === 'Completed') dailyMap[d].completed++;
      if (h.outcome === 'Cancelled' || h.outcome === 'No-show') dailyMap[d].cancelled++;
    }
    const dailySeries = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Peak hours (09..18)
    const hours = [];
    for (let hr = 9; hr <= 18; hr++) {
      const count =
        filteredTokens.filter((t) => new Date(t.createdAt).getHours() === hr).length +
        historyOnly.filter((h) => h.hourOfDay === hr).length;
      hours.push({ hour: hr, label: `${String(hr).padStart(2, '0')}:00`, count });
    }
    const peakHourObj = [...hours].sort((a, b) => b.count - a.count)[0] || { label: '—', count: 0 };

    // Counter utilization
    const counterStats = db.counters.map((c) => {
      const handled =
        filteredTokens.filter((t) => t.counterId === c.id).length +
        historyOnly.filter((h) => h.counterId === c.id).length;
      const pct = totalBookings > 0 ? Math.round((handled / totalBookings) * 100) : 0;
      const centre = db.centres.find((ct) => ct.id === c.centreId);
      return {
        id: c.id,
        label: `${c.number} (${centre ? centre.name.split(' ')[0] : ''})`,
        handled,
        pct,
        status: c.status,
      };
    });

    // Category distribution
    const categoryStats = db.categories.map((cat) => {
      const count =
        filteredTokens.filter((t) => t.categoryId === cat.id).length +
        historyOnly.filter((h) => h.categoryId === cat.id).length;
      const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
      return { id: cat.id, name: cat.name, code: cat.code, count, pct };
    });

    return {
      totalBookings,
      completed,
      cancelled,
      noShow,
      avgWait,
      avgService,
      noShowRate,
      dailySeries,
      hours,
      peakHour: peakHourObj,
      counterStats,
      categoryStats,
    };
  },

  exportDailyCsv(db) {
    const headers = [
      'Token ID',
      'Token Number',
      'Date',
      'Booked At',
      'Customer Name',
      'Mobile (Masked)',
      'Service Centre',
      'Service Category',
      'Counter',
      'Booking Type',
      'Scheduled Time',
      'Priority',
      'Status',
      'Approx ETA (min)',
      'Notes / Cancel Reason',
    ];
    const rows = db.tokens.map((t) => {
      const centre = db.centres.find((c) => c.id === t.centreId);
      const cat = db.categories.find((c) => c.id === t.categoryId);
      const cnt = db.counters.find((c) => c.id === t.counterId);
      return [
        t.id,
        t.tokenNumber,
        Utils.dateStrFromIso(t.createdAt),
        Utils.formatTime(t.createdAt),
        t.customerName,
        Utils.maskPhone(t.customerPhone),
        centre ? centre.name : t.centreId,
        cat ? cat.name : t.categoryId,
        cnt ? cnt.number : t.counterId,
        t.bookingType,
        t.scheduledTime || 'Immediate',
        t.priorityType || 'standard',
        t.status,
        t.etaMin,
        t.cancelReason || t.notes || '',
      ];
    });
    const csv = Utils.toCsv(headers, rows);
    Utils.downloadTextFile(`smartq-report-${Utils.todayStr()}.csv`, csv);
  },
};

/* --------------------------------------------------------------------------
   10. Global App State & UI Helpers (Toasts, Modals, Print, QR Render)
   -------------------------------------------------------------------------- */
const AppState = {
  db: createInitialSnapshot(),
  session: { userId: null, user: null, guest: null },
  backend: {
    configured: SupabaseBackend.isSupabaseConfigured(),
    connectionState: SupabaseBackend.isSupabaseConfigured() ? 'connecting' : 'unconfigured',
    realtimeState: 'disconnected',
    loading: SupabaseBackend.isSupabaseConfigured(),
    syncing: false,
    error: '',
    lastSyncedAt: null,
    configSummary: SupabaseBackend.getSupabaseConfigSummary(),
  },
  route: 'home', // 'home' | 'directory' | 'business' | 'auth' | 'customer' | 'operator' | 'admin' | 'display' | 'verify'
  adminTab: 'overview',
  customerTab: 'dashboard', // 'dashboard' | 'book' | 'history' | 'notifications' | 'favourites'
  historyFilter: 'all',
  notifFilter: 'all', // 'all' | 'unread' | 'queue' | 'booking' | 'counter'
  displayCentreId: '',
  verifyQuery: '',
  verifyResult: null,
  verifyLoading: false,
  directory: {
    categoryId: 'all',
    area: 'all',
    scope: 'all', // 'all' | 'bhopal' | 'live' | 'demo'
    search: '',
    selectedBusinessId: '',
  },
  detailBooking: {
    businessId: '',
    serviceId: '',
    counterId: '',
    bookingType: 'immediate',
    scheduledTime: '',
    customerName: '',
    customerPhone: '',
    priorityType: 'standard',
    priorityReason: '',
  },
  bookingDraft: {
    step: 1,
    categoryId: '',
    centreSearch: '',
    centreId: '',
    counterId: '',
    bookingType: 'immediate',
    scheduledTime: '',
    customerName: '',
    customerPhone: '',
    priorityType: 'standard',
    priorityReason: '',
  },
  adminFilters: {
    search: '',
    status: 'all',
    categoryId: 'all',
    date: '',
    analyticsRange: '7d',
    analyticsFrom: '',
    analyticsTo: '',
    bizScope: 'all',
    bizCategory: 'all',
    bizArea: 'all',
    bizSearch: '',
  },
  authTab: 'login', // 'login' | 'register' | 'guest'
  displayClockTimer: null,
};

function t(key) {
  const lang = AppState.db.settings.language === 'hi' ? 'hi' : 'en';
  const parts = key.split('.');
  let cur = I18N[lang];
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
    else return key;
  }
  return cur;
}

function getActor() {
  const user = AuthService.getCurrentUser(AppState.db, AppState.session);
  if (user) return user;
  if (AppState.session && AppState.session.guest) return AppState.session.guest;
  return null;
}

function localizeCentre(centre) {
  if (!centre) return '';
  return AppState.db.settings.language === 'hi' && centre.nameHi ? centre.nameHi : centre.name;
}

function localizeCategory(cat) {
  if (!cat) return '';
  return AppState.db.settings.language === 'hi' && cat.nameHi ? cat.nameHi : cat.name;
}

function localizeDirCategory(cat) {
  if (!cat) return '';
  return AppState.db.settings.language === 'hi' && cat.nameHi ? cat.nameHi : cat.name;
}

const UI = {
  toast(message, tone = 'info') {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const el = document.createElement('div');
    el.className = `toast toast-${tone}`;
    el.innerHTML = `<span>${Utils.esc(message)}</span><button type="button" class="toast-close" aria-label="Dismiss">&times;</button>`;
    el.querySelector('.toast-close').addEventListener('click', () => el.remove());
    root.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, 4500);
  },

  openModal(title, bodyHtml, footerHtml = '') {
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML = `
      <div class="modal-panel" role="document">
        <div class="modal-header">
          <h3>${Utils.esc(title)}</h3>
          <button type="button" class="btn btn-ghost btn-sm" data-close-modal aria-label="Close modal">Close</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    `;
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
    root.querySelectorAll('[data-close-modal]').forEach((btn) => btn.addEventListener('click', () => UI.closeModal()));
  },

  closeModal() {
    const root = document.getElementById('modal-root');
    if (!root) return;
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '';
  },

  confirm({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm }) {
    UI.openModal(
      title,
      `<p class="text-secondary">${Utils.esc(message)}</p>`,
      `
        <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
        <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-action-btn">${Utils.esc(
          confirmLabel
        )}</button>
      `
    );
    const btn = document.getElementById('confirm-action-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        UI.closeModal();
        onConfirm();
      });
    }
  },

  renderAllQrCanvases() {
    document.querySelectorAll('canvas[data-qr-payload]').forEach((canvas) => {
      const payload = canvas.getAttribute('data-qr-payload');
      const size = Number(canvas.getAttribute('data-qr-size') || 164);
      if (payload) QRGenerator.drawToCanvas(canvas, payload, size);
    });
  },

  printToken(token) {
    const db = AppState.db;
    const centre = db.centres.find((c) => c.id === token.centreId);
    const cat = db.categories.find((c) => c.id === token.categoryId);
    const cnt = db.counters.find((c) => c.id === token.counterId);
    const qrDataUrl = QRGenerator.toDataURL(QRGenerator.buildPayload(token), 220);

    const sheet = document.getElementById('print-sheet');
    if (!sheet) return;
    sheet.innerHTML = `
      <div style="max-width:420px;margin:0 auto;border:2px solid #0f172a;padding:24px;border-radius:10px;font-family:'DM Sans',sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #cbd5e1;padding-bottom:12px;margin-bottom:16px;">
          <strong style="font-size:20px;">SmartQ Digital Token</strong>
          <span style="font-size:12px;color:#475569;">${Utils.esc(Utils.formatDateTime(token.createdAt))}</span>
        </div>
        <div style="text-align:center;margin:16px 0;">
          <div style="font-size:13px;color:#475569;">Token Number</div>
          <div style="font-size:46px;font-weight:800;font-family:'JetBrains Mono',monospace;">${Utils.esc(token.tokenNumber)}</div>
          <div style="margin-top:8px;"><img src="${qrDataUrl}" alt="Token QR Code" style="width:180px;height:180px;" /></div>
          <div style="font-size:11px;color:#64748b;margin-top:6px;">Token ID: ${Utils.esc(token.id)}</div>
        </div>
        <div style="border-top:1px solid #cbd5e1;padding-top:12px;font-size:13px;line-height:1.7;">
          <div><strong>Centre:</strong> ${Utils.esc(centre ? centre.name : '')}</div>
          <div><strong>Address:</strong> ${Utils.esc(centre ? centre.address : '')}</div>
          <div><strong>Service:</strong> ${Utils.esc(cat ? cat.name : '')}</div>
          <div><strong>Counter:</strong> ${Utils.esc(cnt ? `${cnt.number} — ${cnt.name}` : '')}</div>
          <div><strong>Status:</strong> ${Utils.esc(token.status)}</div>
          <div><strong>Approx. Wait:</strong> ${token.etaMin ? `~${token.etaMin} min (approximate)` : 'Immediate / Called'}</div>
        </div>
      </div>
    `;
    window.print();
  },

  downloadTokenQr(token) {
    const dataUrl = QRGenerator.toDataURL(QRGenerator.buildPayload(token), 320);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `SmartQ-${token.tokenNumber}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    UI.toast(`Downloaded QR code for ${token.tokenNumber}.`, 'success');
  },

  async shareToken(token) {
    const db = AppState.db;
    const centre = db.centres.find((c) => c.id === token.centreId);
    const cnt = db.counters.find((c) => c.id === token.counterId);
    const text = `SmartQ Token ${token.tokenNumber} (ID: ${token.id}) | ${centre ? centre.name : ''} | ${
      cnt ? cnt.number : ''
    } | Status: ${token.status} | Approx. Wait: ~${token.etaMin} min`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `SmartQ Token ${token.tokenNumber}`, text });
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        UI.toast('Token summary copied to clipboard.', 'success');
        return;
      }
    } catch (_) {
      // Fall through to modal view
    }
    UI.openModal(
      'Share Token Details',
      `<p class="text-sm text-secondary" style="margin-bottom:10px;">Copy your token summary below (no sensitive contact details included):</p>
       <textarea class="form-textarea mono" readonly rows="3">${Utils.esc(text)}</textarea>`
    );
  },

  MEDIA: {
    heroWaiting: '/src/assets/images/indian_hero_lounge_1795695827030.jpg',
    qrScan: '/src/assets/images/smartq_qr_scan_1795691905436.jpg',
    serviceCounter: '/src/assets/images/smartq_service_counter_1795691906489.jpg',
    liveTracking: '/src/assets/images/smartq_live_tracking_1795691908759.jpg',
    calmLounge: '/src/assets/images/smartq_calm_lounge_1795691908127.jpg',
    artBookingEta: '/src/assets/images/indian_remote_booking_1795695826376.jpg',
    artQrVerify: '/src/assets/images/indian_qr_verification_1795695826789.jpg',
    artCounterOrch: '/src/assets/images/indian_counter_hall_1795695827851.jpg',
  },

  icon(name, cls = 'ui-icon') {
    const paths = {
      prism: '<path d="M12 2.5 20.5 7.5v9L12 21.5 3.5 16.5v-9L12 2.5Z"/><path d="M12 21.5V12m0 0 8.5-4.5M12 12 3.5 7.5"/>',
      ticket: '<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a2 2 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a2 2 0 0 0 0-3V9Z"/><path d="M13 7v10"/>',
      headset: '<path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v4a2 2 0 0 0 2 2h1v-6H4Zm16 0v4a2 2 0 0 1-2 2h-1v-6h3Z"/>',
      sliders: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="15" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/>',
      monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
      bell: '<path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
      overview: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      queues: '<path d="M4 7h16M4 12h12M4 17h8"/><circle cx="18" cy="16" r="2.5"/>',
      building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 11h4a1 1 0 0 1 1 1v9M2 21h20"/><path d="M8 7h2m2 0h1M8 11h2m2 0h1M8 15h2"/>',
      layers: '<path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z"/><path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5"/>',
      users: '<circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 19a4.5 4.5 0 0 1 5-4.4"/>',
      chart: '<path d="M4 19V9m5 10V5m5 14v-7m5 7V8"/><path d="M2 19h20"/>',
      shield: '<path d="M12 3 4 6v5.5c0 4.6 3.4 8.2 8 9.5 4.6-1.3 8-4.9 8-9.5V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
      zoom: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>',
      arrowRight: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
      chevronLeft: '<path d="m15 18-6-6 6-6"/>',
      chevronRight: '<path d="m9 18 6-6-6-6"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      check: '<path d="m5 12 5 5L20 7"/>',
      hospital: '<path d="M12 6v6m-3-3h6"/><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-5h6v5"/>',
      stethoscope: '<path d="M4.5 4v5a4.5 4.5 0 0 0 9 0V4M9 13.5V16a4 4 0 0 0 8 0v-2.5"/><circle cx="17" cy="11.5" r="2"/>',
      flask: '<path d="M9 3h6M10 3v5.6L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 8.6V3"/><path d="M7.5 14.5h9"/>',
      bag: '<path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
      bank: '<path d="M3 10h18L12 4 3 10Z"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
      landmark: '<path d="M3 21h18M4 18h16M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 3l8 5H4l8-5Z"/>',
      scissors: '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="m8 8.5 11 8M8 15.5l11-8"/>',
      graduation: '<path d="m2 10 10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 10v6"/>',
      utensils: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 3v18M16 3v18M16 3c2.5 0 4 2.5 4 6s-1.5 4-4 4"/>',
      grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      mapPin: '<path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z"/><circle cx="12" cy="11" r="2"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>',
      verified: '<path d="M12 2.5 14.8 4l3.1-.2 1.2 2.9 2.4 2-1 3 1 3-2.4 2-1.2 2.9-3.1-.2L12 21.5 9.2 20l-3.1.2-1.2-2.9-2.4-2 1-3-1-3 2.4-2 1.2-2.9 3.1.2L12 2.5Z"/><path d="m9 12 2 2 4-4"/>',
      moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"/>',
    };
    const body = paths[name] || paths.prism;
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  },

  renderVisual(src, alt, frameClass = '', { eager = false, icon = 'prism', fallbackLabel = '', overlayHtml = '' } = {}) {
    return `
      <div class="visual-frame ${frameClass}">
        <img
          src="${Utils.esc(src)}"
          alt="${Utils.esc(alt)}"
          loading="${eager ? 'eager' : 'lazy'}"
          decoding="async"
          referrerpolicy="no-referrer"
          onerror="this.parentElement.classList.add('is-broken')"
        />
        <div class="visual-fallback" aria-hidden="true">
          ${UI.icon(icon, 'ui-icon-lg')}
          <span>${Utils.esc(fallbackLabel || alt)}</span>
        </div>
        ${overlayHtml}
      </div>
    `;
  },

  openEnlargedQr(token) {
    if (!token) return;
    const db = AppState.db;
    const centre = db.centres.find((c) => c.id === token.centreId);
    const cat = db.categories.find((c) => c.id === token.categoryId);
    const cnt = db.counters.find((c) => c.id === token.counterId);
    const payload = QRGenerator.buildPayload(token);

    UI.openModal(
      `Digital QR Token — ${token.tokenNumber}`,
      `
        <div class="qr-enlarge-stage">
          <div>
            <div class="text-xs text-muted">${Utils.esc(localizeCentre(centre))} · ${Utils.esc(cnt ? cnt.number : '')}</div>
            <div class="qr-enlarge-token">${Utils.esc(token.tokenNumber)}</div>
            <div style="margin-top:6px;">
              <span class="status-text ${Utils.statusClass(token.status)}">${Utils.esc(t(`statusMap.${token.status}`))}</span>
              <span class="meta-sep" aria-hidden="true"> · </span>
              <span class="text-xs text-secondary">${Utils.esc(localizeCategory(cat))}</span>
            </div>
          </div>
          <div class="qr-enlarge-box">
            <canvas data-qr-payload="${Utils.esc(payload)}" data-qr-size="260"></canvas>
          </div>
          <div class="text-xs text-muted mono">Present this code at ${Utils.esc(cnt ? `${cnt.number} (${cnt.name})` : 'your counter')} · ID: ${Utils.esc(token.id)}</div>
        </div>
      `,
      `
        <button type="button" class="btn btn-secondary btn-sm" data-action="download-qr" data-token-id="${token.id}">${Utils.esc(t('downloadQr'))}</button>
        <button type="button" class="btn btn-secondary btn-sm" data-action="print-token" data-token-id="${token.id}">${Utils.esc(t('printToken'))}</button>
        <button type="button" class="btn btn-primary btn-sm" data-close-modal>Done</button>
      `
    );
    UI.renderAllQrCanvases();
  },

  renderSvgBarChart(items, { valueKey = 'count', labelKey = 'label', color = '#4f46e5' } = {}) {
    if (!items.length) return `<div class="empty-state">No data for selected period.</div>`;
    const maxVal = Math.max(1, ...items.map((d) => d[valueKey] || 0));
    const totalSum = items.reduce((acc, d) => acc + (Number(d[valueKey]) || 0), 0);
    const width = 460;
    const height = 216;
    const padL = 30;
    const padB = 34;
    const padT = 22;
    const plotW = width - padL - 12;
    const plotH = height - padT - padB;
    const barSlot = plotW / items.length;
    const barW = Math.max(12, Math.min(34, barSlot * 0.6));
    const isDarkBar = color === '#0f172a';
    const gradId = `sq-bar-grad-${isDarkBar ? 'navy' : 'violet'}-${items.length}-${maxVal}`;

    const gridLines = [0.25, 0.5, 0.75, 1]
      .map((ratio) => {
        const gy = (padT + plotH * (1 - ratio)).toFixed(1);
        return `<line x1="${padL}" y1="${gy}" x2="${width - 10}" y2="${gy}" stroke="rgba(130, 150, 214, 0.22)" stroke-dasharray="3 4" stroke-width="1" />`;
      })
      .join('');

    const bars = items
      .map((item, i) => {
        const val = item[valueKey] || 0;
        const h = Math.max(4, Math.round((val / maxVal) * plotH));
        const x = padL + i * barSlot + (barSlot - barW) / 2;
        const y = padT + plotH - h;
        const fullLbl = String(item[labelKey] || '');
        const lbl = fullLbl.slice(-5);
        const pct = totalSum > 0 ? Math.round((val / totalSum) * 100) : 0;
        return `
          <g class="svg-bar-group" tabindex="0" role="button" aria-label="${Utils.esc(fullLbl)}: ${val} (${pct}%)" data-bar-label="${Utils.esc(fullLbl)}" data-bar-value="${val}" data-bar-pct="${pct}">
            <rect class="svg-bar-rect" style="animation-delay:${Math.min(i * 30, 240)}ms;" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h}" rx="6" fill="url(#${gradId})" />
            <text x="${(x + barW / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="600" font-family="JetBrains Mono, monospace" fill="var(--navy-900)">${val}</text>
            <text x="${(x + barW / 2).toFixed(1)}" y="${height - 12}" text-anchor="middle" font-size="10" font-weight="500" fill="var(--text-muted)">${Utils.esc(lbl)}</text>
          </g>
        `;
      })
      .join('');

    return `
      <div class="chart-interactive-wrap">
        <div class="chart-tooltip" data-chart-tooltip>
          <span>Hover or tap any bar to inspect details</span>
          <span class="mono">Total: ${totalSum}</span>
        </div>
        <svg class="svg-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Interactive analytics bar chart">
          <defs>
            <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${isDarkBar ? '#2a3680' : '#4a65ff'}" />
              <stop offset="100%" stop-color="${isDarkBar ? '#5b6dd6' : '#8b6cfa'}" />
            </linearGradient>
          </defs>
          ${gridLines}
          <line x1="${padL}" y1="${padT + plotH}" x2="${width - 10}" y2="${padT + plotH}" stroke="rgba(114, 134, 204, 0.42)" stroke-width="1" />
          ${bars}
        </svg>
      </div>
    `;
  },

  bindInteractiveCharts() {
    document.querySelectorAll('.chart-interactive-wrap').forEach((wrap) => {
      const tip = wrap.querySelector('[data-chart-tooltip]');
      if (!tip) return;
      const groups = wrap.querySelectorAll('.svg-bar-group');
      const show = (g) => {
        groups.forEach((el) => el.classList.remove('is-active'));
        g.classList.add('is-active');
        const lbl = g.getAttribute('data-bar-label') || '';
        const val = g.getAttribute('data-bar-value') || '0';
        const pct = g.getAttribute('data-bar-pct') || '0';
        tip.classList.add('active');
        tip.innerHTML = `<strong>${Utils.esc(lbl)}</strong><span class="mono">${Utils.esc(val)} tokens · ${Utils.esc(pct)}% share</span>`;
      };
      groups.forEach((g) => {
        g.addEventListener('mouseenter', () => show(g));
        g.addEventListener('focus', () => show(g));
        g.addEventListener('click', () => show(g));
      });
    });
  },

  animateKpiCounters() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const viewKey = `${AppState.route}:${AppState.adminTab}:${AppState.customerTab}`;
    if (UI._lastAnimatedView === viewKey) return;
    UI._lastAnimatedView = viewKey;

    document.querySelectorAll('.kpi-value').forEach((el) => {
      const raw = (el.textContent || '').trim();
      const match = raw.match(/^(~?)(\d+)(\s*(?:min|%|\/.*)?)$/);
      if (!match) return;
      const prefix = match[1];
      const target = Number(match[2]);
      const suffix = match[3];
      if (!Number.isFinite(target) || target <= 0 || target > 99999) return;
      const startTs = performance.now();
      const duration = 340;
      const step = (now) => {
        const progress = Math.min(1, (now - startTs) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = raw;
      };
      requestAnimationFrame(step);
    });
  },

  updateLiveEtaCountdowns() {
    document.querySelectorAll('[data-eta-countdown]').forEach((el) => {
      const etaMin = Number(el.getAttribute('data-eta-min'));
      const updatedAt = el.getAttribute('data-eta-updated');
      if (!Number.isFinite(etaMin) || etaMin <= 0) return;
      const baseMs = updatedAt ? new Date(updatedAt).getTime() : Date.now();
      const elapsedSec = Number.isFinite(baseMs) ? Math.max(0, Math.floor((Date.now() - baseMs) / 1000)) : 0;
      const totalSec = etaMin * 60;
      const remSec = Math.max(15, totalSec - (elapsedSec % Math.max(60, totalSec)));
      const mm = String(Math.floor(remSec / 60)).padStart(2, '0');
      const ss = String(remSec % 60).padStart(2, '0');
      el.textContent = `~${mm}:${ss}`;
    });
  },

  teardownFeatureShowcase() {
    if (!UI._showcase) return;
    if (UI._showcase.timer) clearTimeout(UI._showcase.timer);
    if (UI._showcase.liveStepTimer) clearInterval(UI._showcase.liveStepTimer);
    UI._showcase = null;
  },

  initFeatureShowcase() {
    this.teardownFeatureShowcase();
    const root = document.getElementById('smartq-feature-showcase');
    if (!root) return;

    const track = root.querySelector('[data-showcase-track]');
    const slides = Array.from(root.querySelectorAll('[data-showcase-slide]'));
    const dots = Array.from(root.querySelectorAll('[data-showcase-dot]'));
    const progSteps = Array.from(root.querySelectorAll('[data-showcase-prog]'));
    const counterEl = root.querySelector('[data-showcase-counter]');
    const noteEl = root.querySelector('[data-showcase-note]');
    const viewport = root.querySelector('[data-showcase-viewport]');
    const prevBtn = root.querySelector('[data-showcase-prev]');
    const nextBtn = root.querySelector('[data-showcase-next]');
    if (!track || !slides.length) return;

    const total = slides.length;
    const DURATION = 4800;
    const reducedMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const state = {
      index: 0,
      paused: false,
      timer: null,
      liveStepTimer: null,
      startedAt: Date.now(),
      remaining: DURATION,
    };
    UI._showcase = state;

    const applySlide3LiveStep = (stepIdx) => {
      const stages = [
        { pos: '#3', ahead: '2 ahead', eta: '~14 min', pct: 46, dash: 78, status: 'Waiting in Queue', activeMs: 1 },
        { pos: '#2', ahead: '1 ahead', eta: '~8 min', pct: 68, dash: 46, status: 'Approaching Counter', activeMs: 1 },
        { pos: '#1', ahead: 'Next up', eta: '~3 min', pct: 88, dash: 18, status: 'Next in Line', activeMs: 2 },
      ];
      const st = stages[stepIdx % stages.length];
      const posEl = root.querySelector('[data-demo-pos]');
      const aheadEl = root.querySelector('[data-demo-ahead]');
      const etaEl = root.querySelector('[data-demo-eta]');
      const statusEl = root.querySelector('[data-demo-status]');
      const barEl = root.querySelector('[data-demo-bar]');
      const arcEl = root.querySelector('[data-demo-arc]');
      if (posEl) posEl.textContent = st.pos;
      if (aheadEl) aheadEl.textContent = st.ahead;
      if (etaEl) etaEl.textContent = st.eta;
      if (statusEl) statusEl.textContent = st.status;
      if (barEl) barEl.style.width = `${st.pct}%`;
      if (arcEl) arcEl.setAttribute('stroke-dashoffset', String(st.dash));
      root.querySelectorAll('[data-demo-ms]').forEach((el) => {
        const idx = Number(el.getAttribute('data-demo-ms'));
        el.classList.toggle('done', idx < st.activeMs);
        el.classList.toggle('current', idx === st.activeMs);
      });
    };

    const syncLiveSlide3 = () => {
      if (state.liveStepTimer) {
        clearInterval(state.liveStepTimer);
        state.liveStepTimer = null;
      }
      if (state.index !== 2) return;
      let step = 0;
      applySlide3LiveStep(step);
      if (reducedMotion) return;
      state.liveStepTimer = setInterval(() => {
        if (state.paused) return;
        step = (step + 1) % 3;
        applySlide3LiveStep(step);
      }, 1450);
    };

    const scheduleNext = (delay = DURATION) => {
      if (state.timer) clearTimeout(state.timer);
      if (reducedMotion || state.paused) return;
      state.startedAt = Date.now();
      state.remaining = delay;
      state.timer = setTimeout(() => {
        goTo((state.index + 1) % total, true);
      }, delay);
    };

    const goTo = (nextIndex, resetAuto = true) => {
      const target = ((nextIndex % total) + total) % total;
      state.index = target;
      track.style.transform = `translate3d(-${target * 100}%, 0, 0)`;

      slides.forEach((slide, i) => {
        const active = i === target;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      dots.forEach((dot, i) => {
        const active = i === target;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      progSteps.forEach((step, i) => {
        step.classList.remove('is-active', 'is-done');
        if (i < target) step.classList.add('is-done');
        else if (i === target) {
          // Force reflow so the 4.8s progress bar restarts cleanly on active slide
          void step.offsetWidth;
          step.classList.add('is-active');
        }
      });

      if (counterEl) {
        counterEl.textContent = `${String(target + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      }

      syncLiveSlide3();
      state.remaining = DURATION;
      if (resetAuto) scheduleNext(DURATION);
    };

    const setPaused = (paused) => {
      if (state.paused === paused) return;
      state.paused = paused;
      root.classList.toggle('is-paused', paused);
      if (noteEl) {
        noteEl.textContent = reducedMotion
          ? 'Manual slide navigation'
          : paused
            ? 'Paused while inspecting'
            : 'Autoplay · Hover to pause · Swipe on mobile';
      }
      if (paused) {
        if (state.timer) {
          clearTimeout(state.timer);
          state.timer = null;
          const elapsed = Date.now() - state.startedAt;
          state.remaining = Math.max(600, state.remaining - elapsed);
        }
      } else {
        scheduleNext(state.remaining);
      }
    };

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(state.index - 1, true));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(state.index + 1, true));

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.getAttribute('data-showcase-dot'));
        if (Number.isFinite(idx)) goTo(idx, true);
      });
    });

    progSteps.forEach((step) => {
      step.addEventListener('click', () => {
        const idx = Number(step.getAttribute('data-showcase-prog'));
        if (Number.isFinite(idx)) goTo(idx, true);
      });
    });

    root.addEventListener('mouseenter', () => setPaused(true));
    root.addEventListener('mouseleave', () => setPaused(false));
    root.addEventListener('focusin', () => setPaused(true));
    root.addEventListener('focusout', (ev) => {
      if (!root.contains(ev.relatedTarget)) setPaused(false);
    });

    root.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft') {
        ev.preventDefault();
        goTo(state.index - 1, true);
      } else if (ev.key === 'ArrowRight') {
        ev.preventDefault();
        goTo(state.index + 1, true);
      }
    });

    // Touch swipe & pointer drag gestures for mobile/tablet
    if (viewport) {
      let startX = 0;
      let startY = 0;
      let dragging = false;

      viewport.addEventListener(
        'touchstart',
        (ev) => {
          if (!ev.touches || !ev.touches.length) return;
          startX = ev.touches[0].clientX;
          startY = ev.touches[0].clientY;
          dragging = true;
          setPaused(true);
        },
        { passive: true }
      );

      viewport.addEventListener(
        'touchend',
        (ev) => {
          if (!dragging || !ev.changedTouches || !ev.changedTouches.length) return;
          dragging = false;
          const dx = ev.changedTouches[0].clientX - startX;
          const dy = ev.changedTouches[0].clientY - startY;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            goTo(dx < 0 ? state.index + 1 : state.index - 1, true);
          }
          setPaused(false);
        },
        { passive: true }
      );

      // Subtle 3D interactive tilt on pointer move over phone stages
      if (!reducedMotion) {
        root.querySelectorAll('.phone-stage').forEach((stage) => {
          const rig = stage.querySelector('.phone-3d-rig');
          if (!rig) return;
          stage.addEventListener('mousemove', (ev) => {
            const rect = stage.getBoundingClientRect();
            const nx = (ev.clientX - rect.left) / rect.width - 0.5;
            const ny = (ev.clientY - rect.top) / rect.height - 0.5;
            rig.style.setProperty('--tilt-y', `${(-10 + nx * 16).toFixed(1)}deg`);
            rig.style.setProperty('--tilt-x', `${(4 - ny * 12).toFixed(1)}deg`);
          });
          stage.addEventListener('mouseleave', () => {
            rig.style.setProperty('--tilt-y', '-10deg');
            rig.style.setProperty('--tilt-x', '4deg');
          });
        });
      }
    }

    goTo(0, true);
  },

  bindFeatureArtParallax() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.feature-visual-card').forEach((card) => {
      const stage = card.querySelector('.feature-art-stage');
      if (!stage) return;
      card.addEventListener('mousemove', (ev) => {
        const rect = card.getBoundingClientRect();
        const nx = (ev.clientX - rect.left) / rect.width - 0.5;
        const ny = (ev.clientY - rect.top) / rect.height - 0.5;
        stage.style.setProperty('--art-px', `${(-nx * 10).toFixed(1)}px`);
        stage.style.setProperty('--art-py', `${(-ny * 8).toFixed(1)}px`);
      });
      card.addEventListener('mouseleave', () => {
        stage.style.setProperty('--art-px', '0px');
        stage.style.setProperty('--art-py', '0px');
      });
    });
  },

  _bhopalMapInstance: null,
  _bhopalTileLayer: null,

  getMapTileUrl(isDark) {
    return isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  },

  syncMapTheme(isDark) {
    if (this._bhopalTileLayer && typeof this._bhopalTileLayer.setUrl === 'function') {
      this._bhopalTileLayer.setUrl(this.getMapTileUrl(isDark));
    }
  },

  teardownBhopalLiveMap() {
    this._bhopalTileLayer = null;
    if (this._bhopalMapInstance) {
      try {
        this._bhopalMapInstance.remove();
      } catch (_) {
        // Ignore cleanup errors on detached nodes
      }
      this._bhopalMapInstance = null;
    }
  },

  initBhopalLiveMap() {
    this.teardownBhopalLiveMap();
    const el = document.getElementById('bhopal-hero-map');
    if (!el) return;
    if (typeof window.L === 'undefined') {
      el.innerHTML =
        '<div class="bhopal-map-fallback">Interactive map tiles could not load offline. Use the Bhopal Directory below to browse locations.</div>';
      return;
    }

    const L = window.L;
    const db = AppState.db;

    // Verified coordinates for key Bhopal establishments from bhopalData.js + area centroids
    const COORDS_BY_ID = {
      BPL_DB_CITY: [23.2332, 77.4343],
      BPL_LAL_PATHLABS: [23.2356, 77.4302],
      BPL_VISHAL_MEGA: [23.2314, 77.4368],
      BPL_JCB_SALON: [23.2145, 77.4329],
      BPL_KARISHMA_LOUNGE: [23.2367, 77.4034],
      BPL_NIKKY_BAWA: [23.2392, 77.3992],
      BPL_JP_HOSP: [23.2314, 77.4163],
      BPL_KASTURBA: [23.2292, 77.4488],
      BPL_AIIMS: [23.2067, 77.4596],
      BPL_SAGAR_MULTI: [23.1846, 77.4465],
      BPL_AASHIMA: [23.1924, 77.4397],
      BPL_HAMIDIA: [23.2611, 77.3924],
      BPL_CHOWK_BAZAAR: [23.2572, 77.4021],
      BPL_YASHI_SALON: [23.2742, 77.3676],
      BPL_BMHRC: [23.3071, 77.4021],
      BPL_PEOPLES: [23.3029, 77.4192],
    };

    const AREA_CENTROIDS = {
      'MP Nagar': [23.2332, 77.4343],
      'Arera Colony': [23.2145, 77.4329],
      'New Market': [23.2367, 77.4034],
      'TT Nagar': [23.2374, 77.4012],
      Shahpura: [23.2015, 77.4235],
      'Saket Nagar': [23.2067, 77.4596],
      Habibganj: [23.2292, 77.4488],
      'Hoshangabad Road': [23.1895, 77.4435],
      'Kolar Road': [23.1765, 77.4182],
      Lalghati: [23.2742, 77.3676],
      Karond: [23.3071, 77.4021],
      Bhanpur: [23.3029, 77.4192],
      'Old Bhopal': [23.2599, 77.4015],
      'Ayodhya Bypass': [23.2725, 77.4694],
      Awadhpuri: [23.2185, 77.4864],
    };

    // Priority showcase establishments across key Bhopal hubs (MP Nagar, Arera Colony, New Market, Habibganj, Saket Nagar, Hoshangabad/Kolar corridor, Old Bhopal)
    const FEATURED_IDS = [
      'BPL_DB_CITY',
      'BPL_LAL_PATHLABS',
      'BPL_JCB_SALON',
      'BPL_KARISHMA_LOUNGE',
      'BPL_KASTURBA',
      'BPL_AIIMS',
      'BPL_SAGAR_MULTI',
      'BPL_HAMIDIA',
    ];

    const map = L.map(el, {
      center: [23.2599, 77.4126],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    const isDarkTheme = db.settings && db.settings.theme === 'dark';
    this._bhopalTileLayer = L.tileLayer(this.getMapTileUrl(isDarkTheme), {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map);

    const bhopalCentres = db.centres.filter((c) => c.isActive && c.dataScope !== 'demo');
    const selectedCentres = [];
    const seenIds = new Set();

    // Include any live onboarded Bhopal centres first, then featured hubs, plus any Kolar Road centres
    for (const c of bhopalCentres) {
      if (c.isOnboarded && !seenIds.has(c.id)) {
        selectedCentres.push(c);
        seenIds.add(c.id);
      }
    }
    for (const id of FEATURED_IDS) {
      const match = bhopalCentres.find((c) => c.id === id);
      if (match && !seenIds.has(match.id)) {
        selectedCentres.push(match);
        seenIds.add(match.id);
      }
    }
    for (const c of bhopalCentres) {
      if (c.area === 'Kolar Road' && !seenIds.has(c.id)) {
        selectedCentres.push(c);
        seenIds.add(c.id);
      }
    }

    const createPinIcon = (isLive) =>
      L.divIcon({
        className: 'bhopal-map-pin-wrap',
        html: `<span class="bhopal-map-pin ${isLive ? 'is-live' : ''}"><span class="bhopal-map-pin-core"></span></span>`,
        iconSize: [26, 32],
        iconAnchor: [13, 30],
        popupAnchor: [0, -28],
      });

    selectedCentres.forEach((biz, idx) => {
      let coords = COORDS_BY_ID[biz.id];
      if (!coords && biz.area && AREA_CENTROIDS[biz.area]) {
        const base = AREA_CENTROIDS[biz.area];
        const jitter = ((idx % 5) - 2) * 0.0022;
        coords = [base[0] + jitter, base[1] - jitter];
      }
      if (!coords) return;

      const meta = getBusinessQueueMeta(db, biz, QueueEngine);
      const cat = getDirectoryCategory(biz.directoryCategoryId);
      const waitingDisplay = meta.waitingCount !== null ? `${meta.waitingCount}` : '—';
      const waitTimeDisplay = meta.estWaitMin !== null ? `~${meta.estWaitMin} min` : '—';
      const areaLabel = biz.area || biz.locality || 'Bhopal';

      const popupHtml = `
        <div class="bhopal-popup-card">
          <div class="bhopal-popup-kicker">${Utils.esc(areaLabel)} · ${Utils.esc(cat.shortName)}</div>
          <div class="bhopal-popup-name">${Utils.esc(localizeCentre(biz))}</div>
          <div class="bhopal-popup-status ${meta.statusClass}">${Utils.esc(meta.statusLabel)}</div>
          <div class="bhopal-popup-stats">
            <div class="bhopal-popup-stat">
              <span class="bhopal-popup-stat-label">Waiting</span>
              <strong class="bhopal-popup-stat-val mono">${Utils.esc(waitingDisplay)}</strong>
            </div>
            <div class="bhopal-popup-stat">
              <span class="bhopal-popup-stat-label">Est. Wait</span>
              <strong class="bhopal-popup-stat-val mono">${Utils.esc(waitTimeDisplay)}</strong>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm btn-block bhopal-map-book-btn" data-map-book-id="${Utils.esc(
            biz.id
          )}">Book Here</button>
        </div>
      `;

      L.marker(coords, { icon: createPinIcon(meta.canBook), title: biz.name })
        .addTo(map)
        .bindPopup(popupHtml, {
          className: 'bhopal-glass-popup',
          maxWidth: 236,
          minWidth: 204,
          closeButton: true,
        });
    });

    map.on('popupopen', (ev) => {
      const popupEl = ev.popup && ev.popup.getElement ? ev.popup.getElement() : null;
      if (!popupEl) return;
      const bookBtn = popupEl.querySelector('[data-map-book-id]');
      if (bookBtn) {
        bookBtn.addEventListener('click', (clickEv) => {
          clickEv.preventDefault();
          clickEv.stopPropagation();
          const bizId = bookBtn.getAttribute('data-map-book-id');
          if (bizId) {
            AppState.directory.selectedBusinessId = bizId;
            App.navigate('business');
          }
        });
      }
    });

    this._bhopalMapInstance = map;
    setTimeout(() => {
      if (this._bhopalMapInstance === map) {
        map.invalidateSize();
      }
    }, 80);
  },

  enhanceInteractiveViews() {
    this.bindInteractiveCharts();
    this.animateKpiCounters();
    this.updateLiveEtaCountdowns();
    if (AppState.route === 'home') {
      this.initFeatureShowcase();
      this.bindFeatureArtParallax();
      this.initBhopalLiveMap();
    } else {
      this.teardownFeatureShowcase();
      this.teardownBhopalLiveMap();
    }
  },
};

/* --------------------------------------------------------------------------
   11. Views — Topbar, Home, Auth, QR Verification, Customer Portal
   -------------------------------------------------------------------------- */
const Views = {};

Views.renderTopbar = () => {
  const actor = getActor();
  const route = AppState.route;
  const navItems = [
    { id: 'home', label: t('navHome') },
    { id: 'directory', label: t('navDirectory') },
    { id: 'customer', label: t('navCustomer') },
    { id: 'operator', label: t('navOperator') },
    { id: 'admin', label: t('navAdmin') },
  ];

  const primaryAction = actor
    ? `<button type="button" class="btn btn-secondary btn-sm" data-action="logout">${Utils.esc(t('signOut'))}</button>`
    : `<button type="button" class="btn btn-primary btn-sm" data-nav="auth">${Utils.esc(t('signIn'))}</button>`;

  const isDark = AppState.db.settings.theme === 'dark';
  const isDirActive = route === 'directory' || route === 'business';

  return `
    <header class="topbar">
      <div class="topbar-inner">
        <button type="button" class="brand-mark" data-nav="home">
          <span class="brand-emblem" aria-hidden="true">${UI.icon('prism', 'ui-icon')}</span>
          <span>${Utils.esc(t('brand'))}</span>
        </button>
        <nav class="topbar-nav" aria-label="Primary navigation">
          ${navItems
            .map((item) => {
              const active = item.id === 'directory' ? isDirActive : route === item.id;
              return `<button type="button" class="nav-link ${active ? 'active' : ''}" data-nav="${item.id}">${Utils.esc(
                item.label
              )}</button>`;
            })
            .join('')}
        </nav>
        <div class="topbar-action">${primaryAction}</div>
      </div>
    </header>
    <div class="mobile-nav-strip" role="navigation" aria-label="Mobile navigation">
      ${navItems
        .map((item) => {
          const active = item.id === 'directory' ? isDirActive : route === item.id;
          return `<button type="button" class="btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}" data-nav="${
            item.id
          }">${Utils.esc(item.label)}</button>`;
        })
        .join('')}
      <button type="button" class="btn btn-sm ${route === 'display' ? 'btn-primary' : 'btn-ghost'}" data-nav="display">${Utils.esc(
        t('navDisplay')
      )}</button>
      <button type="button" class="btn btn-sm ${route === 'verify' ? 'btn-primary' : 'btn-ghost'}" data-nav="verify">${Utils.esc(
        t('navVerify')
      )}</button>
    </div>
    <div class="utility-strip">
      <div class="utility-strip-inner">
        <div class="meta-line">
          ${(() => {
            const be = AppState.backend;
            let dotClass = 'warn';
            let statusLabel = 'Supabase: Setup Required';
            if (be.configured) {
              if (be.connectionState === 'error') {
                dotClass = 'error';
                statusLabel = 'Supabase: Connection Error';
              } else if (be.loading || be.connectionState === 'connecting') {
                dotClass = 'connecting';
                statusLabel = 'Supabase: Syncing...';
              } else if (be.realtimeState === 'live') {
                dotClass = 'live';
                statusLabel = 'Supabase Live · Realtime';
              } else {
                dotClass = 'connected';
                statusLabel = 'Supabase Connected';
              }
            }
            return `
              <button type="button" class="sb-status-pill" data-action="open-setup-guide" title="Inspect Supabase backend status and setup guide">
                <span class="sb-dot sb-dot-${dotClass}" aria-hidden="true"></span>
                <span>${Utils.esc(statusLabel)}</span>
              </button>
            `;
          })()}
          <span class="meta-sep" aria-hidden="true">·</span>
          <span>${
            actor
              ? `${Utils.esc(actor.name)} (${Utils.esc(actor.role)})`
              : Utils.esc(t('localModeNotice'))
          }</span>
        </div>
        <div class="utility-controls">
          ${
            AppState.backend.configured
              ? `<button type="button" class="utility-link-btn" data-action="refresh-supabase" title="Sync latest data from Supabase">${
                  AppState.backend.syncing ? 'Syncing...' : 'Refresh'
                }</button>`
              : `<button type="button" class="utility-link-btn" data-action="open-setup-guide">Setup Guide</button>`
          }
          ${
            actor
              ? (() => {
                  const unread = NotificationService.getUnreadCount(AppState.db, actor.id);
                  return `<button type="button" class="utility-link-btn ${
                    unread > 0 ? 'utility-alert-unread' : ''
                  }" data-action="open-notifications">Alerts${unread > 0 ? ` (${unread})` : ''}</button>`;
                })()
              : ''
          }
          <button type="button" class="utility-link-btn ${route === 'display' ? 'active' : ''}" data-nav="display">${Utils.esc(
            t('navDisplay')
          )}</button>
          <button type="button" class="utility-link-btn ${route === 'verify' ? 'active' : ''}" data-nav="verify">${Utils.esc(
            t('navVerify')
          )}</button>
          <button type="button" class="utility-link-btn" data-action="toggle-lang">${Utils.esc(t('languageLabel'))}</button>
          <button
            type="button"
            class="utility-link-btn theme-toggle-btn ${isDark ? 'active' : ''}"
            data-action="toggle-theme"
            aria-pressed="${isDark ? 'true' : 'false'}"
            title="${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}"
          >
            ${UI.icon(isDark ? 'sun' : 'moon', 'ui-icon')}
            <span>${Utils.esc(isDark ? t('lightMode') : t('darkMode'))}</span>
          </button>
        </div>
      </div>
    </div>
    ${
      !AppState.backend.configured
        ? `<div class="sb-banner sb-banner-warn" role="status">
            <div class="sb-banner-inner">
              <span><strong>Supabase Configuration Required:</strong> Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> and run the SQL migrations to enable live Auth, PostgreSQL queues, and cross-device Realtime sync.</span>
              <button type="button" class="btn btn-secondary btn-sm" data-action="open-setup-guide">Open Setup Guide</button>
            </div>
          </div>`
        : AppState.backend.loading
        ? `<div class="sb-banner sb-banner-info" role="status">
            <div class="sb-banner-inner">
              <span class="sb-spinner" aria-hidden="true"></span>
              <span>Loading live businesses, counters, and queue states from Supabase...</span>
            </div>
          </div>`
        : AppState.backend.error
        ? `<div class="sb-banner sb-banner-error" role="alert">
            <div class="sb-banner-inner">
              <span><strong>Supabase Error:</strong> ${Utils.esc(AppState.backend.error)}</span>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" class="btn btn-secondary btn-sm" data-action="refresh-supabase">Retry Connection</button>
                <button type="button" class="btn btn-ghost btn-sm" data-action="open-setup-guide">Setup Guide</button>
              </div>
            </div>
          </div>`
        : ''
    }
  `;
};

Views.renderFeatureShowcase = (db) => {
  const openCounters = db.counters.filter((c) => c.status === 'open');
  const cntA = openCounters[0] || db.counters[0] || { id: 'CNT1', number: 'Counter 1', name: 'General Services', centreId: '', maxCapacity: 15 };
  const cntB = openCounters[1] || db.counters[1] || { id: 'CNT2', number: 'Counter 2', name: 'Express Desk', centreId: '', maxCapacity: 15 };
  const stateA = cntA.id ? QueueEngine.getCounterState(db, cntA.id) : { waiting: [], projectedWaitMin: 6 };
  const stateB = cntB.id ? QueueEngine.getCounterState(db, cntB.id) : { waiting: [], projectedWaitMin: 14 };
  const fastest = stateA.projectedWaitMin <= stateB.projectedWaitMin ? { cnt: cntA, st: stateA } : { cnt: cntB, st: stateB };
  const slower = fastest.cnt.id === cntA.id ? { cnt: cntB, st: stateB } : { cnt: cntA, st: stateA };
  const primaryCentre = db.centres.find((c) => c.id === fastest.cnt.centreId) || db.centres[0] || { name: 'Central Service Centre', city: 'Main Hub' };
  const sampleToken =
    db.tokens.find((tok) => tok.status === 'Waiting' || tok.status === 'Called') ||
    db.tokens[0] || {
      id: 'TOK-DEMO-101',
      tokenNumber: 'A-104',
      centreId: primaryCentre.id || 'CTR1',
      counterId: fastest.cnt.id,
      status: 'Waiting',
      etaMin: 8,
    };
  const qrPayload = QRGenerator.buildPayload(sampleToken);
  const sampleCat = db.categories.find((c) => c.id === sampleToken.categoryId) || db.categories[0] || { name: 'Document & Account Services' };

  const phoneShell = (screenLabel, bodyHtml) => `
    <div class="phone-stage">
      <div class="phone-ambient-orb" aria-hidden="true"></div>
      <div class="phone-3d-rig">
        <div class="phone-3d-float">
          <div class="phone-device">
            <div class="phone-bezel">
              <div class="phone-screen">
                <div class="phone-glass-glare" aria-hidden="true"></div>
                <div class="phone-statusbar" aria-hidden="true">
                  <span class="ph-mono">9:41</span>
                  <span class="phone-island"></span>
                  <span class="phone-status-icons">
                    <svg width="13" height="10" viewBox="0 0 14 10" fill="currentColor"><rect x="0" y="6" width="2.2" height="4" rx="0.8"/><rect x="3.5" y="4" width="2.2" height="6" rx="0.8"/><rect x="7" y="2" width="2.2" height="8" rx="0.8"/><rect x="10.5" y="0" width="2.2" height="10" rx="0.8"/></svg>
                    <svg width="16" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1" y="1.5" width="13" height="7" rx="1.8"/><rect x="2.8" y="3.2" width="8.5" height="3.6" rx="0.7" fill="currentColor" stroke="none"/><path d="M16 3.5v3" stroke-linecap="round"/></svg>
                  </span>
                </div>
                <div class="phone-app-bar">
                  <span class="phone-brand">
                    <span class="phone-brand-badge" aria-hidden="true">${UI.icon('prism', 'ui-icon')}</span>
                    <span>SmartQ</span>
                  </span>
                  <span class="phone-app-label">${Utils.esc(screenLabel)}</span>
                </div>
                <div class="phone-body">${bodyHtml}</div>
                <div class="phone-home-bar" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="phone-floor-shadow" aria-hidden="true"></div>
    </div>
  `;

  const slides = [
    {
      step: '01',
      shortLabel: 'Book Token',
      kicker: 'Counter Recommendation Engine',
      title: 'Book Your Token',
      desc: 'Compare live wait times across open counters, pick the SmartQ recommended fastest desk, and reserve an immediate or scheduled slot in seconds.',
      points: [
        'Compares live queue length and Smart ETA per counter',
        'Highlights the fastest open counter automatically',
        'Supports immediate walk-in and scheduled time slots',
      ],
      ctaLabel: t('bookTokenCta'),
      ctaAttr: 'data-action="start-booking"',
      screenLabel: 'Book Token',
      phoneHtml: `
        <div class="ph-step-line">
          <span>1 Service · 2 Centre</span>
          <strong>3 Counter</strong>
        </div>
        <div class="ph-card">
          <div class="ph-title">${Utils.esc(localizeCentre(primaryCentre))}</div>
          <div class="ph-sub">${Utils.esc(localizeCategory(sampleCat))}</div>
        </div>
        <div class="ph-counter-option ph-counter-best">
          <div class="ph-row">
            <strong class="ph-title">${Utils.esc(fastest.cnt.number)}</strong>
            <span class="ph-mono" style="font-size:0.72rem;font-weight:700;color:var(--periwinkle-600);">~${fastest.st.projectedWaitMin || 6} min</span>
          </div>
          <div class="ph-row" style="margin-top:3px;">
            <span class="ph-sub">${Utils.esc(fastest.cnt.name)}</span>
            <span style="font-size:0.62rem;font-weight:700;color:var(--semantic-green);">Recommended</span>
          </div>
          <div class="ph-sub" style="margin-top:3px;">${fastest.st.waiting.length} waiting · Low traffic</div>
        </div>
        <div class="ph-counter-option">
          <div class="ph-row">
            <strong class="ph-title">${Utils.esc(slower.cnt.number)}</strong>
            <span class="ph-mono" style="font-size:0.72rem;font-weight:600;color:var(--text-secondary);">~${Math.max(slower.st.projectedWaitMin || 14, (fastest.st.projectedWaitMin || 6) + 6)} min</span>
          </div>
          <div class="ph-sub" style="margin-top:2px;">${Utils.esc(slower.cnt.name)} · ${slower.st.waiting.length} waiting</div>
        </div>
        <div class="ph-cta-btn ph-anim-press">Confirm Token Booking</div>
        <div class="ph-booking-toast">
          ${UI.icon('check', 'ui-icon')}
          <span>Token reserved at ${Utils.esc(fastest.cnt.number)}</span>
        </div>
        <span class="ph-tap-dot ph-tap-book" aria-hidden="true"></span>
      `,
    },
    {
      step: '02',
      shortLabel: 'Digital QR',
      kicker: 'Privacy-Safe Check-In Pass',
      title: 'Digital QR Token',
      desc: 'Receive an instant digital queue token paired with a scannable QR code for contactless desk verification—keeping personal phone numbers completely private.',
      points: [
        'Instant QR generation encoded with verified token ID only',
        'Tap to enlarge, download PNG, or print paperless slip',
        'Verified in one scan at any reception or counter terminal',
      ],
      ctaLabel: t('verifyQrCta'),
      ctaAttr: 'data-nav="verify"',
      screenLabel: 'Active Token',
      phoneHtml: `
        <div class="ph-card ph-qr-pass">
          <div class="ph-sub">${Utils.esc(localizeCentre(primaryCentre))} · ${Utils.esc(fastest.cnt.number)}</div>
          <div class="ph-token-big">${Utils.esc(sampleToken.tokenNumber)}</div>
          <div class="ph-sub" style="color:var(--semantic-blue);font-weight:600;">Waiting · Privacy-Safe QR Pass</div>
          <div class="ph-qr-stage">
            <canvas data-qr-payload="${Utils.esc(qrPayload)}" data-qr-size="132" aria-label="SmartQ sample QR token ${Utils.esc(sampleToken.tokenNumber)}"></canvas>
            <div class="ph-qr-scanline" aria-hidden="true"></div>
          </div>
          <div class="ph-sub ph-mono">ID: ${Utils.esc(sampleToken.id)}</div>
          <div class="ph-qr-actions">
            <div class="ph-mini-btn">Enlarge QR</div>
            <div class="ph-mini-btn">Download PNG</div>
          </div>
        </div>
      `,
    },
    {
      step: '03',
      shortLabel: 'Live Queue',
      kicker: 'Rolling Smart ETA Engine',
      title: 'Live Queue Tracking',
      desc: 'Watch your exact queue position move forward in real time with a live ETA countdown ring, waiting count ahead, and four-stage progress milestones.',
      points: [
        'Smart ETA recalculates dynamically from actual service times',
        'Visual countdown ring and people-ahead counter update live',
        'Clear four-stage milestone tracker from Booked to Serving',
      ],
      ctaLabel: 'Open Customer Portal',
      ctaAttr: 'data-nav="customer"',
      screenLabel: 'Live Queue',
      phoneHtml: `
        <div class="ph-card">
          <div class="ph-row">
            <div>
              <div class="ph-sub">Active Token</div>
              <div class="ph-title ph-mono" style="font-size:1.1rem;">${Utils.esc(sampleToken.tokenNumber)}</div>
            </div>
            <span class="ph-sub" style="font-weight:700;color:var(--periwinkle-600);" data-demo-status>Waiting in Queue</span>
          </div>
        </div>
        <div class="ph-card ph-live-ring-row">
          <svg class="ph-eta-svg" viewBox="0 0 56 56" aria-hidden="true">
            <defs>
              <linearGradient id="ph-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3e5cf8"/>
                <stop offset="100%" stop-color="#8b6cfa"/>
              </linearGradient>
            </defs>
            <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(130,150,214,0.22)" stroke-width="5"/>
            <circle class="ph-eta-arc" data-demo-arc cx="28" cy="28" r="23" stroke-dasharray="144.5" stroke-dashoffset="78"/>
          </svg>
          <div>
            <div class="ph-sub">Estimated Wait</div>
            <div class="ph-metric-val" data-demo-eta>~14 min</div>
            <div class="ph-sub">${Utils.esc(fastest.cnt.number)} · Live sync</div>
          </div>
        </div>
        <div class="ph-live-metrics">
          <div class="ph-metric-box">
            <div class="ph-sub">Position</div>
            <div class="ph-metric-val" data-demo-pos>#3</div>
          </div>
          <div class="ph-metric-box">
            <div class="ph-sub">Queue Ahead</div>
            <div class="ph-metric-val" data-demo-ahead>2 ahead</div>
          </div>
        </div>
        <div class="ph-card">
          <div class="ph-sub" style="font-weight:600;color:var(--navy-900);">Queue Progress</div>
          <div class="ph-progress-track">
            <div class="ph-progress-fill" data-demo-bar style="width:46%;"></div>
          </div>
          <div class="ph-milestones">
            <span class="ph-ms-item done" data-demo-ms="0">Booked</span>
            <span class="ph-ms-item current" data-demo-ms="1">Waiting</span>
            <span class="ph-ms-item" data-demo-ms="2">Next Up</span>
            <span class="ph-ms-item" data-demo-ms="3">Serving</span>
          </div>
        </div>
      `,
    },
    {
      step: '04',
      shortLabel: 'Smart Alerts',
      kicker: 'Automated Threshold Alerts',
      title: 'Smart Notifications',
      desc: 'Wait comfortably away from crowded counters. SmartQ sends timely alerts as your turn approaches, when a counter pauses, and the moment your token is called.',
      points: [
        'Automatic alerts at 5 ahead, 3 ahead, and next-in-line',
        'Instant call alert when the operator summons your token',
        'Real-time counter pause, resume, and ETA shift notices',
      ],
      ctaLabel: 'Open Customer Portal',
      ctaAttr: 'data-nav="customer"',
      screenLabel: 'Alerts',
      phoneHtml: `
        <div class="ph-notif-head">
          <span class="ph-bell-wrap">
            <span class="ph-bell-icon" style="color:var(--periwinkle-600);display:inline-flex;">${UI.icon('bell', 'ui-icon')}</span>
            <span>Notification Centre</span>
          </span>
          <span class="ph-sub ph-mono" style="font-weight:700;color:var(--periwinkle-600);">3 Unread</span>
        </div>
        <div class="ph-notif-stack">
          <div class="ph-notif-card ph-notif-urgent ph-notif-3">
            <div class="ph-row">
              <span class="ph-notif-kicker called">Token Called · Now</span>
              <span class="ph-sub ph-mono">Just now</span>
            </div>
            <div class="ph-title" style="font-size:0.74rem;">Proceed to ${Utils.esc(fastest.cnt.number)}</div>
            <div class="ph-sub">Token ${Utils.esc(sampleToken.tokenNumber)} is now called at ${Utils.esc(fastest.cnt.name)}.</div>
          </div>
          <div class="ph-notif-card ph-notif-2">
            <div class="ph-row">
              <span class="ph-notif-kicker">Turn Approaching</span>
              <span class="ph-sub ph-mono">2m ago</span>
            </div>
            <div class="ph-title" style="font-size:0.74rem;">You are next in line</div>
            <div class="ph-sub">1 person ahead at ${Utils.esc(fastest.cnt.number)}. Please stay near the desk.</div>
          </div>
          <div class="ph-notif-card ph-notif-1">
            <div class="ph-row">
              <span class="ph-notif-kicker">Queue Milestone</span>
              <span class="ph-sub ph-mono">6m ago</span>
            </div>
            <div class="ph-title" style="font-size:0.74rem;">3 people ahead (~10 min)</div>
            <div class="ph-sub">Smart ETA updated after the previous visit completed early.</div>
          </div>
        </div>
      `,
    },
    {
      step: '05',
      shortLabel: 'Reschedule',
      kicker: 'Self-Service Queue Control',
      title: 'Easy Cancellation',
      desc: 'Plans changed? Switch to another open counter, reschedule your slot, or cancel in one tap—automatically freeing your spot and recalculating ETAs for everyone behind.',
      points: [
        'Switch counters or adjust scheduled time without re-registering',
        'One-tap cancellation immediately releases the queue position',
        'Automatic ETA recalculation keeps the line fair and accurate',
      ],
      ctaLabel: 'Manage My Tokens',
      ctaAttr: 'data-nav="customer"',
      screenLabel: 'Manage Token',
      phoneHtml: `
        <div class="ph-card">
          <div class="ph-row">
            <div>
              <div class="ph-title ph-mono" style="font-size:1rem;">${Utils.esc(sampleToken.tokenNumber)}</div>
              <div class="ph-sub">${Utils.esc(fastest.cnt.number)} · ${Utils.esc(localizeCentre(primaryCentre))}</div>
            </div>
            <span class="ph-sub" style="font-weight:700;color:var(--semantic-blue);">Waiting</span>
          </div>
          <div class="ph-action-pair">
            <div class="ph-btn-resched">Reschedule</div>
            <div class="ph-btn-cancel">Cancel Booking</div>
          </div>
        </div>
        <div class="ph-sheet">
          <div class="ph-title" style="font-size:0.76rem;">Update Token Slot</div>
          <div class="ph-sheet-choice">
            <strong>Switch to ${Utils.esc(slower.cnt.number)}</strong>
            <div class="ph-sub">${Utils.esc(slower.cnt.name)} · Open now</div>
          </div>
          <div class="ph-sheet-choice" style="background:rgba(255,241,242,0.75);border-color:rgba(190,18,60,0.25);">
            <strong style="color:var(--semantic-red);">Cancel & Release Spot</strong>
            <div class="ph-sub">Moves waiting customers up automatically</div>
          </div>
          <div class="ph-sheet-status">
            ${UI.icon('check', 'ui-icon')}
            <span>Queue updated · ETAs recalculated</span>
          </div>
        </div>
      `,
    },
  ];

  return `
    <section
      id="smartq-feature-showcase"
      class="showcase-section"
      aria-roledescription="carousel"
      aria-label="SmartQ Feature Showcase"
    >
      <div class="showcase-head">
        <div>
          <div class="showcase-kicker">Interactive Product Tour · 5 Core Workflows</div>
          <h2 class="showcase-heading">See SmartQ Working in Real Time</h2>
        </div>
        <div class="showcase-head-controls">
          <span class="showcase-counter" data-showcase-counter aria-live="polite">01 / 05</span>
          <button type="button" class="showcase-arrow-btn" data-showcase-prev aria-label="Previous feature slide">
            ${UI.icon('chevronLeft', 'ui-icon-md')}
          </button>
          <button type="button" class="showcase-arrow-btn" data-showcase-next aria-label="Next feature slide">
            ${UI.icon('chevronRight', 'ui-icon-md')}
          </button>
        </div>
      </div>

      <div class="showcase-viewport" data-showcase-viewport>
        <div class="showcase-track" data-showcase-track>
          ${slides
            .map(
              (s, i) => `
              <article
                class="showcase-slide ${i === 0 ? 'is-active' : ''}"
                data-showcase-slide="${i}"
                aria-roledescription="slide"
                aria-label="${s.step} of 05: ${Utils.esc(s.title)}"
                aria-hidden="${i === 0 ? 'false' : 'true'}"
              >
                ${phoneShell(s.screenLabel, s.phoneHtml)}
                <div class="showcase-story">
                  <div class="showcase-step-meta">
                    <span class="showcase-step-num">${s.step} / 05</span>
                    <span aria-hidden="true">·</span>
                    <span>${Utils.esc(s.kicker)}</span>
                  </div>
                  <h3 class="showcase-slide-title">${Utils.esc(s.title)}</h3>
                  <p class="showcase-slide-desc">${Utils.esc(s.desc)}</p>
                  <ul class="showcase-points">
                    ${s.points
                      .map(
                        (pt) => `
                        <li>
                          <span class="showcase-point-check" aria-hidden="true">${UI.icon('check', 'ui-icon')}</span>
                          <span>${Utils.esc(pt)}</span>
                        </li>`
                      )
                      .join('')}
                  </ul>
                  <div class="showcase-action-row">
                    <button type="button" class="btn btn-primary" ${s.ctaAttr}>
                      <span>${Utils.esc(s.ctaLabel)}</span>
                      ${UI.icon('arrowRight', 'ui-icon')}
                    </button>
                  </div>
                </div>
              </article>
            `
            )
            .join('')}
        </div>
      </div>

      <div class="showcase-footer">
        <div class="showcase-progress-strip" role="tablist" aria-label="Select feature step">
          ${slides
            .map(
              (s, i) => `
              <button
                type="button"
                class="showcase-prog-step ${i === 0 ? 'is-active' : ''}"
                data-showcase-prog="${i}"
                aria-label="Go to ${Utils.esc(s.title)}"
              >
                <span class="showcase-prog-label">${s.step}. ${Utils.esc(s.shortLabel)}</span>
                <span class="showcase-prog-bar" aria-hidden="true">
                  <span class="showcase-prog-fill"></span>
                </span>
              </button>
            `
            )
            .join('')}
        </div>
        <div class="showcase-bottom-bar">
          <div class="showcase-dots" role="tablist" aria-label="Slide pagination">
            ${slides
              .map(
                (s, i) => `
                <button
                  type="button"
                  class="showcase-dot ${i === 0 ? 'is-active' : ''}"
                  data-showcase-dot="${i}"
                  role="tab"
                  aria-selected="${i === 0 ? 'true' : 'false'}"
                  aria-label="Slide ${i + 1}: ${Utils.esc(s.title)}"
                ></button>
              `
              )
              .join('')}
          </div>
          <span class="showcase-autoplay-note" data-showcase-note>Autoplay · Hover to pause · Swipe on mobile</span>
        </div>
      </div>
    </section>
  `;
};

Views.renderCategorySelectionSection = (db, { compact = false } = {}) => {
  const bhopalEntries = db.centres.filter((c) => c.dataScope !== 'demo' && c.isActive);
  const onboardedBhopalCount = bhopalEntries.filter((c) => c.isOnboarded && c.bookingEnabled !== false).length;

  return `
    <section class="surface bhopal-discovery-section" aria-label="Where do you want to go in Bhopal">
      <div class="section-header" style="margin-bottom:20px;">
        <div>
          <div class="hero-kicker" style="margin-bottom:6px;">Bhopal Multi-Category Directory</div>
          <h2 class="section-title">${Utils.esc(t('whereToGoTitle'))}</h2>
          <p class="section-subtitle">${Utils.esc(t('whereToGoSub'))}</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button type="button" class="btn btn-primary btn-sm" data-browse-scope="bhopal">Browse All Bhopal (${bhopalEntries.length})</button>
          <button type="button" class="btn btn-secondary btn-sm" data-browse-scope="demo">Interactive Demo Sandbox</button>
        </div>
      </div>

      <div class="bhopal-cat-grid">
        ${BHOPAL_CATEGORIES.map((cat, index) => {
          const catBusinesses = db.centres.filter((c) => c.isActive && c.directoryCategoryId === cat.id);
          const realCount = catBusinesses.filter((c) => c.dataScope !== 'demo').length;
          const liveRealCount = catBusinesses.filter((c) => c.dataScope !== 'demo' && c.isOnboarded && c.bookingEnabled !== false).length;
          const demoCount = catBusinesses.filter((c) => c.dataScope === 'demo').length;

          let metaSummary = '';
          if (liveRealCount > 0) {
            metaSummary = `${realCount} Bhopal ${realCount === 1 ? 'listing' : 'listings'} · ${liveRealCount} live`;
          } else if (realCount > 0) {
            metaSummary = `${realCount} Bhopal ${realCount === 1 ? 'listing' : 'listings'} · Directory`;
          } else if (demoCount > 0) {
            metaSummary = `0 Bhopal listings · ${demoCount} Demo Sandbox`;
          } else {
            metaSummary = 'Directory open for onboarding';
          }

          return `
            <button
              type="button"
              class="bhopal-cat-card"
              data-open-dir-cat="${cat.id}"
            >
              <div class="bhopal-cat-head">
                <span class="glass-icon-tile bhopal-cat-icon">${UI.icon(cat.icon, 'ui-icon-md')}</span>
                <span class="bhopal-cat-idx mono">${String(index + 1).padStart(2, '0')}</span>
              </div>
              <div class="bhopal-cat-title">${Utils.esc(localizeDirCategory(cat))}</div>
              ${compact ? '' : `<p class="bhopal-cat-desc">${Utils.esc(cat.description)}</p>`}
              <div class="bhopal-cat-meta">${Utils.esc(metaSummary)}</div>
            </button>
          `;
        }).join('')}
      </div>

      <div class="bhopal-area-strip">
        <div class="bhopal-area-strip-head">
          <span class="bhopal-area-label">${UI.icon('mapPin', 'ui-icon')} Filter Bhopal by Area</span>
          <span class="text-xs text-muted">${bhopalEntries.length} Bhopal establishments · ${onboardedBhopalCount} live onboarded</span>
        </div>
        <div class="area-filter-bar" role="group" aria-label="Bhopal locality filters">
          ${BHOPAL_AREAS.map(
            (area) =>
              `<button type="button" class="area-chip-btn" data-open-dir-area="${Utils.esc(area)}">${Utils.esc(area)}</button>`
          ).join('')}
        </div>
      </div>
    </section>
  `;
};

Views.renderHome = () => {
  const db = AppState.db;
  const kpis = AnalyticsEngine.getOverviewKpis(db);
  const openCounters = db.counters.filter((c) => {
    const ctr = db.centres.find((x) => x.id === c.centreId);
    return c.status === 'open' && ctr && ctr.isActive && ctr.isOnboarded;
  }).length;
  const bhopalDirCount = db.centres.filter((c) => c.dataScope !== 'demo' && c.isActive).length;
  const liveCentresCount = db.centres.filter((c) => c.isActive && c.isOnboarded && c.bookingEnabled !== false).length;

  return `
    <main id="main-content" class="container">
      <section class="hero-split">
        <div class="hero-copy">
          <div>
            <div class="hero-kicker">${Utils.esc(t('heroKicker'))}</div>
            <h1 class="hero-headline">${Utils.esc(t('heroTitle'))}</h1>
            <p class="hero-desc">${Utils.esc(t('heroDesc'))}</p>
            ${UI.renderVisual(
              UI.MEDIA.heroWaiting,
              'Warm-lit modern Indian service hall and waiting lounge with senior citizens, women, and families seated comfortably while digital token screens display live numbers',
              'hero-visual-banner',
              {
                eager: true,
                icon: 'monitor',
                fallbackLabel: 'SmartQ Bhopal Digital Service Lounge',
                overlayHtml: `<div class="hero-visual-scrim">
                  <span class="hero-visual-caption">Bhopal multi-category directory + live QR queue orchestration for hospitals, labs, retail &amp; salons</span>
                  <span class="hero-visual-meta mono">${bhopalDirCount} Bhopal Listings · ${openCounters} Live Counters</span>
                </div>`,
              }
            )}
          </div>
          <div class="hero-cta-row">
            <button type="button" class="btn btn-lg hero-cta-primary" data-nav="directory">${Utils.esc(
              t('bookTokenCta')
            )}</button>
            <button type="button" class="btn btn-lg hero-cta-secondary" data-action="start-booking">Book Live Token</button>
            <button type="button" class="btn btn-lg hero-cta-secondary" data-nav="display">${Utils.esc(
              t('openDisplayCta')
            )}</button>
            <button type="button" class="btn btn-lg hero-cta-secondary" data-nav="verify">${Utils.esc(
              t('verifyQrCta')
            )}</button>
          </div>
        </div>

        <div class="hero-panel">
          <div>
            <h2 style="font-size:1.125rem;margin-bottom:4px;">SmartQ Workspaces</h2>
            <p class="text-sm text-secondary">Explore the Bhopal directory or open a dedicated queue workspace.</p>
          </div>
          <div class="bhopal-map-widget" aria-label="Bhopal Live Service Map">
            <div class="bhopal-map-header">
              <div class="bhopal-map-title-group">
                <span class="bhopal-map-title-icon" aria-hidden="true">${UI.icon('mapPin', 'ui-icon')}</span>
                <span class="bhopal-map-title">Bhopal Live Service Map</span>
              </div>
              <span class="bhopal-map-badge">Nearby Centres</span>
            </div>
            <div
              id="bhopal-hero-map"
              class="bhopal-hero-map-canvas"
              role="region"
              aria-label="Interactive map of Bhopal service centres"
            ></div>
          </div>
          <div class="role-list">
            <div class="role-row">
              <div class="role-row-lead">
                <span class="glass-icon-tile">${UI.icon('mapPin', 'ui-icon-md')}</span>
                <div>
                  <div class="role-row-title">Bhopal Directory &amp; Booking</div>
                  <div class="role-row-desc">10 categories, 15 Bhopal areas, verified listings &amp; counter selection</div>
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" data-nav="directory">Explore</button>
            </div>
            <div class="role-row">
              <div class="role-row-lead">
                <span class="glass-icon-tile">${UI.icon('ticket', 'ui-icon-md')}</span>
                <div>
                  <div class="role-row-title">Customer Token Portal</div>
                  <div class="role-row-desc">Live QR tokens, ETA countdowns, reschedule, alerts &amp; history</div>
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" data-nav="customer">Open</button>
            </div>
            <div class="role-row">
              <div class="role-row-lead">
                <span class="glass-icon-tile">${UI.icon('headset', 'ui-icon-md')}</span>
                <div>
                  <div class="role-row-title">Counter Operator Station</div>
                  <div class="role-row-desc">Dedicated single-counter call, arrive, serve, skip &amp; recall desk</div>
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" data-nav="operator">Open</button>
            </div>
            <div class="role-row">
              <div class="role-row-lead">
                <span class="glass-icon-tile">${UI.icon('sliders', 'ui-icon-md')}</span>
                <div>
                  <div class="role-row-title">Administrator Console</div>
                  <div class="role-row-desc">Onboard &amp; verify Bhopal businesses, configure counters, hours &amp; rules</div>
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" data-nav="admin">Open</button>
            </div>
          </div>
        </div>
      </section>

      ${Views.renderCategorySelectionSection(db)}

      <section class="kpi-grid" aria-label="Live queue summary">
        <div class="kpi-tile">
          <div class="kpi-label">Bhopal Directory Listings</div>
          <div class="kpi-value">${bhopalDirCount}</div>
          <div class="kpi-foot">Across 10 categories &amp; 15 Bhopal areas</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-label">Active Waiting Queue</div>
          <div class="kpi-value">${kpis.waiting}</div>
          <div class="kpi-foot">${kpis.serving} serving across onboarded/demo queues</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-label">Open Service Counters</div>
          <div class="kpi-value">${openCounters} / ${db.counters.length}</div>
          <div class="kpi-foot">Across ${liveCentresCount} live-bookable centres</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-label">Completed Today</div>
          <div class="kpi-value">${kpis.completed}</div>
          <div class="kpi-foot">Avg. service ~${kpis.avgService} min (recorded history)</div>
        </div>
      </section>

      ${Views.renderFeatureShowcase(db)}

      <section class="feature-visual-grid" aria-label="SmartQ platform workflows">
        <article class="feature-visual-card">
          ${UI.renderVisual(
            UI.MEDIA.artBookingEta,
            'Smiling Indian woman sitting comfortably at home with her elderly mother checking their digital queue token and live wait time on a smartphone',
            'feature-visual-media feature-photo-stage feature-photo-booking',
            {
              icon: 'ticket',
              fallbackLabel: 'Remote Booking & Live ETA',
              overlayHtml: `
                <div class="feature-photo-scrim" aria-hidden="true"></div>
                <div class="feature-photo-overlay feature-photo-corner-bl" aria-hidden="true">
                  <span class="feature-glass-badge">
                    <span class="feature-badge-dot"></span>
                    <span>Token <strong class="feature-badge-mono">A-104</strong> · <strong class="feature-badge-mono">~8m ETA</strong></span>
                  </span>
                </div>
              `,
            }
          )}
          <div class="feature-visual-body">
            <h2 class="feature-visual-title">Remote Booking &amp; Live ETA</h2>
            <p class="feature-visual-desc">Reserve digital tokens or scheduled slots at onboarded counters with dynamic wait estimates.</p>
            <button type="button" class="feature-visual-link" data-nav="directory">
              <span>${Utils.esc(t('bookTokenCta'))}</span>
              ${UI.icon('arrowRight', 'ui-icon')}
            </button>
          </div>
        </article>

        <article class="feature-visual-card">
          ${UI.renderVisual(
            UI.MEDIA.artQrVerify,
            'Indian visitor scanning a QR code on their smartphone at a clean bank and clinic reception desk with a friendly Indian staff member assisting',
            'feature-visual-media feature-photo-stage feature-photo-qr',
            {
              icon: 'shield',
              fallbackLabel: 'Contactless QR Verification',
              overlayHtml: `
                <div class="feature-photo-scrim" aria-hidden="true"></div>
                <div class="feature-photo-overlay feature-photo-corner-bl" aria-hidden="true">
                  <span class="feature-glass-pill feature-glass-pill-verified">
                    ${UI.icon('shield', 'ui-icon')}
                    <span>Privacy-Safe Verified</span>
                  </span>
                </div>
              `,
            }
          )}
          <div class="feature-visual-body">
            <h2 class="feature-visual-title">Contactless QR Verification</h2>
            <p class="feature-visual-desc">Instant privacy-safe QR validation at reception desks without exposing customer phone numbers or personal data.</p>
            <button type="button" class="feature-visual-link" data-nav="verify">
              <span>${Utils.esc(t('verifyQrCta'))}</span>
              ${UI.icon('arrowRight', 'ui-icon')}
            </button>
          </div>
        </article>

        <article class="feature-visual-card">
          ${UI.renderVisual(
            UI.MEDIA.artCounterOrch,
            'Organized modern Indian service centre with numbered counters, overhead digital queue display screens, and smooth stress-free waiting',
            'feature-visual-media feature-photo-stage feature-photo-counters',
            {
              icon: 'building',
              fallbackLabel: 'Live Counter Orchestration',
              overlayHtml: `
                <div class="feature-photo-scrim" aria-hidden="true"></div>
                <div class="feature-photo-overlay feature-photo-tags-row" aria-hidden="true">
                  <span class="feature-counter-tag">C1 <em>A-102</em></span>
                  <span class="feature-counter-tag">C2 <em>B-205</em></span>
                  <span class="feature-counter-tag">C3 <em>A-104</em></span>
                </div>
              `,
            }
          )}
          <div class="feature-visual-body">
            <h2 class="feature-visual-title">Live Counter Orchestration</h2>
            <p class="feature-visual-desc">Coordinate operator desks, automatic No-Show recovery, and full-screen bilingual signage boards effortlessly.</p>
            <button type="button" class="feature-visual-link" data-nav="display">
              <span>${Utils.esc(t('openDisplayCta'))}</span>
              ${UI.icon('arrowRight', 'ui-icon')}
            </button>
          </div>
        </article>
      </section>

      <section class="surface-flush">
        <div class="table-toolbar">
          <div>
            <h2 style="font-size:1.125rem;">Active Configured Counters (Live &amp; Demo Sandbox)</h2>
            <p class="text-xs text-muted">Only onboarded operational centres and clearly labeled demo sandbox counters appear here · No simulated Bhopal queues</p>
          </div>
          <button type="button" class="btn btn-accent btn-sm" data-nav="directory">Explore Bhopal Directory</button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Business / Centre</th>
                <th>Counter</th>
                <th>Status</th>
                <th>Now Serving</th>
                <th class="num-col">Waiting</th>
                <th class="num-col">Approx. Wait</th>
                <th>Traffic</th>
              </tr>
            </thead>
            <tbody>
              ${db.counters
                .map((cnt) => {
                  const centre = db.centres.find((c) => c.id === cnt.centreId);
                  if (!centre || !centre.isOnboarded) return '';
                  const st = QueueEngine.getCounterState(db, cnt.id);
                  const scopeNote = centre.dataScope === 'demo' ? 'Demo Sandbox' : centre.area || centre.city;
                  return `
                    <tr>
                      <td>
                        <button type="button" class="table-link-btn" data-open-business="${centre.id}"><strong>${Utils.esc(
                    localizeCentre(centre)
                  )}</strong></button>
                        <div class="text-xs text-muted">${Utils.esc(scopeNote)}</div>
                      </td>
                      <td>
                        <strong>${Utils.esc(cnt.number)}</strong>
                        <div class="text-xs text-muted">${Utils.esc(cnt.name)}</div>
                      </td>
                      <td><span class="status-text ${Utils.statusClass(cnt.status)}">${Utils.esc(
                    t(`statusMap.${cnt.status}`)
                  )}</span></td>
                      <td class="mono">${st.current ? Utils.esc(st.current.tokenNumber) : '—'}</td>
                      <td class="num-col">${st.waiting.length} / ${cnt.maxCapacity}</td>
                      <td class="num-col">${cnt.status === 'open' ? `~${st.projectedWaitMin} min` : '—'}</td>
                      <td><span class="status-text ${Utils.statusClass(st.congestion)}">${Utils.esc(
                    t(`congestionMap.${st.congestion}`)
                  )}</span></td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `;
};

Views.renderDirectory = () => {
  const db = AppState.db;
  const f = AppState.directory;
  const q = String(f.search || '').trim().toLowerCase();

  const allActive = db.centres.filter((c) => c.isActive);
  const bhopalCount = allActive.filter((c) => c.dataScope !== 'demo').length;
  const demoCount = allActive.filter((c) => c.dataScope === 'demo').length;
  const liveCount = allActive.filter((c) => c.isOnboarded && c.bookingEnabled !== false).length;

  const filtered = allActive.filter((c) => {
    if (f.scope === 'bhopal' && c.dataScope === 'demo') return false;
    if (f.scope === 'demo' && c.dataScope !== 'demo') return false;
    if (f.scope === 'live' && (!c.isOnboarded || c.bookingEnabled === false)) return false;
    if (f.categoryId !== 'all' && c.directoryCategoryId !== f.categoryId) return false;
    if (f.area !== 'all' && !matchesBhopalArea(c, f.area)) return false;
    if (q) {
      const hay = `${c.name} ${c.nameHi || ''} ${c.address || ''} ${c.area || ''} ${c.locality || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Sort: Operational live Bhopal businesses first, then Bhopal directory listings, then Demo Sandbox
  filtered.sort((a, b) => {
    const rank = (x) => {
      if (x.dataScope !== 'demo' && x.isOnboarded && x.bookingEnabled !== false) return 0;
      if (x.dataScope !== 'demo') return 1;
      return 2;
    };
    const rDiff = rank(a) - rank(b);
    if (rDiff !== 0) return rDiff;
    return a.name.localeCompare(b.name);
  });

  const activeCatObj = f.categoryId !== 'all' ? getDirectoryCategory(f.categoryId) : null;

  return `
    <main id="main-content" class="container">
      <div class="section-header">
        <div>
          <div class="hero-kicker" style="margin-bottom:4px;">Bhopal Multi-Category Directory</div>
          <h1 class="section-title">${
            activeCatObj ? Utils.esc(localizeDirCategory(activeCatObj)) : Utils.esc(t('whereToGoTitle'))
          }</h1>
          <p class="section-subtitle">
            Browse verified Bhopal directory listings by category and locality. Only admin-onboarded businesses accept live QR token bookings.
          </p>
        </div>
        <div class="segmented" role="tablist" aria-label="Listing scope filter">
          <button type="button" class="segmented-btn ${f.scope === 'all' ? 'active' : ''}" data-dir-scope="all">All (${allActive.length})</button>
          <button type="button" class="segmented-btn ${f.scope === 'bhopal' ? 'active' : ''}" data-dir-scope="bhopal">Bhopal Directory (${bhopalCount})</button>
          <button type="button" class="segmented-btn ${f.scope === 'live' ? 'active' : ''}" data-dir-scope="live">Live Booking (${liveCount})</button>
          <button type="button" class="segmented-btn ${f.scope === 'demo' ? 'active' : ''}" data-dir-scope="demo">Demo Sandbox (${demoCount})</button>
        </div>
      </div>

      <section class="surface" style="margin-bottom:24px;">
        <div class="dir-filter-toolbar">
          <div class="dir-search-wrap">
            <span class="dir-search-icon" aria-hidden="true">${UI.icon('search', 'ui-icon')}</span>
            <input
              type="search"
              id="bhopal-dir-search"
              class="form-input dir-search-input"
              placeholder="Search hospital, mall, salon, locality (e.g. AIIMS, MP Nagar, Karond)..."
              value="${Utils.esc(f.search)}"
            />
          </div>
          <select id="bhopal-area-select" class="form-select dir-area-select" aria-label="Filter by Bhopal area">
            <option value="all" ${f.area === 'all' ? 'selected' : ''}>All Bhopal Areas (15)</option>
            ${BHOPAL_AREAS.map(
              (a) => `<option value="${Utils.esc(a)}" ${f.area === a ? 'selected' : ''}>${Utils.esc(a)}</option>`
            ).join('')}
          </select>
          ${
            f.categoryId !== 'all' || f.area !== 'all' || f.scope !== 'all' || q
              ? `<button type="button" class="btn btn-secondary btn-sm" data-dir-reset>Reset Filters</button>`
              : ''
          }
        </div>

        <div class="dir-cat-pills" role="group" aria-label="Category filters">
          <button type="button" class="area-chip-btn ${f.categoryId === 'all' ? 'active' : ''}" data-dir-cat="all">All Categories</button>
          ${BHOPAL_CATEGORIES.map(
            (cat) =>
              `<button type="button" class="area-chip-btn ${f.categoryId === cat.id ? 'active' : ''}" data-dir-cat="${
                cat.id
              }">${Utils.esc(cat.shortName)}</button>`
          ).join('')}
        </div>

        <div class="dir-area-row">
          <span class="text-xs text-muted" style="font-weight:600;white-space:nowrap;">Bhopal Areas:</span>
          <div class="area-filter-bar" role="group" aria-label="Quick area filters">
            <button type="button" class="area-chip-btn ${f.area === 'all' ? 'active' : ''}" data-dir-area="all">All Areas</button>
            ${BHOPAL_AREAS.map(
              (area) =>
                `<button type="button" class="area-chip-btn ${f.area === area ? 'active' : ''}" data-dir-area="${Utils.esc(
                  area
                )}">${Utils.esc(area)}</button>`
            ).join('')}
          </div>
        </div>
      </section>

      <div class="meta-line" style="margin-bottom:16px;justify-content:space-between;">
        <span>Showing <strong class="mono">${filtered.length}</strong> ${filtered.length === 1 ? 'establishment' : 'establishments'}${
          activeCatObj ? ` in ${Utils.esc(localizeDirCategory(activeCatObj))}` : ''
        }${f.area !== 'all' ? ` · ${Utils.esc(f.area)}` : ''}</span>
        <span>Directory listings without live onboarding never show fabricated wait times</span>
      </div>

      ${
        filtered.length
          ? `<div class="biz-grid">
              ${filtered
                .map((biz) => {
                  const cat = getDirectoryCategory(biz.directoryCategoryId);
                  const meta = getBusinessQueueMeta(db, biz, QueueEngine);
                  const locText = biz.dataScope === 'demo'
                    ? 'Interactive Demo Sandbox · Simulated Queue'
                    : `${biz.locality && biz.locality !== biz.area ? `${biz.locality}, ` : ''}${biz.area || 'Bhopal'}`;

                  return `
                    <article class="biz-card">
                      <div class="biz-card-top">
                        <div class="biz-card-kicker">
                          <span>${Utils.esc(localizeDirCategory(cat))}</span>
                          <span class="meta-sep" aria-hidden="true">·</span>
                          <span>${Utils.esc(locText)}</span>
                        </div>
                        <h2 class="biz-card-title">${Utils.esc(localizeCentre(biz))}</h2>
                        <p class="biz-card-address">${Utils.esc(biz.address)}</p>
                      </div>

                      <div class="biz-card-status-block">
                        <div class="biz-status-row">
                          <span class="status-text ${meta.statusClass}">${Utils.esc(meta.statusLabel)}</span>
                          ${
                            biz.verified
                              ? `<span class="text-xs status-open" style="font-weight:600;display:inline-flex;align-items:center;gap:4px;">${UI.icon(
                                  'verified',
                                  'ui-icon'
                                )} Verified</span>`
                              : `<span class="text-xs text-muted">${biz.dataScope === 'demo' ? 'Sample Data' : 'Unverified Listing'}</span>`
                          }
                        </div>

                        <div class="biz-card-metrics">
                          ${
                            meta.isOnboarded && meta.counters.length > 0
                              ? `
                                <div>
                                  <span class="text-xs text-muted">Counters</span>
                                  <div class="mono text-sm" style="font-weight:700;">${meta.openCounters.length}/${meta.counters.length} Open</div>
                                </div>
                                <div>
                                  <span class="text-xs text-muted">Waiting</span>
                                  <div class="mono text-sm" style="font-weight:700;">${meta.waitingCount}</div>
                                </div>
                                <div>
                                  <span class="text-xs text-muted">Est. Wait</span>
                                  <div class="mono text-sm" style="font-weight:700;">${
                                    meta.estWaitMin !== null ? `~${meta.estWaitMin} min` : '—'
                                  }</div>
                                </div>
                              `
                              : `
                                <div class="text-xs text-secondary" style="grid-column:1/-1;">
                                  ${
                                    !meta.isOnboarded
                                      ? 'Coming Soon — Live queues &amp; counter hours will appear once onboarded and verified.'
                                      : Utils.esc(meta.eligibilityLabel)
                                  }
                                </div>
                              `
                          }
                        </div>
                      </div>

                      <div class="biz-card-footer">
                        <button type="button" class="btn ${meta.canBook ? 'btn-primary' : 'btn-secondary'} btn-sm btn-block" data-open-business="${
                          biz.id
                        }">
                          ${meta.canBook ? 'View Counters &amp; Book Token' : 'View Details &amp; Counter Templates'}
                        </button>
                      </div>
                    </article>
                  `;
                })
                .join('')}
            </div>`
          : `<section class="surface empty-state">
              <div class="empty-state-title">No establishments match these filters</div>
              <p class="empty-state-desc">
                ${
                  f.area !== 'all' || f.categoryId !== 'all'
                    ? 'No establishments are listed yet for this exact combination of category and Bhopal area. Try clearing filters or add a Bhopal business via the Admin Console.'
                    : 'Try a different search keyword or reset your filters.'
                }
              </p>
              <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                <button type="button" class="btn btn-primary btn-sm" data-dir-reset>Show All Establishments</button>
                <button type="button" class="btn btn-secondary btn-sm" data-nav="admin">Add Business in Admin</button>
              </div>
            </section>`
      }
    </main>
  `;
};

Views.renderBusinessDetail = () => {
  const db = AppState.db;
  const biz = db.centres.find((c) => c.id === AppState.directory.selectedBusinessId);
  if (!biz) {
    return `
      <main id="main-content" class="container">
        <section class="surface empty-state">
          <div class="empty-state-title">Business not found</div>
          <p class="empty-state-desc">The selected establishment could not be located in the Bhopal directory.</p>
          <button type="button" class="btn btn-primary btn-sm" data-nav="directory">Back to Bhopal Directory</button>
        </section>
      </main>
    `;
  }

  const actor = getActor();
  const isAdmin = actor && actor.role === 'admin';
  const cat = getDirectoryCategory(biz.directoryCategoryId);
  const meta = getBusinessQueueMeta(db, biz, QueueEngine);
  const templates = getSuggestedCounterTemplates(biz.directoryCategoryId);
  const dbBooking = AppState.detailBooking;

  // Reset detailBooking draft when switching businesses
  if (dbBooking.businessId !== biz.id) {
    dbBooking.businessId = biz.id;
    dbBooking.serviceId = '';
    dbBooking.counterId = '';
    dbBooking.bookingType = 'immediate';
    dbBooking.scheduledTime = '';
    dbBooking.priorityType = 'standard';
    dbBooking.priorityReason = '';
  }
  if (actor) {
    if (!dbBooking.customerName) dbBooking.customerName = actor.name || '';
    if (!dbBooking.customerPhone) dbBooking.customerPhone = actor.phone || '';
  }

  // Derive available services strictly from configured counters at this business
  const configuredCounters = meta.counters;
  const serviceIdSet = new Set();
  for (const cnt of configuredCounters) {
    for (const cid of cnt.categoryIds || []) serviceIdSet.add(cid);
  }
  const availableServices = db.categories.filter((c) => c.active && serviceIdSet.has(c.id));

  // Auto-select first available service if onboarded and none selected yet
  if (meta.isOnboarded && availableServices.length > 0 && !availableServices.some((s) => s.id === dbBooking.serviceId)) {
    dbBooking.serviceId = availableServices[0].id;
    dbBooking.counterId = '';
  }

  const counterAnalysis =
    meta.isOnboarded && dbBooking.serviceId
      ? QueueEngine.analyzeCounters(db, { centreId: biz.id, categoryId: dbBooking.serviceId })
      : null;

  if (
    counterAnalysis &&
    counterAnalysis.allCounters.length > 0 &&
    !counterAnalysis.allCounters.some((item) => item.counter.id === dbBooking.counterId && item.counter.status !== 'closed')
  ) {
    dbBooking.counterId = counterAnalysis.recommended
      ? counterAnalysis.recommended.counter.id
      : counterAnalysis.allCounters[0].counter.id;
  }

  const selectedCounter = db.counters.find((c) => c.id === dbBooking.counterId && c.centreId === biz.id) || null;
  const selectedCounterState = selectedCounter ? QueueEngine.getCounterState(db, selectedCounter.id) : null;
  const selectedService = availableServices.find((s) => s.id === dbBooking.serviceId) || null;

  const hasVerifiedHours = Boolean(biz.openTime && biz.closeTime);
  const hoursLabel = hasVerifiedHours ? `${biz.openTime} – ${biz.closeTime}` : 'Not configured / Not verified';
  const phoneLabel = biz.phone && biz.phone !== '—' ? biz.phone : 'Not listed';

  // Generate appointment slots ONLY when operating hours are explicitly configured
  const buildSlotsFromHours = (openStr, closeStr) => {
    if (!openStr || !closeStr) return [];
    const startH = Number(String(openStr).split(':')[0]);
    const endH = Number(String(closeStr).split(':')[0]);
    if (!Number.isFinite(startH) || !Number.isFinite(endH) || endH <= startH) return [];
    const out = [];
    for (let h = startH; h < endH && out.length < 10; h++) {
      out.push(`${String(h).padStart(2, '0')}:30`);
    }
    return out;
  };
  const slotOpen = (selectedCounter && selectedCounter.openTime) || biz.openTime;
  const slotClose = (selectedCounter && selectedCounter.closeTime) || biz.closeTime;
  const configuredSlots = buildSlotsFromHours(slotOpen, slotClose);

  const userRecord = actor ? db.users.find((u) => u.id === actor.id) : null;
  const isFav = Boolean(userRecord && Array.isArray(userRecord.favouriteCentreIds) && userRecord.favouriteCentreIds.includes(biz.id));

  const rules = db.settings.priorityRules || {};
  const enabledPriorities = ['senior', 'medical', 'accessibility', 'vip'].filter((k) => rules[k]);

  return `
    <main id="main-content" class="container">
      <div class="breadcrumb-bar" style="margin-bottom:18px;">
        <div class="breadcrumb-trail">
          <button type="button" class="utility-link-btn" data-nav="directory" style="padding:2px 6px;">Bhopal Directory</button>
          <span aria-hidden="true">/</span>
          <button type="button" class="utility-link-btn" data-open-dir-cat="${cat.id}" style="padding:2px 6px;">${Utils.esc(
    localizeDirCategory(cat)
  )}</button>
          <span aria-hidden="true">/</span>
          <span class="breadcrumb-current">${Utils.esc(localizeCentre(biz))}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${
            actor && actor.role !== 'guest'
              ? `<button type="button" class="btn btn-secondary btn-sm" data-toggle-fav="${biz.id}">${
                  isFav ? 'Saved ★' : 'Save ☆'
                }</button>`
              : ''
          }
          ${
            isAdmin
              ? `<button type="button" class="btn btn-accent btn-sm" data-edit-business="${biz.id}">Configure in Admin</button>`
              : ''
          }
        </div>
      </div>

      <section class="surface biz-detail-hero" style="margin-bottom:24px;">
        <div class="biz-detail-head">
          <div>
            <div class="meta-line" style="margin-bottom:8px;">
              <span>${Utils.esc(localizeDirCategory(cat))}</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span>${Utils.esc(meta.scopeLabel)}</span>
              ${
                biz.verified
                  ? `<span class="meta-sep" aria-hidden="true">·</span><span class="status-open" style="font-weight:600;">Admin Verified</span>`
                  : ''
              }
            </div>
            <h1 class="section-title" style="font-size:clamp(1.6rem,3vw,2.2rem);">${Utils.esc(localizeCentre(biz))}</h1>
            <p class="text-secondary" style="margin-top:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              ${UI.icon('mapPin', 'ui-icon')}
              <span>${Utils.esc(biz.address)}</span>
              ${
                biz.dataScope !== 'demo' && biz.area
                  ? `<span class="meta-sep" aria-hidden="true">·</span><span>Bhopal Area: <strong>${Utils.esc(biz.area)}</strong></span>`
                  : ''
              }
            </p>
            <div class="meta-line" style="margin-top:10px;">
              <span>Operating Hours: <strong>${Utils.esc(hoursLabel)}</strong></span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span>Contact: <strong>${Utils.esc(phoneLabel)}</strong></span>
            </div>
          </div>

          <div class="biz-detail-status-box">
            <div class="text-xs text-muted">Queue Availability</div>
            <div class="status-text ${meta.statusClass}" style="font-size:1rem;margin-top:4px;">${Utils.esc(meta.statusLabel)}</div>
            <div class="text-xs text-secondary" style="margin-top:4px;">${Utils.esc(meta.eligibilityLabel)}</div>
          </div>
        </div>

        <div class="biz-meta-grid">
          <div class="biz-meta-cell">
            <div class="text-xs text-muted">Available Counters</div>
            <div class="mono biz-meta-val">${
              meta.isOnboarded ? `${meta.openCounters.length} / ${meta.counters.length} Open` : 'Not configured'
            }</div>
          </div>
          <div class="biz-meta-cell">
            <div class="text-xs text-muted">Current Waiting Count</div>
            <div class="mono biz-meta-val">${meta.waitingCount !== null ? meta.waitingCount : 'Unavailable'}</div>
          </div>
          <div class="biz-meta-cell">
            <div class="text-xs text-muted">Est. Waiting Time</div>
            <div class="mono biz-meta-val">${meta.estWaitMin !== null ? `~${meta.estWaitMin} min` : 'Unavailable'}</div>
          </div>
          <div class="biz-meta-cell">
            <div class="text-xs text-muted">Booking Eligibility</div>
            <div class="biz-meta-val" style="font-size:0.9375rem;">${
              meta.canBook ? 'Eligible Now' : meta.isOnboarded ? 'Paused / Closed' : 'Coming Soon'
            }</div>
          </div>
        </div>
      </section>

      ${
        !meta.isOnboarded
          ? `
            <section class="surface" style="margin-bottom:24px;">
              <div class="form-notice" style="margin-bottom:20px;">
                <strong>Directory Listing · Coming Soon:</strong> ${Utils.esc(
                  biz.name
                )} is listed in the SmartQ Bhopal directory for location discovery and is <strong>not yet onboarded</strong> as a live SmartQ partner. Live token booking, real-time queue counts, and wait-time estimates are disabled until an administrator verifies this establishment and configures its operating counters.
              </div>

              <div class="section-header" style="margin-bottom:14px;">
                <div>
                  <h2 style="font-size:1.125rem;">Suggested Counter Templates (${Utils.esc(cat.shortName)})</h2>
                  <p class="text-xs text-muted">These are suggested counter templates only — not confirmed operating counters at ${Utils.esc(
                    biz.name
                  )}. Admin must configure and verify actual counters.</p>
                </div>
                ${
                  isAdmin
                    ? `<button type="button" class="btn btn-primary btn-sm" data-apply-templates="${biz.id}">Configure &amp; Onboard Counters</button>`
                    : `<button type="button" class="btn btn-secondary btn-sm" data-nav="admin">Admin Onboarding</button>`
                }
              </div>

              <div class="template-grid">
                ${templates
                  .map(
                    (tpl) => `
                      <div class="template-card">
                        <div class="tile-title">${Utils.esc(tpl.name)}</div>
                        <div class="meta-line" style="margin-top:6px;">
                          <span>Suggested template</span>
                          <span class="meta-sep">·</span>
                          <span class="mono">~${tpl.defaultDurationMin} min default</span>
                        </div>
                        <div class="text-xs text-muted" style="margin-top:6px;">Unconfirmed · Pending admin verification</div>
                      </div>
                    `
                  )
                  .join('')}
              </div>

              <hr class="divider" />
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                <p class="text-sm text-secondary">Looking for an establishment already onboarded with active SmartQ counters?</p>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                  <button type="button" class="btn btn-secondary btn-sm" data-nav="directory">Back to Bhopal Directory</button>
                  <button type="button" class="btn btn-primary btn-sm" data-browse-scope="live">View Live Onboarded Centres</button>
                </div>
              </div>
            </section>
          `
          : !meta.canBook
          ? `
            <section class="surface">
              <div class="form-error" style="margin-bottom:16px;">
                <strong>Booking Unavailable:</strong> ${Utils.esc(meta.eligibilityLabel)}. Live token bookings cannot be submitted until counters are open and booking is enabled.
              </div>
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button type="button" class="btn btn-secondary btn-sm" data-nav="directory">Back to Directory</button>
                ${
                  isAdmin
                    ? `<button type="button" class="btn btn-primary btn-sm" data-apply-templates="${biz.id}">Add / Configure Counters</button>`
                    : ''
                }
              </div>
            </section>
          `
          : `
            <div class="biz-booking-layout">
              <div style="display:flex;flex-direction:column;gap:20px;">
                <section class="surface">
                  <h2 style="font-size:1.125rem;margin-bottom:4px;">1. Select Available Service</h2>
                  <p class="text-xs text-muted" style="margin-bottom:14px;">Showing services supported by configured counters at ${Utils.esc(
                    localizeCentre(biz)
                  )}.</p>
                  <div class="option-grid-2">
                    ${availableServices
                      .map(
                        (svc) => `
                          <button type="button" class="select-tile ${dbBooking.serviceId === svc.id ? 'selected' : ''}" data-detail-service="${
                            svc.id
                          }">
                            <div class="tile-title">${Utils.esc(localizeCategory(svc))}</div>
                            <div class="meta-line">
                              <span class="mono">Prefix ${Utils.esc(svc.code)}</span>
                              <span class="meta-sep">·</span>
                              <span>Default ~${svc.defaultDurationMin} min</span>
                            </div>
                          </button>
                        `
                      )
                      .join('')}
                  </div>
                </section>

                <section class="surface">
                  <h2 style="font-size:1.125rem;margin-bottom:4px;">2. Select Counter &amp; Live Queue</h2>
                  <p class="text-xs text-muted" style="margin-bottom:14px;">
                    Live counts and dynamic estimates recalculate automatically from queue length and recorded service times.
                  </p>
                  ${
                    counterAnalysis && counterAnalysis.recommended
                      ? `<div class="rec-banner" style="margin-bottom:16px;">
                          <div class="rec-banner-main">
                            <div class="rec-label">Recommended Counter</div>
                            <div class="rec-title">${Utils.esc(counterAnalysis.recommended.counter.number)} — ${Utils.esc(
                              counterAnalysis.recommended.counter.name
                            )}</div>
                            <div class="rec-reason">${Utils.esc(counterAnalysis.recommended.reason)}</div>
                          </div>
                          <button type="button" class="btn btn-accent btn-sm" data-detail-counter="${
                            counterAnalysis.recommended.counter.id
                          }">Select</button>
                        </div>`
                      : ''
                  }
                  <div class="option-grid-2">
                    ${
                      counterAnalysis && counterAnalysis.allCounters.length
                        ? counterAnalysis.allCounters
                            .map((item) => {
                              const cnt = item.counter;
                              const cntHours =
                                cnt.openTime && cnt.closeTime ? `${cnt.openTime} – ${cnt.closeTime}` : 'Hours not set';
                              const disabled = cnt.status === 'closed';
                              return `
                                <button type="button" class="select-tile ${dbBooking.counterId === cnt.id ? 'selected' : ''} ${
                                  item.isRecommended ? 'recommended' : ''
                                }" data-detail-counter="${cnt.id}" ${disabled ? 'disabled' : ''}>
                                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;">
                                    <span class="tile-title">${Utils.esc(cnt.number)} — ${Utils.esc(cnt.name)}</span>
                                    <span class="status-text ${Utils.statusClass(cnt.status)}">${Utils.esc(
                                      t(`statusMap.${cnt.status}`)
                                    )}</span>
                                  </div>
                                  <div class="meta-line">
                                    <span>Waiting: <strong class="mono">${item.waitingCount}/${cnt.maxCapacity}</strong></span>
                                    <span class="meta-sep">·</span>
                                    <span>Est. Wait: <strong class="mono">${
                                      cnt.status === 'closed' ? 'Unavailable' : `~${item.projectedWaitMin} min`
                                    }</strong></span>
                                  </div>
                                  <div class="meta-line">
                                    <span>Now Serving: <strong class="mono">${item.current ? Utils.esc(item.current.tokenNumber) : 'None'}</strong></span>
                                    <span class="meta-sep">·</span>
                                    <span>Hours: ${Utils.esc(cntHours)}</span>
                                  </div>
                                </button>
                              `;
                            })
                            .join('')
                        : `<p class="text-sm text-muted">No counters configured for this service yet.</p>`
                    }
                  </div>
                </section>
              </div>

              <aside class="surface biz-booking-panel">
                <h2 style="font-size:1.125rem;margin-bottom:4px;">3. Book Digital QR Token</h2>
                <p class="text-xs text-muted" style="margin-bottom:16px;">
                  Book your digital QR token directly in Supabase PostgreSQL and track live queue position &amp; alerts across devices.
                </p>
                ${
                  !actor
                    ? `<div class="form-notice" style="margin-bottom:16px;">
                        <strong>Sign In Required:</strong> Please sign in with your SmartQ account to generate an RLS-secured digital queue token.
                        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
                          <button type="button" class="btn btn-primary btn-sm" data-action="open-auth" data-auth-mode="login">Sign In</button>
                          <button type="button" class="btn btn-secondary btn-sm" data-action="open-auth" data-auth-mode="register">Create Account</button>
                        </div>
                      </div>`
                    : ''
                }

                ${
                  selectedCounter && selectedService
                    ? `
                      <div class="form-notice" style="margin-bottom:16px;">
                        <div><strong>${Utils.esc(localizeCategory(selectedService))}</strong></div>
                        <div class="text-xs" style="margin-top:4px;">
                          ${Utils.esc(selectedCounter.number)} (${Utils.esc(selectedCounter.name)}) ·
                          ${selectedCounterState ? `${selectedCounterState.waiting.length} waiting · ~${selectedCounterState.projectedWaitMin} min est.` : ''}
                        </div>
                      </div>

                      <form id="detail-booking-form" class="form-grid" novalidate>
                        <div class="form-field form-field-full">
                          <label class="form-label">Queue Mode</label>
                          <div class="segmented" style="width:100%;">
                            <button type="button" class="segmented-btn ${
                              dbBooking.bookingType === 'immediate' ? 'active' : ''
                            }" style="flex:1;" data-detail-btype="immediate">Immediate Queue</button>
                            <button type="button" class="segmented-btn ${
                              dbBooking.bookingType === 'appointment' ? 'active' : ''
                            }" style="flex:1;" data-detail-btype="appointment" ${
                              configuredSlots.length === 0 ? 'disabled title="No operating hours configured for slots"' : ''
                            }>Scheduled Slot</button>
                          </div>
                          ${
                            configuredSlots.length === 0
                              ? `<span class="form-hint">Scheduled slots unlock once counter/business operating hours are configured by Admin.</span>`
                              : ''
                          }
                        </div>

                        ${
                          dbBooking.bookingType === 'appointment' && configuredSlots.length > 0
                            ? `
                              <div class="form-field form-field-full">
                                <label class="form-label" for="dbk-slot">Select Time Slot *</label>
                                <select class="form-select mono" id="dbk-slot" name="scheduledTime" required>
                                  <option value="">Choose a slot</option>
                                  ${configuredSlots
                                    .map(
                                      (s) =>
                                        `<option value="${s}" ${dbBooking.scheduledTime === s ? 'selected' : ''}>${s}</option>`
                                    )
                                    .join('')}
                                </select>
                              </div>
                            `
                            : ''
                        }

                        <div class="form-field form-field-full">
                          <label class="form-label" for="dbk-name">Full Name *</label>
                          <input class="form-input" id="dbk-name" name="customerName" value="${Utils.esc(
                            dbBooking.customerName
                          )}" placeholder="Enter your full name" required />
                        </div>

                        <div class="form-field form-field-full">
                          <label class="form-label" for="dbk-phone">Mobile Number (10 digits) *</label>
                          <input class="form-input mono" id="dbk-phone" name="customerPhone" value="${Utils.esc(
                            dbBooking.customerPhone
                          )}" placeholder="9876543210" required />
                        </div>

                        ${
                          enabledPriorities.length
                            ? `
                              <div class="form-field form-field-full">
                                <label class="form-label" for="dbk-priority">Priority Eligibility (Optional)</label>
                                <select class="form-select" id="dbk-priority" name="priorityType">
                                  <option value="standard" ${dbBooking.priorityType === 'standard' ? 'selected' : ''}>Standard FIFO Queue</option>
                                  ${enabledPriorities
                                    .map(
                                      (p) =>
                                        `<option value="${p}" ${dbBooking.priorityType === p ? 'selected' : ''}>${Utils.esc(
                                          p.charAt(0).toUpperCase() + p.slice(1)
                                        )} Priority</option>`
                                    )
                                    .join('')}
                                </select>
                              </div>
                              <div class="form-field form-field-full">
                                <label class="form-label" for="dbk-pri-reason">Priority Note (if selected)</label>
                                <input class="form-input" id="dbk-pri-reason" name="priorityReason" value="${Utils.esc(
                                  dbBooking.priorityReason
                                )}" placeholder="e.g. Senior Citizen 65+" />
                              </div>
                            `
                            : ''
                        }

                        <div id="detail-booking-error" class="form-field-full"></div>

                        <div class="form-field-full">
                          <button type="submit" class="btn btn-accent btn-lg btn-block">Book Token &amp; Receive QR</button>
                          <p class="eta-disclaimer" style="margin-top:8px;">${Utils.esc(t('approxNote'))}</p>
                        </div>
                      </form>
                    `
                    : `<p class="text-sm text-muted">Select a service and counter on the left to book your token.</p>`
                }
              </aside>
            </div>
          `
      }
    </main>
  `;
};

Views.renderAuth = () => {
  const tab = AppState.authTab === 'register' ? 'register' : 'login';
  const be = AppState.backend;
  const cfgSummary = be.configSummary || { configured: false, urlHost: 'Not configured' };

  return `
    <main id="main-content" class="container">
      <div class="section-header">
        <div>
          <h1 class="section-title">Sign In or Create Customer Account</h1>
          <p class="section-subtitle">Real Supabase Authentication with PostgreSQL Row Level Security for Customers, Operators, and Administrators.</p>
        </div>
        <div class="segmented" role="tablist">
          <button type="button" class="segmented-btn ${tab === 'login' ? 'active' : ''}" data-auth-tab="login">Sign In</button>
          <button type="button" class="segmented-btn ${tab === 'register' ? 'active' : ''}" data-auth-tab="register">Customer Registration</button>
        </div>
      </div>

      ${
        !be.configured
          ? `<div class="form-error" style="margin-bottom:20px;">
              <strong>Supabase Not Configured:</strong> Authentication requires <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env</code> file.
              <button type="button" class="btn btn-secondary btn-sm" style="margin-left:10px;" data-action="open-setup-guide">Open Setup Guide</button>
            </div>`
          : ''
      }

      <div class="auth-layout">
        <section class="surface">
          ${
            tab === 'login'
              ? `
                <h2 style="font-size:1.125rem;margin-bottom:16px;">Supabase Account Sign In</h2>
                <form id="login-form" class="form-grid" novalidate>
                  <div class="form-field form-field-full">
                    <label class="form-label" for="login-id">Email Address</label>
                    <input class="form-input" id="login-id" name="email" type="email" autocomplete="email" required placeholder="you@example.com" />
                  </div>
                  <div class="form-field form-field-full">
                    <label class="form-label" for="login-pwd">Password</label>
                    <input class="form-input" id="login-pwd" name="password" type="password" autocomplete="current-password" required placeholder="Enter password" />
                  </div>
                  <div id="auth-error" class="form-field-full"></div>
                  <div class="form-field-full">
                    <button type="submit" class="btn btn-primary btn-block" ${!be.configured ? 'disabled' : ''}>Sign In to Workspace</button>
                  </div>
                </form>
              `
              : `
                <h2 style="font-size:1.125rem;margin-bottom:16px;">Register Customer Account</h2>
                <p class="text-xs text-muted" style="margin-bottom:14px;">New accounts are automatically assigned the <code>customer</code> role by the database trigger. Administrators can promote registered users to <code>operator</code> or <code>admin</code>.</p>
                <form id="register-form" class="form-grid" novalidate>
                  <div class="form-field form-field-full">
                    <label class="form-label" for="reg-name">Full Name *</label>
                    <input class="form-input" id="reg-name" name="name" autocomplete="name" required placeholder="e.g. Rahul Verma" />
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="reg-phone">Mobile Number (10 digits) *</label>
                    <input class="form-input" id="reg-phone" name="phone" type="tel" autocomplete="tel" required placeholder="9876501234" />
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="reg-email">Email Address *</label>
                    <input class="form-input" id="reg-email" name="email" type="email" autocomplete="email" required placeholder="rahul@example.com" />
                  </div>
                  <div class="form-field form-field-full">
                    <label class="form-label" for="reg-pwd">Password (min 6 characters) *</label>
                    <input class="form-input" id="reg-pwd" name="password" type="password" autocomplete="new-password" required placeholder="Minimum 6 characters" />
                  </div>
                  <div id="auth-error" class="form-field-full"></div>
                  <div class="form-field-full">
                    <button type="submit" class="btn btn-accent btn-block" ${!be.configured ? 'disabled' : ''}>Create Account &amp; Continue</button>
                  </div>
                </form>
              `
          }
        </section>

        <section class="surface">
          <h2 style="font-size:1.125rem;margin-bottom:6px;">Role-Based Access &amp; Backend Status</h2>
          <p class="text-xs text-muted" style="margin-bottom:16px;">SmartQ verifies user roles server-side in PostgreSQL (<code>public.profiles</code>) and enforces data isolation with Row Level Security (RLS).</p>

          <div class="role-list" style="margin-bottom:16px;">
            <div class="role-row">
              <div>
                <strong>Customer</strong>
                <div class="text-xs text-muted">Self-register with email. Book live QR tokens, track ETA, manage own bookings &amp; alerts.</div>
              </div>
              <span class="status-text status-open">Self-Signup</span>
            </div>
            <div class="role-row">
              <div>
                <strong>Counter Operator</strong>
                <div class="text-xs text-muted">Assigned by an Administrator via email. Scoped by RLS strictly to assigned counter(s).</div>
              </div>
              <span class="status-text status-waiting">Admin Assigned</span>
            </div>
            <div class="role-row">
              <div>
                <strong>Administrator</strong>
                <div class="text-xs text-muted">Role-verified in PostgreSQL. Onboards Bhopal businesses, counters, operators, and policy rules.</div>
              </div>
              <span class="status-text status-serving">DB Verified</span>
            </div>
          </div>

          <div class="form-notice" style="margin-bottom:14px;">
            <div><strong>Supabase Endpoint:</strong> <span class="mono">${Utils.esc(cfgSummary.urlHost)}</span></div>
            <div class="text-xs" style="margin-top:4px;">Status: <strong>${Utils.esc(be.connectionState)}</strong> · Realtime: <strong>${Utils.esc(be.realtimeState)}</strong></div>
          </div>

          <button type="button" class="btn btn-secondary btn-sm btn-block" data-action="open-setup-guide">View Supabase Setup &amp; Admin Bootstrap Guide</button>
        </section>
      </div>
    </main>
  `;
};

Views.renderVerifyQR = () => {
  const db = AppState.db;
  const res = AppState.verifyResult;
  const recentTokens = db.tokens.slice(-5).reverse();

  return `
    <main id="main-content" class="container">
      <div class="section-header">
        <div>
          <h1 class="section-title">QR Token Verification Portal</h1>
          <p class="section-subtitle">Verify token validity and live counter status without exposing sensitive customer contact data.</p>
        </div>
      </div>

      <div class="auth-layout">
        <section class="surface">
          <div class="context-visual-strip">
            ${UI.renderVisual(
              UI.MEDIA.qrScan,
              'Scanning a SmartQ digital QR pass at a glass check-in desk',
              'context-visual-thumb',
              { icon: 'shield', fallbackLabel: 'QR Scanner' }
            )}
            <div>
              <div style="font-weight:700;font-size:0.9375rem;color:var(--navy-900);">Privacy-Safe Instant Validation</div>
              <p class="text-xs text-secondary" style="margin-top:3px;">Paste a scanned QR payload or enter a token number to verify active counter assignment.</p>
            </div>
          </div>
          <form id="verify-qr-form" class="form-grid" novalidate>
            <div class="form-field form-field-full">
              <label class="form-label" for="verify-input">Token ID, Token Number, or Scanned QR Payload</label>
              <input
                class="form-input mono"
                id="verify-input"
                name="query"
                value="${Utils.esc(AppState.verifyQuery)}"
                placeholder="e.g. A-102 or SMARTQ|TKN:A-102|ID:TKN_SEED_102|..."
                required
              />
              <span class="form-hint">Public verification intentionally hides phone numbers and email addresses.</span>
            </div>
            <div class="form-field-full" style="display:flex;gap:10px;flex-wrap:wrap;">
              <button type="submit" class="btn btn-primary" ${AppState.verifyLoading ? 'disabled' : ''}>${
                AppState.verifyLoading ? 'Verifying in Supabase...' : 'Verify Token'
              }</button>
              <button type="button" class="btn btn-secondary" data-action="verify-invalid-test" ${
                AppState.verifyLoading ? 'disabled' : ''
              }>Test Invalid ID</button>
            </div>
          </form>

          ${
            AppState.verifyLoading
              ? `<hr class="divider" /><div class="form-notice">Querying Supabase RPC <code>verify_qr_token</code>...</div>`
              : res
              ? res.error
                ? `<hr class="divider" /><div class="form-error">${Utils.esc(res.error)}</div>`
                : res.found
                ? (() => {
                    const tok = res.token;
                    const centre = db.centres.find((c) => c.id === tok.centreId);
                    const cat = db.categories.find((c) => c.id === tok.categoryId);
                    const cnt = db.counters.find((c) => c.id === tok.counterId);
                    return `
                      <hr class="divider" />
                      <div class="form-success" style="margin-bottom:16px;">Verified Valid SmartQ Token (Supabase)</div>
                      <div style="display:grid;grid-template-columns:1fr 148px;gap:18px;align-items:center;">
                        <div style="display:flex;flex-direction:column;gap:8px;font-size:0.875rem;">
                          <div class="mono" style="font-size:1.75rem;font-weight:700;">${Utils.esc(tok.tokenNumber)}</div>
                          <div><strong>Status:</strong> <span class="status-text ${Utils.statusClass(tok.status)}">${Utils.esc(
                            t(`statusMap.${tok.status}`)
                          )}</span></div>
                          <div><strong>Service Centre:</strong> ${Utils.esc(centre ? centre.name : '—')}</div>
                          <div><strong>Counter:</strong> ${Utils.esc(cnt ? `${cnt.number} (${cnt.name})` : '—')}</div>
                          <div><strong>Service:</strong> ${Utils.esc(cat ? cat.name : '—')}</div>
                          <div><strong>Queue Position:</strong> ${tok.position > 0 ? `#${tok.position}` : 'At Counter / Closed'}</div>
                          <div><strong>Booked At:</strong> ${Utils.esc(Utils.formatDateTime(tok.createdAt))}</div>
                          <div class="text-xs text-muted">Privacy Protection: Verified via SECURITY DEFINER RPC; customer phone &amp; personal data are never exposed.</div>
                        </div>
                        <button type="button" class="qr-frame qr-trigger" data-action="enlarge-qr" data-token-id="${tok.id}" title="Click to enlarge QR code">
                          <canvas data-qr-payload="${Utils.esc(QRGenerator.buildPayload(tok))}" data-qr-size="112"></canvas>
                          <span class="qr-zoom-hint">${UI.icon('zoom', 'ui-icon')} Enlarge</span>
                        </button>
                      </div>
                    `;
                  })()
                : `
                    <hr class="divider" />
                    <div class="form-error">Invalid or Unknown Token: No SmartQ record in Supabase matches "${Utils.esc(
                      res.query
                    )}". Please double-check the QR payload or token number.</div>
                  `
              : ''
          }
        </section>

        <section class="surface">
          <h2 style="font-size:1.0625rem;margin-bottom:6px;">Quick-Inspect Recent Live Tokens</h2>
          <p class="text-xs text-muted" style="margin-bottom:14px;">Test verification against active tokens currently synced from Supabase:</p>
          ${
            recentTokens.length
              ? `<div class="role-list">
                  ${recentTokens
                    .map(
                      (tok) => `
                        <div class="role-row">
                          <div>
                            <div class="mono" style="font-weight:700;">${Utils.esc(tok.tokenNumber)}</div>
                            <div class="text-xs text-muted">${Utils.esc(tok.id)} · ${Utils.esc(tok.status)}</div>
                          </div>
                          <button type="button" class="btn btn-secondary btn-sm" data-verify-payload="${Utils.esc(
                            QRGenerator.buildPayload(tok)
                          )}">Verify Payload</button>
                        </div>
                      `
                    )
                    .join('')}
                </div>`
              : `<div class="empty-state" style="padding:20px;">
                  <div class="empty-state-title">No Live Tokens Yet</div>
                  <p class="empty-state-desc">Once a customer books a token at an onboarded centre, active tokens will appear here for QR verification testing.</p>
                </div>`
          }
        </section>
      </div>
    </main>
  `;
};

Views.renderCustomer = () => {
  const db = AppState.db;
  const actor = getActor();
  const tab = AppState.customerTab;

  if (!actor) {
    return `
      <main id="main-content" class="container">
        <section class="surface" style="max-width:640px;margin:24px auto;text-align:center;">
          <h1 class="section-title" style="margin-bottom:8px;">Customer Portal</h1>
          <p class="text-secondary" style="margin-bottom:20px;">Sign in with your Supabase account to book digital QR tokens, track live queue positions across devices, receive realtime alerts, and save favourite Bhopal centres.</p>
          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" data-action="open-auth" data-auth-mode="login">Sign In</button>
            <button type="button" class="btn btn-accent" data-action="open-auth" data-auth-mode="register">Register Customer Account</button>
            ${
              !AppState.backend.configured
                ? `<button type="button" class="btn btn-secondary" data-action="open-setup-guide">Supabase Setup Guide</button>`
                : ''
            }
          </div>
        </section>
      </main>
    `;
  }

  const actorNormPhone = Utils.normalizePhone(actor.phone);
  const myTokens = db.tokens
    .filter(
      (tok) =>
        tok.customerId === actor.id ||
        (!tok.isRedactedPublic && actorNormPhone.length >= 10 && Utils.normalizePhone(tok.customerPhone) === actorNormPhone)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeTokens = myTokens.filter((tok) => QueueEngine.ACTIVE_STATUSES.includes(tok.status));
  const myNotifs = NotificationService.getForUser(db, actor.id);
  const unreadCount = NotificationService.getUnreadCount(db, actor.id);

  const userRecord = db.users.find((u) => u.id === actor.id) || actor;
  const favIds = userRecord && Array.isArray(userRecord.favouriteCentreIds) ? userRecord.favouriteCentreIds : [];

  return `
    <main id="main-content" class="container">
      <div class="section-header">
        <div>
          <h1 class="section-title">Welcome, ${Utils.esc(actor.name)}</h1>
          <div class="meta-line" style="margin-top:4px;">
            <span>Supabase Account (${Utils.esc(actor.role)})</span>
            <span class="meta-sep" aria-hidden="true">·</span>
            <span class="mono">${Utils.esc(actor.phone || actor.email || '—')}</span>
            <span class="meta-sep" aria-hidden="true">·</span>
            <span>${activeTokens.length} active token(s)</span>
          </div>
        </div>
        <div class="segmented" role="tablist">
          <button type="button" class="segmented-btn ${tab === 'dashboard' ? 'active' : ''}" data-cust-tab="dashboard">Dashboard</button>
          <button type="button" class="segmented-btn ${tab === 'book' ? 'active' : ''}" data-cust-tab="book">Book Token</button>
          <button type="button" class="segmented-btn ${tab === 'history' ? 'active' : ''}" data-cust-tab="history">History (${myTokens.length})</button>
          <button type="button" class="segmented-btn ${tab === 'notifications' ? 'active' : ''}" data-cust-tab="notifications">Alerts${
            unreadCount ? ` (${unreadCount})` : ''
          }</button>
          <button type="button" class="segmented-btn ${tab === 'favourites' ? 'active' : ''}" data-cust-tab="favourites">Favourites (${favIds.length})</button>
        </div>
      </div>

      ${
        tab === 'dashboard'
          ? Views.renderCustomerDashboard(activeTokens, myNotifs, favIds)
          : tab === 'book'
          ? Views.renderBookingWizard(actor, favIds)
          : tab === 'history'
          ? Views.renderCustomerHistory(myTokens)
          : tab === 'notifications'
          ? Views.renderCustomerNotifications(myNotifs)
          : Views.renderCustomerFavourites(favIds)
      }
    </main>
  `;
};

Views.renderCustomerDashboard = (activeTokens, myNotifs, favIds) => {
  const db = AppState.db;
  const primary = activeTokens[0] || null;

  const renderTokenPass = (tok) => {
    const centre = db.centres.find((c) => c.id === tok.centreId);
    const cat = db.categories.find((c) => c.id === tok.categoryId);
    const cnt = db.counters.find((c) => c.id === tok.counterId);
    const cntState = cnt ? QueueEngine.getCounterState(db, cnt.id) : null;
    const peopleAhead =
      typeof tok.peopleAhead === 'number'
        ? tok.peopleAhead
        : tok.position > 0
        ? Math.max(0, tok.position - 1 + (cntState && cntState.current ? 1 : 0))
        : 0;
    const waitingAhead = typeof tok.waitingAhead === 'number' ? tok.waitingAhead : Math.max(0, tok.position - 1);
    const servingNowCount = cntState && cntState.current && tok.position > 0 ? 1 : 0;
    const canModify = ['Booked', 'Waiting', 'Approaching'].includes(tok.status);
    const etaBasisLabel =
      tok.etaSampleCount >= 2
        ? `${tok.etaSampleCount} recent completions (~${tok.etaAvgServiceMin || (cntState ? cntState.avgMin : 8)} min avg)`
        : tok.etaSampleCount === 1
        ? `1 recent completion + baseline (~${tok.etaAvgServiceMin || (cntState ? cntState.avgMin : 8)} min avg)`
        : `counter baseline (~${tok.etaAvgServiceMin || (cntState ? cntState.avgMin : 8)} min avg)`;
    const etaRangeText =
      tok.position > 0 && tok.etaRangeMin && tok.etaRangeMax && tok.etaRangeMax > tok.etaRangeMin
        ? `Range: ${tok.etaRangeMin}–${tok.etaRangeMax} min`
        : '';

    return `
      <article class="token-pass" style="margin-bottom:20px;">
        <div class="token-pass-header">
          <div>
            <div class="text-xs" style="color:#cbd5e1;">${Utils.esc(t('activeToken'))} · ${Utils.esc(tok.id)}</div>
            <div class="token-number-hero">${Utils.esc(tok.tokenNumber)}</div>
            <div class="text-sm" style="color:#e2e8f0;margin-top:6px;">
              ${Utils.esc(localizeCentre(centre))} — ${Utils.esc(cnt ? cnt.number : '')}
            </div>
          </div>
          <div style="text-align:right;">
            <div class="text-xs" style="color:#c7d2fe;">Current Status</div>
            <div class="token-status-line">
              ${UI.icon(tok.status === 'Serving' || tok.status === 'Called' ? 'check' : 'clock', 'ui-icon')}
              <span>${Utils.esc(t(`statusMap.${tok.status}`))}</span>
            </div>
            ${
              tok.priorityType && tok.priorityType !== 'standard'
                ? `<div class="text-xs" style="color:#fde68a;margin-top:4px;">Priority: ${Utils.esc(tok.priorityType)}</div>`
                : ''
            }
          </div>
        </div>

        <div class="token-pass-body">
          <div>
            <div style="font-weight:700;font-size:1rem;">${Utils.esc(localizeCategory(cat))}</div>
            <div class="meta-line" style="margin-top:4px;">
              <span>${Utils.esc(cnt ? cnt.name : '')}</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span>${tok.bookingType === 'appointment' ? `Slot: ${Utils.esc(tok.scheduledTime)}` : 'Immediate Queue'}</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span>Booked ${Utils.esc(Utils.formatTime(tok.createdAt))}</span>
            </div>

            ${
              cnt && cnt.status === 'paused'
                ? `<div class="form-notice" style="margin-top:12px;">Counter paused: ${Utils.esc(
                    cnt.pauseReason || 'Temporary break'
                  )}. Your position is safely held.</div>`
                : ''
            }

            ${(() => {
              const totalWaiting = cntState ? Math.max(cntState.waiting.length, tok.position || 1) : Math.max(1, tok.position || 1);
              let progressPct = 100;
              let progressText = t(`statusMap.${tok.status}`);
              let stageIdx = 3;
              if (tok.status === 'Booked') {
                progressPct = 18;
                progressText = `Scheduled ${tok.scheduledTime || ''}`;
                stageIdx = 0;
              } else if (tok.status === 'Waiting') {
                progressPct = Math.max(24, Math.min(72, Math.round(((totalWaiting - tok.position + 1) / (totalWaiting + 1)) * 100)));
                progressText = `Position #${tok.position} of ${totalWaiting}`;
                stageIdx = 1;
              } else if (tok.status === 'Approaching') {
                progressPct = 82;
                progressText = `Position #${tok.position} · Turn Approaching`;
                stageIdx = 2;
              } else {
                progressPct = 100;
                progressText = `${t(`statusMap.${tok.status}`)} at ${cnt ? cnt.number : 'Counter'}`;
                stageIdx = 3;
              }

              const milestones = ['Booked', 'In Queue', 'Approaching', 'At Counter'];
              const ringRadius = 19;
              const ringCirc = (2 * Math.PI * ringRadius).toFixed(1);
              const ringOffset = (Number(ringCirc) * (1 - progressPct / 100)).toFixed(1);

              return `
                <div class="token-progress-wrap">
                  <div class="token-progress-head">
                    <span>Live Queue Progress</span>
                    <span class="mono">${Utils.esc(progressText)}</span>
                  </div>
                  <div class="token-progress-track" role="progressbar" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100">
                    <div class="token-progress-fill" style="width:${progressPct}%;"></div>
                  </div>
                  <div class="queue-milestones" aria-label="Queue milestones">
                    ${milestones
                      .map((label, idx) => {
                        const cls = idx < stageIdx ? 'done' : idx === stageIdx ? 'current' : '';
                        return `<div class="queue-milestone ${cls}">
                          <span class="queue-milestone-node">${idx < stageIdx ? '✓' : idx + 1}</span>
                          <span>${label}</span>
                        </div>`;
                      })
                      .join('')}
                  </div>
                </div>

                <div class="eta-countdown-widget">
                  <svg class="eta-ring-svg" viewBox="0 0 48 48" aria-hidden="true">
                    <defs>
                      <linearGradient id="eta-ring-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#3e5cf8" />
                        <stop offset="100%" stop-color="#7d62fa" />
                      </linearGradient>
                    </defs>
                    <circle class="eta-ring-bg" cx="24" cy="24" r="${ringRadius}" />
                    <circle class="eta-ring-arc" cx="24" cy="24" r="${ringRadius}" stroke-dasharray="${ringCirc}" stroke-dashoffset="${ringOffset}" />
                  </svg>
                  <div class="eta-countdown-text">
                    ${
                      tok.status === 'Booked'
                        ? `<div class="eta-countdown-clock">Slot ${Utils.esc(tok.scheduledTime || 'Reserved')}</div>
                           <div class="eta-countdown-sub">Check in when you arrive to activate live countdown</div>`
                        : tok.position > 0 && tok.etaMin > 0
                        ? `<div class="eta-countdown-clock" data-eta-countdown data-eta-min="${tok.etaMin}" data-eta-updated="${Utils.esc(
                            tok.etaUpdatedAt || tok.createdAt
                          )}">~${String(tok.etaMin).padStart(2, '0')}:00</div>
                           <div class="eta-countdown-sub">Estimated wait countdown (${tok.etaMin} min approx. · ${peopleAhead} ahead)</div>`
                        : `<div class="eta-countdown-clock">Ready Now</div>
                           <div class="eta-countdown-sub">Please proceed to ${Utils.esc(cnt ? cnt.number : 'your assigned counter')}</div>`
                    }
                  </div>
                </div>
              `;
            })()}

            <div class="token-metrics-row">
              <div>
                <div class="text-xs text-muted">${Utils.esc(t('queuePosition'))}</div>
                <div class="token-metric-val">${
                  tok.status === 'Booked' ? 'Slot' : tok.position > 0 ? `#${tok.position}` : 'Now'
                }</div>
              </div>
              <div>
                <div class="text-xs text-muted">${Utils.esc(t('peopleAhead'))}</div>
                <div class="token-metric-val">${tok.status === 'Booked' ? '—' : peopleAhead}</div>
                ${
                  tok.position > 0
                    ? `<div class="text-xs text-muted">${
                        servingNowCount ? `1 serving + ${waitingAhead} waiting` : `${waitingAhead} waiting`
                      }</div>`
                    : ''
                }
              </div>
              <div>
                <div class="text-xs text-muted">${Utils.esc(t('estWait'))} (Est.)</div>
                <div class="token-metric-val">${
                  tok.status === 'Booked'
                    ? Utils.esc(tok.scheduledTime)
                    : tok.position > 0
                    ? `~${tok.etaMin} min`
                    : '0 min'
                }</div>
                ${etaRangeText ? `<div class="text-xs text-muted mono">${Utils.esc(etaRangeText)}</div>` : ''}
              </div>
            </div>
            ${
              tok.position > 0
                ? `<div class="eta-breakdown">
                    Dynamic ETA basis: ${Utils.esc(etaBasisLabel)}${
                      tok.etaUpdatedAt ? ` · Updated ${Utils.esc(Utils.formatTime(tok.etaUpdatedAt))}` : ''
                    }
                  </div>`
                : ''
            }
            <p class="eta-disclaimer">${Utils.esc(t('approxNote'))}</p>
          </div>

          <button type="button" class="qr-frame qr-trigger" data-action="enlarge-qr" data-token-id="${tok.id}" title="Click to enlarge QR code for counter scanning">
            <canvas data-qr-payload="${Utils.esc(QRGenerator.buildPayload(tok))}" data-qr-size="152"></canvas>
            <span class="qr-zoom-hint">${UI.icon('zoom', 'ui-icon')} Tap to Enlarge QR</span>
          </button>
        </div>

        <div class="token-pass-actions">
          ${
            tok.status === 'Booked'
              ? `<button type="button" class="btn btn-accent btn-sm" data-action="checkin-token" data-token-id="${tok.id}">Check In to Queue Now</button>`
              : ''
          }
          <button type="button" class="btn btn-secondary btn-sm" data-action="print-token" data-token-id="${tok.id}">${Utils.esc(
            t('printToken')
          )}</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="download-qr" data-token-id="${tok.id}">${Utils.esc(
            t('downloadQr')
          )}</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="share-token" data-token-id="${tok.id}">${Utils.esc(
            t('shareToken')
          )}</button>
          ${
            canModify
              ? `<button type="button" class="btn btn-secondary btn-sm" data-action="open-reschedule" data-token-id="${tok.id}">${Utils.esc(
                  t('reschedule')
                )}</button>
                 <button type="button" class="btn btn-danger-outline btn-sm" data-action="cancel-token-prompt" data-token-id="${tok.id}">${Utils.esc(
                   t('cancelBooking')
                 )}</button>`
              : ''
          }
        </div>
      </article>
    `;
  };

  return `
    <div class="customer-grid">
      <div>
        ${
          primary
            ? activeTokens.map(renderTokenPass).join('')
            : `
              <section class="surface empty-state">
                ${UI.renderVisual(
                  UI.MEDIA.calmLounge,
                  'Serene SmartQ waiting lounge ready for your next remote queue booking',
                  'empty-state-media',
                  { icon: 'ticket', fallbackLabel: 'No Active Token Yet' }
                )}
                <div class="empty-state-title">${Utils.esc(t('noActiveToken'))}</div>
                <p class="empty-state-desc">Book a remote digital QR token to skip physical waiting lines and monitor live wait estimates.</p>
                <button type="button" class="btn btn-accent" data-cust-tab="book">${Utils.esc(t('bookTokenCta'))}</button>
              </section>
            `
        }
      </div>

      <aside style="display:flex;flex-direction:column;gap:20px;">
        <section class="surface">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <h2 style="font-size:1rem;">Recent Alerts${
              myNotifs.filter((n) => !n.read).length ? ` (${myNotifs.filter((n) => !n.read).length} unread)` : ''
            }</h2>
            <button type="button" class="btn btn-ghost btn-sm" data-cust-tab="notifications">Open Centre</button>
          </div>
          ${
            myNotifs.length
              ? `<div class="notif-list">${myNotifs
                  .slice(0, 4)
                  .map((n) => {
                    const meta = NotificationService.getCategoryMeta(n.type);
                    return `
                      <div class="notif-item ${n.read ? '' : 'unread'}">
                        <div class="notif-main">
                          <div class="notif-head">
                            ${n.read ? '' : '<span class="notif-dot" aria-hidden="true"></span>'}
                            <span class="notif-category ${meta.cls}">${Utils.esc(meta.label)}</span>
                            <span class="meta-sep" aria-hidden="true">·</span>
                            <span class="text-xs text-muted">${Utils.esc(NotificationService.formatRelativeTime(n.createdAt))}</span>
                          </div>
                          <div class="notif-title">${Utils.esc(n.title)}</div>
                          <div class="notif-body">${Utils.esc(n.message)}</div>
                          ${
                            !n.read
                              ? `<div style="margin-top:6px;">
                                   <button type="button" class="utility-link-btn" data-toggle-notif-read="${n.id}" data-next-read="1">Mark read</button>
                                 </div>`
                              : ''
                          }
                        </div>
                      </div>
                    `;
                  })
                  .join('')}</div>`
              : `<p class="text-sm text-muted">No notifications yet. You will be alerted at positions #5, #3, #1, when called, or on ETA and counter changes.</p>`
          }
        </section>

        <section class="surface">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h2 style="font-size:1rem;">Quick Book Favourites</h2>
            <button type="button" class="btn btn-ghost btn-sm" data-cust-tab="book">All Centres</button>
          </div>
          ${
            favIds.length
              ? favIds
                  .map((id) => db.centres.find((c) => c.id === id))
                  .filter(Boolean)
                  .map(
                    (c) => `
                      <div class="role-row">
                        <div>
                          <div class="role-row-title">${Utils.esc(localizeCentre(c))}</div>
                          <div class="text-xs text-muted">${Utils.esc(c.openTime)} – ${Utils.esc(c.closeTime)} · ${Utils.esc(
                            c.city
                          )}</div>
                        </div>
                        <button type="button" class="btn btn-secondary btn-sm" data-quick-book-centre="${c.id}">Book</button>
                      </div>
                    `
                  )
                  .join('')
              : `<p class="text-sm text-muted">Star any service centre during booking to save it here.</p>`
          }
        </section>
      </aside>
    </div>
  `;
};

Views.renderBookingWizard = (actor, favIds) => {
  const db = AppState.db;
  const draft = AppState.bookingDraft;
  const activeCentres = db.centres.filter((c) => c.isActive && c.isOnboarded && c.bookingEnabled !== false);
  // Only show service categories that actually have at least one configured counter on an onboarded centre
  const activeCategories = db.categories.filter(
    (cat) =>
      cat.active &&
      db.counters.some(
        (cnt) =>
          activeCentres.some((c) => c.id === cnt.centreId) &&
          CounterRecommendationEngine.supportsCategory(cnt, cat.id)
      )
  );

  if (!draft.customerName) draft.customerName = actor.name || '';
  if (!draft.customerPhone) draft.customerPhone = actor.phone || '';

  const steps = ['1. Service', '2. Business', '3. Counter', '4. Queue / Slot', '5. Confirm'];

  let stepContent = '';
  if (draft.step === 1) {
    stepContent = `
      <div class="context-visual-strip" style="justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:14px;">
          ${UI.renderVisual(
            UI.MEDIA.serviceCounter,
            'Modern SmartQ service counters ready for remote digital token check-in',
            'context-visual-thumb',
            { icon: 'building', fallbackLabel: 'SmartQ Service Counters' }
          )}
          <div>
            <h2 style="font-size:1.125rem;margin-bottom:4px;">Select Live Service or Browse Bhopal Directory</h2>
            <p class="text-sm text-secondary">Showing services with active onboarded or demo sandbox counters. Prefer browsing by Bhopal category &amp; area?</p>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" data-nav="directory">Open Bhopal Directory</button>
      </div>
      <div class="option-grid">
        ${activeCategories
          .map((cat) => {
            const analysis = QueueEngine.analyzeCounters(db, { categoryId: cat.id });
            const openCount = analysis.eligible.length;
            const fastestWait = analysis.recommended ? analysis.recommended.projectedWaitMin : null;
            return `
              <button type="button" class="select-tile ${draft.categoryId === cat.id ? 'selected' : ''}" data-pick-category="${
                cat.id
              }">
                <div class="tile-title">${Utils.esc(localizeCategory(cat))}</div>
                <p class="text-xs text-secondary">${Utils.esc(cat.description)}</p>
                <div class="meta-line" style="margin-top:auto;padding-top:6px;">
                  <span class="mono">Prefix ${Utils.esc(cat.code)}</span>
                  <span class="meta-sep">·</span>
                  <span>${openCount} open ${openCount === 1 ? 'counter' : 'counters'}</span>
                  <span class="meta-sep">·</span>
                  <span>${fastestWait !== null ? `Fastest ~${fastestWait} min` : 'No open counters'}</span>
                </div>
              </button>
            `;
          })
          .join('')}
      </div>
    `;
  } else if (draft.step === 2) {
    const q = String(draft.centreSearch || '').trim().toLowerCase();
    const globalAnalysis = QueueEngine.analyzeCounters(db, { categoryId: draft.categoryId });
    const globalRec = globalAnalysis.recommended;
    const selectedCat = db.categories.find((c) => c.id === draft.categoryId);

    const matchingCentres = activeCentres.filter((c) => {
      const hasCounterForCat = db.counters.some(
        (cnt) =>
          cnt.centreId === c.id &&
          cnt.status !== 'closed' &&
          CounterRecommendationEngine.supportsCategory(cnt, draft.categoryId)
      );
      if (!hasCounterForCat) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });

    stepContent = `
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;">
        <div>
          <h2 style="font-size:1.125rem;">Search & Select Service Centre</h2>
          <p class="text-sm text-secondary">Analyzed ${globalAnalysis.eligible.length} open ${
            globalAnalysis.eligible.length === 1 ? 'counter' : 'counters'
          }${globalAnalysis.excluded.length ? ` (${globalAnalysis.excluded.length} paused/closed/full excluded)` : ''} for ${Utils.esc(
            selectedCat ? localizeCategory(selectedCat) : 'your service'
          )}.</p>
        </div>
        <input
          type="search"
          class="form-input"
          style="max-width:280px;"
          id="centre-search-input"
          placeholder="Search centre name or city..."
          value="${Utils.esc(draft.centreSearch)}"
        />
      </div>

      ${
        globalRec
          ? `<div class="rec-banner" role="region" aria-label="Recommended counter across all centres">
              <div class="rec-banner-main">
                <div class="rec-label">Recommended Counter · Live Service Analysis</div>
                <div class="rec-title">${Utils.esc(globalRec.counter.number)} — ${Utils.esc(globalRec.counter.name)} (${Utils.esc(
                  localizeCentre(globalRec.centre)
                )})</div>
                <div class="rec-reason">${Utils.esc(globalRec.reason)}</div>
                <div class="meta-line" style="margin-top:6px;">
                  <span>Waiting: <strong class="mono">${globalRec.waitingCount}/${globalRec.counter.maxCapacity}</strong></span>
                  <span class="meta-sep">·</span>
                  <span>Est. Wait: <strong class="mono">~${globalRec.projectedWaitMin} min</strong> (approx.)</span>
                  <span class="meta-sep">·</span>
                  <span>Avg. Service: <strong class="mono">~${globalRec.estimatedServiceDurationMin} min</strong></span>
                </div>
              </div>
              <button type="button" class="btn btn-accent btn-sm" data-pick-recommended="${globalRec.centre.id}|${
                globalRec.counter.id
              }">Use Recommended Counter</button>
            </div>`
          : `<div class="form-error" style="margin-bottom:16px;">No open counters are currently available for immediate booking of this service. You may still choose a centre to check scheduled appointment slots.</div>`
      }

      ${
        matchingCentres.length
          ? `<div class="option-grid-2">
              ${matchingCentres
                .map((c) => {
                  const centreAnalysis = QueueEngine.analyzeCounters(db, { categoryId: draft.categoryId, centreId: c.id });
                  const bestHere = centreAnalysis.recommended;
                  const totalWaiting = centreAnalysis.allCounters.reduce((s, item) => s + item.waitingCount, 0);
                  const isFav = favIds.includes(c.id);
                  return `
                    <div class="select-tile ${draft.centreId === c.id ? 'selected' : ''} ${
                      globalRec && globalRec.centre && globalRec.centre.id === c.id ? 'recommended' : ''
                    }" style="cursor:default;">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                        <div class="tile-title">${Utils.esc(localizeCentre(c))}</div>
                        ${
                          actor.role !== 'guest'
                            ? `<button type="button" class="btn btn-ghost btn-sm" data-toggle-fav="${c.id}">${
                                isFav ? 'Saved ★' : 'Save ☆'
                              }</button>`
                            : ''
                        }
                      </div>
                      <p class="text-xs text-secondary">${Utils.esc(c.address)}</p>
                      <div class="meta-line">
                        <span>Hours ${Utils.esc(c.openTime)} – ${Utils.esc(c.closeTime)}</span>
                        <span class="meta-sep">·</span>
                        <span>${centreAnalysis.eligible.length} open ${centreAnalysis.eligible.length === 1 ? 'counter' : 'counters'}</span>
                        <span class="meta-sep">·</span>
                        <span>${totalWaiting} waiting</span>
                      </div>
                      ${
                        bestHere
                          ? `<div class="text-xs" style="color:var(--violet-700);font-weight:600;">Fastest here: ${Utils.esc(
                              bestHere.counter.number
                            )} (~${bestHere.projectedWaitMin} min est. wait, ${bestHere.waitingCount} waiting)</div>`
                          : `<div class="text-xs text-muted">All counters for this service are currently paused or at capacity</div>`
                      }
                      <div style="margin-top:8px;">
                        <button type="button" class="btn btn-primary btn-sm" data-pick-centre="${c.id}">Compare Counters</button>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>`
          : `<div class="empty-state">No service centres matched your filter for this service category.</div>`
      }
    `;
  } else if (draft.step === 3) {
    const centre = db.centres.find((c) => c.id === draft.centreId);
    const cat = db.categories.find((c) => c.id === draft.categoryId);
    const analysis = QueueEngine.analyzeCounters(db, {
      categoryId: draft.categoryId,
      centreId: draft.centreId,
    });
    const rec = analysis.recommended;
    const orderedCounters = analysis.allCounters;

    stepContent = `
      <h2 style="font-size:1.125rem;margin-bottom:6px;">Select Counter at ${Utils.esc(localizeCentre(centre))}</h2>
      <p class="text-sm text-secondary" style="margin-bottom:16px;">
        Showing only counters supporting <strong>${Utils.esc(cat ? localizeCategory(cat) : 'selected service')}</strong>. Rankings recalculate automatically from queue length, estimated service duration, and live counter availability.
      </p>
      ${
        rec
          ? `<div class="rec-banner" role="region" aria-label="Recommended counter">
              <div class="rec-banner-main">
                <div class="rec-label">Recommended Counter</div>
                <div class="rec-title">${Utils.esc(rec.counter.number)} — ${Utils.esc(rec.counter.name)}</div>
                <div class="rec-reason">${Utils.esc(rec.reason)}</div>
                <div class="meta-line" style="margin-top:6px;">
                  <span>Waiting: <strong class="mono">${rec.waitingCount}/${rec.counter.maxCapacity}</strong></span>
                  <span class="meta-sep">·</span>
                  <span>Est. Wait: <strong class="mono">~${rec.projectedWaitMin} min</strong> (approx., not guaranteed)</span>
                  <span class="meta-sep">·</span>
                  <span>Avg. Service: <strong class="mono">~${rec.estimatedServiceDurationMin} min</strong></span>
                </div>
              </div>
              <button type="button" class="btn btn-accent btn-sm" data-pick-counter="${rec.counter.id}">Use Recommended</button>
            </div>`
          : `<div class="form-error" style="margin-bottom:18px;">
              No open counters are currently available for immediate queue at this centre (${analysis.excluded.length} paused, closed, or full ${
              analysis.excluded.length === 1 ? 'counter' : 'counters'
            } excluded). You may select a paused counter only for a scheduled appointment slot, or return to pick another centre.
            </div>`
      }
      <div class="option-grid-2">
        ${orderedCounters
          .map((item) => {
            const cnt = item.counter;
            const isFull = item.waitingCount >= cnt.maxCapacity;
            const disabled = cnt.status === 'closed';
            const isRec = item.isRecommended;
            const isExcluded = !item.available;
            return `
              <button type="button" class="select-tile ${draft.counterId === cnt.id ? 'selected' : ''} ${
                isRec ? 'recommended' : ''
              } ${isExcluded ? 'excluded' : ''}" data-pick-counter="${cnt.id}" ${disabled ? 'disabled' : ''}>
                <div style="display:flex;justify-content:space-between;align-items:center;width:100%;gap:8px;">
                  <span class="tile-title">${Utils.esc(cnt.number)} — ${Utils.esc(cnt.name)}</span>
                  <span class="status-text ${Utils.statusClass(cnt.status)}">${Utils.esc(t(`statusMap.${cnt.status}`))}</span>
                </div>
                ${
                  isRec
                    ? `<div class="rec-label">Recommended Counter</div>
                       <div class="text-xs" style="color:var(--navy-800);line-height:1.4;">${Utils.esc(item.reason)}</div>`
                    : isExcluded
                    ? `<div class="text-xs status-high">Excluded from recommendations · ${Utils.esc(item.excludeReason)}</div>`
                    : `<div class="text-xs text-muted">Available option · Rank #${item.rank} by estimated wait</div>`
                }
                <div class="meta-line">
                  <span>Waiting: <strong class="mono">${item.waitingCount}/${cnt.maxCapacity}</strong></span>
                  <span class="meta-sep">·</span>
                  <span>Est. Wait: <strong class="mono">${
                    cnt.status === 'closed' ? 'Unavailable' : `~${item.projectedWaitMin} min`
                  }</strong></span>
                  <span class="meta-sep">·</span>
                  <span>Avg. Service: <strong class="mono">~${item.estimatedServiceDurationMin} min</strong></span>
                </div>
                <div class="meta-line">
                  <span>Now Serving: <strong class="mono">${item.current ? Utils.esc(item.current.tokenNumber) : 'None'}</strong></span>
                  <span class="meta-sep">·</span>
                  <span class="status-text ${Utils.statusClass(item.congestion)}">${Utils.esc(
                    t(`congestionMap.${item.congestion}`)
                  )}</span>
                  ${isFull ? `<span class="meta-sep">·</span><span class="status-high">Capacity Reached</span>` : ''}
                </div>
              </button>
            `;
          })
          .join('')}
      </div>
    `;
  } else if (draft.step === 4) {
    const slots = ['09:30', '10:30', '11:30', '12:30', '14:00', '15:00', '16:00', '17:00'];
    const cnt = db.counters.find((c) => c.id === draft.counterId);
    const st = cnt ? QueueEngine.getCounterState(db, cnt.id) : null;

    stepContent = `
      <h2 style="font-size:1.125rem;margin-bottom:6px;">Immediate Queue or Scheduled Slot</h2>
      <p class="text-sm text-secondary" style="margin-bottom:18px;">Join the live counter queue right now or reserve an appointment time slot with historical crowd predictions.</p>
      <div class="option-grid-2" style="margin-bottom:20px;">
        <button type="button" class="select-tile ${draft.bookingType === 'immediate' ? 'selected' : ''}" data-booking-type="immediate">
          <div class="tile-title">Immediate Digital Queue</div>
          <p class="text-xs text-secondary">Enter the active queue right away and track real-time position.</p>
          <div class="meta-line">
            <span>Est. Position #${st ? st.waiting.length + 1 : 1}</span>
            <span class="meta-sep">·</span>
            <span>Approx. ~${st ? st.projectedWaitMin : 8} min</span>
          </div>
        </button>
        <button type="button" class="select-tile ${draft.bookingType === 'appointment' ? 'selected' : ''}" data-booking-type="appointment">
          <div class="tile-title">Scheduled Appointment Slot</div>
          <p class="text-xs text-secondary">Reserve a specific time window today and check in when ready.</p>
          <div class="meta-line"><span>Historical crowd forecast shown per slot</span></div>
        </button>
      </div>

      ${
        draft.bookingType === 'appointment'
          ? `
            <h3 style="font-size:0.9375rem;margin-bottom:12px;">Available Slots Today (Crowd Prediction from Stored History)</h3>
            <div class="slot-grid">
              ${slots
                .map((slot) => {
                  const hr = Number(slot.split(':')[0]);
                  const pred = QueueEngine.predictCrowdForHour(db, draft.centreId, hr);
                  return `
                    <button type="button" class="select-tile ${draft.scheduledTime === slot ? 'selected' : ''}" data-pick-slot="${slot}">
                      <div class="mono" style="font-weight:700;font-size:1rem;">${slot}</div>
                      <div class="status-text ${Utils.statusClass(pred.level)}" style="font-size:0.75rem;">${Utils.esc(
                        pred.label
                      )}</div>
                    </button>
                  `;
                })
                .join('')}
            </div>
          `
          : ''
      }
    `;
  } else {
    const centre = db.centres.find((c) => c.id === draft.centreId);
    const cat = db.categories.find((c) => c.id === draft.categoryId);
    const cnt = db.counters.find((c) => c.id === draft.counterId);
    const rules = db.settings.priorityRules || {};
    const enabledPriorities = ['senior', 'medical', 'accessibility', 'vip'].filter((k) => rules[k]);

    stepContent = `
      <h2 style="font-size:1.125rem;margin-bottom:14px;">Customer Details & Confirmation</h2>
      <div class="form-notice" style="margin-bottom:18px;">
        <strong>Booking Summary:</strong> ${Utils.esc(localizeCategory(cat))} at ${Utils.esc(
          localizeCentre(centre)
        )} (${Utils.esc(cnt ? cnt.number : '')}) · ${
          draft.bookingType === 'appointment' ? `Scheduled ${Utils.esc(draft.scheduledTime)}` : 'Immediate Queue'
        }
      </div>

      <form id="confirm-booking-form" class="form-grid" novalidate>
        <div class="form-field">
          <label class="form-label" for="bk-name">Customer Full Name *</label>
          <input class="form-input" id="bk-name" name="customerName" value="${Utils.esc(draft.customerName)}" required />
        </div>
        <div class="form-field">
          <label class="form-label" for="bk-phone">Mobile Number (10 digits) *</label>
          <input class="form-input" id="bk-phone" name="customerPhone" value="${Utils.esc(draft.customerPhone)}" required />
        </div>
        ${
          enabledPriorities.length
            ? `
              <div class="form-field">
                <label class="form-label" for="bk-priority">Authorized Priority Eligibility (Optional)</label>
                <select class="form-select" id="bk-priority" name="priorityType">
                  <option value="standard" ${draft.priorityType === 'standard' ? 'selected' : ''}>Standard FIFO Queue</option>
                  ${enabledPriorities
                    .map(
                      (p) =>
                        `<option value="${p}" ${draft.priorityType === p ? 'selected' : ''}>${Utils.esc(
                          p.charAt(0).toUpperCase() + p.slice(1)
                        )} Priority (Audit Logged)</option>`
                    )
                    .join('')}
                </select>
              </div>
              <div class="form-field">
                <label class="form-label" for="bk-pri-reason">Eligibility Note (Required for Priority)</label>
                <input class="form-input" id="bk-pri-reason" name="priorityReason" value="${Utils.esc(
                  draft.priorityReason
                )}" placeholder="e.g. Senior Citizen ID 65+ / Medical urgency" />
              </div>
            `
            : ''
        }
        <div id="booking-error" class="form-field-full"></div>
        <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
          <button type="submit" class="btn btn-accent btn-lg">Confirm & Generate QR Token</button>
        </div>
      </form>
    `;
  }

  return `
    <section class="surface">
      <div class="wizard-steps" aria-label="Booking progress">
        ${steps
          .map(
            (label, i) => `
              <div class="wizard-step ${draft.step === i + 1 ? 'active' : draft.step > i + 1 ? 'done' : ''}">
                <span>${Utils.esc(label)}</span>
              </div>
            `
          )
          .join('')}
      </div>
      ${stepContent}
      <hr class="divider" />
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <button type="button" class="btn btn-secondary" data-wizard-prev ${draft.step === 1 ? 'disabled' : ''}>Back</button>
        ${
          draft.step < 5
            ? `<button type="button" class="btn btn-primary" data-wizard-next>Continue</button>`
            : `<span class="text-xs text-muted">Duplicate active bookings for the same service are automatically prevented.</span>`
        }
      </div>
    </section>
  `;
};

Views.renderCustomerHistory = (myTokens) => {
  const db = AppState.db;
  const f = AppState.historyFilter;
  const filtered = myTokens.filter((tok) => {
    if (f === 'active') return QueueEngine.ACTIVE_STATUSES.includes(tok.status);
    if (f === 'completed') return tok.status === 'Completed';
    if (f === 'cancelled') return ['Cancelled', 'No-show', 'Skipped'].includes(tok.status);
    return true;
  });

  return `
    <section class="surface-flush">
      <div class="table-toolbar">
        <h2 style="font-size:1.0625rem;">Booking History</h2>
        <div class="segmented">
          <button type="button" class="segmented-btn ${f === 'all' ? 'active' : ''}" data-hist-filter="all">All</button>
          <button type="button" class="segmented-btn ${f === 'active' ? 'active' : ''}" data-hist-filter="active">Active</button>
          <button type="button" class="segmented-btn ${f === 'completed' ? 'active' : ''}" data-hist-filter="completed">Completed</button>
          <button type="button" class="segmented-btn ${f === 'cancelled' ? 'active' : ''}" data-hist-filter="cancelled">Cancelled / Missed</button>
        </div>
      </div>
      ${
        filtered.length
          ? `<div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Centre & Counter</th>
                    <th>Service</th>
                    <th>Booked</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered
                    .map((tok) => {
                      const centre = db.centres.find((c) => c.id === tok.centreId);
                      const cat = db.categories.find((c) => c.id === tok.categoryId);
                      const cnt = db.counters.find((c) => c.id === tok.counterId);
                      return `
                        <tr>
                          <td class="mono"><strong>${Utils.esc(tok.tokenNumber)}</strong><div class="text-xs text-muted">${Utils.esc(
                            tok.id
                          )}</div></td>
                          <td>${Utils.esc(localizeCentre(centre))}<div class="text-xs text-muted">${Utils.esc(
                            cnt ? cnt.number : ''
                          )}</div></td>
                          <td>${Utils.esc(localizeCategory(cat))}</td>
                          <td class="mono text-xs">${Utils.esc(Utils.formatDateTime(tok.createdAt))}</td>
                          <td><span class="status-text ${Utils.statusClass(tok.status)}">${Utils.esc(
                            t(`statusMap.${tok.status}`)
                          )}</span></td>
                          <td>
                            <button type="button" class="btn btn-secondary btn-sm" data-action="view-token-modal" data-token-id="${
                              tok.id
                            }">Details & QR</button>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>`
          : `<div class="empty-state">No tokens found for this filter.</div>`
      }
    </section>
  `;
};

Views.renderCustomerNotifications = (myNotifs) => {
  const db = AppState.db;
  const perm = NotificationService.getBrowserPermissionState();
  const browserActive = perm === 'granted' && Boolean(db.settings.browserNotificationsEnabled);
  const unreadCount = myNotifs.filter((n) => !n.read).length;
  const filter = AppState.notifFilter || 'all';
  const filtered = myNotifs.filter((n) => NotificationService.matchesFilter(n, filter));

  const permLabel =
    perm === 'unsupported'
      ? 'Unsupported'
      : perm === 'denied'
      ? 'Blocked in Browser'
      : browserActive
      ? 'Enabled'
      : perm === 'granted'
      ? 'Muted'
      : 'Not Enabled';

  return `
    <section class="surface">
      <div class="section-header" style="margin-bottom:14px;">
        <div>
          <h2 style="font-size:1.125rem;">Notification Centre</h2>
          <div class="meta-line" style="margin-top:4px;">
            <span><strong>${unreadCount}</strong> unread</span>
            <span class="meta-sep" aria-hidden="true">·</span>
            <span>${myNotifs.length} total alerts</span>
            <span class="meta-sep" aria-hidden="true">·</span>
            <span>Browser Push: <strong>${Utils.esc(permLabel)}</strong></span>
          </div>
          <p class="text-xs text-muted" style="margin-top:6px;">
            Automatic alerts trigger at positions #5, #3, #1, token calls, significant ETA shifts, bookings, cancellations, reschedules, and counter pause/resume/reassignment. Browser push uses the Web Notifications API while open when permission is granted; SMS/WhatsApp require an external gateway.
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          ${
            browserActive
              ? `<button type="button" class="btn btn-secondary btn-sm" data-action="test-browser-notif">Send Test Alert</button>
                 <button type="button" class="btn btn-ghost btn-sm" data-action="disable-browser-notifs">Mute Browser Push</button>`
              : `<button type="button" class="btn btn-secondary btn-sm" data-action="enable-browser-notifs" ${
                  perm === 'unsupported' ? 'disabled' : ''
                }>Enable Browser Push</button>`
          }
          <button type="button" class="btn btn-ghost btn-sm" data-action="mark-all-read" ${
            unreadCount === 0 ? 'disabled' : ''
          }>Mark All Read</button>
          <button type="button" class="btn btn-danger-outline btn-sm" data-action="clear-all-notifs" ${
            myNotifs.length === 0 ? 'disabled' : ''
          }>Clear All</button>
        </div>
      </div>

      <div class="notif-toolbar">
        <div class="segmented" role="tablist" aria-label="Filter notifications">
          <button type="button" class="segmented-btn ${filter === 'all' ? 'active' : ''}" data-notif-filter="all">All (${myNotifs.length})</button>
          <button type="button" class="segmented-btn ${filter === 'unread' ? 'active' : ''}" data-notif-filter="unread">Unread (${unreadCount})</button>
          <button type="button" class="segmented-btn ${filter === 'queue' ? 'active' : ''}" data-notif-filter="queue">Queue & ETA</button>
          <button type="button" class="segmented-btn ${filter === 'booking' ? 'active' : ''}" data-notif-filter="booking">Bookings</button>
          <button type="button" class="segmented-btn ${filter === 'counter' ? 'active' : ''}" data-notif-filter="counter">Counter Updates</button>
        </div>
      </div>

      ${
        filtered.length
          ? `<div class="notif-list">${filtered
              .map((n) => {
                const meta = NotificationService.getCategoryMeta(n.type);
                return `
                  <div class="notif-item ${n.read ? '' : 'unread'}">
                    <div class="notif-main">
                      <div class="notif-head">
                        ${n.read ? '' : '<span class="notif-dot" aria-hidden="true"></span>'}
                        <span class="notif-category ${meta.cls}">${Utils.esc(meta.label)}</span>
                        <span class="meta-sep" aria-hidden="true">·</span>
                        <span class="text-xs ${n.read ? 'text-muted' : 'status-waiting'}">${n.read ? 'Read' : 'Unread'}</span>
                      </div>
                      <div class="notif-title">${Utils.esc(n.title)}</div>
                      <div class="notif-body">${Utils.esc(n.message)}</div>
                    </div>
                    <div class="notif-side">
                      <div class="notif-time">
                        <div class="text-xs" style="font-weight:600;color:var(--text-primary);">${Utils.esc(
                          NotificationService.formatRelativeTime(n.createdAt)
                        )}</div>
                        <div class="mono text-xs text-muted">${Utils.esc(Utils.formatDateTime(n.createdAt))}</div>
                      </div>
                      <div class="notif-actions">
                        <button type="button" class="btn btn-ghost btn-sm" data-toggle-notif-read="${n.id}" data-next-read="${
                          n.read ? '0' : '1'
                        }">${n.read ? 'Mark Unread' : 'Mark Read'}</button>
                        <button type="button" class="btn btn-ghost btn-sm" data-delete-notif="${n.id}">Clear</button>
                      </div>
                    </div>
                  </div>
                `;
              })
              .join('')}</div>`
          : `<div class="empty-state">
              ${UI.renderVisual(
                UI.MEDIA.liveTracking,
                '3D glass SmartQ queue tracker illustration for live notifications',
                'empty-state-media',
                { icon: 'bell', fallbackLabel: 'All Caught Up' }
              )}
              <div class="empty-state-title">${
                myNotifs.length === 0 ? 'All Caught Up' : 'No Matching Alerts'
              }</div>
              <p class="empty-state-desc">${
                myNotifs.length === 0
                  ? 'Your notification centre is empty. Live queue milestones and counter updates will appear here.'
                  : 'No notifications match this filter.'
              }</p>
            </div>`
      }
    </section>
  `;
};

Views.renderCustomerFavourites = (favIds) => {
  const db = AppState.db;
  const favCentres = db.centres.filter((c) => favIds.includes(c.id));
  return `
    <section class="surface">
      <h2 style="font-size:1.125rem;margin-bottom:14px;">Favourite Businesses &amp; Service Centres</h2>
      ${
        favCentres.length
          ? `<div class="option-grid-2">
              ${favCentres
                .map((c) => {
                  const hoursLabel = c.openTime && c.closeTime ? `${c.openTime} – ${c.closeTime}` : 'Hours not configured';
                  const canBook = Boolean(c.isOnboarded && c.bookingEnabled !== false);
                  return `
                    <div class="select-tile" style="cursor:default;">
                      <div class="tile-title">${Utils.esc(localizeCentre(c))}</div>
                      <p class="text-xs text-secondary">${Utils.esc(c.address)}</p>
                      <div class="meta-line">
                        <span>Hours: ${Utils.esc(hoursLabel)}</span>
                        ${
                          c.phone && c.phone !== '—'
                            ? `<span class="meta-sep">·</span><span>${Utils.esc(c.phone)}</span>`
                            : ''
                        }
                      </div>
                      <div style="display:flex;gap:8px;margin-top:8px;">
                        <button type="button" class="btn ${canBook ? 'btn-primary' : 'btn-secondary'} btn-sm" data-open-business="${c.id}">${
                          canBook ? 'Book Token' : 'View Listing'
                        }</button>
                        <button type="button" class="btn btn-ghost btn-sm" data-toggle-fav="${c.id}">Remove</button>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>`
          : `<div class="empty-state">
              ${UI.renderVisual(
                UI.MEDIA.calmLounge,
                'Calm SmartQ service centre lounge',
                'empty-state-media',
                { icon: 'building', fallbackLabel: 'No Favourite Centres Saved' }
              )}
              <div class="empty-state-title">No favourite centres saved</div>
              <p class="empty-state-desc">Save frequently visited Bhopal businesses or service centres for one-click access.</p>
              <button type="button" class="btn btn-primary btn-sm" data-nav="directory">Explore Bhopal Directory</button>
            </div>`
      }
    </section>
  `;
};

/* --------------------------------------------------------------------------
   12. Views — Counter Operator Station, Admin Console & Public Live Display
   -------------------------------------------------------------------------- */
Views.renderOperator = () => {
  const db = AppState.db;
  const user = AuthService.getCurrentUser(db, AppState.session);

  if (!user || user.role !== 'operator') {
    return `
      <main id="main-content" class="container">
        <section class="surface" style="max-width:620px;margin:24px auto;">
          <h1 class="section-title" style="margin-bottom:8px;">Counter Operator Station</h1>
          <p class="text-secondary" style="margin-bottom:18px;">This workspace is restricted to authenticated Counter Operators verified in Supabase. Row Level Security restricts each operator strictly to their assigned business and counter.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" data-nav="auth">Sign In with Supabase</button>
            <button type="button" class="btn btn-secondary" data-action="open-setup-guide">Setup Guide</button>
          </div>
        </section>
      </main>
    `;
  }

  const counter = db.counters.find((c) => c.id === user.assignedCounterId || c.operatorId === user.id);
  if (!counter) {
    return `
      <main id="main-content" class="container">
        <section class="surface empty-state">
          <div class="empty-state-title">No Counter Assigned</div>
          <p class="empty-state-desc">Ask an administrator to assign an active counter to your operator account (${Utils.esc(
            user.email || user.name
          )}) in the Admin Console.</p>
        </section>
      </main>
    `;
  }

  const centre = db.centres.find((c) => c.id === counter.centreId);
  const st = QueueEngine.getCounterState(db, counter.id);
  const current = st.current;
  const nextFive = st.waiting.slice(0, 5);
  const completedToday = db.tokens
    .filter((tok) => tok.counterId === counter.id && tok.status === 'Completed')
    .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime());

  const currentCat = current ? db.categories.find((c) => c.id === current.categoryId) : null;

  return `
    <main id="main-content" class="container">
      <div class="section-header">
        <div>
          <h1 class="section-title">${Utils.esc(counter.number)} — ${Utils.esc(counter.name)}</h1>
          <div class="meta-line" style="margin-top:4px;">
            <span>${Utils.esc(centre ? centre.name : '')}</span>
            <span class="meta-sep">·</span>
            <span>Operator: <strong>${Utils.esc(user.name)}</strong></span>
            <span class="meta-sep">·</span>
            <span class="status-text ${Utils.statusClass(counter.status)}">${Utils.esc(
              t(`statusMap.${counter.status}`)
            )}</span>
            <span class="meta-sep">·</span>
            <span>Waiting: <strong class="mono">${st.waiting.length}</strong></span>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          ${
            counter.status === 'open'
              ? `<button type="button" class="btn btn-secondary btn-sm" data-action="pause-counter-prompt" data-counter-id="${counter.id}">Pause My Counter</button>`
              : counter.status === 'paused'
              ? `<button type="button" class="btn btn-success btn-sm" data-action="resume-counter" data-counter-id="${counter.id}">Resume Counter</button>`
              : ''
          }
          <button type="button" class="btn btn-secondary btn-sm" data-nav="display">Open Live Display</button>
        </div>
      </div>

      ${
        counter.status === 'paused'
          ? `<div class="form-notice" style="margin-bottom:20px;">Counter is paused (${Utils.esc(
              counter.pauseReason || 'Break'
            )}). Resume counter before calling the next customer.</div>`
          : ''
      }

      <div class="operator-grid">
        <div>
          <section class="serving-stage">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
              <span class="text-xs" style="color:#c7d2fe;font-weight:600;">Current Active Token</span>
              <span class="text-xs mono" style="color:#e0e7ff;">${
                current ? Utils.esc(current.status) : 'Counter Idle'
              }</span>
            </div>

            ${
              current
                ? `
                  <div class="serving-stage-token">${Utils.esc(current.tokenNumber)}</div>
                  <div style="color:#e8edff;font-size:0.9375rem;">
                    <strong>${Utils.esc(current.customerName)}</strong> · ${Utils.esc(
                    currentCat ? currentCat.name : ''
                  )} · ${Utils.esc(Utils.maskPhone(current.customerPhone))}
                  </div>
                  <div class="text-xs" style="color:#c7d2fe;margin-top:6px;">
                    Booked ${Utils.esc(Utils.formatTime(current.createdAt))} · Called ${Utils.esc(
                      Utils.formatTime(current.calledAt)
                    )} · Elapsed: <strong class="mono">${Math.max(
                      1,
                      Math.round(
                        (Date.now() -
                          new Date(current.servingStartedAt || current.calledAt || current.createdAt).getTime()) /
                          60000
                      )
                    )} min</strong>${
                      current.priorityType !== 'standard' ? ` · Priority: ${Utils.esc(current.priorityType)}` : ''
                    }
                  </div>

                  ${
                    current.status === 'Called'
                      ? (() => {
                          const grace = QueueEngine.getGraceStatus(db, current);
                          const autoOn = db.settings.autoNoShowEnabled !== false;
                          return `
                            <div class="operator-grace-bar ${grace.remainingSec <= 30 ? 'urgent' : ''}">
                              <span class="text-xs" style="color:#eef2ff;">
                                No-Show Grace Window: <strong class="mono" id="op-grace-countdown" data-called-at="${Utils.esc(
                                  current.calledAt || ''
                                )}" data-grace-sec="${grace.graceSec}">${
                            grace.expired ? 'Expired — recovering...' : `${grace.formattedRemaining} remaining`
                          }</strong>
                              </span>
                              <span class="text-xs" style="color:#c7d2fe;">
                                ${autoOn ? 'Auto-Recovery ON (recall resets timer)' : 'Manual No-Show mode'}
                              </span>
                            </div>
                          `;
                        })()
                      : ''
                  }

                  <div style="display:grid;grid-template-columns:1fr 160px;gap:12px;margin-top:16px;align-items:start;">
                    <div>
                      <label class="form-label" style="color:#e0e7ff;display:block;margin-bottom:6px;" for="op-service-notes">Service Notes (Saved on Completion)</label>
                      <textarea id="op-service-notes" class="form-textarea operator-dark-input" style="min-height:68px;" placeholder="Add brief handling notes...">${Utils.esc(
                        current.notes || ''
                      )}</textarea>
                    </div>
                    <div>
                      <label class="form-label" style="color:#e0e7ff;display:block;margin-bottom:6px;" for="op-actual-duration">Actual Duration (min)</label>
                      <input id="op-actual-duration" type="number" min="1" max="180" class="form-input mono operator-dark-input" placeholder="Auto" title="Leave blank to auto-track elapsed minutes, or enter actual minutes to update counter ETA history" />
                      <div class="text-xs" style="color:#c7d2fe;margin-top:4px;">Auto-tracks elapsed time</div>
                    </div>
                  </div>

                  <div class="operator-action-grid">
                    ${
                      current.status === 'Called'
                        ? `<button type="button" class="btn btn-secondary" data-op-action="arrived" data-token-id="${current.id}">${Utils.esc(
                            t('markArrived')
                          )}</button>`
                        : ''
                    }
                    ${
                      current.status === 'Called' || current.status === 'Arrived'
                        ? `<button type="button" class="btn btn-accent" data-op-action="start" data-token-id="${current.id}">${Utils.esc(
                            t('startService')
                          )}</button>`
                        : ''
                    }
                    <button type="button" class="btn btn-success" data-op-action="complete" data-token-id="${current.id}">${Utils.esc(
                      t('completeService')
                    )}</button>
                    ${
                      current.status === 'Called'
                        ? `<button type="button" class="btn btn-secondary" data-op-action="recall" data-token-id="${current.id}">${Utils.esc(
                            t('recallToken')
                          )}${current.recallCount ? ` (${current.recallCount})` : ''}</button>`
                        : ''
                    }
                    ${
                      current.status !== 'Serving'
                        ? `<button type="button" class="btn btn-secondary" data-op-action="skip" data-token-id="${current.id}">${Utils.esc(
                            t('skipToken')
                          )}</button>`
                        : ''
                    }
                    ${
                      current.status === 'Called'
                        ? `<button type="button" class="btn btn-danger" data-action="noshow-prompt" data-token-id="${current.id}">${Utils.esc(
                            t('markNoShow')
                          )}</button>`
                        : ''
                    }
                  </div>
                `
                : `
                  <div class="serving-stage-token">—</div>
                  <p style="color:#cbd5e1;font-size:0.9375rem;margin-bottom:20px;">
                    ${
                      st.waiting.length
                        ? `${st.waiting.length} customer(s) waiting. Next up: ${Utils.esc(st.waiting[0].tokenNumber)}.`
                        : 'Queue is currently empty for this counter.'
                    }
                  </p>
                  <button type="button" class="btn btn-accent btn-lg" data-op-action="call-next" data-counter-id="${
                    counter.id
                  }" ${st.waiting.length === 0 || counter.status !== 'open' ? 'disabled' : ''}>${Utils.esc(
                    t('callNext')
                  )}</button>
                `
            }
          </section>

          <section class="surface-flush">
            <div class="table-toolbar">
              <h2 style="font-size:1rem;">Completed Tokens (${completedToday.length})</h2>
              <span class="text-xs text-muted">Counter historical avg: <strong class="mono">~${st.etaStats.rollingAvgMin} min</strong> (${st.etaStats.sampleCount} samples)</span>
            </div>
            ${
              completedToday.length
                ? `<div class="table-wrap">
                    <table class="data-table">
                      <thead>
                        <tr>
                          <th>Token</th>
                          <th>Customer</th>
                          <th class="num-col">Duration</th>
                          <th>Completed</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${completedToday
                          .slice(0, 10)
                          .map((tok) => {
                            const hist = db.serviceHistory.find((h) => h.tokenId === tok.id && h.outcome === 'Completed');
                            const dur = tok.actualServiceDurationMin || (hist ? hist.serviceDurationMin : null);
                            return `
                              <tr>
                                <td class="mono"><strong>${Utils.esc(tok.tokenNumber)}</strong></td>
                                <td>${Utils.esc(tok.customerName)}</td>
                                <td class="num-col">${dur ? `${dur} min` : '—'}</td>
                                <td class="mono text-xs">${Utils.esc(Utils.formatTime(tok.completedAt))}</td>
                                <td class="text-xs text-secondary">${Utils.esc(tok.notes || '—')}</td>
                              </tr>
                            `;
                          })
                          .join('')}
                      </tbody>
                    </table>
                  </div>`
                : `<div class="empty-state">No tokens completed at this counter yet.</div>`
            }
          </section>
        </div>

        <aside style="display:flex;flex-direction:column;gap:20px;">
          <section class="surface">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <h2 style="font-size:1rem;">Next 5 Waiting Tokens</h2>
              <span class="mono text-xs text-muted">${st.waiting.length} total</span>
            </div>
            ${
              nextFive.length
                ? `<div class="role-list">
                    ${nextFive
                      .map((tok, i) => {
                        const cat = db.categories.find((c) => c.id === tok.categoryId);
                        return `
                          <div class="role-row">
                            <div>
                              <div class="mono" style="font-weight:700;">#${i + 1} · ${Utils.esc(tok.tokenNumber)}${
                                tok.priorityType !== 'standard' ? ` (${Utils.esc(tok.priorityType)})` : ''
                              }</div>
                              <div class="text-xs text-secondary">${Utils.esc(tok.customerName)} · ${Utils.esc(
                                cat ? cat.name : ''
                              )}</div>
                            </div>
                            <span class="mono text-xs text-muted">~${tok.etaMin}m</span>
                          </div>
                        `;
                      })
                      .join('')}
                  </div>`
                : `<p class="text-sm text-muted">No customers currently waiting.</p>`
            }
          </section>

          <section class="surface">
            <h2 style="font-size:1rem;margin-bottom:12px;">Skipped Tokens (${st.skipped.length})</h2>
            ${
              st.skipped.length
                ? `<div class="role-list">
                    ${st.skipped
                      .map(
                        (tok) => `
                          <div class="role-row">
                            <div>
                              <div class="mono" style="font-weight:700;">${Utils.esc(tok.tokenNumber)}</div>
                              <div class="text-xs text-muted">${Utils.esc(tok.customerName)}</div>
                            </div>
                            <div style="display:flex;gap:6px;">
                              <button type="button" class="btn btn-secondary btn-sm" data-op-action="recall" data-token-id="${tok.id}">Recall</button>
                              <button type="button" class="btn btn-danger-outline btn-sm" data-action="noshow-prompt" data-token-id="${tok.id}">No-Show</button>
                            </div>
                          </div>
                        `
                      )
                      .join('')}
                  </div>`
                : `<p class="text-sm text-muted">No skipped tokens waiting for recall.</p>`
            }
          </section>
        </aside>
      </div>
    </main>
  `;
};

Views.renderAdmin = () => {
  const db = AppState.db;
  const user = AuthService.getCurrentUser(db, AppState.session);

  if (!user || user.role !== 'admin') {
    return `
      <main id="main-content" class="container">
        <section class="surface" style="max-width:620px;margin:24px auto;">
          <h1 class="section-title" style="margin-bottom:8px;">Administrator Console</h1>
          <p class="text-secondary" style="margin-bottom:18px;">Server-verified Administrator authentication is required to onboard Bhopal businesses, configure counters, assign operators, inspect audit logs, and modify queue policy rules.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" data-nav="auth">Sign In as Administrator</button>
            <button type="button" class="btn btn-secondary" data-action="open-setup-guide">Admin Bootstrap &amp; Setup Guide</button>
          </div>
        </section>
      </main>
    `;
  }

  const tab = AppState.adminTab;
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'queues', label: 'Live Queues & Bookings', icon: 'queues' },
    { id: 'centres', label: 'Bhopal Businesses', icon: 'building' },
    { id: 'counters', label: 'Services & Counters', icon: 'layers' },
    { id: 'operators', label: 'Operators', icon: 'users' },
    { id: 'analytics', label: 'Analytics & Reports', icon: 'chart' },
    { id: 'rules', label: 'Notifications & Priority', icon: 'bell' },
    { id: 'audit', label: 'Audit Logs & Settings', icon: 'shield' },
  ];

  const currentTabLabel = (navItems.find((n) => n.id === tab) || navItems[0]).label;

  return `
    <div class="admin-shell">
      <aside class="admin-sidebar" aria-label="Administrator navigation">
        <div class="sidebar-section-label">Operations</div>
        ${navItems
          .slice(0, 5)
          .map(
            (n) =>
              `<button type="button" class="sidebar-btn ${tab === n.id ? 'active' : ''}" data-admin-tab="${n.id}">${UI.icon(
                n.icon,
                'ui-icon'
              )}<span>${Utils.esc(n.label)}</span></button>`
          )
          .join('')}
        <div class="sidebar-section-label">Governance</div>
        ${navItems
          .slice(5)
          .map(
            (n) =>
              `<button type="button" class="sidebar-btn ${tab === n.id ? 'active' : ''}" data-admin-tab="${n.id}">${UI.icon(
                n.icon,
                'ui-icon'
              )}<span>${Utils.esc(n.label)}</span></button>`
          )
          .join('')}
      </aside>

      <main id="main-content" class="admin-main">
        <div class="breadcrumb-bar">
          <div class="breadcrumb-trail">
            <span>SmartQ Admin</span>
            <span aria-hidden="true">/</span>
            <span class="breadcrumb-current">${Utils.esc(currentTabLabel)}</span>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn btn-secondary btn-sm" data-action="export-csv">Export CSV Report</button>
            <button type="button" class="btn btn-accent btn-sm" data-action="open-add-counter">+ Add Counter</button>
          </div>
        </div>

        ${
          tab === 'overview'
            ? Views.renderAdminOverview()
            : tab === 'queues'
            ? Views.renderAdminQueues()
            : tab === 'centres'
            ? Views.renderAdminCentres()
            : tab === 'counters'
            ? Views.renderAdminCategoriesCounters()
            : tab === 'operators'
            ? Views.renderAdminOperators()
            : tab === 'analytics'
            ? Views.renderAdminAnalytics()
            : tab === 'rules'
            ? Views.renderAdminRules()
            : Views.renderAdminAuditSettings()
        }
      </main>
    </div>
  `;
};

Views.renderAdminOverview = () => {
  const db = AppState.db;
  const k = AnalyticsEngine.getOverviewKpis(db);
  const ns = AnalyticsEngine.getNoShowStats(db);
  const graceLabel = QueueEngine.formatGraceDuration(db.settings.noShowGraceSec || 180);

  return `
    <section class="kpi-grid-8" aria-label="Daily operational overview">
      <div class="kpi-tile"><div class="kpi-label">Total Tokens Today</div><div class="kpi-value">${k.totalToday}</div></div>
      <div class="kpi-tile"><div class="kpi-label">Currently Waiting</div><div class="kpi-value">${k.waiting}</div></div>
      <div class="kpi-tile"><div class="kpi-label">Currently Serving</div><div class="kpi-value">${k.serving}</div></div>
      <div class="kpi-tile"><div class="kpi-label">Completed</div><div class="kpi-value">${k.completed}</div></div>
      <div class="kpi-tile"><div class="kpi-label">Cancelled</div><div class="kpi-value">${k.cancelled}</div></div>
      <div class="kpi-tile">
        <div class="kpi-label">No-Show</div>
        <div class="kpi-value">${k.noShow}</div>
        <div class="kpi-foot">${ns.noShowRate}% rate · ${ns.autoNoShows} auto · ${ns.restoredCount} restored</div>
      </div>
      <div class="kpi-tile"><div class="kpi-label">Avg. Waiting Time</div><div class="kpi-value">~${k.avgWait} min</div></div>
      <div class="kpi-tile"><div class="kpi-label">Avg. Service Duration</div><div class="kpi-value">~${k.avgService} min</div></div>
    </section>

    <section class="surface-flush" style="margin-bottom:24px;">
      <div class="table-toolbar">
        <div>
          <h2 style="font-size:1.0625rem;">Counter Live Operations</h2>
          <p class="text-xs text-muted">Call next customer, pause/resume queues, or inspect congestion across all counters.</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" data-admin-tab="queues">View All Bookings</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Counter</th>
              <th>Centre</th>
              <th>Status</th>
              <th>Current Token</th>
              <th class="num-col">Waiting</th>
              <th class="num-col">Est. Wait / Pace</th>
              <th class="num-col">Skipped</th>
              <th>Quick Controls</th>
            </tr>
          </thead>
          <tbody>
            ${db.counters
              .map((cnt) => {
                const centre = db.centres.find((c) => c.id === cnt.centreId);
                const st = QueueEngine.getCounterState(db, cnt.id);
                const grace = st.current && st.current.status === 'Called' ? QueueEngine.getGraceStatus(db, st.current) : null;
                return `
                  <tr>
                    <td><strong>${Utils.esc(cnt.number)}</strong><div class="text-xs text-muted">${Utils.esc(cnt.name)}</div></td>
                    <td>${Utils.esc(centre ? centre.name : '—')}</td>
                    <td><span class="status-text ${Utils.statusClass(cnt.status)}">${Utils.esc(
                      t(`statusMap.${cnt.status}`)
                    )}</span></td>
                    <td class="mono">
                      ${st.current ? `${Utils.esc(st.current.tokenNumber)} (${Utils.esc(st.current.status)})` : '—'}
                      ${
                        grace
                          ? `<div class="text-xs text-muted">Grace: ${
                              grace.expired ? 'Expired' : `${grace.formattedRemaining} left`
                            }</div>`
                          : ''
                      }
                    </td>
                    <td class="num-col">${st.waiting.length} / ${cnt.maxCapacity}</td>
                    <td class="num-col">
                      ${cnt.status === 'open' ? `~${st.projectedWaitMin}m est.` : '—'}
                      <div class="text-xs text-muted">~${st.etaStats.rollingAvgMin}m avg (${st.etaStats.sampleCount})</div>
                    </td>
                    <td class="num-col">${st.skipped.length}</td>
                    <td>
                      <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button type="button" class="btn btn-primary btn-sm" data-op-action="call-next" data-counter-id="${
                          cnt.id
                        }" ${st.waiting.length === 0 || st.current || cnt.status !== 'open' ? 'disabled' : ''}>Call Next</button>
                        ${
                          st.current
                            ? `<button type="button" class="btn btn-success btn-sm" data-op-action="complete" data-token-id="${st.current.id}">Complete</button>`
                            : ''
                        }
                        ${
                          st.current && st.current.status === 'Called'
                            ? `<button type="button" class="btn btn-danger-outline btn-sm" data-action="noshow-prompt" data-token-id="${st.current.id}">No-Show</button>`
                            : ''
                        }
                        ${
                          cnt.status === 'open'
                            ? `<button type="button" class="btn btn-secondary btn-sm" data-action="pause-counter-prompt" data-counter-id="${cnt.id}">Pause</button>`
                            : cnt.status === 'paused'
                            ? `<button type="button" class="btn btn-secondary btn-sm" data-action="resume-counter" data-counter-id="${cnt.id}">Resume</button>`
                            : ''
                        }
                      </div>
                    </td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="surface-flush">
      <div class="table-toolbar">
        <div>
          <h2 style="font-size:1.0625rem;">No-Show History & Automatic Queue Recovery (${ns.totalEvents})</h2>
          <p class="text-xs text-muted">
            Grace period: <strong class="mono">${Utils.esc(graceLabel)}</strong> · Auto-Recovery: <strong>${
              db.settings.autoNoShowEnabled !== false ? 'Active' : 'Disabled'
            }</strong> · ${ns.autoNoShows} automatic · ${ns.manualNoShows} manual · ${ns.restoredCount} restored
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-secondary btn-sm" data-action="run-noshow-check">Check Expired Calls</button>
          <button type="button" class="btn btn-ghost btn-sm" data-admin-tab="rules">Configure Grace Period</button>
        </div>
      </div>
      ${
        ns.history.length
          ? `<div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Customer</th>
                    <th>Counter</th>
                    <th>Timestamp</th>
                    <th>Mode</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${ns.history
                    .slice(0, 20)
                    .map((h) => {
                      const liveTok = db.tokens.find((t) => t.id === h.tokenId);
                      const canRestore = liveTok && liveTok.status === 'No-show' && !h.restored;
                      return `
                        <tr>
                          <td class="mono"><strong>${Utils.esc(h.tokenNumber)}</strong></td>
                          <td>${Utils.esc(h.customerName || '—')}</td>
                          <td>${Utils.esc(h.counterNumber)}</td>
                          <td class="mono text-xs">${Utils.esc(Utils.formatDateTime(h.timestamp))}</td>
                          <td class="text-xs">${h.mode === 'automatic' ? 'Automatic' : 'Manual'}</td>
                          <td class="text-xs text-secondary">${Utils.esc(h.reason)}</td>
                          <td>
                            <span class="status-text ${h.restored ? 'status-open' : 'status-closed'}">${
                              h.restored ? 'Restored' : 'No-Show'
                            }</span>
                          </td>
                          <td>
                            ${
                              canRestore
                                ? `<button type="button" class="btn btn-secondary btn-sm" data-action="restore-token-prompt" data-token-id="${h.tokenId}">Restore Token</button>`
                                : `<span class="text-xs text-muted">${
                                    h.restored ? `By ${Utils.esc(h.restoredBy || 'Admin')}` : '—'
                                  }</span>`
                            }
                          </td>
                        </tr>
                      `;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>`
          : `<div class="empty-state">No No-Show events recorded yet. Unclaimed tokens called past the ${Utils.esc(
              graceLabel
            )} grace period will be logged here automatically.</div>`
      }
    </section>
  `;
};

Views.renderAdminQueues = () => {
  const db = AppState.db;
  const f = AppState.adminFilters;
  const q = String(f.search || '').trim().toLowerCase();

  const filtered = db.tokens
    .filter((tok) => {
      if (f.status !== 'all' && tok.status !== f.status) return false;
      if (f.categoryId !== 'all' && tok.categoryId !== f.categoryId) return false;
      if (f.date && Utils.dateStrFromIso(tok.createdAt) !== f.date) return false;
      if (q) {
        const hay = `${tok.tokenNumber} ${tok.id} ${tok.customerName} ${tok.customerPhone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const statuses = ['Booked', 'Waiting', 'Approaching', 'Called', 'Arrived', 'Serving', 'Skipped', 'Completed', 'Cancelled', 'No-show'];

  return `
    <section class="surface-flush">
      <div class="table-toolbar">
        <div class="filter-row">
          <input
            type="search"
            class="form-input"
            id="admin-search-tokens"
            style="width:230px;"
            placeholder="Search token, name, mobile..."
            value="${Utils.esc(f.search)}"
          />
          <select class="form-select" id="admin-filter-status" style="width:150px;">
            <option value="all">All Statuses</option>
            ${statuses.map((s) => `<option value="${s}" ${f.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          <select class="form-select" id="admin-filter-cat" style="width:180px;">
            <option value="all">All Services</option>
            ${db.categories
              .map((c) => `<option value="${c.id}" ${f.categoryId === c.id ? 'selected' : ''}>${Utils.esc(c.name)}</option>`)
              .join('')}
          </select>
          <input type="date" class="form-input" id="admin-filter-date" style="width:155px;" value="${Utils.esc(f.date)}" />
        </div>
        <span class="text-xs text-muted mono">${filtered.length} bookings</span>
      </div>

      ${
        filtered.length
          ? `<div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Customer</th>
                    <th>Centre / Counter</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th class="num-col">Pos / ETA</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered
                    .map((tok) => {
                      const centre = db.centres.find((c) => c.id === tok.centreId);
                      const cnt = db.counters.find((c) => c.id === tok.counterId);
                      const cat = db.categories.find((c) => c.id === tok.categoryId);
                      return `
                        <tr>
                          <td class="mono">
                            <strong>${Utils.esc(tok.tokenNumber)}</strong>
                            <div class="text-xs text-muted">${Utils.esc(Utils.formatTime(tok.createdAt))}</div>
                          </td>
                          <td>
                            <strong>${Utils.esc(tok.customerName)}</strong>
                            <div class="text-xs mono text-muted">${Utils.esc(tok.customerPhone)}</div>
                          </td>
                          <td>
                            ${Utils.esc(centre ? centre.name : '—')}
                            <div class="text-xs text-muted">${Utils.esc(cnt ? cnt.number : '—')}</div>
                          </td>
                          <td>
                            ${Utils.esc(cat ? cat.name : '—')}
                            ${
                              tok.priorityType !== 'standard'
                                ? `<div class="text-xs" style="color:var(--violet-700);font-weight:600;">Priority: ${Utils.esc(
                                    tok.priorityType
                                  )}</div>`
                                : ''
                            }
                          </td>
                          <td><span class="status-text ${Utils.statusClass(tok.status)}">${Utils.esc(tok.status)}</span></td>
                          <td class="num-col">${tok.position > 0 ? `#${tok.position} · ~${tok.etaMin}m` : '—'}</td>
                          <td>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                              ${
                                tok.status === 'Booked'
                                  ? `<button type="button" class="btn btn-secondary btn-sm" data-action="checkin-token" data-token-id="${tok.id}">Check In</button>`
                                  : ''
                              }
                              ${
                                tok.status === 'Called'
                                  ? `<button type="button" class="btn btn-secondary btn-sm" data-op-action="arrived" data-token-id="${tok.id}">Arrived</button>`
                                  : ''
                              }
                              ${
                                tok.status === 'Called' || tok.status === 'Arrived'
                                  ? `<button type="button" class="btn btn-accent btn-sm" data-op-action="start" data-token-id="${tok.id}">Serve</button>`
                                  : ''
                              }
                              ${
                                ['Called', 'Arrived', 'Serving'].includes(tok.status)
                                  ? `<button type="button" class="btn btn-success btn-sm" data-op-action="complete" data-token-id="${tok.id}">Complete</button>`
                                  : ''
                              }
                              ${
                                tok.status === 'Called'
                                  ? `<button type="button" class="btn btn-secondary btn-sm" data-op-action="recall" data-token-id="${tok.id}">Recall</button>
                                     <button type="button" class="btn btn-danger-outline btn-sm" data-action="noshow-prompt" data-token-id="${tok.id}">No-Show</button>`
                                  : ''
                              }
                              ${
                                ['Called', 'Waiting', 'Approaching'].includes(tok.status)
                                  ? `<button type="button" class="btn btn-secondary btn-sm" data-op-action="skip" data-token-id="${tok.id}">Skip</button>`
                                  : ''
                              }
                              ${
                                tok.status === 'Skipped'
                                  ? `<button type="button" class="btn btn-secondary btn-sm" data-op-action="recall" data-token-id="${tok.id}">Recall</button>
                                     <button type="button" class="btn btn-secondary btn-sm" data-action="restore-token-prompt" data-token-id="${tok.id}">Restore</button>
                                     <button type="button" class="btn btn-danger-outline btn-sm" data-action="noshow-prompt" data-token-id="${tok.id}">No-Show</button>`
                                  : ''
                              }
                              ${
                                tok.status === 'No-show'
                                  ? `<button type="button" class="btn btn-secondary btn-sm" data-action="restore-token-prompt" data-token-id="${tok.id}">Restore Token</button>`
                                  : ''
                              }
                              ${
                                ['Booked', 'Waiting', 'Approaching'].includes(tok.status)
                                  ? `<button type="button" class="btn btn-secondary btn-sm" data-action="open-reschedule" data-token-id="${tok.id}">Move / Reschedule</button>`
                                  : ''
                              }
                              ${
                                ['Booked', 'Waiting', 'Approaching', 'Called', 'Skipped'].includes(tok.status)
                                  ? `<button type="button" class="btn btn-danger-outline btn-sm" data-action="cancel-token-prompt" data-token-id="${tok.id}">Cancel</button>`
                                  : ''
                              }
                            </div>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>`
          : `<div class="empty-state">No customer bookings match the selected filters.</div>`
      }
    </section>
  `;
};

Views.renderAdminCentres = () => {
  const db = AppState.db;
  const f = AppState.adminFilters;
  const q = String(f.bizSearch || '').trim().toLowerCase();

  const filtered = db.centres.filter((c) => {
    if (f.bizScope === 'bhopal' && c.dataScope === 'demo') return false;
    if (f.bizScope === 'operational' && (c.dataScope === 'demo' || !c.isOnboarded)) return false;
    if (f.bizScope === 'directory' && (c.dataScope === 'demo' || c.isOnboarded)) return false;
    if (f.bizScope === 'demo' && c.dataScope !== 'demo') return false;
    if (f.bizCategory !== 'all' && c.directoryCategoryId !== f.bizCategory) return false;
    if (f.bizArea !== 'all' && !matchesBhopalArea(c, f.bizArea)) return false;
    if (q) {
      const hay = `${c.name} ${c.address || ''} ${c.area || ''} ${c.locality || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const bhopalTotal = db.centres.filter((c) => c.dataScope !== 'demo').length;
  const verifiedTotal = db.centres.filter((c) => c.verified).length;
  const onboardedBhopal = db.centres.filter((c) => c.dataScope !== 'demo' && c.isOnboarded).length;

  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:12px;">
      <div>
        <h2 style="font-size:1.125rem;">Bhopal Businesses &amp; Service Centres (${filtered.length})</h2>
        <p class="text-xs text-muted">${bhopalTotal} Bhopal listings (${onboardedBhopal} onboarded, ${verifiedTotal} verified) · Demo sandbox entries clearly separated.</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button type="button" class="btn btn-secondary btn-sm" data-action="open-add-announcement">+ Service Announcement</button>
        <button type="button" class="btn btn-primary btn-sm" data-action="open-add-centre">+ Add Bhopal Business</button>
      </div>
    </div>

    <section class="surface" style="margin-bottom:18px;padding:18px 20px;">
      <div class="admin-biz-filters">
        <input
          type="search"
          id="admin-biz-search"
          class="form-input"
          placeholder="Search business name or Bhopal address..."
          value="${Utils.esc(f.bizSearch || '')}"
        />
        <select id="admin-biz-scope" class="form-select" aria-label="Filter by data scope">
          <option value="all" ${f.bizScope === 'all' ? 'selected' : ''}>All Scopes</option>
          <option value="bhopal" ${f.bizScope === 'bhopal' ? 'selected' : ''}>All Bhopal Listings</option>
          <option value="operational" ${f.bizScope === 'operational' ? 'selected' : ''}>Bhopal Live Onboarded</option>
          <option value="directory" ${f.bizScope === 'directory' ? 'selected' : ''}>Directory Only (Not Onboarded)</option>
          <option value="demo" ${f.bizScope === 'demo' ? 'selected' : ''}>Demo Sandbox Only</option>
        </select>
        <select id="admin-biz-cat" class="form-select" aria-label="Filter by category">
          <option value="all" ${f.bizCategory === 'all' ? 'selected' : ''}>All Categories (10)</option>
          ${BHOPAL_CATEGORIES.map(
            (cat) => `<option value="${cat.id}" ${f.bizCategory === cat.id ? 'selected' : ''}>${Utils.esc(cat.name)}</option>`
          ).join('')}
        </select>
        <select id="admin-biz-area" class="form-select" aria-label="Filter by Bhopal area">
          <option value="all" ${f.bizArea === 'all' ? 'selected' : ''}>All Bhopal Areas (15)</option>
          ${BHOPAL_AREAS.map(
            (a) => `<option value="${Utils.esc(a)}" ${f.bizArea === a ? 'selected' : ''}>${Utils.esc(a)}</option>`
          ).join('')}
        </select>
      </div>
    </section>

    <section class="surface-flush">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Business &amp; Category</th>
              <th>Bhopal Location &amp; Address</th>
              <th>Hours / Verification</th>
              <th class="num-col">Counters</th>
              <th>Queue Booking</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${
              filtered.length
                ? filtered
                    .map((c) => {
                      const cat = getDirectoryCategory(c.directoryCategoryId);
                      const cntCount = db.counters.filter((cnt) => cnt.centreId === c.id).length;
                      const activeAnn = (c.announcements || []).filter((a) => a.active);
                      const hoursText = c.openTime && c.closeTime ? `${c.openTime} – ${c.closeTime}` : 'Hours not set';
                      const scopeTag =
                        c.dataScope === 'demo'
                          ? 'Demo Sandbox'
                          : c.isOnboarded
                          ? 'Operational'
                          : 'Directory Listing';
                      const bookingStatusText = !c.isOnboarded
                        ? 'Not Onboarded'
                        : c.bookingEnabled === false
                        ? 'Booking Paused'
                        : 'Booking Enabled';
                      const bookingStatusCls = !c.isOnboarded
                        ? 'status-directory'
                        : c.bookingEnabled === false
                        ? 'status-paused'
                        : 'status-open';

                      return `
                        <tr>
                          <td>
                            <strong>${Utils.esc(c.name)}</strong>
                            <div class="text-xs text-muted">${Utils.esc(cat.shortName)} · ${Utils.esc(scopeTag)}</div>
                            ${
                              activeAnn.length
                                ? activeAnn
                                    .map(
                                      (a) =>
                                        `<div class="text-xs" style="margin-top:4px;color:var(--semantic-amber);">Notice: ${Utils.esc(
                                          a.message
                                        )} <button type="button" class="utility-link-btn" data-clear-ann="${c.id}|${
                                          a.id
                                        }">Remove</button></div>`
                                    )
                                    .join('')
                                : ''
                            }
                          </td>
                          <td>
                            <div><strong>${Utils.esc(c.locality || c.area || c.city)}</strong></div>
                            <div class="text-xs text-muted">${Utils.esc(c.address)}</div>
                            ${c.phone && c.phone !== '—' ? `<div class="text-xs mono text-muted">${Utils.esc(c.phone)}</div>` : ''}
                          </td>
                          <td class="text-xs">
                            <div class="mono">${Utils.esc(hoursText)}</div>
                            <div style="margin-top:4px;">
                              <span class="status-text ${c.verified ? 'status-open' : 'status-waiting'}">${
                                c.verified ? 'Verified' : 'Unverified'
                              }</span>
                            </div>
                          </td>
                          <td class="num-col">${cntCount}</td>
                          <td>
                            <span class="status-text ${bookingStatusCls}">${Utils.esc(bookingStatusText)}</span>
                            ${
                              !c.isActive
                                ? `<div class="text-xs status-closed">Listing Disabled</div>`
                                : ''
                            }
                          </td>
                          <td>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                              <button type="button" class="btn btn-secondary btn-sm" data-edit-business="${c.id}">Edit</button>
                              <button type="button" class="btn btn-secondary btn-sm" data-apply-templates="${c.id}">Counters (${cntCount})</button>
                              <button type="button" class="btn btn-secondary btn-sm" data-toggle-verify-biz="${c.id}">${
                                c.verified ? 'Unverify' : 'Verify'
                              }</button>
                              <button type="button" class="btn ${
                                c.isOnboarded && c.bookingEnabled !== false ? 'btn-danger-outline' : 'btn-success'
                              } btn-sm" data-toggle-booking-biz="${c.id}">${
                                !c.isOnboarded
                                  ? 'Enable Booking'
                                  : c.bookingEnabled === false
                                  ? 'Resume Booking'
                                  : 'Pause Booking'
                              }</button>
                            </div>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')
                : `<tr><td colspan="6" class="text-muted" style="text-align:center;padding:24px;">No businesses match the selected filters.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;
};

Views.renderAdminCategoriesCounters = () => {
  const db = AppState.db;
  const visibleCats = db.categories.filter(
    (cat) => !cat.isTemplateService || db.counters.some((cnt) => (cnt.categoryIds || []).includes(cat.id))
  );

  return `
    <section class="surface-flush" style="margin-bottom:24px;">
      <div class="table-toolbar">
        <div>
          <h2 style="font-size:1.0625rem;">Active Counter Services (${visibleCats.length})</h2>
          <p class="text-xs text-muted">Configure token prefix codes and default service durations. Additional template services activate automatically when assigned to a counter.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" data-action="open-add-category">+ Add Service Type</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Prefix</th>
              <th class="num-col">Default Duration</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${visibleCats
              .map(
                (cat) => `
                  <tr>
                    <td><strong>${Utils.esc(cat.name)}</strong></td>
                    <td class="mono">${Utils.esc(cat.code)}</td>
                    <td class="num-col">${cat.defaultDurationMin} min</td>
                    <td class="text-xs text-secondary">${Utils.esc(cat.description)}</td>
                    <td><span class="status-text ${cat.active ? 'status-open' : 'status-closed'}">${
                      cat.active ? 'Active' : 'Disabled'
                    }</span></td>
                    <td>
                      <button type="button" class="btn btn-secondary btn-sm" data-toggle-category="${cat.id}">${
                        cat.active ? 'Disable' : 'Enable'
                      }</button>
                    </td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="surface-flush">
      <div class="table-toolbar">
        <div>
          <h2 style="font-size:1.0625rem;">Configured Counters (${db.counters.length})</h2>
          <p class="text-xs text-muted">Create, edit, configure operating hours, service durations, capacity, pause, or disable counters.</p>
        </div>
        <button type="button" class="btn btn-accent btn-sm" data-action="open-add-counter">+ Add Counter</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Counter</th>
              <th>Business / Scope</th>
              <th>Counter Hours</th>
              <th>Operator</th>
              <th class="num-col">Capacity</th>
              <th class="num-col">Duration</th>
              <th>Status</th>
              <th>Controls</th>
            </tr>
          </thead>
          <tbody>
            ${db.counters
              .map((cnt) => {
                const centre = db.centres.find((c) => c.id === cnt.centreId);
                const op = db.users.find((u) => u.id === cnt.operatorId);
                const cntHours = cnt.openTime && cnt.closeTime ? `${cnt.openTime} – ${cnt.closeTime}` : 'Not set';
                return `
                  <tr>
                    <td><strong>${Utils.esc(cnt.number)}</strong><div class="text-xs text-muted">${Utils.esc(cnt.name)}</div></td>
                    <td>
                      <strong>${Utils.esc(centre ? centre.name : '—')}</strong>
                      <div class="text-xs text-muted">${Utils.esc(
                        centre ? (centre.dataScope === 'demo' ? 'Demo Sandbox' : centre.area || 'Bhopal') : ''
                      )}</div>
                    </td>
                    <td class="mono text-xs">${Utils.esc(cntHours)}</td>
                    <td>${Utils.esc(op ? op.name : 'Unassigned')}</td>
                    <td class="num-col">${cnt.maxCapacity}</td>
                    <td class="num-col">${cnt.avgDurationMin}m</td>
                    <td><span class="status-text ${Utils.statusClass(cnt.status)}">${Utils.esc(
                      t(`statusMap.${cnt.status}`)
                    )}</span></td>
                    <td>
                      <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button type="button" class="btn btn-secondary btn-sm" data-edit-counter="${cnt.id}">Edit</button>
                        ${
                          cnt.status === 'open'
                            ? `<button type="button" class="btn btn-secondary btn-sm" data-action="pause-counter-prompt" data-counter-id="${cnt.id}">Pause</button>`
                            : `<button type="button" class="btn btn-success btn-sm" data-action="resume-counter" data-counter-id="${cnt.id}">Open</button>`
                        }
                        ${
                          cnt.status !== 'closed'
                            ? `<button type="button" class="btn btn-danger-outline btn-sm" data-disable-counter="${cnt.id}">Disable</button>`
                            : ''
                        }
                      </div>
                    </td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
};

Views.renderAdminOperators = () => {
  const db = AppState.db;
  const ops = db.users.filter((u) => u.role === 'operator');
  return `
    <section class="surface-flush">
      <div class="table-toolbar">
        <div>
          <h2 style="font-size:1.0625rem;">Counter Operators (${ops.length})</h2>
          <p class="text-xs text-muted">Promote registered Supabase users by email and bind them to specific counters via RLS-enforced operator assignments.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" data-action="open-add-operator">+ Assign Operator by Email</button>
      </div>
      ${
        ops.length
          ? `<div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Operator Name</th>
                    <th>Login Email</th>
                    <th>Mobile</th>
                    <th>Assigned Counter</th>
                    <th>Business / Centre</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${ops
                    .map((op) => {
                      const cnt = db.counters.find((c) => c.id === op.assignedCounterId || c.operatorId === op.id);
                      const centre = db.centres.find((c) => c.id === (cnt ? cnt.centreId : op.assignedCentreId));
                      return `
                        <tr>
                          <td><strong>${Utils.esc(op.name)}</strong></td>
                          <td class="mono text-xs">${Utils.esc(op.email)}</td>
                          <td class="mono text-xs">${Utils.esc(op.phone || '—')}</td>
                          <td>${Utils.esc(cnt ? `${cnt.number} (${cnt.name})` : 'Unassigned')}</td>
                          <td>${Utils.esc(centre ? centre.name : '—')}</td>
                          <td>
                            <button type="button" class="btn btn-secondary btn-sm" data-edit-operator="${op.id}">Reassign</button>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>`
          : `<div class="empty-state">
              <div class="empty-state-title">No Operators Assigned Yet</div>
              <p class="empty-state-desc">Ask a staff member to register an account via Supabase Auth, then click "Assign Operator by Email" to grant scoped counter access.</p>
            </div>`
      }
    </section>
  `;
};

Views.renderAdminAnalytics = () => {
  const db = AppState.db;
  const f = AppState.adminFilters;
  const rep = AnalyticsEngine.computeReport(db, {
    range: f.analyticsRange,
    fromDate: f.analyticsFrom,
    toDate: f.analyticsTo,
  });

  return `
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px;">
      <div class="segmented">
        <button type="button" class="segmented-btn ${f.analyticsRange === 'today' ? 'active' : ''}" data-an-range="today">Today</button>
        <button type="button" class="segmented-btn ${f.analyticsRange === '7d' ? 'active' : ''}" data-an-range="7d">Last 7 Days</button>
        <button type="button" class="segmented-btn ${f.analyticsRange === 'all' ? 'active' : ''}" data-an-range="all">All History</button>
      </div>
      <div class="filter-row">
        <input type="date" class="form-input" id="an-from" value="${Utils.esc(f.analyticsFrom)}" aria-label="From date" />
        <input type="date" class="form-input" id="an-to" value="${Utils.esc(f.analyticsTo)}" aria-label="To date" />
        <button type="button" class="btn btn-secondary btn-sm" data-action="apply-an-custom">Apply</button>
        <button type="button" class="btn btn-primary btn-sm" data-action="export-csv">Export Daily CSV</button>
      </div>
    </div>

    <section class="kpi-grid">
      <div class="kpi-tile">
        <div class="kpi-label">Total Bookings</div>
        <div class="kpi-value">${rep.totalBookings}</div>
        <div class="kpi-foot">${rep.completed} completed · ${rep.cancelled} cancelled</div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-label">Avg. Wait / Service</div>
        <div class="kpi-value">${rep.avgWait}m / ${rep.avgService}m</div>
        <div class="kpi-foot">Calculated from completed logs</div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-label">Peak Demand Hour</div>
        <div class="kpi-value">${Utils.esc(rep.peakHour.label)}</div>
        <div class="kpi-foot">${rep.peakHour.count} historical visits</div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-label">No-Show Rate</div>
        <div class="kpi-value">${rep.noShowRate}%</div>
        <div class="kpi-foot">${rep.noShow} missed tokens</div>
      </div>
    </section>

    <div class="charts-grid">
      <section class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Daily Bookings Trend</h3>
          <span class="text-xs text-muted">Total tokens per date</span>
        </div>
        ${UI.renderSvgBarChart(rep.dailySeries, { valueKey: 'total', labelKey: 'date', color: '#4f46e5' })}
      </section>

      <section class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Historical Peak Hours</h3>
          <span class="text-xs text-muted">Volume by hour of day</span>
        </div>
        ${UI.renderSvgBarChart(rep.hours, { valueKey: 'count', labelKey: 'label', color: '#0f172a' })}
      </section>

      <section class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Counter Utilization</h3>
          <span class="text-xs text-muted">Share of handled bookings</span>
        </div>
        <div class="bar-list">
          ${rep.counterStats
            .map(
              (cs) => `
                <div class="bar-item-row">
                  <div class="bar-item-head">
                    <span>${Utils.esc(cs.label)}</span>
                    <span class="mono">${cs.handled} (${cs.pct}%)</span>
                  </div>
                  <div class="bar-track"><div class="bar-fill" style="width:${cs.pct}%;"></div></div>
                </div>
              `
            )
            .join('')}
        </div>
      </section>

      <section class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Service Category Distribution</h3>
          <span class="text-xs text-muted">Bookings by service type</span>
        </div>
        <div class="bar-list">
          ${rep.categoryStats
            .map(
              (cat) => `
                <div class="bar-item-row">
                  <div class="bar-item-head">
                    <span>${Utils.esc(cat.name)}</span>
                    <span class="mono">${cat.count} (${cat.pct}%)</span>
                  </div>
                  <div class="bar-track"><div class="bar-fill bar-fill-navy" style="width:${cat.pct}%;"></div></div>
                </div>
              `
            )
            .join('')}
        </div>
      </section>
    </div>
  `;
};

Views.renderAdminRules = () => {
  const s = AppState.db.settings;
  const pr = s.priorityRules || {};
  return `
    <div class="auth-layout">
      <section class="surface">
        <h2 style="font-size:1.125rem;margin-bottom:6px;">Smart Notification Rules</h2>
        <p class="text-xs text-muted" style="margin-bottom:16px;">Configure automated in-app turn thresholds. Browser alerts require explicit user consent; SMS/WhatsApp require an external gateway.</p>
        <form id="admin-rules-form" style="display:flex;flex-direction:column;gap:10px;">
          <label class="checkbox-row">
            <input type="checkbox" name="notifyAtFive" ${s.notifyAtFive ? 'checked' : ''} />
            <span>Alert customer when queue position reaches #5</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" name="notifyAtThree" ${s.notifyAtThree ? 'checked' : ''} />
            <span>Alert customer when queue position reaches #3</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" name="notifyApproaching" ${s.notifyApproaching ? 'checked' : ''} />
            <span>Alert customer when turn is Approaching (Position #2)</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" name="notifyAtOne" ${s.notifyAtOne !== false ? 'checked' : ''} />
            <span>Alert customer when they are next (Position #1)</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" name="notifyEtaChange" ${s.notifyEtaChange !== false ? 'checked' : ''} />
            <span>Alert customer when estimated waiting time changes significantly</span>
          </label>

          <hr class="divider" style="margin:12px 0;" />
          <h3 style="font-size:1rem;">No-Show Management & Automatic Queue Recovery</h3>
          <p class="text-xs text-muted">Detect unclaimed called tokens past the grace period, mark them No-Show, recalculate ETAs, and automatically advance every open counter queue.</p>
          <label class="checkbox-row">
            <input type="checkbox" name="autoNoShowEnabled" ${s.autoNoShowEnabled !== false ? 'checked' : ''} />
            <span>Automatically detect and mark unclaimed Called tokens as No-Show</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" name="autoAdvanceOnNoShow" ${s.autoAdvanceOnNoShow !== false ? 'checked' : ''} />
            <span>Automatically call next waiting customer after a No-Show (Queue Recovery)</span>
          </label>
          <div class="form-field" style="max-width:260px;">
            <label class="form-label" for="rule-grace-sec">Grace Period (seconds, 15–900)</label>
            <input
              class="form-input mono"
              id="rule-grace-sec"
              name="noShowGraceSec"
              type="number"
              min="15"
              max="900"
              step="15"
              value="${Number(s.noShowGraceSec) || 180}"
              required
            />
            <span class="form-hint">Current: ${Utils.esc(QueueEngine.formatGraceDuration(s.noShowGraceSec || 180))} after call (recalling resets the timer).</span>
          </div>

          <hr class="divider" style="margin:12px 0;" />
          <h3 style="font-size:1rem;">Authorized Priority Eligibility</h3>
          <p class="text-xs text-muted">Only administrator-enabled priority groups appear during booking and every priority booking is recorded in the Audit Log.</p>
          <label class="checkbox-row">
            <input type="checkbox" name="pri_senior" ${pr.senior ? 'checked' : ''} />
            <span>Senior Citizens (65+)</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" name="pri_medical" ${pr.medical ? 'checked' : ''} />
            <span>Medical / Urgent Care Priority</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" name="pri_accessibility" ${pr.accessibility ? 'checked' : ''} />
            <span>Accessibility Assistance</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" name="pri_vip" ${pr.vip ? 'checked' : ''} />
            <span>Executive / VIP Policy</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" name="pri_requireReason" ${pr.requireReason ? 'checked' : ''} />
            <span>Require documented eligibility note for audit trail</span>
          </label>

          <div style="margin-top:12px;">
            <button type="submit" class="btn btn-primary">Save Policy Rules</button>
          </div>
        </form>
      </section>

      <section class="surface">
        <h2 style="font-size:1.125rem;margin-bottom:6px;">Supabase Backend &amp; Realtime Status</h2>
        <p class="text-xs text-muted" style="margin-bottom:14px;">
          SmartQ connects directly to Supabase PostgreSQL, Authentication, and Realtime via <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>. The service-role key is never exposed in frontend code; all access control is enforced by PostgreSQL Row Level Security (RLS).
        </p>
        <div class="role-list" style="margin-bottom:16px;">
          <div class="role-row">
            <span>Project Host</span>
            <strong class="mono text-xs">${Utils.esc((AppState.backend.configSummary && AppState.backend.configSummary.urlHost) || 'Not configured')}</strong>
          </div>
          <div class="role-row">
            <span>PostgreSQL Status</span>
            <strong class="mono text-xs">${Utils.esc(AppState.backend.connectionState)}</strong>
          </div>
          <div class="role-row">
            <span>Realtime Channel</span>
            <strong class="mono text-xs">${Utils.esc(AppState.backend.realtimeState)}</strong>
          </div>
          <div class="role-row">
            <span>Last Synced</span>
            <strong class="mono text-xs">${AppState.backend.lastSyncedAt ? Utils.esc(Utils.formatDateTime(AppState.backend.lastSyncedAt)) : 'Not synced yet'}</strong>
          </div>
          <div class="role-row">
            <span>LocalStorage Usage</span>
            <strong class="text-xs">UI preferences only (theme, language, voice)</strong>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button type="button" class="btn btn-primary btn-sm" data-action="refresh-supabase">Sync Live Data Now</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="open-setup-guide">Open Setup Guide</button>
        </div>
      </section>
    </div>
  `;
};

Views.renderAdminAuditSettings = () => {
  const db = AppState.db;
  return `
    <section class="surface" style="margin-bottom:24px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;">
      <div>
        <h2 style="font-size:1.0625rem;">Supabase Data Tools &amp; Bhopal Directory Seed</h2>
        <p class="text-xs text-muted">Export a JSON snapshot of current Supabase records, sync latest state, or idempotently seed the 17 real Bhopal directory establishments and 30 service templates.</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button type="button" class="btn btn-secondary btn-sm" data-action="export-json">Export JSON Backup</button>
        <button type="button" class="btn btn-primary btn-sm" data-action="seed-bhopal-directory">Seed 17 Bhopal Listings</button>
        <button type="button" class="btn btn-ghost btn-sm" data-action="refresh-supabase">Refresh from Supabase</button>
      </div>
    </section>

    <section class="surface-flush">
      <div class="table-toolbar">
        <h2 style="font-size:1.0625rem;">Queue & Priority Audit Logs (${db.auditLogs.length})</h2>
        <span class="text-xs text-muted">Immutable trail of bookings, calls, priority overrides, and admin changes</span>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${db.auditLogs
              .slice(0, 60)
              .map(
                (log) => `
                  <tr>
                    <td class="mono text-xs">${Utils.esc(Utils.formatDateTime(log.createdAt))}</td>
                    <td><strong>${Utils.esc(log.actorName)}</strong> <span class="text-xs text-muted">(${Utils.esc(
                      log.actorRole
                    )})</span></td>
                    <td class="mono text-xs">${Utils.esc(log.action)}</td>
                    <td class="text-sm">${Utils.esc(log.details)}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
};

Views.renderDisplay = () => {
  const db = AppState.db;
  const onboardedWithCounters = db.centres.filter(
    (c) => c.isActive && c.isOnboarded && db.counters.some((cnt) => cnt.centreId === c.id)
  );
  const activeCentres = onboardedWithCounters.length ? onboardedWithCounters : db.centres.filter((c) => c.isActive);
  if (!AppState.displayCentreId || !activeCentres.some((c) => c.id === AppState.displayCentreId)) {
    AppState.displayCentreId = activeCentres[0] ? activeCentres[0].id : '';
  }

  const centre = activeCentres.find((c) => c.id === AppState.displayCentreId) || activeCentres[0];
  const counters = centre ? db.counters.filter((c) => c.centreId === centre.id) : [];
  const activeAnns = centre ? (centre.announcements || []).filter((a) => a.active) : [];
  const lang = db.settings.language;
  const voiceOn = db.settings.voiceAnnouncements;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
    <div class="display-mode" id="main-content">
      <header class="display-header">
        <div>
          <div class="display-brand">${Utils.esc(t('brand'))} · ${Utils.esc(t('displayTitle'))}</div>
          <div class="text-sm" style="color:#94a3b8;margin-top:2px;">${Utils.esc(localizeCentre(centre))}</div>
        </div>

        <div class="display-controls">
          <select class="display-select" id="display-centre-select" aria-label="Select service centre">
            ${activeCentres
              .map(
                (c) =>
                  `<option value="${c.id}" ${c.id === (centre ? centre.id : '') ? 'selected' : ''}>${Utils.esc(
                    localizeCentre(c)
                  )}</option>`
              )
              .join('')}
          </select>
          <button type="button" class="display-btn" data-action="toggle-lang">${Utils.esc(t('languageLabel'))}</button>
          <button
            type="button"
            class="display-btn theme-toggle-btn ${db.settings.theme === 'dark' ? 'active' : ''}"
            data-action="toggle-theme"
            aria-pressed="${db.settings.theme === 'dark' ? 'true' : 'false'}"
            title="${db.settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}"
          >
            ${UI.icon(db.settings.theme === 'dark' ? 'sun' : 'moon', 'ui-icon')}
            <span>${Utils.esc(db.settings.theme === 'dark' ? t('lightMode') : t('darkMode'))}</span>
          </button>
          <button type="button" class="display-btn ${voiceOn ? 'active' : ''}" data-action="toggle-voice">${Utils.esc(
            voiceOn ? t('voiceOn') : t('voiceOff')
          )}</button>
          <button type="button" class="display-btn" data-action="toggle-fullscreen">${Utils.esc(
            document.fullscreenElement ? t('exitFullscreen') : t('enterFullscreen')
          )}</button>
          <button type="button" class="display-btn" data-nav="home">${Utils.esc(t('backToApp'))}</button>
        </div>

        <div class="display-clock">
          <div class="display-clock-time" id="display-live-time">${Utils.esc(timeStr)}</div>
          <div class="display-clock-date" id="display-live-date">${Utils.esc(dateStr)}</div>
        </div>
      </header>

      ${
        activeAnns.length
          ? `<div class="display-announcement" role="status">
              <span style="text-transform:uppercase;font-size:0.75rem;letter-spacing:0.06em;color:#c7d2fe;">${Utils.esc(
                t('announcements')
              )}</span>
              <span>${Utils.esc(
                activeAnns
                  .map((a) => (lang === 'hi' && a.messageHi ? a.messageHi : a.message))
                  .join('  ·  ')
              )}</span>
            </div>`
          : ''
      }

      <main class="display-grid" aria-live="polite">
        ${
          counters.length
            ? counters
                .map((cnt) => {
                  const st = QueueEngine.getCounterState(db, cnt.id);
                  const nextThree = st.waiting.slice(0, 3);
                  const statusClass =
                    cnt.status === 'open'
                      ? 'display-status-open'
                      : cnt.status === 'paused'
                      ? 'display-status-paused'
                      : 'display-status-closed';
                  return `
                    <article class="display-counter-card ${st.current && st.current.status === 'Called' ? 'is-called' : ''}">
                      <div class="display-counter-head">
                        <div>
                          <div class="display-counter-name">${Utils.esc(cnt.number)}</div>
                          <div class="text-xs" style="color:#94a3b8;">${Utils.esc(cnt.name)}</div>
                        </div>
                        <div class="${statusClass}">${Utils.esc(t(`statusMap.${cnt.status}`))}</div>
                      </div>

                      <div>
                        <div class="text-xs" style="color:#94a3b8;margin-bottom:6px;">${Utils.esc(t('nowServing'))}</div>
                        <div class="display-token-now">${
                          st.current ? Utils.esc(st.current.tokenNumber) : '—'
                        }</div>
                        <div class="text-sm" style="color:#cbd5e1;margin-top:8px;">
                          ${
                            st.current
                              ? Utils.esc(t(`statusMap.${st.current.status}`))
                              : cnt.status === 'paused'
                              ? Utils.esc(cnt.pauseReason || t('statusMap.paused'))
                              : Utils.esc(t('idleCounter'))
                          }
                          · ${Utils.esc(t('waitingCount'))}: <strong class="mono">${st.waiting.length}</strong>
                        </div>
                      </div>

                      <div class="display-eta-bar">
                        <div>
                          <div class="text-xs" style="color:#94a3b8;">${Utils.esc(t('displayEstWait'))}</div>
                          <div class="display-eta-value">${
                            cnt.status === 'open'
                              ? st.projectedWaitMin > 0
                                ? `~${st.projectedWaitMin} min (est.)`
                                : '0 min (est.)'
                              : '—'
                          }</div>
                        </div>
                        <div style="text-align:right;">
                          <div class="text-xs" style="color:#94a3b8;">${Utils.esc(t('displayAvgPace'))}</div>
                          <div class="mono text-sm" style="color:#e2e8f0;font-weight:600;">~${
                            st.etaStats.rollingAvgMin
                          } min</div>
                        </div>
                      </div>

                      <div>
                        <div class="text-xs" style="color:#94a3b8;margin-bottom:8px;">${Utils.esc(t('nextTokens'))}</div>
                        <div class="display-next-row">
                          ${[0, 1, 2]
                            .map((idx) => {
                              const nextTok = nextThree[idx];
                              if (!nextTok) {
                                return `<div class="display-next-slot"><span>—</span><span class="display-next-eta">&nbsp;</span></div>`;
                              }
                              return `<div class="display-next-slot">
                                <span>${Utils.esc(nextTok.tokenNumber)}</span>
                                <span class="display-next-eta">~${nextTok.etaMin}m est.</span>
                              </div>`;
                            })
                            .join('')}
                        </div>
                      </div>
                    </article>
                  `;
                })
                .join('')
            : `<div class="empty-state" style="color:#cbd5e1;">No counters configured for this centre.</div>`
        }
      </main>
      <footer class="display-disclaimer">
        <span>${Utils.esc(t('displayEtaNote'))}</span>
        <span class="mono">SmartQ Dynamic ETA Engine</span>
      </footer>
    </div>
  `;
};

/* --------------------------------------------------------------------------
   13. Interactive Modal Workflows (CRUD, Reschedule, Cancel, Pause, Inspect)
   -------------------------------------------------------------------------- */
const Modals = {
  openTokenDetails(tokenId) {
    const db = AppState.db;
    const tok = db.tokens.find((x) => x.id === tokenId);
    if (!tok) return;
    const centre = db.centres.find((c) => c.id === tok.centreId);
    const cat = db.categories.find((c) => c.id === tok.categoryId);
    const cnt = db.counters.find((c) => c.id === tok.counterId);

    UI.openModal(
      `Digital Token — ${tok.tokenNumber}`,
      `
        <div style="display:grid;grid-template-columns:1fr 170px;gap:20px;align-items:center;">
          <div style="display:flex;flex-direction:column;gap:8px;font-size:0.875rem;">
            <div class="mono" style="font-size:2rem;font-weight:700;">${Utils.esc(tok.tokenNumber)}</div>
            <div><strong>Token ID:</strong> <span class="mono text-xs">${Utils.esc(tok.id)}</span></div>
            <div><strong>Status:</strong> <span class="status-text ${Utils.statusClass(tok.status)}">${Utils.esc(
              tok.status
            )}</span></div>
            <div><strong>Centre:</strong> ${Utils.esc(centre ? centre.name : '—')}</div>
            <div><strong>Counter:</strong> ${Utils.esc(cnt ? `${cnt.number} — ${cnt.name}` : '—')}</div>
            <div><strong>Service:</strong> ${Utils.esc(cat ? cat.name : '—')}</div>
            <div><strong>Booked:</strong> ${Utils.esc(Utils.formatDateTime(tok.createdAt))}</div>
            ${tok.scheduledTime ? `<div><strong>Slot:</strong> ${Utils.esc(tok.scheduledTime)}</div>` : ''}
            ${tok.cancelReason ? `<div><strong>Cancel Reason:</strong> ${Utils.esc(tok.cancelReason)}</div>` : ''}
            ${tok.notes ? `<div><strong>Service Notes:</strong> ${Utils.esc(tok.notes)}</div>` : ''}
          </div>
          <div class="qr-frame">
            <canvas data-qr-payload="${Utils.esc(QRGenerator.buildPayload(tok))}" data-qr-size="140"></canvas>
            <div class="text-xs text-muted mono">Verify QR</div>
          </div>
        </div>
      `,
      `
        <button type="button" class="btn btn-secondary btn-sm" id="modal-print-tok">Print</button>
        <button type="button" class="btn btn-secondary btn-sm" id="modal-dl-qr">Download QR</button>
        <button type="button" class="btn btn-primary btn-sm" data-close-modal>Done</button>
      `
    );
    UI.renderAllQrCanvases();
    const pBtn = document.getElementById('modal-print-tok');
    if (pBtn) pBtn.addEventListener('click', () => UI.printToken(tok));
    const dBtn = document.getElementById('modal-dl-qr');
    if (dBtn) dBtn.addEventListener('click', () => UI.downloadTokenQr(tok));
  },

  openReschedule(tokenId) {
    const db = AppState.db;
    const tok = db.tokens.find((x) => x.id === tokenId);
    if (!tok) return;
    const analysis = QueueEngine.analyzeCounters(db, {
      centreId: tok.centreId,
      categoryId: tok.categoryId,
    });
    const counters = analysis.allCounters.filter((item) => item.counter.status !== 'closed');
    const rec = analysis.recommended;
    const slots = ['09:30', '10:30', '11:30', '12:30', '14:00', '15:00', '16:00', '17:00'];

    UI.openModal(
      `Reschedule Token ${tok.tokenNumber}`,
      `
        ${
          rec
            ? `<div class="rec-banner" style="margin-bottom:14px;">
                <div class="rec-banner-main">
                  <div class="rec-label">Recommended Counter</div>
                  <div class="rec-title">${Utils.esc(rec.counter.number)} — ${Utils.esc(rec.counter.name)}</div>
                  <div class="rec-reason">${Utils.esc(rec.reason)}</div>
                </div>
              </div>`
            : ''
        }
        <form id="reschedule-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label" for="rs-counter">Counter (Supports This Service)</label>
            <select class="form-select" id="rs-counter" name="counterId">
              ${counters
                .map((item) => {
                  const c = item.counter;
                  const tag = item.isRecommended ? ' ★ Recommended' : !item.available ? ` (${item.excludeReason})` : '';
                  return `<option value="${c.id}" ${c.id === tok.counterId ? 'selected' : ''}>${Utils.esc(
                    c.number
                  )} — ${Utils.esc(c.name)} · ${item.waitingCount} waiting · ~${item.projectedWaitMin} min${Utils.esc(
                    tag
                  )}</option>`;
                })
                .join('')}
            </select>
          </div>
          <div class="form-field">
            <label class="form-label" for="rs-type">Queue Mode</label>
            <select class="form-select" id="rs-type" name="bookingType">
              <option value="immediate" ${tok.bookingType === 'immediate' ? 'selected' : ''}>Immediate Queue</option>
              <option value="appointment" ${tok.bookingType === 'appointment' ? 'selected' : ''}>Appointment Slot</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label" for="rs-slot">Appointment Slot</label>
            <select class="form-select" id="rs-slot" name="scheduledTime">
              ${slots
                .map((s) => `<option value="${s}" ${tok.scheduledTime === s ? 'selected' : ''}>${s}</option>`)
                .join('')}
            </select>
          </div>
          <div id="rs-err" class="form-field-full"></div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm Reschedule</button>
          </div>
        </form>
      `
    );

    const form = document.getElementById('reschedule-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const fd = new FormData(form);
        const res = await QueueEngine.rescheduleToken(
          AppState.db,
          tokenId,
          {
            counterId: fd.get('counterId'),
            bookingType: fd.get('bookingType'),
            scheduledTime: fd.get('scheduledTime'),
          },
          getActor()
        );
        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          document.getElementById('rs-err').innerHTML = `<div class="form-error">${Utils.esc(res.error)}</div>`;
          return;
        }
        UI.closeModal();
        UI.toast(`Rescheduled ${res.token.tokenNumber} successfully.`, 'success');
        App.render();
      });
    }
  },

  openCancelToken(tokenId) {
    const tok = AppState.db.tokens.find((x) => x.id === tokenId);
    if (!tok) return;
    UI.openModal(
      `Cancel Token ${tok.tokenNumber}`,
      `
        <p class="text-sm text-secondary" style="margin-bottom:14px;">Cancelling immediately removes this token from the waiting queue and recalculates ETAs for customers behind.</p>
        <form id="cancel-token-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label" for="cancel-reason">Cancellation Reason *</label>
            <input class="form-input" id="cancel-reason" name="reason" required value="Schedule changed" placeholder="Reason for cancellation" />
          </div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Keep Token</button>
            <button type="submit" class="btn btn-danger">Confirm Cancellation</button>
          </div>
        </form>
      `
    );
    const form = document.getElementById('cancel-token-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const reason = new FormData(form).get('reason');
        const res = await QueueEngine.cancelToken(AppState.db, tokenId, getActor(), reason);
        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          UI.toast(res.error, 'error');
          return;
        }
        UI.closeModal();
        UI.toast(`Token ${tok.tokenNumber} cancelled.`, 'warn');
        App.render();
      });
    }
  },

  openNoShowConfirm(tokenId) {
    const db = AppState.db;
    const tok = db.tokens.find((x) => x.id === tokenId);
    if (!tok) return;
    if (!['Called', 'Skipped'].includes(tok.status)) {
      UI.toast(`Cannot mark ${tok.tokenNumber} as No-Show while status is ${tok.status}.`, 'error');
      return;
    }
    const cnt = db.counters.find((c) => c.id === tok.counterId);
    const autoAdv = db.settings.autoAdvanceOnNoShow !== false;

    UI.openModal(
      `Confirm No-Show — ${tok.tokenNumber}`,
      `
        <p class="text-sm text-secondary" style="margin-bottom:14px;">
          Mark <strong>${Utils.esc(tok.tokenNumber)}</strong> (${Utils.esc(tok.customerName)}) at <strong>${Utils.esc(
            cnt ? cnt.number : ''
          )}</strong> as No-Show? Queue positions and ETAs will recalculate immediately${
            autoAdv ? ' and the next waiting customer will be called automatically.' : '.'
          }
        </p>
        <form id="noshow-confirm-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label" for="noshow-reason">No-Show Reason *</label>
            <input class="form-input" id="noshow-reason" name="reason" required value="Did not report to counter after call" />
          </div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Keep Active</button>
            <button type="submit" class="btn btn-danger">Confirm No-Show</button>
          </div>
        </form>
      `
    );

    const form = document.getElementById('noshow-confirm-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const reason = new FormData(form).get('reason');
        const res = await QueueEngine.markNoShow(AppState.db, tokenId, getActor(), {
          mode: 'manual',
          reason,
        });
        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          UI.toast(res.error, 'error');
          return;
        }
        UI.closeModal();
        const recoveredMsg = res.autoCalledToken
          ? ` Queue advanced automatically to ${res.autoCalledToken.tokenNumber}.`
          : '';
        UI.toast(`Marked ${tok.tokenNumber} as No-Show.${recoveredMsg}`, 'warn');
        App.render();
      });
    }
  },

  openRestoreToken(tokenId) {
    const db = AppState.db;
    const tok = db.tokens.find((x) => x.id === tokenId);
    if (!tok) return;
    const cnt = db.counters.find((c) => c.id === tok.counterId);

    UI.openModal(
      `Restore Token ${tok.tokenNumber}`,
      `
        <p class="text-sm text-secondary" style="margin-bottom:14px;">
          Restore ${Utils.esc(tok.status)} token <strong>${Utils.esc(tok.tokenNumber)}</strong> (${Utils.esc(
            tok.customerName
          )}) back into the active queue at <strong>${Utils.esc(cnt ? cnt.number : '')}</strong>? Positions and ETAs will recalculate immediately.
        </p>
        <form id="restore-token-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label" for="restore-reason">Admin Restoration Reason *</label>
            <input class="form-input" id="restore-reason" name="reason" required value="Customer returned; mistakenly marked No-Show" />
          </div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm Restore</button>
          </div>
        </form>
      `
    );

    const form = document.getElementById('restore-token-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const reason = new FormData(form).get('reason');
        const res = await QueueEngine.restoreToken(AppState.db, tokenId, getActor(), reason);
        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          UI.toast(res.error, 'error');
          return;
        }
        UI.closeModal();
        UI.toast(`Restored ${res.token.tokenNumber} to Position #${res.token.position}.`, 'success');
        App.render();
      });
    }
  },

  openPauseCounter(counterId) {
    const cnt = AppState.db.counters.find((c) => c.id === counterId);
    if (!cnt) return;
    UI.openModal(
      `Pause ${cnt.number}`,
      `
        <p class="text-sm text-secondary" style="margin-bottom:14px;">Waiting customers will be notified automatically and their queue positions remain preserved.</p>
        <form id="pause-counter-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label" for="pause-reason">Pause Reason *</label>
            <input class="form-input" id="pause-reason" name="reason" required value="Short operational break (10 min)" />
          </div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
            <button type="submit" class="btn btn-primary">Pause Counter</button>
          </div>
        </form>
      `
    );
    const form = document.getElementById('pause-counter-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const reason = new FormData(form).get('reason');
        const res = await QueueEngine.setCounterStatus(AppState.db, counterId, 'paused', reason, getActor());
        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          UI.toast(res.error, 'error');
          return;
        }
        UI.closeModal();
        UI.toast(`${cnt.number} paused and waiting customers alerted.`, 'warn');
        App.render();
      });
    }
  },

  openAddCentre() {
    this.openBusinessForm(null);
  },

  openBusinessForm(editCentreId = null) {
    const db = AppState.db;
    const existing = editCentreId ? db.centres.find((c) => c.id === editCentreId) : null;

    UI.openModal(
      existing ? `Edit Business — ${existing.name}` : 'Add Bhopal Business',
      `
        <form id="business-modal-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label">Business / Establishment Name *</label>
            <input class="form-input" name="name" required value="${Utils.esc(
              existing ? existing.name : ''
            )}" placeholder="e.g. City Care Dental Clinic" />
          </div>
          <div class="form-field">
            <label class="form-label">Directory Category *</label>
            <select class="form-select" name="directoryCategoryId" required>
              ${BHOPAL_CATEGORIES.map(
                (cat) =>
                  `<option value="${cat.id}" ${
                    existing && existing.directoryCategoryId === cat.id ? 'selected' : ''
                  }>${Utils.esc(cat.name)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Bhopal Area *</label>
            <select class="form-select" name="area" required>
              ${BHOPAL_AREAS.map(
                (a) => `<option value="${Utils.esc(a)}" ${existing && existing.area === a ? 'selected' : ''}>${Utils.esc(a)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Specific Locality / Landmark</label>
            <input class="form-input" name="locality" value="${Utils.esc(
              existing ? existing.locality || '' : ''
            )}" placeholder="e.g. Zone-I, Tulsi Nagar, Royal Market" />
          </div>
          <div class="form-field">
            <label class="form-label">Verified Contact Phone (Optional)</label>
            <input class="form-input" name="phone" value="${Utils.esc(
              existing && existing.phone && existing.phone !== '—' ? existing.phone : ''
            )}" placeholder="Leave blank if unverified" />
          </div>
          <div class="form-field form-field-full">
            <label class="form-label">Full Verified Address *</label>
            <input class="form-input" name="address" required value="${Utils.esc(
              existing ? existing.address : ''
            )}" placeholder="Street / Campus, Locality, Bhopal, Madhya Pradesh" />
          </div>
          <div class="form-field">
            <label class="form-label">Opening Time (Optional)</label>
            <input class="form-input" type="time" name="openTime" value="${Utils.esc(existing ? existing.openTime || '' : '')}" />
          </div>
          <div class="form-field">
            <label class="form-label">Closing Time (Optional)</label>
            <input class="form-input" type="time" name="closeTime" value="${Utils.esc(existing ? existing.closeTime || '' : '')}" />
          </div>
          <div class="form-field form-field-full">
            <div style="display:flex;flex-wrap:wrap;gap:16px;">
              <label class="checkbox-row">
                <input type="checkbox" name="isOnboarded" ${existing && existing.isOnboarded ? 'checked' : ''} />
                <span>Onboarded for Live SmartQ Queues</span>
              </label>
              <label class="checkbox-row">
                <input type="checkbox" name="bookingEnabled" ${
                  existing ? (existing.bookingEnabled !== false ? 'checked' : '') : ''
                } />
                <span>Token Booking Enabled</span>
              </label>
              <label class="checkbox-row">
                <input type="checkbox" name="verified" ${existing && existing.verified ? 'checked' : ''} />
                <span>Business Details Verified by Admin</span>
              </label>
            </div>
            <span class="form-hint">Keep "Onboarded" unchecked for directory-only "Coming Soon" listings. Never enter unverified hours or phone numbers.</span>
          </div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
            <button type="submit" class="btn btn-primary">${existing ? 'Save Business' : 'Add Bhopal Business'}</button>
          </div>
        </form>
      `
    );

    const form = document.getElementById('business-modal-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const name = String(fd.get('name') || '').trim();
        const address = String(fd.get('address') || '').trim();
        const area = String(fd.get('area') || 'MP Nagar').trim();
        const locality = String(fd.get('locality') || '').trim() || area;
        const directoryCategoryId = String(fd.get('directoryCategoryId') || 'DIR_OTHER');
        const phone = String(fd.get('phone') || '').trim();
        const openTime = String(fd.get('openTime') || '').trim();
        const closeTime = String(fd.get('closeTime') || '').trim();
        const isOnboarded = fd.has('isOnboarded');
        const bookingEnabled = fd.has('bookingEnabled');
        const verified = fd.has('verified');

        if (!name || !address) {
          UI.toast('Business name and full address are required.', 'error');
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const actor = getActor();
        const nextBiz = existing
          ? {
              ...existing,
              name,
              address,
              area,
              locality,
              areaTags: Array.from(new Set([area, ...(existing.areaTags || [])])),
              directoryCategoryId,
              phone,
              openTime,
              closeTime,
              isOnboarded,
              bookingEnabled,
              dataScope: isOnboarded ? 'operational' : 'directory',
              verified,
              verifiedAt: verified ? existing.verifiedAt || new Date().toISOString() : null,
              verifiedBy: verified ? existing.verifiedBy || (actor ? actor.name : 'Admin') : '',
            }
          : {
              id: Utils.uid('BPL'),
              name,
              nameHi: name,
              directoryCategoryId,
              area,
              locality,
              areaTags: [area],
              address,
              city: 'Bhopal',
              phone,
              openTime,
              closeTime,
              dataScope: isOnboarded ? 'operational' : 'directory',
              isOnboarded,
              bookingEnabled,
              verified,
              verifiedAt: verified ? new Date().toISOString() : null,
              verifiedBy: verified && actor ? actor.name : '',
              isActive: true,
              announcements: [],
            };

        const saveRes = await SupabaseBackend.upsertBusinessInDb(nextBiz);
        if (submitBtn) submitBtn.disabled = false;
        if (!saveRes.ok) {
          UI.toast(saveRes.error || 'Failed to save business in Supabase.', 'error');
          return;
        }

        if (existing) {
          Object.assign(existing, nextBiz);
          QueueEngine.addAudit(db, actor, 'BUSINESS_UPDATED', 'centre', existing.id, `Updated ${existing.name} (${area}, verified=${existing.verified}, onboarded=${existing.isOnboarded}).`);
          UI.toast(`Updated "${existing.name}" in Supabase.`, 'success');
        } else {
          db.centres.unshift(nextBiz);
          QueueEngine.addAudit(db, actor, 'BUSINESS_CREATED', 'centre', nextBiz.id, `Added Bhopal business ${nextBiz.name} in ${area}.`);
          UI.toast(`Added "${nextBiz.name}" to Bhopal directory.`, 'success');
        }
        UI.closeModal();
        App.render();
      });
    }
  },

  openApplyTemplatesModal(centreId) {
    const db = AppState.db;
    const biz = db.centres.find((c) => c.id === centreId);
    if (!biz) return;
    const cat = getDirectoryCategory(biz.directoryCategoryId);
    const templates = getSuggestedCounterTemplates(biz.directoryCategoryId);
    const existingCounters = db.counters.filter((c) => c.centreId === biz.id);

    UI.openModal(
      `Configure Counters — ${biz.name}`,
      `
        <div class="form-notice" style="margin-bottom:14px;">
          Select suggested counter templates for <strong>${Utils.esc(cat.name)}</strong> to create verified operating counters for <strong>${Utils.esc(
        biz.name
      )}</strong>, or add a custom counter below.
        </div>
        ${
          existingCounters.length
            ? `<div style="margin-bottom:16px;">
                <div class="form-label" style="margin-bottom:6px;">Existing Counters (${existingCounters.length})</div>
                <div class="meta-line">
                  ${existingCounters
                    .map(
                      (cnt) =>
                        `<span><strong>${Utils.esc(cnt.number)}</strong> (${Utils.esc(cnt.name)}${
                          cnt.openTime && cnt.closeTime ? ` · ${cnt.openTime}–${cnt.closeTime}` : ''
                        })</span>`
                    )
                    .join('<span class="meta-sep">·</span>')}
                </div>
              </div>`
            : ''
        }
        <form id="apply-templates-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label">Select Suggested Counter Templates to Add</label>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${templates
                .map(
                  (tpl, idx) => `
                    <label class="checkbox-row" style="justify-content:space-between;padding:8px 10px;border:1px solid var(--border-hairline);border-radius:10px;">
                      <span style="display:inline-flex;align-items:center;gap:10px;">
                        <input type="checkbox" name="tplIdx" value="${idx}" ${existingCounters.length === 0 ? 'checked' : ''} />
                        <strong>${Utils.esc(tpl.name)}</strong>
                        <span class="text-xs text-muted">(${Utils.esc(tpl.serviceName)})</span>
                      </span>
                      <span class="mono text-xs text-muted">~${tpl.defaultDurationMin} min</span>
                    </label>
                  `
                )
                .join('')}
            </div>
          </div>
          <div class="form-field">
            <label class="form-label">Counter Opening Time (Optional)</label>
            <input class="form-input" type="time" name="openTime" value="${Utils.esc(biz.openTime || '')}" />
          </div>
          <div class="form-field">
            <label class="form-label">Counter Closing Time (Optional)</label>
            <input class="form-input" type="time" name="closeTime" value="${Utils.esc(biz.closeTime || '')}" />
          </div>
          <div class="form-field">
            <label class="form-label">Max Capacity per Counter *</label>
            <input class="form-input" type="number" min="2" max="100" name="maxCapacity" value="20" required />
          </div>
          <div class="form-field" style="justify-content:center;">
            <label class="checkbox-row">
              <input type="checkbox" name="enableOnboarding" checked />
              <span>Onboard &amp; Enable Live Token Booking</span>
            </label>
          </div>
          <div class="form-field-full" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn btn-secondary btn-sm" data-add-counter-for="${biz.id}">+ Custom Single Counter</button>
            <div style="display:flex;gap:10px;">
              <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
              <button type="submit" class="btn btn-primary">Create Selected Counters</button>
            </div>
          </div>
        </form>
      `
    );

    const form = document.getElementById('apply-templates-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const indices = fd.getAll('tplIdx').map((v) => Number(v));
        if (indices.length === 0) {
          UI.toast('Select at least one counter template or click "+ Custom Single Counter".', 'warn');
          return;
        }
        const openTime = String(fd.get('openTime') || '').trim();
        const closeTime = String(fd.get('closeTime') || '').trim();
        const maxCapacity = Math.max(2, Number(fd.get('maxCapacity') || 20));
        const enableOnboarding = fd.has('enableOnboarding');
        const startNum = existingCounters.length + 1;

        const newCounters = [];
        indices.forEach((tplIndex, i) => {
          const tpl = templates[tplIndex];
          if (!tpl) return;
          newCounters.push({
            id: Utils.uid('CNT'),
            centreId: biz.id,
            number: `Counter ${startNum + i}`,
            name: tpl.name,
            categoryIds: [tpl.serviceId],
            operatorId: '',
            status: 'open',
            maxCapacity,
            avgDurationMin: tpl.defaultDurationMin,
            openTime,
            closeTime,
            pauseReason: '',
            createdAt: new Date().toISOString(),
          });
        });

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const cntRes = await SupabaseBackend.upsertCountersInDb(newCounters);
        if (!cntRes.ok) {
          if (submitBtn) submitBtn.disabled = false;
          UI.toast(cntRes.error || 'Failed to save counters in Supabase.', 'error');
          return;
        }

        const updatedBiz = { ...biz };
        if (enableOnboarding) {
          updatedBiz.isOnboarded = true;
          updatedBiz.bookingEnabled = true;
          updatedBiz.dataScope = 'operational';
        }
        if (openTime && closeTime && !updatedBiz.openTime) {
          updatedBiz.openTime = openTime;
          updatedBiz.closeTime = closeTime;
        }
        if (enableOnboarding || (openTime && closeTime && !biz.openTime)) {
          const bizRes = await SupabaseBackend.upsertBusinessInDb(updatedBiz);
          if (!bizRes.ok) {
            if (submitBtn) submitBtn.disabled = false;
            UI.toast(bizRes.error || 'Counters created, but failed to update business onboarding status.', 'error');
            return;
          }
          Object.assign(biz, updatedBiz);
        }

        if (submitBtn) submitBtn.disabled = false;
        db.counters.push(...newCounters);

        QueueEngine.addAudit(
          db,
          getActor(),
          'COUNTERS_CONFIGURED',
          'centre',
          biz.id,
          `Added ${newCounters.length} counter(s) to ${biz.name}${enableOnboarding ? ' and enabled live booking' : ''}.`
        );
        UI.closeModal();
        UI.toast(`Added ${newCounters.length} counter(s) to ${biz.name} in Supabase.`, 'success');
        App.render();
      });
    }
  },

  openAddAnnouncement() {
    const db = AppState.db;
    UI.openModal(
      'Post Service Interruption Announcement',
      `
        <form id="add-ann-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label">Target Business / Service Centre *</label>
            <select class="form-select" name="centreId">
              ${db.centres.map((c) => `<option value="${c.id}">${Utils.esc(c.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-field form-field-full">
            <label class="form-label">Announcement (English) *</label>
            <textarea class="form-textarea" name="message" required placeholder="e.g. Server maintenance at Counter 2; expect 5 min delay."></textarea>
          </div>
          <div class="form-field form-field-full">
            <label class="form-label">Announcement (Hindi — Optional)</label>
            <textarea class="form-textarea" name="messageHi" placeholder="हिन्दी सूचना (वैकल्पिक)"></textarea>
          </div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
            <button type="submit" class="btn btn-primary">Publish to Live Display</button>
          </div>
        </form>
      `
    );
    const form = document.getElementById('add-ann-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const centre = db.centres.find((c) => c.id === fd.get('centreId'));
        const message = String(fd.get('message') || '').trim();
        if (!centre || !message) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const ann = {
          id: Utils.uid('ANN'),
          businessId: centre.id,
          message,
          messageHi: String(fd.get('messageHi') || '').trim() || message,
          active: true,
          createdAt: new Date().toISOString(),
        };
        const actor = getActor();
        const res = await SupabaseBackend.insertAnnouncementInDb(centre.id, ann, actor ? actor.id : undefined);
        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          UI.toast(res.error || 'Failed to publish announcement.', 'error');
          return;
        }
        if (!Array.isArray(centre.announcements)) centre.announcements = [];
        centre.announcements.unshift(ann);
        QueueEngine.addAudit(db, actor, 'ANNOUNCEMENT_POSTED', 'centre', centre.id, `Posted announcement at ${centre.name}.`);
        UI.closeModal();
        UI.toast('Announcement published to Public Live Display.', 'success');
        App.render();
      });
    }
  },

  openAddCategory() {
    UI.openModal(
      'Add Counter Service Type',
      `
        <form id="add-cat-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label">Service Name *</label>
            <input class="form-input" name="name" required placeholder="e.g. Cardiology OPD / Loan Desk" />
          </div>
          <div class="form-field">
            <label class="form-label">Token Prefix Code (1–2 letters) *</label>
            <input class="form-input mono" name="code" maxlength="2" required placeholder="E" />
          </div>
          <div class="form-field">
            <label class="form-label">Default Service Duration (min) *</label>
            <input class="form-input" type="number" min="2" max="90" name="defaultDurationMin" value="10" required />
          </div>
          <div class="form-field form-field-full">
            <label class="form-label">Description</label>
            <input class="form-input" name="description" placeholder="Short description shown to customers" />
          </div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
            <button type="submit" class="btn btn-primary">Create Service</button>
          </div>
        </form>
      `
    );
    const form = document.getElementById('add-cat-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const name = String(fd.get('name') || '').trim();
        const code = String(fd.get('code') || 'Q')
          .trim()
          .toUpperCase()
          .replace(/[^A-Z]/g, '')
          .slice(0, 2);
        const dur = Math.max(2, Number(fd.get('defaultDurationMin') || 10));
        if (!name || !code) {
          UI.toast('Enter valid service name and alphabetic prefix.', 'error');
          return;
        }
        const cat = {
          id: Utils.uid('CAT'),
          name,
          nameHi: name,
          code,
          defaultDurationMin: dur,
          description: String(fd.get('description') || '').trim() || 'Counter service category.',
          directoryCategoryId: null,
          active: true,
          isTemplateService: false,
        };
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const res = await SupabaseBackend.upsertCategoryInDb(cat);
        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          UI.toast(res.error || 'Failed to create service category.', 'error');
          return;
        }
        AppState.db.categories.push(cat);
        QueueEngine.addAudit(AppState.db, getActor(), 'CATEGORY_CREATED', 'category', cat.id, `Created service ${cat.name} (${cat.code}).`);
        UI.closeModal();
        UI.toast(`Service "${cat.name}" created in Supabase.`, 'success');
        App.render();
      });
    }
  },

  openCounterForm(editCounterId = null, prefillCentreId = null) {
    const db = AppState.db;
    const existing = editCounterId ? db.counters.find((c) => c.id === editCounterId) : null;
    const operators = db.users.filter((u) => u.role === 'operator');
    const selectedCentreId = existing ? existing.centreId : prefillCentreId || (db.centres[0] ? db.centres[0].id : '');

    UI.openModal(
      existing ? `Edit ${existing.number}` : 'Create Service Counter',
      `
        <form id="counter-modal-form" class="form-grid">
          <div class="form-field">
            <label class="form-label">Counter Number / Label *</label>
            <input class="form-input" name="number" required value="${Utils.esc(
              existing ? existing.number : `Counter ${db.counters.length + 1}`
            )}" />
          </div>
          <div class="form-field">
            <label class="form-label">Desk / Counter Name *</label>
            <input class="form-input" name="name" required value="${Utils.esc(
              existing ? existing.name : ''
            )}" placeholder="e.g. OPD Registration / Billing" />
          </div>
          <div class="form-field">
            <label class="form-label">Business / Service Centre *</label>
            <select class="form-select" name="centreId">
              ${db.centres
                .map(
                  (c) =>
                    `<option value="${c.id}" ${selectedCentreId === c.id ? 'selected' : ''}>${Utils.esc(c.name)} (${Utils.esc(
                      c.area || 'Bhopal'
                    )})</option>`
                )
                .join('')}
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Assigned Operator</label>
            <select class="form-select" name="operatorId">
              <option value="">Unassigned</option>
              ${operators
                .map(
                  (op) =>
                    `<option value="${op.id}" ${existing && existing.operatorId === op.id ? 'selected' : ''}>${Utils.esc(
                      op.name
                    )}</option>`
                )
                .join('')}
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Max Queue Capacity *</label>
            <input class="form-input" type="number" min="2" max="100" name="maxCapacity" value="${
              existing ? existing.maxCapacity : 15
            }" required />
          </div>
          <div class="form-field">
            <label class="form-label">Service Duration (min) *</label>
            <input class="form-input" type="number" min="2" max="90" name="avgDurationMin" value="${
              existing ? existing.avgDurationMin : 8
            }" required />
          </div>
          <div class="form-field">
            <label class="form-label">Counter Opening Time (Optional)</label>
            <input class="form-input" type="time" name="openTime" value="${Utils.esc(existing ? existing.openTime || '' : '')}" />
          </div>
          <div class="form-field">
            <label class="form-label">Counter Closing Time (Optional)</label>
            <input class="form-input" type="time" name="closeTime" value="${Utils.esc(existing ? existing.closeTime || '' : '')}" />
          </div>
          <div class="form-field form-field-full">
            <label class="form-label">Supported Counter Services</label>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:6px;max-height:170px;overflow-y:auto;padding:8px;border:1px solid var(--border-hairline);border-radius:10px;">
              ${db.categories
                .filter((cat) => cat.active)
                .map((cat) => {
                  const checked = existing ? existing.categoryIds.includes(cat.id) : !cat.isTemplateService;
                  return `<label class="checkbox-row"><input type="checkbox" name="catIds" value="${cat.id}" ${
                    checked ? 'checked' : ''
                  } /><span>${Utils.esc(cat.name)}</span></label>`;
                })
                .join('')}
            </div>
          </div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
            <button type="submit" class="btn btn-primary">${existing ? 'Save Changes' : 'Create Counter'}</button>
          </div>
        </form>
      `
    );

    const form = document.getElementById('counter-modal-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const number = String(fd.get('number') || '').trim();
        const name = String(fd.get('name') || '').trim();
        const centreId = String(fd.get('centreId') || '');
        const operatorId = String(fd.get('operatorId') || '');
        const maxCapacity = Math.max(2, Number(fd.get('maxCapacity') || 15));
        const avgDurationMin = Math.max(2, Number(fd.get('avgDurationMin') || 8));
        const openTime = String(fd.get('openTime') || '').trim();
        const closeTime = String(fd.get('closeTime') || '').trim();
        const catIds = fd.getAll('catIds').map(String);

        if (!number || !name) {
          UI.toast('Counter number and name are required.', 'error');
          return;
        }
        if (catIds.length === 0) {
          UI.toast('Select at least one supported service for this counter.', 'warn');
          return;
        }

        const nextCounter = existing
          ? {
              ...existing,
              number,
              name,
              centreId,
              operatorId,
              maxCapacity,
              avgDurationMin,
              openTime,
              closeTime,
              categoryIds: catIds,
            }
          : {
              id: Utils.uid('CNT'),
              centreId,
              number,
              name,
              categoryIds: catIds,
              operatorId,
              status: 'open',
              maxCapacity,
              avgDurationMin,
              openTime,
              closeTime,
              pauseReason: '',
              createdAt: new Date().toISOString(),
            };

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const saveRes = await SupabaseBackend.upsertCountersInDb([nextCounter]);
        if (submitBtn) submitBtn.disabled = false;
        if (!saveRes.ok) {
          UI.toast(saveRes.error || 'Failed to save counter in Supabase.', 'error');
          return;
        }

        if (existing) {
          Object.assign(existing, nextCounter);
          QueueEngine.addAudit(db, getActor(), 'COUNTER_UPDATED', 'counter', existing.id, `Updated ${existing.number}.`);
          UI.toast(`Updated ${existing.number} in Supabase.`, 'success');
        } else {
          db.counters.push(nextCounter);
          QueueEngine.addAudit(db, getActor(), 'COUNTER_CREATED', 'counter', nextCounter.id, `Created ${nextCounter.number}.`);
          UI.toast(`Created ${nextCounter.number} in Supabase.`, 'success');
        }
        if (operatorId) {
          const op = db.users.find((u) => u.id === operatorId);
          if (op) {
            op.assignedCounterId = nextCounter.id;
            op.assignedCentreId = centreId;
          }
        }
        UI.closeModal();
        App.render();
      });
    }
  },

  openAddOperator() {
    const db = AppState.db;
    UI.openModal(
      'Assign Operator / Admin Role by Email',
      `
        <div class="form-notice" style="margin-bottom:14px;">
          Because the Supabase <code>service_role</code> key is never exposed in frontend code, staff members must first sign up with their email on the Sign In page. Once registered, enter their email below to securely promote and bind them to a counter via the role-verified PostgreSQL RPC.
        </div>
        <form id="add-op-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label">Registered User Email *</label>
            <input class="form-input" type="email" name="email" required placeholder="operator@example.com" />
          </div>
          <div class="form-field">
            <label class="form-label">Target Role *</label>
            <select class="form-select" name="role">
              <option value="operator" selected>Counter Operator</option>
              <option value="admin">Administrator</option>
              <option value="customer">Customer (Demote)</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Assign Counter (for Operators)</label>
            <select class="form-select" name="counterId">
              <option value="">Unassigned</option>
              ${db.counters
                .map((c) => {
                  const ctr = db.centres.find((x) => x.id === c.centreId);
                  return `<option value="${c.id}">${Utils.esc(c.number)} (${Utils.esc(c.name)}) — ${Utils.esc(ctr ? ctr.name : '')}</option>`;
                })
                .join('')}
            </select>
          </div>
          <div id="add-op-err" class="form-field-full"></div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
            <button type="submit" class="btn btn-primary">Assign Role &amp; Counter</button>
          </div>
        </form>
      `
    );

    const form = document.getElementById('add-op-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const email = String(fd.get('email') || '').trim().toLowerCase();
        const role = String(fd.get('role') || 'operator');
        const counterId = role === 'operator' ? String(fd.get('counterId') || '') : '';
        const errBox = document.getElementById('add-op-err');

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (errBox) errBox.innerHTML = `<div class="form-error">Enter a valid registered email address.</div>`;
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const res = await SupabaseBackend.assignRoleAndCounterByEmail(email, role, counterId);
        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          if (errBox) errBox.innerHTML = `<div class="form-error">${Utils.esc(res.error || 'Assignment failed.')}</div>`;
          return;
        }

        QueueEngine.addAudit(
          db,
          getActor(),
          'OPERATOR_ROLE_ASSIGNED',
          'user',
          res.data.id,
          `Assigned role=${role} to ${email}${counterId ? ` (counter ${counterId})` : ''}.`
        );
        UI.closeModal();
        UI.toast(`Updated ${email} to ${role}.`, 'success');
        await App.syncFromSupabase({ silent: true });
      });
    }
  },

  openEditOperator(operatorId) {
    const db = AppState.db;
    const op = db.users.find((u) => u.id === operatorId && u.role === 'operator');
    if (!op) return;

    UI.openModal(
      `Reassign Operator — ${op.name}`,
      `
        <form id="edit-op-form" class="form-grid">
          <div class="form-field form-field-full">
            <label class="form-label">Assigned Counter</label>
            <select class="form-select" name="counterId">
              <option value="">Unassigned</option>
              ${db.counters
                .map((c) => {
                  const ctr = db.centres.find((x) => x.id === c.centreId);
                  return `<option value="${c.id}" ${op.assignedCounterId === c.id ? 'selected' : ''}>${Utils.esc(c.number)} (${Utils.esc(
                    c.name
                  )}) — ${Utils.esc(ctr ? ctr.name : '')}</option>`;
                })
                .join('')}
            </select>
          </div>
          <div class="form-field-full" style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" class="btn btn-secondary" data-close-modal>Cancel</button>
            <button type="submit" class="btn btn-primary">Save Assignment</button>
          </div>
        </form>
      `
    );

    const form = document.getElementById('edit-op-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const counterId = String(new FormData(form).get('counterId') || '');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const res = await SupabaseBackend.assignRoleAndCounterByEmail(op.email, 'operator', counterId);
        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          UI.toast(res.error || 'Failed to update operator assignment.', 'error');
          return;
        }

        const counter = db.counters.find((c) => c.id === counterId);
        QueueEngine.addAudit(db, getActor(), 'OPERATOR_REASSIGNED', 'user', op.id, `Reassigned ${op.name} to ${counter ? counter.number : 'Unassigned'}.`);
        UI.closeModal();
        UI.toast(`Updated counter assignment for ${op.name}.`, 'success');
        await App.syncFromSupabase({ silent: true });
      });
    }
  },

  openSupabaseSetupGuide() {
    const be = AppState.backend;
    const cfg = be.configSummary || { configured: false, urlHost: 'Not configured', hasUrl: false, hasKey: false };
    UI.openModal(
      'Supabase Backend Setup Guide',
      `
        <div style="display:flex;flex-direction:column;gap:14px;font-size:0.875rem;">
          <div class="${be.configured && be.connectionState === 'connected' ? 'form-success' : 'form-notice'}">
            <div><strong>Connection Status:</strong> ${Utils.esc(be.connectionState)} · <strong>Realtime:</strong> ${Utils.esc(be.realtimeState)}</div>
            <div class="text-xs" style="margin-top:4px;">
              VITE_SUPABASE_URL: <strong>${cfg.hasUrl ? Utils.esc(cfg.urlHost) : 'Missing'}</strong> ·
              VITE_SUPABASE_ANON_KEY: <strong>${cfg.hasKey ? 'Present (anon key)' : 'Missing'}</strong>
            </div>
          </div>

          <div>
            <strong>1. Configure Environment Variables (<code>.env</code>)</strong>
            <p class="text-xs text-muted" style="margin:4px 0 6px;">Copy <code>.env.example</code> to <code>.env</code> and add your Supabase project URL and anon/publishable key. Never add the <code>service_role</code> key to frontend env variables.</p>
            <pre class="sb-code-block">VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-SUPABASE-ANON-KEY</pre>
          </div>

          <div>
            <strong>2. Run SQL Migrations in Supabase SQL Editor</strong>
            <p class="text-xs text-muted" style="margin:4px 0 6px;">Execute these three scripts in order from the repository's <code>supabase/migrations/</code> folder:</p>
            <ol style="padding-left:18px;display:flex;flex-direction:column;gap:4px;font-size:0.8125rem;">
              <li><code>001_smartq_schema.sql</code> — Tables, constraints, indexes &amp; triggers</li>
              <li><code>002_rls_policies_and_rpcs.sql</code> — Row Level Security, role guards, RPCs &amp; Realtime publication</li>
              <li><code>003_seed_bhopal_directory.sql</code> — Default policy settings, 30 service templates &amp; 17 Bhopal listings</li>
            </ol>
          </div>

          <div>
            <strong>3. Bootstrap Your First Administrator</strong>
            <p class="text-xs text-muted" style="margin:4px 0 6px;">Register an account in the Sign In page, then promote it once in Supabase SQL Editor:</p>
            <pre class="sb-code-block">UPDATE public.profiles
SET role = 'admin'
WHERE lower(email) = 'you@example.com';</pre>
          </div>

          <p class="text-xs text-muted">Full instructions are also saved in <code>SUPABASE_SETUP.md</code> at the project root.</p>
        </div>
      `,
      `
        ${
          be.configured
            ? `<button type="button" class="btn btn-secondary btn-sm" id="modal-retry-sb">Test &amp; Refresh Connection</button>`
            : ''
        }
        <button type="button" class="btn btn-primary btn-sm" data-close-modal>Close</button>
      `
    );

    const retryBtn = document.getElementById('modal-retry-sb');
    if (retryBtn) {
      retryBtn.addEventListener('click', async () => {
        retryBtn.disabled = true;
        await App.syncFromSupabase({ silent: false });
        UI.closeModal();
      });
    }
  },
};

/* --------------------------------------------------------------------------
   14. Main Application Controller, Event Delegation & Bootstrap
   -------------------------------------------------------------------------- */
const App = {
  applyTheme(theme) {
    const isDark = theme === 'dark';
    const rootEl = document.documentElement;
    rootEl.setAttribute('data-theme', isDark ? 'dark' : 'light');
    rootEl.removeAttribute('data-contrast');
    UI.syncMapTheme(isDark);

    document.querySelectorAll('[data-action="toggle-theme"]').forEach((btn) => {
      btn.classList.toggle('active', isDark);
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.innerHTML = `${UI.icon(isDark ? 'sun' : 'moon', 'ui-icon')}<span>${Utils.esc(
        isDark ? t('lightMode') : t('darkMode')
      )}</span>`;
    });
  },

  render() {
    const db = AppState.db;
    QueueEngine.recalculateAll(db, false);

    // Apply theme & language attributes to root
    document.documentElement.lang = db.settings.language === 'hi' ? 'hi' : 'en';
    this.applyTheme(db.settings.theme);

    const root = document.getElementById('app');
    if (!root) return;

    if (AppState.route === 'display') {
      UI.teardownFeatureShowcase();
      UI.teardownBhopalLiveMap();
      root.innerHTML = Views.renderDisplay();
      this.startDisplayClock();
      return;
    }

    this.stopDisplayClock();

    let bodyHtml = '';
    if (AppState.route === 'home') bodyHtml = Views.renderHome();
    else if (AppState.route === 'directory') bodyHtml = Views.renderDirectory();
    else if (AppState.route === 'business') bodyHtml = Views.renderBusinessDetail();
    else if (AppState.route === 'auth') bodyHtml = Views.renderAuth();
    else if (AppState.route === 'verify') bodyHtml = Views.renderVerifyQR();
    else if (AppState.route === 'customer') bodyHtml = Views.renderCustomer();
    else if (AppState.route === 'operator') bodyHtml = Views.renderOperator();
    else if (AppState.route === 'admin') bodyHtml = Views.renderAdmin();
    else bodyHtml = Views.renderHome();

    root.innerHTML = `
      ${Views.renderTopbar()}
      ${bodyHtml}
      <footer class="app-footer">
        <div class="app-footer-inner">
          <div><strong>SmartQ Bhopal</strong> — ${Utils.esc(t('tagline'))}</div>
          <div class="meta-line">
            <span>Bhopal Multi-Category Queue Platform</span>
            <span class="meta-sep">·</span>
            <span>${
              AppState.backend.configured
                ? AppState.backend.connectionState === 'connected'
                  ? 'Supabase PostgreSQL + Realtime Connected'
                  : `Supabase (${Utils.esc(AppState.backend.connectionState)})`
                : 'Supabase Setup Required'
            }</span>
          </div>
        </div>
      </footer>
    `;

    UI.renderAllQrCanvases();
    UI.enhanceInteractiveViews();
  },

  async syncFromSupabase({ silent = false } = {}) {
    if (!SupabaseBackend.isSupabaseConfigured()) {
      AppState.backend.configured = false;
      AppState.backend.connectionState = 'unconfigured';
      AppState.backend.realtimeState = 'offline';
      AppState.backend.loading = false;
      AppState.backend.syncing = false;
      AppState.backend.error = '';
      this.render();
      return { ok: false, error: 'Supabase not configured' };
    }

    if (AppState.backend.syncing) return { ok: true };
    AppState.backend.configured = true;
    AppState.backend.syncing = true;
    if (!silent) {
      AppState.backend.loading = true;
      AppState.backend.connectionState = 'connecting';
      this.render();
    }

    try {
      const authRes = await SupabaseBackend.getActiveAuthUser();
      const activeUser = authRes.ok ? authRes.data : null;
      AppState.session = activeUser
        ? { userId: activeUser.id, user: activeUser, guest: null }
        : { userId: null, user: null, guest: null };

      const snapRes = await SupabaseBackend.fetchOperationalSnapshot(activeUser);
      if (!snapRes.ok || !snapRes.data) {
        AppState.backend.connectionState = 'error';
        AppState.backend.error = snapRes.error || 'Failed to sync operational data from Supabase.';
        AppState.backend.loading = false;
        AppState.backend.syncing = false;
        this.render();
        return { ok: false, error: AppState.backend.error };
      }

      const uiPrefs = StorageAdapter.loadUiPrefs();
      snapRes.data.settings.theme = uiPrefs.theme;
      snapRes.data.settings.language = uiPrefs.language;
      snapRes.data.settings.voiceAnnouncements = uiPrefs.voiceAnnouncements;
      snapRes.data.settings.browserNotificationsEnabled = uiPrefs.browserNotificationsEnabled;

      AppState.db = snapRes.data;
      AppState.backend.connectionState = 'connected';
      AppState.backend.error = '';
      AppState.backend.lastSyncedAt = new Date().toISOString();
      AppState.backend.loading = false;
      AppState.backend.syncing = false;
      this.render();
      return { ok: true };
    } catch (err) {
      AppState.backend.connectionState = 'error';
      AppState.backend.error = err && err.message ? err.message : 'Unexpected Supabase sync error.';
      AppState.backend.loading = false;
      AppState.backend.syncing = false;
      this.render();
      return { ok: false, error: AppState.backend.error };
    }
  },

  startRealtime() {
    if (!SupabaseBackend.isSupabaseConfigured()) {
      AppState.backend.realtimeState = 'offline';
      return;
    }
    SupabaseBackend.startSmartQRealtime({
      onStatusChange: (status) => {
        AppState.backend.realtimeState = status;
        // Re-render only if not typing in a form field
        const activeEl = document.activeElement;
        const isTyping = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);
        if (!isTyping) this.render();
      },
      onDataChange: async (meta) => {
        await this.syncFromSupabase({ silent: true });
        if (
          AppState.route === 'display' &&
          meta &&
          meta.calledTokenNumber &&
          AppState.db.settings.voiceAnnouncements
        ) {
          const cnt = AppState.db.counters.find((c) => c.id === meta.calledCounterId);
          NotificationService.announceVoice(
            meta.calledTokenNumber,
            cnt ? cnt.number : '',
            AppState.db.settings.language
          );
        }
      },
    });
  },

  startDisplayClock() {
    this.stopDisplayClock();
    let seconds = 0;
    AppState.displayClockTimer = setInterval(() => {
      seconds++;
      const tEl = document.getElementById('display-live-time');
      if (tEl) {
        tEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
      if (seconds % 30 === 0 && AppState.route === 'display') {
        this.render();
      }
    }, 1000);
  },

  stopDisplayClock() {
    if (AppState.displayClockTimer) {
      clearInterval(AppState.displayClockTimer);
      AppState.displayClockTimer = null;
    }
  },

  startLiveEtaTicker() {
    if (AppState.etaTicker) return;
    let tickSec = 0;
    AppState.etaTicker = setInterval(() => {
      tickSec++;
      if (AppState.route === 'customer' && AppState.customerTab === 'dashboard') {
        UI.updateLiveEtaCountdowns();
      }
      if (tickSec % 30 === 0) {
        if (AppState.route === 'customer' && (AppState.customerTab === 'dashboard' || AppState.customerTab === 'book')) {
          this.render();
        } else if (AppState.route === 'business') {
          const activeEl = document.activeElement;
          const isTypingInForm = activeEl && activeEl.closest && activeEl.closest('#detail-booking-form');
          if (!isTypingInForm) this.render();
        }
      }
    }, 1000);
  },

  startNoShowWatcher() {
    if (AppState.noShowWatcher) return;
    let tick = 0;
    AppState.noShowCheckBusy = false;
    AppState.noShowWatcher = setInterval(async () => {
      tick++;
      const cdEl = document.getElementById('op-grace-countdown');
      let expiredNow = false;
      if (cdEl) {
        const calledAt = cdEl.getAttribute('data-called-at');
        const graceSec = Number(cdEl.getAttribute('data-grace-sec')) || 180;
        if (calledAt) {
          const elapsed = Math.max(0, Math.floor((Date.now() - new Date(calledAt).getTime()) / 1000));
          const rem = Math.max(0, graceSec - elapsed);
          const mm = String(Math.floor(rem / 60)).padStart(2, '0');
          const ss = String(rem % 60).padStart(2, '0');
          cdEl.textContent = rem === 0 ? 'Expired — recovering...' : `${mm}:${ss} remaining`;
          if (rem === 0) expiredNow = true;
        }
      }

      if ((expiredNow || tick % 3 === 0) && !AppState.noShowCheckBusy && AppState.backend.connectionState === 'connected') {
        const actor = getActor();
        if (!actor || (actor.role !== 'admin' && actor.role !== 'operator')) return;
        AppState.noShowCheckBusy = true;
        try {
          const res = await QueueEngine.processAutomaticNoShows(AppState.db, Date.now(), actor);
          if (res.count > 0) {
            const summary = res.processed
              .map((p) =>
                p.autoCalledNumber
                  ? `${p.counterNumber}: ${p.tokenNumber} → No-Show, called ${p.autoCalledNumber}`
                  : `${p.counterNumber}: ${p.tokenNumber} → No-Show`
              )
              .join(' · ');
            UI.toast(`Auto Queue Recovery: ${summary}`, 'warn');
            this.render();
          }
        } finally {
          AppState.noShowCheckBusy = false;
        }
      }
    }, 1000);
  },

  navigate(route) {
    AppState.route = route;
    window.scrollTo({ top: 0, behavior: 'auto' });
    this.render();
  },

  async handleOperatorAction(action, targetId) {
    const db = AppState.db;
    const actor = getActor();
    const notesEl = document.getElementById('op-service-notes');
    const notes = notesEl ? notesEl.value : '';
    const durEl = document.getElementById('op-actual-duration');
    const recordedDuration = durEl && durEl.value !== '' ? Number(durEl.value) : null;

    let res = { ok: false, error: 'Unknown action.' };
    if (action === 'call-next') res = await QueueEngine.callNextToken(db, targetId, actor);
    else if (action === 'arrived') res = await QueueEngine.markArrived(db, targetId, actor);
    else if (action === 'start') res = await QueueEngine.startService(db, targetId, actor);
    else if (action === 'complete') res = await QueueEngine.completeService(db, targetId, actor, notes, recordedDuration);
    else if (action === 'skip') res = await QueueEngine.skipToken(db, targetId, actor);
    else if (action === 'recall') res = await QueueEngine.recallToken(db, targetId, actor);
    else if (action === 'noshow') {
      Modals.openNoShowConfirm(targetId);
      return;
    }

    if (!res.ok) {
      UI.toast(res.error, 'error');
      return;
    }

    const tokNum = res.token ? res.token.tokenNumber : '';
    const extra = res.actualServiceDurationMin ? ` (${res.actualServiceDurationMin} min recorded — ETA updated)` : '';
    UI.toast(`Updated ${tokNum}: ${res.token ? res.token.status : 'Done'}${extra}.`, 'success');
    this.render();
  },

  async runVerify(rawQuery) {
    const query = String(rawQuery || '').trim();
    AppState.verifyQuery = query;
    const parsed = QRGenerator.parsePayload(query);
    if (!parsed) {
      AppState.verifyResult = { found: false, query };
      this.render();
      return;
    }

    if (!SupabaseBackend.isSupabaseConfigured()) {
      AppState.verifyResult = {
        found: false,
        query,
        error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to verify live QR tokens.',
      };
      this.render();
      return;
    }

    AppState.verifyLoading = true;
    AppState.verifyResult = null;
    this.render();

    const rpcRes = await SupabaseBackend.verifyQrTokenInDb(parsed.tokenId, parsed.tokenNumber);
    AppState.verifyLoading = false;

    if (!rpcRes.ok) {
      AppState.verifyResult = { found: false, query, error: rpcRes.error || 'Verification failed.' };
    } else if (rpcRes.data) {
      AppState.verifyResult = { found: true, token: rpcRes.data, query };
    } else {
      AppState.verifyResult = { found: false, query };
    }
    this.render();
  },

  bindGlobalEvents() {
    // Click Delegation
    document.addEventListener('click', async (ev) => {
      const btn = ev.target.closest('button, [data-nav], [data-action]');
      if (!btn) return;

      // Primary navigation
      if (btn.hasAttribute('data-nav')) {
        this.navigate(btn.getAttribute('data-nav'));
        return;
      }

      // Bhopal Category & Area Discovery Navigation
      if (btn.hasAttribute('data-open-dir-cat')) {
        AppState.directory.categoryId = btn.getAttribute('data-open-dir-cat') || 'all';
        AppState.directory.area = 'all';
        AppState.directory.scope = 'all';
        AppState.directory.search = '';
        this.navigate('directory');
        return;
      }
      if (btn.hasAttribute('data-open-dir-area')) {
        AppState.directory.area = btn.getAttribute('data-open-dir-area') || 'all';
        AppState.directory.categoryId = 'all';
        AppState.directory.scope = 'bhopal';
        AppState.directory.search = '';
        this.navigate('directory');
        return;
      }
      if (btn.hasAttribute('data-browse-scope')) {
        AppState.directory.scope = btn.getAttribute('data-browse-scope') || 'all';
        AppState.directory.categoryId = 'all';
        AppState.directory.area = 'all';
        AppState.directory.search = '';
        this.navigate('directory');
        return;
      }
      if (btn.hasAttribute('data-dir-scope')) {
        AppState.directory.scope = btn.getAttribute('data-dir-scope') || 'all';
        this.render();
        return;
      }
      if (btn.hasAttribute('data-dir-cat')) {
        AppState.directory.categoryId = btn.getAttribute('data-dir-cat') || 'all';
        this.render();
        return;
      }
      if (btn.hasAttribute('data-dir-area')) {
        AppState.directory.area = btn.getAttribute('data-dir-area') || 'all';
        this.render();
        return;
      }
      if (btn.hasAttribute('data-dir-reset')) {
        AppState.directory.categoryId = 'all';
        AppState.directory.area = 'all';
        AppState.directory.scope = 'all';
        AppState.directory.search = '';
        this.render();
        return;
      }
      if (btn.hasAttribute('data-open-business')) {
        AppState.directory.selectedBusinessId = btn.getAttribute('data-open-business') || '';
        this.navigate('business');
        return;
      }

      // Business Detail Inline Booking Selection
      if (btn.hasAttribute('data-detail-service')) {
        AppState.detailBooking.serviceId = btn.getAttribute('data-detail-service') || '';
        AppState.detailBooking.counterId = '';
        this.render();
        return;
      }
      if (btn.hasAttribute('data-detail-counter')) {
        AppState.detailBooking.counterId = btn.getAttribute('data-detail-counter') || '';
        this.render();
        return;
      }
      if (btn.hasAttribute('data-detail-btype')) {
        AppState.detailBooking.bookingType = btn.getAttribute('data-detail-btype') || 'immediate';
        if (AppState.detailBooking.bookingType === 'immediate') AppState.detailBooking.scheduledTime = '';
        this.render();
        return;
      }

      // Auth Tab Switch
      if (btn.hasAttribute('data-auth-tab')) {
        AppState.authTab = btn.getAttribute('data-auth-tab');
        this.render();
        return;
      }

      // Customer Sub-Tabs
      if (btn.hasAttribute('data-cust-tab')) {
        AppState.customerTab = btn.getAttribute('data-cust-tab');
        this.render();
        return;
      }

      // History Filter
      if (btn.hasAttribute('data-hist-filter')) {
        AppState.historyFilter = btn.getAttribute('data-hist-filter');
        this.render();
        return;
      }

      // Notification Centre Filters & Per-Item Actions
      if (btn.hasAttribute('data-notif-filter')) {
        AppState.notifFilter = btn.getAttribute('data-notif-filter');
        this.render();
        return;
      }
      if (btn.hasAttribute('data-toggle-notif-read')) {
        const actor = getActor();
        const nid = btn.getAttribute('data-toggle-notif-read');
        const nextRead = btn.getAttribute('data-next-read') === '1';
        if (actor) {
          const ok = await NotificationService.markRead(AppState.db, nid, actor.id, nextRead);
          if (ok) this.render();
        }
        return;
      }
      if (btn.hasAttribute('data-delete-notif')) {
        const actor = getActor();
        const nid = btn.getAttribute('data-delete-notif');
        if (actor) {
          const ok = await NotificationService.deleteOne(AppState.db, nid, actor.id);
          if (ok) {
            UI.toast('Notification cleared.', 'info');
            this.render();
          }
        }
        return;
      }

      // Admin Sidebar Tabs
      if (btn.hasAttribute('data-admin-tab')) {
        AppState.adminTab = btn.getAttribute('data-admin-tab');
        this.render();
        return;
      }

      // Analytics Range
      if (btn.hasAttribute('data-an-range')) {
        AppState.adminFilters.analyticsRange = btn.getAttribute('data-an-range');
        this.render();
        return;
      }

      // Booking Wizard Selections
      if (btn.hasAttribute('data-pick-category')) {
        AppState.bookingDraft.categoryId = btn.getAttribute('data-pick-category');
        AppState.bookingDraft.centreId = '';
        AppState.bookingDraft.counterId = '';
        AppState.bookingDraft.step = 2;
        this.render();
        return;
      }
      if (btn.hasAttribute('data-pick-centre')) {
        AppState.bookingDraft.centreId = btn.getAttribute('data-pick-centre');
        AppState.bookingDraft.counterId = '';
        AppState.bookingDraft.step = 3;
        this.render();
        return;
      }
      if (btn.hasAttribute('data-pick-recommended')) {
        const [centreId, counterId] = String(btn.getAttribute('data-pick-recommended') || '').split('|');
        if (centreId && counterId) {
          AppState.bookingDraft.centreId = centreId;
          AppState.bookingDraft.counterId = counterId;
          AppState.bookingDraft.step = 4;
          this.render();
        }
        return;
      }
      if (btn.hasAttribute('data-pick-counter')) {
        AppState.bookingDraft.counterId = btn.getAttribute('data-pick-counter');
        AppState.bookingDraft.step = 4;
        this.render();
        return;
      }
      if (btn.hasAttribute('data-booking-type')) {
        AppState.bookingDraft.bookingType = btn.getAttribute('data-booking-type');
        if (AppState.bookingDraft.bookingType === 'immediate') AppState.bookingDraft.scheduledTime = '';
        this.render();
        return;
      }
      if (btn.hasAttribute('data-pick-slot')) {
        AppState.bookingDraft.scheduledTime = btn.getAttribute('data-pick-slot');
        this.render();
        return;
      }
      if (btn.hasAttribute('data-wizard-prev')) {
        AppState.bookingDraft.step = Math.max(1, AppState.bookingDraft.step - 1);
        this.render();
        return;
      }
      if (btn.hasAttribute('data-wizard-next')) {
        const d = AppState.bookingDraft;
        if (d.step === 1 && !d.categoryId) return UI.toast('Please select a service category first.', 'warn');
        if (d.step === 2 && !d.centreId) return UI.toast('Please select a service centre first.', 'warn');
        if (d.step === 3 && !d.counterId) return UI.toast('Please select an available counter first.', 'warn');
        if (d.step === 4 && d.bookingType === 'appointment' && !d.scheduledTime) {
          return UI.toast('Please choose an appointment slot.', 'warn');
        }
        d.step = Math.min(5, d.step + 1);
        this.render();
        return;
      }

      // Quick Book from Favourites
      if (btn.hasAttribute('data-quick-book-centre')) {
        const cid = btn.getAttribute('data-quick-book-centre');
        AppState.directory.selectedBusinessId = cid;
        this.navigate('business');
        return;
      }

      // Toggle Favourite Centre (persisted to Supabase profiles.favourite_centre_ids)
      if (btn.hasAttribute('data-toggle-fav')) {
        const cid = btn.getAttribute('data-toggle-fav');
        const user = AuthService.getCurrentUser(AppState.db, AppState.session);
        if (!user) {
          UI.toast('Sign in to save favourite Bhopal centres.', 'warn');
          return;
        }
        const prevFavs = Array.isArray(user.favouriteCentreIds) ? [...user.favouriteCentreIds] : [];
        const nextFavs = prevFavs.includes(cid) ? prevFavs.filter((id) => id !== cid) : [...prevFavs, cid];
        const res = await SupabaseBackend.updateUserFavouritesInDb(user.id, nextFavs);
        if (!res.ok) {
          UI.toast(res.error || 'Failed to update saved places.', 'error');
          return;
        }
        user.favouriteCentreIds = nextFavs;
        if (AppState.session.user && AppState.session.user.id === user.id) {
          AppState.session.user.favouriteCentreIds = nextFavs;
        }
        this.render();
        return;
      }

      // Operator / Admin Queue Actions
      if (btn.hasAttribute('data-op-action')) {
        const opAct = btn.getAttribute('data-op-action');
        const id = btn.getAttribute('data-token-id') || btn.getAttribute('data-counter-id');
        await this.handleOperatorAction(opAct, id);
        return;
      }

      // Verify QR Quick Scan
      if (btn.hasAttribute('data-verify-payload')) {
        await this.runVerify(btn.getAttribute('data-verify-payload'));
        return;
      }

      // Admin CRUD Toggles (Supabase PostgreSQL)
      if (btn.hasAttribute('data-toggle-centre')) {
        const c = AppState.db.centres.find((x) => x.id === btn.getAttribute('data-toggle-centre'));
        if (c) {
          const nextBiz = { ...c, isActive: !c.isActive };
          const res = await SupabaseBackend.upsertBusinessInDb(nextBiz);
          if (!res.ok) {
            UI.toast(res.error || 'Failed to update business status.', 'error');
            return;
          }
          c.isActive = nextBiz.isActive;
          QueueEngine.addAudit(AppState.db, getActor(), 'CENTRE_TOGGLED', 'centre', c.id, `Set ${c.name} active=${c.isActive}.`);
          this.render();
        }
        return;
      }
      if (btn.hasAttribute('data-clear-ann')) {
        const [cid, aid] = btn.getAttribute('data-clear-ann').split('|');
        const c = AppState.db.centres.find((x) => x.id === cid);
        if (c && Array.isArray(c.announcements)) {
          const res = await SupabaseBackend.deleteAnnouncementInDb(aid);
          if (!res.ok) {
            UI.toast(res.error || 'Failed to remove announcement.', 'error');
            return;
          }
          c.announcements = c.announcements.filter((a) => a.id !== aid);
          this.render();
        }
        return;
      }
      if (btn.hasAttribute('data-toggle-category')) {
        const cat = AppState.db.categories.find((x) => x.id === btn.getAttribute('data-toggle-category'));
        if (cat) {
          const nextCat = { ...cat, active: !cat.active };
          const res = await SupabaseBackend.upsertCategoryInDb(nextCat);
          if (!res.ok) {
            UI.toast(res.error || 'Failed to update service category.', 'error');
            return;
          }
          cat.active = nextCat.active;
          this.render();
        }
        return;
      }

      // Admin Bhopal Business Management Actions
      if (btn.hasAttribute('data-edit-business')) {
        Modals.openBusinessForm(btn.getAttribute('data-edit-business'));
        return;
      }
      if (btn.hasAttribute('data-apply-templates')) {
        Modals.openApplyTemplatesModal(btn.getAttribute('data-apply-templates'));
        return;
      }
      if (btn.hasAttribute('data-add-counter-for')) {
        Modals.openCounterForm(null, btn.getAttribute('data-add-counter-for'));
        return;
      }
      if (btn.hasAttribute('data-edit-operator')) {
        Modals.openEditOperator(btn.getAttribute('data-edit-operator'));
        return;
      }
      if (btn.hasAttribute('data-toggle-verify-biz')) {
        const biz = AppState.db.centres.find((x) => x.id === btn.getAttribute('data-toggle-verify-biz'));
        if (biz) {
          const actor = getActor();
          const nextVerified = !biz.verified;
          const nextBiz = {
            ...biz,
            verified: nextVerified,
            verifiedAt: nextVerified ? new Date().toISOString() : null,
            verifiedBy: nextVerified && actor ? actor.name : '',
          };
          const res = await SupabaseBackend.upsertBusinessInDb(nextBiz);
          if (!res.ok) {
            UI.toast(res.error || 'Failed to update business verification.', 'error');
            return;
          }
          Object.assign(biz, nextBiz);
          QueueEngine.addAudit(
            AppState.db,
            actor,
            biz.verified ? 'BUSINESS_VERIFIED' : 'BUSINESS_UNVERIFIED',
            'centre',
            biz.id,
            `${biz.verified ? 'Verified' : 'Marked unverified'} business "${biz.name}".`
          );
          UI.toast(
            biz.verified ? `"${biz.name}" marked as Admin Verified.` : `"${biz.name}" marked as unverified.`,
            biz.verified ? 'success' : 'info'
          );
          this.render();
        }
        return;
      }
      if (btn.hasAttribute('data-toggle-booking-biz')) {
        const biz = AppState.db.centres.find((x) => x.id === btn.getAttribute('data-toggle-booking-biz'));
        if (biz) {
          const actor = getActor();
          const cntCount = AppState.db.counters.filter((c) => c.centreId === biz.id).length;
          if (!biz.isOnboarded) {
            if (cntCount === 0) {
              UI.toast('Configure at least one verified counter before enabling live booking.', 'warn');
              Modals.openApplyTemplatesModal(biz.id);
              return;
            }
            const nextBiz = {
              ...biz,
              isOnboarded: true,
              bookingEnabled: true,
              dataScope: 'operational',
            };
            const res = await SupabaseBackend.upsertBusinessInDb(nextBiz);
            if (!res.ok) {
              UI.toast(res.error || 'Failed to onboard business.', 'error');
              return;
            }
            Object.assign(biz, nextBiz);
            QueueEngine.addAudit(
              AppState.db,
              actor,
              'BUSINESS_ONBOARDED',
              'centre',
              biz.id,
              `Enabled live token booking for "${biz.name}" (${cntCount} counters).`
            );
            UI.toast(`Live token booking enabled for "${biz.name}".`, 'success');
          } else {
            const nextBooking = biz.bookingEnabled === false ? true : false;
            const nextBiz = { ...biz, bookingEnabled: nextBooking };
            const res = await SupabaseBackend.upsertBusinessInDb(nextBiz);
            if (!res.ok) {
              UI.toast(res.error || 'Failed to update booking state.', 'error');
              return;
            }
            biz.bookingEnabled = nextBooking;
            QueueEngine.addAudit(
              AppState.db,
              actor,
              biz.bookingEnabled ? 'BOOKING_RESUMED' : 'BOOKING_PAUSED',
              'centre',
              biz.id,
              `${biz.bookingEnabled ? 'Enabled' : 'Paused'} token booking for "${biz.name}".`
            );
            UI.toast(
              biz.bookingEnabled
                ? `Token booking resumed for "${biz.name}".`
                : `Token booking paused for "${biz.name}".`,
              biz.bookingEnabled ? 'success' : 'warn'
            );
          }
          this.render();
        }
        return;
      }
      if (btn.hasAttribute('data-edit-counter')) {
        Modals.openCounterForm(btn.getAttribute('data-edit-counter'));
        return;
      }
      if (btn.hasAttribute('data-disable-counter')) {
        const cid = btn.getAttribute('data-disable-counter');
        const cnt = AppState.db.counters.find((c) => c.id === cid);
        if (!cnt) return;
        UI.confirm({
          title: `Disable ${cnt.number}?`,
          message: `Disabling ${cnt.number} prevents new bookings and queue calls on this counter until reopened.`,
          confirmLabel: 'Disable Counter',
          danger: true,
          onConfirm: async () => {
            const res = await QueueEngine.setCounterStatus(AppState.db, cid, 'closed', 'Disabled by admin', getActor());
            if (!res.ok) {
              UI.toast(res.error, 'error');
              return;
            }
            UI.toast(`${cnt.number} disabled.`, 'warn');
            this.render();
          },
        });
        return;
      }

      // Named Actions
      const action = btn.getAttribute('data-action');
      if (!action) return;

      if (action === 'open-setup-guide') {
        Modals.openSupabaseSetupGuide();
      } else if (action === 'refresh-supabase') {
        const res = await this.syncFromSupabase({ silent: false });
        if (res.ok) UI.toast('Synced latest live data from Supabase.', 'success');
      } else if (action === 'seed-bhopal-directory') {
        const res = await SupabaseBackend.seedBhopalDirectoryInDb(
          BHOPAL_SEED_BUSINESSES,
          buildTemplateServiceCategories()
        );
        if (!res.ok) {
          UI.toast(res.error || 'Failed to seed Bhopal directory.', 'error');
          return;
        }
        UI.toast(`Seeded ${res.data.businesses} Bhopal directory listings and ${res.data.categories} service templates.`, 'success');
        await this.syncFromSupabase({ silent: true });
      } else if (action === 'logout') {
        AppState.session = await AuthService.logout();
        UI.toast('Signed out of Supabase.', 'info');
        await this.syncFromSupabase({ silent: true });
        this.navigate('home');
      } else if (action === 'open-auth') {
        AppState.authTab = btn.getAttribute('data-auth-mode') === 'register' ? 'register' : 'login';
        this.navigate('auth');
      } else if (action === 'start-booking') {
        AppState.customerTab = 'book';
        AppState.bookingDraft.step = 1;
        this.navigate(getActor() ? 'customer' : 'auth');
      } else if (action === 'toggle-lang') {
        const nextLang = AppState.db.settings.language === 'en' ? 'hi' : 'en';
        AppState.db.settings.language = nextLang;
        StorageAdapter.saveUiPrefs({ language: nextLang });
        this.render();
      } else if (action === 'toggle-theme') {
        const nextTheme = AppState.db.settings.theme === 'dark' ? 'light' : 'dark';
        AppState.db.settings.theme = nextTheme;
        StorageAdapter.saveUiPrefs({ theme: nextTheme });
        this.applyTheme(nextTheme);
      } else if (action === 'toggle-voice') {
        const nextVoice = !AppState.db.settings.voiceAnnouncements;
        AppState.db.settings.voiceAnnouncements = nextVoice;
        StorageAdapter.saveUiPrefs({ voiceAnnouncements: nextVoice });
        UI.toast(
          nextVoice ? 'Voice announcements enabled.' : 'Voice announcements muted.',
          'info'
        );
        this.render();
      } else if (action === 'toggle-fullscreen') {
        try {
          if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
          else await document.exitFullscreen();
        } catch (_) {
          UI.toast('Fullscreen mode is restricted by the current browser frame.', 'warn');
        }
        this.render();
      } else if (action === 'print-token') {
        const tok = AppState.db.tokens.find((x) => x.id === btn.getAttribute('data-token-id'));
        if (tok) UI.printToken(tok);
      } else if (action === 'download-qr') {
        const tok = AppState.db.tokens.find((x) => x.id === btn.getAttribute('data-token-id'));
        if (tok) UI.downloadTokenQr(tok);
      } else if (action === 'share-token') {
        const tok = AppState.db.tokens.find((x) => x.id === btn.getAttribute('data-token-id'));
        if (tok) UI.shareToken(tok);
      } else if (action === 'enlarge-qr') {
        const tok = AppState.db.tokens.find((x) => x.id === btn.getAttribute('data-token-id'));
        if (tok) UI.openEnlargedQr(tok);
      } else if (action === 'view-token-modal') {
        Modals.openTokenDetails(btn.getAttribute('data-token-id'));
      } else if (action === 'open-reschedule') {
        Modals.openReschedule(btn.getAttribute('data-token-id'));
      } else if (action === 'cancel-token-prompt') {
        Modals.openCancelToken(btn.getAttribute('data-token-id'));
      } else if (action === 'checkin-token') {
        const res = await QueueEngine.checkInAppointment(AppState.db, btn.getAttribute('data-token-id'), getActor());
        if (!res.ok) UI.toast(res.error, 'error');
        else {
          UI.toast(`Checked in ${res.token.tokenNumber} — Position #${res.token.position}.`, 'success');
          this.render();
        }
      } else if (action === 'open-notifications') {
        AppState.customerTab = 'notifications';
        this.navigate('customer');
      } else if (action === 'enable-browser-notifs') {
        const res = await NotificationService.requestBrowserPermission(AppState.db);
        UI.toast(res.message, res.ok ? 'success' : 'warn');
        this.render();
      } else if (action === 'disable-browser-notifs') {
        const res = NotificationService.disableBrowserNotifications(AppState.db);
        UI.toast(res.message, 'info');
        this.render();
      } else if (action === 'test-browser-notif') {
        const actor = getActor();
        if (actor) {
          const ok = await NotificationService.sendTestNotification(AppState.db, actor.id);
          if (ok) UI.toast('Test notification saved & sent.', 'success');
          else UI.toast('Configure Supabase to send notifications.', 'warn');
          this.render();
        }
      } else if (action === 'mark-all-read') {
        const actor = getActor();
        if (actor) {
          const count = await NotificationService.markAllRead(AppState.db, actor.id);
          if (count > 0) UI.toast(`Marked ${count} alert${count === 1 ? '' : 's'} as read.`, 'success');
          this.render();
        }
      } else if (action === 'clear-all-notifs') {
        const actor = getActor();
        if (actor) {
          UI.confirm({
            title: 'Clear All Notifications?',
            message: 'This permanently removes all notifications from your Supabase Notification Centre history.',
            confirmLabel: 'Clear All',
            danger: true,
            onConfirm: async () => {
              const removed = await NotificationService.clearAll(AppState.db, actor.id);
              UI.toast(`Cleared ${removed} notification${removed === 1 ? '' : 's'}.`, 'info');
              this.render();
            },
          });
        }
      } else if (action === 'pause-counter-prompt') {
        Modals.openPauseCounter(btn.getAttribute('data-counter-id'));
      } else if (action === 'resume-counter') {
        const cid = btn.getAttribute('data-counter-id');
        const res = await QueueEngine.setCounterStatus(AppState.db, cid, 'open', '', getActor());
        if (!res.ok) {
          UI.toast(res.error, 'error');
          return;
        }
        UI.toast('Counter resumed and waiting customers notified.', 'success');
        this.render();
      } else if (action === 'open-add-centre') {
        Modals.openAddCentre();
      } else if (action === 'open-add-announcement') {
        Modals.openAddAnnouncement();
      } else if (action === 'open-add-category') {
        Modals.openAddCategory();
      } else if (action === 'open-add-counter') {
        Modals.openCounterForm(null);
      } else if (action === 'open-add-operator') {
        Modals.openAddOperator();
      } else if (action === 'export-csv') {
        AnalyticsEngine.exportDailyCsv(AppState.db);
        UI.toast('Daily queue report exported to CSV.', 'success');
      } else if (action === 'export-json') {
        Utils.downloadTextFile(
          `smartq-backup-${Utils.todayStr()}.json`,
          JSON.stringify(AppState.db, null, 2),
          'application/json'
        );
        UI.toast('Full JSON backup downloaded.', 'success');
      } else if (action === 'apply-an-custom') {
        const fromEl = document.getElementById('an-from');
        const toEl = document.getElementById('an-to');
        AppState.adminFilters.analyticsFrom = fromEl ? fromEl.value : '';
        AppState.adminFilters.analyticsTo = toEl ? toEl.value : '';
        AppState.adminFilters.analyticsRange = 'custom';
        this.render();
      } else if (action === 'noshow-prompt') {
        Modals.openNoShowConfirm(btn.getAttribute('data-token-id'));
      } else if (action === 'restore-token-prompt') {
        Modals.openRestoreToken(btn.getAttribute('data-token-id'));
      } else if (action === 'run-noshow-check') {
        const res = await QueueEngine.processAutomaticNoShows(AppState.db, Date.now(), getActor());
        if (res.count > 0) {
          UI.toast(`Processed ${res.count} expired call${res.count === 1 ? '' : 's'} and recovered queues.`, 'warn');
          this.render();
        } else {
          UI.toast('No expired unclaimed calls found across open counters.', 'info');
        }
      } else if (action === 'verify-invalid-test') {
        await this.runVerify('INVALID-TOKEN-9999');
      }
    });

    // Form Submissions (Async Supabase Operations)
    document.addEventListener('submit', async (ev) => {
      const form = ev.target;
      if (!form || !form.id) return;

      if (form.id === 'login-form') {
        ev.preventDefault();
        const fd = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const errBox = document.getElementById('auth-error');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Signing in...';
        }
        const res = await AuthService.login(fd.get('email'), fd.get('password'));
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In to Workspace';
        }
        if (!res.ok) {
          if (errBox) errBox.innerHTML = `<div class="form-error">${Utils.esc(res.error)}</div>`;
          return;
        }
        AppState.session = res.session;
        await this.syncFromSupabase({ silent: true });
        UI.toast(`Welcome back, ${res.user.name} (${res.user.role}).`, 'success');
        if (res.user.role === 'admin') this.navigate('admin');
        else if (res.user.role === 'operator') this.navigate('operator');
        else this.navigate('customer');
      } else if (form.id === 'register-form') {
        ev.preventDefault();
        const fd = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const errBox = document.getElementById('auth-error');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Creating account...';
        }
        const res = await AuthService.registerCustomer({
          name: fd.get('name'),
          phone: fd.get('phone'),
          email: fd.get('email'),
          password: fd.get('password'),
        });
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Account & Continue';
        }
        if (!res.ok) {
          if (errBox) errBox.innerHTML = `<div class="form-error">${Utils.esc(res.error)}</div>`;
          return;
        }
        if (res.needsEmailConfirmation) {
          if (errBox) {
            errBox.innerHTML = `<div class="form-success">Account created! Please check your email inbox to confirm your address before signing in.</div>`;
          }
          UI.toast('Check your email to confirm your new Supabase account.', 'info');
          return;
        }
        AppState.session = res.session;
        await this.syncFromSupabase({ silent: true });
        AppState.customerTab = 'book';
        AppState.bookingDraft.step = 1;
        AppState.bookingDraft.customerName = res.user.name;
        AppState.bookingDraft.customerPhone = res.user.phone;
        UI.toast(`Account created for ${res.user.name}.`, 'success');
        this.navigate('customer');
      } else if (form.id === 'verify-qr-form') {
        ev.preventDefault();
        const query = new FormData(form).get('query');
        await this.runVerify(query);
      } else if (form.id === 'detail-booking-form') {
        ev.preventDefault();
        const fd = new FormData(form);
        const errBox = document.getElementById('detail-booking-error');
        const d = AppState.detailBooking;
        const customerName = String(fd.get('customerName') || '').trim();
        const customerPhone = String(fd.get('customerPhone') || '').trim();
        const priorityType = String(fd.get('priorityType') || 'standard');
        const priorityReason = String(fd.get('priorityReason') || '').trim();
        const scheduledTime = String(fd.get('scheduledTime') || '').trim();

        d.customerName = customerName;
        d.customerPhone = customerPhone;
        d.priorityType = priorityType;
        d.priorityReason = priorityReason;
        d.scheduledTime = scheduledTime;

        if (d.bookingType === 'appointment' && !scheduledTime) {
          if (errBox) errBox.innerHTML = `<div class="form-error">Please select a configured time slot.</div>`;
          return;
        }

        const activeActor = getActor();
        if (!activeActor) {
          if (errBox) {
            errBox.innerHTML = `<div class="form-error">Please sign in with your SmartQ Supabase account before booking a live token.</div>`;
          }
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const res = await QueueEngine.bookToken(
          AppState.db,
          {
            customerId: activeActor.id,
            customerName,
            customerPhone,
            isGuest: false,
            centreId: d.businessId,
            categoryId: d.serviceId,
            counterId: d.counterId,
            bookingType: d.bookingType,
            scheduledTime: d.bookingType === 'appointment' ? scheduledTime : '',
            priorityType,
            priorityReason,
          },
          activeActor
        );

        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          if (errBox) errBox.innerHTML = `<div class="form-error">${Utils.esc(res.error)}</div>`;
          return;
        }

        d.priorityType = 'standard';
        d.priorityReason = '';
        d.scheduledTime = '';
        AppState.customerTab = 'dashboard';
        UI.toast(`Token ${res.token.tokenNumber} booked in Supabase with QR code!`, 'success');
        this.navigate('customer');
      } else if (form.id === 'confirm-booking-form') {
        ev.preventDefault();
        const fd = new FormData(form);
        const actor = getActor();
        const d = AppState.bookingDraft;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const res = await QueueEngine.bookToken(
          AppState.db,
          {
            customerId: actor ? actor.id : '',
            customerName: fd.get('customerName'),
            customerPhone: fd.get('customerPhone'),
            isGuest: false,
            centreId: d.centreId,
            categoryId: d.categoryId,
            counterId: d.counterId,
            bookingType: d.bookingType,
            scheduledTime: d.scheduledTime,
            priorityType: fd.get('priorityType') || 'standard',
            priorityReason: fd.get('priorityReason') || '',
          },
          actor
        );
        if (submitBtn) submitBtn.disabled = false;
        if (!res.ok) {
          document.getElementById('booking-error').innerHTML = `<div class="form-error">${Utils.esc(res.error)}</div>`;
          return;
        }
        AppState.bookingDraft = {
          step: 1,
          categoryId: '',
          centreSearch: '',
          centreId: '',
          counterId: '',
          bookingType: 'immediate',
          scheduledTime: '',
          customerName: actor ? actor.name : '',
          customerPhone: actor ? actor.phone : '',
          priorityType: 'standard',
          priorityReason: '',
        };
        AppState.customerTab = 'dashboard';
        UI.toast(`Token ${res.token.tokenNumber} booked in Supabase with QR code!`, 'success');
        this.render();
      } else if (form.id === 'admin-rules-form') {
        ev.preventDefault();
        const fd = new FormData(form);
        const s = AppState.db.settings;
        const nextSettings = {
          ...s,
          notifyAtFive: fd.has('notifyAtFive'),
          notifyAtThree: fd.has('notifyAtThree'),
          notifyApproaching: fd.has('notifyApproaching'),
          notifyAtOne: fd.has('notifyAtOne'),
          notifyEtaChange: fd.has('notifyEtaChange'),
          autoNoShowEnabled: fd.has('autoNoShowEnabled'),
          autoAdvanceOnNoShow: fd.has('autoAdvanceOnNoShow'),
          noShowGraceSec: Number.isFinite(Math.round(Number(fd.get('noShowGraceSec'))))
            ? Math.min(900, Math.max(15, Math.round(Number(fd.get('noShowGraceSec')))))
            : s.noShowGraceSec,
          priorityRules: {
            senior: fd.has('pri_senior'),
            medical: fd.has('pri_medical'),
            accessibility: fd.has('pri_accessibility'),
            vip: fd.has('pri_vip'),
            requireReason: fd.has('pri_requireReason'),
          },
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const actor = getActor();
        const saveRes = await SupabaseBackend.saveAppSettingsInDb(nextSettings, actor ? actor.id : undefined);
        if (submitBtn) submitBtn.disabled = false;
        if (!saveRes.ok) {
          UI.toast(saveRes.error || 'Failed to save policy rules in Supabase.', 'error');
          return;
        }

        Object.assign(s, nextSettings);
        QueueEngine.addAudit(
          AppState.db,
          actor,
          'RULES_UPDATED',
          'settings',
          'policy',
          `Updated notification, priority & No-Show rules (grace: ${QueueEngine.formatGraceDuration(s.noShowGraceSec)}, auto-recovery: ${s.autoNoShowEnabled ? 'ON' : 'OFF'}).`
        );
        UI.toast('Notification, No-Show grace period, and priority rules saved in Supabase.', 'success');
        this.render();
      }
    });

    // Live Search & Filter Inputs
    document.addEventListener('input', (ev) => {
      const el = ev.target;
      if (el.id === 'centre-search-input') {
        AppState.bookingDraft.centreSearch = el.value;
        this.render();
        const ref = document.getElementById('centre-search-input');
        if (ref) {
          ref.focus();
          ref.setSelectionRange(ref.value.length, ref.value.length);
        }
      } else if (el.id === 'admin-search-tokens') {
        AppState.adminFilters.search = el.value;
        this.render();
        const ref = document.getElementById('admin-search-tokens');
        if (ref) {
          ref.focus();
          ref.setSelectionRange(ref.value.length, ref.value.length);
        }
      } else if (el.id === 'bhopal-dir-search') {
        AppState.directory.search = el.value;
        this.render();
        const ref = document.getElementById('bhopal-dir-search');
        if (ref) {
          ref.focus();
          ref.setSelectionRange(ref.value.length, ref.value.length);
        }
      } else if (el.id === 'admin-biz-search') {
        AppState.adminFilters.bizSearch = el.value;
        this.render();
        const ref = document.getElementById('admin-biz-search');
        if (ref) {
          ref.focus();
          ref.setSelectionRange(ref.value.length, ref.value.length);
        }
      }
    });

    document.addEventListener('change', (ev) => {
      const el = ev.target;
      if (el.id === 'admin-filter-status') {
        AppState.adminFilters.status = el.value;
        this.render();
      } else if (el.id === 'admin-filter-cat') {
        AppState.adminFilters.categoryId = el.value;
        this.render();
      } else if (el.id === 'admin-filter-date') {
        AppState.adminFilters.date = el.value;
        this.render();
      } else if (el.id === 'display-centre-select') {
        AppState.displayCentreId = el.value;
        this.render();
      } else if (el.id === 'bhopal-area-select') {
        AppState.directory.area = el.value;
        this.render();
      } else if (el.id === 'admin-biz-scope') {
        AppState.adminFilters.bizScope = el.value;
        this.render();
      } else if (el.id === 'admin-biz-cat') {
        AppState.adminFilters.bizCategory = el.value;
        this.render();
      } else if (el.id === 'admin-biz-area') {
        AppState.adminFilters.bizArea = el.value;
        this.render();
      }
    });

    // Keyboard Escape to close modals
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') UI.closeModal();
    });

    // Close modal on backdrop click
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      modalRoot.addEventListener('click', (ev) => {
        if (ev.target === modalRoot) UI.closeModal();
      });
    }

    // Supabase Auth session listener (keeps auth state synced across tabs/refreshes)
    SupabaseBackend.subscribeAuthChanges(() => {
      this.syncFromSupabase({ silent: true });
    });
  },

  async init() {
    this.bindGlobalEvents();
    this.startLiveEtaTicker();
    this.startNoShowWatcher();
    this.render();
    if (SupabaseBackend.isSupabaseConfigured()) {
      await this.syncFromSupabase({ silent: false });
      this.startRealtime();
    }
  },
};

if (AppState.db && AppState.db.settings) {
  document.documentElement.setAttribute(
    'data-theme',
    AppState.db.settings.theme === 'dark' ? 'dark' : 'light'
  );
}

document.addEventListener('DOMContentLoaded', () => App.init());
