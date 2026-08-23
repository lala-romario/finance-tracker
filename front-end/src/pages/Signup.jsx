import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';
import '../App.css';

function Signup() {

    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');
        setLoading(true);

        const formData = new FormData(e.target);

        const data = {
            firstName: formData.get('firstname'),
            lastName: formData.get('lastname'),
            email: formData.get('email'),
            password: formData.get('password'),
        };

        try {
            const response = await api.post('/signup', data);

            console.log(response.data);

            navigate('/login', {
                state: {
                    message: 'Account created successfully. You can now sign in.'
                }
            });

            setSuccess('Account created successfully!');
            e.target.reset();

        } catch (error) {
            console.error(error);

            if (error.response) {
                setError(error.response.data.message || 'Registration failed.');
            } else {
                setError('Unable to connect to the server.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 transition-colors duration-500">

                <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-xl transition-all duration-300">
                    <div className="text-center mb-4">
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
                            Finance Tracker
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Manage your money smarter
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm">
                            {success}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* FIRSTNAME */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                First name
                            </label>
                            <input
                                type="text"
                                name="firstname"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-transparent text-gray-800 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-all duration-300"
                            />
                        </div>

                        {/* LASTNAME */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Last name
                            </label>
                            <input
                                type="text"
                                name="lastname"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-transparent text-gray-800 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-all duration-300"
                            />
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-transparent text-gray-800 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-all duration-300"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-transparent text-gray-800 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            transition-all duration-300"
                            />
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-700 text-white py-2.5 rounded-lg font-medium 
    hover:bg-purple-800 active:scale-95 transition-all duration-200 
    shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </button>

                    </form>

                </div>
            </div>
        </>
    )
}

export default Signup