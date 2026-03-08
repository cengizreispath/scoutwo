export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white p-4">
      {children}
    </div>
  );
}
