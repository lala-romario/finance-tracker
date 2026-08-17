import { useEffect, useState } from "react";

function Theme() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])

  const toggleTheme = () => {
    if(dark){
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
    setDark(!dark)
    console.log("local storage theme:", localStorage.getItem('theme'))
  }
  
  return (
    <>
      <div className='bg-gray-900 px-1 dark:bg-gray-600 fixed top-4 right-4 rounded-full z-2'>
        <button onClick={toggleTheme} className='dark:text-white text-red-500 p-2 '>
          { dark ? "☀️" : "🌙" }
        </button>
      </div>
    </>
  )

}

export default Theme