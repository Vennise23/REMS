import React, { useState } from 'react';
import axios from '../../axiosConfig';
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
  const [profilePreview, setProfilePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    
    // Handle specific cases for validation
    if (name === 'ic_number') {
      // Logic to autofill age and born date if IC number is used
      if (/^\d{6}-\d{2}-\d{4}$/.test(value)) {
        const year = parseInt(value.slice(0, 2)) < 50 ? '20' : '19';
        const birthYear = `${year}${value.slice(0, 2)}`;
        const birthMonth = value.slice(2, 4);
        const birthDay = value.slice(4, 6);
        setFormData({
          ...formData,
          born_date: `${birthYear}-${birthMonth}-${birthDay}`,
          age: new Date().getFullYear() - parseInt(birthYear),
          ic_number: value,
        });
      }
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setErrors({ ...errors, profile_picture: 'Profile picture must be an image file (jpg, jpeg, png).' });
      return;
    }
    setFormData({ ...formData, profile_picture: file });
    setProfilePreview(file ? URL.createObjectURL(file) : null);
    setErrors({ ...errors, profile_picture: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstname) newErrors.firstname = 'First name is required.';
    if (formData.lastname === formData.firstname) newErrors.lastname = 'Last name cannot be the same as first name.';
    if (!formData.lastname) newErrors.lastname = 'Last name is required.';
    if (!formData.email.includes('@') || !formData.email.endsWith('.com')) newErrors.email = 'Email must be valid with @ and .com';
    if (!formData.role) newErrors.role = 'Role is required.';
    if (!/^\d{6}-\d{2}-\d{4}$/.test(formData.ic_number) && !formData.age && !formData.born_date) {
      newErrors.ic_number = 'IC number format is invalid, or provide age and birth date if using passport.';
    }
    if (formData.age && (formData.age < 1 || formData.age > 100)) newErrors.age = 'Age must be between 1 and 100.';
    if (formData.phone && !/^\d+$/.test(formData.phone)) newErrors.phone = 'Phone must contain only numbers.';
    if (formData.password && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const submissionData = new FormData();
    Object.keys(formData).forEach((key) => {
      submissionData.append(key, formData[key]);
    });

    try {
      await axios.put(`/api/users/${user.id}`, submissionData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2 className="modal-title">Edit User</h2>
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstname" value={formData.firstname} onChange={handleInputChange} />
            {errors.firstname && <span className="error">{errors.firstname}</span>}
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastname" value={formData.lastname} onChange={handleInputChange} />
            {errors.lastname && <span className="error">{errors.lastname}</span>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>IC Number</label>
            <input type="text" name="ic_number" value={formData.ic_number} onChange={handleInputChange} placeholder="Format: 123456-12-1234" />
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
            <input type="file" onChange={handleProfilePictureChange} accept="image/*" />
            {profilePreview && <img src={profilePreview} alt="Profile Preview" className="profile-preview" />}
            {errors.profile_picture && <span className="error">{errors.profile_picture}</span>}
          </div>
          <button type="submit" className="save-button">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
