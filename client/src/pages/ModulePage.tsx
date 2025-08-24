import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, Module } from '../services/api';
import { toast } from 'react-hot-toast';

const ModulePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModule = async () => {
      if (!id) return;
      try {
        const res = await apiClient.getModule(id);
        setModuleData(res.data as Module);
      } catch (e) {
        setError('Failed to load module');
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [id]);

  const handleStartOrComplete = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await apiClient.updateModuleProgress({
        moduleId: id,
        completedSections: [],
        timeSpent: 0,
        completed: true,
      });
      toast.success('Module marked as completed');
      navigate('/modules');
    } catch (e) {
      toast.error('Failed to update progress');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">Loading module...</div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className="p-8 text-center text-red-600">{error || 'Module not found'}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{moduleData.title}</h1>
          <p className="mt-2 text-gray-600">{moduleData.description}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleStartOrComplete}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Start Module'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Contents</h2>
        <div className="space-y-4">
          {(moduleData.content || []).map((item: any) => (
            <div key={item._id || item.id} className="border rounded p-4">
              <div className="text-sm text-gray-500 mb-1 capitalize">{item.type}</div>
              <div className="font-medium">{item.title}</div>
              <div className="text-gray-700 mt-1 text-sm">{typeof item.content === 'string' ? item.content : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModulePage;


