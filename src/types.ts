export type LayoutMode = 'chevron' | 'pods5' | 'pods6' | 'horseshoe' | 'exam' | 'hybrid';

export type ViewTab = 'blueprint2d' | 'isometric3d' | 'aiRenders' | 'specsBOM' | 'sightlineAnalysis';

export interface DeskItem {
  id: string;
  studentNumber: number;
  x: number; // in feet (0 to 18)
  y: number; // in feet (0 to 24)
  rotation: number; // in degrees (0 = facing north / whiteboard)
  group: number; // 1 to 6 (for group coloring)
  label?: string;
  sightlineAngle?: number; // degrees from direct normal to whiteboard
  distanceToBoard?: number; // distance in feet to center of whiteboard
  hasClearSightline?: boolean;
}

export interface TeacherStation {
  x: number;
  y: number;
  width: number; // feet (e.g. 4.0)
  depth: number; // feet (e.g. 2.2)
  rotation: number;
  isHeightAdjustable: boolean;
  hasBottomShelves: boolean;
}

export interface LoungeZone {
  sofa: {
    x: number;
    y: number;
    width: number; // feet (e.g. 5.5)
    depth: number; // feet (e.g. 2.5)
    rotation: number;
  };
  coffeeTables: Array<{
    id: string;
    x: number;
    y: number;
    radius: number; // feet (e.g. 1.0 = 24" dia)
  }>;
  stools: Array<{
    id: string;
    x: number;
    y: number;
    radius: number; // feet (e.g. 0.65 = 16" dia)
    color: string;
  }>;
}

export interface WhiteboardSpec {
  x: number; // start x on front wall
  y: number; // y coordinate (0 = front wall)
  width: number; // e.g. 16 ft
  depth: number; // e.g. 0.2 ft
}

export interface RoomLayoutConfig {
  id: LayoutMode;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  desks: DeskItem[];
  teacherStation: TeacherStation;
  loungeZone: LoungeZone;
  whiteboard: WhiteboardSpec;
  pedagogicalFocus: string;
  reconfigurationTimeSec: number;
}

export interface AIStylePreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  palette: string[];
  materials: string[];
  promptModifier: string;
  coverImage?: string;
}

export interface BOMItem {
  id: string;
  category: 'Student Furniture' | 'Teacher Station' | 'Lounge & Collaboration' | 'Instructional Tech & Surfaces' | 'Acoustics & Storage';
  name: string;
  modelCode: string;
  quantity: number;
  unitCost: number;
  dimensions: string;
  features: string[];
  ergonomics: string;
  reconfigurability: string;
}
