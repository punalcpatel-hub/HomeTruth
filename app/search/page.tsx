import { redirect } from 'next/navigation';

export default async function SearchRedirect({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim() : '';

  redirect(q ? `/find-home?q=${encodeURIComponent(q)}` : '/find-home');
}
