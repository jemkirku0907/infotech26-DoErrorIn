'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Building2, 
  Layers, 
  Compass, 
  Info, 
  CheckCircle2,
  ChevronRight
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
    description: 'Central administrative offices, Registrar, CIT, Executive offices, and Academic deans.',
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
        rooms: ['Lecture Rooms (601-605, 607-614)', 'Computer Laboratory (606)', 'Skills Laboratory (615, 617)', 'Student Center']
      },
      {
        floorName: 'Seventh Floor',
        rooms: ['Simulated Hospital', 'Laboratories (708-709)', 'Skills Laboratories (710, 712)', 'Multimedia Room (701)']
      },
      {
        floorName: 'Eighth Floor',
        rooms: ['Lecture Rooms (801-805, 807-814)', 'Computer Laboratory (806)', 'Skills Laboratory (815, 817)']
      },
      {
        floorName: 'Ninth Floor',
        rooms: ['Central Laboratory', 'Pharmacy Laboratory', 'Center for Research Ethics (CRE)', 'Center for Research Management', 'Center for Extension and Development']
      },
      {
        floorName: 'Tenth Floor',
        rooms: ['Lecture Rooms (1001-1005, 1007-1011)', 'Computer Laboratory (1006)', 'Student Center', 'Multimedia Room (1012)']
      },
      {
        floorName: 'Eleventh Floor',
        rooms: ['Fitness Gym', 'Aero Dance Studio', 'Dance Studio', 'Sauna', 'Cafeteria', 'Clinic', '1101 Multimedia Room']
      },
      {
        floorName: 'Twelfth Floor',
        rooms: ['Basketball Court', 'Volleyball Court', 'PE Department', 'Shower & Locker Rooms']
      }
    ]
  },
  {
    id: 'acad1',
    name: 'Academic Building 1',
    code: 'ACAD 1',
    description: 'Heron’s Hostel, Technical Education, Skills Labs, and NROTC unit.',
    coordinates: { x: 22, y: 72 },
    color: '#D1CA25',
    floors: [
      { floorName: 'First Floor', rooms: ['University Facilities Management Office (UFMO)'] },
      { floorName: 'Second Floor', rooms: ['240th NROTC Unit'] },
      { floorName: 'Third Floor', rooms: ['Institute for Technical Education and Skills Training', 'Skills Laboratories'] },
      { floorName: 'Fourth Floor', rooms: ['Heron’s Hostel: Suite Rooms, Dormitories, Laundry Area, Cafe'] }
    ]
  },
  {
    id: 'acad2',
    name: 'Academic Building 2',
    code: 'ACAD 2',
    description: 'Center for Admissions and Scholarships (CAS), Psychology, Guidance, and Computer Labs.',
    coordinates: { x: 42, y: 72 },
    color: '#3F56CA',
    floors: [
      { floorName: 'First Floor', rooms: ['Center for Admissions and Scholarships (CAS)', 'UMak Scholars Society (106-108)', 'Computer Lab (101-103, 105, 109-110, 112)', 'Psychology Lab (104)', 'Instructional Media Room (111)'] },
      { floorName: 'Second Floor', rooms: ['Guidance Office (205-207, 209, 211)', 'Accounting Lab (208)', 'Steno Lab (210)', 'Business Simulation Lab (212)', 'Lecture Rooms (201-206)'] },
      { floorName: 'Third Floor', rooms: ['College of Innovative Teachers Education (CITE) (303, 305)', 'Higher School ng UMak Registrar (307)', 'Lecture Rooms (301-302, 304, 306, 308-312)'] },
      { floorName: 'Fourth Floor', rooms: ['Higher School ng UMak Lab (401, 403, 405)', 'Audio Visual Room (AVR)', 'Institute for Social Development and Nation Building (ISDNB) (411)', 'NROTC Office (402)'] }
    ]
  },
  {
    id: 'acad3',
    name: 'Academic Building 3',
    code: 'ACAD 3',
    description: 'College of Business & Financial Sciences, CTHM, Tagak Cafe, and Kitchen Laboratories.',
    coordinates: { x: 62, y: 72 },
    color: '#21ADE3',
    floors: [
      { floorName: 'First Floor', rooms: ['UMak Coop Office (108)', 'Tagak Cafe (111)', 'Kitchen Laboratories (109-112)', 'Multi-Purpose Room (105-107)', 'Computer Lab (101-104)'] },
      { floorName: 'Second Floor', rooms: ['College of Tourism and Hospitality Management (CTHM) Dean’s Office (211)', 'CTHM Faculty Office (209)', 'CBFS Simulation Room (207)', 'Lecture Rooms (201-206, 208, 210, 212)'] },
      { floorName: 'Third Floor', rooms: ['Lecture Rooms (301-312)'] },
      { floorName: 'Fourth Floor', rooms: ['Lecture Rooms (401-416)'] }
    ]
  },
  {
    id: 'stadium',
    name: 'University of Makati Stadium',
    code: 'STADIUM',
    description: 'Standard track and field oval, athletic field, and housekeeping.',
    coordinates: { x: 80, y: 72 },
    color: '#EC202B',
    floors: [
      { floorName: 'Oval & Grounds', rooms: ['Track and Field Oval', 'Guard House', 'Housekeeping Facility'] }
    ]
  }
];

interface InteractiveCampusMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLocation?: MapLocation | null;
  theme?: 'light' | 'dark';
}

export function InteractiveCampusMapModal({
  isOpen,
  onClose,
  targetLocation,
  theme
}: InteractiveCampusMapModalProps) {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('admin');
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number>(0);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Dynamic theme detection (respects prop or html.dark class)
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

  // Sync target location when opened
  useEffect(() => {
    if (targetLocation?.building) {
      const bLower = targetLocation.building.toLowerCase();
      let matchedBuilding = BUILDINGS.find(b => 
        bLower.includes(b.name.toLowerCase()) || 
        bLower.includes(b.code.toLowerCase()) ||
        (b.id === 'admin' && bLower.includes('admin')) ||
        (b.id === 'hpsb' && bLower.includes('hpsb'))
      );

      if (matchedBuilding) {
        setSelectedBuildingId(matchedBuilding.id);
        // Find matching floor
        if (targetLocation.floor) {
          const fLower = targetLocation.floor.toLowerCase().replace(' floor', '').trim();
          const fIdx = matchedBuilding.floors.findIndex(f => 
            f.floorName.toLowerCase().includes(fLower)
          );
          if (fIdx !== -1) {
            setSelectedFloorIndex(fIdx);
          }
        }
      }
    }
  }, [targetLocation, isOpen]);

  if (!isOpen) return null;

  const currentBuilding = BUILDINGS.find(b => b.id === selectedBuildingId) || BUILDINGS[0];
  const currentFloor = currentBuilding.floors[selectedFloorIndex] || currentBuilding.floors[0];

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 md:p-6 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-5xl h-[90vh] max-h-[850px] rounded-2xl bg-white dark:bg-[#0B132B] shadow-2xl border border-slate-200 dark:border-[#1C2541] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-white dark:bg-[#070D1E] border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FC] dark:bg-[#1C2541] flex items-center justify-center text-[#3F56CA] dark:text-[#D1CA25] shadow-xs">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  UMak Campus Map & Location Visualizer
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#3F56CA]/10 text-[#3F56CA] dark:bg-[#D1CA25]/20 dark:text-[#D1CA25]">
                  Source03.pdf Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive building pin visualizer and room directory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close map visualizer"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Location Alert Banner */}
        {targetLocation && (
          <div className="px-5 py-2.5 bg-[#EEF2FC] dark:bg-[#1C2541]/80 border-b border-[#3F56CA]/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC202B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EC202B]"></span>
              </span>
              <span>
                Target: <strong className="text-[#3F56CA] dark:text-[#D1CA25]">{targetLocation.officeName}</strong>
              </span>
              <span className="text-slate-400">•</span>
              <span>{targetLocation.floor}</span>
              {targetLocation.wing && (
                <>
                  <span className="text-slate-400">•</span>
                  <span>{targetLocation.wing}</span>
                </>
              )}
              <span className="text-slate-400">•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{targetLocation.building}</span>
            </div>
          </div>
        )}

        {/* Main Content Area: Split into Visual Map & Directory Panel */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Visual Campus Map (Left / Top) */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-900 relative p-4 flex flex-col items-center justify-center overflow-hidden select-none border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 transition-colors">
            {/* Campus SVG Graphic */}
            <svg 
              viewBox="0 0 1000 700" 
              className="w-full h-full max-h-[460px] object-contain drop-shadow-md dark:drop-shadow-2xl transition-all"
            >
              {/* Ground & Campus Pathways */}
              <rect 
                x="20" y="20" width="960" height="660" rx="24" 
                fill={isDark ? "#0E182D" : "#FFFFFF"} 
                stroke={isDark ? "#1E293B" : "#E2E8F0"} 
                strokeWidth="3" 
              />
              
              {/* Campus Roads & Open Plaza */}
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
                stroke={isDark ? "#3F56CA" : "#3F56CA"} 
                strokeWidth="2" 
                strokeDasharray="6 4" 
              />
              <text 
                x="500" y="355" 
                fill={isDark ? "#64748B" : "#475569"} 
                fontSize="14" 
                fontWeight="600" 
                textAnchor="middle"
              >
                CAMPUS PLAZA
              </text>

              {/* Building Blocks */}
              {/* 1. Admin Building */}
              <g 
                onClick={() => { setSelectedBuildingId('admin'); setSelectedFloorIndex(0); }}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <rect 
                  x="280" y="180" width="220" height="180" rx="16" 
                  fill={
                    selectedBuildingId === 'admin' 
                      ? '#3F56CA' 
                      : (isDark ? '#1E2B4C' : '#EEF2FC')
                  }
                  stroke={
                    selectedBuildingId === 'admin' 
                      ? '#D1CA25' 
                      : (isDark ? '#3B82F6' : '#93C5FD')
                  }
                  strokeWidth={selectedBuildingId === 'admin' ? '4' : '2'}
                  filter={isDark ? "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" : "drop-shadow(0 4px 8px rgba(63,86,202,0.15))"}
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
                  fill={
                    selectedBuildingId === 'admin' 
                      ? '#FEE2E2' 
                      : (isDark ? '#94A3B8' : '#3B82F6')
                  } 
                  fontSize="12" 
                  textAnchor="middle"
                >
                  Registrar, CIT, Exec
                </text>
              </g>

              {/* 2. HPSB */}
              <g 
                onClick={() => { setSelectedBuildingId('hpsb'); setSelectedFloorIndex(0); }}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <rect 
                  x="640" y="120" width="220" height="260" rx="16" 
                  fill={
                    selectedBuildingId === 'hpsb' 
                      ? '#21ADE3' 
                      : (isDark ? '#162C46' : '#E0F2FE')
                  }
                  stroke={
                    selectedBuildingId === 'hpsb' 
                      ? '#D1CA25' 
                      : (isDark ? '#0EA5E9' : '#7DD3FC')
                  }
                  strokeWidth={selectedBuildingId === 'hpsb' ? '4' : '2'}
                  filter={isDark ? "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" : "drop-shadow(0 4px 8px rgba(33,173,227,0.15))"}
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
                  fill={
                    selectedBuildingId === 'hpsb' 
                      ? '#F0FDFA' 
                      : (isDark ? '#94A3B8' : '#0284C7')
                  } 
                  fontSize="12" 
                  textAnchor="middle"
                >
                  12 Floors • Law, Gym, Health
                </text>
              </g>

              {/* 3. Academic Building 1 */}
              <g 
                onClick={() => { setSelectedBuildingId('acad1'); setSelectedFloorIndex(0); }}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <rect 
                  x="120" y="440" width="180" height="140" rx="14" 
                  fill={
                    selectedBuildingId === 'acad1' 
                      ? '#D1CA25' 
                      : (isDark ? '#2D2D1B' : '#FEF9C3')
                  }
                  stroke={
                    selectedBuildingId === 'acad1' 
                      ? (isDark ? '#FFFFFF' : '#1E293B') 
                      : (isDark ? '#854D0E' : '#FDE047')
                  }
                  strokeWidth={selectedBuildingId === 'acad1' ? '4' : '2'}
                  filter={isDark ? "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" : "drop-shadow(0 4px 8px rgba(209,202,37,0.15))"}
                />
                <text 
                  x="210" y="505" 
                  fill={selectedBuildingId === 'acad1' ? '#1E293B' : (isDark ? 'white' : '#854D0E')} 
                  fontSize="15" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  ACADEMIC 1
                </text>
                <text 
                  x="210" y="525" 
                  fill={selectedBuildingId === 'acad1' ? '#334155' : (isDark ? '#A3A3A3' : '#A16207')} 
                  fontSize="11" 
                  textAnchor="middle"
                >
                  Hostel & NROTC
                </text>
              </g>

              {/* 4. Academic Building 2 */}
              <g 
                onClick={() => { setSelectedBuildingId('acad2'); setSelectedFloorIndex(0); }}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <rect 
                  x="340" y="440" width="180" height="140" rx="14" 
                  fill={
                    selectedBuildingId === 'acad2' 
                      ? '#3F56CA' 
                      : (isDark ? '#1C2541' : '#EEF2FC')
                  }
                  stroke={
                    selectedBuildingId === 'acad2' 
                      ? '#D1CA25' 
                      : (isDark ? '#475569' : '#BFDBFE')
                  }
                  strokeWidth={selectedBuildingId === 'acad2' ? '4' : '2'}
                  filter={isDark ? "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" : "drop-shadow(0 4px 8px rgba(63,86,202,0.15))"}
                />
                <text 
                  x="430" y="505" 
                  fill={selectedBuildingId === 'acad2' ? 'white' : (isDark ? 'white' : '#1E3A8A')} 
                  fontSize="15" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  ACADEMIC 2
                </text>
                <text 
                  x="430" y="525" 
                  fill={selectedBuildingId === 'acad2' ? '#FEE2E2' : (isDark ? '#94A3B8' : '#3B82F6')} 
                  fontSize="11" 
                  textAnchor="middle"
                >
                  CAS Scholarships & Labs
                </text>
              </g>

              {/* 5. Academic Building 3 */}
              <g 
                onClick={() => { setSelectedBuildingId('acad3'); setSelectedFloorIndex(0); }}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <rect 
                  x="560" y="440" width="180" height="140" rx="14" 
                  fill={
                    selectedBuildingId === 'acad3' 
                      ? '#21ADE3' 
                      : (isDark ? '#162C46' : '#E0F2FE')
                  }
                  stroke={
                    selectedBuildingId === 'acad3' 
                      ? '#D1CA25' 
                      : (isDark ? '#475569' : '#BAE6FD')
                  }
                  strokeWidth={selectedBuildingId === 'acad3' ? '4' : '2'}
                  filter={isDark ? "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" : "drop-shadow(0 4px 8px rgba(33,173,227,0.15))"}
                />
                <text 
                  x="650" y="505" 
                  fill={selectedBuildingId === 'acad3' ? 'white' : (isDark ? 'white' : '#0369A1')} 
                  fontSize="15" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  ACADEMIC 3
                </text>
                <text 
                  x="650" y="525" 
                  fill={selectedBuildingId === 'acad3' ? '#F0FDFA' : (isDark ? '#94A3B8' : '#0284C7')} 
                  fontSize="11" 
                  textAnchor="middle"
                >
                  CBFS, CTHM, Tagak Cafe
                </text>
              </g>

              {/* 6. UMak Stadium */}
              <g 
                onClick={() => { setSelectedBuildingId('stadium'); setSelectedFloorIndex(0); }}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <ellipse 
                  cx="850" cy="510" rx="90" ry="70" 
                  fill={
                    selectedBuildingId === 'stadium' 
                      ? '#EC202B' 
                      : (isDark ? '#331B22' : '#FFE4E6')
                  }
                  stroke={
                    selectedBuildingId === 'stadium' 
                      ? '#D1CA25' 
                      : (isDark ? '#7F1D1D' : '#FECDD3')
                  }
                  strokeWidth={selectedBuildingId === 'stadium' ? '4' : '2'}
                  filter={isDark ? "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" : "drop-shadow(0 4px 8px rgba(236,32,43,0.15))"}
                />
                <text 
                  x="850" y="510" 
                  fill={selectedBuildingId === 'stadium' ? 'white' : (isDark ? 'white' : '#9F1239')} 
                  fontSize="14" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  UMAK STADIUM
                </text>
                <text 
                  x="850" y="530" 
                  fill={selectedBuildingId === 'stadium' ? '#FEE2E2' : (isDark ? '#E2E8F0' : '#E11D48')} 
                  fontSize="10" 
                  textAnchor="middle"
                >
                  Oval & Track
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
                <circle cx="0" cy="0" r="28" fill="#EC202B" opacity="0.3" className="animate-ping" />
                <circle cx="0" cy="0" r="14" fill="#EC202B" stroke="#FFFFFF" strokeWidth="3" />
                <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
              </g>
            </svg>

            {/* Quick Map Legend */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 shadow-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EC202B] inline-block animate-pulse"></span>
                Active Pin Selection
              </span>
              <span>Click any building on map or list to inspect floors</span>
            </div>
          </div>

          {/* Directory & Floor Inspector Panel (Right / Bottom) */}
          <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-[#0B132B] flex flex-col shrink-0 overflow-hidden">
            {/* Building Header Card */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070D1E]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F56CA] dark:text-[#D1CA25]">
                  {currentBuilding.code}
                </span>
                <span className="text-xs text-slate-400">
                  {currentBuilding.floors.length} Floors
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {currentBuilding.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {currentBuilding.description}
              </p>
            </div>

            {/* Floor Selector Tabs */}
            <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 bg-white dark:bg-[#0B132B]">
              {currentBuilding.floors.map((floor, idx) => (
                <button
                  key={floor.floorName}
                  onClick={() => setSelectedFloorIndex(idx)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 ${
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2">
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
                        className={`p-2 rounded-lg border flex items-start gap-2 ${
                          targetLocation?.officeName && office.toLowerCase().includes(targetLocation.officeName.toLowerCase().replace(/\s*\(.*\)/, ''))
                            ? 'bg-[#EEF2FC] dark:bg-[#3F56CA]/20 border-[#3F56CA] text-[#3F56CA] dark:text-[#D1CA25] font-semibold'
                            : 'bg-slate-50 dark:bg-[#1C2541]/40 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#3F56CA] dark:text-[#21ADE3] shrink-0 mt-0.5" />
                        <span>{office}</span>
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
                        className={`p-2 rounded-lg border flex items-start gap-2 ${
                          targetLocation?.officeName && office.toLowerCase().includes(targetLocation.officeName.toLowerCase().replace(/\s*\(.*\)/, ''))
                            ? 'bg-[#EEF2FC] dark:bg-[#3F56CA]/20 border-[#3F56CA] text-[#3F56CA] dark:text-[#D1CA25] font-semibold'
                            : 'bg-slate-50 dark:bg-[#1C2541]/40 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#3F56CA] dark:text-[#21ADE3] shrink-0 mt-0.5" />
                        <span>{office}</span>
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
                      className={`p-2 rounded-lg border flex items-start gap-2 ${
                        targetLocation?.officeName && room.toLowerCase().includes(targetLocation.officeName.toLowerCase())
                          ? 'bg-[#EEF2FC] dark:bg-[#3F56CA]/20 border-[#3F56CA] text-[#3F56CA] dark:text-[#D1CA25] font-semibold'
                          : 'bg-slate-50 dark:bg-[#1C2541]/40 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#3F56CA] dark:text-[#21ADE3] shrink-0 mt-0.5" />
                      <span>{room}</span>
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
