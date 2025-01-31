import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa'; // Plus icon for adding addresses

const CompleteProfile = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage

    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        phone_number: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    });

    const [addresses, setAddresses] = useState([]); // Stores additional addresses
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Handle input changes for form fields
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Adds a new address
    const handleAddAddress = () => {
        const { street, city, state, postalCode, country } = formData;
        if (!street || !city || !state || !postalCode || !country) {
            showNotification('All address fields are required', 'error');
            return;
        }

        const newAddress = { street, city, state, postalCode, country };
        setAddresses([...addresses, newAddress]);

        // Reset address fields
        setFormData({ ...formData, street: '', city: '', state: '', postalCode: '', country: '' });
    };

    // Removes an address from the list
    const handleRemoveAddress = (index) => {
        setAddresses((prevAddresses) => prevAddresses.filter((_, i) => i !== index));
    };

    // Handles form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!userId) {
            showNotification('User ID not found. Please try again.', 'error');
            setIsLoading(false);
            return;
        }

        // Validate primary address
        const { street, city, state, postalCode, country } = formData;
        if (!street || !city || !state || !postalCode || !country) {
            showNotification('Please fill out all address fields for the primary address.', 'error');
            setIsLoading(false);
            return;
        }

        // Combine primary address with additional ones
        const firstAddress = { street, city, state, postalCode, country };
        const allAddresses = [firstAddress, ...addresses];

        try {
            const response = await fetch(`/api/users/update/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    profileCompleted: true,
                    addresses: allAddresses, // Include all addresses
                }),
            });
            console.log("response", response);
            if (response.ok) {
                showNotification('Profile updated successfully!', 'success');
                setTimeout(() => navigate('/home'), 500);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error updating profile');
            }
        } catch (err) {
            showNotification(err.message || 'Error updating profile', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Shows temporary notifications
    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-neutral-100 p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-2">Profile Details</h2>
                    <p className="text-neutral-500 text-sm">Complete your profile to personalize your experience</p>
                </div>

                {notification.show && (
                    <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {notification.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Personal Information */}
                    {['age', 'gender', 'phone_number'].map((field) => (
                        <div key={field}>
                            <label className="block text-xs font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">{field.replace('_', ' ')}</label>
                            {field === 'gender' ? (
                                <select
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg"
                                    required
                                >
                                    <option value="" disabled>Select {field}</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <input
                                    type={field === 'age' ? 'number' : 'text'}
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg"
                                    required
                                />
                            )}
                        </div>
                    ))}

                    {/* Primary Address Fields */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">Primary Address</label>
                        {['street', 'city', 'state', 'postalCode', 'country'].map((field) => (
                            <input
                                key={field}
                                type="text"
                                name={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={formData[field]}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg mb-2"
                                required
                            />
                        ))}
                    </div>

                    {/* Additional Addresses */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">Additional Addresses</label>
                        {addresses.map((address, index) => (
                            <div key={index} className="bg-neutral-100 p-2 rounded-md flex justify-between items-center mb-2">
                                <span>{`${address.street}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`}</span>
                                <button type="button" onClick={() => handleRemoveAddress(index)} className="text-red-500 hover:text-red-700">Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddAddress} className="w-full py-2 bg-neutral-900 text-white rounded-lg flex items-center justify-center">
                            <FaPlus className="mr-2" /> Add Another Address
                        </button>
                    </div>

                    {/* Submit & Skip Buttons */}
                    <div className="space-y-3">
                        <button type="submit" disabled={isLoading} className="w-full py-3 bg-neutral-900 text-white rounded-lg">{isLoading ? 'Saving...' : 'Save Profile'}</button>
                        <button type="button" onClick={() => navigate('/home')} className="w-full py-3 border border-neutral-200 text-neutral-600 rounded-lg">Skip For Now</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
