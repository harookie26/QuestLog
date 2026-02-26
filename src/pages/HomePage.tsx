import React from 'react'
import { Link } from 'react-router-dom'

type CardType = 'game' | 'topic'

const CardItem = ({title, subtitle, img, type}:{title:string; subtitle:string; img?:string; type?:CardType}) => {
  const content = (
    <div className="flex items-start gap-4 p-3 bg-violet-100/80 border-b border-violet-200">
      <img src={img || 'https://via.placeholder.com/48'} alt="thumb" className="w-12 h-12 object-cover rounded-sm" />
      <div>
        <div className="font-semibold text-violet-900">{title}</div>
        <div className="text-xs text-violet-700">{subtitle}</div>
      </div>
    </div>
  )

  if (type === 'game') {
    return (
      <Link to="/threads" className="block">
        {content}
      </Link>
    )
  }

  if (type === 'topic') {
    return (
      <Link to="/threads/inside" className="block">
        {content}
      </Link>
    )
  }

  return content
}

export default function HomePage(){
  return (
    <div className="max-w-6xl mx-auto p-6">
      <section className="mb-6">
        <h2 className="text-xl font-bold text-violet-900 mb-2">Your recent interactions</h2>
        <div className="border-t border-violet-300">
          <CardItem title="Monster Hunter: World (PS4)" subtitle="Does this game still have lots of players on PS4?" type="game" />
          <CardItem title="Metaphor: ReFantazio (PS5)" subtitle="Skills that 'move all allies to the front row' confusion" type="game" />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-violet-900 mb-2">Popular Board Topics</h2>
        <div className="border-t border-violet-300">
          <CardItem title="Is this better than Persona 3/4/5 in your opinion?" subtitle="Metaphor: ReFantazio (PS5)" type="topic" />
          <CardItem title="General/character leak discussion v13" subtitle="Honkai: Star Rail (PC)" type="topic" />
          <CardItem title="Did you pull for Zibai?" subtitle="Genshin Impact (PS4)" type="topic" />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-violet-900 mb-2">Popular Questions</h2>
        <div className="flex gap-4">
          <div className="w-2/3">
            <div className="border-t border-violet-300">
              <CardItem title="Where are the Tri beam modifications?" subtitle="Fallout: New Vegas (X360)" type="topic" />
              <CardItem title="Why are my mods gone?" subtitle="Fallout 4 (PS4)" type="topic" />
              <CardItem title="Are there any negative effects?" subtitle="The Elder Scrolls V: Skyrim (X360)" type="topic" />
            </div>
          </div>
          <aside className="w-1/3">
            <div className="p-3 bg-white border border-violet-200 rounded">Sidebar / ads</div>
          </aside>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold text-violet-900 mb-2">Popular Games</h2>
        <div className="border-t border-violet-300">
          {[1,2,3,4,5].map((n)=> (
            <div key={n} className="flex items-center gap-4">
              <div className="w-8 text-center font-bold text-violet-800">{n}</div>
              <div className="flex-1">
                <CardItem title={`The Elder Scrolls V: Skyrim`} subtitle={`X360 PC PS3 XONE PS4 NS PS5 XBSX NS2`} img={`https://via.placeholder.com/48?text=${n}`} type="game" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm"><a href="#" className="text-violet-800 hover:underline">More Games &gt;&gt;</a></div>
      </section>
    </div>
  )
}
