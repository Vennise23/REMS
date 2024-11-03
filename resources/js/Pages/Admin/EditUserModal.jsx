import React, { useState } from 'react';
import axios from '../../axiosConfig'; // Use configured axios instance
import './EditUserModal.css';

const EditUserModal = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');

  const handleSave = async () => {
    try {
      await axios.put(`/api/users/${user.id}`, {
        name,
        email,
        password: password ? password : undefined,  // Send password only if it's updated
      });
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
        <form onSubmit={(e) => e.preventDefault()} className="modal-form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="form-input"
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="form-input"
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              placeholder="Enter new password if changing" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="form-input"
            />
          </div>
          <div className="form-group">
            <button type="button" onClick={handleSave} className="save-button">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
