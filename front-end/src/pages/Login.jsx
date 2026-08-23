import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import Theme from '../components/dark.mode';
import FTlogo from "../assets/FT-logo.jpg";
import api from '../api/axios';

function Login() {

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {

      const response = await api.post('/login', {
        email,
        password,
      });

      console.log(response.data);

      const token = response.data.token;

      // Stocker le JWT
      localStorage.setItem('token', token);

      // Redirection vers le dashboard
      navigate('/dashboard');

    } catch (error) {

      console.error(error);

      if (error.response) {

        setError(
          error.response.data.message || 'Invalid email or password.'
        );

      } else {

        setError('Unable to connect to the server.');

      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center 
      bg-white dark:bg-gray-900 px-4 py-10 transition-colors duration-500"
    >

      <Theme />

      <div className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border-1 border-gray-300 dark:border-gray-800 flex flex-col md:flex-row">

        {/* LOGO SECTION */}
        <div
          className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 text-center"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
          }}
        >

          <div className="p-6 rounded-2xl">

            <img
              src={FTlogo}
              alt="App Logo"
              className="w-40 md:w-800 rounded-xl"
            />

          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-black mt-6">
            Préservez votre croissance
          </h2>

        </div>


        {/* LOGIN SECTION */}
        <div className="w-full md:w-1/2 p-8 md:p-12">

          <h2 className="text-2xl md:text-4xl font-bold dark:text-white text-gray-500 mb-2">
            Welcome Back
          </h2>

          <p className="dark:text-gray-500 text-black mb-8 font-bold text-sm md:text-base">
            Connectez-vous pour accéder à votre dashboard
          </p>


          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-lg bg-green-100 text-green-700 text-sm">
              {successMessage}
            </div>
          )}


          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}


          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}
            <div>

              <label
                htmlFor="email"
                className="block text-black dark:text-[#e2e8f0] mb-2 text-sm"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl 
                           bg-[#0f0f1a] 
                           border border-[#1e293b] 
                           text-white 
                           focus:outline-none 
                           focus:ring-2 
                           focus:ring-[#00c896] 
                           transition"
              />

            </div>


            {/* PASSWORD */}
            <div>

              <label
                htmlFor="password"
                className="block text-black dark:text-[#e2e8f0] mb-2 text-sm"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl 
                           bg-[#0f0f1a] 
                           border border-[#1e293b] 
                           text-white 
                           focus:outline-none 
                           focus:ring-2 
                           focus:ring-[#00c896] 
                           transition"
              />

            </div>


            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white
                         transition-all duration-300
                         hover:scale-[1.02]
                         disabled:opacity-50
                         disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(90deg, #3c00c8, #302263)",
              }}
            >

              {loading ? 'Signing in...' : 'Sign In'}

            </button>

          </form>


          {/* SIGNUP */}
          <div className="mt-8 border-t border-[#1e293b] pt-6 text-[#475569] text-sm flex gap-2 text-center md:text-left">

            Pas encore souscrit?

            <span className="dark:text-[#a78bfa] text-[#a90bfa] cursor-pointer hover:underline hover:scale-110">

              <Link to="/signup">
                S'inscrire
              </Link>

            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;