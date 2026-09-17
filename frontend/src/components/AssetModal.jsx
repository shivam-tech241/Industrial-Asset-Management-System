import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUS_OPTIONS = ['Active', 'Under Maintenance', 'Faulty', 'Retired'];

const AssetModal = ({ isOpen, onClose, onSuccess, asset = null }) => {
  const [assetTag, setAssetTag] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [status, setStatus] = useState('Active');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [cost, setCost] = useState('');
  const [vendor, setVendor] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');

  // Reference data
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(asset && asset.id);

  // Fetch reference lists whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchReferenceData = async () => {
      try {
        setLoadingRefs(true);
        const [catsRes, deptsRes, secsRes] = await Promise.all([
          api.get('/asset-categories'),
          api.get('/departments'),
          api.get('/sections'),
        ]);
        setCategories(catsRes.data);
        setDepartments(deptsRes.data);
        setAllSections(secsRes.data);
      } catch (err) {
        console.error('Failed to load asset reference data in modal', err);
      } finally {
        setLoadingRefs(false);
      }
    };

    fetchReferenceData();
  }, [isOpen]);

  // Reset or initialize form values when modal opens or asset changes
  useEffect(() => {
    if (isOpen) {
      if (asset) {
        setAssetTag(asset.asset_tag || '');
        setName(asset.name || '');
        setCategoryId(asset.category_id ? String(asset.category_id) : '');
        setDepartmentId(asset.department_id ? String(asset.department_id) : '');
        setSectionId(asset.section_id ? String(asset.section_id) : '');
        setStatus(asset.status || 'Active');
        setPurchaseDate(asset.purchase_date ? asset.purchase_date.substring(0, 10) : '');
        setCost(asset.cost !== null && asset.cost !== undefined ? String(asset.cost) : '');
        setVendor(asset.vendor || '');
        setWarrantyExpiry(asset.warranty_expiry ? asset.warranty_expiry.substring(0, 10) : '');
      } else {
        setAssetTag('');
        setName('');
        setCategoryId('');
        setDepartmentId('');
        setSectionId('');
        setStatus('Active');
        setPurchaseDate('');
        setCost('');
        setVendor('');
        setWarrantyExpiry('');
      }
      setError('');
    }
  }, [isOpen, asset]);

  if (!isOpen) return null;

  // Cascading handler: When department changes, verify if section still matches; clear if not
  const handleDepartmentChange = (e) => {
    const newDeptId = e.target.value;
    setDepartmentId(newDeptId);

    if (!newDeptId) {
      setSectionId('');
      return;
    }

    if (sectionId) {
      const currentSection = allSections.find((s) => String(s.id) === String(sectionId));
      if (!currentSection || String(currentSection.department_id) !== String(newDeptId)) {
        setSectionId('');
      }
    }
  };

  // Filter sections by selected department
  const filteredSections = departmentId
    ? allSections.filter((sec) => String(sec.department_id) === String(departmentId))
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTag = assetTag.trim();
    const trimmedName = name.trim();

    if (!trimmedTag) {
      setError('Asset tag is required.');
      return;
    }

    if (!trimmedName) {
      setError('Asset name is required.');
      return;
    }

    if (!categoryId) {
      setError('Please select an asset category.');
      return;
    }

    if (!departmentId) {
      setError('Please select a department.');
      return;
    }

    if (!sectionId) {
      setError('Please select a section.');
      return;
    }

    let parsedCost = null;
    if (cost !== '') {
      parsedCost = parseFloat(cost);
      if (isNaN(parsedCost) || parsedCost < 0) {
        setError('Cost must be a valid positive number.');
        return;
      }
    }

    const payload = {
      asset_tag: trimmedTag,
      name: trimmedName,
      category_id: Number(categoryId),
      department_id: Number(departmentId),
      section_id: Number(sectionId),
      status: status || 'Active',
      purchase_date: purchaseDate || null,
      cost: parsedCost,
      vendor: vendor.trim() || null,
      warranty_expiry: warrantyExpiry || null,
    };

    setError('');
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await api.put(`/assets/${asset.id}`, payload);
      } else {
        await api.post('/assets', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Asset save failed', err);
      setError(
        err.response?.data?.detail ||
        'An unexpected error occurred while saving the asset.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-2xl w-full p-6 sm:p-8 transform transition-all my-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 font-sans">
              {isEdit ? 'Edit Asset' : 'Add Asset'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit
                ? `Updating asset details for #${asset?.asset_tag}`
                : 'Enter equipment metadata, operational assignment, and purchase details.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border-l-4 border-red-500 text-sm text-red-800 flex items-start">
            <svg className="h-5 w-5 text-red-500 mr-2.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Row 1: Tag and Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="asset_tag" className="block text-sm font-medium text-gray-700 mb-1">
                Asset Tag <span className="text-red-500">*</span>
              </label>
              <input
                id="asset_tag"
                type="text"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                placeholder="e.g. AST-CNC-001"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 5-Axis Milling Machine"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 2: Category and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isSubmitting || loadingRefs}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Department and Section (Cascading Dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="department_id"
                value={departmentId}
                onChange={handleDepartmentChange}
                disabled={isSubmitting || loadingRefs}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="section_id" className="block text-sm font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                id="section_id"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={!departmentId || isSubmitting || loadingRefs}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  !departmentId
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              >
                {!departmentId ? (
                  <option value="">Select a department first</option>
                ) : filteredSections.length === 0 ? (
                  <option value="">No sections in this department</option>
                ) : (
                  <>
                    <option value="">Select Section</option>
                    {filteredSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Row 4: Purchase Date and Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                id="purchase_date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Cost ($)
              </label>
              <input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 5: Vendor and Warranty Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">
                Vendor / Supplier
              </label>
              <input
                id="vendor"
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Siemens Industry Inc."
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="warranty_expiry" className="block text-sm font-medium text-gray-700 mb-1">
                Warranty Expiry Date
              </label>
              <input
                id="warranty_expiry"
                type="date"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingRefs}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-sm transition-all duration-150 cursor-pointer inline-flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isEdit ? 'Update Asset' : 'Create Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;
