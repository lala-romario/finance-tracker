import { useState } from 'react';
import '../App.css';


function Signup() {

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const data = {
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            email: formData.get('email'),
            password: formData.get('password')
        }

        console.log(data)
    }

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
                            className="w-full bg-purple-700 text-white py-2.5 rounded-lg font-medium 
        hover:bg-purple-800 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Sign up
                        </button>

                    </form>

                </div>
            </div>
        </>
    )
}

export default Signup