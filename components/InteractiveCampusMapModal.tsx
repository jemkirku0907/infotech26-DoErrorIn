'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  MapPin, 
  Layers, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { MapLocation } from '@/lib/types';

interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  description: string;
  floors: {
    floorName: string;
    northWing?: string[];
    southWing?: string[];
    rooms?: string[];
  }[];
  coordinates: { x: number; y: number }; // Percentage on SVG map
  color: string;
}

const BUILDINGS: CampusBuilding[] = [
  {
    id: 'admin',
    name: 'Admin Building',
    code: 'ADMIN',
    description: 'Central administrative offices, Registrar, Executive offices, and Academic deans.',
    coordinates: { x: 38, y: 44 },
    color: '#3F56CA',
    floors: [
      {
        floorName: 'Basement',
        northWing: ['University Chaplain', 'Center for Institutional Mission and Identity (CIMI)', 'University Facilities Management Office (UFMO)', 'Supply and Property Management Office (SPMO)', 'Occupational Health and Safety Office (OHSO)'],
        southWing: ['Cafeteria (UMak Food Hub)', 'General Service Office (GSO): Housekeeping, Elevator Operations, Engineering, Transportation Management']
      },
      {
        floorName: 'Ground Floor',
        northWing: ['Center for Quality and Management Development (CQMD)', 'Center for Institutional and Global Affairs (CIGA)', 'Universities Facilities Management Office (UFMO)', 'Medical and Dental Clinic (MDC)'],
        southWing: ['UMak Auditorium (Mini Theater)', 'OCH Function Rooms A-C', 'Accounting Office', 'Cash Office']
      },
      {
        floorName: 'Mezzanine Floor',
        northWing: ['Center for Archives and Information Governance (CAIG)', 'Innovation and Technology Support Office (ITSO)'],
        southWing: ['Office of the University Registrar (OUR)']
      },
      {
        floorName: 'Second Floor',
        northWing: ['Budget Management Office (BMO)', 'Office of the Vice President for Finance (OVPF)', 'Center for Planning and Development (CPD)', 'Human Resources Management Office (HRMO)'],
        southWing: ['Library Learning Commons (LLC)', 'Center for Information Technology (CIT)', 'Center for Technology-based Learning Hub (CTBL)']
      },
      {
        floorName: 'Third Floor',
        northWing: ['Office of the President', 'Office of the Vice President for Academic Affairs'],
        southWing: ['College of Governance and Public Policy (CGPP)', 'College of Computing and Information Sciences (CCIS)', 'Institute of Accountancy and Finance (IAF)', 'College of Business Administration (CBA)', 'College of Human Kinetics (CHK)']
      },
      {
        floorName: 'Fourth Floor',
        northWing: ['Center for Linkages and Placement (CLP)', 'Office of the University Secretary (OUSEC)', 'Center for Alumni Affairs (CAA)', 'Vice President for Administration (OVPA)'],
        southWing: ['Institute of Nursing (ION)', 'Institute of Pharmacy (IOP)', 'College of Engineering and Technology (CET)', 'College of Liberal Arts and Social Sciences (CLASS)', 'College of Science (COS)']
      },
      {
        floorName: 'Fifth Floor',
        northWing: ['University Student Multimedia Organization (USMO)', 'University Student Council (USC)', 'Center for Student Formation and Discipline (CSFD)', 'Center for Student Organization and Activities (CSOA)'],
        southWing: ['Center for Technology Incubation and Enterprise Development (CTIED)', 'Center for Integrated Communications (CIC)', 'Common Conference', 'The Board Room']
      },
      {
        floorName: 'Sixth Floor',
        northWing: ['Media Center (RIMPORT Office)', 'Animation Lab 1 and 2', 'Editing Bay', 'Audio Recording Studio'],
        southWing: ['UMak Performing Arts Theater (UPAT)', 'Dressing Rooms A and B']
      }
    ]
  },
  {
    id: 'hpsb',
    name: 'Health and Physical Science Building (HPSB)',
    code: 'HPSB',
    description: '12-story state-of-the-art facility for Allied Health, Law, Research, and University Athletics.',
    coordinates: { x: 74, y: 32 },
    color: '#21ADE3',
    floors: [
      {
        floorName: 'Ground to 4th Floor',
        rooms: ['Main Lobby', 'Multi-level Parking Area', 'Building Management System Office (401-402)']
      },
      {
        floorName: 'Fifth Floor',
        rooms: ['School of Law Dean’s Office', 'School of Law Library Learning Commons', 'Moot Court (504-505)', 'Lecture Rooms (506, 508-512)', 'Multimedia Room (507)']
      },
      {
        floorName: 'Sixth Floor',
        rooms: ['College of Allied Health Studies (CAHS)', 'Center of Imaging Health Sciences (CIHS)', 'Radiologic Technology Skills Lab (604-606)', 'Pharmacy Practice Laboratory (607-609)']
      },
      {
        floorName: 'Seventh Floor',
        rooms: ['Institute of Nursing Simulation Lab', 'Virtual Hospital Complex', 'Nursing Arts Laboratory', 'OB-GYN and Pediatric Ward Simulators']
      },
      {
        floorName: 'Eighth to 10th Floor',
        rooms: ['University Central Research Laboratories', 'Stem Cell & Biotechnology Research Center', 'Graduate Studies Lecture Rooms']
      },
      {
        floorName: 'Eleventh to 12th Floor',
        rooms: ['University Grand Auditorium', 'Executive Boardrooms', 'Skyline Skydeck Function Hall']
      }
    ]
  },
  {
    id: 'acad1',
    name: 'Academic Building 1',
    code: 'ACAD 1',
    description: 'College of Business and Financial Science, College of Technology Management, and University Clinic.',
    coordinates: { x: 21, y: 70 },
    color: '#D1CA25',
    floors: [
      {
        floorName: 'Ground Floor',
        rooms: ['Medical and Dental Clinic (MDC)', 'Emergency First Aid Station', 'Pharmacy Dispensary', 'Safety & Security Command Center']
      },
      {
        floorName: 'Second Floor',
        rooms: ['College of Business and Financial Science (CBFS) Dean’s Office', 'Faculty Room', 'Finance & Investment Simulation Lab (Rooms 201-208)']
      },
      {
        floorName: 'Third Floor',
        rooms: ['College of Technology Management (CTM)', 'Logistics & Supply Chain Management Lab', 'Lecture Rooms 301-314']
      }
    ]
  },
  {
    id: 'acad2',
    name: 'Academic Building 2',
    code: 'ACAD 2',
    description: 'College of Arts and Letters (CAL), College of Education (COE), Multimedia Classrooms.',
    coordinates: { x: 43, y: 70 },
    color: '#3F56CA',
    floors: [
      {
        floorName: 'Ground Floor',
        rooms: ['Center for Admission and Scholarship (CAS Extension)', 'Student Lounge', 'Printing and Photocopy Hub', 'Cooperative Store 2']
      },
      {
        floorName: 'Second Floor',
        rooms: ['College of Arts and Letters (CAL) Dean’s Office', 'Speech and Language Laboratory (Rooms 204-206)', 'Broadcasting Studio']
      },
      {
        floorName: 'Third Floor',
        rooms: ['College of Education (COE) Dean’s Office', 'Demonstration Classroom', 'Science & Chemistry Laboratory (Rooms 308-312)']
      }
    ]
  },
  {
    id: 'acad3',
    name: 'Academic Building 3',
    code: 'ACAD 3',
    description: 'CIT Office South Wing 2F, Computer Labs 1 to 8, College of Engineering and Technology.',
    coordinates: { x: 65, y: 70 },
    color: '#21ADE3',
    floors: [
      {
        floorName: 'Ground Floor',
        rooms: ['UMak Employees Multi-Purpose Cooperative', 'Audio-Visual Center (AVC)', 'Tagak Cafe Lounge']
      },
      {
        floorName: 'Second Floor (CIT South Wing)',
        northWing: ['Computer Laboratories 1 to 4', 'Network Systems Engineering Lab'],
        southWing: ['Center for Information Technology (CIT Office)', 'CCIS Dean’s Office', 'Computer Laboratories 5 to 8', 'Server Mainframe Operations']
      },
      {
        floorName: 'Third Floor',
        rooms: ['College of Engineering and Technology (CET)', 'CAD/CAM Laboratory', 'Robotics and Mechatronics Laboratory', 'Electronics Engineering Workstations']
      }
    ]
  },
  {
    id: 'stadium',
    name: 'UMak Stadium & Sports Complex',
    code: 'STADIUM',
    description: 'Olympic-size football pitch, 8-lane rubberized running track, Grandstand, and Athletics offices.',
    coordinates: { x: 85, y: 70 },
    color: '#EC202B',
    floors: [
      {
        floorName: 'Ground Level',
        rooms: ['Track and Field Oval', 'Football Stadium Pitch', 'Athletes Dressing and Shower Rooms', 'Center for Athletic Development (CAD)']
      },
      {
        floorName: 'Grandstand Level',
        rooms: ['VIP Viewing Lounge', 'Media Press Center', 'Judges and Officials Review Box', 'Physical Education Lecture Hall']
      }
    ]
  }
];

interface CampusMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLocation?: MapLocation | null;
  theme?: 'light' | 'dark';
}

export function InteractiveCampusMapModal({
  isOpen,
  onClose,
  targetLocation,
  theme,
}: CampusMapModalProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('admin');
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number>(0);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Pan and Zoom Gesture State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);

  // Draggable Bottom Sheet State on Mobile: 'collapsed' (64px) | 'half' (45vh) | 'full' (85vh)
  const [bottomSheetState, setBottomSheetState] = useState<'collapsed' | 'half' | 'full'>('half');
  const sheetDragStartY = useRef<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchDistRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);

  // Dynamic theme detection
  useEffect(() => {
    if (theme) {
      setIsDark(theme === 'dark');
      return;
    }
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [theme, isOpen]);

  // Center/Zoom to building coordinates
  const centerOnBuilding = useCallback((buildingId: string, zoom = 1.4) => {
    const b = BUILDINGS.find(item => item.id === buildingId);
    if (!b) return;
    setZoomLevel(zoom);
    // SVG coordinate space is 1000 x 700. Map center is 500, 350.
    const targetX = (500 - (b.coordinates.x * 10)) * 0.4;
    const targetY = (350 - (b.coordinates.y * 7)) * 0.4;
    setPanOffset({ x: targetX, y: targetY });
  }, []);

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Sync target location when opened (Auto-pan and Auto-zoom to target)
  useEffect(() => {
    if (targetLocation?.building) {
      const bLower = targetLocation.building.toLowerCase();
      let matchedBuilding = BUILDINGS.find(b => 
        bLower.includes(b.name.toLowerCase()) || 
        bLower.includes(b.code.toLowerCase()) ||
        (b.id === 'acad3' && (bLower.includes('cit') || bLower.includes('academic building 3') || bLower.includes('acad 3'))) ||
        (b.id === 'admin' && bLower.includes('admin')) ||
        (b.id === 'hpsb' && bLower.includes('hpsb'))
      );

      if (matchedBuilding) {
        setSelectedBuildingId(matchedBuilding.id);
        if (targetLocation.floor) {
          const fLower = targetLocation.floor.toLowerCase().replace(' floor', '').trim();
          const fIdx = matchedBuilding.floors.findIndex(f => 
            f.floorName.toLowerCase().includes(fLower)
          );
          if (fIdx !== -1) {
            setSelectedFloorIndex(fIdx);
          }
        }
        centerOnBuilding(matchedBuilding.id, 1.5);
      }
    } else {
      resetView();
    }
  }, [targetLocation, isOpen, centerOnBuilding]);

  // Touch Gesture Handlers (Pan + Pinch to Zoom + Double Tap)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap toggle zoom
        setZoomLevel(prev => (prev > 1.2 ? 1 : 1.8));
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setIsPanning(true);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && touchStartRef.current && isPanning) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && touchDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchDistRef.current;
      setZoomLevel(prev => Math.min(3.0, Math.max(0.9, prev * ratio)));
      touchDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    touchStartRef.current = null;
    touchDistRef.current = null;
  };

  // Bottom sheet drag gesture handlers
  const handleSheetTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    sheetDragStartY.current = e.touches[0].clientY;
  };

  const handleSheetTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (sheetDragStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - sheetDragStartY.current;
    if (deltaY < -40) {
      // Swiped UP
      setBottomSheetState(prev => (prev === 'collapsed' ? 'half' : 'full'));
    } else if (deltaY > 40) {
      // Swiped DOWN
      setBottomSheetState(prev => (prev === 'full' ? 'half' : 'collapsed'));
    }
    sheetDragStartY.current = null;
  };

  if (!isOpen) return null;

  const currentBuilding = BUILDINGS.find(b => b.id === selectedBuildingId) || BUILDINGS[0];
  const currentFloor = currentBuilding.floors[selectedFloorIndex] || currentBuilding.floors[0];

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md md:p-6 p-0 animate-in fade-in duration-200"
    >
      <div className="w-full md:max-w-5xl h-[100dvh] md:h-[90vh] md:max-h-[850px] md:rounded-2xl bg-white dark:bg-[#0B132B] shadow-2xl border-0 md:border md:border-slate-200 dark:md:border-[#1C2541] overflow-hidden flex flex-col relative">
        {/* Header Bar */}
        <div className="px-4 py-3 bg-white dark:bg-[#070D1E] border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 safe-area-top">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FC] dark:bg-[#1C2541] flex items-center justify-center text-[#3F56CA] dark:text-[#D1CA25] shadow-xs">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  UMak Campus Map
                </h2>
                <span className="px-2 py-0.5 text-[9px] md:text-[10px] font-bold rounded-full bg-[#3F56CA]/10 text-[#3F56CA] dark:bg-[#D1CA25]/20 dark:text-[#D1CA25]">
                  Source03 Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Interactive campus directory & floor plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close map visualizer"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition touch-min"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Location Alert Banner */}
        {targetLocation && (
          <div className="px-4 py-2 bg-gradient-to-r from-[#EEF2FC] to-blue-50 dark:from-[#1C2541] dark:to-[#0B132B] border-b border-[#3F56CA]/20 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium truncate">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC202B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EC202B]"></span>
              </span>
              <span className="truncate">
                Target: <strong className="text-[#3F56CA] dark:text-[#D1CA25]">{targetLocation.officeName}</strong>
              </span>
              <span className="text-slate-400 shrink-0">•</span>
              <span className="shrink-0">{targetLocation.floor}</span>
              {targetLocation.wing && (
                <>
                  <span className="text-slate-400 shrink-0">•</span>
                  <span className="shrink-0 font-semibold">{targetLocation.wing}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area: Split view on Desktop, Full map + Bottom Sheet on Mobile */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
          {/* Interactive Map Canvas Container */}
          <div 
            ref={mapContainerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
            className="flex-1 bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
          >
            {/* SVG Interactive Canvas with pan/zoom transform */}
            <div 
              style={{
                transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg 
                viewBox="0 0 1000 700" 
                className="w-full h-full max-h-[560px] object-contain drop-shadow-md dark:drop-shadow-2xl"
              >
                {/* Campus Ground */}
                <rect 
                  x="20" y="20" width="960" height="660" rx="24" 
                  fill={isDark ? "#0E182D" : "#FFFFFF"} 
                  stroke={isDark ? "#1E293B" : "#E2E8F0"} 
                  strokeWidth="3" 
                />
                
                {/* Campus Pathways */}
                <path 
                  d="M 60 550 L 940 550" 
                  stroke={isDark ? "#1E293B" : "#E2E8F0"} 
                  strokeWidth="40" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M 500 100 L 500 550" 
                  stroke={isDark ? "#1E293B" : "#E2E8F0"} 
                  strokeWidth="30" 
                  strokeLinecap="round" 
                />
                <circle 
                  cx="500" cy="350" r="85" 
                  fill={isDark ? "#13233F" : "#EEF2FC"} 
                  stroke="#3F56CA" 
                  strokeWidth="2" 
                  strokeDasharray="6 4" 
                />
                <text 
                  x="500" y="355" 
                  fill={isDark ? "#64748B" : "#475569"} 
                  fontSize="14" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  CAMPUS PLAZA
                </text>

                {/* 1. Admin Building */}
                <g 
                  onClick={() => { setSelectedBuildingId('admin'); setSelectedFloorIndex(0); }}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <rect 
                    x="280" y="180" width="220" height="180" rx="16" 
                    fill={selectedBuildingId === 'admin' ? '#3F56CA' : (isDark ? '#1E2B4C' : '#EEF2FC')}
                    stroke={selectedBuildingId === 'admin' ? '#D1CA25' : (isDark ? '#3B82F6' : '#93C5FD')}
                    strokeWidth={selectedBuildingId === 'admin' ? '4' : '2'}
                  />
                  <text 
                    x="390" y="260" 
                    fill={selectedBuildingId === 'admin' ? 'white' : (isDark ? 'white' : '#1E3A8A')} 
                    fontSize="18" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    ADMIN BUILDING
                  </text>
                  <text 
                    x="390" y="285" 
                    fill={selectedBuildingId === 'admin' ? '#FEE2E2' : (isDark ? '#94A3B8' : '#3B82F6')} 
                    fontSize="14" 
                    textAnchor="middle"
                  >
                    Registrar, Exec, Offices
                  </text>
                </g>

                {/* 2. HPSB Tower */}
                <g 
                  onClick={() => { setSelectedBuildingId('hpsb'); setSelectedFloorIndex(0); }}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <rect 
                    x="640" y="120" width="220" height="260" rx="16" 
                    fill={selectedBuildingId === 'hpsb' ? '#21ADE3' : (isDark ? '#162C46' : '#E0F2FE')}
                    stroke={selectedBuildingId === 'hpsb' ? '#D1CA25' : (isDark ? '#0EA5E9' : '#7DD3FC')}
                    strokeWidth={selectedBuildingId === 'hpsb' ? '4' : '2'}
                  />
                  <text 
                    x="750" y="240" 
                    fill={selectedBuildingId === 'hpsb' ? 'white' : (isDark ? 'white' : '#0369A1')} 
                    fontSize="18" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    HPSB TOWER
                  </text>
                  <text 
                    x="750" y="265" 
                    fill={selectedBuildingId === 'hpsb' ? '#F0FDFA' : (isDark ? '#94A3B8' : '#0284C7')} 
                    fontSize="14" 
                    textAnchor="middle"
                  >
                    12 Floors • Law, Health
                  </text>
                </g>

                {/* 3. Academic Building 1 */}
                <g 
                  onClick={() => { setSelectedBuildingId('acad1'); setSelectedFloorIndex(0); }}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <rect 
                    x="120" y="440" width="180" height="140" rx="14" 
                    fill={selectedBuildingId === 'acad1' ? '#D1CA25' : (isDark ? '#2D2D1B' : '#FEF9C3')}
                    stroke={selectedBuildingId === 'acad1' ? (isDark ? '#FFFFFF' : '#1E293B') : (isDark ? '#854D0E' : '#FDE047')}
                    strokeWidth={selectedBuildingId === 'acad1' ? '4' : '2'}
                  />
                  <text 
                    x="210" y="505" 
                    fill={selectedBuildingId === 'acad1' ? '#1E293B' : (isDark ? 'white' : '#854D0E')} 
                    fontSize="16" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    ACADEMIC 1
                  </text>
                  <text 
                    x="210" y="528" 
                    fill={selectedBuildingId === 'acad1' ? '#334155' : (isDark ? '#A3A3A3' : '#A16207')} 
                    fontSize="14" 
                    textAnchor="middle"
                  >
                    Clinic & CBFS
                  </text>
                </g>

                {/* 4. Academic Building 2 */}
                <g 
                  onClick={() => { setSelectedBuildingId('acad2'); setSelectedFloorIndex(0); }}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <rect 
                    x="340" y="440" width="180" height="140" rx="14" 
                    fill={selectedBuildingId === 'acad2' ? '#3F56CA' : (isDark ? '#1C2541' : '#EEF2FC')}
                    stroke={selectedBuildingId === 'acad2' ? '#D1CA25' : (isDark ? '#475569' : '#BFDBFE')}
                    strokeWidth={selectedBuildingId === 'acad2' ? '4' : '2'}
                  />
                  <text 
                    x="430" y="505" 
                    fill={selectedBuildingId === 'acad2' ? 'white' : (isDark ? 'white' : '#1E3A8A')} 
                    fontSize="16" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    ACADEMIC 2
                  </text>
                  <text 
                    x="430" y="528" 
                    fill={selectedBuildingId === 'acad2' ? '#FEE2E2' : (isDark ? '#94A3B8' : '#3B82F6')} 
                    fontSize="14" 
                    textAnchor="middle"
                  >
                    CAL, COE, Labs
                  </text>
                </g>

                {/* 5. Academic Building 3 (CIT Office Location) */}
                <g 
                  onClick={() => { setSelectedBuildingId('acad3'); setSelectedFloorIndex(0); }}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <rect 
                    x="560" y="440" width="180" height="140" rx="14" 
                    fill={selectedBuildingId === 'acad3' ? '#21ADE3' : (isDark ? '#162C46' : '#E0F2FE')}
                    stroke={selectedBuildingId === 'acad3' ? '#D1CA25' : (isDark ? '#475569' : '#BAE6FD')}
                    strokeWidth={selectedBuildingId === 'acad3' ? '4' : '2'}
                  />
                  <text 
                    x="650" y="505" 
                    fill={selectedBuildingId === 'acad3' ? 'white' : (isDark ? 'white' : '#0369A1')} 
                    fontSize="16" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    ACADEMIC 3
                  </text>
                  <text 
                    x="650" y="528" 
                    fill={selectedBuildingId === 'acad3' ? '#F0FDFA' : (isDark ? '#94A3B8' : '#0284C7')} 
                    fontSize="14" 
                    textAnchor="middle"
                  >
                    CIT Office • CCIS
                  </text>
                </g>

                {/* 6. UMak Stadium */}
                <g 
                  onClick={() => { setSelectedBuildingId('stadium'); setSelectedFloorIndex(0); }}
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <ellipse 
                    cx="850" cy="510" rx="90" ry="70" 
                    fill={selectedBuildingId === 'stadium' ? '#EC202B' : (isDark ? '#331B22' : '#FFE4E6')}
                    stroke={selectedBuildingId === 'stadium' ? '#D1CA25' : (isDark ? '#7F1D1D' : '#FECDD3')}
                    strokeWidth={selectedBuildingId === 'stadium' ? '4' : '2'}
                  />
                  <text 
                    x="850" y="510" 
                    fill={selectedBuildingId === 'stadium' ? 'white' : (isDark ? 'white' : '#9F1239')} 
                    fontSize="15" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    UMAK STADIUM
                  </text>
                  <text 
                    x="850" y="532" 
                    fill={selectedBuildingId === 'stadium' ? '#FEE2E2' : (isDark ? '#E2E8F0' : '#E11D48')} 
                    fontSize="13" 
                    textAnchor="middle"
                  >
                    Oval & Sports
                  </text>
                </g>

                {/* Active Pulsing Pin on Selected Building */}
                <g transform={`translate(${
                  selectedBuildingId === 'admin' ? 390 :
                  selectedBuildingId === 'hpsb' ? 750 :
                  selectedBuildingId === 'acad1' ? 210 :
                  selectedBuildingId === 'acad2' ? 430 :
                  selectedBuildingId === 'acad3' ? 650 : 850
                }, ${
                  selectedBuildingId === 'admin' ? 200 :
                  selectedBuildingId === 'hpsb' ? 150 :
                  selectedBuildingId === 'acad1' ? 460 :
                  selectedBuildingId === 'acad2' ? 460 :
                  selectedBuildingId === 'acad3' ? 460 : 470
                })`}>
                  <circle cx="0" cy="0" r="30" fill="#EC202B" opacity="0.35" className="animate-ping" />
                  <circle cx="0" cy="0" r="15" fill="#EC202B" stroke="#FFFFFF" strokeWidth="3" />
                  <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
                </g>
              </svg>
            </div>

            {/* Floating Mobile/Desktop Gesture Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => setZoomLevel(z => Math.min(3.0, z + 0.3))}
                aria-label="Zoom in"
                className="w-11 h-11 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 active:scale-95 transition"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoomLevel(z => Math.max(0.8, z - 0.3))}
                aria-label="Zoom out"
                className="w-11 h-11 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 active:scale-95 transition"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={resetView}
                aria-label="Reset zoom and center view"
                className="w-11 h-11 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 active:scale-95 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Touch Tip Indicator */}
            <div className="md:hidden absolute top-4 left-4 bg-slate-900/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-full pointer-events-none">
              Pinch to zoom • Drag to pan
            </div>
          </div>

          {/* Desktop Right Side Panel / Mobile Draggable Bottom Sheet */}
          <div 
            onTouchStart={handleSheetTouchStart}
            onTouchEnd={handleSheetTouchEnd}
            className={`
              w-full md:w-80 lg:w-96 bg-white dark:bg-[#0B132B] flex flex-col shrink-0 overflow-hidden shadow-xl
              md:relative md:h-auto md:border-l md:border-slate-200 md:dark:border-white/10
              fixed bottom-0 left-0 right-0 z-20 rounded-t-2xl md:rounded-none border-t border-slate-200 dark:border-white/10
              transition-all duration-300 ease-in-out safe-area-bottom
              ${bottomSheetState === 'collapsed' ? 'max-h-[72px]' : bottomSheetState === 'half' ? 'max-h-[48vh]' : 'max-h-[85vh]'}
              md:max-h-none
            `}
          >
            {/* Mobile Draggable Pill Handle */}
            <div 
              onClick={() => setBottomSheetState(prev => prev === 'collapsed' ? 'half' : prev === 'half' ? 'full' : 'collapsed')}
              className="md:hidden flex flex-col items-center justify-center pt-2 pb-1 cursor-pointer select-none"
            >
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mb-1"></div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>{currentBuilding.name}</span>
                {bottomSheetState === 'collapsed' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Building Header Card */}
            <div className="p-3 md:p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070D1E] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F56CA] dark:text-[#D1CA25] block">
                  {currentBuilding.code} • {currentBuilding.floors.length} Floors
                </span>
                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {currentBuilding.name}
                </h3>
              </div>
              <button
                onClick={() => centerOnBuilding(currentBuilding.id, 1.8)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#3F56CA] dark:text-blue-300 font-semibold text-xs border border-blue-200 dark:border-blue-900/60 flex items-center gap-1 touch-min"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Center</span>
              </button>
            </div>

            {/* Floor Selector Horizontal Carousel */}
            <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 bg-white dark:bg-[#0B132B]">
              {currentBuilding.floors.map((floor, idx) => (
                <button
                  key={floor.floorName}
                  onClick={() => setSelectedFloorIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 touch-min ${
                    selectedFloorIndex === idx
                      ? 'bg-[#3F56CA] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {floor.floorName}
                </button>
              ))}
            </div>

            {/* Floor Contents Directory */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs overscroll-contain">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#3F56CA] dark:text-[#D1CA25]" />
                  {currentFloor.floorName}
                </span>
              </div>

              {/* If Floor has North & South Wings */}
              {currentFloor.northWing && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    North Wing
                  </span>
                  <div className="space-y-1 pl-1">
                    {currentFloor.northWing.map((office, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                          targetLocation?.officeName && office.toLowerCase().includes(targetLocation.officeName.toLowerCase().replace(/\s*\(.*\)/, ''))
                            ? 'bg-[#EEF2FC] dark:bg-[#3F56CA]/20 border-[#3F56CA] text-[#3F56CA] dark:text-[#D1CA25] font-semibold'
                            : 'bg-slate-50 dark:bg-[#1C2541]/40 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-[#3F56CA] dark:text-[#21ADE3] shrink-0 mt-0.5" />
                        <span className="text-xs leading-snug">{office}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentFloor.southWing && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    South Wing
                  </span>
                  <div className="space-y-1 pl-1">
                    {currentFloor.southWing.map((office, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                          targetLocation?.officeName && office.toLowerCase().includes(targetLocation.officeName.toLowerCase().replace(/\s*\(.*\)/, ''))
                            ? 'bg-[#EEF2FC] dark:bg-[#3F56CA]/20 border-[#3F56CA] text-[#3F56CA] dark:text-[#D1CA25] font-semibold'
                            : 'bg-slate-50 dark:bg-[#1C2541]/40 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-[#3F56CA] dark:text-[#21ADE3] shrink-0 mt-0.5" />
                        <span className="text-xs leading-snug">{office}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* If Floor has generic room list */}
              {currentFloor.rooms && (
                <div className="space-y-1 pl-1">
                  {currentFloor.rooms.map((room, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                        targetLocation?.officeName && room.toLowerCase().includes(targetLocation.officeName.toLowerCase())
                          ? 'bg-[#EEF2FC] dark:bg-[#3F56CA]/20 border-[#3F56CA] text-[#3F56CA] dark:text-[#D1CA25] font-semibold'
                          : 'bg-slate-50 dark:bg-[#1C2541]/40 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-[#3F56CA] dark:text-[#21ADE3] shrink-0 mt-0.5" />
                      <span className="text-xs leading-snug">{room}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
