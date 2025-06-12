import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 p-8">
      <h1 className="text-4xl font-bold mb-4">404 – Page not found</h1>
      <p className="text-lg mb-8 text-center max-w-md">
        Oops&nbsp;! La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-black text-white hover:bg-gray-900 transition-colors"
      >
        Revenir à l'accueil
      </Link>
    </div>
  )
} 