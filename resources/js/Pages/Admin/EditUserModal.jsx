import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import debounce from 'lodash/debounce';
import './EditUserModal.css';

const EditUserModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstname: user.firstname || '',
    lastname: user.lastname || '',
    email: user.email || '',
    ic_number: user.ic_number || '',
    age: user.age || '',
    born_date: user.born_date || '',
    phone: user.phone || '',
    address_line_1: user.address_line_1 || '',
    address_line_2: user.address_line_2 || '',
    city: user.city || '',
    postal_code: user.postal_code || '',
    role: user.role || 'user',
    password: '',
    profile_picture: null,
  });
  
  const [errors, setErrors] = useState({});
  const [profilePreview, setProfilePreview] = useState(user.profile_picture_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form data when user prop changes
  useEffect(() => {
    setFormData({
      ...user,
      password: '',
      profile_picture: null
    });
    setProfilePreview(user.profile_picture_url || null);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'ic_number') {
      debouncedICNumberChange(value);
    }
  };

  const debouncedICNumberChange = debounce((value) => {
    if (/^\d{12}$/.test(value)) {
      const year = value.substring(0, 2);
      const month = value.substring(2, 4);
      const day = value.substring(4, 6);
      const fullYear = parseInt(year) > 23 ? `19${year}` : `20${year}`;
      const bornDate = `${fullYear}-${month}-${day}`;
      
      setFormData(prev => ({
        ...prev,
        born_date: bornDate,
        age: calculateAge(bornDate)
      }));
    }
  }, 300);

  useEffect(() => {
    return () => {
      debouncedICNumberChange.cancel();
    };
  }, []);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profile_picture: 'Please select an image file (jpg, png, gif)'
        }));
        return;
      }

      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePreview(previewUrl);
      setFormData(prev => ({ ...prev, profile_picture: file }));
      setErrors(prev => ({ ...prev, profile_picture: '' }));

      // Cleanup the preview URL when component unmounts
      return () => URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    const formDataToSend = new FormData();

    // Only append changed values and ensure proper formatting
    Object.keys(formData).forEach(key => {
      // Skip empty password field
      if (key === 'password' && !formData[key]) return;
      
      // Skip null/undefined values
      if (formData[key] === null || formData[key] === undefined) return;
      
      // Handle file separately
      if (key === 'profile_picture' && formData[key] instanceof File) {
        formDataToSend.append('profile_picture', formData[key]);
      } else {
        // Convert non-string values to string
        formDataToSend.append(key, String(formData[key]));
      }
    });

    try {
      const response = await axios.post(`/api/users/${user.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT',
          'Accept': 'application/json',
        }
      });

      if (response.data.success) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        // Handle validation errors from Laravel
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          submit: error.response?.data?.message || 'An error occurred while updating the user'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic frontend validation
    if (formData.firstname && formData.firstname.length < 2) {
      newErrors.firstname = 'First name must be at least 2 characters';
    }

    if (formData.lastname && formData.lastname.length < 2) {
      newErrors.lastname = 'Last name must be at least 2 characters';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.ic_number && !/^\d{12}$/.test(formData.ic_number.replace(/[-]/g, ''))) {
      newErrors.ic_number = 'Please enter a valid IC number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2 className="modal-title">Edit User</h2>
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-group">
              <label>First Name</label>
              <input 
                type="text" 
                name="firstname" 
                value={formData.firstname || ''} 
                onChange={handleInputChange} 
                className="form-input"
              />
              {errors.firstname && <span className="error">{errors.firstname}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input 
                type="text" 
                name="lastname" 
                value={formData.lastname || ''} 
                onChange={handleInputChange}
                className="form-input" 
              />
              {errors.lastname && <span className="error">{errors.lastname}</span>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email || ''} 
                onChange={handleInputChange}
                className="form-input" 
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>IC Number</label>
              <input 
                type="text" 
                name="ic_number" 
                value={formData.ic_number || ''} 
                onChange={handleInputChange}
                placeholder="Format: 123456-12-1234"
                className="form-input" 
              />
              {errors.ic_number && <span className="error">{errors.ic_number}</span>}
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleInputChange} min="1" max="100" />
              {errors.age && <span className="error">{errors.age}</span>}
            </div>
            <div className="form-group">
              <label>Born Date</label>
              <input type="date" name="born_date" value={formData.born_date} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label>Address Line 1</label>
              <input type="text" name="address_line_1" value={formData.address_line_1} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Address Line 2</label>
              <input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Postal Code</label>
              <input type="text" name="postal_code" value={formData.postal_code} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter new password if changing" />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Profile Picture</label>
              <input 
                type="file" 
                onChange={handleProfilePictureChange} 
                accept="image/*" 
                className="form-input"
              />
              {profilePreview && (
                <div className="profile-preview-container">
                  <img 
                    src={profilePreview} 
                    alt="Profile Preview" 
                    className="profile-preview" 
                  />
                </div>
              )}
              {errors.profile_picture && (
                <span className="error">{errors.profile_picture}</span>
              )}
            </div>
            <button type="submit" className="save-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
