import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle, 
  Settings, 
  ChevronRight, 
  LogOut,
  UserCircle,
  TrendingUp,
  AlertCircle,
  Upload,
  Database,
  History,
  Save,
  Download,
  Calendar,
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  ClipboardList,
  ChevronDown,
  Wrench
} from 'lucide-react';

// Shared Utilities
import { cn } from './utils/cn';

const API_URL = 'http://localhost:3000/api';

// Internal Components
import ExcelReportView from './components/ExcelReportView';
import AnalysisByCategoryTable from './components/AnalysisByCategoryTable';
import ProductionMatrixTable from './components/ProductionMatrixTable';
import CostSummaryTable from './components/CostSummaryTable';
import HistoryModule from './components/HistoryModule';
import ProjectManager from './components/ProjectManager';
import StructureManager from './components/StructureManager';
import ConfigModule from './components/ConfigModule';
import { parseCostReport } from './services/ExcelBridge';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isMantenedoresOpen, setIsMantenedoresOpen] = useState(
    ['obras', 'estructuras', 'configuracion'].includes(activeTab)
  );

  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analisis', label: 'Análisis Técnico', icon: Database },
    { id: 'historial', label: 'Historial / Backups', icon: History },
  ];

  const maintenanceItems = [
    { id: 'obras', label: 'Gestión de Obras', icon: Building2 },
    { id: 'estructuras', label: 'Estructuras', icon: ClipboardList },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="w-[260px] h-screen bg-[#0f172a] border-r border-[#1e293b] flex flex-col p-4 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          C
        </div>
        <h1 className="text-xl font-black font-heading text-white tracking-tight uppercase tracking-tighter">COST PRO <span className="text-blue-500">v3.3</span></h1>
      </div>

      <nav className="flex-1 space-y-1">
        {mainMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'analisis') {
                window.dispatchEvent(new CustomEvent('resetAnalysisView'));
              }
              setActiveTab(item.id);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative",
              activeTab === item.id 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-blue-400")} />
            <span className="font-extrabold text-[12px] uppercase tracking-widest">{item.label}</span>
            {activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
          </button>
        ))}

        {/* Mantenedores Dropdown */}
        <div className="mt-4 pt-4 border-t border-[#1e293b]">
          <button
            onClick={() => setIsMantenedoresOpen(!isMantenedoresOpen)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group",
              isMantenedoresOpen ? "text-white" : "text-slate-400 hover:text-white"
            )}
          >
            <Wrench size={20} className={cn(isMantenedoresOpen ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400")} />
            <span className="font-extrabold text-[12px] uppercase tracking-widest">Mantenedores</span>
            <ChevronDown size={16} className={cn("ml-auto transition-transform duration-300", isMantenedoresOpen && "rotate-180")} />
          </button>
          
          <div className={cn(
            "overflow-hidden transition-all duration-300 space-y-1 mt-1 origin-top",
            isMantenedoresOpen ? "max-h-[300px] opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"
          )}>
            {maintenanceItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 pl-11 pr-4 py-3 rounded-xl transition-all duration-300 group text-[11px] font-bold uppercase tracking-widest",
                  activeTab === item.id 
                    ? "text-blue-400 bg-blue-400/5 shadow-sm" 
                    : "text-slate-500 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#1e293b]">
           <button
            onClick={() => setActiveTab('reporte1')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative",
              activeTab === 'reporte1' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <FileText size={20} className="text-slate-500" />
            <span className="font-extrabold text-[12px] uppercase tracking-widest">Informes</span>
          </button>
          <button
            onClick={() => setActiveTab('aprobaciones')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative",
              activeTab === 'aprobaciones' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <CheckCircle size={20} className="text-slate-500" />
            <span className="font-extrabold text-[12px] uppercase tracking-widest">Aprobaciones</span>
          </button>
        </div>
      </nav>

      <div className="mt-auto border-t border-[#1e293b] pt-6 pb-2">
        <div className="flex items-center gap-3 px-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
             <UserCircle className="text-slate-500" size={24} />
          </div>
          <div>
            <p className="text-[11px] font-black text-white uppercase tracking-tighter">Director de Proyecto</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">EISA INFRAESTRUCTURA</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors uppercase text-[10px] font-black tracking-widest">
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
    const stats = [
      { label: "Proyectos en Curso", value: "08", sub: "Actualizado hoy", icon: LayoutDashboard , color: "text-blue-500" },
      { label: "Cierres Procesados", value: "24", sub: "Marzo 2026", icon: History, color: "text-emerald-500" },
      { label: "Alertas Activas", value: "03", sub: "Requieren revisión", icon: AlertCircle, color: "text-amber-500" },
    ];
  
    return (
      <div className="animate-fade-in pb-20">
        <div className="flex justify-between items-end mb-10">
           <div className="space-y-1">
             <div className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black w-fit mb-4 animate-pulse">EIMI-CUB: V3.3</div>
             <h2 className="text-4xl font-black font-heading text-slate-900 tracking-tight uppercase leading-none">Dashboard <span className="text-blue-600">Corporativo</span></h2>
             <p className="text-slate-500 font-bold opacity-70 italic">Bienvenido, Jefe de OT. Tienes 3 informes pendientes de revisión técnica.</p>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Fecha de Sesión</p>
              <p className="text-sm font-black text-slate-600">13 ABRIL, 2026</p>
           </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-10">
           {stats.map((s, i) => (
             <div key={i} className="glass bg-white p-8 border-slate-100 shadow-sm relative overflow-hidden group hover:translate-y-[-4px] transition-all">
                <div className={cn("p-4 rounded-3xl bg-slate-50 mb-6 inline-block", s.color)}>
                   <s.icon size={24} strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">{s.label}</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{s.value}</h3>
                <p className={cn("text-[10px] font-bold mt-1", s.color)}>{s.sub}</p>
             </div>
           ))}
        </div>
      </div>
    );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('categorias');
  const [reportData, setReportData] = useState(null);
  const [reportMetadata, setReportMetadata] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState("Informe Mensual");
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const fileInputRef = useRef(null);

  const reportTypes = [
    "Informe de Costos",
    "Informe de Provisión de Finiquitos",
    "Informe Mensual",
    "Flujo de Obra",
    "Informe de Proyección de Ingreso",
    "Control de Estados de Pagos",
    "Estatus de Facturación",
    "Informe Fotográfico",
    "Matriz de Proyección"
  ];

  // Consolidate Checklist with actual History
  const consolidateChecklists = (reps, projs) => {
    return projs.map(p => ({
      ...p,
      reports: p.reports.map(r => {
        const foundPeriods = reps
          .filter(h => h.projectId === p.id && h.reportType === r.name)
          .map(h => h.period);
        return { ...r, uploadedPeriods: Array.from(new Set(foundPeriods)) };
      })
    }));
  };

  // Sync with Server (helper)
  const syncWithServer = async (reps, projs) => {
    try {
      await axios.post(`${API_URL}/save`, { reports: reps, projects: projs });
    } catch (err) {
      // console.warn("Server offline, sync not possible");
    }
  };

  // Load from Server then LocalStorage
  useEffect(() => {
    const loadData = async () => {
      let reports = [];
      let projs = [];
      
      try {
        const resp = await axios.get(`${API_URL}/data`);
        reports = resp.data.reports || [];
        projs = resp.data.projects || [];
      } catch (err) {
        const storedReports = localStorage.getItem('cost_pro_reports');
        const storedProjects = localStorage.getItem('cost_pro_projects');
        if (storedReports) reports = JSON.parse(storedReports);
        if (storedProjects) projs = JSON.parse(storedProjects);
      }

      const syncedProjects = consolidateChecklists(reports, projs);
      setSavedReports(reports);
      setProjects(syncedProjects);
      
      const storedActiveId = localStorage.getItem('cost_pro_active_project');
      if (storedActiveId) setActiveProjectId(storedActiveId);
    };
    
    loadData();
  }, []);

  // Sync to Server and LocalStorage
  useEffect(() => {
    localStorage.setItem('cost_pro_reports', JSON.stringify(savedReports));
    const synced = consolidateChecklists(savedReports, projects);
    localStorage.setItem('cost_pro_projects', JSON.stringify(synced));
    syncWithServer(savedReports, synced);
  }, [savedReports]);

  useEffect(() => {
    localStorage.setItem('cost_pro_projects', JSON.stringify(projects));
    syncWithServer(savedReports, projects);
  }, [projects]);

  useEffect(() => {
    if (activeProjectId) localStorage.setItem('cost_pro_active_project', activeProjectId);
  }, [activeProjectId]);

  // Handle Clean Analysis View on Sidebar Entry
  useEffect(() => {
    const handleReset = () => {
      setReportData(null);
      setReportMetadata(null);
      setIsHistoryView(false);
    };
    window.addEventListener('resetAnalysisView', handleReset);
    return () => window.removeEventListener('resetAnalysisView', handleReset);
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const addProject = (proj) => setProjects(prev => [...prev, proj]);
  const deleteProject = (id) => {
    if (confirm("¿Eliminar obra? Se perderá el seguimiento del checklist.")) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProjectId === id) setActiveProjectId(null);
    }
  };
  const selectProject = (id) => {
    setActiveProjectId(id);
    setReportData(null); 
    setIsHistoryView(false);
    alert(`Obra vinculada con éxito. Ahora puedes procesar nuevos informes.`);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setIsHistoryView(false);
    try {
      const parsedData = await parseCostReport(file);
      setReportData(parsedData);
      setReportMetadata({
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        project: activeProject ? activeProject.name : 'Obra Desconocida',
        projectId: activeProjectId
      });
      setActiveTab('analisis');
    } catch (err) {
      alert("Error al procesar el Excel.");
    } finally {
      setIsUploading(false);
    }
  };

  const saveToHistory = () => {
    if (!reportData) return;
    
    const newReport = {
      id: `${activeProject?.name || 'obra'}-${selectedPeriod}-${Date.now()}`,
      period: selectedPeriod,
      reportType: selectedReportType,
      data: reportData.sheets['Análisis por Categorías'],
      productionData: reportData.sheets['Matriz de Producción'] || [],
      fileName: reportMetadata.fileName,
      saveDate: new Date().toISOString(),
      metadata: { ...reportMetadata, reportType: selectedReportType },
      projectId: activeProjectId || reportMetadata.projectId
    };

    setSavedReports(prev => {
      const filtered = prev.filter(r => !(r.period === selectedPeriod && r.projectId === (activeProjectId || reportMetadata.projectId) && r.reportType === selectedReportType));
      return [...filtered, newReport];
    });

    alert(`Informe ${selectedReportType} del periodo ${selectedPeriod} guardado con éxito.`);
  };

  const loadFromHistory = (report) => {
    setReportData({ 
      sheets: { 
        'Análisis por Categorías': report.data, 
        'Matriz de Producción': report.productionData || [] 
      }, 
      metadata: report.metadata 
    });
    setReportMetadata(report.metadata);
    setIsHistoryView(true);
    setActiveTab('analisis');
  };

  const deleteReport = (id) => {
    const reportToDelete = savedReports.find(r => r.id === id);
    if (!reportToDelete) return;

    if (confirm(`¿Estás seguro de eliminar el ${reportToDelete.reportType} de ${reportToDelete.period}?`)) {
      setProjects(prev => prev.map(p => {
        if (p.id === reportToDelete.projectId) {
          return {
            ...p,
            reports: p.reports.map(r => {
              if (r.name === reportToDelete.reportType) {
                return { ...r, uploadedPeriods: (r.uploadedPeriods || []).filter(date => date !== reportToDelete.period) };
              }
              return r;
            })
          };
        }
        return p;
      }));
      setSavedReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const exportJSON = () => {
    const backup = {
      reports: savedReports,
      projects: projects,
      exportDate: new Date().toISOString(),
      version: "3.3"
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EIMI_CUB_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          
          if (imported.reports && imported.projects) {
            // New format backup
            setSavedReports(imported.reports);
            setProjects(imported.projects);
            alert("Respaldo restaurado con éxito.");
          } else if (Array.isArray(imported)) {
            // Legacy format or manual reports array
             setSavedReports(prev => {
                const existingIds = new Set(prev.map(r => r.id));
                const news = imported.filter(r => !existingIds.has(r.id));
                return [...prev, ...news];
             });
             alert("Informes importados e integrados.");
          }
        } catch (err) {
          alert("El archivo de respaldo no es válido.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="app-container min-h-screen bg-[#f8fafc]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content ml-[260px] p-12 transition-all">
        {activeTab === 'dashboard' && <Dashboard />}
        
        {activeTab === 'obras' && (
           <ProjectManager 
             projects={projects} 
             onAddProject={addProject} 
             onDeleteProject={deleteProject}
             onSelectProject={selectProject}
             activeProjectId={activeProjectId}
           />
        )}

        {activeTab === 'estructuras' && <StructureManager />}
        
        {activeTab === 'configuracion' && (
          <ConfigModule 
            onExportJSON={exportJSON} 
            onImportJSON={importJSON} 
          />
        )}

        {activeTab === 'analisis' && (
          <div className="animate-fade-in pb-20">
            {reportMetadata && (
              <div className="flex items-center gap-3 mb-8 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 w-fit">
                <Building2 size={16} className="text-blue-600" />
                <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
                  OBRA: {reportMetadata.project} {reportMetadata.reportType ? `| ${reportMetadata.reportType}` : ''}
                </span>
              </div>
            )}
            
            {(reportData && (reportData.sheets['Análisis por Categorías'] || reportData.sheets['Matriz de Producción'])) ? (
              <div className="flex flex-col h-[88vh] w-full max-w-none">
                <div className="flex-1 overflow-auto rounded-[2.5rem] bg-white border shadow-sm p-4">
                    {activeSubTab === 'categorias' ? (
                        reportData.sheets['Análisis por Categorías'] ? (
                            <AnalysisByCategoryTable 
                                data={reportData.sheets['Análisis por Categorías']} 
                                onSave={saveToHistory}
                                isHistoryView={isHistoryView}
                            />
                        ) : <div className="p-20 text-center opacity-50">No hay datos de categorización.</div>
                    ) : activeSubTab === 'produccion' ? (
                        reportData.sheets['Matriz de Producción'] ? (
                            <ProductionMatrixTable 
                                data={reportData.sheets['Matriz de Producción']} 
                            />
                        ) : <div className="p-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 opacity-50 font-black uppercase text-[10px] tracking-widest text-slate-400">Esta hoja de Producción está vacía para este informe o no se encontró en el Excel.</div>
                    ) : (
                        reportData.sheets['Matriz de Producción'] ? (
                            <CostSummaryTable 
                                data={reportData.sheets['Matriz de Producción']} 
                            />
                        ) : <div className="p-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 opacity-50 font-black uppercase text-[10px] tracking-widest text-slate-400">No hay datos para generar el resumen.</div>
                    )}
                </div>

                {/* Sub Tabs (Excel Style) */}
                <div className="flex items-center gap-1 mt-4 border-t border-slate-200 pt-1 -mx-8 px-8 bg-slate-50/80 backdrop-blur-sm rounded-b-[2rem]">
                   <button 
                     onClick={() => setActiveSubTab('categorias')}
                     className={cn(
                       "px-6 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all",
                       activeSubTab === 'categorias' ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-400 hover:text-slate-600"
                     )}
                   >
                     📋 Análisis Categoría
                   </button>
                   <button 
                     onClick={() => setActiveSubTab('produccion')}
                     className={cn(
                       "px-6 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all",
                       activeSubTab === 'produccion' ? "border-amber-600 text-amber-600 bg-amber-50/50" : "border-transparent text-slate-400 hover:text-slate-600"
                     )}
                   >
                     📉 Matriz Producción
                   </button>
                   <button 
                     onClick={() => setActiveSubTab('resumen')}
                     className={cn(
                       "px-6 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all",
                       activeSubTab === 'resumen' ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" : "border-transparent text-slate-400 hover:text-slate-600"
                     )}
                   >
                     📊 Resumen Costos
                   </button>
                   <div className="ml-auto text-[9px] font-black text-slate-300 uppercase italic pr-4">Cost Pro Dashboard v3.3</div>
                </div>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-32 glass bg-white border-dashed border-2 border-blue-200">
                  <div className="w-24 h-24 bg-blue-600/5 rounded-[2.5rem] flex items-center justify-center mb-10 border border-blue-200 relative group overflow-hidden">
                    <Database size={48} className="text-blue-600 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4 font-heading uppercase tracking-tight leading-none tracking-tighter text-center">Módulo de Análisis <span className="text-blue-600">Técnico</span></h2>
                  <p className="text-slate-500 text-center mb-10 max-w-sm font-bold opacity-80 leading-snug">
                    Configura los parámetros del cierre y carga el archivo Excel para el análisis.
                  </p>
                  
                  <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
                    <div className="grid grid-cols-3 gap-4">
                       <div className="flex flex-col gap-2 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">1. Seleccionar Obra</span>
                           <div className="relative">
                             <select 
                               value={activeProjectId || ''}
                               onChange={(e) => setActiveProjectId(e.target.value)}
                               className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-black text-[11px] uppercase outline-none appearance-none cursor-pointer"
                             >
                               <option value="" disabled>SELECCIONAR OBRA...</option>
                               {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                             </select>
                             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                           </div>
                       </div>

                       <div className="flex flex-col gap-2 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">2. Tipo de Informe</span>
                           <div className="relative">
                             <select 
                               value={selectedReportType}
                               onChange={(e) => setSelectedReportType(e.target.value)}
                               className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-black text-[11px] uppercase outline-none appearance-none cursor-pointer"
                             >
                               {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                           </div>
                       </div>

                       <div className="flex flex-col gap-2 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">3. Periodo a subir</span>
                          <input 
                            type="month" 
                            value={selectedPeriod} 
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-black text-[11px] outline-none"
                          />
                       </div>
                    </div>

                    <div className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border-2 border-dashed border-blue-100 mt-4">
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls" />
                      <button 
                        disabled={isUploading || !activeProjectId}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-5 px-10 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest"
                      >
                          {!activeProjectId ? "Seleccione una Obra Primero" : (isUploading ? "Analizando Matriz..." : "4. Procesar Informe Excel")}
                          {activeProjectId && !isUploading && <Upload size={18} strokeWidth={3} />}
                      </button>
                    </div>
                  </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'historial' && (
          <HistoryModule 
            reports={savedReports} 
            projects={projects}
            onLoadReport={loadFromHistory}
            onDeleteReport={deleteReport}
            onExportJSON={exportJSON}
            onImportJSON={importJSON}
          />
        )}

        {['reporte1', 'aprobaciones'].includes(activeTab) && (
           <div className="p-32 glass bg-white border border-slate-100 rounded-[3rem] text-center">
              <h2 className="text-4xl font-black text-slate-300 uppercase tracking-tighter">Sección en Desarrollo</h2>
              <p className="text-slate-400 font-bold mt-4">Próxima implementación de matrices técnicas.</p>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
