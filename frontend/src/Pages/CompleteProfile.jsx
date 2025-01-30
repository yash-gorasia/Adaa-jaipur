import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa'; // Importing a plus icon

const CompleteProfile = () => {

    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
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
    const [addresses, setAddresses] = useState([]); // Store additional addresses
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddAddress = () => {
        const { street, city, state, postalCode, country } = formData;
        if (!street || !city || !state || !postalCode || !country) {
            showNotification('All address fields are required', 'error');
            return;
        }

        const newAddress = { street, city, state, postalCode, country };
        setAddresses((prevAddresses) => [...prevAddresses, newAddress]);
        setFormData({ ...formData, street: '', city: '', state: '', postalCode: '', country: '' });
    };

    const handleRemoveAddress = (index) => {
        setAddresses((prevAddresses) => prevAddresses.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!userId) {
            showNotification('User ID not found. Please try again.', 'error');
            setIsLoading(false);
            return;
        }

        // Validate the first address
        const { street, city, state, postalCode, country } = formData;
        if (!street || !city || !state || !postalCode || !country) {
            showNotification('Please fill out all address fields for the primary address.', 'error');
            setIsLoading(false);
            return;
        }

        // Combine the first address with additional addresses
        const firstAddress = { street, city, state, postalCode, country };
        const allAddresses = [firstAddress, ...addresses];

        try {
            const response = await fetch(`/api/users/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    profileCompleted: true,
                    addresses: allAddresses, // Include all addresses
                }),
            });

            if (response.ok) {
                showNotification('Profile updated successfully!', 'success');
                setTimeout(() => {
                    navigate('/home');
                }, 500);
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

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border border-neutral-100 p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-2">Profile Details</h2>
                    <p className="text-neutral-500 text-sm">Complete your profile to personalize your experience</p>
                </div>

                {notification.show && (
                    <div
                        className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg text-white transition-all duration-300 ${
                            notification.type === 'success' ? 'bg-neutral-900' : 'bg-neutral-700'
                        }`}
                    >
                        {notification.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {['age', 'gender', 'phone_number'].map((field) => (
                        <div key={field}>
                            <label className="block text-xs font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                                {field.replace('_', ' ')}
                            </label>
                            {field === 'gender' ? (
                                <select
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all duration-300"
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
                                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all duration-300"
                                    required
                                />
                            )}
                        </div>
                    ))}

                    {/* Primary Address Fields */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                            Primary Address
                        </label>
                        {['street', 'city', 'state', 'postalCode', 'country'].map((field) => (
                            <input
                                key={field}
                                type="text"
                                name={field}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={formData[field]}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all duration-300 mb-2"
                                required
                            />
                        ))}
                    </div>

                    {/* Additional Addresses */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1.5 uppercase tracking-wider">
                            Additional Addresses
                        </label>
                        {addresses.map((address, index) => (
                            <div key={index} className="bg-neutral-100 p-2 rounded-md flex justify-between items-center mb-2">
                                <span>{`${address.street}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAddress(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddAddress}
                            className="mt-2 w-full py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all duration-300 flex items-center justify-center"
                        >
                            <FaPlus className="mr-2 text-lg" /> Add Another Address
                        </button>
                    </div>

                    <div className="pt-2 space-y-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin h-5 w-5 mr-3 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Saving...
                                </div>
                            ) : (
                                'Save Profile'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/home')}
                            className="w-full py-3 border border-neutral-200 text-neutral-600 font-semibold rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all duration-300"
                        >
                            Skip For Now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;