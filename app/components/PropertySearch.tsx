export default function PropertySearch({ initialQuery = '' }: { initialQuery?: string }) {
  return (
    <form className="search" action="/" method="get" style={{ position: 'relative', zIndex: 50 }}>
      <span>⌕</span>
      <input
        name="q"
        defaultValue={initialQuery}
        placeholder="3797 East Mead Dr, Chandler, AZ 85249"
        autoComplete="street-address"
        required
      />
      <button type="submit" style={{ position: 'relative', zIndex: 51, pointerEvents: 'auto' }}>
        Search
      </button>
    </form>
  );
}
