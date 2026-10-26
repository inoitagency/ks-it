export function ResourceError({ retry }: { retry: () => void }) {
  return <div role="status" className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 my-6 text-sm text-zinc-600">
    <p>Information is temporarily unavailable. Please try again or contact the school.</p>
    <button onClick={retry} className="mt-3 font-semibold text-accent underline underline-offset-4">Try again</button>
    <a href="https://ksschool.org.in/" target="_blank" rel="noreferrer" className="ml-5 underline underline-offset-4">Official school website</a>
  </div>;
}
