import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const AdminMyAccount = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Admin',
    profilePicture: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState(formData);
  const baseurl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseurl}/api/admin/my-account`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch account details');
        const result = await res.json();
        const admin = result.data;

        setFormData({
          name: admin.name || '',
          email: admin.email || '',
          phone: admin.phone || '+91 1234567890',
          role: admin.role || 'Admin',
          profilePicture: admin.profilePicture || null
        });
        setOriginalData(admin);
      } catch (error) {
        console.error('Error fetching account data:', error);
      }
    };

    fetchAccountData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profilePicture: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setOriginalData(formData);
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${baseurl}/api/admin/my-account/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          profilePicture: formData.profilePicture,
        })
      });

      if (!res.ok) throw new Error('Failed to update account details');
      const updatedResult = await res.json();
      const updatedAdmin = updatedResult.data;

      setFormData(updatedAdmin);
      setOriginalData(updatedAdmin);
      setIsEditing(false);
      toast.success('Account updated successfully!');
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account.');
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setFormData(originalData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Account</h1>
        <p className="text-muted-foreground mt-2">Manage your admin account information and preferences</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {formData.profilePicture ? (
                <img
                  src={formData.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center border-4 border-border">
                  <span className="text-primary-foreground text-2xl font-bold">
                    {formData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              {/* {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )} */}
            </div>
            {/* {isEditing && (
              <p className="text-sm text-muted-foreground">Click the + icon to change your profile picture</p>
            )} */}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              ) : (
                <p className="px-3 py-2 bg-muted rounded-lg text-foreground">{formData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <p className="px-3 py-2 bg-muted rounded-lg text-muted-foreground">
                {formData.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              ) : (
                <p className="px-3 py-2 bg-muted rounded-lg text-foreground">{formData.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role
              </label>
              <p className="px-3 py-2 bg-muted rounded-lg text-muted-foreground">
                {formData.role} (Non-editable)
              </p>
            </div>


          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-lg hover:bg-muted/80 transition-colors font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEdit}
                className="flex-1 sm:flex-initial bg-primary text-primary-foreground py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminMyAccount;