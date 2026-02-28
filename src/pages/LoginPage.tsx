import React from 'react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-violet-500 flex items-center justify-center p-6 sm:p-10">
      <section className="w-full max-w-4xl min-h-[72vh] bg-violet-100 border-4 border-violet-700 rounded-xl shadow-lg px-6 py-8 sm:px-10 sm:py-12">
        <div className="max-w-2xl mx-auto pt-4 sm:pt-6">
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-none text-violet-800 font-serif text-center">
            Welcome to QuestLog
          </h1>
          <p className="mt-3 text-2xl sm:text-4xl text-violet-800 font-serif text-center">
            One controller, a million voices, infinite extra lives.
          </p>

          <form className="mt-8 space-y-4 sm:space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="ENTER YOUR USERNAME OR EMAIL"
              className="w-full h-11 sm:h-[64px] rounded-xl border-4 border-violet-700 bg-violet-100 px-6 text-center text-sm sm:text-xl font-semibold tracking-wide text-violet-500 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />

            <input
              type="password"
              placeholder="ENTER YOUR PASSWORD"
              className="w-full h-11 sm:h-[64px] rounded-xl border-4 border-violet-700 bg-violet-100 px-6 text-center text-sm sm:text-xl font-semibold tracking-wide text-violet-500 placeholder-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />

            <button
              type="submit"
              className="block w-full max-w-[30%] mx-auto h-10 sm:h-[56px] rounded-xl border-4 border-violet-700 bg-violet-300 text-violet-800 text-xl sm:text-3xl font-extrabold"
            >
              SIGN IN
            </button>
          </form>

          <div className="mt-5 text-center">
            <a href="#" className="text-violet-800 underline text-xs sm:text-2xl">
              I FORGOT MY PASSWORD
            </a>
          </div>

          <hr className="my-8 sm:my-10 border-2 border-violet-300" />

          <Link
            to="/create-profile"
            className="block w-full max-w-[70%] sm:max-w-[50%] mx-auto h-10 sm:h-[56px] px-4 rounded-xl border-4 border-violet-700 bg-violet-300 text-violet-800 text-base sm:text-3xl font-extrabold whitespace-nowrap text-center leading-[2rem] sm:leading-[2.8rem]"
          >
            CREATE PROFILE
          </Link>
        </div>
      </section>
    </div>
  )
}
