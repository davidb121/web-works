import BrowseListings from '../components/BrowseListings'

export default function Search() {
  return (
    <div className="py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Search listings</h1>
      <p className="mt-1 mb-8 text-slate-500">
        Every active ad on Web Works — filter by keyword or skill.
      </p>
      <BrowseListings showSkillFilter />
    </div>
  )
}
