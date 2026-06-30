import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { categoryService } from '../../services/category.service';
import Modal from '../../components/ui/Modal';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  
  const initialFormState = { categoryName: '', description: '', status: 'Active' };
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      // Graceful fallback if backend API doesn't exist yet
      if (err.response?.status === 404) {
        setCategories([]);
      } else {
        showError('Failed to fetch categories.');
      }
    } finally {
      setLoading(false);
    }
  };

  const showError = (msg) => { setError(msg); setTimeout(() => setError(null), 4000); };
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };

  const handleOpenForm = (category = null) => {
    if (category) {
      setCurrentCategory(category);
      setFormData({ ...category });
    } else {
      setCurrentCategory(null);
      setFormData(initialFormState);
    }
    setIsFormModalOpen(true);
  };

  const handleCloseForm = () => { setIsFormModalOpen(false); setCurrentCategory(null); };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (currentCategory) {
        await categoryService.updateCategory(currentCategory.id, formData);
        showSuccess('Category updated successfully.');
      } else {
        await categoryService.createCategory(formData);
        showSuccess('Category added successfully.');
      }
      handleCloseForm();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    setFormLoading(true);
    try {
      await categoryService.deleteCategory(currentCategory.id);
      showSuccess('Category deleted successfully.');
      setIsDeleteModalOpen(false);
      fetchCategories();
    } catch (err) {
      showError('Failed to delete category.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        </div>
        <button onClick={() => handleOpenForm()} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Add Category
        </button>
      </div>

      {successMsg && <div className="mb-4 p-4 bg-green-50 border-l-4 border-success text-success font-medium rounded shadow-sm">{successMsg}</div>}
      {error && <div className="mb-4 p-4 bg-red-50 border-l-4 border-danger text-danger font-medium rounded shadow-sm">{error}</div>}

      <div className="bg-white p-4 rounded-t-xl shadow-sm border-b border-gray-100">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Category Name</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium">No categories found</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{cat.categoryName}</td>
                    <td className="p-4 text-gray-600 truncate max-w-xs">{cat.description}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${cat.status === 'Active' ? 'bg-success text-white' : 'bg-gray-300 text-gray-800'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleOpenForm(cat)} className="p-2 text-primary hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { setCurrentCategory(cat); setIsDeleteModalOpen(true); }} className="p-2 text-danger hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isFormModalOpen} onClose={handleCloseForm} title={currentCategory ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input type="text" required value={formData.categoryName} onChange={(e) => setFormData({...formData, categoryName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"></textarea>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={handleCloseForm} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
            <button type="submit" disabled={formLoading} className="px-4 py-2 bg-primary text-white rounded-lg font-medium flex items-center">
              {formLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {currentCategory ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="text-center">
          <Trash2 className="w-12 h-12 text-danger mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Category?</h3>
          <div className="flex justify-center space-x-3 mt-6">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
            <button onClick={confirmDelete} disabled={formLoading} className="px-6 py-2 bg-danger text-white rounded-lg font-medium flex items-center">
              {formLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
