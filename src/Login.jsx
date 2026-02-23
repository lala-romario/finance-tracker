import './App.css';
import reactLogo from './assets/FT-logo.jpg'

function Login() {
    return (
        <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background: "linear-gradient(135deg, #0a0a0f, #12121e)",
      }}
    >
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-[#1e293b] flex flex-col md:flex-row">

        {/* LOGO SECTION */}
        <div
          className="w-full md:w-1/2 flex flex-col items-center justify-center p-10 text-center"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
          }}
        >
          <div className=" p-6 rounded-2xl ">
            <img
              src={reactLogo}
              alt="App Logo"
              className="w-40 md:w-800 rounded-xl"
            />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-black mt-6">
            Save your growth
          </h2>
        </div>

        {/* LOGIN SECTION */}
        <div className="w-full md:w-1/2 p-8 md:p-12">

          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Welcome Back
          </h2>

          <p className="text-[#94a3b8] mb-8 text-sm md:text-base">
            Sign in to continue to your dashboard
          </p>

          <form className="space-y-5">

            <div>
              <label htmlFor='email' className="block text-[#e2e8f0] mb-2 text-sm">
                Email
              </label>
              <input
              id='email'
                type="email"
                placeholder="you@example.com"
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

            <div>
              <label htmlFor='password' className="block text-[#e2e8f0] mb-2 text-sm">
                Password
              </label>
              <input
              id='password'
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl 
                           bg-[#0f0f1a] 
                           border border-[#1e293b] 
                           text-white 
                           focus:outline-none 
                           focus:ring-2 
                           focus:ring-[#6366f1] 
                           transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-white
                         transition-all duration-300
                         hover:scale-[1.02]"
              style={{
                background: "linear-gradient(90deg, #00c896, #00f5c4)",
              }}
            >
              Sign In
            </button>

          </form>

          <div className="mt-8 border-t border-[#1e293b] pt-6 text-[#475569] text-sm flex align- text-center md:text-left">
            Pas encore souscrit?{" "}
            <span className="text-[#a78bfa] cursor-pointer hover:underline">
              S'inscrire
            </span>
          </div>

        </div>

      </div>
    </div>
    );
}







export default Login