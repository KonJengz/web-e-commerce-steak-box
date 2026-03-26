export default function MainContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-3 py-3 sm:px-4 lg:px-8 lg:py-4">
      {children}
    </div>
  );
}
