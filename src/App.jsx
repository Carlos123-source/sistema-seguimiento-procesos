import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

const ProcessTracker = () => {
  const [processes, setProcesses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    assignee: '',
    startDate: '',
    dueDate: ''
  });

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = () => {
    try {
      const stored = localStorage.getItem('processes');
      if (stored) {
        setProcesses(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error cargando procesos:', error);
      setProcesses([]);
    }
  };

  const saveToStorage = (data) => {
    try {
      localStorage.setItem('processes', JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando procesos:', error);
      alert('Error al guardar: ' + error.message);
    }
  };

  const saveProcess = () => {
    if (!formData.name.trim()) {
      alert('El nombre del proceso es requerido');
      return;
    }

    const process = {
      id: editingId || `process_${Date.now()}`,
      ...formData,
      createdAt: editingId ? processes.find(p => p.id === editingId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedProcesses;
    if (editingId) {
      updatedProcesses = processes.map(p => p.id === editingId ? process : p);
    } else {
      updatedProcesses = [...processes, process];
    }

    setProcesses(updatedProcesses);
    saveToStorage(updatedProcesses);
    resetForm();
  };

  const deleteProcess = (id) => {
    if (confirm('¿Estás seguro de eliminar este proceso?')) {
      const updatedProcesses = processes.filter(p => p.id !== id);
      setProcesses(updatedProcesses);
      saveToStorage(updatedProcesses);
    }
  };

  const editProcess = (process) => {
    setFormData({
      name: process.name,
      description: process.description,
      status: process.status,
      priority: process.priority,
      assignee: process.assignee,
      startDate: process.startDate,
      dueDate: process.dueDate
    });
    setEditingId(process.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      assignee: '',
      startDate: '',
      dueDate: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'blocked': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completado',
      blocked: 'Bloqueado'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };
    const labels = { low: 'Baja', medium: 'Media', high: 'Alta' };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority]}`}>
      {labels[priority]}
    </span>;
  };

  const filteredProcesses = processes
    .filter(p => filterStatus === 'all' || p.status === filterStatus)
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    total: processes.length,
    pending: processes.filter(p => p.status === 'pending').length,
    inProgress: processes.filter(p => p.status === 'in_progress').length,
    completed: processes.filter(p => p.status === 'completed').length,
    blocked: processes.filter(p => p.status === 'blocked').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Seguimiento de Procesos</h1>
          <p className="text-gray-600">Gestiona y monitorea tus procesos de manera eficiente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pendientes</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-800">{stats.inProgress}</div>
            <div className="text-sm text-blue-700">En Progreso</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-800">{stats.completed}</div>
            <div className="text-sm text-green-700">Completados</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-800">{stats.blocked}</div>
            <div className="text-sm text-red-700">Bloqueados</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar procesos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completado</option>
                <option value="blocked">Bloqueado</option>
              </select>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nuevo Proceso
              </button>
            </div>
          </div>

          {showForm && (
            <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                {editingId ? 'Editar Proceso' : 'Nuevo Proceso'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.assignee}
                    onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completado</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={saveProcess}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filteredProcesses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No hay procesos registrados</p>
              </div>
            ) : (
              filteredProcesses.map((process) => (
                <div key={process.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(process.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{process.name}</h3>
                          {getStatusBadge(process.status)}
                          {getPriorityBadge(process.priority)}
                        </div>
                        {process.description && (
                          <p className="text-gray-600 text-sm mb-2">{process.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          {process.assignee && (
                            <span>👤 {process.assignee}</span>
                          )}
                          {process.startDate && (
                            <span>📅 Inicio: {new Date(process.startDate).toLocaleDateString('es-MX')}</span>
                          )}
                          {process.dueDate && (
                            <span>⏰ Vence: {new Date(process.dueDate).toLocaleDateString('es-MX')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editProcess(process)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProcess(process.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessTracker;