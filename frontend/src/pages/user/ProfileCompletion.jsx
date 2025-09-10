import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Calendar, MapPin, Upload, Save } from 'lucide-react';
import { toast } from 'react-toastify'

const ProfileCompletion = () => {
  const baseurl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    gender: '',
    dateofBirth: '',
    address: '',
    profilePicture: null
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchBaseDetails = async () => {
      try {
        const token = localStorage.getItem("token"); // assuming JWT stored
        const res = await fetch(`${baseurl}/api/user/base-details`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setFormData(prev => ({
            ...prev,
            fullName: data.name || ''   // 👈 auto-fill only the name
          }));
        }
      } catch (err) {
        console.error("Failed to load base details:", err);
      }
    };

    fetchBaseDetails();
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

    const token = localStorage.getItem("token"); // Assuming JWT stored here
    const formDataToSend = new FormData();
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("mobile", formData.mobile);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("dateofBirth", formData.dateofBirth);
    formDataToSend.append("address", formData.address);
    if (formData.profilePicture) {
      formDataToSend.append("profilePic", formData.profilePicture);
    }

    try {
      const res = await fetch(`${baseurl}/api/user/complete-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile completed successfully!");
        navigate("/user/dashboard");
      } else {
        toast.error(data.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-elegant p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">Please fill in your details to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 border-2 border-dashed border-border rounded-full flex items-center justify-center bg-muted overflow-hidden">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Click to upload photo</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mobile Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                placeholder="Enter your mobile number"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date of Birth *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                name="dateofBirth"
                value={formData.dateofBirth}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Complete Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground resize-none"
                placeholder="Enter your complete address"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion;