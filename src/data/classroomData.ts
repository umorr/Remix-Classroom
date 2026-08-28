import { RoomLayoutConfig, AIStylePreset, BOMItem } from '../types';

export const ROOM_WIDTH_FT = 18; // 18 feet width
export const ROOM_LENGTH_FT = 24; // 24 feet length
export const ROOM_HEIGHT_FT = 10; // 10 feet ceiling
export const ROOM_AREA_SQFT = ROOM_WIDTH_FT * ROOM_LENGTH_FT; // 432 sq ft

export const WHITEBOARD_SPEC = {
  x: 1.0, // centered on front wall (y = 0)
  y: 0.15,
  width: 16.0, // 16-foot high-clarity magnetic ceramic porcelain whiteboard
  depth: 0.2,
};

export const TEACHER_STATION_DEFAULT = {
  x: 14.2,
  y: 3.2,
  width: 4.2, // 50" width
  depth: 2.3, // 28" depth
  rotation: 15, // slightly angled toward class
  isHeightAdjustable: true,
  hasBottomShelves: true,
};

export const LOUNGE_ZONE_DEFAULT = {
  sofa: {
    x: 14.0,
    y: 20.8,
    width: 6.0, // 72" modern high school lounge sofa
    depth: 2.6,
    rotation: 0,
  },
  coffeeTables: [
    { id: 'ct-1', x: 14.0, y: 18.2, radius: 1.1 }, // 26" dia round coffee table
  ],
  stools: [
    { id: 'st-1', x: 12.0, y: 19.5, radius: 0.65, color: '#0d9488' }, // teal active stool
    { id: 'st-2', x: 16.0, y: 19.5, radius: 0.65, color: '#0d9488' },
    { id: 'st-3', x: 12.5, y: 17.5, radius: 0.65, color: '#f59e0b' }, // amber stool
    { id: 'st-4', x: 15.5, y: 17.5, radius: 0.65, color: '#f59e0b' },
  ],
};

// Generate 30 desks for Chevron Lecture Layout (5 rows x 6 desks, split 3 left and 3 right with 3.8ft center aisle)
const generateChevronDesks = () => {
  const desks = [];
  let idCounter = 1;
  const rowY = [5.6, 8.8, 12.0, 15.2, 18.4];
  
  for (let r = 0; r < 5; r++) {
    const y = rowY[r];
    // Left bank (3 desks per row)
    const leftX = [2.0, 4.4, 6.8];
    for (let c = 0; c < 3; c++) {
      desks.push({
        id: `desk-${idCounter}`,
        studentNumber: idCounter,
        x: leftX[c],
        y: y,
        rotation: -10 + c * 3, // slightly angled toward board center
        group: r + 1,
        label: `S${idCounter}`,
      });
      idCounter++;
    }
    // Right bank (3 desks per row)
    const rightX = [10.8, 13.2, 15.6];
    for (let c = 0; c < 3; c++) {
      // Keep right bank clear of the lounge area in the last row if needed
      const adjustedX = (r === 4 && c === 2) ? 14.8 : rightX[c];
      const adjustedY = (r === 4 && c === 2) ? 17.6 : y;
      desks.push({
        id: `desk-${idCounter}`,
        studentNumber: idCounter,
        x: adjustedX,
        y: adjustedY,
        rotation: 10 - c * 3, // angled toward board center
        group: r + 1,
        label: `S${idCounter}`,
      });
      idCounter++;
    }
  }
  return desks;
};

// Generate 5 Pods of 6 Students each = 30 Desks
const generatePods5Desks = () => {
  const desks = [];
  let idCounter = 1;
  // 5 pod centers in 18x24 space
  const podCenters = [
    { cx: 4.5, cy: 7.2, group: 1 },
    { cx: 11.5, cy: 7.2, group: 2 },
    { cx: 4.5, cy: 13.8, group: 3 },
    { cx: 11.5, cy: 13.8, group: 4 },
    { cx: 7.5, cy: 19.8, group: 5 },
  ];

  podCenters.forEach((pod) => {
    // 6 desks in a cooperative hexagon cluster around pod center
    const radius = 1.9;
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 30) * (Math.PI / 180);
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;
      // Rotation: faces outward from center of pod, angled to board
      const rot = (i * 60 - 30) * 0.5;
      desks.push({
        id: `desk-${idCounter}`,
        studentNumber: idCounter,
        x: Number((pod.cx + dx).toFixed(2)),
        y: Number((pod.cy + dy).toFixed(2)),
        rotation: Number(rot.toFixed(1)),
        group: pod.group,
        label: `S${idCounter}`,
      });
      idCounter++;
    }
  });

  return desks;
};

// Generate 6 Pods of 5 Students each = 30 Desks
const generatePods6Desks = () => {
  const desks = [];
  let idCounter = 1;
  const podCenters = [
    { cx: 4.0, cy: 6.8, group: 1 },
    { cx: 10.5, cy: 6.8, group: 2 },
    { cx: 4.0, cy: 12.8, group: 3 },
    { cx: 10.5, cy: 12.8, group: 4 },
    { cx: 4.0, cy: 18.8, group: 5 },
    { cx: 10.5, cy: 18.8, group: 6 },
  ];

  podCenters.forEach((pod) => {
    const radius = 1.6;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 - 18) * (Math.PI / 180);
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;
      desks.push({
        id: `desk-${idCounter}`,
        studentNumber: idCounter,
        x: Number((pod.cx + dx).toFixed(2)),
        y: Number((pod.cy + dy).toFixed(2)),
        rotation: Number(((i * 72 - 18) * 0.4).toFixed(1)),
        group: pod.group,
        label: `S${idCounter}`,
      });
      idCounter++;
    }
  });

  return desks;
};

// Generate Horseshoe / Socratic Seminar (30 Desks)
const generateHorseshoeDesks = () => {
  const desks = [];
  let idCounter = 1;

  // Outer U-shape (18 desks)
  // Left column (6 desks going down)
  for (let i = 0; i < 6; i++) {
    desks.push({
      id: `desk-${idCounter}`,
      studentNumber: idCounter,
      x: 2.2,
      y: 6.0 + i * 2.6,
      rotation: 65, // facing inner horseshoe & board
      group: 1,
      label: `S${idCounter}`,
    });
    idCounter++;
  }
  // Bottom row (6 desks across)
  for (let i = 0; i < 6; i++) {
    desks.push({
      id: `desk-${idCounter}`,
      studentNumber: idCounter,
      x: 4.2 + i * 1.8,
      y: 19.5,
      rotation: 0, // facing whiteboard directly
      group: 2,
      label: `S${idCounter}`,
    });
    idCounter++;
  }
  // Right column (6 desks going down)
  for (let i = 0; i < 6; i++) {
    desks.push({
      id: `desk-${idCounter}`,
      studentNumber: idCounter,
      x: 15.6,
      y: 6.0 + i * 2.3,
      rotation: -65, // facing inner horseshoe & board
      group: 3,
      label: `S${idCounter}`,
    });
    idCounter++;
  }

  // Inner U-shape (12 desks)
  // Inner left (4 desks)
  for (let i = 0; i < 4; i++) {
    desks.push({
      id: `desk-${idCounter}`,
      studentNumber: idCounter,
      x: 5.0,
      y: 8.0 + i * 2.4,
      rotation: 45,
      group: 4,
      label: `S${idCounter}`,
    });
    idCounter++;
  }
  // Inner bottom (4 desks)
  for (let i = 0; i < 4; i++) {
    desks.push({
      id: `desk-${idCounter}`,
      studentNumber: idCounter,
      x: 6.2 + i * 1.8,
      y: 16.2,
      rotation: 0,
      group: 5,
      label: `S${idCounter}`,
    });
    idCounter++;
  }
  // Inner right (4 desks)
  for (let i = 0; i < 4; i++) {
    desks.push({
      id: `desk-${idCounter}`,
      studentNumber: idCounter,
      x: 12.8,
      y: 8.0 + i * 2.4,
      rotation: -45,
      group: 6,
      label: `S${idCounter}`,
    });
    idCounter++;
  }

  return desks;
};

// Generate Exam / Individual Focus (30 Desks in 5 columns x 6 rows)
const generateExamDesks = () => {
  const desks = [];
  let idCounter = 1;
  const colX = [2.2, 5.0, 7.8, 10.6, 13.4];
  const rowY = [5.6, 8.0, 10.4, 12.8, 15.2, 17.6];

  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      desks.push({
        id: `desk-${idCounter}`,
        studentNumber: idCounter,
        x: colX[c],
        y: rowY[r],
        rotation: 0,
        group: r + 1,
        label: `S${idCounter}`,
      });
      idCounter++;
    }
  }
  return desks;
};

// Generate Hybrid Station Rotation (20 active desks + 10 students in collaborative lounge/stools & teacher station)
const generateHybridDesks = () => {
  const desks = [];
  let idCounter = 1;

  // Station A: 2 Front Pods of 5 (10 students)
  const pod1Center = { cx: 4.8, cy: 7.5 };
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72) * (Math.PI / 180);
    desks.push({
      id: `desk-${idCounter}`,
      studentNumber: idCounter,
      x: Number((pod1Center.cx + Math.cos(angle) * 1.7).toFixed(2)),
      y: Number((pod1Center.cy + Math.sin(angle) * 1.7).toFixed(2)),
      rotation: i * 30 - 60,
      group: 1,
      label: `S${idCounter} (Pod A)`,
    });
    idCounter++;
  }

  const pod2Center = { cx: 11.2, cy: 7.5 };
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72) * (Math.PI / 180);
    desks.push({
      id: `desk-${idCounter}`,
      studentNumber: idCounter,
      x: Number((pod2Center.cx + Math.cos(angle) * 1.7).toFixed(2)),
      y: Number((pod2Center.cy + Math.sin(angle) * 1.7).toFixed(2)),
      rotation: i * 30 - 60,
      group: 2,
      label: `S${idCounter} (Pod B)`,
    });
    idCounter++;
  }

  // Station B: Independent Focus Rows (10 students)
  const focusX = [3.0, 5.8, 8.6, 11.4, 14.2];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      desks.push({
        id: `desk-${idCounter}`,
        studentNumber: idCounter,
        x: focusX[c],
        y: 13.0 + r * 2.6,
        rotation: 0,
        group: 3,
        label: `S${idCounter} (Focus)`,
      });
      idCounter++;
    }
  }

  // Station C: Collaborative Lounge & Stool Station (10 students rotate into lounge area)
  // We place 10 mobile agile collaborative desks arranged near lounge zone
  for (let i = 0; i < 5; i++) {
    desks.push({
      id: `desk-${idCounter}`,
      studentNumber: idCounter,
      x: 3.2 + i * 1.6,
      y: 19.5,
      rotation: -15,
      group: 4,
      label: `S${idCounter} (Collab)`,
    });
    idCounter++;
  }
  for (let i = 0; i < 5; i++) {
    desks.push({
      id: `desk-${idCounter}`,
      studentNumber: idCounter,
      x: 3.2 + i * 1.6,
      y: 21.8,
      rotation: 15,
      group: 5,
      label: `S${idCounter} (Collab)`,
    });
    idCounter++;
  }

  return desks;
};

export const ROOM_LAYOUT_CONFIGS: Record<string, RoomLayoutConfig> = {
  chevron: {
    id: 'chevron',
    name: 'Dynamic Chevron',
    tagline: 'Direct Instruction & 100% Sightline Priority',
    description: 'Angled dual banks of 15 desks each with a wide 4.0ft central ADA spine. Gives all 30 students direct, zero-neck-strain lines of sight to the 16ft central whiteboard.',
    iconName: 'LayoutGrid',
    desks: generateChevronDesks(),
    teacherStation: TEACHER_STATION_DEFAULT,
    loungeZone: LOUNGE_ZONE_DEFAULT,
    whiteboard: WHITEBOARD_SPEC,
    pedagogicalFocus: 'Whole-class lectures, interactive demonstrations, audiovisual presentations',
    reconfigurationTimeSec: 45,
  },
  pods5: {
    id: 'pods5',
    name: '5 Hex-Pods (6 Students/Pod)',
    tagline: 'Deep Collaborative Problem Solving',
    description: '30 students clustered into 5 distinct cooperative hexagonal islands. Each desk features lockable 360° casters to join into cohesive team workstations.',
    iconName: 'Users',
    desks: generatePods5Desks(),
    teacherStation: TEACHER_STATION_DEFAULT,
    loungeZone: LOUNGE_ZONE_DEFAULT,
    whiteboard: WHITEBOARD_SPEC,
    pedagogicalFocus: 'Project-based learning, science lab simulations, peer reviews',
    reconfigurationTimeSec: 30,
  },
  pods6: {
    id: 'pods6',
    name: '6 Agile Pods (5 Students/Pod)',
    tagline: 'High-Velocity Small Team Sprints',
    description: '6 compact pentagon clusters distributed evenly across the 18x24 floor. Balances intimate group dynamics with rapid teacher circulation paths.',
    iconName: 'Group',
    desks: generatePods6Desks(),
    teacherStation: TEACHER_STATION_DEFAULT,
    loungeZone: LOUNGE_ZONE_DEFAULT,
    whiteboard: WHITEBOARD_SPEC,
    pedagogicalFocus: 'Design sprints, debates, group math challenges',
    reconfigurationTimeSec: 35,
  },
  horseshoe: {
    id: 'horseshoe',
    name: 'Socratic Horseshoe',
    tagline: 'Open Forum & High-Engagement Seminar',
    description: 'Tiered concentric U-shape perimeter keeping the central room floor open for student presentations, debates, and unhindered board access.',
    iconName: 'CircleDot',
    desks: generateHorseshoeDesks(),
    teacherStation: { ...TEACHER_STATION_DEFAULT, x: 14.5, y: 4.0 },
    loungeZone: LOUNGE_ZONE_DEFAULT,
    whiteboard: WHITEBOARD_SPEC,
    pedagogicalFocus: 'Socratic seminars, student presentations, literature discussions',
    reconfigurationTimeSec: 60,
  },
  exam: {
    id: 'exam',
    name: 'Individual Testing Grid',
    tagline: 'Standardized Assessment & Focus',
    description: '5 columns x 6 rows strictly spaced with maximum inter-desk separation, preventing visual distraction while maintaining clear teacher aisles.',
    iconName: 'FileSpreadsheet',
    desks: generateExamDesks(),
    teacherStation: { ...TEACHER_STATION_DEFAULT, x: 14.2, y: 3.2 },
    loungeZone: LOUNGE_ZONE_DEFAULT,
    whiteboard: WHITEBOARD_SPEC,
    pedagogicalFocus: 'Standardized tests, midterm exams, independent silent research',
    reconfigurationTimeSec: 40,
  },
  hybrid: {
    id: 'hybrid',
    name: 'Station Rotation / Multi-Zone',
    tagline: 'Differentiated Active Learning',
    description: 'Blends teacher-led instruction pods, independent silent focus desks, and a dedicated collaborative lounge corner with coffee tables and stools.',
    iconName: 'Layers',
    desks: generateHybridDesks(),
    teacherStation: TEACHER_STATION_DEFAULT,
    loungeZone: LOUNGE_ZONE_DEFAULT,
    whiteboard: WHITEBOARD_SPEC,
    pedagogicalFocus: 'Differentiated instruction, flipped classroom, personalized pacing',
    reconfigurationTimeSec: 50,
  },
};

export const AI_STYLE_PRESETS: AIStylePreset[] = [
  {
    id: 'scandinavian_biophilic',
    name: 'Scandinavian Biophilic',
    subtitle: 'Light Birch, Moss Accents & Warm Daylight',
    description: 'Clean Nordic wood grains, acoustic felt slat ceiling baffles, living plant partitions, and warm natural sunlight creating a calm, high-focus high school environment.',
    palette: ['#F3EFE0', '#2E4F4F', '#0E8388', '#CBE4DE'],
    materials: ['Natural Light Birch', 'Acoustic Wool Felt', 'Powder-coated Sage Steel', 'Matte Ceramic Whiteboard'],
    promptModifier: 'Scandinavian Biophilic modern high school classroom design, light blonde birch desks with black steel caster legs, ergonomic sage green and charcoal swivel chairs, acoustic slat wall, potted fiddle leaf figs, wide magnetic whiteboard, modern minimalist lounge sofa with teal stools and ash round coffee table, soft natural daylight through large windows, clean architectural photography.',
  },
  {
    id: 'contemporary_tech',
    name: 'Contemporary Tech-Forward',
    subtitle: 'Matte Charcoal, Crisp White & LED Accents',
    description: 'Cutting-edge modern aesthetic featuring matte black aluminum frames, crisp high-pressure laminate desktops, and integrated cable channels with indirect warm 3500K LED illumination.',
    palette: ['#1E293B', '#F8FAFC', '#38BDF8', '#64748B'],
    materials: ['Matte Black Anodized Aluminum', 'High-Pressure White Laminate', '3D Breathable Mesh', 'Porcelain Enamel Board'],
    promptModifier: 'Contemporary tech-forward high school classroom interior, 18x24 foot room, 30 ergonomic white top desks on lockable casters with black ergonomic mesh chairs, 16ft wide magnetic smart whiteboard, height adjustable motorized teacher standing desk with bottom equipment shelves, sleek charcoal fabric modular sofa, modern round coffee tables with vibrant cyan acoustic stools, warm architectural lighting.',
  },
  {
    id: 'warm_nordic_minimalist',
    name: 'Warm Nordic Minimalist',
    subtitle: 'Natural Oak, Boucle Lounge & Brass Accents',
    description: 'Warm, inviting pedagogical atmosphere with honey oak finishes, deep navy ergonomic chairs, an architectural boucle lounge sofa, and soft acoustic wall paneling.',
    palette: ['#D7C4B7', '#31475E', '#EAE0D5', '#5E503F'],
    materials: ['Honey Oak Veneer', 'Performance Boucle Upholstery', 'Brushed Brass Accents', 'Magnetic Glass Whiteboard'],
    promptModifier: 'Warm Nordic minimalist classroom, high school interior design, 18x24 room dimensions, 30 modular ergonomic student desks in oak wood with navy swivel chairs facing huge front whiteboard, teacher height adjustable standing desk with two tiers of bottom shelving, cozy breakout corner with cream boucle lounge couch and wooden round coffee tables with ochre stools, warm architectural lighting, photorealistic.',
  },
  {
    id: 'vibrant_active_learning',
    name: 'Vibrant Active Learning',
    subtitle: 'Modular Agility, Ochre & Teal Accents',
    description: 'Dynamic and stimulating educational space engineered for active student movement, rapid reconfiguration, acoustic comfort, and collaborative team synergy.',
    palette: ['#0F766E', '#F59E0B', '#F1F5F9', '#334155'],
    materials: ['Antimicrobial Textured Laminate', 'High-Density Foam Stools', 'Lockable Caster Wheels', 'Hexagonal Acoustic Clouds'],
    promptModifier: 'Vibrant active learning high school classroom 18x24 layout, 30 colorful mobile student desks with ergonomic task chairs, clear direct line of sight to front 16ft whiteboard, teacher pneumatic standing workstation with lower book shelves, breakout lounge sofa area with modern coffee tables and colorful ergonomic wobble stools, bright energetic modern classroom interior photo.',
  },
];

export const FURNITURE_BOM: BOMItem[] = [
  {
    id: 'bom-1',
    category: 'Student Furniture',
    name: 'AeroFlex 360° Mobile Student Desk',
    modelCode: 'AF-SD-2820-MB',
    quantity: 30,
    unitCost: 185,
    dimensions: '28"W × 20"D × 29"H',
    features: [
      'Lockable smooth-glide polyurethane casters',
      'Pneumatic flip-top for nesting and rapid storage',
      'Integrated backpack hook and molded pen groove',
      'Scratch-resistant High Pressure Laminate (HPL) surface with PVC edging'
    ],
    ergonomics: 'ANSI/BIFMA X5.5 Compliant. Optimized for high school height percentiles (5th-95th percentile).',
    reconfigurability: '100% toolless instant reconfiguration into hex-pods, chevrons, or exam rows in under 60 seconds.',
  },
  {
    id: 'bom-2',
    category: 'Student Furniture',
    name: 'ErgoCurve Active Task Mesh Chair',
    modelCode: 'EC-TC-300-BLK',
    quantity: 30,
    unitCost: 145,
    dimensions: '22"W × 22"D × 32"-37"H',
    features: [
      'Breathable matrix mesh back with dynamic lumbar tension',
      'Pneumatic seat height adjustment (16"-21")',
      'Waterfall seat cushion edge to relieve hamstring pressure',
      '360° quiet dual-wheel swivel casters'
    ],
    ergonomics: 'GREENGUARD Gold Certified. BIFMA G1-2013 Ergonomics certified for 8+ hours posture health.',
    reconfigurability: 'Ultra-lightweight (14 lbs) with built-in back handle for rapid student movement.',
  },
  {
    id: 'bom-3',
    category: 'Teacher Station',
    name: 'ElevatePro Dual-Tier Standing Desk',
    modelCode: 'EP-TD-5028-ADJ',
    quantity: 1,
    unitCost: 620,
    dimensions: '50"W × 28"D × 28"-48"H',
    features: [
      'Dual whisper-quiet electric lifting columns with 4 memory height presets',
      '2 lower steel storage shelves for binders, textbooks, and AV hardware',
      'Integrated power hub (3 AC outlets, 2 USB-C 65W PD ports)',
      'Heavy-duty lockable casters for mobile teaching positions'
    ],
    ergonomics: 'Transitions smoothly between sitting (28") and standing (48") to support active educator biomechanics.',
    reconfigurability: 'Mobile on lockable casters; easily moved between front whiteboard and collaborative student pods.',
  },
  {
    id: 'bom-4',
    category: 'Lounge & Collaboration',
    name: 'Forma Modular 3-Seater Breakout Sofa',
    modelCode: 'FM-SOFA-7230-GRY',
    quantity: 1,
    unitCost: 890,
    dimensions: '72"W × 30"D × 30"H (Seat Height 17")',
    features: [
      'High-resilience antibacterial foam with commercial-grade acoustic fabric',
      'Stain-repellent Crypton coating (100,000+ double rubs durability)',
      'Solid FSC-certified hardwood internal frame with steel sled base',
      'Built-in under-cushion cable management channel'
    ],
    ergonomics: 'Medium-firm supportive seating angle (105°) ideal for informal discussion and high school reading.',
    reconfigurability: 'Modular sections can be split or combined into linear or L-shaped breakout zones.',
  },
  {
    id: 'bom-5',
    category: 'Lounge & Collaboration',
    name: 'Orbit Active Dynamic Balance Stools',
    modelCode: 'OB-ST-1616-ACT',
    quantity: 4,
    unitCost: 95,
    dimensions: '15" Dia × 18"H',
    features: [
      'Convex non-skid rubber base enabling gentle core-activating micromovement',
      'High-density molded foam cushion with vibrant woven fabric',
      'Integrated carrying strap for 1-hand transport',
      'Anti-tip safety angle limiter (max 12° tilt)'
    ],
    ergonomics: 'Promotes active sitting, vestibular stimulation, and focus for neurodiverse and active learners.',
    reconfigurability: 'Weighs only 7 lbs; stackable / nestable under coffee tables or against walls.',
  },
  {
    id: 'bom-6',
    category: 'Lounge & Collaboration',
    name: 'Nordic Round Collaborative Coffee Table',
    modelCode: 'NR-CT-2618-OAK',
    quantity: 1,
    unitCost: 210,
    dimensions: '26" Dia × 18"H',
    features: [
      'Solid solid ash wood bullnose edge with scratch-proof matte laminate top',
      'Matte black welded steel tripod base with non-marring floor glides',
      'Low center of gravity for stability during active group work'
    ],
    ergonomics: 'Matches lounge sofa and active stool heights for comfortable laptop and notebook placement.',
    reconfigurability: 'Easily shifted between center of lounge zone and peripheral breakout stations.',
  },
  {
    id: 'bom-7',
    category: 'Instructional Tech & Surfaces',
    name: 'CeramicSteel 16ft Magnetic Porcelain Whiteboard',
    modelCode: 'CS-WB-1604-PORC',
    quantity: 1,
    unitCost: 1150,
    dimensions: '192"W × 48"H (16ft × 4ft)',
    features: [
      'e3 CeramicSteel surface: virtually indestructible, zero ghosting, lifetime surface warranty',
      'Ultra-matte finish minimizing projector glare and specular light reflection',
      'Full-length aluminum accessory tray with safety capped corners',
      'Heavy-duty magnetic backing supporting learning manipulatives and visual aids'
    ],
    ergonomics: 'Mounted at 36" AFF (Above Finished Floor) ensuring seated high schoolers in all 30 desks have 100% unblocked sightlines.',
    reconfigurability: 'Fixed perimeter wall mounting with precision laser level alignment.',
  },
  {
    id: 'bom-8',
    category: 'Acoustics & Storage',
    name: 'EchoMute 3D Hex Acoustic Wall Baffles (Set of 12)',
    modelCode: 'EM-AC-12HEX-PET',
    quantity: 2,
    unitCost: 320,
    dimensions: '16" × 16" × 1" per tile',
    features: [
      '100% recycled PET felt with NRC rating of 0.85 (absorbs 85% of ambient speech noise)',
      'Class A fire rated, formaldehyde-free, zero VOC emissions',
      'Beveled geometric design in complementary sage and charcoal hues'
    ],
    ergonomics: 'Reduces classroom reverberation time from 1.2s to 0.45s, dramatically improving speech intelligibility from back rows.',
    reconfigurability: 'Modular peel-and-stick magnetic base plates for customized aesthetic arrangements.',
  },
];
