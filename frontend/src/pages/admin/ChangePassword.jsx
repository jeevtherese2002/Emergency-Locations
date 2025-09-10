import { useState } from 'react';
import { Eye, EyeOff, Lock, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const { logout } = useAuth();
  const backendUrl = import.meta.env.VITE_BASE_URL;
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRequirements = [
    { text: 'At least 8 characters long', met: formData.newPassword.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.newPassword) },
    { text: 'Contains number', met: /\d/.test(formData.newPassword) },
    { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!passwordRequirements.every(req => req.met)) {
      newErrors.newPassword = 'Password does not meet all requirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const token = localStorage.getItem('token');

  setIsSubmitting(true); // Show spinner

  await toast
    .promise(
      (async () => {
        const res = await fetch(`${backendUrl}/api/admin/change-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Something went wrong');
        }

        logout(); // logout on success
      })(),
      {
        loading: 'Updating password...',
        success: 'Password changed! Please log in again.',
        error: 'Something went wrong' // fallback (optional)
      }
    )
    .catch((err) => {
      // ✅ Show toast with actual backend message
      toast.error(err.message || 'Password update failed');
    });

  setIsSubmitting(false);
};





  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Change Password</h1>
        <p className="text-muted-foreground">
          Update your password to keep your account secure
        </p>
      </div>

      {/* Security Tips */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-primary mt-1" />
          <div>
            <h3 className="font-medium text-foreground mb-2">Security Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use a unique password that you don't use for other accounts</li>
              <li>• Make it at least 8 characters long with a mix of letters, numbers, and symbols</li>
              <li>• Don't share your password with anyone</li>
              <li>• Change your password regularly for better security</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.currentPassword ? 'border-destructive' : 'border-input'
                  }`}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-destructive text-sm mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.newPassword ? 'border-destructive' : 'border-input'
                  }`}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-destructive text-sm mt-1">{errors.newPassword}</p>
            )}

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-foreground">Password Requirements:</p>
                {passwordRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle
                      className={`w-4 h-4 ${requirement.met ? 'text-green-500' : 'text-muted-foreground'
                        }`}
                    />
                    <span className={`text-sm ${requirement.met ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
                      }`}>
                      {requirement.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.confirmPassword ? 'border-destructive' : 'border-input'
                  }`}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {errors.submit && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-destructive text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                <span>Updating Password...</span>
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;