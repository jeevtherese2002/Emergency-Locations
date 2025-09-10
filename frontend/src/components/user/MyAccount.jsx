import React, { useEffect, useState } from 'react';
import { User, Phone, Calendar, MapPin, Mail, Save, Upload, ArrowLeft } from 'lucide-react';
import {toast} from 'react-toastify'

const MyAccount = ({ onBack }) => {
  const baseurl = import.meta.env.VITE_BASE_URL;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    gender: '',
    dateofBirth: '',
    address: '',
    profilePicture: null
  });

  const [previewImage, setPreviewImage] = useState('/placeholder.svg');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseurl}/api/user/my-account`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setFormData({
            fullName: data.name || '',
            email: data.email || '',
            mobile: data.mobile || '',
            gender: data.gender || '',
            dateofBirth: data.dateofBirth ? data.dateofBirth.split('T')[0] : '',
            address: data.address || '',
            profilePicture: null
          });
          if (data.profilePicture) {
            setPreviewImage(`${baseurl}${data.profilePicture}`);
          }
        }
      } catch (err) {
        console.error("Failed to fetch account:", err);
      }
    };

    fetchAccount();
  }, [baseurl]);

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
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const fd = new FormData();
    fd.append("fullName", formData.fullName);
    fd.append("mobile", formData.mobile);
    fd.append("gender", formData.gender);
    fd.append("dateofBirth", formData.dateofBirth);
    fd.append("address", formData.address);
    if (formData.profilePicture) {
      fd.append("profilePic", formData.profilePicture);
    }

    try {
      const res = await fetch(`${baseurl}/api/user/my-account`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        if (data.user.profilePicture) {
          setPreviewImage(`${baseurl}${data.user.profilePicture}`);
        }
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Server error: " + err.message);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-primary-glow transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-foreground">My Account</h1>
          <p className="text-muted-foreground mt-2">Manage your personal information and preferences</p>
        </div>

        <div className="bg-card rounded-lg shadow-elegant p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
<div className="relative">
  {/* Profile preview always visible */}
  <div className="w-32 h-32 border-2 border-border rounded-full overflow-hidden bg-muted">
    <img 
      src={previewImage} 
      alt="Profile" 
      className="w-full h-full object-cover"
    />
  </div>

  {/* File input overlay only when editing */}
  {isEditing && (
    <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 p-2 rounded-full cursor-pointer">
      <Upload className="w-5 h-5 text-white" />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  )}
</div>

              <h2 className="text-xl font-semibold text-foreground mt-4">{formData.fullName}</h2>
              <p className="text-muted-foreground">{formData.email}</p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled
                    className={`w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {/* Email (Non-editable) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    name="dateofBirth"
                    value={formData.dateofBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Complete Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground resize-none ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full sm:w-auto bg-gradient-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-muted text-muted-foreground py-3 px-6 rounded-lg font-medium hover:bg-muted/80 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;