/**
 * Renders a centered confirmation page indicating routing is working and providing links to Login and Dashboard.
 *
 * @returns The page's JSX element containing a heading "✅ Routing Works!", descriptive text, and navigation links to `/login` and `/admin/dashboard`.
 */
export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">✅ Routing Works!</h1>
        <p className="text-lg mb-4">If you can see this, basic routing is working.</p>
        <div className="space-y-2">
          <a href="/login" className="block text-blue-600 hover:underline">Go to Login</a>
          <a href="/admin/dashboard" className="block text-blue-600 hover:underline">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
}