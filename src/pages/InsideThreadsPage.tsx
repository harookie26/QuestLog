import React from 'react'

const posts = [
  { user: 'USER123', time: '6 days ago', text: "Did you pull for her? I was originally going to pull for her but I ended up not liking her selfish playstyle." },
  { user: 'AquaRuby', time: '6 days ago', text: "Varka is a more interesting unit to me. She's nice if you want an easy to use Lunar DPS after getting Columbina, but I didn't find the need." },
  { user: 'onoturtle', time: '6 days ago', text: "No. I haven't played Lantern Rite so I can't comment on her character/story, but I like her design and her demo gameplay seemed OK." },
  { user: 'Lonely_Dolphin', time: '6 days ago', text: "Nah, did 40 pulls for Illuga/Aino cons and to see if I get lucky early 50/50 win, but no dice." },
]

export default function InsideThreadsPage(){
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-4">
        <div className="flex items-start gap-4">
          <img src="https://via.placeholder.com/80" alt="thumb" className="w-20 h-20 object-cover rounded-sm" />
          <div>
            <h1 className="text-3xl font-extrabold text-violet-900">Did you pull for Zibai?</h1>
            <div className="text-sm text-violet-700">Genshin Impact <span className="text-violet-500">PlayStation 4</span></div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-violet-600 text-white text-sm rounded">Track Thread</button>
          <button className="px-3 py-1 bg-violet-600 text-white text-sm rounded">Favorite</button>
          <button className="px-3 py-1 bg-violet-600 text-white text-sm rounded">Notify Me</button>
          <button className="px-3 py-1 bg-violet-600 text-white text-sm rounded">Post New Message</button>
        </div>
      </header>

      <section className="space-y-2">
        {posts.map((p, i)=> (
          <article key={i} className={`p-4 rounded border border-violet-200 ${i % 2 === 0 ? 'bg-violet-50' : 'bg-violet-100'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="text-sm text-violet-700 font-medium">{p.user}</div>
                <div className="text-xs text-violet-500">{p.time}</div>
              </div>
              <div className="text-xs text-violet-600">quote</div>
            </div>
            <div className="mt-3 text-violet-800">{p.text}</div>
          </article>
        ))}
      </section>

      <section className="mt-6">
        <div className="border border-violet-300 rounded bg-white">
          <div className="p-2 border-b border-violet-200 text-sm text-violet-600">B I U • • •</div>
          <textarea className="w-full h-36 p-3 text-sm" placeholder="Write your reply..." />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-violet-600">Page <select className="ml-1 border rounded px-1 py-0.5"><option>1</option></select> of 12</div>
          <button className="px-4 py-2 bg-violet-700 text-white rounded">Post New Message</button>
        </div>
      </section>
    </div>
  )
}
